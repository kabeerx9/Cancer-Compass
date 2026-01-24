import { Ionicons } from '@expo/vector-icons';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#0D9488';
const BLUE = '#3B82F6';
const RED = '#EF4444';
const SLATE_50 = '#F8FAFC';
const SLATE_100 = '#F1F5F9';
const SLATE_200 = '#E2E8F0';
const SLATE_500 = '#64748B';
const SLATE_800 = '#1E293B';
const PRIMARY_LIGHT = '#F0FDFA';
const BLUE_LIGHT = '#DBEAFE';
const RED_LIGHT = '#FEE2E2';

export default function SettingsPage() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.replace('/sign-in');
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={[styles.iconWrapper, { backgroundColor: BLUE_LIGHT }]}>
              <Ionicons name="person" size={18} color={BLUE} />
            </View>
            <View style={styles.cardTextWrapper}>
              <Text style={styles.cardTitle}>Account</Text>
              <Text style={styles.cardSubtitle}>
                Manage your account settings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={SLATE_500} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View
              style={[styles.iconWrapper, { backgroundColor: PRIMARY_LIGHT }]}
            >
              <Ionicons name="notifications" size={18} color={PRIMARY} />
            </View>
            <View style={styles.cardTextWrapper}>
              <Text style={styles.cardTitle}>Notifications</Text>
              <Text style={styles.cardSubtitle}>
                Configure medication reminders
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={SLATE_500} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View
              style={[styles.iconWrapper, { backgroundColor: PRIMARY_LIGHT }]}
            >
              <Ionicons name="moon" size={18} color={PRIMARY} />
            </View>
            <View style={styles.cardTextWrapper}>
              <Text style={styles.cardTitle}>Appearance</Text>
              <Text style={styles.cardSubtitle}>Theme and display options</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={SLATE_500} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View
              style={[styles.iconWrapper, { backgroundColor: PRIMARY_LIGHT }]}
            >
              <Ionicons name="shield-checkmark" size={18} color={PRIMARY} />
            </View>
            <View style={styles.cardTextWrapper}>
              <Text style={styles.cardTitle}>Privacy</Text>
              <Text style={styles.cardSubtitle}>
                Your data and privacy settings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={SLATE_500} />
          </View>
        </View>

        <View style={styles.spacer} />

        <Pressable
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={RED} />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={RED}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </Pressable>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SLATE_800,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: SLATE_800,
  },
  cardSubtitle: {
    fontSize: 14,
    color: SLATE_500,
    marginTop: 2,
  },
  spacer: {
    flex: 1,
  },
  signOutButton: {
    height: 52,
    backgroundColor: RED_LIGHT,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: RED,
  },
});
