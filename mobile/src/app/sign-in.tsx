import { useSignIn } from '@clerk/clerk-expo';
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

export default function SignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const onSignInPress = async () => {
    if (!isLoaded) return;

    setError('');
    setIsLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/(app)');
      } else {
        setError('Sign in incomplete. Please try again.');
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(
        clerkError?.errors?.[0]?.message ||
          'Invalid email or password. Please try again.'
      );
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-lg">
          <Text className="mb-2 text-center text-3xl font-bold text-slate-800">
            Welcome Back
          </Text>
          <Text className="mb-6 text-center text-base text-slate-500">
            Log in to continue
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
            onPress={onSignInPress}
            disabled={isLoading || !emailAddress || !password}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-semibold text-white">Log in</Text>
            )}
          </Pressable>

          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-slate-500">
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={() => router.push('/sign-up')}>
              <Text className="text-sm font-semibold text-primary-600">
                Sign up
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
