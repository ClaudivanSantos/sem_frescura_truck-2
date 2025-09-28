import React, { useState, useEffect } from "react";
import { Image, View } from "react-native";
import ButtonHome from "../components/button-home";
import HeaderHome from "../components/headerHome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateUUID } from "../utils/functions";

export default function Index() {
  const [isAdm, setIsAdm] = useState(false);

  useEffect(() => {
    const checkAdm = async () => {
      try {
        await AsyncStorage.setItem("adm", "true");
        const adm = await AsyncStorage.getItem("adm");
        if (adm !== null) {
          setIsAdm(JSON.parse(adm));
        }
      } catch (error) {
        console.error("Erro ao recuperar o item do AsyncStorage:", error);
      }
    };
    const getDeviceId = async () => {
      try {
        // Verifica se já existe um deviceId armazenado
        let id = await AsyncStorage.getItem('id_aparelho');
        if (!id) {
          // Se não existir, gera um novo UUID
          id = generateUUID();
          console.log(id)
          await AsyncStorage.setItem('id_aparelho', id);
        }
      } catch (error) {
        console.error('Erro ao acessar o AsyncStorage', error);
      }
    };

    checkAdm();
    getDeviceId()
  }, []);

  return (
    <View>
      <HeaderHome title="Início" />
      <View className="flex items-center gap-4">
        <Image
          style={{ width: 200, height: 200, borderRadius: 100 }}
          source={require("../../assets/images/logo.png")}
        />
        <ButtonHome
          text="Novo pedido"
          url="novo-pedido"
          icon="add-circle-outline"
        />
        {isAdm && (
        <ButtonHome text="Consulta" url="consulta" icon="newspaper-outline" />
      )}
        <ButtonHome
          text="Pedidos pendentes"
          url="pedidos"
          icon="ticket-outline"
        />
        {isAdm && (
          <ButtonHome text="Editar" url="editar" icon="construct-outline" />
        )}
      </View>
    </View>
  );
}
