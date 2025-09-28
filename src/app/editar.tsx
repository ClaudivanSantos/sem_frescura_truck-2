import { ScrollView, View } from "react-native";
import Header from "../components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import EditCategory from "../components/EditCategory";

export default function Editar() {
  return (
    <View className="flex-1">
      <Header title="Editar categoria" backIcon={true} />
      <View className="flex-1 p-4">
        <EditCategory />
      </View>
    </View>
  );
}
