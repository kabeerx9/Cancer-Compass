import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";

export default function SignIn() {
  const handleSubmit = () => {
    // TODO: Implement sign in logic
  };

  return (
    <View className="flex-1 justify-center p-5 bg-bg">
      <View className="rounded-card bg-surface border border-border p-6 shadow-lg">
        <Text className="text-display leading-display font-bold text-center text-text">
          Welcome Back
        </Text>
        <Text className="mt-2 text-center text-text-muted">
          Log in to continue
        </Text>

        <View className="mt-6">
          <Text className="text-label leading-label text-text-soft mb-2">
            E-mail
          </Text>
          <TextInput
            className="border border-border p-4 rounded-input text-body leading-body bg-input text-text"
            placeholder="hello@domain.com"
            placeholderTextColor="#9A9A9A"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="mt-4">
          <Text className="text-label leading-label text-text-soft mb-2">
            Password
          </Text>
          <TextInput
            className="border border-border p-4 rounded-input text-body leading-body bg-input text-text"
            placeholder="••••••••"
            placeholderTextColor="#9A9A9A"
            secureTextEntry
          />
        </View>

        <Pressable
          className="bg-cta p-4 rounded-button mt-6"
          onPress={handleSubmit}
        >
          <Text className="text-cta-text text-center text-lg font-semibold">
            Log in
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-center text-text-muted text-caption underline">
            Back to landing
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
