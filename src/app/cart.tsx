import { ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import Header from "../components/header";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Divider from "../components/Divider";
import { useRouter } from "expo-router";

interface IProductProps {
  id: number;
  nome: string;
  preco: number;
  quantity: number;
}

interface ICart {
  products: IProductProps[];
  total: number;
}

export default function Cart() {
  const router = useRouter();
  const [products, setProducts] = useState<IProductProps[]>([]);

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
    const total = calculateTotal()
    
    //await AsyncStorage.setItem("total", JSON.stringify(calculateTotal));
      router.push({
        pathname: `/confirm`,
  
        params: {
          total: total,
        },
      });
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <View className="flex-1">
      <Header title="Carrinho" backIcon={true} />
      <View className="p-4 flex-1">
        <ScrollView>
          {products.length === 0 && (
            <View className="justify-center items-center p-4">
              <Text className="text-lg font-semibold">
                Não há produtos no carrinho
              </Text>
            </View>
          )}
          {products?.map((item) => (
            <View key={item.id}>
              <View className="flex justify-between flex-row items-center text-center">
                <View>
                  <Text className="text-lg font-semibold">{item.nome}</Text>
                  <Text className="text-lg font-semibold">{`R$ ${item.preco.toFixed(
                    2
                  )}`}</Text>
                  <Text className="text-lg font-semibold">
                    Qtd: {item.quantity}
                  </Text>
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
        </ScrollView>
      </View>
      <View className="p-4">
        <Text className="text-lg font-semibold">
          Total: R$ {calculateTotal().toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity
        disabled={products.length === 0}
        onPress={handleClickFinish}
      >
        <View className="bg-green-900 items-center flex-row justify-center rounded-lg p-1">
          <Text className="text-white text-lg p-4">Continuar</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
