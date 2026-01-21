import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Uniwind, useUniwind } from "uniwind";

const ThemeSwitcher = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const activeTheme = hasAdaptiveThemes ? "system" : theme;

  return (
    <View className="w-full rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--color-border)]">
      <Text className="text-[var(--color-text)] text-sm font-semibold mb-3">
        Theme: {activeTheme}
      </Text>

      <View className="flex-row gap-2">
        {["light", "dark", "system"].map((t) => {
          const isActive = activeTheme === t;

          return (
            <Pressable
              key={t}
              onPress={() => Uniwind.setTheme(t)}
              className={`px-3 py-2 rounded-xl ${
                isActive
                  ? "bg-[var(--color-cta)]"
                  : "bg-[var(--color-chip)]"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isActive
                    ? "text-[var(--color-cta-text)]"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {t}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default function LandingPage() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center p-5 bg-[var(--color-bg)]">
      <View className="w-full mb-6">
        <ThemeSwitcher />
      </View>

      <Text className="text-3xl font-bold mb-10 text-[var(--color-text)]">
        Cancer Compass
      </Text>

      <Pressable
        className="w-full p-4 rounded-2xl mb-4 bg-[var(--color-cta)]"
        onPress={() => router.push("/sign-in")}
      >
        <Text className="text-[var(--color-cta-text)] text-center text-lg font-semibold">
          Login
        </Text>
      </Pressable>

      <Pressable
        className="w-full p-4 rounded-2xl mb-4 bg-[var(--color-surface)] border border-[var(--color-border)]"
        onPress={() => router.push("/sign-up")}
      >
        <Text className="text-[var(--color-text)] text-center text-lg font-semibold">
          Sign Up
        </Text>
      </Pressable>
    </View>
  );
}
