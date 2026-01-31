import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogCardSkeleton, Skeleton } from '@/components/skeleton';
import {
  type CreateSymptomLogData,
  symptomMutations,
  symptomQueries,
  type SymptomLog,
} from '@/features/symptom';

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

const SKELETON_COLORS = {
  background: '#E8E0D8',
  shimmer: '#F5F0EB',
};

type DateRange = '7' | '14' | '30' | 'custom';

export default function InsightsPage() {
  const queryClient = useQueryClient();
  const [isManuallyRefreshing, setIsManuallyRefreshing] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<DateRange>('7');
  const [showSummary, setShowSummary] = React.useState(false);
  const [addModalVisible, setAddModalVisible] = React.useState(false);
  const [symptomContent, setSymptomContent] = React.useState('');

  // Check if today's log exists
  const { data: hasTodayLog, refetch: refetchToday } = useQuery(symptomQueries.today());

  // Calculate dates based on selected range
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    if (selectedRange === 'custom') {
      startDate.setDate(endDate.getDate() - 30);
    } else {
      startDate.setDate(endDate.getDate() - parseInt(selectedRange));
    }

    const formatDate = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch logs and summary
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery(
    symptomQueries.byDateRange(startDate, endDate)
  );

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    ...symptomQueries.summary(startDate, endDate),
    enabled: showSummary,
  });

  const createMutation = useMutation(symptomMutations.createOrUpdate(queryClient));

  const handleRefresh = () => {
    setIsManuallyRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['symptoms'] });
    refetchToday();
    setTimeout(() => setIsManuallyRefreshing(false), 1000);
  };

  const handleSaveSymptom = () => {
    if (!symptomContent.trim()) {
      Alert.alert('Error', 'Please enter some symptoms or notes');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    createMutation.mutate(
      {
        date: today,
        content: symptomContent.trim(),
      },
      {
        onSuccess: () => {
          setAddModalVisible(false);
          setSymptomContent('');
          refetchToday();
          queryClient.invalidateQueries({ queryKey: ['symptoms'] });
        },
        onError: (error: Error) => {
          Alert.alert('Error', error.message || 'Failed to save symptom log');
        },
      }
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const rangeOptions: { value: DateRange; label: string }[] = [
    { value: '7', label: 'Last 7 Days' },
    { value: '14', label: 'Last 14 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom' },
  ];

  // Loading skeleton
  if (isLoadingLogs && logs.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header Skeleton */}
          <View style={styles.header}>
            <View>
              <Skeleton width={50} height={16} />
              <View style={{ height: 8 }} />
              <Skeleton width={140} height={36} />
            </View>
          </View>

          {/* Range Selector Skeleton */}
          <View style={styles.rangeSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Skeleton width={100} height={40} borderRadius={20} />
              <Skeleton width={100} height={40} borderRadius={20} />
              <Skeleton width={100} height={40} borderRadius={20} />
              <Skeleton width={100} height={40} borderRadius={20} />
            </ScrollView>
          </View>

          {/* Summary Button Skeleton */}
          <View style={styles.summarySection}>
            <Skeleton width="100%" height={48} borderRadius={14} />
          </View>

          {/* Logs Skeleton */}
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <LogCardSkeleton />
            <LogCardSkeleton />
            <LogCardSkeleton />
            <LogCardSkeleton />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Health</Text>
            <Text style={styles.headerTitle}>Insights</Text>
          </View>
        </View>

        {/* Date Range Selector */}
        <View style={styles.rangeSelector}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rangeScrollContent}
          >
            {rangeOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.rangeChip,
                  selectedRange === option.value && styles.rangeChipActive,
                ]}
                onPress={() => {
                  setSelectedRange(option.value);
                  setShowSummary(false);
                }}
              >
                <Text
                  style={[
                    styles.rangeChipText,
                    selectedRange === option.value && styles.rangeChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Summary Button */}
        <View style={styles.summarySection}>
          <Pressable
            style={[styles.summaryButton, showSummary && styles.summaryButtonActive]}
            onPress={() => setShowSummary(!showSummary)}
          >
            <LinearGradient
              colors={showSummary ? ['#14B8A6', '#0D9488'] : ['#F3F4F6', '#E5E7EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryButtonGradient}
            >
              <Ionicons
                name={showSummary ? 'close' : 'sparkles'}
                size={20}
                color={showSummary ? '#FFFFFF' : THEME.textBody}
              />
              <Text
                style={[
                  styles.summaryButtonText,
                  showSummary && styles.summaryButtonTextActive,
                ]}
              >
                {showSummary ? 'Hide Summary' : 'Generate AI Summary'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isManuallyRefreshing}
              onRefresh={handleRefresh}
              tintColor={THEME.primary}
            />
          }
        >
          {/* AI Summary Card */}
          {showSummary && (
            <Animated.View entering={FadeInDown.springify()} style={styles.summaryCard}>
              {isLoadingSummary ? (
                <View style={styles.summaryLoading}>
                  <ActivityIndicator color={THEME.primary} />
                  <Text style={styles.summaryLoadingText}>Generating summary...</Text>
                </View>
              ) : summaryData ? (
                <>
                  <View style={styles.summaryHeader}>
                    <Ionicons name="sparkles" size={24} color={THEME.primary} />
                    <Text style={styles.summaryTitle}>AI Summary</Text>
                  </View>
                  <Text style={styles.summaryText}>{summaryData.summary}</Text>
                  <View style={styles.summaryStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{summaryData.entriesCount}</Text>
                      <Text style={styles.statLabel}>Entries</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{summaryData.daysCount}</Text>
                      <Text style={styles.statLabel}>Days</Text>
                    </View>
                  </View>
                </>
              ) : null}
            </Animated.View>
          )}

          {/* Add Today's Log Button */}
          {!hasTodayLog && !isLoadingLogs && (
            <Animated.View entering={FadeInDown.springify()} style={styles.addTodayContainer}>
              <Pressable
                style={styles.addTodayButton}
                onPress={() => setAddModalVisible(true)}
              >
                <LinearGradient
                  colors={['#14B8A6', '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addTodayGradient}
                >
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.addTodayText}>Log Today's Symptoms</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}

          {/* Logs List */}
          <View style={styles.logsSection}>
            <Text style={styles.sectionTitle}>
              Symptom Logs ({logs.length} entries)
            </Text>

            {logs.length === 0 ? (
              <Animated.View style={styles.emptyState} entering={FadeInDown.springify()}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="document-text-outline" size={48} color={THEME.primary} />
                </View>
                <Text style={styles.emptyTitle}>No Logs Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start logging your symptoms to track your health journey
                </Text>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInDown.springify()}>
                {logs.map((log, index) => (
                  <Animated.View
                    key={log.id}
                    entering={FadeInDown.delay(index * 50).springify()}
                    style={styles.logCard}
                  >
                    <View style={styles.logHeader}>
                      <View style={styles.logDateBadge}>
                        <Text style={styles.logDateText}>
                          {formatDate(log.date)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.logContent}>{log.content}</Text>
                  </Animated.View>
                ))}
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {/* Add Symptom Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={addModalVisible}
          onRequestClose={() => setAddModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalIconContainer}>
                <LinearGradient
                  colors={[THEME.primary, '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalIconGradient}
                >
                  <Ionicons name="create-outline" size={28} color="#FFFFFF" />
                </LinearGradient>
              </View>

              <Text style={styles.modalTitle}>Log Symptoms</Text>
              <Text style={styles.modalSubtitle}>How are you feeling today?</Text>

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

              <Pressable
                style={styles.modalSaveButton}
                onPress={handleSaveSymptom}
                disabled={createMutation.isPending || !symptomContent.trim()}
              >
                <LinearGradient
                  colors={[THEME.primary, '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.modalSaveGradient,
                    (!symptomContent.trim() || createMutation.isPending) && styles.modalSaveDisabled,
                  ]}
                >
                  {createMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSaveText}>Save</Text>
                  )}
                </LinearGradient>
              </Pressable>

              <Pressable
                style={styles.modalCancelButton}
                onPress={() => {
                  setAddModalVisible(false);
                  setSymptomContent('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
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
  rangeSelector: {
    marginBottom: 16,
  },
  rangeScrollContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  rangeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  rangeChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  rangeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textBody,
  },
  rangeChipTextActive: {
    color: '#FFFFFF',
  },
  summarySection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  summaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  summaryButtonActive: {
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  summaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textBody,
  },
  summaryButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16, // Reduced bottom padding
  },
  summaryCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textHeading,
  },
  summaryText: {
    fontSize: 14,
    color: THEME.textBody,
    lineHeight: 22,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.primary,
  },
  statLabel: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
  summaryLoading: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  summaryLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: THEME.textMuted,
  },
  addTodayContainer: {
    marginBottom: 20,
  },
  addTodayButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  addTodayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  addTodayText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textHeading,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME.textMuted,
    textAlign: 'center',
  },
  logCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  logHeader: {
    marginBottom: 12,
  },
  logDateBadge: {
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  logDateText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.primary,
  },
  logContent: {
    fontSize: 15,
    color: THEME.textBody,
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
  modalSaveButton: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalSaveGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveDisabled: {
    opacity: 0.5,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCancelButton: {
    paddingVertical: 10,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.textMuted,
  },
});
