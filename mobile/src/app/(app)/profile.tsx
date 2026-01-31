import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Warm Healing Theme
const THEME = {
  primary: '#14B8A6',
  primaryLight: '#CCFBF1',
  background: '#FFFBF9',
  surface: '#FFFFFF',
  textHeading: '#2D2824',
  textBody: '#6B5D50',
  textMuted: '#B8A89A',
  border: '#E8E0D8',
  danger: '#F43F5E',
};

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  onPress: () => void;
  showArrow?: boolean;
}

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { user } = useUser();
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
      iconBg: THEME.primaryLight,
      iconColor: THEME.primary,
      onPress: () => router.push('/settings'),
      showArrow: true,
    },
    {
      id: 'quick-info',
      title: 'Patient Info',
      subtitle: 'Personal details & contacts',
      icon: 'document-text-outline',
      iconBg: '#EEF2FF',
      iconColor: '#6366F1',
      onPress: () => router.push('/quick-info'),
      showArrow: true,
    },
    {
      id: 'templates',
      title: 'Templates',
      subtitle: 'Manage day templates',
      icon: 'duplicate-outline',
      iconBg: '#FEF3C7',
      iconColor: '#F59E0B',
      onPress: () => router.push('/manage-templates'),
      showArrow: true,
    },
    {
      id: 'calendar',
      title: 'Calendar',
      subtitle: 'View schedule & assignments',
      icon: 'calendar-outline',
      iconBg: '#E0E7FF',
      iconColor: '#8B5CF6',
      onPress: () => router.push('/calendar'),
      showArrow: true,
    },
    {
      id: 'signout',
      title: 'Sign Out',
      icon: 'log-out-outline',
      iconBg: '#FFE4E6',
      iconColor: THEME.danger,
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
              )}
            </View>

            <Text style={styles.name}>{fullName}</Text>
            {email ? <Text style={styles.email}>{email}</Text> : null}
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <Pressable
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={22} color={item.iconColor} />
                </View>

                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  {item.subtitle ? (
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  ) : null}
                </View>

                {item.showArrow ? (
                  <Ionicons name="chevron-forward" size={20} color={THEME.textMuted} />
                ) : null}
              </Pressable>
            ))}
          </View>

          {/* Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Cancer Compass v1.0</Text>
            <Text style={styles.versionSubtext}>Built with care for your journey</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16, // Reduced bottom padding
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: THEME.surface,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: THEME.surface,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.textHeading,
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: THEME.textMuted,
  },

  // Menu
  menuContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: THEME.textMuted,
  },

  // Version
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
