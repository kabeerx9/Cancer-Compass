import "../global.css";

import { Stack } from "expo-router";
import { SplashScreenController } from "../splash";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { QueryProvider } from "../providers/query-provider";

export default function Root() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <QueryProvider>
        <SplashScreenController />
        <RootNavigator />
      </QueryProvider>
    </ClerkProvider>
  );
}

function RootNavigator() {
  const { isSignedIn } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
      </Stack.Protected>

      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
