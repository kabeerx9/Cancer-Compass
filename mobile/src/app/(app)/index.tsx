import * as React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useClerk } from "@clerk/clerk-expo";
import { router } from "expo-router";

export default function HomePage() {
  const { signOut } = useClerk();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.replace("/");
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-bg">
      <View className="w-full max-w-[360px] rounded-card bg-surface p-5 shadow-card">
        <Text className="text-title leading-title font-semibold text-text mb-2">
          Home
        </Text>
        <Text className="text-body leading-body text-text-muted mb-6">
          You are authenticated!
        </Text>

        <Pressable
          className="h-[52px] bg-cta rounded-button shadow-button justify-center items-center"
          onPress={handleSignOut}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-cta-text text-body leading-body font-semibold">
              Sign Out
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
