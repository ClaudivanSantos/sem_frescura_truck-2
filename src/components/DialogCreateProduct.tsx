import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Input } from "./Input";
import supabase from "../utils/supabase";

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  idCategory: number;
}

const DialogCreateProduct: React.FC<DialogProps> = ({
  visible,
  onClose,
  idCategory,
}) => {
  const [ProductName, setProductName] = useState("");
  const [ProductPreco, setProductPreco] = useState("");

  const updateCategory = async () => {
    if (ProductName === "" || ProductPreco === "") {
      alert("Preencha todos os campos");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("produtos")
        .insert({
          nome: ProductName,
          categoria_id: idCategory,
          preco: Number(ProductPreco),
          ativo: "A"
        });

      if (error) {
        console.error("Erro ao criar produto:", error.message);
      } else {
        console.log("Produto criada com sucesso:", data);
        onClose();
      }
    } catch (error) {
      console.error("Erro ao criar produto:", error);
    }
  };
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <TouchableWithoutFeedback>
            <View className="bg-white p-6 rounded-lg shadow-lg w-[90%]">
              <Text className="text-lg font-semibold mb-4">Criar produto</Text>
              <Input
                label="Nome"
                onChangeText={(text) => setProductName(text)}
              />
              <Input
                label="Preço"
                onChangeText={(text) => setProductPreco(text)}
                keyboardType="numeric"
              />
              <TouchableOpacity
                onPress={updateCategory}
                className="bg-blue-500 p-5 rounded mt mt-4"
              >
                <Text className="text-white text-center">Adicionar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DialogCreateProduct;
