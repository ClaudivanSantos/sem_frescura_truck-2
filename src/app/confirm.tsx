import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  StyleSheet,
} from "react-native";
import Header from "../components/header";
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RadioGroup from "react-native-radio-buttons-group";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Input } from "../components/Input";
import Divider from "../components/Divider";
import { Dropdown } from "react-native-element-dropdown";
import supabase from "../utils/supabase";
import * as Print from "expo-print";

interface IProductProps {
  id: number;
  nome: string;
  preco: number;
  quantity: number;
}

type Address = {
  id: number;
  rua: string;
  numero: string;
  bairro: string;
  referencia: string;
};

type Product = {
  id: number;
  nome: string;
  quantity: number;
};

type OrderDetails = {
  orderId: string;
  clientName: string;
  tableOrCommand: string;
  payment: string;
  address?: Address;
  products: Product[];
};

export default function Confirm() {
  const [products, setProducts] = useState<IProductProps[]>([]);
  const [selectedId, setSelectedId] = useState("1");
  const [payment, setVPayment] = useState(null);
  const { total } = useLocalSearchParams();
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [reference, setReference] = useState("");
  const [tableOrCommand, setTableOrCommand] = useState("");
  const [freight, setFreight] = useState("");
  const [clientName, setClientName] = useState("");
  const [obs, setObs] = useState("");
  const router = useRouter();

  const getProducts = async () => {
    try {
      const value = await AsyncStorage.getItem("cart");
      if (value) {
        const parsedCart = JSON.parse(value);
        setProducts(parsedCart);
      }
    } catch (error) {
      console.error("Erro ao recuperar produtos do carrinho:", error);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  // Função chamada quando o tipo de entrega/retirada é alterado
  const handleRadioChange = (value: string) => {
    setSelectedId(value);
    if (value === "1") {
      // Se for retirada, limpa os campos de endereço
      setStreet("");
      setNumber("");
      setNeighborhood("");
      setReference("");
      setFreight("");
    }
  };

  // Validação e envio do pedido
  const sendOrder = async () => {
    // Valida os campos de mesa/comanda e forma de pagamento
    if (!tableOrCommand || !payment) {
      Alert.alert(
        "Erro",
        "Por favor, preencha os campos de mesa/comanda e forma de pagamento."
      );
      return;
    }

    let addressId = null;
    let addressDetails = null;

    // Se a opção de entrega for selecionada (id "2"), valida os campos de endereço e frete
    if (selectedId === "2") {
      if (!street || !number || !neighborhood || !freight) {
        Alert.alert(
          "Erro",
          "Por favor, preencha todos os campos de endereço e o valor do frete."
        );
        return;
      }

      try {
        // Insere o endereço no Supabase e obtém o ID retornado
        const { data: addressData, error: addressError } = await supabase
          .from("enderecos") // Nome da tabela de endereços
          .insert([
            {
              rua: street,
              numero: number,
              bairro: neighborhood,
              referencia: reference,
            },
          ])
          .select();

        if (addressError) {
          Alert.alert("Erro", "Erro ao registrar o endereço.");
          console.error("Erro ao inserir endereço:", addressError);
          return;
        }

        // Pega o ID do endereço inserido
        addressId = addressData[0]?.id;
        addressDetails = addressData[0];
      } catch (error) {
        console.error("Erro ao inserir endereço:", error);
        Alert.alert("Erro", "Erro ao registrar o endereço.");
        return;
      }
    }

    // Calcula o total com frete (se for entrega)
    const totalWithFreight =
      selectedId === "2" ? Number(total) + Number(freight) : Number(total);

    try {
      const data = new Date();

      // Subtrai 3 horas
      data.setHours(data.getHours() - 3);

      // Exibe a data ajustada
      console.log(data);
      // Insere o pedido no Supabase
      const adm = await AsyncStorage.getItem("adm");
      let id = await AsyncStorage.getItem('id_aparelho');
      const { data: orderData, error: orderError } = await supabase
        .from("pedidos") // Nome da tabela de pedidos
        .insert([
          {
            data: data, // Data atual no formato ISO
            comanda_mesa: tableOrCommand, // Mesa ou comanda
            forma_pagamento: payment, // Forma de pagamento
            status: "pendente_fazer", // Status inicial do pedido
            id_endereco: addressId, // ID do endereço ou null
            total: totalWithFreight, // Valor total com ou sem frete
            nome_cliente: clientName,
            obs: obs,
            id_aparelho: !adm ? id : null,
          },
        ])
        .select();

      if (orderError) {
        Alert.alert("Erro", "Erro ao registrar o pedido.");
        console.error("Erro ao inserir pedido:", orderError);
        return;
      }

      // Pega o ID do pedido inserido
      const orderId = orderData[0]?.id;

      // Prepara os dados dos itens para inserção
      const itemsInsert = products.map((product) => ({
        pedido_id: orderId,
        produto_id: product.id,
        quantidade: product.quantity,
      }));

      // Insere os itens do pedido na tabela 'itens_pedido'
      const { error: itemsError } = await supabase
        .from("itenspedido") // Nome da tabela de itens do pedido
        .insert(itemsInsert);

      if (itemsError) {
        Alert.alert("Erro", "Erro ao registrar os itens do pedido.");
        console.error("Erro ao inserir itens do pedido:", itemsError);
        return;
      }

      // Sucesso ao registrar o pedido e os itens
      Alert.alert("Sucesso", "Pedido enviado com sucesso!");
      console.log("Pedido inserido:", orderData);
      console.log("Itens do pedido inseridos:", itemsInsert);
      await AsyncStorage.removeItem("cart");
      router.push({
        pathname: `/`,
      });

      if (adm !== null) {
        await printHTML({
          orderId,
          clientName,
          tableOrCommand,
          payment,
          address: addressDetails,
          products,
          totalWithFreight,
        });
      }
    } catch (error) {
      console.error("Erro ao inserir pedido:", error);
      Alert.alert("Erro", "Erro ao registrar o pedido.");
    }
  };

  const printHTML = async (orderDetails: OrderDetails) => {
    const {
      clientName,
      tableOrCommand,
      payment,
      address,
      products,
      orderId,
      totalWithFreight,
    } = orderDetails;

    try {
      const productRows = products
        .map(
          (product) => `
          <tr>
            <td style="text-align: left;">${product.nome}</td>
            <td style="text-align: right;">${product.quantity}</td>
          </tr>
        `
        )
        .join("");

      const addressHTML = address
        ? `<p><strong>Endereço:</strong> ${address.rua}, ${address.numero} - ${address.bairro}<br>Referência: ${address.referencia}</p>`
        : "<p><strong>Endereço:</strong> N/A</p>";

      await Print.printAsync({
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 0; width: 100%; max-width: 58mm;">
              <div style="padding: 5px;">
                <h2 style="font-size: 14px; margin: 0; text-align: center;">Sem Frescura Truck</h2>
                <h3 style="font-size: 12px; margin: 5px 0;">Pedido ${orderId}</h3>
                <p style="margin: 2px 0;"><strong>Cliente:</strong> ${clientName}</p>
                <p style="margin: 2px 0;"><strong>Comanda/Mesa:</strong> ${tableOrCommand}</p>
                <p style="margin: 2px 0;"><strong>Obs:</strong> ${obs}</p>
                <p style="margin: 2px 0;"><strong>Pagamento:</strong> ${payment}</p>
                
                ${addressHTML}
                <h3 style="font-size: 12px; margin: 10px 0 5px 0;">Itens do Pedido</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <th style="border-bottom: 1px solid #000; text-align: left;">Produto</th>
                    <th style="border-bottom: 1px solid #000; text-align: right;">Qtd</th>
                  </tr>
                  ${productRows}
                </table>
                <h2 style="margin: 2px 0;"><strong>Total:</strong> ${`R$ ${totalWithFreight.toFixed(
                  2
                )}`}</h2>
                <p style="margin-top: 10px; text-align: center; font-size: 12px;">Volte Sempre!</p>
                <p style="margin: 2px 0;">Desenvolvido por:</p>
                <p style="margin: 2px 0;">claudivan.dev.br</p>
              </div>
            </body>
          </html>
        `,
        isLandscape: false,
        jobName: "Pedido",
      });
    } catch (error) {
      console.error("Erro ao imprimir:", error);
    }
  };

  const radioButtons = useMemo(
    () => [
      {
        id: "1",
        label: "Retirada",
        value: "Retirada",
      },
      {
        id: "2",
        label: "Entrega",
        value: "Entrega",
      },
    ],
    []
  );

  const paymentOptions = [
    { label: "Dinheiro", value: "Dinheiro" },
    { label: "PIX", value: "PIX" },
    { label: "Crédito", value: "Crédito" },
    { label: "Débito", value: "Débito" },
  ];

  const calculateTotalWithFreight = () => {
    const parsedFreight = parseFloat(freight.replace(",", "."));
    const totalValue = Number(total);
    return selectedId === "2" && freight
      ? totalValue + parsedFreight
      : totalValue;
  };

  return (
    <View className="flex-1">
      <Header title="Confirmação" backIcon={true} />
      <ScrollView>
        <View className="p-4">
          <View className="items-center">
            <Text className="text-1xl font-semibold">Entrega ou retirada</Text>
            <RadioGroup
              labelStyle={{ fontSize: 16 }}
              layout="row"
              radioButtons={radioButtons}
              onPress={(value) => handleRadioChange(value as any)}
              selectedId={selectedId}
            />
          </View>
          {selectedId === "2" && (
            <View>
              <Input
                label="Digite o nome da rua"
                value={street}
                onChangeText={setStreet}
              />
              <Input
                label="Digite o número do endereço"
                value={number}
                onChangeText={setNumber}
              />
              <Input
                label="Digite o bairro"
                value={neighborhood}
                onChangeText={setNeighborhood}
              />
              <Input
                label="Digite o ponto de referência"
                value={reference}
                onChangeText={setReference}
              />
              <Input
                label="Valor do frete"
                value={freight}
                onChangeText={(value) => setFreight(value)}
                keyboardType="numeric"
              />
              <Divider />
            </View>
          )}

          <Input
            className="mt-5"
            label="Mesa ou comanda"
            onChangeText={setTableOrCommand}
          />
          <Input
            className="mt-5"
            label="Observação do pedido"
            onChangeText={setObs}
          />
          <Input
            className="mt-5"
            label="Nome cliente"
            onChangeText={setClientName}
          />
          <Text className="font-bold mt-5 text-lg">Seu pedido</Text>
          {products?.map((item) => (
            <View key={item.id}>
              <View className="flex justify-between flex-row items-center text-center mb-3">
                <View>
                  <Text className="font-semibold text-lg">{item.nome}</Text>
                  <Text className="font-semibold">{`R$ ${item.preco.toFixed(
                    2
                  )}`}</Text>
                  <Text className="font-semibold text-lg">
                    Qtd: {item.quantity}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          {selectedId === "2" && (
            <Text className="font-semibold">Frete: {freight}</Text>
          )}
          <View className="items-center">
            <Text className="font-semibold text-lg">Total</Text>
            <Text className="font-semibold text-green-900 text-3xl">
              {`R$ ${calculateTotalWithFreight().toFixed(2)}`}
            </Text>
          </View>
          <Text className="font-bold mt-5 text-lg">Forma de pagamento</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={paymentOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Selecione a forma de pagamento"
            value={payment}
            onChange={(item) => {
              setVPayment(item.value);
            }}
          />
        </View>
        <TouchableOpacity disabled={products.length === 0} onPress={sendOrder}>
          <View className="bg-green-900 items-center flex-row justify-center rounded-lg p-1">
            <Text className="text-white text-2xl p-4">Confirmar</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
