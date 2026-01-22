import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";

export default function SignIn() {
  const handleSubmit = () => {
    // TODO: Implement sign in logic
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-bg">
      <View className="w-full max-w-[360px] rounded-card bg-surface p-5 shadow-card">
        <Text className="text-display leading-display font-bold text-center text-text mb-4">
          Welcome Back
        </Text>
        <Text className="text-body leading-body text-center text-text-muted mb-6">
          Log in to continue
        </Text>

        <View className="mb-3">
          <Text className="text-label leading-label text-text-soft mb-2 font-medium">
            E-mail
          </Text>
          <TextInput
            className="h-12 border border-border px-4 rounded-input text-body leading-body bg-input text-text"
            placeholder="hello@domain.com"
            placeholderTextColor="#9A9A9A"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-5">
          <Text className="text-label leading-label text-text-soft mb-2 font-medium">
            Password
          </Text>
          <TextInput
            className="h-12 border border-border px-4 rounded-input text-body leading-body bg-input text-text"
            placeholder="••••••••"
            placeholderTextColor="#9A9A9A"
            secureTextEntry
          />
        </View>

        <Pressable
          className="h-[52px] bg-cta rounded-button shadow-button justify-center items-center mb-5"
          onPress={handleSubmit}
        >
          <Text className="text-cta-text text-body leading-body font-semibold">
            Log in
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text className="text-center text-text-muted text-label leading-label underline">
            Back to landing
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
