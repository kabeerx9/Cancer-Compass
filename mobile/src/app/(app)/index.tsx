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
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  type Medication,
  medicationMutations,
  medicationQueries,
} from '@/features/medications';
import { symptomQueries, symptomMutations } from '@/features/symptom';

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

  // Evening check-in modal state
  const [modalVisible, setModalVisible] = React.useState(false);
  const [symptomContent, setSymptomContent] = React.useState('');
  const [isEveningTime, setIsEveningTime] = React.useState(false);
  const [modalDismissed, setModalDismissed] = React.useState(false);

  const {
    data: medications = [],
    isLoading,
    refetch,
  } = useQuery(medicationQueries.today());
  const logMutation = useMutation(medicationMutations.log(queryClient));

  // Check if today's symptom log exists
  const { data: hasLoggedToday } = useQuery({
    ...symptomQueries.today(),
    enabled: isEveningTime, // Only check during evening hours
  });

  // Symptom log mutation
  const symptomLogMutation = useMutation(symptomMutations.createOrUpdate(queryClient));

  // Check if current time is between 8 PM - 12 AM
  React.useEffect(() => {
    const checkEveningTime = () => {
      const hour = new Date().getHours();
      // Between 8 PM (20:00) and 12 AM (00:00)
      setIsEveningTime(hour >= 20 && hour < 24);
    };

    checkEveningTime();
    // Check every minute in case app stays open past 8 PM
    const interval = setInterval(checkEveningTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Show modal if: isEveningTime && !hasLoggedToday && !modalDismissed
  React.useEffect(() => {
    if (isEveningTime && hasLoggedToday === false && !modalDismissed) {
      setModalVisible(true);
    }
  }, [isEveningTime, hasLoggedToday, modalDismissed]);

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

  // Handle saving symptom log
  const handleSaveSymptom = () => {
    if (!symptomContent.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    symptomLogMutation.mutate(
      {
        date: today,
        content: symptomContent.trim(),
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          setSymptomContent('');
          setModalDismissed(true);
        },
      }
    );
  };

  // Handle skip for today
  const handleSkipToday = () => {
    setModalVisible(false);
    setModalDismissed(true);
  };

  // Handle remind me later
  const handleRemindLater = () => {
    setModalVisible(false);
    // Will show again on next check (after refetch or time interval)
    setTimeout(() => {
      setModalDismissed(false);
    }, 30 * 60 * 1000); // Remind again after 30 minutes
  };

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

        {/* Evening Check-in Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleRemindLater}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Header Icon */}
              <View style={styles.modalIconContainer}>
                <LinearGradient
                  colors={[THEME.primary, '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalIconGradient}
                >
                  <Ionicons name="moon-outline" size={28} color="#FFFFFF" />
                </LinearGradient>
              </View>

              {/* Header Text */}
              <Text style={styles.modalTitle}>Evening Check-in</Text>
              <Text style={styles.modalSubtitle}>How are you feeling today?</Text>

              {/* Text Input */}
              <TextInput
                style={styles.modalInput}
                multiline
                numberOfLines={4}
                placeholder="Share any symptoms, feelings, or notes about your day..."
                placeholderTextColor={THEME.textMuted}
                value={symptomContent}
                onChangeText={setSymptomContent}
                textAlignVertical="top"
              />

              {/* Save Button */}
              <Pressable
                style={styles.saveButton}
                onPress={handleSaveSymptom}
                disabled={symptomLogMutation.isPending || !symptomContent.trim()}
              >
                <LinearGradient
                  colors={[THEME.primary, '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.saveButtonGradient,
                    (!symptomContent.trim() || symptomLogMutation.isPending) &&
                      styles.saveButtonDisabled,
                  ]}
                >
                  {symptomLogMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Skip Button */}
              <Pressable style={styles.skipButton} onPress={handleSkipToday}>
                <Text style={styles.skipButtonText}>Skip for today</Text>
              </Pressable>

              {/* Remind Later Button */}
              <Pressable style={styles.remindButton} onPress={handleRemindLater}>
                <Text style={styles.remindButtonText}>Remind me later</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  takeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 40, 36, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: THEME.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.textHeading,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: THEME.textBody,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    minHeight: 100,
    backgroundColor: THEME.background,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: THEME.textHeading,
    borderWidth: 1,
    borderColor: THEME.border,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  saveButton: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 10,
    marginBottom: 8,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  remindButton: {
    paddingVertical: 10,
  },
  remindButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.primary,
  },
});
