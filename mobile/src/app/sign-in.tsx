import * as React from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";

export default function SignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;

    setError("");
    setIsLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(app)");
      } else {
        setError("Sign in incomplete. Please try again.");
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Invalid email or password. Please try again.");
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
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

        {error ? (
          <View className="mb-4 p-3 rounded-input bg-red-50 border border-red-200">
            <Text className="text-body leading-body text-red-600 text-center">
              {error}
            </Text>
          </View>
        ) : null}

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
            value={emailAddress}
            onChangeText={setEmailAddress}
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
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <Pressable
          className="h-[52px] bg-cta rounded-button shadow-button justify-center items-center mb-5"
          onPress={onSignInPress}
          disabled={isLoading || !emailAddress || !password}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-cta-text text-body leading-body font-semibold">
              Log in
            </Text>
          )}
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
