import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  type Medication,
  medicationMutations,
  medicationQueries,
} from '@/features/medications';

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

  const {
    data: medications = [],
    isLoading,
    refetch,
    isRefetching,
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
    logMutation.mutate({ id: medicationId, status });
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

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
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor:
                    medication.todayStatus === 'taken'
                      ? '#DCFCE7'
                      : THEME.primaryLight,
                },
              ]}
            >
              <Ionicons
                name={
                  medication.todayStatus === 'taken'
                    ? 'checkmark-circle'
                    : 'medical'
                }
                size={24}
                color={
                  medication.todayStatus === 'taken' ? '#10B981' : THEME.primary
                }
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.medName}>{medication.name}</Text>
              {medication.dosage && (
                <Text style={styles.medDose}>{medication.dosage}</Text>
              )}
            </View>

            {medication.time && (
              <View style={styles.timePill}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={THEME.textMuted}
                />
                <Text style={styles.timeText}>{medication.time}</Text>
              </View>
            )}
          </View>

          <View style={styles.cardActions}>
            <View style={styles.leftTags}>
              {medication.timeLabel && (
                <Text style={styles.labelText}>{medication.timeLabel}</Text>
              )}
            </View>

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
                <Ionicons
                  name={
                    medication.todayStatus === 'taken'
                      ? 'checkmark-circle'
                      : 'close-circle'
                  }
                  size={18}
                  color={
                    medication.todayStatus === 'taken'
                      ? '#10B981'
                      : THEME.textMuted
                  }
                />
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
                  <Ionicons
                    name="close-outline"
                    size={18}
                    color={THEME.textMuted}
                  />
                </Pressable>
                <Pressable
                  style={styles.takeBtn}
                  onPress={() => handleLogMedication(medication.id, 'taken')}
                >
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  <Text style={styles.takeText}>Take</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

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
            onPress={() => router.push('/(tabs)/(app)/profile')}
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
              refreshing={isRefetching}
              onRefresh={refetch}
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
    backdropFilter: 'blur(10px)',
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
    backdropFilter: 'blur(10px)',
  },
  celebrationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
    borderRadius: 20,
    marginBottom: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTaken: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  cardSkipped: {
    opacity: 0.5,
  },
  cardContent: {
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  medName: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 4,
  },
  medDose: {
    fontSize: 14,
    color: THEME.textBody,
    fontWeight: '500',
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.background,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textBody,
  },

  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  leftTags: {
    flex: 1,
  },
  labelText: {
    fontSize: 13,
    color: THEME.textMuted,
    fontWeight: '600',
  },

  buttons: {
    flexDirection: 'row',
    gap: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.primary,
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 12,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  takeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
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
