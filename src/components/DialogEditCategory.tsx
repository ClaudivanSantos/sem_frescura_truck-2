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
  editCategory: {
    id: number;
    nome: string;
  };
  onClose: () => void;
}

const DialogEditCategory: React.FC<DialogProps> = ({
  visible,
  editCategory,
  onClose,
}) => {
  const [categoryName, setCategoryName] = useState(editCategory?.nome);

  const updateCategory = async () => {
    if (categoryName === "") {
      alert("Informe o nome");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("categorias")
        .update({ nome: categoryName })
        .eq("id", editCategory.id);

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
              <Text className="text-lg font-semibold mb-4">
                Editar categoria
              </Text>
              <Input
                label="Nome"
                defaultValue={editCategory?.nome}
                onChangeText={(text) => setCategoryName(text)}
              />
              <TouchableOpacity
                onPress={updateCategory}
                className="bg-blue-500 p-5 rounded mt-4"
              >
                <Text className="text-white text-center text-lg">Editar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DialogEditCategory;
