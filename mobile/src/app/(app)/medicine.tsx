import * as React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicationQueries } from "../../features/medications/queries";
import { medicationMutations } from "../../features/medications/mutations";
import type {
  Medication,
  CreateMedicationData,
  UpdateMedicationData,
} from "../../features/medications/types";

const GREEN = "#16A34A";
const GREEN_LIGHT = "#DCFCE7";
const SLATE_50 = "#F8FAFC";
const SLATE_100 = "#F1F5F9";
const SLATE_200 = "#E2E8F0";
const SLATE_400 = "#94A3B8";
const SLATE_500 = "#64748B";
const SLATE_800 = "#1E293B";

export default function MedicinePage() {
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading: isLoadingMedications, refetch, isRefetching } = useQuery(medicationQueries.all());
  const createMutation = useMutation(medicationMutations.create(queryClient));
  const updateMutation = useMutation(medicationMutations.update(queryClient));
  const deleteMutation = useMutation(medicationMutations.delete(queryClient));

  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingMedication, setEditingMedication] = React.useState<Medication | null>(null);

  const [formData, setFormData] = React.useState<CreateMedicationData>({
    name: "",
    purpose: "",
    dosage: "",
    time: "",
    timeLabel: "",
  });

  const openAddModal = () => {
    setEditingMedication(null);
    setFormData({ name: "", purpose: "", dosage: "", time: "", timeLabel: "" });
    setModalVisible(true);
  };

  const openEditModal = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      purpose: medication.purpose || "",
      dosage: medication.dosage || "",
      time: medication.time || "",
      timeLabel: medication.timeLabel || "",
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingMedication(null);
    setFormData({ name: "", purpose: "", dosage: "", time: "", timeLabel: "" });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Medication name is required");
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
          onError: (error: Error) => Alert.alert("Error", error.message || "Failed to update medication"),
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
        onError: (error: Error) => Alert.alert("Error", error.message || "Failed to create medication"),
      });
    }
  };

  const handleDelete = (medication: Medication) => {
    Alert.alert("Delete Medication", `Are you sure you want to delete "${medication.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(medication.id, {
            onError: (error: Error) => Alert.alert("Error", error.message || "Failed to delete medication"),
          });
        },
      },
    ]);
  };

  const handleToggleActive = (medication: Medication) => {
    updateMutation.mutate({ id: medication.id, data: { isActive: !medication.isActive } });
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  if (isLoadingMedications && medications.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GREEN} />
      </SafeAreaView>
    );
  }

  const quickLabels = [
    "Before Breakfast",
    "After Breakfast",
    "Before Lunch",
    "After Lunch",
    "Before Dinner",
    "After Dinner",
    "Before Bed",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medications</Text>
        <Pressable style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={GREEN} />}
      >
        {medications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="medical-outline" size={32} color={GREEN} />
            </View>
            <Text style={styles.emptyTitle}>No medications added yet</Text>
            <Text style={styles.emptySubtitle}>Tap the + button to add your first medication</Text>
          </View>
        ) : (
          medications.map((medication) => (
            <Pressable
              key={medication.id}
              style={[styles.medicationCard, !medication.isActive && styles.medicationCardInactive]}
              onPress={() => openEditModal(medication)}
              onLongPress={() => handleDelete(medication)}
            >
              <View style={styles.medicationRow}>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  {medication.dosage && <Text style={styles.medicationDosage}>{medication.dosage}</Text>}
                  {medication.purpose && <Text style={styles.medicationPurpose}>{medication.purpose}</Text>}
                  <View style={styles.chipsRow}>
                    {medication.time && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>{medication.time}</Text>
                      </View>
                    )}
                    {medication.timeLabel && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>{medication.timeLabel}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable style={styles.toggleButton} onPress={() => handleToggleActive(medication)}>
                  <Ionicons
                    name={medication.isActive ? "checkmark-circle" : "ellipse-outline"}
                    size={28}
                    color={medication.isActive ? GREEN : SLATE_400}
                  />
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={closeModal}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>{editingMedication ? "Edit Medication" : "Add Medication"}</Text>
            <Pressable onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={GREEN} />
              ) : (
                <Text style={styles.modalSave}>Save</Text>
              )}
            </Pressable>
          </View>

          <ScrollView style={styles.formScrollView} contentContainerStyle={styles.formContent}>
            <Text style={styles.formSectionTitle}>Details</Text>
            <View style={styles.formCard}>
              <Text style={styles.formLabel}>Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Aspirin"
                placeholderTextColor={SLATE_400}
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              />
              <Text style={[styles.formLabel, { marginTop: 16 }]}>Dosage</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., 500mg"
                placeholderTextColor={SLATE_400}
                value={formData.dosage}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, dosage: text }))}
              />
            </View>

            <Text style={styles.formSectionTitle}>Optional Info</Text>
            <View style={styles.formCard}>
              <Text style={styles.formLabel}>Purpose</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Headache"
                placeholderTextColor={SLATE_400}
                value={formData.purpose}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, purpose: text }))}
              />
              <Text style={[styles.formLabel, { marginTop: 16 }]}>Time</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., 08:00"
                placeholderTextColor={SLATE_400}
                value={formData.time}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, time: text }))}
              />
              <Text style={[styles.formLabel, { marginTop: 16 }]}>Time Label</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Morning"
                placeholderTextColor={SLATE_400}
                value={formData.timeLabel}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, timeLabel: text }))}
              />
            </View>

            <Text style={styles.formSectionTitle}>Quick Labels</Text>
            <View style={styles.quickLabelsContainer}>
              {quickLabels.map((label) => (
                <Pressable
                  key={label}
                  style={[styles.quickLabelChip, formData.timeLabel === label && styles.quickLabelChipSelected]}
                  onPress={() => setFormData((prev) => ({ ...prev, timeLabel: label }))}
                >
                  <Text style={[styles.quickLabelText, formData.timeLabel === label && styles.quickLabelTextSelected]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SLATE_50 },
  loadingContainer: { flex: 1, backgroundColor: SLATE_50, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: SLATE_100,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: SLATE_800 },
  addButton: {
    backgroundColor: GREEN,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24 },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: SLATE_200,
    borderStyle: "dashed",
  },
  emptyIconWrapper: { backgroundColor: GREEN_LIGHT, padding: 16, borderRadius: 999, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: "bold", color: SLATE_800 },
  emptySubtitle: { fontSize: 14, color: SLATE_500, marginTop: 4, textAlign: "center" },
  medicationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  medicationCardInactive: { opacity: 0.5 },
  medicationRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  medicationInfo: { flex: 1 },
  medicationName: { fontSize: 16, fontWeight: "bold", color: SLATE_800 },
  medicationDosage: { fontSize: 14, color: SLATE_500, marginTop: 4 },
  medicationPurpose: { fontSize: 12, color: SLATE_400, marginTop: 4, fontStyle: "italic" },
  chipsRow: { flexDirection: "row", marginTop: 8 },
  chip: { backgroundColor: SLATE_100, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: "600", color: SLATE_500 },
  toggleButton: { padding: 4 },
  modalContainer: { flex: 1, backgroundColor: SLATE_50 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: SLATE_200,
  },
  modalCancel: { fontSize: 16, color: SLATE_500 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: SLATE_800 },
  modalSave: { fontSize: 16, fontWeight: "bold", color: GREEN },
  formScrollView: { flex: 1 },
  formContent: { padding: 24 },
  formSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: SLATE_500,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  formCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: SLATE_200 },
  formLabel: { fontSize: 12, fontWeight: "bold", color: SLATE_500, marginBottom: 6 },
  formInput: {
    backgroundColor: SLATE_50,
    borderWidth: 1,
    borderColor: SLATE_200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: SLATE_800,
  },
  quickLabelsContainer: { flexDirection: "row", flexWrap: "wrap" },
  quickLabelChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: SLATE_200,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  quickLabelChipSelected: { backgroundColor: GREEN, borderColor: GREEN },
  quickLabelText: { fontSize: 12, fontWeight: "bold", color: SLATE_500 },
  quickLabelTextSelected: { color: "#FFFFFF" },
});
