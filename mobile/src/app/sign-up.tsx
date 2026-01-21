import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { useSession } from "../ctx";

export default function SignUp() {
  const { signIn } = useSession();

  return (
    <View className="flex-1 justify-center p-5 bg-[var(--color-bg)]">
      <View className="rounded-[28px] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-lg">
        <Text className="text-[28px] leading-[34px] font-bold text-center text-[var(--color-text)]">
          Create Account
        </Text>
        <Text className="mt-2 text-center text-[var(--color-text-muted)]">
          Join Cancer Compass
        </Text>

        <View className="mt-6">
          <Text className="text-[13px] text-[var(--color-text-soft)] mb-2">
            Full Name
          </Text>
          <TextInput
            className="border border-[var(--color-border)] p-4 rounded-[18px] text-base bg-[var(--color-input)] text-[var(--color-text)]"
            placeholder="Jordan Lee"
            placeholderTextColor="#9A9A9A"
          />
        </View>

        <View className="mt-4">
          <Text className="text-[13px] text-[var(--color-text-soft)] mb-2">
            E-mail
          </Text>
          <TextInput
            className="border border-[var(--color-border)] p-4 rounded-[18px] text-base bg-[var(--color-input)] text-[var(--color-text)]"
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
          onPress={() => {
            signIn();
            router.replace("/");
          }}
        >
          <Text className="text-[var(--color-cta-text)] text-center text-lg font-semibold">
            Sign up
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
