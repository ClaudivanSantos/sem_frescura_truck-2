import { Text, View } from "react-native";
import Header from "../components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import CardFaz from "../components/CardFaz";
import CardPag from "../components/CardPag";
import CardConcluido from "../components/CardConcluido";

export default function Pedido() {
  return (
    <View className="flex-1">
      <Header title="Pedidos pendentes" backIcon={true} />
      <Tabs defaultValue="pendente">
        <TabsList>
          <TabsTrigger
            id="pendente"
            title="hourglass-outline"
            value="pendente"
          />
          <TabsTrigger id="pagamento" title="cash-outline" value="pagamento" />
          <TabsTrigger
            id="buscarentrega"
            title="bag-check-outline"
            value="buscarentrega"
          />
        </TabsList>
        <TabsContent value="pendente">
          <Text className="text-xl font-bold text-center mb-4">Para fazer</Text>
          <CardFaz />
        </TabsContent>
        <TabsContent value="pagamento">
          <Text className="text-xl font-bold text-center mb-4">
            Pendente pagamento
          </Text>

          <CardPag />
        </TabsContent>
        <TabsContent value="buscarentrega">
          <Text className="text-xl font-bold text-center mb-4">
            Concluídos
          </Text>

          <CardConcluido />
        </TabsContent>
      </Tabs>
    </View>
  );
}
