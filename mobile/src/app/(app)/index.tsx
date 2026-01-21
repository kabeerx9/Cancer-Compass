import { View, Text, Pressable } from "react-native";
import { useSession } from "../../ctx";

export default function HomePage() {
  const { signOut } = useSession();

  return (
    <View className="flex-1 justify-center items-center p-5 bg-[var(--color-bg)]">
      <View className="w-full rounded-[28px] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-lg">
        <Text className="text-[22px] leading-[28px] font-semibold text-[var(--color-text)]">
          Home
        </Text>
        <Text className="mt-2 text-[var(--color-text-muted)]">
          You are authenticated!
        </Text>

        <Pressable
          className="mt-6 bg-[var(--color-cta)] px-6 py-3 rounded-[24px]"
          onPress={() => signOut()}
        >
          <Text className="text-[var(--color-cta-text)] font-semibold text-center">
            Sign Out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
