import { ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import Header from "../components/header";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Divider from "../components/Divider";
import { useLocalSearchParams, useRouter } from "expo-router";
import supabase from "../utils/supabase";
import { Input } from "../components/Input";
import * as Print from "expo-print";

interface IProductProps {
  id: number;
  nome: string;
  preco: number;
  quantity: number;
}

interface Address {
  rua: string;
  numero: string;
  bairro: string;
  referencia: string;
}

interface OrderDetails {
  clientName: string;
  tableOrCommand: string;
  payment: string;
  address: Address | null;
  products: IProductProps[];
}

const printHTML = async (orderDetails: OrderDetails) => {
  const { clientName, tableOrCommand, payment, address, products, orderId, totalWithFreight, obs } = orderDetails;

  try {
    // Construindo as linhas dos produtos com o ajuste de largura
    const productRows = products.map(product => `
      <tr>
        <td style="text-align: left;">${product.nome}</td>
        <td style="text-align: right;">${product.quantity}</td>
      </tr>
    `).join('');

    const addressHTML = address ? `
      <p><strong>Endereço:</strong> ${address.rua}, ${address.numero} - ${address.bairro}<br>
      Referência: ${address.referencia}</p>
    ` : '<p><strong>Endereço:</strong> N/A</p>';

    // Ajustando o estilo e formatação do HTML para o papel de 58mm
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
              <h2 style="margin: 2px 0;"><strong>Total:</strong> ${`R$ ${totalWithFreight.toFixed(2)}`}</h2>
              <p style="margin-top: 10px; text-align: center; font-size: 12px;">Volte Sempre!</p>
              <p style="margin: 2px 0;">Desenvolvido por:</p>
              <p style="margin: 2px 0;">claudivan.dev.br</p>
            </div>
          </body>
        </html>
      `,
      isLandscape: false,
      jobName: 'Pedido',
    });
  } catch (error) {
    console.error('Erro ao imprimir:', error);
  }
};


export default function CartEdit() {
  const [products, setProducts] = useState<IProductProps[]>([]);
  const [orderItems, setOrderItems] = useState<IProductProps[]>([]); // Nova variável para os itens do pedido
  const [observacoes, setObservacoes] = useState<string>(""); 
  const router = useRouter();
  const { id } = useLocalSearchParams();

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

  const getOrderItems = async () => {
    try {
      const { data: items, error: itemsError } = await supabase
        .from("itenspedido")
        .select("produto_id, quantidade, produtos(nome, preco)")
        .eq("pedido_id", id)
        .order("produto_id");

      if (itemsError) {
        throw new Error("Erro ao buscar itens do pedido: " + itemsError.message);
      }

      // Atualiza o estado com os itens do pedido
      setOrderItems(items.map(item => ({
        id: item.produto_id,
        nome: item.produtos.nome,
        preco: item.produtos.preco,
        quantity: item.quantidade
      })));
    } catch (error) {
      console.error("Erro ao recuperar itens do pedido:", error);
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      const updatedProducts = products.filter(
        (product) => product.id !== productId
      );
      setProducts(updatedProducts);
      await AsyncStorage.setItem("cart", JSON.stringify(updatedProducts));
    } catch (error) {
      console.error("Erro ao remover produto do carrinho:", error);
    }
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      return total + product.preco * product.quantity;
    }, 0);
  };

  const handleClickFinish = async () => {
  try {
    // Adiciona os itens do carrinho ao banco de dados
    const itemsInsert = products.map((product) => ({
      pedido_id: id,
      produto_id: product.id,
      quantidade: product.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("itenspedido")
      .insert(itemsInsert);

    if (itemsError) {
      throw new Error("Erro ao inserir itens do pedido: " + itemsError.message);
    }

    // Busca o valor atual do pedido e outros detalhes
    const { data: pedidoData, error: pedidoError } = await supabase
      .from("pedidos")
      .select("total, nome_cliente, comanda_mesa, forma_pagamento, id_endereco")
      .eq("id", id)
      .single();

    if (pedidoError || !pedidoData) {
      throw new Error("Erro ao buscar pedido: " + pedidoError?.message);
    }

    // Calcula o novo valor total do pedido
    const novoTotal = pedidoData.total + calculateTotal();

    // Atualiza o pedido com o novo valor total e observações
    const { error: updateError } = await supabase
      .from("pedidos")
      .update({ total: novoTotal, obs: observacoes })
      .eq("id", id);

    if (updateError) {
      throw new Error("Erro ao atualizar total do pedido: " + updateError.message);
    }

    // Busca o endereço associado ao pedido
    let addressData = null;
    if (pedidoData.id_endereco) {
      const { data, error: addressError } = await supabase
        .from("enderecos")
        .select("*")
        .eq("id", pedidoData.id_endereco)
        .single();

      if (addressError || !data) {
        throw new Error("Erro ao buscar endereço: " + addressError?.message);
      }

      addressData = data;
    }

    // Busca os itens do pedido no banco de dados
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("itenspedido")
      .select("produto_id, quantidade, produtos(nome, preco)")
      .eq("pedido_id", id)
      .order("produto_id");

    if (orderItemsError) {
      throw new Error("Erro ao buscar itens do pedido: " + orderItemsError.message);
    }

    // Concatena os itens do pedido com os itens do carrinho
    const allItems = [...orderItems.map(item => ({
      id: item.produto_id,
      nome: item.produtos.nome,
      preco: item.produtos.preco,
      quantity: item.quantidade,
    }))];

    // Prepara os detalhes do pedido para impressão
    const orderDetails: OrderDetails = {
      orderId: id,
      obs: observacoes,
      clientName: pedidoData.nome_cliente,
      tableOrCommand: pedidoData.comanda_mesa,
      payment: pedidoData.forma_pagamento,
      address: addressData as Address,
      products: allItems,
      totalWithFreight: novoTotal,
    };

    // Imprime o pedido
    await printHTML(orderDetails);

    // Limpa o carrinho e redireciona
    await AsyncStorage.removeItem("cart");
    router.push({ pathname: `/` });
  } catch (error) {
    Alert.alert(error.message);
  }
};


  useEffect(() => {
    getProducts();
    getOrderItems(); // Chama a função para buscar os itens do pedido
  }, []);

  return (
    <View className="flex-1">
      <Header title="Carrinho" backIcon={true} />
      <View className="p-4">
        <ScrollView>
          {products.length === 0 && (
            <View className="justify-center items-center p-4">
              <Text className="text-lg font-semibold">Não há produtos no carrinho</Text>
            </View>
          )}
          {products?.map((item) => (
            <View key={item.id}>
              <View className="flex justify-between flex-row items-center text-center">
                <View>
                  <Text className="text-lg font-semibold">{item.nome}</Text>
                  <Text className="text-lg font-semibold">{`R$ ${item.preco.toFixed(2)}`}</Text>
                  <Text className="text-lg font-semibold">Qtd: {item.quantity}</Text>
                </View>
                <View className="flex-row gap-3 items-center justify-center">
                  <TouchableOpacity onPress={() => removeProduct(item.id)}>
                    <View className="bg-red-900 items-center flex-row justify-center rounded-lg p-1">
                      <Ionicons name="remove-outline" size={36} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <Divider />
            </View>
          ))}
          <Input
            label="Observações"
            value={observacoes}
            onChangeText={setObservacoes}
          />
        </ScrollView>
      </View>
      <View className="p-4">
        <Text className="text-lg font-semibold">Total: R$ {calculateTotal().toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        disabled={products.length === 0}
        onPress={handleClickFinish}
      >
        <View className="bg-green-900 items-center flex-row justify-center rounded-lg p-1">
          <Text className="text-white text-lg p-4">Atualizar pedido</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}