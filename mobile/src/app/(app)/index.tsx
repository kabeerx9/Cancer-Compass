import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  type Medication,
  medicationMutations,
  medicationQueries,
} from '@/features/medications';
import { MedicationCardSkeleton, StatCardSkeleton } from '@/components/skeleton';

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
  success: '#10B981',
  border: '#E8E0D8',
  shadow: 'rgba(45, 40, 36, 0.08)',
};

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [isManuallyRefreshing, setIsManuallyRefreshing] = React.useState(false);

  const {
    data: medications = [],
    isLoading,
    refetch,
  } = useQuery(medicationQueries.today());
  const logMutation = useMutation(medicationMutations.log(queryClient));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogMedication = (
    medicationId: string,
    status: 'taken' | 'skipped'
  ) => {
    logMutation.mutate(
      { id: medicationId, status },
      {
        onSuccess: () => {
          const medication = medications.find(m => m.id === medicationId);
          const medName = medication?.name || 'Medication';
          if (status === 'taken') {
            Toast.show({
              type: 'success',
              text1: `${medName} marked as taken`,
              text2: 'Great job! Keep it up 👍',
              position: 'bottom',
              visibilityTime: 2000,
            });
          } else {
            Toast.show({
              type: 'info',
              text1: `${medName} skipped`,
              position: 'bottom',
              visibilityTime: 2000,
            });
          }
        },
        onError: () => {
          Toast.show({
            type: 'error',
            text1: 'Failed to log medication',
            text2: 'Please try again',
            position: 'bottom',
          });
        },
      }
    );
  };

  const handleRefresh = () => {
    setIsManuallyRefreshing(true);
    refetch();
    // Reset manual refresh state after refetch completes (approximate timing)
    setTimeout(() => setIsManuallyRefreshing(false), 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.firstName || 'there';

  const takenCount = medications.filter(
    (m) => m.todayStatus === 'taken'
  ).length;
  const totalCount = medications.length;
  const progress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  const renderMedicationItem = ({
    item: medication,
    index,
  }: {
    item: Medication;
    index: number;
  }) => {
    const translateY = fadeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0],
    });

    return (
      <Animated.View
        style={[
          styles.card,
          medication.todayStatus === 'taken' && styles.cardTaken,
          medication.todayStatus === 'skipped' && styles.cardSkipped,
          { transform: [{ translateY }] },
        ]}
      >
        <View style={styles.cardContent}>
          <View
            style={[
              styles.iconBox,
              medication.todayStatus === 'taken' && styles.iconBoxTaken,
            ]}
          >
            <Ionicons
              name={
                medication.todayStatus === 'taken'
                  ? 'checkmark-circle'
                  : 'medical'
              }
              size={20}
              color={
                medication.todayStatus === 'taken' ? '#10B981' : THEME.primary
              }
            />
          </View>

          <View style={styles.medInfo}>
            <Text style={styles.medName}>{medication.name}</Text>
            {medication.dosage && (
              <Text style={styles.medDose}>{medication.dosage}</Text>
            )}
            {medication.timeLabel && (
              <Text style={styles.labelText}>{medication.timeLabel}</Text>
            )}
          </View>

          <View style={styles.rightSection}>
            {medication.time && (
              <Text style={styles.timeText}>{medication.time}</Text>
            )}

            {medication.todayStatus ? (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      medication.todayStatus === 'taken'
                        ? '#DCFCE7'
                        : '#F5F0EB',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        medication.todayStatus === 'taken'
                          ? '#10B981'
                          : THEME.textMuted,
                    },
                  ]}
                >
                  {medication.todayStatus === 'taken' ? 'Done' : 'Skipped'}
                </Text>
              </View>
            ) : (
              <View style={styles.buttons}>
                <Pressable
                  style={styles.skipBtn}
                  onPress={() => handleLogMedication(medication.id, 'skipped')}
                >
                  <Ionicons name="close-outline" size={16} color={THEME.textMuted} />
                </Pressable>
                <Pressable
                  style={styles.takeBtn}
                  onPress={() => handleLogMedication(medication.id, 'taken')}
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  // Loading skeleton view
  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header Skeleton */}
          <View style={styles.header}>
            <View>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: 150, marginTop: 8 }]} />
            </View>
            <View style={[styles.skeletonLine, { width: 48, height: 48, borderRadius: 24 }]} />
          </View>

          {/* Progress Card Skeleton */}
          <StatCardSkeleton />

          {/* Section Title Skeleton */}
          <View style={styles.sectionHeader}>
            <View style={[styles.skeletonLine, { width: 180, height: 28 }]} />
          </View>

          {/* Medication Cards Skeleton */}
          <View style={styles.listContent}>
            <MedicationCardSkeleton />
            <MedicationCardSkeleton />
            <MedicationCardSkeleton />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header with greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.title}>{firstName}</Text>
          </View>
          <Pressable
            style={styles.avatar}
            onPress={() => router.push('/profile')}
          >
            <LinearGradient
              colors={[THEME.primary, '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {firstName[0].toUpperCase()}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Patient Info Quick Access */}
        <View style={styles.patientInfoSection}>
          <Pressable
            style={styles.patientInfoCard}
            onPress={() => router.push('/quick-info')}
          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.patientInfoGradient}
            >
              <View style={styles.patientInfoLeft}>
                <View style={styles.patientIconContainer}>
                  <Ionicons name="person-circle" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.patientInfoText}>
                  <Text style={styles.patientInfoTitle}>Patient Info</Text>
                  <Text style={styles.patientInfoSubtitle}>Medical details & contacts</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </View>

        {/* Warm progress card */}
        {totalCount > 0 && (
          <View style={styles.progressSection}>
            <LinearGradient
              colors={[THEME.primary, '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.progressCard}
            >
              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.progressLabel}>Daily Progress</Text>
                  <Text style={styles.progressCount}>
                    {takenCount} of {totalCount} done
                  </Text>
                </View>
                <View style={styles.progressPercentBox}>
                  <Text style={styles.progressPercent}>
                    {Math.round(progress)}%
                  </Text>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[styles.progressBarFill, { width: `${progress}%` }]}
                />
              </View>
              {progress === 100 && (
                <View style={styles.celebrationBadge}>
                  <Ionicons name="happy-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.celebrationText}>All done! 🎉</Text>
                </View>
              )}
            </LinearGradient>
          </View>
        )}

        {/* Medications list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Medications</Text>
        </View>

        <FlatList
          data={medications}
          renderItem={renderMedicationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isManuallyRefreshing}
              onRefresh={handleRefresh}
              tintColor={THEME.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="medical-outline"
                  size={48}
                  color={THEME.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySub}>
                No medications scheduled for today
              </Text>
            </View>
          }
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  },

  // Skeleton
  skeletonLine: {
    backgroundColor: '#E8E0D8',
    borderRadius: 8,
    height: 20,
    width: 100,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
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
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Progress Section
  progressSection: {
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  progressCard: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  progressCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  progressPercentBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  celebrationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  celebrationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Patient Info Card
  patientInfoSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  patientInfoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  patientInfoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  patientInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientInfoText: {
    flex: 1,
  },
  patientInfoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  patientInfoSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Section Header
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.textHeading,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  // Medication Card
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTaken: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  cardSkipped: {
    opacity: 0.5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: THEME.primaryLight,
  },
  iconBoxTaken: {
    backgroundColor: '#DCFCE7',
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 2,
  },
  medDose: {
    fontSize: 13,
    color: THEME.textBody,
    fontWeight: '500',
  },
  labelText: {
    fontSize: 12,
    color: THEME.textMuted,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textBody,
  },

  buttons: {
    flexDirection: 'row',
    gap: 6,
  },
  skipBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  takeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  takeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    color: THEME.textBody,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },
});
