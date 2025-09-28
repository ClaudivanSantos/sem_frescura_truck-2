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
}

const DialogCreateCategory: React.FC<DialogProps> = ({
  visible,
  onClose,
}) => {
  const [categoryName, setCategoryName] = useState('');


  const updateCategory = async () => {
    if(categoryName === ''){
      alert("Adicione uma informação")
      return;
    }
    try {
      const { data, error } = await supabase
        .from('categorias') 
        .insert({ nome: categoryName })

      if (error) {
        console.error('Erro ao criar categoria:', error.message);
      } else {
        console.log('Categoria criada com sucesso:', data);
        onClose();
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
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
        <View className="flex-1 justify-center items-center bg-black/50" >
          <TouchableWithoutFeedback>
            <View className="bg-white p-6 rounded-lg shadow-lg w-[90%]">
              <Text className="text-lg font-semibold mb-4">
                Criar categoria
              </Text>
              <Input label="Nome" onChangeText={(text) => setCategoryName(text)}/>
              <TouchableOpacity
                onPress={updateCategory}
                className="bg-blue-500 p-5 rounded mt-4"
              >
                <Text className="text-white text-center">Criar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DialogCreateCategory;
