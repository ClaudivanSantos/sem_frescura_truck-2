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
  editProduct: {
    id: number;
    nome: string;
    preco: number;
  };
  onClose: () => void;
}

const DialogEditProduct: React.FC<DialogProps> = ({
  visible,
  editProduct,
  onClose,
}) => {
  const [ProductName, setProductName] = useState(editProduct?.nome);
  const [ProductPreco, setProductPreco] = useState(editProduct?.nome);

  console.log(editProduct);

  const updateCategory = async () => {
    if (ProductName === "") {
      alert("Informe o nome");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("produtos")
        .update({ nome: ProductName, preco: ProductPreco })
        .eq("id", editProduct.id);

      if (error) {
        console.error("Erro ao atualizar categoria:", error.message);
      } else {
        console.log("Categoria atualizada com sucesso:", data);
        onClose();
      }
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
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
              <Text className="text-lg font-semibold mb-4">Editar produto</Text>
              <Input
                label="Nome"
                defaultValue={editProduct?.nome}
                onChangeText={(text) => setProductName(text)}
              />
              <Input
                label="Preço"
                defaultValue={editProduct?.preco.toString()}
                onChangeText={(text) => setProductPreco(text)}
                keyboardType="numeric"
              />
              <TouchableOpacity
                onPress={updateCategory}
                className="bg-blue-500 p-5 rounded mt-4"
              >
                <Text className="text-white text-center">Editar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DialogEditProduct;
