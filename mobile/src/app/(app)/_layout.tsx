import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsFirstTime } from '@/lib';

// Theme colors from our palette
const ACTIVE_COLOR = '#14B8A6'; // Warm Teal
const INACTIVE_COLOR = '#9CA3AF'; // neutral-400
const ACTIVE_BG_COLOR = '#CCFBF1'; // Light Teal for active tab background

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isFirstTime] = useIsFirstTime();
  const { bottom } = useSafeAreaInsets();

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  // Calculate dynamic tab bar height and padding based on safe area
  // Using position: absolute, so we need proper bottom padding for system nav bar
  const tabBarPaddingBottom = Math.max(Platform.OS === 'ios' ? 28 : 12, bottom);
  const tabBarHeight = 64 + tabBarPaddingBottom;

  return (
    <>
      <StatusBar style="dark" />
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: [styles.tabBar, { paddingBottom: tabBarPaddingBottom, height: tabBarHeight }],
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: styles.tabBarLabel,

        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      {/* Main Tab: Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Main Tab: Tasks */}
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'checkbox' : 'checkbox-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Main Tab: Cabinet (Medications + SOS) */}
      <Tabs.Screen
        name="cabinet"
        options={{
          title: 'Cabinet',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'medical' : 'medical-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Main Tab: Health (Insights) */}
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Health',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Main Tab: Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden Screens - Internal Navigation Only */}
      <Tabs.Screen
        name="calendar"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="manage-templates"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="quick-info"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="sos-medicines"
        options={{
          href: null,
        }}
      />
    </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E8E0D8',
    borderTopWidth: 1,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabBarItem: {
    borderRadius: 12,
    marginHorizontal: 4,
    paddingVertical: 4,
  },
});
