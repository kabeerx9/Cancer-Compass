import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";

export default function SignIn() {
  const handleSubmit = () => {
    // TODO: Implement sign in logic
  };

  return (
    <View className="flex-1 justify-center p-5 bg-[var(--color-bg)]">
      <View className="rounded-[28px] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-lg">
        <Text className="text-[28px] leading-[34px] font-bold text-center text-[var(--color-text)]">
          Welcome Back
        </Text>
        <Text className="mt-2 text-center text-[var(--color-text-muted)]">
          Log in to continue
        </Text>

        <View className="mt-6">
          <Text className="text-[13px] text-[var(--color-text-soft)] mb-2">
            E-mail
          </Text>
          <TextInput
            className="border border-border p-4 rounded-[18px] text-base bg-input text-text"
            placeholder="hello@domain.com"
            placeholderTextColor="#9A9A9A"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="mt-4">
          <Text className="text-[13px] text-[var(--color-text-soft)] mb-2">
            Password
          </Text>
          <TextInput
            className="border border-[var(--color-border)] p-4 rounded-[18px] text-base bg-[var(--color-input)] text-[var(--color-text)]"
            placeholder="••••••••"
            placeholderTextColor="#9A9A9A"
            secureTextEntry
          />
        </View>

        <Pressable
          className="bg-[var(--color-cta)] p-4 rounded-[24px] mt-6"
          onPress={handleSubmit}
        >
          <Text className="text-[var(--color-cta-text)] text-center text-lg font-semibold">
            Log in
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-center text-[var(--color-text-muted)] text-sm underline">
            Back to landing
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
