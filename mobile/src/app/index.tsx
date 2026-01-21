import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function LandingPage() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center p-5 bg-white">
      <Text className="text-3xl font-bold mb-10 text-gray-900">Cancer Compass</Text>

      <Pressable
        className="w-full p-4 rounded-lg mb-4 bg-blue-600"
        onPress={() => router.push("/sign-in")}
      >
        <Text className="text-white text-center text-lg font-semibold">Login</Text>
      </Pressable>

      <Pressable
        className="w-full p-4 rounded-lg mb-4 bg-green-600"
        onPress={() => router.push("/sign-up")}
      >
        <Text className="text-white text-center text-lg font-semibold">Sign Up</Text>
      </Pressable>
    </View>
  );
}
