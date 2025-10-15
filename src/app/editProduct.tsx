import { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import supabase from "../utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import LoadingOverlay from "../components/loadingOverlay";
import Divider from "../components/Divider";
import { useLocalSearchParams } from "expo-router";
import Header from "../components/header";
import DialogCreateProduct from "../components/DialogCreateProduct";
import DialogEditProduct from "../components/DialogEditProduct";

export interface IProductProps {
  id: number;
  nome: string;
  preco: number;
}

export default function EditProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalCreateVisible, setModalCreateVisible] = useState(false);
  const [productEdit, setProductEdit] = useState<IProductProps>();
  const [products, setProducts] = useState<IProductProps[] | any[] | null>([]);
  const params = useLocalSearchParams();

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("categoria_id", params._id)
        .eq("ativo", "A");
      if (error) console.log(error);
      setProducts(data);
    } catch (error) {
      Alert.alert("Erro", "Erro ao buscar informações");
    } finally {
      setIsLoading(false);
    }
  };

  function handleClickEdit(id: number, name: string, preco: number) {
    setModalEditVisible(true);
    setProductEdit({ id: id, nome: name, preco: preco });
  }

  const deleteProduct = (id: number) => {
    Alert.alert(
      "Confirmação",
      "Você realmente deseja deletar este produto?",
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
                .from("produtos")
                .update({ ativo: "N" })
                .eq("id", id);

              if (error) {
                console.error("Erro ao deletar produto:", error.message);
                Alert.alert("Erro", "Não foi possível deletar o produto.");
              } else {
                console.log("Produto deletado com sucesso:", data);
                getProducts();
              }
            } catch (error) {
              console.error("Erro ao deletar produto:", error);
              Alert.alert("Erro", "Ocorreu um erro ao deletar o produto.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  function onCloseModalEdit() {
    getProducts();
    setModalEditVisible(false);
  }

  function onCloseModalCreate() {
    getProducts();
    setModalCreateVisible(false);
  }

  const renderProductItem = ({ item }: { item: IProductProps }) => (
    <View className="mb-4">
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold">{item.nome}</Text>
          <Text className="text-lg font-semibold">{`R$ ${item.preco.toFixed(2)}`}</Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => handleClickEdit(item.id, item.nome, item.preco)}
          >
            <View className="bg-black items-center flex-row justify-center rounded-lg p-3">
              <Ionicons name="pencil-outline" size={36} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteProduct(item.id)}>
            <View className="bg-red-900 items-center flex-row justify-center rounded-lg p-3">
              <Ionicons name="close-outline" size={36} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <Divider />
    </View>
  );

  return (
    <View className="flex-1">
      <Header backIcon title="Editar produto" />
      <LoadingOverlay isLoading={isLoading} />
      <DialogCreateProduct
        idCategory={Number(params._id)}
        onClose={onCloseModalCreate}
        visible={modalCreateVisible}
      />
      <DialogEditProduct
        editProduct={productEdit}
        visible={modalEditVisible}
        onClose={onCloseModalEdit}
      />
      
      <View className="flex-1 p-4">
        <TouchableOpacity onPress={() => setModalCreateVisible(true)}>
          <View className="bg-green-900 items-center flex-row justify-center rounded-lg p-5 mb-5">
            <Ionicons name="add-circle-outline" size={36} color="white" />
          </View>
        </TouchableOpacity>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Text className="text-lg text-gray-500">Nenhum produto encontrado</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}