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
import { Calendar, type DateData } from 'react-native-calendars';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogCardSkeleton, MedicationCardSkeleton, Skeleton, StatCardSkeleton } from '@/components/skeleton';
import {
  type CreateSosMedicineData,
  type LogSosMedicineData,
  sosMedicineMutations,
  sosMedicineQueries,
  type SosMedicine,
  type SosMedicineLog,
  type UpdateSosMedicineData,
} from '@/features/sos-medicine';

// Warm Healing Theme
const THEME = {
  primary: '#F43F5E', // Warm Coral/Red for SOS
  primaryLight: '#FFE4E6',
  secondary: '#14B8A6', // Teal
  background: '#FFFBF9', // Warm cream
  surface: '#FFFFFF',
  textHeading: '#2D2824',
  textBody: '#6B5D50',
  textMuted: '#B8A89A',
  border: '#E8E0D8',
  shadow: 'rgba(45, 40, 36, 0.08)',
};

// Skeleton colors matching warm healing theme
const SKELETON_COLORS = {
  background: '#E8E0D8',
  shimmer: '#F5F0EB',
};

type ViewMode = 'cabinet' | 'history';

export default function SosMedicinePage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = React.useState<ViewMode>('cabinet');
  const [isManuallyRefreshing, setIsManuallyRefreshing] = React.useState(false);

  // Data fetching
  const { data: medicines = [], isLoading: isLoadingMedicines } = useQuery(
    sosMedicineQueries.all()
  );
  const { data: allLogs = [], isLoading: isLoadingLogs } = useQuery(
    sosMedicineQueries.allLogs()
  );
  const { data: stats } = useQuery(sosMedicineQueries.stats());

  // Mutations
  const createMutation = useMutation(sosMedicineMutations.create(queryClient));
  const updateMutation = useMutation(sosMedicineMutations.update(queryClient));
  const deleteMutation = useMutation(sosMedicineMutations.delete(queryClient));
  const logMutation = useMutation(sosMedicineMutations.log(queryClient));

  // Modal states
  const [addModalVisible, setAddModalVisible] = React.useState(false);
  const [takeModalVisible, setTakeModalVisible] = React.useState(false);
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [selectedMedicine, setSelectedMedicine] = React.useState<SosMedicine | null>(null);

  // Form states
  const [formData, setFormData] = React.useState<CreateSosMedicineData>({
    name: '',
    purpose: '',
    dosage: '',
    instructions: '',
  });

  const [logFormData, setLogFormData] = React.useState<LogSosMedicineData>({
    takenAt: new Date().toISOString(),
    notes: '',
  });

  // Calendar state - initialize with today's date
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = React.useState(todayString);
  const [currentMonth, setCurrentMonth] = React.useState(today);

  const handleRefresh = () => {
    setIsManuallyRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['sos-medicines'] });
    setTimeout(() => setIsManuallyRefreshing(false), 1000);
  };

  const openAddModal = () => {
    setFormData({ name: '', purpose: '', dosage: '', instructions: '' });
    setAddModalVisible(true);
  };

  const openTakeModal = (medicine: SosMedicine) => {
    setSelectedMedicine(medicine);
    setLogFormData({
      takenAt: new Date().toISOString(),
      notes: '',
    });
    setTakeModalVisible(true);
  };

  const openEditModal = (medicine: SosMedicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name,
      purpose: medicine.purpose || '',
      dosage: medicine.dosage || '',
      instructions: medicine.instructions || '',
    });
    setEditModalVisible(true);
  };

  const handleSaveMedicine = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Medicine name is required');
      return;
    }

    if (!formData.purpose?.trim()) {
      Alert.alert('Error', 'Purpose is required');
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        setAddModalVisible(false);
        setFormData({ name: '', purpose: '', dosage: '', instructions: '' });
      },
      onError: (error: Error) =>
        Alert.alert('Error', error.message || 'Failed to create medicine'),
    });
  };

  const handleUpdateMedicine = () => {
    if (!selectedMedicine) return;

    const updateData: UpdateSosMedicineData = {
      name: formData.name.trim(),
      purpose: formData.purpose?.trim() || undefined,
      dosage: formData.dosage?.trim() || undefined,
      instructions: formData.instructions?.trim() || undefined,
    };

    updateMutation.mutate(
      { id: selectedMedicine.id, data: updateData },
      {
        onSuccess: () => {
          setEditModalVisible(false);
          setSelectedMedicine(null);
        },
        onError: (error: Error) =>
          Alert.alert('Error', error.message || 'Failed to update medicine'),
      }
    );
  };

  const handleDeleteMedicine = (medicine: SosMedicine) => {
    Alert.alert(
      'Delete Medicine',
      `Are you sure you want to delete ${medicine.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(medicine.id, {
              onError: (error: Error) =>
                Alert.alert('Error', error.message || 'Failed to delete medicine'),
            });
          },
        },
      ]
    );
  };

  const handleLogMedicine = () => {
    if (!selectedMedicine) return;

    logMutation.mutate(
      { id: selectedMedicine.id, data: logFormData },
      {
        onSuccess: () => {
          setTakeModalVisible(false);
          setSelectedMedicine(null);
          setLogFormData({ takenAt: new Date().toISOString(), notes: '' });
        },
        onError: (error: Error) =>
          Alert.alert('Error', error.message || 'Failed to log medicine'),
      }
    );
  };

  const handleToggleActive = (medicine: SosMedicine) => {
    updateMutation.mutate({
      id: medicine.id,
      data: { isActive: !medicine.isActive },
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Convert UTC ISO string to local date string (YYYY-MM-DD)
  const getLocalDateString = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get marked dates for calendar (using local dates)
  const getMarkedDates = () => {
    const marked: any = {};

    allLogs.forEach((log) => {
      // Convert UTC timestamp to local date
      const localDateStr = getLocalDateString(log.takenAt);
      if (!marked[localDateStr]) {
        marked[localDateStr] = { marked: true, dots: [] };
      }
      marked[localDateStr].dots.push({ color: THEME.primary });
    });

    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: THEME.primary,
      };
    }

    return marked;
  };

  // Memoize marked dates to prevent unnecessary re-renders
  const markedDates = React.useMemo(() => getMarkedDates(), [allLogs, selectedDate]);

  // Filter logs for selected date (comparing local dates)
  const getLogsForDate = (dateString: string) => {
    return allLogs.filter((log) => {
      const localDateStr = getLocalDateString(log.takenAt);
      return localDateStr === dateString;
    });
  };

  const activeCount = medicines.filter((m) => m.isActive).length;
  const saving = createMutation.isPending || updateMutation.isPending;

  // Loading skeleton view
  if (isLoadingMedicines && medicines.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header Skeleton */}
          <View style={styles.header}>
            <View>
              <Skeleton width={60} height={16} colors={SKELETON_COLORS} />
              <View style={{ height: 8 }} />
              <Skeleton width={180} height={36} colors={SKELETON_COLORS} />
            </View>
            <Skeleton width={56} height={56} borderRadius={28} colors={SKELETON_COLORS} />
          </View>

          {/* Stats Card Skeleton */}
          <View style={styles.statsSection}>
            <StatCardSkeleton colors={SKELETON_COLORS} />
          </View>

          {/* Toggle Skeleton */}
          <View style={styles.toggleContainer}>
            <Skeleton width="48%" height={44} borderRadius={12} colors={SKELETON_COLORS} />
            <Skeleton width="48%" height={44} borderRadius={12} colors={SKELETON_COLORS} />
          </View>

          {/* Medicine Card Skeletons */}
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <MedicationCardSkeleton colors={SKELETON_COLORS} />
            <MedicationCardSkeleton colors={SKELETON_COLORS} />
            <MedicationCardSkeleton colors={SKELETON_COLORS} />
            <MedicationCardSkeleton colors={SKELETON_COLORS} />
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
            <Text style={styles.headerSubtitle}>Your</Text>
            <Text style={styles.headerTitle}>SOS Medicines</Text>
          </View>
          <Pressable style={[styles.addBtn, { shadowColor: THEME.primary }]} onPress={openAddModal}>
            <LinearGradient
              colors={[THEME.primary, '#E11D48']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addBtnGradient}
            >
              <Ionicons name="add" size={26} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </View>

        {/* Stats Card */}
        {stats && (
          <View style={styles.statsSection}>
            <LinearGradient
              colors={[THEME.primary, '#E11D48']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsCard}
            >
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalUses}</Text>
                <Text style={styles.statLabel}>Total Uses</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{activeCount}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* View Toggle */}
        <View style={styles.toggleContainer}>
          <Pressable
            style={[styles.toggleBtn, viewMode === 'cabinet' && styles.toggleBtnActive]}
            onPress={() => setViewMode('cabinet')}
          >
            <Ionicons
              name="medical-outline"
              size={18}
              color={viewMode === 'cabinet' ? '#FFFFFF' : THEME.textBody}
            />
            <Text style={[styles.toggleText, viewMode === 'cabinet' && styles.toggleTextActive]}>
              Cabinet
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, viewMode === 'history' && styles.toggleBtnActive]}
            onPress={() => setViewMode('history')}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={viewMode === 'history' ? '#FFFFFF' : THEME.textBody}
            />
            <Text style={[styles.toggleText, viewMode === 'history' && styles.toggleTextActive]}>
              History
            </Text>
          </Pressable>
        </View>

        {/* Content */}
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
          {viewMode === 'cabinet' ? (
            // Medicine Cabinet View
            <>
              {medicines.length === 0 ? (
                <Animated.View style={styles.emptyState} entering={FadeInDown.springify()}>
                  <View style={[styles.emptyIconCircle, { backgroundColor: THEME.primaryLight }]}>
                    <Ionicons name="medical-outline" size={48} color={THEME.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>No SOS Medicines</Text>
                  <Text style={styles.emptySubtitle}>Add emergency medicines you take only when needed</Text>
                  <Pressable style={styles.emptyAction} onPress={openAddModal}>
                    <Ionicons name="add-circle" size={20} color={THEME.primary} />
                    <Text style={styles.emptyActionText}>Add First Medicine</Text>
                  </Pressable>
                </Animated.View>
              ) : (
                <Animated.View entering={FadeInDown.springify()}>
                  {medicines.map((medicine, index) => (
                    <Animated.View
                      key={medicine.id}
                      entering={FadeInDown.delay(index * 50).springify()}
                    >
                      <View
                        style={[styles.card, !medicine.isActive && styles.cardInactive]}
                      >
                        <View style={styles.cardLeft}>
                          <View
                            style={[
                              styles.iconBox,
                              !medicine.isActive && styles.iconBoxInactive,
                            ]}
                          >
                            <Ionicons
                              name="medical"
                              size={22}
                              color={medicine.isActive ? THEME.primary : THEME.textMuted}
                            />
                          </View>
                        </View>

                        <View style={styles.cardCenter}>
                          <Text
                            style={[styles.medName, !medicine.isActive && styles.textInactive]}
                          >
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
                            style={[styles.takeBtn, !medicine.isActive && styles.takeBtnDisabled]}
                            onPress={() => medicine.isActive && openTakeModal(medicine)}
                            disabled={!medicine.isActive}
                          >
                            <LinearGradient
                              colors={[THEME.primary, '#E11D48']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.takeBtnGradient}
                            >
                              <Text style={styles.takeBtnText}>Take</Text>
                            </LinearGradient>
                          </Pressable>

                          <View style={styles.actionRow}>
                            <Pressable
                              onPress={() => handleToggleActive(medicine)}
                              style={styles.smallBtn}
                            >
                              <Ionicons
                                name={medicine.isActive ? 'eye' : 'eye-off'}
                                size={20}
                                color={medicine.isActive ? THEME.primary : THEME.textMuted}
                              />
                            </Pressable>
                            <Pressable onPress={() => openEditModal(medicine)} style={styles.smallBtn}>
                              <Ionicons name="create-outline" size={20} color={THEME.textBody} />
                            </Pressable>
                            <Pressable
                              onPress={() => handleDeleteMedicine(medicine)}
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
          ) : (
            // History/Calendar View
            <Animated.View entering={FadeInDown.springify()}>
              <View style={styles.calendarCard}>
                <Calendar
                  style={styles.calendar}
                  theme={{
                    backgroundColor: THEME.surface,
                    calendarBackground: THEME.surface,
                    textSectionTitleColor: THEME.textMuted,
                    selectedDayBackgroundColor: THEME.primary,
                    selectedDayTextColor: '#FFFFFF',
                    todayTextColor: THEME.primary,
                    dayTextColor: THEME.textHeading,
                    textDisabledColor: THEME.border,
                    arrowColor: THEME.primary,
                    monthTextColor: THEME.textHeading,
                    textMonthFontWeight: '700' as const,
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 13,
                    textDayHeaderFontWeight: '700' as const,
                  }}
                  markedDates={markedDates}
                  onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                  onMonthChange={(month: DateData) =>
                    setCurrentMonth(new Date(month.year, month.month - 1, 1))
                  }
                  markingType="multi-dot"
                  enableSwipeMonths={true}
                />
              </View>

              {/* Logs List */}
              <View style={styles.logsSection}>
                <Text style={styles.logsTitle}>
                  {selectedDate ? `Logs for ${selectedDate}` : 'All Logs'}
                </Text>
                {isLoadingLogs ? (
                  <>
                    <LogCardSkeleton colors={SKELETON_COLORS} />
                    <LogCardSkeleton colors={SKELETON_COLORS} />
                    <LogCardSkeleton colors={SKELETON_COLORS} />
                  </>
                ) : (
                  (selectedDate ? getLogsForDate(selectedDate) : allLogs).map((log, index) => (
                    <Animated.View
                      key={log.id}
                      entering={FadeInDown.delay(index * 30).springify()}
                      style={styles.logItem}
                    >
                      <View style={styles.logLeft}>
                        <View style={[styles.logIconBox, { backgroundColor: THEME.primaryLight }]}>
                          <Ionicons name="medical" size={18} color={THEME.primary} />
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
                  ))
                )}
                {(selectedDate ? getLogsForDate(selectedDate) : allLogs).length === 0 &&
                  !isLoadingLogs && (
                    <Text style={styles.noLogsText}>
                      {selectedDate ? 'No medicines taken on this date' : 'No logs yet'}
                    </Text>
                  )}
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Add Medicine Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add SOS Medicine</Text>
            <Pressable onPress={() => setAddModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={THEME.textHeading} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Pain Reliever"
                value={formData.name}
                onChangeText={(t) => setFormData({ ...formData, name: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Purpose *</Text>
              <TextInput
                style={styles.input}
                placeholder="What symptom or condition is this for?"
                value={formData.purpose}
                onChangeText={(t) => setFormData({ ...formData, purpose: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 500mg, 1 tablet"
                value={formData.dosage}
                onChangeText={(t) => setFormData({ ...formData, dosage: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any special instructions or warnings"
                value={formData.instructions}
                onChangeText={(t) => setFormData({ ...formData, instructions: t })}
                placeholderTextColor={THEME.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable style={styles.saveBtn} onPress={handleSaveMedicine} disabled={saving}>
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

      {/* Edit Medicine Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit SOS Medicine</Text>
            <Pressable onPress={() => setEditModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={THEME.textHeading} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(t) => setFormData({ ...formData, name: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Purpose</Text>
              <TextInput
                style={styles.input}
                value={formData.purpose}
                onChangeText={(t) => setFormData({ ...formData, purpose: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={styles.input}
                value={formData.dosage}
                onChangeText={(t) => setFormData({ ...formData, dosage: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.instructions}
                onChangeText={(t) => setFormData({ ...formData, instructions: t })}
                placeholderTextColor={THEME.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable style={styles.saveBtn} onPress={handleUpdateMedicine} disabled={saving}>
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

      {/* Take Medicine Modal */}
      <Modal
        visible={takeModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
        onRequestClose={() => setTakeModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.takeModalContainer}>
            <View style={styles.takeModalHeader}>
              <Text style={styles.takeModalTitle}>Take {selectedMedicine?.name}</Text>
              <Pressable onPress={() => setTakeModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={THEME.textHeading} />
              </Pressable>
            </View>

            <View style={styles.takeModalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Time</Text>
                <Text style={styles.timeDisplay}>{formatTime(logFormData.takenAt)}</Text>
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
              <Pressable style={styles.takeConfirmBtn} onPress={handleLogMedicine}>
                <LinearGradient
                  colors={[THEME.primary, '#E11D48']}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
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
  addBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  addBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },

  // Stats
  statsSection: { marginHorizontal: 24, marginBottom: 16 },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  statItem: { flex: 1, alignItems: 'center' },
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
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: THEME.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textBody,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32 },

  // Empty State
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
  emptyActionText: { fontSize: 15, fontWeight: '700', color: THEME.primary },

  // Cards
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
  cardInactive: {
    backgroundColor: '#F5F0EB',
    opacity: 0.6,
  },
  cardLeft: { marginRight: 12 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxInactive: { backgroundColor: THEME.border },
  cardCenter: { flex: 1 },
  cardRight: { alignItems: 'flex-end', gap: 8 },
  medName: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 4,
  },
  textInactive: { color: THEME.textMuted, textDecorationLine: 'line-through' },
  medPurpose: {
    fontSize: 13,
    color: THEME.textBody,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  medMeta: { fontSize: 12, color: THEME.textMuted },
  takeBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  takeBtnDisabled: { opacity: 0.5 },
  takeBtnGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  takeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  smallBtn: {
    padding: 4,
  },

  // Calendar
  calendarCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 12,
  },

  // Logs
  logsSection: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textHeading,
    marginBottom: 16,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  logLeft: { marginRight: 12, marginTop: 2 },
  logIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logCenter: { flex: 1 },
  logMedicineName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 2,
  },
  logTime: {
    fontSize: 13,
    color: THEME.textMuted,
    marginBottom: 4,
  },
  logNotes: {
    fontSize: 13,
    color: THEME.textBody,
    fontStyle: 'italic',
  },
  noLogsText: {
    textAlign: 'center',
    color: THEME.textMuted,
    fontSize: 15,
    paddingVertical: 20,
  },

  // Modals
  modalContainer: { flex: 1, backgroundColor: THEME.surface },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: THEME.textHeading },
  closeBtn: { padding: 4 },
  modalBody: { flex: 1, paddingHorizontal: 24, paddingVertical: 20 },

  formGroup: { marginBottom: 24 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: THEME.textHeading,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  timeDisplay: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
  },

  modalFooter: { padding: 24, borderTopWidth: 1, borderTopColor: THEME.border },
  saveBtn: {
    backgroundColor: THEME.primary,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Take Medicine Modal (overlay style)
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  takeModalContainer: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  takeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  takeModalTitle: { fontSize: 20, fontWeight: '800', color: THEME.textHeading },
  takeModalBody: { paddingHorizontal: 24, paddingVertical: 20 },
  takeModalFooter: { padding: 24 },
  takeConfirmBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  takeConfirmGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  takeConfirmText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
