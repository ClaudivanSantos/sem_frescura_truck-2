import { ScrollView, Text, TouchableOpacity, View, Alert, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { atualizarStatusPedido } from "../services/updatePedido";
import { fetchPedidosPendentePagar } from "../services/getPendentePagar";
import supabase from "../utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import Divider from "./Divider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingOverlay from "./loadingOverlay";
import { Dropdown } from "react-native-element-dropdown";

export default function CardPag() {
  const [pedidos, setPedidos] = useState([]);
  const [isAdm, setIsAdm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState({});

  useEffect(() => {
    setIsLoading(true)
    const carregarPedidos = async () => {
      const dadosPedidos = await fetchPedidosPendentePagar();
      setPedidos(dadosPedidos);
      setIsLoading(false)
    };

    carregarPedidos();
    const subscribeToNewOrders = async () => {
      const subscription = supabase
        .channel("public:pedidos")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pedidos" },
          async (payload) => {
            console.log("Novo pedido:", payload.new);
            const novosPedidos = await fetchPedidosPendentePagar();
            setPedidos(novosPedidos);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    };

    subscribeToNewOrders();
  }, []);

  const handleStatusUpdate = async (pedidoId: number, statusAtual: string) => {
    // Verifica se o status é "concluido" e se há forma de pagamento definida
    if (statusAtual === "concluido" && !paymentMethod[pedidoId]) {
      Alert.alert("Erro", "Por favor, selecione a forma de pagamento antes de concluir o pedido.");
      return;
    }

    await atualizarStatusPedido(pedidoId, statusAtual, paymentMethod[pedidoId]);
    // Atualiza a lista de pedidos após a alteração do status
    const dadosPedidos = await fetchPedidosPendentePagar();
    setPedidos(dadosPedidos);
  };

  const handlePaymentMethodChange = (pedidoId: number, method: string) => {
    setPaymentMethod(prev => ({
      ...prev,
      [pedidoId]: method
    }));
  };

  useEffect(() => {
    const checkAdm = async () => {
      try {
        const adm = await AsyncStorage.getItem("adm");
        if (adm !== null) {
          setIsAdm(JSON.parse(adm));
        }
      } catch (error) {
        console.error("Erro ao recuperar o item do AsyncStorage:", error);
      }
    };

    checkAdm();
  }, []);

  const paymentOptions = [
    { label: "Dinheiro", value: "Dinheiro" },
    { label: "PIX", value: "PIX" },
    { label: "Crédito", value: "Crédito" },
    { label: "Débito", value: "Débito" },
  ];

  return (
    <View className="flex-1">
      <LoadingOverlay isLoading={isLoading} />
      <ScrollView>
        {pedidos.map((pedido) => (
          <View key={pedido.id} className="p-4">
            <Text className="text-lg font-bold">
              Comanda/Mesa: {pedido.comanda_mesa}
            </Text>
            <Text className="text-lg font-bold">
              Cliente: {pedido.nome_cliente}
            </Text>
            <Text className="text-lg font-bold">Obs: {pedido.obs}</Text>
            <Text className="text-lg font-bold">
              Valor: R$ {pedido.total.toFixed(2)}
            </Text>
            {pedido.itenspedido.map((item) => (
              <View key={item.produto_id}>
                <Text className="text-xl font-bold mt-4">
                  {item.quantidade} - {item.produto?.nome}
                </Text>
              </View>
            ))}
            {pedido.endereco && (
              <View>
                <Text className="text-lg font-bold mt-4">Endereço</Text>
                <Text className="text-lg font-semibold">
                  Rua: {pedido.endereco.rua} - {pedido.endereco.numero}
                </Text>
                <Text className="text-lg font-semibold">
                  Bairro: {pedido.endereco.bairro}
                </Text>
                <Text className="text-lg font-semibold">
                  Referência: {pedido.endereco.referencia}
                </Text>
              </View>
            )}
            
            {/* Forma de Pagamento */}
            <View className="mt-4">
              <Text className="text-lg font-bold mb-2">Forma de Pagamento</Text>
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
                value={paymentMethod[pedido.id]}
                onChange={(item) => {
                  handlePaymentMethodChange(pedido.id, item.value);
                }}
              />
            </View>
            
            {isAdm && (
              <View className="flex-row gap-3 mt-4 justify-center">
                <TouchableOpacity
                  onPress={() => handleStatusUpdate(pedido.id, "concluido")}
                >
                  <View className="bg-green-800 items-center flex-row justify-center rounded-lg p-5">
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={36}
                      color="white"
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleStatusUpdate(pedido.id, "pendente_fazer")
                  }
                >
                  <View className="bg-slate-600 items-center flex-row justify-center rounded-lg p-5">
                    <Ionicons
                      name="arrow-undo-outline"
                      size={36}
                      color="white"
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleStatusUpdate(pedido.id, "cancelado")}
                >
                  <View className="bg-red-900 items-center flex-row justify-center rounded-lg p-5">
                    <Ionicons name="close-outline" size={36} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
            )}
            <Divider />
          </View>
        ))}
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