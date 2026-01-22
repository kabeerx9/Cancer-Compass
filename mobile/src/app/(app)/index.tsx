import { View, Text, Pressable } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

export default function HomePage() {
  const { signOut } = useAuth();

  return (
    <View className="flex-1 justify-center items-center p-5 bg-bg">
      <View className="w-full rounded-card bg-surface border border-border p-6 shadow-lg">
        <Text className="text-title leading-title font-semibold text-text">
          Home
        </Text>
        <Text className="mt-2 text-text-muted">
          You are authenticated!
        </Text>

        <Pressable
          className="mt-6 bg-cta px-6 py-3 rounded-button"
          onPress={() => signOut()}
        >
          <Text className="text-cta-text font-semibold text-center">
            Sign Out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
