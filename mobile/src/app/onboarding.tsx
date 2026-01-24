import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useIsFirstTime } from '@/lib/hooks';

const PRIMARY = '#0D9488';
const SLATE_50 = '#F8FAFC';
const SLATE_500 = '#64748B';
const SLATE_800 = '#1E293B';

export default function Onboarding() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();

  const handleGetStarted = () => {
    setIsFirstTime(false);
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={64} color={PRIMARY} />
          </View>
          <Text style={styles.title}>Cancer Compass</Text>
          <Text style={styles.subtitle}>
            Your personal medication & wellness companion
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="medical-outline" size={24} color={PRIMARY} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Track Medications</Text>
              <Text style={styles.featureDescription}>
                Never miss a dose with smart reminders
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="calendar-outline" size={24} color={PRIMARY} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Daily Schedule</Text>
              <Text style={styles.featureDescription}>
                Organize your medications by time of day
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="analytics-outline" size={24} color={PRIMARY} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Progress Tracking</Text>
              <Text style={styles.featureDescription}>
                Monitor your adherence over time
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="shield-checkmark-outline" size={24} color={PRIMARY} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Secure & Private</Text>
              <Text style={styles.featureDescription}>
                Your health data stays safe and private
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <Pressable
            style={styles.ctaButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SLATE_50,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: SLATE_800,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: SLATE_500,
    textAlign: 'center',
  },
  featuresSection: {
    flex: 1,
    paddingTop: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SLATE_800,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: SLATE_500,
  },
  ctaSection: {
    paddingVertical: 24,
  },
  ctaButton: {
    backgroundColor: PRIMARY,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});
