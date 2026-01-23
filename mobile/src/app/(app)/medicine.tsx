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
import { medicationApi, Medication, CreateMedicationData, UpdateMedicationData } from "../../lib/api";

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

  const fetchMedications = async () => {
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
  };

  React.useEffect(() => {
    fetchMedications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6E3B9" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111111" }}>Medications</Text>
        <Pressable
          style={{ backgroundColor: "#4A90A4", width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" }}
          onPress={openAddModal}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Medication List */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {medications.length === 0 ? (
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, alignItems: "center" }}>
            <Ionicons name="medical-outline" size={48} color="#9A9A9A" />
            <Text style={{ color: "#6e6e6e", textAlign: "center", marginTop: 16 }}>
              No medications added yet
            </Text>
            <Text style={{ color: "#6e6e6e", textAlign: "center", fontSize: 14, marginTop: 4 }}>
              Tap the + button to add your first medication
            </Text>
          </View>
        ) : (
          medications.map((medication) => (
            <Pressable
              key={medication.id}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                opacity: medication.isActive ? 1 : 0.5,
              }}
              onPress={() => openEditModal(medication)}
              onLongPress={() => handleDelete(medication)}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: "600", color: "#111111" }}>
                    {medication.name}
                  </Text>
                  {medication.dosage && (
                    <Text style={{ color: "#6e6e6e", marginTop: 4 }}>
                      {medication.dosage}
                    </Text>
                  )}
                  {medication.purpose && (
                    <Text style={{ color: "#9a9a9a", fontSize: 14, marginTop: 4 }}>
                      {medication.purpose}
                    </Text>
                  )}
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                    {medication.time && (
                      <View style={{ backgroundColor: "#F3F3F3", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginRight: 8 }}>
                        <Text style={{ color: "#6e6e6e", fontSize: 14 }}>
                          {medication.time}
                        </Text>
                      </View>
                    )}
                    {medication.timeLabel && (
                      <View style={{ backgroundColor: "#F3F3F3", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                        <Text style={{ color: "#6e6e6e", fontSize: 14 }}>
                          {medication.timeLabel}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable
                  style={{ padding: 8 }}
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
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
          {/* Modal Header */}
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#E7E2D7",
            backgroundColor: "#FFFFFF",
          }}>
            <Pressable onPress={closeModal}>
              <Text style={{ color: "#4A90A4", fontSize: 16 }}>Cancel</Text>
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#111111" }}>
              {editingMedication ? "Edit Medication" : "Add Medication"}
            </Text>
            <Pressable onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#4A90A4" />
              ) : (
                <Text style={{ color: "#4A90A4", fontSize: 16, fontWeight: "600" }}>Save</Text>
              )}
            </Pressable>
          </View>

          {/* Form */}
          <ScrollView className="flex-1 px-5 py-4">
            <View className="mb-4">
              <Text style={{ color: "#6e6e6e", fontSize: 14, marginBottom: 8, fontWeight: "500" }}>
                Medication Name *
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E7E2D7",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: "#111111",
                }}
                placeholder="e.g., Aspirin"
                placeholderTextColor="#9A9A9A"
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              />
            </View>

            <View className="mb-4">
              <Text style={{ color: "#6e6e6e", fontSize: 14, marginBottom: 8, fontWeight: "500" }}>
                Dosage
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E7E2D7",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: "#111111",
                }}
                placeholder="e.g., 500mg, 1 tablet"
                placeholderTextColor="#9A9A9A"
                value={formData.dosage}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, dosage: text }))}
              />
            </View>

            <View className="mb-4">
              <Text style={{ color: "#6e6e6e", fontSize: 14, marginBottom: 8, fontWeight: "500" }}>
                Purpose
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E7E2D7",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: "#111111",
                }}
                placeholder="e.g., For headaches"
                placeholderTextColor="#9A9A9A"
                value={formData.purpose}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, purpose: text }))}
              />
            </View>

            <View className="mb-4">
              <Text style={{ color: "#6e6e6e", fontSize: 14, marginBottom: 8, fontWeight: "500" }}>
                Time (optional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E7E2D7",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: "#111111",
                }}
                placeholder="e.g., 08:00"
                placeholderTextColor="#9A9A9A"
                value={formData.time}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, time: text }))}
              />
            </View>

            <View className="mb-4">
              <Text style={{ color: "#6e6e6e", fontSize: 14, marginBottom: 8, fontWeight: "500" }}>
                Time Label
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E7E2D7",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: "#111111",
                }}
                placeholder="e.g., Before Breakfast"
                placeholderTextColor="#9A9A9A"
                value={formData.timeLabel}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, timeLabel: text }))}
              />
            </View>

            {/* Quick Labels */}
            <View className="mb-4">
              <Text style={{ color: "#6e6e6e", fontSize: 14, marginBottom: 8, fontWeight: "500" }}>
                Quick Labels
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
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
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: formData.timeLabel === label ? "#4A90A4" : "#F3F3F3",
                    }}
                    onPress={() => setFormData((prev) => ({ ...prev, timeLabel: label }))}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: formData.timeLabel === label ? "#FFFFFF" : "#6e6e6e",
                      }}
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
