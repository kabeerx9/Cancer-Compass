import { View, Text, Pressable } from "react-native";
import { useSession } from "../../ctx";

export default function HomePage() {
  const { signOut } = useSession();

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-gray-900">Home Screen</Text>
      <Text className="mt-2 text-gray-500">You are authenticated!</Text>

      <Pressable className="mt-8 bg-red-500 px-6 py-3 rounded-lg" onPress={() => signOut()}>
        <Text className="text-white font-semibold">Sign Out</Text>
      </Pressable>
    </View>
  );
}
