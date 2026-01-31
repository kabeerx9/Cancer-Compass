import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Warm Healing Theme
const THEME = {
  primary: '#14B8A6', // Warm Teal
  primaryLight: '#CCFBF1',
  secondary: '#F43F5E', // Warm Coral
  background: '#FFFBF9', // Warm cream
  surface: '#FFFFFF',
  textHeading: '#2D2824',
  textBody: '#6B5D50',
  textMuted: '#B8A89A',
  border: '#E8E0D8',
  shadow: 'rgba(45, 40, 36, 0.08)',
};

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  route: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'insights',
    title: 'Insights',
    subtitle: 'View symptom history & AI summaries',
    icon: 'analytics',
    gradient: ['#14B8A6', '#0D9488'],
    route: '/insights',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    subtitle: 'Manage templates & view schedule',
    icon: 'calendar',
    gradient: ['#8B5CF6', '#7C3AED'],
    route: '/calendar',
  },
  {
    id: 'templates',
    title: 'Templates',
    subtitle: 'Create & manage day templates',
    icon: 'duplicate',
    gradient: ['#F59E0B', '#D97706'],
    route: '/manage-templates',
  },
  {
    id: 'quick-info',
    title: 'Quick Reference',
    subtitle: 'Patient info & emergency contacts',
    icon: 'information-circle',
    gradient: ['#3B82F6', '#2563EB'],
    route: '/quick-info',
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'App preferences & profile',
    icon: 'settings',
    gradient: ['#6B7280', '#4B5563'],
    route: '/settings',
  },
];

export default function MorePage() {
  const router = useRouter();

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Additional</Text>
            <Text style={styles.headerTitle}>Features</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.springify()}>
            {menuItems.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 80).springify()}
              >
                <Pressable
                  style={styles.menuCard}
                  onPress={() => handleNavigate(item.route)}
                >
                  <LinearGradient
                    colors={item.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconContainer}
                  >
                    <Ionicons name={item.icon} size={28} color="#FFFFFF" />
                  </LinearGradient>

                  <View style={styles.contentContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={THEME.textMuted}
                  />
                </Pressable>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Version Info */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Cancer Compass v1.0</Text>
            <Text style={styles.versionSubtext}>Built with care</Text>
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
    paddingVertical: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.textMuted,
    fontWeight: '600',
    marginBottom: 4,
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
    paddingBottom: 32,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.textMuted,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
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
