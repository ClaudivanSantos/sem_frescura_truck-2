import Ionicons from "@expo/vector-icons/Ionicons";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  StatusBar,
  Alert,
} from "react-native";
import supabase from "../utils/supabase";
import { useState } from "react";
import { openInWeb } from "../utils/functions";
import { useRouter } from "expo-router";

interface IheaderProps {
  title: string;
}

const HeaderHome = ({ title }: IheaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  async function handleOpdate(){
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("sistema")
        .select("*")
      if (error) console.log(error);
      await Linking.openURL(data[0]?.link);
    } catch (error) {
      Alert.alert("Erro", "Erro ao buscar informações");
    } finally {
      setIsLoading(false);
    }
  }

  const handlePress = () => {
    router.push({
      pathname: `/modalInfo`,

      // params: {
      //   _id: "123",
      // },
    });
  };

  return (
    <View style={styles.header}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={handleOpdate}>
          <Ionicons name="arrow-down-circle-outline" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePress}>
          <Ionicons name="information-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 40,
    height: 60,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 60,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default HeaderHome;
