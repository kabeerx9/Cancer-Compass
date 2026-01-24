import * as React from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setError("");
    setIsLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName: fullName.split(" ")[0] || fullName,
        lastName: fullName.split(" ").slice(1).join(" ") || "",
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Something went wrong. Please try again.");
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setError("");
    setIsLoading(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(app)");
      } else {
        setError("Verification incomplete. Please try again.");
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Invalid verification code. Please try again.");
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-bg">
        <View className="w-full max-w-[360px] rounded-card bg-surface p-5 shadow-card">
          <Text className="text-display leading-display font-bold text-center text-text mb-4">
            Verify your email
          </Text>
          <Text className="text-body leading-body text-center text-text-muted mb-6">
            We sent a verification code to {emailAddress}
          </Text>

          {error ? (
            <View className="mb-4 p-3 rounded-input bg-red-50 border border-red-200">
              <Text className="text-body leading-body text-red-600 text-center">
                {error}
              </Text>
            </View>
          ) : null}

          <View className="mb-5">
            <Text className="text-label leading-label text-text-soft mb-2 font-medium">
              Verification Code
            </Text>
            <TextInput
              className="h-12 border border-border px-4 rounded-input text-body leading-body bg-input text-text text-center text-lg tracking-widest"
              placeholder="000000"
              placeholderTextColor="#9A9A9A"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
          </View>

          <Pressable
            className="h-[52px] bg-cta rounded-button shadow-button justify-center items-center mb-5"
            onPress={onVerifyPress}
            disabled={isLoading || !code}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-cta-text text-body leading-body font-semibold">
                Verify Email
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              setPendingVerification(false);
              setCode("");
              setError("");
            }}
          >
            <Text className="text-center text-text-muted text-label leading-label underline">
              Back to sign up
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center p-5 bg-bg">
      <View className="w-full max-w-[360px] rounded-card bg-surface p-5 shadow-card">
        <Text className="text-display leading-display font-bold text-center text-text mb-4">
          Create Account
        </Text>
        <Text className="text-body leading-body text-center text-text-muted mb-6">
          Join Cancer Compass
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
            Full Name
          </Text>
          <TextInput
            className="h-12 border border-border px-4 rounded-input text-body leading-body bg-input text-text"
            placeholder="Jordan Lee"
            placeholderTextColor="#9A9A9A"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

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
          onPress={onSignUpPress}
          disabled={isLoading || !emailAddress || !password || !fullName}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-cta-text text-body leading-body font-semibold">
              Sign up
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
