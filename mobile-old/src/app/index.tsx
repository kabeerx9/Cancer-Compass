import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Uniwind, useUniwind } from "uniwind";

const ThemeSwitcher = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const activeTheme = hasAdaptiveThemes ? "system" : theme;

  return (
    <View className="w-full rounded-card p-4 bg-surface border border-border">
      <Text className="text-text text-sm font-semibold mb-3">
        Theme: {activeTheme}
      </Text>

      <View className="flex-row gap-2">
        {(["light", "dark", "system"] as const).map((t) => {
          const isActive = activeTheme === t;

          return (
            <Pressable
              key={t}
              onPress={() => Uniwind.setTheme(t)}
              className={`px-3 py-2 rounded-chip ${
                isActive ? "bg-cta" : "bg-chip"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isActive ? "text-cta-text" : "text-text-muted"
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
    <View className="flex-1 justify-center items-center p-5 bg-bg">
      <View className="w-full mb-4">
        <ThemeSwitcher />
      </View>

      <View className="w-full rounded-card bg-surface border border-border p-6 shadow-lg">
        <Text className="text-display leading-display font-bold text-center text-text">
          Welcome Back
        </Text>
        <Text className="mt-2 text-center text-text-muted">
          Cancer Compass
        </Text>

        <Pressable
          className="w-full mt-6 p-4 rounded-button bg-cta"
          onPress={() => router.push("/sign-in")}
        >
          <Text className="text-cta-text text-center text-lg font-semibold">
            Log in
          </Text>
        </Pressable>

        <Pressable
          className="w-full mt-3 p-4 rounded-button bg-surface border border-border"
          onPress={() => router.push("/sign-up")}
        >
          <Text className="text-text text-center text-lg font-semibold">
            Sign up
          </Text>
        </Pressable>

        <Text className="mt-4 text-center text-text-soft text-caption">
          New here? Create your account in seconds.
        </Text>
      </View>
    </View>
  );
}
