import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import supabase from "../utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import Divider from "./Divider";
import DialogEditCategory from "./DialogEditCategory";
import LoadingOverlay from "./loadingOverlay";
import DialogCreateCategory from "./DialogCreateCategory";
import { useRouter } from "expo-router";

export interface ICategoryProps {
  id: number;
  nome: string;
}

export default function EditCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalCreateVisible, setModalCreateVisible] = useState(false);
  const [categoryEdit, setCategoryEdit] = useState<ICategoryProps>();
  const [category, setCategory] = useState<ICategoryProps[] | any[] | null>([]);
  const router = useRouter();

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

  function handleClickEdit(id: number, name: string) {
    setModalEditVisible(true);
    setCategoryEdit({ id: id, nome: name });
  }

  const deleteCategory = (id: number) => {
    Alert.alert(
      "Confirmação",
      "Você realmente deseja deletar esta categoria?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Deletar",
          onPress: async () => {
            try {
              const { data, error } = await supabase
                .from("categorias") 
                .delete()
                .eq("id", id);

              if (error) {
                console.error("Erro ao deletar categoria:", error.message);
                Alert.alert("Erro", "Não foi possível deletar a categoria.");
              } else {
                console.log("Categoria deletada com sucesso:", data);
                getCategory(); // Atualiza a lista de categorias
              }
            } catch (error) {
              console.error("Erro ao deletar categoria:", error);
              Alert.alert("Erro", "Ocorreu um erro ao deletar a categoria.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  function onCloseModalEdit() {
    getCategory();
    setModalEditVisible(false);
  }
  function onCloseModalCerate() {
    getCategory();
    setModalCreateVisible(false);
  }

  function handleClick(id: number) {
    router.push({
      pathname: `/editProduct`,

      params: {
        _id: id,
      },
    });
  }

  return (
    <View className="flex-1">
      <LoadingOverlay isLoading={isLoading} />
      <TouchableOpacity onPress={() => setModalCreateVisible(true)}>
        <View className="bg-green-900 items-center flex-row justify-center rounded-lg p-5 mb-5">
          <Ionicons name="add-circle-outline" size={36} color="white" />
        </View>
      </TouchableOpacity>

      <ScrollView>
        <DialogEditCategory
          editCategory={categoryEdit}
          visible={modalEditVisible}
          onClose={onCloseModalEdit}
        />

        <DialogCreateCategory
          visible={modalCreateVisible}
          onClose={onCloseModalCerate}
        />
        {category?.map((item) => (
          <View key={item.id}>
            <View className="flex justify-between flex-row items-center text-center">
            <Text className="text-lg font-semibold">{item.nome}</Text>
            <View className="flex-row gap-3 mt-4 ">
              <TouchableOpacity
                onPress={() => handleClickEdit(item.id, item.nome)}
              >
                <View className="bg-black items-center flex-row justify-center rounded-lg p-3">
                  <Ionicons name="pencil-outline" size={36} color="white" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteCategory(item.id)}>
                <View className="bg-red-900 items-center flex-row justify-center rounded-lg p-3">
                  <Ionicons name="close-outline" size={36} color="white" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                  onPress={() => handleClick(item.id)}
                >
                  <View className="bg-black items-center flex-row justify-center rounded-lg p-3">
                    <Ionicons name="ellipsis-horizontal-circle-outline" size={36} color="white" />
                  </View>
                </TouchableOpacity>
            </View>
            </View>
            <Divider />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
