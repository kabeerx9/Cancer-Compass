import * as React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useClerk } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsPage() {
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
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 p-5">
        <Text className="text-2xl font-bold text-text mb-6">Settings</Text>

        <View className="bg-surface rounded-2xl p-4 mb-4">
          <Text className="text-lg font-semibold text-text mb-2">Account</Text>
          <Text className="text-text-muted">Manage your account settings</Text>
        </View>

        <View className="bg-surface rounded-2xl p-4 mb-4">
          <Text className="text-lg font-semibold text-text mb-2">Notifications</Text>
          <Text className="text-text-muted">Configure medication reminders</Text>
        </View>

        <View className="flex-1" />

        <Pressable
          className="h-[52px] bg-red-500 rounded-2xl justify-center items-center"
          onPress={handleSignOut}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-base font-semibold">
              Sign Out
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
