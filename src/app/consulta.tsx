import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Header from "../components/header";
import { useState } from "react";
import DateInput from "../components/DateInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import supabase from "../utils/supabase";
import LoadingOverlay from "../components/loadingOverlay";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/Card";
import { isValidDate } from "../utils/functions";
import DateTimePicker from "react-native-modal-datetime-picker";
import { Input } from "../components/Input";

export interface IPedidosProps {
  comanda_mesa: string;
  data: string;
  forma_pagamento: string;
  id: number;
  status: string;
  total: number;
}

export default function Consulta() {
  const [date, setDate] = useState("");
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pedidos, setPedidos] = useState<IPedidosProps[] | any[] | null>([]);
  const [totalVendas, setTotalVendas] = useState(0);
  const [totalCartao, setTotalCartao] = useState(0);
  const [totalPix, setTotalPix] = useState(0);
  const [totalDinheiro, setTotalDinheiro] = useState(0);

  const fetchPedidos = async () => {
    if (isValidDate(date)) {
      try {
        setIsLoading(true);

        // Converte a data do formato dd/mm/yyyy para o formato YYYY-MM-DD
        const [day, month, year] = date.split("/").map(Number);
        const formattedDate = `${year}-${String(month).padStart(
          2,
          "0"
        )}-${String(day).padStart(2, "0")}`;
        console.log(formattedDate);

        // Realiza a consulta no Supabase utilizando a função PostgreSQL TO_CHAR() para comparar apenas a data
        const { data, error } = await supabase
          .from("pedidos")
          .select("*")
          .neq("status", "cancelado")
          .filter("data", "gte", `${formattedDate}T00:00:00+00:00`)
          .filter("data", "lt", `${formattedDate}T23:59:59+00:00`) // Compara apenas a parte da data no formato YYYY-MM-DD
          .order("data", { ascending: true });
        if (error) {
          console.log("Erro ao buscar pedidos:", error);
          return;
        }

        if (data.length === 0) {
          console.log("Nenhum pedido encontrado para essa data.");
        }

        setPedidos(data);

        // Calcula os totais
        const totalVendas = data.reduce((acc, pedido) => acc + pedido.total, 0);
        const totalCartao = data
          .filter(
            (pedido) =>
              pedido.forma_pagamento === "Crédito" ||
              pedido.forma_pagamento === "Débito"
          )
          .reduce((acc, pedido) => acc + pedido.total, 0);

        const totalPix = data
          .filter((pedido) => pedido.forma_pagamento === "PIX")
          .reduce((acc, pedido) => acc + pedido.total, 0);

        const totalDinheiro = data
          .filter((pedido) => pedido.forma_pagamento === "Dinheiro")
          .reduce((acc, pedido) => acc + pedido.total, 0);

        setTotalVendas(totalVendas);
        setTotalCartao(totalCartao);
        setTotalPix(totalPix);
        setTotalDinheiro(totalDinheiro);
      } catch (error) {
        Alert.alert("Erro ao buscar informações");
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert("Erro ao buscar informações");
    }
  };

  const formatDateToBR = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (selectedDate: Date) => {
    const formattedDate = selectedDate.toLocaleDateString("pt-BR");
    setDate(formattedDate);
    hideDatePicker();
  };

  return (
    <View className="flex-1">
      <Header title="Consulta" backIcon={true} />
      <LoadingOverlay isLoading={isLoading} />
      <View className="flex-row items-center p-4">
        <View className="flex-1">
          <TouchableOpacity onPress={showDatePicker}>
            <Input
              value={date}
              className="text-lg font-semibold"
              placeholder="dd/mm/aaaa"
              keyboardType="numeric"
              maxLength={10}
              style={{ color: date ? "#000" : "#a9a9a9" }}
              editable={false} // Impede a edição manual para forçar o uso do DatePicker
              pointerEvents="none" // Faz com que o TouchableOpacity capture o clique
            />
          </TouchableOpacity>
          <DateTimePicker
            isVisible={datePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
        </View>
        <TouchableOpacity className="ml-2" onPress={fetchPedidos}>
          <Ionicons name="search-sharp" size={36} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <ScrollView>
          {pedidos?.map((pedido) => (
            <Card key={pedido.id}>
              <CardHeader>
                <CardTitle>{`Mesa/Comanda: ${pedido.comanda_mesa}`}</CardTitle>
                <CardDescription>{`Data: ${formatDateToBR(
                  pedido.data
                )}`}</CardDescription>
              </CardHeader>
              <CardContent>
                <Text className="text-lg text-primary text-green-700">
                  {`Total: R$${pedido.total.toFixed(2)}`}
                </Text>
                <Text className="text-lg text-primary">
                  {`Forma de Pagamento: ${pedido.forma_pagamento}`}
                </Text>
              </CardContent>
              <CardFooter>
                <Text className="text-lg text-muted-foreground">
                  {`Status: ${pedido.status}`}
                </Text>
              </CardFooter>
            </Card>
          ))}

          {/* Mostra o total de vendas e total por forma de pagamento */}
          <View className="p-4">
            <Text className="font-bold text-lg">Resumo das Vendas</Text>
            <Text className="mt-2 text-lg">{`Total de Vendas: R$${totalVendas.toFixed(
              2
            )}`}</Text>
            <Text className="text-lg">{`Total em Cartão (Crédito/Débito): R$${totalCartao.toFixed(
              2
            )}`}</Text>
            <Text className="text-lg">{`Total em PIX: R$${totalPix.toFixed(
              2
            )}`}</Text>
            <Text className="text-lg">{`Total em Dinheiro: R$${totalDinheiro.toFixed(
              2
            )}`}</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
