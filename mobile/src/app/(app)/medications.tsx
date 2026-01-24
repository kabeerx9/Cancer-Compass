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

import {
  medicationMutations,
  medicationQueries,
  type CreateMedicationData,
  type Medication,
  type UpdateMedicationData,
} from '@/features/medications';

// Theme Constants (Clean Light Theme)
const THEME = {
  primary: '#2563EB', // Royal Blue
  primaryLight: '#EFF6FF',
  background: '#F9FAFB',
  surface: '#ffffff',
  textHeading: '#111827',
  textBody: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#F3F4F6',
  accent: '#10B981',
  success: '#10B981', // Added success color
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

  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingMedication, setEditingMedication] =
    React.useState<Medication | null>(null);

  const [formData, setFormData] = React.useState<CreateMedicationData>({
    name: '',
    purpose: '',
    dosage: '',
    time: '',
    timeLabel: '',
  });

  const openAddModal = () => {
    setEditingMedication(null);
    setFormData({ name: '', purpose: '', dosage: '', time: '', timeLabel: '' });
    setModalVisible(true);
  };

  const openEditModal = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      purpose: medication.purpose || '',
      dosage: medication.dosage || '',
      time: medication.time || '',
      timeLabel: medication.timeLabel || '',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
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
          onSuccess: closeModal,
          onError: (error: Error) =>
            Alert.alert(
              'Error',
              error.message || 'Failed to update medication'
            ),
        }
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
        onSuccess: closeModal,
        onError: (error: Error) =>
          Alert.alert('Error', error.message || 'Failed to create medication'),
      });
    }
  };

  const handleDelete = (medication: Medication) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete "${medication.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(medication.id, {
              onError: (error: Error) =>
                Alert.alert(
                  'Error',
                  error.message || 'Failed to delete medication'
                ),
            });
          },
        },
      ]
    );
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cabinet</Text>
          <Pressable style={styles.iconBtn} onPress={openAddModal}>
            <Ionicons name="add" size={24} color={THEME.primary} />
          </Pressable>
        </View>

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
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="medical-outline" size={32} color={THEME.primary} />
              </View>
              <Text style={styles.emptyTitle}>Your Cabinet is Empty</Text>
              <Text style={styles.emptySubtitle}>
                Add medications here to track them
              </Text>
            </View>
          ) : (
            medications.map((medication) => (
              <Pressable
                key={medication.id}
                style={[
                  styles.card,
                  !medication.isActive && styles.cardInactive,
                ]}
                onPress={() => openEditModal(medication)}
                onLongPress={() => handleDelete(medication)}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.iconBox, !medication.isActive && styles.iconBoxInactive]}>
                     <Ionicons name="medical" size={18} color={medication.isActive ? THEME.primary : THEME.textMuted} />
                  </View>
                </View>

                <View style={styles.cardCenter}>
                  <Text style={[styles.medName, !medication.isActive && styles.textInactive]}>{medication.name}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.medMeta}>{medication.dosage || 'No dosage'}</Text>
                    {medication.time && (
                      <>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.medMeta}>{medication.time}</Text>
                      </>
                    )}
                  </View>
                </View>

                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleToggleActive(medication);
                  }}
                  style={styles.toggleBtn}
                >
                  <Ionicons
                    name={medication.isActive ? "toggle" : "toggle-outline"}
                    size={28}
                    color={medication.isActive ? THEME.success : THEME.textMuted}
                  />
                </Pressable>
              </Pressable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Clean Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingMedication ? 'Edit Medication' : 'Add Medication'}
            </Text>
            <Pressable onPress={closeModal} style={styles.closeBtn}>
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
                onChangeText={(t) => setFormData({...formData, name: t})}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, {flex: 1, marginRight: 12}]}>
                <Text style={styles.label}>Dosage</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 50mg"
                  value={formData.dosage}
                  onChangeText={(t) => setFormData({...formData, dosage: t})}
                  placeholderTextColor={THEME.textMuted}
                />
              </View>
              <View style={[styles.formGroup, {flex: 1}]}>
                <Text style={styles.label}>Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="08:00"
                  value={formData.time}
                  onChangeText={(t) => setFormData({...formData, time: t})}
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
                      formData.timeLabel === label && styles.chipActive
                    ]}
                    onPress={() => setFormData({...formData, timeLabel: label})}
                  >
                    <Text style={[
                      styles.chipText,
                      formData.timeLabel === label && styles.chipTextActive
                    ]}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Purpose (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="What is it for?"
                value={formData.purpose}
                onChangeText={(t) => setFormData({...formData, purpose: t})}
                placeholderTextColor={THEME.textMuted}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Save</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: THEME.textHeading },
  iconBtn: { padding: 12, backgroundColor: '#F3F4F6', borderRadius: 12 },

  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 24 },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: THEME.textHeading, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: THEME.textMuted },

  // Cards - Horizontal Layout
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInactive: {
    backgroundColor: '#FAFAFA',
    opacity: 0.6,
  },
  cardLeft: { marginRight: 16 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxInactive: { backgroundColor: '#F3F4F6' },

  cardCenter: { flex: 1 },
  medName: { fontSize: 16, fontWeight: '700', color: THEME.textHeading, marginBottom: 4 },
  textInactive: { color: THEME.textMuted, textDecorationLine: 'line-through' },

  metaRow: { flexDirection: 'row', alignItems: 'center' },
  medMeta: { fontSize: 13, color: THEME.textMuted, fontWeight: '600' },
  dot: { marginHorizontal: 6, color: THEME.textMuted, fontSize: 12 },

  toggleBtn: {
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },

  // Modal styling (unchanged mostly but cleaner bg)
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: THEME.textHeading },
  closeBtn: { padding: 4 },
  modalBody: { flex: 1, padding: 24 },

  formGroup: { marginBottom: 20 },
  row: { flexDirection: 'row' },
  label: { fontSize: 13, fontWeight: '700', color: THEME.textHeading, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: THEME.textHeading,
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  chipActive: { backgroundColor: THEME.textHeading, borderColor: THEME.textHeading },
  chipText: { fontSize: 13, fontWeight: '600', color: THEME.textBody },
  chipTextActive: { color: '#FFFFFF' },

  modalFooter: { padding: 24, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  saveBtn: {
    backgroundColor: THEME.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
