import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useIsFirstTime } from '@/lib/hooks';

export default function Onboarding() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();

  const handleGetStarted = () => {
    setIsFirstTime(false);
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="flex-1 px-6">
        {/* Hero Section */}
        <View className="items-center pt-10 pb-8">
          <View className="w-[120px] h-[120px] rounded-[60px] bg-teal-50 justify-center items-center mb-6">
            <Ionicons name="heart" size={64} color="#0D9488" />
          </View>
          <Text className="text-[32px] font-bold text-neutral-800 mb-2">
            Cancer Compass
          </Text>
          <Text className="text-base text-neutral-500 text-center">
            Your personal medication & wellness companion
          </Text>
        </View>

        {/* Features List */}
        <View className="flex-1 pt-4">
          <View className="flex-row items-center mb-5 bg-white p-4 rounded-2xl shadow-sm">
            <View className="w-12 h-12 rounded-xl bg-teal-50 justify-center items-center mr-4">
              <Ionicons name="medical-outline" size={24} color="#0D9488" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-neutral-800 mb-1">
                Track Medications
              </Text>
              <Text className="text-sm text-neutral-500">
                Never miss a dose with smart reminders
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-5 bg-white p-4 rounded-2xl shadow-sm">
            <View className="w-12 h-12 rounded-xl bg-teal-50 justify-center items-center mr-4">
              <Ionicons name="calendar-outline" size={24} color="#0D9488" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-neutral-800 mb-1">
                Daily Schedule
              </Text>
              <Text className="text-sm text-neutral-500">
                Organize your medications by time of day
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-5 bg-white p-4 rounded-2xl shadow-sm">
            <View className="w-12 h-12 rounded-xl bg-teal-50 justify-center items-center mr-4">
              <Ionicons name="analytics-outline" size={24} color="#0D9488" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-neutral-800 mb-1">
                Progress Tracking
              </Text>
              <Text className="text-sm text-neutral-500">
                Monitor your adherence over time
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-5 bg-white p-4 rounded-2xl shadow-sm">
            <View className="w-12 h-12 rounded-xl bg-teal-50 justify-center items-center mr-4">
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color="#0D9488"
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-neutral-800 mb-1">
                Secure & Private
              </Text>
              <Text className="text-sm text-neutral-500">
                Your health data stays safe and private
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <View className="py-6">
          <Pressable
            className="bg-teal-600 h-14 rounded-2xl flex-row justify-center items-center shadow-lg shadow-teal-600/30 active:scale-95 active:bg-teal-700"
            onPress={handleGetStarted}
          >
            <Text className="text-lg font-bold text-white mr-2">Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
