import { useClerk } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Warm Healing Theme
const THEME = {
  primary: '#14B8A6', // Warm Teal
  primaryLight: '#CCFBF1',
  background: '#FFFBF9', // Warm cream
  surface: '#FFFFFF',
  textHeading: '#2D2824',
  textBody: '#6B5D50',
  textMuted: '#B8A89A',
  border: '#E8E0D8',
  shadow: 'rgba(45, 40, 36, 0.08)',
  danger: '#F43F5E',
};

interface SettingItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  danger?: boolean;
}

export default function SettingsPage() {
  const { signOut } = useClerk();

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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {settingItems.map((item) => (
            <Pressable
              key={item.id}
              style={styles.settingItem}
              onPress={item.onPress}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.danger ? THEME.danger : THEME.primary}
                />
              </View>
              <Text
                style={[
                  styles.settingTitle,
                  item.danger && styles.dangerText,
                ]}
              >
                {item.title}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={THEME.textMuted}
              />
            </Pressable>
          ))}

          {/* Version Info */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <Text style={styles.versionSubtext}>© 2025 Cancer Compass</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.textHeading,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16, // Reduced padding
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textHeading,
  },
  dangerText: {
    color: THEME.danger,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 14,
    color: THEME.textMuted,
    fontWeight: '600',
  },
  versionSubtext: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 4,
  },
});
