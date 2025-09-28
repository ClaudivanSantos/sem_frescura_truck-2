import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Você pode usar qualquer ícone de sua preferência
import { useRouter } from "expo-router";

const FloatingCartButton = () => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/cart",

      // params: {
      //   _id: "123",
      // },
    });
  };

  return (
    <View className="absolute top-12 right-5 z-50">
      <TouchableOpacity
        className="bg-blue-500 p-3 rounded-full shadow-lg"
        onPress={handlePress}
      >
        <Ionicons name="cart-outline" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default FloatingCartButton;
