import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  medicationMutations,
  medicationQueries,
  type Medication,
} from '@/features/medications';

// Theme Constants (Clean Light Theme)
const THEME = {
  primary: '#2563EB', // Royal Blue
  primaryLight: '#EFF6FF',
  background: '#F9FAFB', // Background
  surface: '#ffffff',
  textHeading: '#111827',
  textBody: '#4B5563',
  textMuted: '#9CA3AF',
  success: '#10B981',
  border: '#F3F4F6',
};

export default function HomePage() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const {
    data: medications = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery(medicationQueries.today());
  const logMutation = useMutation(medicationMutations.log(queryClient));

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

  const renderMedicationItem = ({ item: medication }: { item: Medication }) => (
    <View
      style={[
        styles.card,
        medication.todayStatus === 'taken' && styles.cardTaken,
        medication.todayStatus === 'skipped' && styles.cardSkipped,
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
             <Ionicons name="medical" size={20} color={THEME.primary} />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.medName}>{medication.name}</Text>
            {medication.dosage && (
              <Text style={styles.medDose}>{medication.dosage}</Text>
            )}
          </View>

          {medication.time && (
            <View style={styles.timePill}>
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

          {logMutation.isPending &&
          logMutation.variables?.id === medication.id ? (
            <ActivityIndicator size="small" color={THEME.primary} />
          ) : medication.todayStatus ? (
            <View style={styles.statusRow}>
              <Ionicons
                name={medication.todayStatus === 'taken' ? "checkmark-circle" : "close-circle"}
                size={20}
                color={medication.todayStatus === 'taken' ? THEME.success : THEME.textMuted}
              />
              <Text style={[styles.statusText,
                { color: medication.todayStatus === 'taken' ? THEME.success : THEME.textMuted }
              ]}>
                {medication.todayStatus === 'taken' ? "Done" : "Skipped"}
              </Text>
            </View>
          ) : (
            <View style={styles.buttons}>
              <Pressable
                style={styles.skipBtn}
                onPress={() => handleLogMedication(medication.id, 'skipped')}
                disabled={logMutation.isPending}
              >
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
              <Pressable
                style={styles.takeBtn}
                onPress={() => handleLogMedication(medication.id, 'taken')}
                disabled={logMutation.isPending}
              >
                <Text style={styles.takeText}>Take</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Simple Clean Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.title}>{firstName}</Text>
          </View>
          <View style={styles.avatar}>
             <Text style={styles.avatarText}>{firstName[0]}</Text>
          </View>
        </View>

        {/* Compact Progress Card */}
        {totalCount > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <View>
                <Text style={styles.progressLabel}>Daily Progress</Text>
                <Text style={styles.progressCount}>{takenCount} / {totalCount} completed</Text>
              </View>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}

        {/* Content - Tight Spacing */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Up Next</Text>
        </View>

        <FlatList
          data={medications}
          renderItem={renderMedicationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={THEME.primary} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No medications pending</Text>
              <Text style={styles.emptySub}>You're all set for now!</Text>
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
    backgroundColor: '#FFFFFF', // Pure white background
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: THEME.textMuted,
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '800', // Bolder
    color: THEME.textHeading,
    letterSpacing: -0.5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textHeading,
  },

  // Progress Component
  progressSection: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: THEME.primary, // Blue card for contrast
    borderRadius: 20,
    padding: 20,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, // Stronger shadow
    shadowRadius: 16,
    elevation: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  progressCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },

  // List
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.textHeading,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  // Redesigned Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTaken: {
    backgroundColor: '#F0FDF4', // Very subtle green tint
    borderColor: '#DCFCE7',
  },
  cardSkipped: {
    opacity: 0.5,
    backgroundColor: '#F9FAFB',
  },
  cardContent: {
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EFF6FF', // Light blue bg
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
    color: THEME.textMuted,
    fontWeight: '500',
  },
  timePill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textBody,
  },

  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)', // Very subtle divider
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
    gap: 12,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textBody,
  },
  takeBtn: {
    backgroundColor: THEME.textHeading, // Dark button for contrast
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  takeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    color: THEME.textMuted,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },
});
