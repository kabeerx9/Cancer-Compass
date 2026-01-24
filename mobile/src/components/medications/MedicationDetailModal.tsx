import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  medicationMutations,
  medicationQueries,
  type Medication,
  type MedicationLog,
} from '@/features/medications';

// Theme Constants
const THEME = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  background: '#F9FAFB',
  surface: '#ffffff',
  textHeading: '#111827',
  textBody: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#F3F4F6',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
};

interface MedicationDetailModalProps {
  visible: boolean;
  medicationId: string | null;
  onClose: () => void;
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => void;
}

export function MedicationDetailModal({
  visible,
  medicationId,
  onClose,
  onEdit,
  onDelete,
}: MedicationDetailModalProps) {
  const queryClient = useQueryClient();

  const {
    data: medication,
    isLoading,
    isError,
  } = useQuery({
    ...medicationQueries.history(medicationId || ''),
    enabled: visible && !!medicationId,
  });

  const logMutation = useMutation(medicationMutations.log(queryClient));

  const handleLog = (status: 'taken' | 'skipped') => {
    if (!medication) return;
    logMutation.mutate(
      { id: medication.id, status },
      {
        onSuccess: () => {
          // Refetch to update the history
          queryClient.invalidateQueries({ queryKey: ['medications'] });
        },
      }
    );
  };

  const handleEdit = () => {
    if (medication) {
      onEdit(medication);
    }
  };

  const handleDelete = () => {
    if (!medication) return;
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete "${medication.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(medication),
        },
      ]
    );
  };

  // Calculate adherence percentage
  const calculateAdherence = (logs: MedicationLog[] = []) => {
    if (logs.length === 0) return null;
    const takenCount = logs.filter((log) => log.status === 'taken').length;
    return Math.round((takenCount / logs.length) * 100);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Check if today's log exists
  const getTodayLog = (logs: MedicationLog[] = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return logs.find((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
  };

  const todayLog = medication ? getTodayLog(medication.logs) : null;
  const adherence = medication ? calculateAdherence(medication.logs) : null;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={THEME.textHeading} />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.primary} />
          </View>
        ) : isError || !medication ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={THEME.danger}
            />
            <Text style={styles.errorText}>Failed to load medication</Text>
            <Pressable style={styles.retryBtn} onPress={onClose}>
              <Text style={styles.retryText}>Close</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Medication Info */}
              <View style={styles.infoSection}>
                <View style={styles.iconBox}>
                  <Ionicons name="medical" size={28} color={THEME.primary} />
                </View>
                <Text style={styles.medName}>{medication.name}</Text>
                <View style={styles.metaRow}>
                  {medication.dosage && (
                    <Text style={styles.metaText}>{medication.dosage}</Text>
                  )}
                  {medication.dosage && medication.timeLabel && (
                    <Text style={styles.metaDot}>•</Text>
                  )}
                  {medication.timeLabel && (
                    <Text style={styles.metaText}>{medication.timeLabel}</Text>
                  )}
                </View>
                {medication.purpose && (
                  <Text style={styles.purposeText}>{medication.purpose}</Text>
                )}
                {medication.time && (
                  <View style={styles.timeBadge}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={THEME.primary}
                    />
                    <Text style={styles.timeText}>{medication.time}</Text>
                  </View>
                )}
              </View>

              {/* Today's Status */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>TODAY</Text>
                <View style={styles.todayCard}>
                  {logMutation.isPending ? (
                    <ActivityIndicator size="small" color={THEME.primary} />
                  ) : todayLog ? (
                    <View style={styles.todayStatus}>
                      <View
                        style={[
                          styles.statusIcon,
                          todayLog.status === 'taken'
                            ? styles.statusIconTaken
                            : styles.statusIconSkipped,
                        ]}
                      >
                        <Ionicons
                          name={
                            todayLog.status === 'taken'
                              ? 'checkmark'
                              : 'close'
                          }
                          size={20}
                          color={
                            todayLog.status === 'taken'
                              ? THEME.success
                              : THEME.textMuted
                          }
                        />
                      </View>
                      <View>
                        <Text style={styles.todayStatusText}>
                          {todayLog.status === 'taken' ? 'Taken' : 'Skipped'}
                        </Text>
                        {todayLog.takenAt && (
                          <Text style={styles.todayTimeText}>
                            at {formatTime(todayLog.takenAt)}
                          </Text>
                        )}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.todayActions}>
                      <Text style={styles.notTakenText}>Not taken yet</Text>
                      <View style={styles.todayButtons}>
                        <Pressable
                          style={styles.skipBtn}
                          onPress={() => handleLog('skipped')}
                        >
                          <Text style={styles.skipBtnText}>Skip</Text>
                        </Pressable>
                        <Pressable
                          style={styles.takeBtn}
                          onPress={() => handleLog('taken')}
                        >
                          <Text style={styles.takeBtnText}>Take Now</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Adherence Stats */}
              {adherence !== null && (
                <View style={styles.adherenceCard}>
                  <View style={styles.adherenceHeader}>
                    <Ionicons
                      name="stats-chart"
                      size={18}
                      color={THEME.primary}
                    />
                    <Text style={styles.adherenceTitle}>Adherence</Text>
                  </View>
                  <View style={styles.adherenceContent}>
                    <Text style={styles.adherencePercent}>{adherence}%</Text>
                    <Text style={styles.adherenceLabel}>
                      last {medication.logs?.length || 0} days
                    </Text>
                  </View>
                  <View style={styles.adherenceBar}>
                    <View
                      style={[
                        styles.adherenceBarFill,
                        { width: `${adherence}%` },
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* History */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>RECENT HISTORY</Text>
                {!medication.logs || medication.logs.length === 0 ? (
                  <View style={styles.emptyHistory}>
                    <Ionicons
                      name="calendar-outline"
                      size={32}
                      color={THEME.textMuted}
                    />
                    <Text style={styles.emptyHistoryText}>
                      No history yet
                    </Text>
                  </View>
                ) : (
                  <View style={styles.historyList}>
                    {medication.logs.map((log, index) => (
                      <View
                        key={log.id}
                        style={[
                          styles.historyItem,
                          index === medication.logs!.length - 1 &&
                            styles.historyItemLast,
                        ]}
                      >
                        <View
                          style={[
                            styles.historyIcon,
                            log.status === 'taken'
                              ? styles.historyIconTaken
                              : styles.historyIconSkipped,
                          ]}
                        >
                          <Ionicons
                            name={
                              log.status === 'taken'
                                ? 'checkmark'
                                : 'close'
                            }
                            size={14}
                            color={
                              log.status === 'taken'
                                ? THEME.success
                                : THEME.textMuted
                            }
                          />
                        </View>
                        <Text style={styles.historyDate}>
                          {formatDate(log.date)}
                        </Text>
                        <Text
                          style={[
                            styles.historyStatus,
                            log.status === 'taken'
                              ? styles.historyStatusTaken
                              : styles.historyStatusSkipped,
                          ]}
                        >
                          {log.status === 'taken' ? 'Taken' : 'Skipped'}
                        </Text>
                        {log.takenAt && (
                          <Text style={styles.historyTime}>
                            {formatTime(log.takenAt)}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <Pressable
                style={styles.deleteBtn}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} color={THEME.danger} />
              </Pressable>
              <Pressable style={styles.editBtn} onPress={handleEdit}>
                <Ionicons name="pencil" size={18} color="#fff" />
                <Text style={styles.editBtnText}>Edit Medication</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerSpacer: {
    width: 32,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: THEME.textBody,
    marginTop: 12,
    marginBottom: 24,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: THEME.background,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textHeading,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },

  // Info Section
  infoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  medName: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.textHeading,
    textAlign: 'center',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 15,
    color: THEME.textMuted,
    fontWeight: '500',
  },
  metaDot: {
    marginHorizontal: 8,
    color: THEME.textMuted,
  },
  purposeText: {
    fontSize: 14,
    color: THEME.textBody,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: THEME.primaryLight,
    borderRadius: 20,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textMuted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Today Card
  todayCard: {
    backgroundColor: THEME.background,
    borderRadius: 16,
    padding: 20,
  },
  todayStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconTaken: {
    backgroundColor: THEME.successLight,
  },
  statusIconSkipped: {
    backgroundColor: THEME.border,
  },
  todayStatusText: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.textHeading,
  },
  todayTimeText: {
    fontSize: 14,
    color: THEME.textMuted,
    marginTop: 2,
  },
  todayActions: {
    alignItems: 'center',
    gap: 16,
  },
  notTakenText: {
    fontSize: 15,
    color: THEME.textMuted,
    fontWeight: '500',
  },
  todayButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  skipBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: THEME.border,
  },
  skipBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.textBody,
  },
  takeBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: THEME.textHeading,
  },
  takeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Adherence Card
  adherenceCard: {
    backgroundColor: THEME.primaryLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  adherenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  adherenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
  },
  adherenceContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  adherencePercent: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.primary,
  },
  adherenceLabel: {
    fontSize: 14,
    color: THEME.primary,
    opacity: 0.7,
  },
  adherenceBar: {
    height: 6,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  adherenceBarFill: {
    height: '100%',
    backgroundColor: THEME.primary,
    borderRadius: 3,
  },

  // History List
  historyList: {
    backgroundColor: THEME.background,
    borderRadius: 16,
    overflow: 'hidden',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  historyItemLast: {
    borderBottomWidth: 0,
  },
  historyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyIconTaken: {
    backgroundColor: THEME.successLight,
  },
  historyIconSkipped: {
    backgroundColor: THEME.border,
  },
  historyDate: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textHeading,
  },
  historyStatus: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  historyStatusTaken: {
    color: THEME.success,
  },
  historyStatusSkipped: {
    color: THEME.textMuted,
  },
  historyTime: {
    fontSize: 13,
    color: THEME.textMuted,
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: THEME.background,
    borderRadius: 16,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: THEME.textMuted,
    marginTop: 12,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    gap: 12,
  },
  deleteBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: THEME.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    backgroundColor: THEME.primary,
    borderRadius: 16,
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
