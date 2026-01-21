import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { useSession } from "../ctx";

export default function SignUp() {
  const { signIn } = useSession();

  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <Text className="text-3xl font-bold mb-8 text-gray-900">Sign Up</Text>

      <TextInput
        className="border border-gray-300 p-4 rounded-lg mb-4 text-base"
        placeholder="Name"
      />
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
        className="bg-green-600 p-4 rounded-lg mb-4"
        onPress={() => {
          signIn();
          router.replace("/");
        }}
      >
        <Text className="text-white text-center text-lg font-semibold">Sign Up</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text className="text-center text-blue-600 text-base">Back to Landing</Text>
      </Pressable>
    </View>
  );
}
