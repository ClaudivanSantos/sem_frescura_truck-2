import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface iButtonProps {
  url: string;
  text: string;
  icon: string;
}

export default function ButtonHome({ url, text, icon }: iButtonProps) {
  const router = useRouter();

  const handlePress = (url: string) => {
    router.push({
      pathname: `/${url}`,

      // params: {
      //   _id: "123",
      // },
    });
  };
  return (
    <TouchableOpacity onPress={() => handlePress(url)}>
      <View className="bg-black items-center flex-row justify-center rounded-lg w-96 h-24 gap-3">
        <Ionicons name={icon} size={28} color="green" />
        <Text className="color-white text-xl">{text}</Text>
      </View>
    </TouchableOpacity>
  );
}
