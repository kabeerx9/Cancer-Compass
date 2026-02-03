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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { MedicationDetailModal } from '@/components/medications/MedicationDetailModal';
import { MedicationCardSkeleton } from '@/components/skeleton';
import {
  type CreateMedicationData,
  type Medication,
  medicationMutations,
  medicationQueries,
  type UpdateMedicationData,
} from '@/features/medications';

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
  const [isManuallyRefreshing, setIsManuallyRefreshing] = React.useState(false);

  const {
    data: medications = [],
    isLoading,
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

  const handleRefresh = () => {
    setIsManuallyRefreshing(true);
    refetchMedications();
    setTimeout(() => setIsManuallyRefreshing(false), 1000);
  };

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
          onSuccess: () => {
            closeMedEditModal();
          },
          onError: (error: Error) => {
            Toast.show({
              type: 'error',
              text1: 'Failed to update medication',
              text2: error.message,
              position: 'bottom',
            });
          },
        }
      );
    } else {
      medicationCreateMutation.mutate(medFormData, {
        onSuccess: () => {
          closeMedEditModal();
        },
        onError: (error: Error) => {
          Toast.show({
            type: 'error',
            text1: 'Failed to add medication',
            text2: error.message,
            position: 'bottom',
          });
        },
      });
    }
  };

  const handleDeleteMedication = (medication: Medication) => {
    closeMedDetailModal();
    medicationDeleteMutation.mutate(medication.id, {
      onSuccess: () => {
        Toast.show({
          type: 'info',
          text1: 'Medication deleted',
          position: 'bottom',
        });
      },
      onError: (error: Error) => {
        Toast.show({
          type: 'error',
          text1: 'Failed to delete medication',
          text2: error.message,
          position: 'bottom',
        });
      },
    });
  };

  const handleToggleMedicationActive = (medication: Medication) => {
    const newStatus = !medication.isActive;
    medicationUpdateMutation.mutate(
      {
        id: medication.id,
        data: { isActive: newStatus },
      },
      {
        onSuccess: () => {
          Toast.show({
            type: 'info',
            text1: newStatus ? 'Medication activated' : 'Medication paused',
            text2: medication.name,
            position: 'bottom',
            visibilityTime: 2000,
          });
        },
        onError: () => {
          Toast.show({
            type: 'error',
            text1: 'Failed to update medication status',
            position: 'bottom',
          });
        },
      }
    );
  };

  const activeMedCount = medications.filter((m) => m.isActive).length;
  const saving =
    medicationCreateMutation.isPending ||
    medicationUpdateMutation.isPending;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Medications</Text>
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

        <View style={styles.sosButtonContainer}>
          <Pressable
            style={styles.sosButton}
            onPress={() => router.push('/sos-medicines')}
          >
            <LinearGradient
              colors={[THEME.secondary, '#E11D48']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sosButtonGradient}
            >
              <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
              <Text style={styles.sosButtonText}>SOS Medicines</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </View>

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
          {isLoading ? (
            <>
              <MedicationCardSkeleton />
              <MedicationCardSkeleton />
              <MedicationCardSkeleton />
              <MedicationCardSkeleton />
            </>
          ) : medications.length === 0 ? (
            <Animated.View style={styles.emptyState} entering={FadeInDown.springify()}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="medical-outline" size={48} color={THEME.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Medications</Text>
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
                          color={medication.isActive ? THEME.primary : THEME.textMuted}
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
                      style={styles.toggleContainer}
                    >
                      <Text style={[
                        styles.toggleLabel,
                        medication.isActive && styles.toggleLabelActive,
                      ]}>
                        {medication.isActive ? 'Active' : 'Paused'}
                      </Text>
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
        </ScrollView>

        <Pressable style={styles.fab} onPress={openMedAddModal}>
          <LinearGradient
            colors={[THEME.primary, '#0D9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
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
  sosButtonContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sosButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: THEME.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sosButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  sosButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  toggleLabelActive: {
    color: THEME.primary,
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
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: THEME.primary,
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
    fontSize: 20,
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
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  formGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
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
});
