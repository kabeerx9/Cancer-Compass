import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

type TabType = 'medications' | 'sos';

export default function CabinetPage() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = React.useState<TabType>('medications');

  const firstName = user?.firstName || 'there';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.title}>{firstName}</Text>
          </View>
          <Pressable
            style={styles.avatar}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.avatarGradient}>
              <Text style={styles.avatarText}>
                {firstName[0].toUpperCase()}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Top Tabs */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'medications' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('medications')}
          >
            <Ionicons
              name={activeTab === 'medications' ? 'medical' : 'medical-outline'}
              size={20}
              color={activeTab === 'medications' ? '#FFFFFF' : THEME.textBody}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'medications' && styles.tabTextActive,
              ]}
            >
              Medications
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'sos' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('sos')}
          >
            <Ionicons
              name={activeTab === 'sos' ? 'alert-circle' : 'alert-circle-outline'}
              size={20}
              color={activeTab === 'sos' ? '#FFFFFF' : THEME.textBody}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'sos' && styles.tabTextActive,
              ]}
            >
              SOS Medicines
            </Text>
          </Pressable>
        </View>

        {/* Content Area */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'medications' ? (
            <MedicationsContent />
          ) : (
            <SOSContent />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MedicationsContent() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Medications</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/medications')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <Ionicons name="medical" size={24} color={THEME.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Manage Medications</Text>
          <Text style={styles.cardSubtitle}>
            View and manage all your daily medications
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={THEME.textMuted} />
      </View>

      <Pressable
        style={styles.actionCard}
        onPress={() => router.push('/medications')}
      >
        <Text style={styles.actionText}>Go to Medications</Text>
        <Ionicons name="arrow-forward" size={20} color={THEME.primary} />
      </Pressable>
    </View>
  );
}

function SOSContent() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Emergency Medicines</Text>
        <Pressable
          style={[styles.addButton, { backgroundColor: '#F43F5E' }]}
          onPress={() => router.push('/sos')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#F43F5E' }]}>
        <View style={[styles.cardIcon, { backgroundColor: '#FFE4E6' }]}>
          <Ionicons name="alert-circle" size={24} color="#F43F5E" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>SOS Medicine Cabinet</Text>
          <Text style={styles.cardSubtitle}>
            Track medicines you take only when needed
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={THEME.textMuted} />
      </View>

      <Pressable
        style={styles.actionCard}
        onPress={() => router.push('/sos')}
      >
        <Text style={[styles.actionText, { color: '#F43F5E' }]}>
          Go to SOS Medicines
        </Text>
        <Ionicons name="arrow-forward" size={20} color="#F43F5E" />
      </Pressable>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 15,
    color: THEME.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.textHeading,
    letterSpacing: -0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Top Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 8,
  },
  tabActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  tabIcon: {
    marginRight: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textBody,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // Content
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 24,
    paddingBottom: 16, // Reduced bottom padding
  },

  // Section
  section: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.textHeading,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: THEME.textMuted,
  },

  // Action Card
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.primaryLight,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.primary,
  },
});
