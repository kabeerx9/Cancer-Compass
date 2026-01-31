import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import {
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
};

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'templates',
    title: 'Templates',
    subtitle: 'Create & manage day templates',
    icon: 'duplicate',
    route: '/manage-templates',
  },
  {
    id: 'quick-info',
    title: 'Patient Info',
    subtitle: 'Personal details & contacts',
    icon: 'information-circle',
    route: '/quick-info',
  },
  {
    id: 'help',
    title: 'Help & Support',
    subtitle: 'Get assistance with the app',
    icon: 'help-circle',
    route: '/help',
  },
];

export default function MorePage() {
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
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              style={styles.menuCard}
              onPress={() => {}}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={24} color={THEME.primary} />
              </View>

              <View style={styles.contentContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={THEME.textMuted}
              />
            </Pressable>
          ))}

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
    paddingTop: 20,
    paddingBottom: 16,
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
    paddingBottom: 16, // Reduced from 32
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
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: THEME.primaryLight,
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
