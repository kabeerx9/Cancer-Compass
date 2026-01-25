import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-in'); // Should auto-redirect via _layout guard anyway
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center border-b border-neutral-100 p-4">
          <Pressable
            onPress={() => router.back()}
            className="mr-2 rounded-full p-2 active:bg-neutral-100"
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-xl font-bold text-neutral-900">Profile</Text>
        </View>

        <View className="mt-10 items-center px-6">
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="size-24 rounded-full border-4 border-neutral-50"
            />
          ) : (
            <View className="mb-4 size-24 items-center justify-center rounded-full border-4 border-neutral-50 bg-primary-100">
              <Text className="text-4xl font-bold text-primary-600">
                {user?.firstName?.charAt(0) ||
                  user?.emailAddresses[0]?.emailAddress?.charAt(0) ||
                  'U'}
              </Text>
            </View>
          )}

          <Text className="mt-4 text-2xl font-bold text-neutral-900">
            {user?.fullName || 'User'}
          </Text>
          <Text className="mt-1 text-neutral-500">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        <View className="mt-12 px-6">
          <Pressable
            className="mb-4 flex-row items-center rounded-2xl border border-neutral-100 bg-white p-4 active:bg-neutral-50"
            onPress={handleSignOut}
          >
            <View className="mr-4 size-10 items-center justify-center rounded-full bg-red-50">
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            </View>
            <Text className="flex-1 text-base font-semibold text-red-600">
              Sign Out
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-end pb-8">
          <Text className="text-xs text-neutral-400">
            Cancer Compass v1.0.0
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
