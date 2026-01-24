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
        <View className="px-4 py-4 flex-row items-center border-b border-neutral-100">
           <Pressable onPress={() => router.back()} className="p-2 rounded-full active:bg-neutral-100 mr-2">
             <Ionicons name="arrow-back" size={24} color="#111827" />
           </Pressable>
           <Text className="text-xl font-bold text-neutral-900">Profile</Text>
        </View>

        <View className="items-center mt-10 px-6">
           {user?.imageUrl ? (
             <Image
               source={{ uri: user.imageUrl }}
               className="w-24 h-24 rounded-full border-4 border-neutral-50"
             />
           ) : (
             <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center border-4 border-neutral-50 mb-4">
               <Text className="text-4xl font-bold text-primary-600">
                 {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
               </Text>
             </View>
           )}

           <Text className="text-2xl font-bold text-neutral-900 mt-4">
             {user?.fullName || 'User'}
           </Text>
           <Text className="text-neutral-500 mt-1">
             {user?.primaryEmailAddress?.emailAddress}
           </Text>
        </View>

        <View className="mt-12 px-6">
           <Pressable
             className="flex-row items-center bg-white p-4 rounded-2xl border border-neutral-100 mb-4 active:bg-neutral-50"
             onPress={handleSignOut}
           >
             <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center mr-4">
               <Ionicons name="log-out-outline" size={24} color="#EF4444" />
             </View>
             <Text className="text-base font-semibold text-red-600 flex-1">Sign Out</Text>
             <Ionicons name="chevron-forward" size={20} color="#EF4444" />
           </Pressable>
        </View>

        <View className="flex-1 justify-end pb-8 items-center">
          <Text className="text-neutral-400 text-xs">Cancer Compass v1.0.0</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
