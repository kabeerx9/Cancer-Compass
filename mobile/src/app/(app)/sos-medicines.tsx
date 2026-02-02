import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  LogCardSkeleton,
  Skeleton,
} from '@/components/skeleton';
import {
  type CreateSosMedicineData,
  type LogSosMedicineData,
  sosMedicineMutations,
  sosMedicineQueries,
  type SosMedicine,
  type UpdateSosMedicineData,
} from '@/features/sos-medicine';

// Warm Healing Theme
const THEME = {
  primary: '#14B8A6',
  primaryLight: '#CCFBF1',
  secondary: '#F43F5E',
  secondaryLight: '#FFE4E6',
  background: '#FFFBF9',
  surface: '#FFFFFF',
  textHeading: '#2D2824',
  textBody: '#6B5D50',
  textMuted: '#B8A89A',
  border: '#E8E0D8',
  shadow: 'rgba(45, 40, 36, 0.08)',
};

type SosViewMode = 'cabinet' | 'history';

export default function SosMedicinesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isManuallyRefreshing, setIsManuallyRefreshing] = React.useState(false);
  const [sosViewMode, setSosViewMode] = React.useState<SosViewMode>('cabinet');

  const {
    data: sosMedicines = [],
    isLoading: isLoadingSosMedicines,
  } = useQuery(sosMedicineQueries.all());
  const { data: allSosLogs = [], isLoading: isLoadingSosLogs } = useQuery(
    sosMedicineQueries.allLogs()
  );
  const { data: sosStats } = useQuery(sosMedicineQueries.stats());

  const sosCreateMutation = useMutation(sosMedicineMutations.create(queryClient));
  const sosUpdateMutation = useMutation(sosMedicineMutations.update(queryClient));
  const sosDeleteMutation = useMutation(sosMedicineMutations.delete(queryClient));
  const sosLogMutation = useMutation(sosMedicineMutations.log(queryClient));

  const [sosAddModalVisible, setSosAddModalVisible] = React.useState(false);
  const [sosTakeModalVisible, setSosTakeModalVisible] = React.useState(false);
  const [sosEditModalVisible, setSosEditModalVisible] = React.useState(false);
  const [selectedSosMedicine, setSelectedSosMedicine] = React.useState<SosMedicine | null>(null);

  const [sosFormData, setSosFormData] = React.useState<CreateSosMedicineData>({
    name: '',
    purpose: '',
    dosage: '',
    instructions: '',
  });

  const [logFormData, setLogFormData] = React.useState<LogSosMedicineData>({
    takenAt: new Date().toISOString(),
    notes: '',
  });

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = React.useState(todayString);
  const [currentMonth, setCurrentMonth] = React.useState(today);

  const handleRefresh = () => {
    setIsManuallyRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['sos-medicines'] });
    setTimeout(() => setIsManuallyRefreshing(false), 1000);
  };

  const openSosAddModal = () => {
    setSosFormData({ name: '', purpose: '', dosage: '', instructions: '' });
    setSosAddModalVisible(true);
  };

  const openSosTakeModal = (medicine: SosMedicine) => {
    setSelectedSosMedicine(medicine);
    setLogFormData({
      takenAt: new Date().toISOString(),
      notes: '',
    });
    setSosTakeModalVisible(true);
  };

  const openSosEditModal = (medicine: SosMedicine) => {
    setSelectedSosMedicine(medicine);
    setSosFormData({
      name: medicine.name,
      purpose: medicine.purpose || '',
      dosage: medicine.dosage || '',
      instructions: medicine.instructions || '',
    });
    setSosEditModalVisible(true);
  };

  const handleSaveSosMedicine = () => {
    if (!sosFormData.name.trim()) {
      Alert.alert('Error', 'Medicine name is required');
      return;
    }
    if (!sosFormData.purpose?.trim()) {
      Alert.alert('Error', 'Purpose is required');
      return;
    }

    sosCreateMutation.mutate(sosFormData, {
      onSuccess: () => {
        setSosAddModalVisible(false);
        setSosFormData({ name: '', purpose: '', dosage: '', instructions: '' });
      },
      onError: (error: Error) =>
        Alert.alert('Error', error.message || 'Failed to create medicine'),
    });
  };

  const handleUpdateSosMedicine = () => {
    if (!selectedSosMedicine) return;

    const updateData: UpdateSosMedicineData = {
      name: sosFormData.name.trim(),
      purpose: sosFormData.purpose?.trim() || undefined,
      dosage: sosFormData.dosage?.trim() || undefined,
      instructions: sosFormData.instructions?.trim() || undefined,
    };

    sosUpdateMutation.mutate(
      { id: selectedSosMedicine.id, data: updateData },
      {
        onSuccess: () => {
          setSosEditModalVisible(false);
          setSelectedSosMedicine(null);
        },
        onError: (error: Error) =>
          Alert.alert('Error', error.message || 'Failed to update medicine'),
      }
    );
  };

  const handleDeleteSosMedicine = (medicine: SosMedicine) => {
    Alert.alert(
      'Delete Medicine',
      `Are you sure you want to delete ${medicine.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            sosDeleteMutation.mutate(medicine.id, {
              onError: (error: Error) =>
                Alert.alert('Error', error.message || 'Failed to delete medicine'),
            });
          },
        },
      ]
    );
  };

  const handleLogSosMedicine = () => {
    if (!selectedSosMedicine) return;

    sosLogMutation.mutate(
      { id: selectedSosMedicine.id, data: logFormData },
      {
        onSuccess: () => {
          setSosTakeModalVisible(false);
          setSelectedSosMedicine(null);
          setLogFormData({ takenAt: new Date().toISOString(), notes: '' });
        },
        onError: (error: Error) =>
          Alert.alert('Error', error.message || 'Failed to log medicine'),
      }
    );
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getLocalDateString = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMarkedDates = () => {
    const marked: any = {};
    allSosLogs.forEach((log) => {
      const localDateStr = getLocalDateString(log.takenAt);
      if (!marked[localDateStr]) {
        marked[localDateStr] = { marked: true, dots: [] };
      }
      marked[localDateStr].dots.push({ color: THEME.secondary });
    });
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: THEME.secondary,
      };
    }
    return marked;
  };

  const getLogsForDate = (dateString: string) => {
    return allSosLogs.filter((log) => {
      const localDateStr = getLocalDateString(log.takenAt);
      return localDateStr === dateString;
    });
  };

  const saving =
    sosCreateMutation.isPending ||
    sosUpdateMutation.isPending;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={THEME.textHeading} />
          </Pressable>
          <View>
            <Text style={styles.headerSubtitle}>Emergency</Text>
            <Text style={styles.headerTitle}>SOS Medicines</Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsSection}>
          <LinearGradient
            colors={[THEME.secondary, '#E11D48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsCard}
          >
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sosMedicines.length}</Text>
              <Text style={styles.statLabel}>Medicines</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sosStats?.totalUses || 0}</Text>
              <Text style={styles.statLabel}>Total Uses</Text>
            </View>
          </LinearGradient>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.sosToggleContainer}>
          <Pressable
            style={[styles.sosToggleBtn, sosViewMode === 'cabinet' && styles.sosToggleBtnActive]}
            onPress={() => setSosViewMode('cabinet')}
          >
            <Ionicons
              name="medical-outline"
              size={18}
              color={sosViewMode === 'cabinet' ? '#FFFFFF' : THEME.textBody}
            />
            <Text
              style={[
                styles.sosToggleText,
                sosViewMode === 'cabinet' && styles.sosToggleTextActive,
              ]}
            >
              Cabinet
            </Text>
          </Pressable>
          <Pressable
            style={[styles.sosToggleBtn, sosViewMode === 'history' && styles.sosToggleBtnActive]}
            onPress={() => setSosViewMode('history')}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={sosViewMode === 'history' ? '#FFFFFF' : THEME.textBody}
            />
            <Text
              style={[
                styles.sosToggleText,
                sosViewMode === 'history' && styles.sosToggleTextActive,
              ]}
            >
              History
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.scrollView}>
          {/* CABINET VIEW */}
          {sosViewMode === 'cabinet' && (
            <>
              {isLoadingSosMedicines ? (
                <>
                  <View style={{ marginBottom: 12 }}>
                    <Skeleton width="100%" height={100} borderRadius={16} />
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Skeleton width="100%" height={100} borderRadius={16} />
                  </View>
                </>
              ) : sosMedicines.length === 0 ? (
                <Animated.View style={styles.emptyState} entering={FadeInDown.springify()}>
                  <View
                    style={[
                      styles.emptyIconCircle,
                      { backgroundColor: THEME.secondaryLight },
                    ]}
                  >
                    <Ionicons name="alert-circle-outline" size={48} color={THEME.secondary} />
                  </View>
                  <Text style={styles.emptyTitle}>No SOS Medicines</Text>
                  <Text style={styles.emptySubtitle}>
                    Add emergency medicines you take only when needed
                  </Text>
                  <Pressable
                    style={[styles.emptyAction, { backgroundColor: THEME.secondaryLight }]}
                    onPress={openSosAddModal}
                  >
                    <Ionicons name="add-circle" size={20} color={THEME.secondary} />
                    <Text style={[styles.emptyActionText, { color: THEME.secondary }]}
                    >
                      Add First Medicine
                    </Text>
                  </Pressable>
                </Animated.View>
              ) : (
                <Animated.View entering={FadeInDown.springify()}>
                  {sosMedicines.map((medicine, index) => (
                    <Animated.View
                      key={medicine.id}
                      entering={FadeInDown.delay(index * 50).springify()}
                    >
                      <View style={styles.card}>
                        <View style={styles.cardLeft}>
                          <View
                            style={[
                              styles.iconBox,
                              { backgroundColor: THEME.secondaryLight },
                            ]}
                          >
                            <Ionicons
                              name="medical"
                              size={22}
                              color={THEME.secondary}
                            />
                          </View>
                        </View>

                        <View style={styles.cardCenter}>
                          <Text style={styles.medName}>
                            {medicine.name}
                          </Text>
                          {medicine.purpose && (
                            <Text style={styles.medPurpose}>{medicine.purpose}</Text>
                          )}
                          {medicine.dosage && (
                            <Text style={styles.medMeta}>{medicine.dosage}</Text>
                          )}
                        </View>

                        <View style={styles.cardRight}>
                          <Pressable
                            style={styles.takeBtn}
                            onPress={() => openSosTakeModal(medicine)}
                          >
                            <LinearGradient
                              colors={[THEME.secondary, '#E11D48']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.takeBtnGradient}
                            >
                              <Text style={styles.takeBtnText}>Take</Text>
                            </LinearGradient>
                          </Pressable>

                          <View style={styles.actionRow}>
                            <Pressable
                              onPress={() => openSosEditModal(medicine)}
                              style={styles.smallBtn}
                            >
                              <Ionicons name="create-outline" size={20} color={THEME.textBody} />
                            </Pressable>
                            <Pressable
                              onPress={() => handleDeleteSosMedicine(medicine)}
                              style={styles.smallBtn}
                            >
                              <Ionicons name="trash-outline" size={20} color={THEME.textMuted} />
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    </Animated.View>
                  ))}
                </Animated.View>
              )}
            </>
          )}

          {/* HISTORY VIEW */}
          {sosViewMode === 'history' && (
            <Animated.View entering={FadeInDown.springify()}>
              <View style={[styles.calendarCard, { borderColor: THEME.secondaryLight }]}>
                <Calendar
                  style={styles.calendar}
                  theme={{
                    backgroundColor: THEME.surface,
                    calendarBackground: THEME.surface,
                    textSectionTitleColor: THEME.textMuted,
                    selectedDayBackgroundColor: THEME.secondary,
                    selectedDayTextColor: '#FFFFFF',
                    todayTextColor: THEME.secondary,
                    dayTextColor: THEME.textHeading,
                    textDisabledColor: THEME.border,
                    arrowColor: THEME.secondary,
                    monthTextColor: THEME.textHeading,
                    textMonthFontWeight: '700',
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 13,
                    textDayHeaderFontWeight: '700',
                  }}
                  markedDates={getMarkedDates()}
                  onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                  onMonthChange={(month: DateData) =>
                    setCurrentMonth(new Date(month.year, month.month - 1, 1))
                  }
                  markingType="multi-dot"
                  enableSwipeMonths={true}
                />
              </View>

              <View style={[styles.logsSection, { borderColor: THEME.secondaryLight }]}>
                <Text style={styles.logsTitle}>
                  {selectedDate ? `Logs for ${selectedDate}` : 'All Logs'}
                </Text>
                {isLoadingSosLogs ? (
                  <>
                    <LogCardSkeleton />
                    <LogCardSkeleton />
                    <LogCardSkeleton />
                  </>
                ) : (
                  (selectedDate ? getLogsForDate(selectedDate) : allSosLogs).map(
                    (log, index) => (
                      <Animated.View
                        key={log.id}
                        entering={FadeInDown.delay(index * 30).springify()}
                        style={styles.logItem}
                      >
                        <View style={styles.logLeft}>
                          <View
                            style={[
                              styles.logIconBox,
                              { backgroundColor: THEME.secondaryLight },
                            ]}
                          >
                            <Ionicons name="medical" size={18} color={THEME.secondary} />
                          </View>
                        </View>
                        <View style={styles.logCenter}>
                          <Text style={styles.logMedicineName}>
                            {log.sosMedicine?.name || 'Unknown Medicine'}
                          </Text>
                          <Text style={styles.logTime}>
                            {formatDate(log.takenAt)} at {formatTime(log.takenAt)}
                          </Text>
                          {log.notes && <Text style={styles.logNotes}>{log.notes}</Text>}
                        </View>
                      </Animated.View>
                    )
                  )
                )}
                {(selectedDate ? getLogsForDate(selectedDate) : allSosLogs).length === 0 &&
                  !isLoadingSosLogs && (
                    <Text style={styles.noLogsText}>
                      {selectedDate ? 'No medicines taken on this date' : 'No logs yet'}
                    </Text>
                  )}
              </View>
            </Animated.View>
          )}
        </View>

        {/* Floating Add Button */}
        <Pressable style={styles.fab} onPress={openSosAddModal}>
          <LinearGradient
            colors={[THEME.secondary, '#E11D48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>

        {/* SOS Add Modal */}
        <Modal
          visible={sosAddModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSosAddModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add SOS Medicine</Text>
              <Pressable onPress={() => setSosAddModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={THEME.textHeading} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Pain Reliever"
                  value={sosFormData.name}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, name: t })}
                  placeholderTextColor={THEME.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Purpose *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What symptom or condition is this for?"
                  value={sosFormData.purpose}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, purpose: t })}
                  placeholderTextColor={THEME.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Dosage</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 500mg, 1 tablet"
                  value={sosFormData.dosage}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, dosage: t })}
                  placeholderTextColor={THEME.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Instructions</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any special instructions or warnings"
                  value={sosFormData.instructions}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, instructions: t })}
                  placeholderTextColor={THEME.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.saveBtn, { backgroundColor: THEME.secondary }]}
                onPress={handleSaveSosMedicine}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.saveText}>Save Medicine</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* SOS Edit Modal */}
        <Modal
          visible={sosEditModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSosEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit SOS Medicine</Text>
              <Pressable onPress={() => setSosEditModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={THEME.textHeading} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={sosFormData.name}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, name: t })}
                  placeholderTextColor={THEME.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Purpose</Text>
                <TextInput
                  style={styles.input}
                  value={sosFormData.purpose}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, purpose: t })}
                  placeholderTextColor={THEME.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Dosage</Text>
                <TextInput
                  style={styles.input}
                  value={sosFormData.dosage}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, dosage: t })}
                  placeholderTextColor={THEME.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Instructions</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={sosFormData.instructions}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, instructions: t })}
                  placeholderTextColor={THEME.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.saveBtn, { backgroundColor: THEME.secondary }]}
                onPress={handleUpdateSosMedicine}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.saveText}>Update Medicine</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* SOS Take Modal */}
        <Modal
          visible={sosTakeModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          transparent={true}
          onRequestClose={() => setSosTakeModalVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.takeModalContainer}>
              <View style={styles.takeModalHeader}>
                <Text style={styles.takeModalTitle}>Take {selectedSosMedicine?.name}</Text>
                <Pressable onPress={() => setSosTakeModalVisible(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={THEME.textHeading} />
                </Pressable>
              </View>

              <View style={styles.takeModalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Time</Text>
                  <Text style={[styles.timeDisplay, { color: THEME.secondary }]}>
                    {formatTime(logFormData.takenAt)}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What's happening? Any symptoms?"
                    value={logFormData.notes}
                    onChangeText={(t) => setLogFormData({ ...logFormData, notes: t })}
                    placeholderTextColor={THEME.textMuted}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

              <View style={styles.takeModalFooter}>
                <Pressable style={styles.takeConfirmBtn} onPress={handleLogSosMedicine}>
                  <LinearGradient
                    colors={[THEME.secondary, '#E11D48']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.takeConfirmGradient}
                  >
                    <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                    <Text style={styles.takeConfirmText}>Confirm</Text>
                  </LinearGradient>
                </Pressable>
              </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
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
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sosToggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  sosToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sosToggleBtnActive: {
    backgroundColor: THEME.secondary,
  },
  sosToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textBody,
  },
  sosToggleTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.textHeading,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: THEME.textBody,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.primary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardLeft: {
    marginRight: 16,
  },
  cardCenter: {
    flex: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medName: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 6,
  },
  medMeta: {
    fontSize: 13,
    color: THEME.textBody,
    fontWeight: '600',
  },
  medPurpose: {
    fontSize: 12,
    color: THEME.textMuted,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  takeBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: THEME.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  takeBtnGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
    padding: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: THEME.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.textHeading,
  },
  closeBtn: {
    padding: 8,
  },
  modalBody: {
    flex: 1,
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textHeading,
    marginBottom: 8,
  },
  input: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: THEME.textHeading,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 40, 36, 0.5)',
    justifyContent: 'flex-end',
  },
  takeModalContainer: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  takeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  takeModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textHeading,
  },
  takeModalBody: {
    padding: 24,
  },
  timeDisplay: {
    fontSize: 18,
    fontWeight: '700',
  },
  takeModalFooter: {
    padding: 24,
    paddingTop: 0,
  },
  takeConfirmBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  takeConfirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  takeConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  calendarCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  calendar: {
    borderRadius: 12,
  },
  logsSection: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 16,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logLeft: {
    marginRight: 12,
  },
  logIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logCenter: {
    flex: 1,
  },
  logMedicineName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 2,
  },
  logTime: {
    fontSize: 13,
    color: THEME.textMuted,
  },
  logNotes: {
    fontSize: 13,
    color: THEME.textBody,
    marginTop: 4,
    fontStyle: 'italic',
  },
  noLogsText: {
    fontSize: 14,
    color: THEME.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
