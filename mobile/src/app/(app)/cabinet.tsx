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
  Text,
  TextInput,
  View,
} from 'react-native';

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
    <View className="flex-1 bg-neutral-50">
      <SafeAreaView className="flex-1">
        <View className="flex-row justify-between items-center px-6 pt-5 pb-4">
          <View>
            <Text className="text-[28px] font-extrabold text-neutral-800 tracking-tight">
              Medications
            </Text>
          </View>
          <Pressable 
            className="h-12 w-12 rounded-full active:opacity-80"
            onPress={() => router.push('/profile')}
          >
            <LinearGradient
              colors={['#14B8A6', '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="medical" size={24} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </View>

        <View className="px-6 mb-4">
          <Pressable
            className="rounded-xl overflow-hidden active:opacity-90"
            onPress={() => router.push('/sos-medicines')}
          >
            <LinearGradient
              colors={['#F43F5E', '#E11D48']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 }}
            >
              <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
              <Text className="text-[15px] font-bold text-white">SOS Medicines</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </View>

        <View className="px-6 mb-4">
          <LinearGradient
            colors={['#14B8A6', '#0D9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flexDirection: 'row', borderRadius: 20, padding: 20 }}
          >
            <View className="flex-1 items-center">
              <Text className="text-[28px] font-extrabold text-white leading-[32px]">
                {activeMedCount}
              </Text>
              <Text className="text-[13px] font-semibold text-white/90 mt-0.5">Active</Text>
            </View>
            <View className="w-px bg-white/20" />
            <View className="flex-1 items-center">
              <Text className="text-[28px] font-extrabold text-white leading-[32px]">
                {medications.length}
              </Text>
              <Text className="text-[13px] font-semibold text-white/90 mt-0.5">Total</Text>
            </View>
          </LinearGradient>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-24"
          refreshControl={
            <RefreshControl
              refreshing={isManuallyRefreshing}
              onRefresh={handleRefresh}
              tintColor="#14B8A6"
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
            <View className="items-center pt-[60px]">
              <View className="w-24 h-24 rounded-full bg-teal-100 justify-center items-center mb-5">
                <Ionicons name="medical-outline" size={48} color="#14B8A6" />
              </View>
              <Text className="text-[22px] font-extrabold text-neutral-800 mb-2">No Medications</Text>
              <Text className="text-[15px] text-amber-700 text-center max-w-[80%] leading-[22px] mb-6">
                Add your daily medications to start tracking them
              </Text>
              <Pressable 
                className="flex-row items-center gap-2 bg-teal-100 px-5 py-3 rounded-[14px] active:bg-teal-200"
                onPress={openMedAddModal}
              >
                <Ionicons name="add-circle" size={20} color="#14B8A6" />
                <Text className="text-[15px] font-bold text-teal-500">Add First Medication</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              {medications.map((medication) => (
                <View key={medication.id}>
                  <Pressable
                    className={`flex-row items-center bg-white rounded-[18px] p-4 mb-3 border border-neutral-200 active:opacity-90 ${!medication.isActive ? 'bg-neutral-100 opacity-60' : ''}`}
                    onPress={() => openMedDetailModal(medication)}
                  >
                    <View className="mr-4">
                      <View className={`w-[52px] h-[52px] rounded-2xl justify-center items-center ${medication.isActive ? 'bg-teal-100' : 'bg-neutral-200'}`}>
                        <Ionicons
                          name="medical"
                          size={22}
                          color={medication.isActive ? '#14B8A6' : '#B8A89A'}
                        />
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text
                        className={`text-[17px] font-bold text-neutral-800 mb-1.5 ${!medication.isActive ? 'text-neutral-400 line-through' : ''}`}
                      >
                        {medication.name}
                      </Text>
                      <View className="flex-row items-center mb-1">
                        <Text className="text-[13px] text-amber-700 font-semibold">
                          {medication.dosage || 'No dosage'}
                        </Text>
                        {medication.time && (
                          <>
                            <Text className="mx-2 text-neutral-400 text-xs">•</Text>
                            <Text className="text-[13px] text-amber-700 font-semibold">{medication.time}</Text>
                          </>
                        )}
                      </View>
                      {medication.purpose && (
                        <Text className="text-xs text-neutral-400 italic">{medication.purpose}</Text>
                      )}
                    </View>

                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleMedicationActive(medication);
                      }}
                      className="flex-row items-center gap-2 p-3"
                    >
                      <Text className={`text-xs font-semibold ${medication.isActive ? 'text-teal-500' : 'text-neutral-400'}`}>
                        {medication.isActive ? 'Active' : 'Paused'}
                      </Text>
                      <View
                        className={`w-12 h-7 rounded-full p-0.5 ${medication.isActive ? 'bg-teal-500' : 'bg-neutral-200'}`}
                      >
                      <View
                        className={`w-6 h-6 rounded-full bg-white ${medication.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                      </View>
                    </Pressable>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <Pressable 
          className="absolute right-6 bottom-6 h-14 w-14 rounded-[28px] active:opacity-90"
          onPress={openMedAddModal}
        >
          <LinearGradient
            colors={['#14B8A6', '#0D9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}
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
          <View className="flex-1 bg-neutral-50">
            <View className="flex-row justify-between items-center px-6 pt-5 pb-4 border-b border-neutral-200">
              <Text className="text-xl font-extrabold text-neutral-800">
                {editingMedication ? 'Edit Medication' : 'Add Medication'}
              </Text>
              <Pressable onPress={closeMedEditModal} className="p-2">
                <Ionicons name="close" size={24} color="#2D2824" />
              </Pressable>
            </View>

            <ScrollView className="flex-1 p-6">
              <View className="mb-5">
                <Text className="text-sm font-semibold text-neutral-800 mb-1">Name</Text>
                <TextInput
                  className="bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-base text-neutral-800"
                  placeholder="Medication name"
                  value={medFormData.name}
                  onChangeText={(t) => setMedFormData({ ...medFormData, name: t })}
                  placeholderTextColor="#B8A89A"
                />
              </View>

              <View className="flex-row">
                <View className="flex-1 mr-3 mb-5">
                  <Text className="text-sm font-semibold text-neutral-800 mb-1">Dosage</Text>
                  <TextInput
                    className="bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-base text-neutral-800"
                    placeholder="e.g. 50mg"
                    value={medFormData.dosage}
                    onChangeText={(t) => setMedFormData({ ...medFormData, dosage: t })}
                    placeholderTextColor="#B8A89A"
                  />
                </View>
                <View className="flex-1 mb-5">
                  <Text className="text-sm font-semibold text-neutral-800 mb-1">Time</Text>
                  <TextInput
                    className="bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-base text-neutral-800"
                    placeholder="08:00"
                    value={medFormData.time}
                    onChangeText={(t) => setMedFormData({ ...medFormData, time: t })}
                    placeholderTextColor="#B8A89A"
                  />
                </View>
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-neutral-800 mb-1">When to Take</Text>
                <Text className="text-xs text-neutral-400 mb-3 italic">
                  Select when you typically take this medication
                </Text>
                <View className="flex-row flex-wrap gap-2.5">
                  {quickLabels.map((label) => (
                    <Pressable
                      key={label}
                      className={`px-4 py-2.5 rounded-full border ${medFormData.timeLabel === label ? 'bg-teal-500 border-teal-500' : 'bg-white border-neutral-200'} active:opacity-80`}
                      onPress={() => setMedFormData({ ...medFormData, timeLabel: label })}
                    >
                      <Text
                        className={`text-[13px] font-semibold ${medFormData.timeLabel === label ? 'text-white' : 'text-amber-700'}`}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-neutral-800 mb-1">Purpose (Optional)</Text>
                <TextInput
                  className="bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-base text-neutral-800 min-h-[100px]"
                  placeholder="What is it for?"
                  value={medFormData.purpose}
                  onChangeText={(t) => setMedFormData({ ...medFormData, purpose: t })}
                  placeholderTextColor="#B8A89A"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View className="p-6 border-t border-neutral-200">
              <Pressable
                className="flex-row items-center justify-center gap-2 py-4 rounded-xl bg-teal-500 active:bg-teal-600 disabled:opacity-50"
                onPress={handleSaveMedication}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text className="text-base font-bold text-white">
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
