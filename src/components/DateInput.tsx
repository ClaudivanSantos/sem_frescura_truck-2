import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Input } from './Input';

interface IDateProps{
  date: string;
  setDate : (date: string) => void;
}

const DateInput = ({date, setDate}: IDateProps) => {
  // Função para formatar a data enquanto o usuário digita
  const formatDate = (text: string) => {
    // Remove qualquer caractere não numérico
    let cleanText = text.replace(/\D/g, '');

    // Formata a data com base no número de caracteres
    if (cleanText.length <= 2) {
      return cleanText;
    } else if (cleanText.length <= 4) {
      return `${cleanText.slice(0, 2)}/${cleanText.slice(2)}`;
    } else {
      return `${cleanText.slice(0, 2)}/${cleanText.slice(2, 4)}/${cleanText.slice(4, 8)}`;
    }
  };

  const handleChange = (text :string) => {
    setDate(formatDate(text));
  };

  return (
    <View className="p-4">
      <Input
        value={date}
        onChangeText={handleChange}
        placeholder="dd/mm/aaaa"
        keyboardType="numeric"
        maxLength={10} // Limita a entrada para o formato dd/mm/aaaa
      />
    </View>
  );
};

export default DateInput;
