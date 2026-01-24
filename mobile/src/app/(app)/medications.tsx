import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { MedicationDetailModal } from '@/components/medications/MedicationDetailModal';
import {
  medicationMutations,
  medicationQueries,
  type CreateMedicationData,
  type Medication,
  type UpdateMedicationData,
} from '@/features/medications';

// Warm Healing Theme
const THEME = {
  primary: '#14B8A6', // Warm Teal
  primaryLight: '#CCFBF1',
  background: '#FFFBF9', // Warm cream
  surface: '#FFFFFF',
  textHeading: '#2D2824',
  textBody: '#6B5D50',
  textMuted: '#B8A89A',
  border: '#E8E0D8',
  success: '#10B981',
  shadow: 'rgba(45, 40, 36, 0.08)',
};

export default function MedicationsPage() {
  const queryClient = useQueryClient();

  const {
    data: medications = [],
    isLoading: isLoadingMedications,
    refetch,
    isRefetching,
  } = useQuery(medicationQueries.all());
  const createMutation = useMutation(medicationMutations.create(queryClient));
  const updateMutation = useMutation(medicationMutations.update(queryClient));
  const deleteMutation = useMutation(medicationMutations.delete(queryClient));

  // Detail Modal State
  const [detailModalVisible, setDetailModalVisible] = React.useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = React.useState<string | null>(null);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [editingMedication, setEditingMedication] = React.useState<Medication | null>(null);

  const [formData, setFormData] = React.useState<CreateMedicationData>({
    name: '',
    purpose: '',
    dosage: '',
    time: '',
    timeLabel: '',
  });

  // Open detail modal when card is tapped
  const openDetailModal = (medication: Medication) => {
    setSelectedMedicationId(medication.id);
    setDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedMedicationId(null);
  };

  // Open add modal (for new medications)
  const openAddModal = () => {
    setEditingMedication(null);
    setFormData({ name: '', purpose: '', dosage: '', time: '', timeLabel: '' });
    setEditModalVisible(true);
  };

  // Open edit modal (from detail modal)
  const openEditModal = (medication: Medication) => {
    setDetailModalVisible(false);
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      purpose: medication.purpose || '',
      dosage: medication.dosage || '',
      time: medication.time || '',
      timeLabel: medication.timeLabel || '',
    });
    // Small delay to let detail modal close
    setTimeout(() => {
      setEditModalVisible(true);
    }, 100);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingMedication(null);
    setFormData({ name: '', purpose: '', dosage: '', time: '', timeLabel: '' });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Medication name is required');
      return;
    }

    if (editingMedication) {
      const updateData: UpdateMedicationData = {
        name: formData.name.trim(),
        purpose: formData.purpose?.trim() || undefined,
        dosage: formData.dosage?.trim() || undefined,
        time: formData.time?.trim() || undefined,
        timeLabel: formData.timeLabel?.trim() || undefined,
      };
      updateMutation.mutate(
        { id: editingMedication.id, data: updateData },
        {
          onSuccess: closeEditModal,
          onError: (error: Error) =>
            Alert.alert('Error', error.message || 'Failed to update medication'),
        },
      );
    } else {
      const createData: CreateMedicationData = {
        name: formData.name.trim(),
        purpose: formData.purpose?.trim() || undefined,
        dosage: formData.dosage?.trim() || undefined,
        time: formData.time?.trim() || undefined,
        timeLabel: formData.timeLabel?.trim() || undefined,
      };
      createMutation.mutate(createData, {
        onSuccess: closeEditModal,
        onError: (error: Error) =>
          Alert.alert('Error', error.message || 'Failed to create medication'),
      });
    }
  };

  const handleDelete = (medication: Medication) => {
    closeDetailModal();
    deleteMutation.mutate(medication.id, {
      onError: (error: Error) =>
        Alert.alert('Error', error.message || 'Failed to delete medication'),
    });
  };

  const handleToggleActive = (medication: Medication) => {
    updateMutation.mutate({
      id: medication.id,
      data: { isActive: !medication.isActive },
    });
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  if (isLoadingMedications && medications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  const quickLabels = [
    'Before Breakfast',
    'After Breakfast',
    'Before Lunch',
    'After Lunch',
    'Before Dinner',
    'After Dinner',
    'Before Bed',
  ];

  const activeCount = medications.filter((m) => m.isActive).length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Your</Text>
            <Text style={styles.headerTitle}>Medication Cabinet</Text>
          </View>
          <Pressable
            style={[styles.addBtn, { shadowColor: THEME.primary }]}
            onPress={openAddModal}
          >
            <LinearGradient
              colors={[THEME.primary, '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addBtnGradient}
            >
              <Ionicons name="add" size={26} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </View>

        {/* Stats Card */}
        {medications.length > 0 && (
          <View style={styles.statsSection}>
            <LinearGradient
              colors={[THEME.primary, '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsCard}
            >
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{activeCount}</Text>
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

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={THEME.primary}
            />
          }
        >
          {medications.length === 0 ? (
            <Animated.View style={styles.emptyState} entering={FadeInDown.springify()}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="medical-outline" size={48} color={THEME.primary} />
              </View>
              <Text style={styles.emptyTitle}>Your Cabinet is Empty</Text>
              <Text style={styles.emptySubtitle}>
                Add your medications to start tracking them
              </Text>
              <Pressable style={styles.emptyAction} onPress={openAddModal}>
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
                    onPress={() => openDetailModal(medication)}
                  >
                    <View style={styles.cardLeft}>
                      <View
                        style={[styles.iconBox, !medication.isActive && styles.iconBoxInactive]}
                      >
                        <Ionicons
                          name="medical"
                          size={22}
                          color={medication.isActive ? THEME.primary : THEME.textMuted}
                        />
                      </View>
                    </View>

                    <View style={styles.cardCenter}>
                      <Text style={[styles.medName, !medication.isActive && styles.textInactive]}>
                        {medication.name}
                      </Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.medMeta}>{medication.dosage || 'No dosage'}</Text>
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
                        handleToggleActive(medication);
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
        </ScrollView>
      </SafeAreaView>

      {/* Detail Modal */}
      <MedicationDetailModal
        visible={detailModalVisible}
        medicationId={selectedMedicationId}
        onClose={closeDetailModal}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Edit/Add Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingMedication ? 'Edit Medication' : 'Add Medication'}
            </Text>
            <Pressable onPress={closeEditModal} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={THEME.textHeading} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Medication name"
                value={formData.name}
                onChangeText={(t) => setFormData({ ...formData, name: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Dosage</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 50mg"
                  value={formData.dosage}
                  onChangeText={(t) => setFormData({ ...formData, dosage: t })}
                  placeholderTextColor={THEME.textMuted}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="08:00"
                  value={formData.time}
                  onChangeText={(t) => setFormData({ ...formData, time: t })}
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
                      formData.timeLabel === label && styles.chipActive,
                    ]}
                    onPress={() => setFormData({ ...formData, timeLabel: label })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.timeLabel === label && styles.chipTextActive,
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
                value={formData.purpose}
                onChangeText={(t) => setFormData({ ...formData, purpose: t })}
                placeholderTextColor={THEME.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.saveText}>Save Medication</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerSubtitle: { fontSize: 14, color: THEME.textMuted, fontWeight: '600', marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: THEME.textHeading, letterSpacing: -0.5 },
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
  statsSection: { marginHorizontal: 24, marginBottom: 20 },
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
  statNumber: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', lineHeight: 32 },
  statLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32 },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: THEME.textHeading, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: THEME.textBody, textAlign: 'center', maxWidth: '80%', lineHeight: 22, marginBottom: 24 },
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
  cardLeft: { marginRight: 16 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxInactive: { backgroundColor: THEME.border },

  cardCenter: { flex: 1 },
  medName: { fontSize: 17, fontWeight: '700', color: THEME.textHeading, marginBottom: 6 },
  textInactive: { color: THEME.textMuted, textDecorationLine: 'line-through' },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  medMeta: { fontSize: 13, color: THEME.textBody, fontWeight: '600' },
  dot: { marginHorizontal: 8, color: THEME.textMuted, fontSize: 12 },
  medPurpose: { fontSize: 12, color: THEME.textMuted, fontStyle: 'italic' },

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

  // Modal
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
  row: { flexDirection: 'row' },
  label: { fontSize: 13, fontWeight: '700', color: THEME.textHeading, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
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

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  chipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: THEME.textBody },
  chipTextActive: { color: '#FFFFFF' },

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
});
