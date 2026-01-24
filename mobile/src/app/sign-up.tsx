import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setError('');
    setIsLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName: fullName.split(' ')[0] || fullName,
        lastName: fullName.split(' ').slice(1).join(' ') || '',
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(
        clerkError?.errors?.[0]?.message ||
          'Something went wrong. Please try again.'
      );
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setError('');
    setIsLoading(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/(app)');
      } else {
        setError('Verification incomplete. Please try again.');
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(
        clerkError?.errors?.[0]?.message ||
          'Invalid verification code. Please try again.'
      );
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-lg">
            <Text className="mb-2 text-center text-3xl font-bold text-slate-800">
              Verify your email
            </Text>
            <Text className="mb-6 text-center text-base text-slate-500">
              We sent a verification code to {emailAddress}
            </Text>

            {error ? (
              <View className="mb-4 rounded-lg border border-danger-200 bg-danger-50 p-3">
                <Text className="text-center text-sm text-danger-600">
                  {error}
                </Text>
              </View>
            ) : null}

            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-slate-600">
                Verification Code
              </Text>
              <TextInput
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-lg tracking-widest text-slate-800"
                placeholder="000000"
                placeholderTextColor="#94A3B8"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            <Pressable
              className="mb-5 h-[52px] items-center justify-center rounded-xl bg-primary-600 shadow-sm"
              onPress={onVerifyPress}
              disabled={isLoading || !code}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  Verify Email
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setPendingVerification(false);
                setCode('');
                setError('');
              }}
            >
              <Text className="text-center text-sm text-slate-500 underline">
                Back to sign up
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-lg">
          <Text className="mb-2 text-center text-3xl font-bold text-slate-800">
            Create Account
          </Text>
          <Text className="mb-6 text-center text-base text-slate-500">
            Join Cancer Compass
          </Text>

          {error ? (
            <View className="mb-4 rounded-lg border border-danger-200 bg-danger-50 p-3">
              <Text className="text-center text-sm text-danger-600">
                {error}
              </Text>
            </View>
          ) : null}

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-slate-600">
              Full Name
            </Text>
            <TextInput
              className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-800"
              placeholder="Jordan Lee"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-slate-600">
              E-mail
            </Text>
            <TextInput
              className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-800"
              placeholder="hello@domain.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailAddress}
              onChangeText={setEmailAddress}
            />
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-slate-600">
              Password
            </Text>
            <TextInput
              className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-800"
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable
            className="mb-5 h-[52px] items-center justify-center rounded-xl bg-primary-600 shadow-sm"
            onPress={onSignUpPress}
            disabled={isLoading || !emailAddress || !password || !fullName}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-semibold text-white">
                Sign up
              </Text>
            )}
          </Pressable>

          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-slate-500">
              Already have an account?{' '}
            </Text>
            <Pressable onPress={() => router.push('/sign-in')}>
              <Text className="text-sm font-semibold text-primary-600">
                Log in
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
