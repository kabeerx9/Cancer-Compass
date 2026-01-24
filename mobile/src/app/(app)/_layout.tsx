/* eslint-disable react/no-unstable-nested-components */
import { Ionicons } from '@expo/vector-icons';
import { Redirect, SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@clerk/clerk-expo';
import { useIsFirstTime } from '@/lib';

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isFirstTime] = useIsFirstTime();

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, isLoaded]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#0D9488', // primary-600
        tabBarInactiveTintColor: '#94A3B8', // slate-400
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          tabBarButtonTestID: 'home-tab',
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Medications',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medical-outline" size={size} color={color} />
          ),
          tabBarButtonTestID: 'medications-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
          tabBarButtonTestID: 'settings-tab',
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FAFAFA',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    height: 85,
    paddingTop: 8,
    paddingBottom: 28,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
