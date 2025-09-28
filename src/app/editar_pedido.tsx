import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Header from "../components/header";
import { useEffect, useState } from "react";
import { ICategoryProps } from "../components/EditCategory";
import supabase from "../utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import Divider from "../components/Divider";
import LoadingOverlay from "../components/loadingOverlay";
import DialogSelectProduct from "../components/DialogSelectProduct";
import { useLocalSearchParams } from "expo-router";
import FloatingCartEdit from "../components/FloatingCartEdit";

export default function EditarPedido() {
  const [isLoading, setIsLoading] = useState(false);
  const [idCategory, setIdCategory] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState<ICategoryProps[] | any[] | null>([]);
  const { id, comanda_mesa } = useLocalSearchParams();

  useEffect(() => {
    getCategory();
  }, []);

  const getCategory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("categorias").select("*");
      if (error) console.log(error);
      setCategory(data);
    } catch (error) {
      Alert.alert("Erro", "Erro ao buscar informações");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (idCategory !== null) {
      setModalVisible(true);
    }
  }, [idCategory]);

  function handleClick(id: number) {
    setIdCategory(id);
  }

  function onCloseModalEdit() {
    setModalVisible(false);
    setIdCategory(null);
  }
  return (
    <View className="flex-1">
      <Header title="Editar pedido" backIcon={true} />
      <LoadingOverlay isLoading={isLoading} />
      <Text className="text-center text-lg font-bold">Editando pedido: {comanda_mesa}</Text>
      <DialogSelectProduct
        visible={modalVisible}
        onClose={onCloseModalEdit}
        idCategory={idCategory}
      />
      <FloatingCartEdit id={id}/>
      <View className="p-4 flex-1">
        <ScrollView>
          {category?.map((item) => (
            <View key={item.id}>
              <View className="flex justify-between flex-row items-center text-center">
                <Text className="text-lg font-semibold">{item.nome}</Text>
                <View className="flex-row gap-3 mt-4 ">
                  <TouchableOpacity onPress={() => handleClick(item.id)}>
                    <View className="bg-black items-center flex-row justify-center rounded-lg p-3">
                      <Ionicons
                        name="arrow-forward-outline"
                        size={36}
                        color="white"
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <Divider />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
