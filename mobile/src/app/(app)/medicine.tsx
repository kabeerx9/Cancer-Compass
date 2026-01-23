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
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { medicationApi, Medication, CreateMedicationData } from "../../lib/api";

export default function MedicinePage() {
  const { getToken } = useAuth();
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingMedication, setEditingMedication] = React.useState<Medication | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState<CreateMedicationData>({
    name: "",
    purpose: "",
    dosage: "",
    time: "",
    timeLabel: "",
  });

  const fetchMedications = React.useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await medicationApi.getAll(token);
      if (response.success && response.data) {
        setMedications(response.data);
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  React.useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMedications();
  };

  const openAddModal = () => {
    setEditingMedication(null);
    setFormData({
      name: "",
      purpose: "",
      dosage: "",
      time: "",
      timeLabel: "",
    });
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
    setFormData({
      name: "",
      purpose: "",
      dosage: "",
      time: "",
      timeLabel: "",
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Medication name is required");
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;

      const dataToSend = {
        name: formData.name.trim(),
        purpose: formData.purpose?.trim() || undefined,
        dosage: formData.dosage?.trim() || undefined,
        time: formData.time?.trim() || undefined,
        timeLabel: formData.timeLabel?.trim() || undefined,
      };

      let response;
      if (editingMedication) {
        response = await medicationApi.update(editingMedication.id, dataToSend, token);
      } else {
        response = await medicationApi.create(dataToSend, token);
      }

      if (response.success) {
        closeModal();
        fetchMedications();
      } else {
        Alert.alert("Error", response.message || "Failed to save medication");
      }
    } catch (error) {
      console.error("Error saving medication:", error);
      Alert.alert("Error", "Failed to save medication");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (medication: Medication) => {
    Alert.alert(
      "Delete Medication",
      `Are you sure you want to delete "${medication.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) return;

              const response = await medicationApi.delete(medication.id, token);
              if (response.success) {
                fetchMedications();
              } else {
                Alert.alert("Error", response.message || "Failed to delete medication");
              }
            } catch (error) {
              console.error("Error deleting medication:", error);
              Alert.alert("Error", "Failed to delete medication");
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (medication: Medication) => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await medicationApi.update(
        medication.id,
        { isActive: !medication.isActive },
        token
      );

      if (response.success) {
        fetchMedications();
      }
    } catch (error) {
      console.error("Error toggling medication:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg justify-center items-center">
        <ActivityIndicator size="large" color="#4A90A4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4">
        <Text className="text-2xl font-bold text-text">Medications</Text>
        <Pressable
          className="bg-cta w-12 h-12 rounded-full justify-center items-center"
          onPress={openAddModal}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Medication List */}
      <ScrollView
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {medications.length === 0 ? (
          <View className="bg-surface rounded-2xl p-6 items-center">
            <Ionicons name="medical-outline" size={48} color="#9A9A9A" />
            <Text className="text-text-muted text-center mt-4">
              No medications added yet
            </Text>
            <Text className="text-text-muted text-center text-sm mt-1">
              Tap the + button to add your first medication
            </Text>
          </View>
        ) : (
          medications.map((medication) => (
            <Pressable
              key={medication.id}
              className={`bg-surface rounded-2xl p-4 mb-3 ${
                !medication.isActive ? "opacity-50" : ""
              }`}
              onPress={() => openEditModal(medication)}
              onLongPress={() => handleDelete(medication)}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-text">
                    {medication.name}
                  </Text>
                  {medication.dosage && (
                    <Text className="text-text-muted mt-1">
                      {medication.dosage}
                    </Text>
                  )}
                  {medication.purpose && (
                    <Text className="text-text-soft text-sm mt-1">
                      {medication.purpose}
                    </Text>
                  )}
                  <View className="flex-row items-center mt-2">
                    {medication.time && (
                      <View className="bg-chip px-3 py-1 rounded-full mr-2">
                        <Text className="text-text-soft text-sm">
                          {medication.time}
                        </Text>
                      </View>
                    )}
                    {medication.timeLabel && (
                      <View className="bg-chip px-3 py-1 rounded-full">
                        <Text className="text-text-soft text-sm">
                          {medication.timeLabel}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable
                  className="p-2"
                  onPress={() => handleToggleActive(medication)}
                >
                  <Ionicons
                    name={medication.isActive ? "checkmark-circle" : "ellipse-outline"}
                    size={28}
                    color={medication.isActive ? "#4CAF50" : "#9A9A9A"}
                  />
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
        <View className="h-6" />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView className="flex-1 bg-bg">
          {/* Modal Header */}
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-border">
            <Pressable onPress={closeModal}>
              <Text className="text-cta text-base">Cancel</Text>
            </Pressable>
            <Text className="text-lg font-semibold text-text">
              {editingMedication ? "Edit Medication" : "Add Medication"}
            </Text>
            <Pressable onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#4A90A4" />
              ) : (
                <Text className="text-cta text-base font-semibold">Save</Text>
              )}
            </Pressable>
          </View>

          {/* Form */}
          <ScrollView className="flex-1 px-5 py-4">
            <View className="mb-4">
              <Text className="text-text-soft text-sm mb-2 font-medium">
                Medication Name *
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 text-text text-base"
                placeholder="e.g., Aspirin"
                placeholderTextColor="#9A9A9A"
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              />
            </View>

            <View className="mb-4">
              <Text className="text-text-soft text-sm mb-2 font-medium">
                Dosage
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 text-text text-base"
                placeholder="e.g., 500mg, 1 tablet"
                placeholderTextColor="#9A9A9A"
                value={formData.dosage}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, dosage: text }))}
              />
            </View>

            <View className="mb-4">
              <Text className="text-text-soft text-sm mb-2 font-medium">
                Purpose
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 text-text text-base"
                placeholder="e.g., For headaches"
                placeholderTextColor="#9A9A9A"
                value={formData.purpose}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, purpose: text }))}
              />
            </View>

            <View className="mb-4">
              <Text className="text-text-soft text-sm mb-2 font-medium">
                Time (optional)
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 text-text text-base"
                placeholder="e.g., 08:00"
                placeholderTextColor="#9A9A9A"
                value={formData.time}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, time: text }))}
              />
            </View>

            <View className="mb-4">
              <Text className="text-text-soft text-sm mb-2 font-medium">
                Time Label
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 text-text text-base"
                placeholder="e.g., Before Breakfast"
                placeholderTextColor="#9A9A9A"
                value={formData.timeLabel}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, timeLabel: text }))}
              />
            </View>

            {/* Quick Labels */}
            <View className="mb-4">
              <Text className="text-text-soft text-sm mb-2 font-medium">
                Quick Labels
              </Text>
              <View className="flex-row flex-wrap">
                {[
                  "Before Breakfast",
                  "After Breakfast",
                  "Before Lunch",
                  "After Lunch",
                  "Before Dinner",
                  "After Dinner",
                  "Before Bed",
                ].map((label) => (
                  <Pressable
                    key={label}
                    className={`px-3 py-2 rounded-full mr-2 mb-2 ${
                      formData.timeLabel === label ? "bg-cta" : "bg-chip"
                    }`}
                    onPress={() => setFormData((prev) => ({ ...prev, timeLabel: label }))}
                  >
                    <Text
                      className={`text-sm ${
                        formData.timeLabel === label ? "text-white" : "text-text-soft"
                      }`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
