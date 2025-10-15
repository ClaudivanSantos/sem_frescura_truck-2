import { Alert, Image, StyleSheet, Text, View } from "react-native";
import Header from "../components/header";
import IconContact from "../components/iconContact";
import { Ionicons } from "@expo/vector-icons";
import Dialog from "react-native-dialog";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ModalScreen() {
  const [openPassword, setOpenPassword] = useState(false);
  const [password, setPassword] = useState("");

  async function validatePassword() {
    if (password === "0423") {
      const adm = await AsyncStorage.getItem("adm");
      if (adm) {
        await AsyncStorage.removeItem("adm");
        setOpenPassword(false)
        Alert.alert("Você agora é um usuário")
      } else {
        await AsyncStorage.setItem("adm", "true");
        setOpenPassword(false)
        Alert.alert("Você agora é um ADM")

      }
    } else {
      Alert.alert("Atenção", "Senha incorreta", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    }
  }

  return (
    <View className="flex-1">
      <Header backIcon={true} title="Modal" />
      <View>
        <Dialog.Container visible={openPassword}>
          <Dialog.Title>Digite a senha</Dialog.Title>
          <Dialog.Description>Para continuar digite a senha</Dialog.Description>
          <Dialog.Input
            style={{ color: "#000" }}
            onChangeText={(text: string) => setPassword(text)}
            value={password}
          />
          <Dialog.Button
            label="Cancelar"
            onPress={() => setOpenPassword(false)}
          />
          <Dialog.Button label="Ok" onPress={validatePassword} />
        </Dialog.Container>
      </View>
      <View className="flex-1 items-center justify-center">
        <Ionicons
          name="arrow-forward-outline"
          size={36}
          color="white"
          onPress={() => setOpenPassword(true)}
        />
        <Image source={require("../../assets/images/coder.png")} />

        <View>
          <View>
            <Text
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Contato
            </Text>
            <Text style={{ fontSize: 20, marginBottom: 7 }}>
              Claudivan Da Silva Santos
            </Text>
            <View style={{ display: "flex", flexDirection: "row", gap: 30 }}>
              <IconContact
                link="https://www.instagram.com/claudivan.dev"
                icon="instagram"
              />
              <IconContact
                link="mailto:claudivansantos61@gmail.com/"
                icon="envelope-o"
              />
              <IconContact link="https://claudivan.dev.br/pt" icon="chrome" />
            </View>
          </View>
          <Text className="font-semibold text-lg">Versão: 2.0</Text>
        </View>
        <Image
          style={{ marginTop: 20 }}
          source={require("../../assets/images/logo-claudivan.png")}
        />
      </View>
    </View>
  );
}
