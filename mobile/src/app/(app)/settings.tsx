import { useClerk } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  danger?: boolean;
}

export default function SettingsPage() {
  const { signOut } = useClerk();
  const router = useRouter();

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
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  const settingItems: SettingItem[] = [
    {
      id: 'profile',
      title: 'Edit Profile',
      icon: 'person-outline',
      onPress: () => {},
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => {},
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-outline',
      onPress: () => {},
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => {},
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => {},
    },
    {
      id: 'signout',
      title: 'Sign Out',
      icon: 'log-out-outline',
      onPress: handleSignOut,
      danger: true,
    },
  ];

  return (
    <View className="flex-1 bg-[#FFFBF9]">
      <SafeAreaView className="flex-1">
        {/* Header with back button */}
        <View className="flex-row items-center px-6 pt-5 pb-4 gap-3">
          <Pressable
            onPress={() => router.back()}
            className="p-2 -ml-2 active:opacity-60"
          >
            <Ionicons name="arrow-back" size={24} className="text-gray-900" />
          </Pressable>
          <Text className="text-[28px] font-extrabold text-gray-900 tracking-tight">
            Settings
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-4"
          showsVerticalScrollIndicator={false}
        >
          {settingItems.map((item) => (
          <Pressable
            key={item.id}
            className="flex-row items-center bg-white rounded-xl p-4 mb-2 border border-gray-200 active:bg-gray-50 active:scale-[0.98]"
            onPress={item.onPress}
          >
              <View className="w-10 h-10 rounded-[10px] bg-teal-100 justify-center items-center mr-4">
                <Ionicons
                  name={item.icon}
                  size={22}
                  className={item.danger ? 'text-rose-500' : 'text-teal-500'}
                />
              </View>
              <Text
                className={`flex-1 text-base font-semibold text-gray-900 ${item.danger ? 'text-rose-500' : ''}`}
              >
                {item.title}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                className="text-gray-400"
              />
            </Pressable>
          ))}

          {/* Version Info */}
          <View className="items-center mt-8 py-4">
            <Text className="text-sm text-gray-400 font-semibold">
              Version 1.0.0
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              © 2025 Cancer Compass
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
