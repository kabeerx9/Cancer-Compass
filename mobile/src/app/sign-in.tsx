import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { useSession } from "../ctx";

export default function SignIn() {
  const { signIn } = useSession();

  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <Text className="text-3xl font-bold mb-8 text-gray-900">Login</Text>

      <TextInput
        className="border border-gray-300 p-4 rounded-lg mb-4 text-base"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="border border-gray-300 p-4 rounded-lg mb-4 text-base"
        placeholder="Password"
        secureTextEntry
      />

      <Pressable
        className="bg-blue-600 p-4 rounded-lg mb-4"
        onPress={() => {
          signIn();
          router.replace("/");
        }}
      >
        <Text className="text-white text-center text-lg font-semibold">Login</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text className="text-center text-blue-600 text-base">Back to Landing</Text>
      </Pressable>
    </View>
  );
}
