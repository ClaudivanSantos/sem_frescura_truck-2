import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface IheaderProps {
  title: string;
  backIcon: boolean;
}

const Header = ({ title, backIcon }: IheaderProps) => {
  const router = useRouter();

  function backScreen() {
    router.back();
  }

  return (
    <View style={styles.header}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      {backIcon && (
        <TouchableOpacity style={styles.backIcon} onPress={backScreen}>
          <FontAwesome name="chevron-left" size={25} color="black" />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
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
    justifyContent: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    marginBottom: 10,
  },
  backIcon: {
    position: "absolute",
    left: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Header;
