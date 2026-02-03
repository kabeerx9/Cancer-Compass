import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  if (!isUserLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-orange-50">
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (err) {
              console.error('Sign out error', err);
            }
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences & account',
      icon: 'settings-outline',
      iconBg: 'bg-teal-100',
      iconColor: '#14B8A6',
      onPress: () => router.push('/settings'),
      showArrow: true,
    },
    {
      id: 'quick-info',
      title: 'Patient Info',
      subtitle: 'Personal details & contacts',
      icon: 'document-text-outline',
      iconBg: 'bg-indigo-50',
      iconColor: '#6366F1',
      onPress: () => router.push('/quick-info'),
      showArrow: true,
    },
    {
      id: 'templates',
      title: 'Templates',
      subtitle: 'Manage day templates',
      icon: 'duplicate-outline',
      iconBg: 'bg-amber-100',
      iconColor: '#F59E0B',
      onPress: () => router.push('/manage-templates'),
      showArrow: true,
    },
    {
      id: 'calendar',
      title: 'Calendar',
      subtitle: 'View schedule & assignments',
      icon: 'calendar-outline',
      iconBg: 'bg-indigo-100',
      iconColor: '#8B5CF6',
      onPress: () => router.push('/calendar'),
      showArrow: true,
    },
    {
      id: 'signout',
      title: 'Sign Out',
      icon: 'log-out-outline',
      iconBg: 'bg-rose-100',
      iconColor: '#F43F5E',
      onPress: handleSignOut,
      showArrow: false,
    },
  ];

  const firstName = user?.firstName || 'User';
  const lastName = user?.lastName || '';
  const fullName = user?.fullName || `${firstName} ${lastName}`.trim() || 'User';
  const email = user?.primaryEmailAddress?.emailAddress || '';
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-orange-50">
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View className="items-center pt-8 pb-6">
            <View className="mb-4">
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  className="w-25 h-25 rounded-full border-4 border-white"
                  style={{ width: 100, height: 100 }}
                />
              ) : (
                <View
                  className="w-25 h-25 rounded-full bg-teal-500 justify-center items-center border-4 border-white"
                  style={{ width: 100, height: 100 }}
                >
                  <Text className="text-4xl font-extrabold text-white">{initial}</Text>
                </View>
              )}
            </View>

            <Text className="text-2xl font-extrabold text-stone-800 mb-1">{fullName}</Text>
            {email ? <Text className="text-sm text-stone-400">{email}</Text> : null}
          </View>

          {/* Menu Items */}
          <View className="px-6 gap-2">
            {menuItems.map((item) => (
              <Pressable
                key={item.id}
                className="flex-row items-center bg-white rounded-xl p-4 border border-stone-200 active:bg-stone-50"
                onPress={item.onPress}
              >
                <View className={`w-11 h-11 rounded-xl justify-center items-center mr-4 ${item.iconBg}`}>
                  <Ionicons name={item.icon} size={22} color={item.iconColor} />
                </View>

                <View className="flex-1">
                  <Text className="text-base font-bold text-stone-800 mb-0.5">{item.title}</Text>
                  {item.subtitle ? (
                    <Text className="text-sm text-stone-400">{item.subtitle}</Text>
                  ) : null}
                </View>

                {item.showArrow ? (
                  <Ionicons name="chevron-forward" size={20} color="#B8A89A" />
                ) : null}
              </Pressable>
            ))}
          </View>

          {/* Version */}
          <View className="items-center mt-8 py-4">
            <Text className="text-sm text-stone-400 font-semibold">Cancer Compass v1.0</Text>
            <Text className="text-xs text-stone-400 mt-1">Built with care for your journey</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
