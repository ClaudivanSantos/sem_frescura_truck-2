import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { IProductProps } from "../app/editProduct";
import { Ionicons } from "@expo/vector-icons";
import Divider from "./Divider";
import supabase from "../utils/supabase";
import LoadingOverlay from "./loadingOverlay";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  idCategory: number;
}

const DialogSelectProduct: React.FC<DialogProps> = ({
  visible,
  onClose,
  idCategory,
}) => {
  const [products, setProducts] = useState<IProductProps[] | any[] | null>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para a quantidade de cada produto
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (idCategory !== null) {
      getProducts();
    }
  }, [idCategory]);

  const getProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("categoria_id", idCategory)
        .eq("ativo", "A");
      if (error) console.log(error);
      setProducts(data);

      // Inicializa a quantidade de cada produto com 1
      const initialQuantities = data?.reduce(
        (acc: any, product: IProductProps) => {
          acc[product.id] = 1;
          return acc;
        },
        {}
      );
      setQuantities(initialQuantities);
    } catch (error) {
      Alert.alert("Erro", "Erro ao buscar informações");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para incrementar a quantidade de um produto
  const incrementQuantity = (productId: number) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: prevQuantities[productId] + 1,
    }));
  };

  // Função para decrementar a quantidade de um produto, sem deixar abaixo de 1
  const decrementQuantity = (productId: number) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: Math.max(1, prevQuantities[productId] - 1),
    }));
  };

  // Função para adicionar o produto no carrinho e salvar no AsyncStorage
  const addToCart = async (product: IProductProps) => {
    try {
      const currentQuantity = quantities[product.id];
      const cartData = await AsyncStorage.getItem("cart");
      let cart = cartData ? JSON.parse(cartData) : [];

      const existingProductIndex = cart.findIndex(
        (item: any) => item.id === product.id
      );

      if (existingProductIndex !== -1) {
        // Se o produto já está no carrinho, soma a quantidade
        cart[existingProductIndex].quantity += currentQuantity;
      } else {
        // Se não, adiciona o novo produto ao carrinho
        cart.push({
          id: product.id,
          nome: product.nome,
          preco: product.preco,
          quantity: currentQuantity,
        });
      }

      await AsyncStorage.setItem("cart", JSON.stringify(cart));
      Alert.alert("Sucesso", "Produto adicionado ao carrinho!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível adicionar o produto ao carrinho");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      className="flex-1"
    >
      <LoadingOverlay isLoading={isLoading} />
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/50 h-[100%]">
          <TouchableWithoutFeedback>
            <View className="bg-white p-6 rounded-lg shadow-lg w-[90%] h-[80%]">
              {/* Cabeçalho com título e botão X */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-semibold">
                  Adicionar produtos no carrinho
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <View className="bg-gray-200 rounded-full p-1">
                    <Ionicons name="close" size={24} color="black" />
                  </View>
                </TouchableOpacity>
              </View>
              
              <View className="flex-1">
                <ScrollView>
                  {products?.map((item) => (
                    <View key={item.id}>
                      <View className="flex justify-between flex-row items-center text-center">
                        <View>
                          <Text className="text-2xl font-semibold">
                            {item.nome}
                          </Text>
                          <Text className="text-2xl font-semibold">{`R$ ${item.preco.toFixed(
                            2
                          )}`}</Text>
                        </View>
                        <View className="flex-row gap-3 items-center justify-center">
                          <TouchableOpacity
                            onPress={() => decrementQuantity(item.id)}
                          >
                            <View className="bg-black items-center flex-row justify-center rounded-lg p-1">
                              <Ionicons
                                name="remove-outline"
                                size={36}
                                color="white"
                              />
                            </View>
                          </TouchableOpacity>
                          <Text className="text-2xl font-semibold">
                            {quantities[item.id]}
                          </Text>
                          <TouchableOpacity
                            onPress={() => incrementQuantity(item.id)}
                          >
                            <View className="bg-black items-center flex-row justify-center rounded-lg p-1">
                              <Ionicons
                                name="add-outline"
                                size={36}
                                color="white"
                              />
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => addToCart(item)}>
                        <View className="bg-black items-center flex-row justify-center rounded-lg p-2 mt-4">
                          <Ionicons name="cart-outline" size={36} color="white" />
                        </View>
                      </TouchableOpacity>
                      <Divider />
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DialogSelectProduct;