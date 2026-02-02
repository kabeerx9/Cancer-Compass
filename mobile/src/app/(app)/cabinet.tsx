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

import { MedicationDetailModal } from '@/components/medications/MedicationDetailModal';
import {
  LogCardSkeleton,
  MedicationCardSkeleton,
  Skeleton,
  StatCardSkeleton,
} from '@/components/skeleton';
import {
  type CreateMedicationData,
  type Medication,
  medicationMutations,
  medicationQueries,
  type UpdateMedicationData,
} from '@/features/medications';
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
  primary: '#14B8A6', // Warm Teal for regular medications
  primaryLight: '#CCFBF1',
  secondary: '#F43F5E', // Warm Coral for SOS
  secondaryLight: '#FFE4E6',
  background: '#FFFBF9',
  surface: '#FFFFFF',
  textHeading: '#2D2824',
  textBody: '#6B5D50',
  textMuted: '#B8A89A',
  border: '#E8E0D8',
  success: '#10B981',
  shadow: 'rgba(45, 40, 36, 0.08)',
};

type TabType = 'medications' | 'sos';
type SosViewMode = 'cabinet' | 'history';

const quickLabels = [
  'Before Breakfast',
  'After Breakfast',
  'Before Lunch',
  'After Lunch',
  'Before Dinner',
  'After Dinner',
  'Before Bed',
];

export default function CabinetPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<TabType>('medications');
  const [isManuallyRefreshing, setIsManuallyRefreshing] = React.useState(false);

  // ===== MEDICATIONS STATE =====
  const {
    data: medications = [],
    isLoading: isLoadingMedications,
    refetch: refetchMedications,
  } = useQuery(medicationQueries.all());

  const medicationCreateMutation = useMutation(
    medicationMutations.create(queryClient)
  );
  const medicationUpdateMutation = useMutation(
    medicationMutations.update(queryClient)
  );
  const medicationDeleteMutation = useMutation(
    medicationMutations.delete(queryClient)
  );

  const [medDetailModalVisible, setMedDetailModalVisible] = React.useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = React.useState<string | null>(null);
  const [medEditModalVisible, setMedEditModalVisible] = React.useState(false);
  const [editingMedication, setEditingMedication] = React.useState<Medication | null>(null);
  const [medFormData, setMedFormData] = React.useState<CreateMedicationData>({
    name: '',
    purpose: '',
    dosage: '',
    time: '',
    timeLabel: '',
  });

  // ===== SOS MEDICINES STATE =====
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

  // ===== HANDLERS =====
  const handleRefresh = () => {
    setIsManuallyRefreshing(true);
    if (activeTab === 'medications') {
      refetchMedications();
    } else {
      queryClient.invalidateQueries({ queryKey: ['sos-medicines'] });
    }
    setTimeout(() => setIsManuallyRefreshing(false), 1000);
  };

  // ===== MEDICATION HANDLERS =====
  const openMedDetailModal = (medication: Medication) => {
    setSelectedMedicationId(medication.id);
    setMedDetailModalVisible(true);
  };

  const closeMedDetailModal = () => {
    setMedDetailModalVisible(false);
    setSelectedMedicationId(null);
  };

  const openMedAddModal = () => {
    setEditingMedication(null);
    setMedFormData({ name: '', purpose: '', dosage: '', time: '', timeLabel: '' });
    setMedEditModalVisible(true);
  };

  const openMedEditModal = (medication: Medication) => {
    setEditingMedication(medication);
    setMedFormData({
      name: medication.name,
      purpose: medication.purpose || '',
      dosage: medication.dosage || '',
      time: medication.time || '',
      timeLabel: medication.timeLabel || '',
    });
    setMedEditModalVisible(true);
  };

  const closeMedEditModal = () => {
    setMedEditModalVisible(false);
    setEditingMedication(null);
    setMedFormData({ name: '', purpose: '', dosage: '', time: '', timeLabel: '' });
  };

  const handleSaveMedication = () => {
    if (!medFormData.name.trim()) {
      Alert.alert('Error', 'Medication name is required');
      return;
    }

    if (editingMedication) {
      const updateData: UpdateMedicationData = {
        name: medFormData.name.trim(),
        purpose: medFormData.purpose?.trim() || undefined,
        dosage: medFormData.dosage?.trim() || undefined,
        time: medFormData.time?.trim() || undefined,
        timeLabel: medFormData.timeLabel?.trim() || undefined,
      };
      medicationUpdateMutation.mutate(
        { id: editingMedication.id, data: updateData },
        {
          onSuccess: closeMedEditModal,
          onError: (error: Error) =>
            Alert.alert('Error', error.message || 'Failed to update medication'),
        }
      );
    } else {
      medicationCreateMutation.mutate(medFormData, {
        onSuccess: closeMedEditModal,
        onError: (error: Error) =>
          Alert.alert('Error', error.message || 'Failed to create medication'),
      });
    }
  };

  const handleDeleteMedication = (medication: Medication) => {
    closeMedDetailModal();
    medicationDeleteMutation.mutate(medication.id, {
      onError: (error: Error) =>
        Alert.alert('Error', error.message || 'Failed to delete medication'),
    });
  };

  const handleToggleMedicationActive = (medication: Medication) => {
    medicationUpdateMutation.mutate({
      id: medication.id,
      data: { isActive: !medication.isActive },
    });
  };

  // ===== SOS HANDLERS =====
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

  // ===== HELPERS =====
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

  // ===== RENDER =====
  const isLoading = activeTab === 'medications' ? isLoadingMedications : isLoadingSosMedicines;
  const saving =
    medicationCreateMutation.isPending ||
    medicationUpdateMutation.isPending ||
    sosCreateMutation.isPending ||
    sosUpdateMutation.isPending;

  const activeMedCount = medications.filter((m) => m.isActive).length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Your</Text>
            <Text style={styles.headerTitle}>Medicine Cabinet</Text>
          </View>
          <Pressable style={styles.avatar} onPress={() => router.push('/profile')}>
            <LinearGradient
              colors={[THEME.primary, '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Ionicons name="medical" size={24} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </View>

        {/* Top Tabs */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'medications' && styles.tabActiveMed]}
            onPress={() => setActiveTab('medications')}
          >
            <Ionicons
              name={activeTab === 'medications' ? 'medical' : 'medical-outline'}
              size={20}
              color={activeTab === 'medications' ? '#FFFFFF' : THEME.textBody}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, activeTab === 'medications' && styles.tabTextActive]}>
              Daily Medications
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'sos' && styles.tabActiveSos]}
            onPress={() => setActiveTab('sos')}
          >
            <Ionicons
              name={activeTab === 'sos' ? 'alert-circle' : 'alert-circle-outline'}
              size={20}
              color={activeTab === 'sos' ? '#FFFFFF' : THEME.textBody}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, activeTab === 'sos' && styles.tabTextActive]}>
              SOS Medicines
            </Text>
          </Pressable>
        </View>

        {/* Stats Card */}
        {activeTab === 'medications' && medications.length > 0 && (
          <View style={styles.statsSection}>
            <LinearGradient
              colors={[THEME.primary, '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsCard}
            >
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{activeMedCount}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{medications.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {activeTab === 'sos' && (
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
        )}

        {/* SOS View Mode Toggle */}
        {activeTab === 'sos' && (
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
        )}

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isManuallyRefreshing}
              onRefresh={handleRefresh}
              tintColor={activeTab === 'medications' ? THEME.primary : THEME.secondary}
            />
          }
        >
          {/* Loading Skeleton */}
          {isLoading && (
            <>
              <MedicationCardSkeleton />
              <MedicationCardSkeleton />
              <MedicationCardSkeleton />
              <MedicationCardSkeleton />
            </>
          )}

          {/* MEDICATIONS TAB CONTENT */}
          {!isLoading && activeTab === 'medications' && (
            <>
              {medications.length === 0 ? (
                <Animated.View style={styles.emptyState} entering={FadeInDown.springify()}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="medical-outline" size={48} color={THEME.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>Your Cabinet is Empty</Text>
                  <Text style={styles.emptySubtitle}>
                    Add your daily medications to start tracking them
                  </Text>
                  <Pressable style={styles.emptyAction} onPress={openMedAddModal}>
                    <Ionicons name="add-circle" size={20} color={THEME.primary} />
                    <Text style={styles.emptyActionText}>Add First Medication</Text>
                  </Pressable>
                </Animated.View>
              ) : (
                <Animated.View entering={FadeInDown.springify()}>
                  {medications.map((medication, index) => (
                    <Animated.View
                      key={medication.id}
                      entering={FadeInDown.delay(index * 50).springify()}
                    >
                      <Pressable
                        style={[
                          styles.card,
                          !medication.isActive && styles.cardInactive,
                        ]}
                        onPress={() => openMedDetailModal(medication)}
                      >
                        <View style={styles.cardLeft}>
                          <View
                            style={[
                              styles.iconBox,
                              !medication.isActive && styles.iconBoxInactive,
                            ]}
                          >
                            <Ionicons
                              name="medical"
                              size={22}
                              color={
                                medication.isActive ? THEME.primary : THEME.textMuted
                              }
                            />
                          </View>
                        </View>

                        <View style={styles.cardCenter}>
                          <Text
                            style={[
                              styles.medName,
                              !medication.isActive && styles.textInactive,
                            ]}
                          >
                            {medication.name}
                          </Text>
                          <View style={styles.metaRow}>
                            <Text style={styles.medMeta}>
                              {medication.dosage || 'No dosage'}
                            </Text>
                            {medication.time && (
                              <>
                                <Text style={styles.dot}>•</Text>
                                <Text style={styles.medMeta}>{medication.time}</Text>
                              </>
                            )}
                          </View>
                          {medication.purpose && (
                            <Text style={styles.medPurpose}>{medication.purpose}</Text>
                          )}
                        </View>

                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleToggleMedicationActive(medication);
                          }}
                          style={styles.toggleBtn}
                        >
                          <View
                            style={[
                              styles.toggleTrack,
                              medication.isActive && styles.toggleTrackActive,
                            ]}
                          >
                            <View
                              style={[
                                styles.toggleThumb,
                                medication.isActive && styles.toggleThumbActive,
                              ]}
                            />
                          </View>
                        </Pressable>
                      </Pressable>
                    </Animated.View>
                  ))}
                </Animated.View>
              )}
            </>
          )}

          {/* SOS TAB CONTENT */}
          {!isLoading && activeTab === 'sos' && (
            <>
              {sosViewMode === 'cabinet' ? (
                <>
                  {sosMedicines.length === 0 ? (
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
              ) : (
                // SOS History View
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
            </>
          )}
        </ScrollView>

        {/* Floating Add Button */}
        <Pressable
          style={[
            styles.fab,
            {
              shadowColor: activeTab === 'medications' ? THEME.primary : THEME.secondary,
            },
          ]}
          onPress={activeTab === 'medications' ? openMedAddModal : openSosAddModal}
        >
          <LinearGradient
            colors={
              activeTab === 'medications'
                ? [THEME.primary, '#0D9488']
                : [THEME.secondary, '#E11D48']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      </SafeAreaView>

      {/* MEDICATION MODALS */}
      <MedicationDetailModal
        visible={medDetailModalVisible}
        medicationId={selectedMedicationId}
        onClose={closeMedDetailModal}
        onEdit={openMedEditModal}
        onDelete={handleDeleteMedication}
      />

      <Modal
        visible={medEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeMedEditModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingMedication ? 'Edit Medication' : 'Add Medication'}
            </Text>
            <Pressable onPress={closeMedEditModal} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={THEME.textHeading} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Medication name"
                value={medFormData.name}
                onChangeText={(t) => setMedFormData({ ...medFormData, name: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Dosage</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 50mg"
                  value={medFormData.dosage}
                  onChangeText={(t) => setMedFormData({ ...medFormData, dosage: t })}
                  placeholderTextColor={THEME.textMuted}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="08:00"
                  value={medFormData.time}
                  onChangeText={(t) => setMedFormData({ ...medFormData, time: t })}
                  placeholderTextColor={THEME.textMuted}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Frequency Label</Text>
              <View style={styles.chips}>
                {quickLabels.map((label) => (
                  <Pressable
                    key={label}
                    style={[
                      styles.chip,
                      medFormData.timeLabel === label && styles.chipActive,
                    ]}
                    onPress={() => setMedFormData({ ...medFormData, timeLabel: label })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        medFormData.timeLabel === label && styles.chipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Purpose (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What is it for?"
                value={medFormData.purpose}
                onChangeText={(t) => setMedFormData({ ...medFormData, purpose: t })}
                placeholderTextColor={THEME.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.saveBtn, { backgroundColor: THEME.primary }]}
              onPress={handleSaveMedication}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.saveText}>
                    {editingMedication ? 'Update' : 'Save'} Medication
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* SOS MODALS */}
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

          <ScrollView style={styles.modalBody}>
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
          </ScrollView>

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

          <ScrollView style={styles.modalBody}>
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
          </ScrollView>

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

      {/* SOS Take Medicine Modal */}
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Top Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 8,
  },
  tabActiveMed: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  tabActiveSos: {
    backgroundColor: THEME.secondary,
    borderColor: THEME.secondary,
  },
  tabIcon: {
    marginRight: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textBody,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // Stats
  statsSection: {
    marginHorizontal: 24,
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

  // SOS Toggle
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

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  // Empty State
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
  iconBoxInactive: {
    backgroundColor: THEME.border,
  },
  medName: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 6,
  },
  textInactive: {
    color: THEME.textMuted,
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  medMeta: {
    fontSize: 13,
    color: THEME.textBody,
    fontWeight: '600',
  },
  dot: {
    marginHorizontal: 8,
    color: THEME.textMuted,
    fontSize: 12,
  },
  medPurpose: {
    fontSize: 12,
    color: THEME.textMuted,
    fontStyle: 'italic',
  },

  // Toggle Button
  toggleBtn: {
    padding: 8,
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.border,
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: THEME.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },

  // SOS Actions
  takeBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: THEME.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  takeBtnDisabled: {
    opacity: 0.5,
  },
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
    borderWidth: 2,
    borderColor: THEME.secondaryLight,
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
    borderWidth: 2,
    borderColor: THEME.secondaryLight,
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
  logLeft: {
    marginRight: 12,
    marginTop: 2,
  },
  logIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logCenter: {
    flex: 1,
  },
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

  // Floating Action Button
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 100,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: THEME.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textHeading,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },

  // Form
  formGroup: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
  },
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
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  timeDisplay: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
  },

  // Chips
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  chipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textBody,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // Buttons
  saveBtn: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Take Modal
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
  takeModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textHeading,
  },
  takeModalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  takeModalFooter: {
    padding: 24,
  },
  takeConfirmBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: THEME.secondary,
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
  takeConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
