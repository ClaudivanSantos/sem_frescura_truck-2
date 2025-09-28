import { View, Text, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { IopenInWeb, openInWeb } from "../utils/functions";

interface IIconProps{
  link: string,
  icon: string
}

export default function IconContact({
  link,
  icon
}: IIconProps) {
  return (
    <View>
      <TouchableOpacity
        onPress={() =>
          openInWeb({ link: link})
        }
      >
        <FontAwesome name={icon as any} size={45} style={{ marginRight: 15 }} />
      </TouchableOpacity>
    </View>
  );
}
