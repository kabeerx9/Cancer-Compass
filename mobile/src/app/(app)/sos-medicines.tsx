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
  Text,
  TextInput,
  View,
} from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

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
        Toast.show({
          type: 'success',
          text1: 'SOS medicine added',
          text2: sosFormData.name.trim(),
          position: 'bottom',
        });
      },
      onError: (error: Error) => {
        Toast.show({
          type: 'error',
          text1: 'Failed to add medicine',
          text2: error.message,
          position: 'bottom',
        });
      },
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
          Toast.show({
            type: 'success',
            text1: 'Medicine updated',
            text2: sosFormData.name.trim(),
            position: 'bottom',
          });
        },
        onError: (error: Error) => {
          Toast.show({
            type: 'error',
            text1: 'Failed to update medicine',
            text2: error.message,
            position: 'bottom',
          });
        },
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
              onSuccess: () => {
                Toast.show({
                  type: 'info',
                  text1: 'Medicine deleted',
                  position: 'bottom',
                });
              },
              onError: (error: Error) => {
                Toast.show({
                  type: 'error',
                  text1: 'Failed to delete medicine',
                  text2: error.message,
                  position: 'bottom',
                });
              },
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
          Toast.show({
            type: 'success',
            text1: `${selectedSosMedicine.name} logged`,
            text2: 'Take care and get well soon 💚',
            position: 'bottom',
            visibilityTime: 3000,
          });
        },
        onError: (error: Error) => {
          Toast.show({
            type: 'error',
            text1: 'Failed to log medicine',
            text2: error.message,
            position: 'bottom',
          });
        },
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
      marked[localDateStr].dots.push({ color: '#F43F5E' });
    });
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#F43F5E',
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
    <View className="flex-1 bg-orange-50">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 pt-5 pb-4">
          <Pressable className="p-2 mr-2 active:opacity-70" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2D2824" />
          </Pressable>
          <View>
            <Text className="text-sm font-semibold text-stone-400 mb-1">Emergency</Text>
            <Text className="text-[28px] font-extrabold text-stone-800 tracking-tight">Emergency Medicines</Text>
          </View>
        </View>

        {/* Stats Card */}
        <View className="px-6 mb-4">
          <LinearGradient
            colors={['#F43F5E', '#E11D48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-row rounded-[20px] p-5 shadow-lg"
          >
            <View className="flex-1 items-center">
              <Text className="text-[28px] font-extrabold text-white leading-8">{sosMedicines.length}</Text>
              <Text className="text-[13px] font-semibold text-white/90 mt-0.5">Medicines</Text>
            </View>
            <View className="w-px bg-white/20" />
            <View className="flex-1 items-center">
              <Text className="text-[28px] font-extrabold text-white leading-8">{sosStats?.totalUses || 0}</Text>
              <Text className="text-[13px] font-semibold text-white/90 mt-0.5">Total Uses</Text>
            </View>
          </LinearGradient>
        </View>

        {/* View Mode Toggle */}
        <View className="flex-row mx-6 mb-4 bg-white rounded-xl p-1 border border-stone-200">
          <Pressable
            className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg ${sosViewMode === 'cabinet' ? 'bg-rose-500' : 'bg-transparent active:bg-stone-100'}`}
            onPress={() => setSosViewMode('cabinet')}
          >
            <Ionicons
              name="medical-outline"
              size={18}
              color={sosViewMode === 'cabinet' ? '#FFFFFF' : '#6B5D50'}
            />
            <Text className={`text-sm font-semibold ${sosViewMode === 'cabinet' ? 'text-white' : 'text-stone-600'}`}>
              Cabinet
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg ${sosViewMode === 'history' ? 'bg-rose-500' : 'bg-transparent active:bg-stone-100'}`}
            onPress={() => setSosViewMode('history')}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={sosViewMode === 'history' ? '#FFFFFF' : '#6B5D50'}
            />
            <Text className={`text-sm font-semibold ${sosViewMode === 'history' ? 'text-white' : 'text-stone-600'}`}>
              History
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 pb-24">
          {/* CABINET VIEW */}
          {sosViewMode === 'cabinet' && (
            <>
              {isLoadingSosMedicines ? (
                <>
                  <View className="mb-3">
                    <Skeleton width="100%" height={100} borderRadius={16} />
                  </View>
                  <View className="mb-3">
                    <Skeleton width="100%" height={100} borderRadius={16} />
                  </View>
                </>
              ) : sosMedicines.length === 0 ? (
                <Animated.View className="items-center pt-16" entering={FadeInDown.springify()}>
                  <View className="w-24 h-24 rounded-full bg-rose-100 justify-center items-center mb-5">
                    <Ionicons name="alert-circle-outline" size={48} color="#F43F5E" />
                  </View>
                  <Text className="text-[22px] font-extrabold text-stone-800 mb-2">No Emergency Medicines</Text>
                  <Text className="text-[15px] text-stone-600 text-center max-w-[80%] leading-6 mb-6">
                    Add emergency medicines you take only when needed
                  </Text>
                  <Pressable
                    className="flex-row items-center gap-2 bg-rose-100 px-5 py-3 rounded-[14px] active:opacity-80"
                    onPress={openSosAddModal}
                  >
                    <Ionicons name="add-circle" size={20} color="#F43F5E" />
                    <Text className="text-[15px] font-bold text-rose-500">
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
                      <View className="flex-row items-center bg-white rounded-[18px] p-4 mb-3 border border-stone-200 shadow-sm">
                        <View className="mr-4">
                          <View className="w-[52px] h-[52px] rounded-2xl bg-rose-100 justify-center items-center">
                            <Ionicons
                              name="medical"
                              size={22}
                              color="#F43F5E"
                            />
                          </View>
                        </View>

                        <View className="flex-1">
                          <Text className="text-[17px] font-bold text-stone-800 mb-1.5">
                            {medicine.name}
                          </Text>
                          {medicine.purpose && (
                            <Text className="text-xs text-stone-400 italic mb-1">{medicine.purpose}</Text>
                          )}
                          {medicine.dosage && (
                            <Text className="text-[13px] text-stone-600 font-semibold">{medicine.dosage}</Text>
                          )}
                        </View>

                        <View className="items-end gap-2">
                          <Pressable
                            className="rounded-[10px] overflow-hidden shadow-md active:opacity-90 shadow-rose-500/30"
                            onPress={() => openSosTakeModal(medicine)}
                          >
                            <LinearGradient
                              colors={['#F43F5E', '#E11D48']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              className="py-2.5 px-5 items-center justify-center"
                            >
                              <Text className="text-sm font-bold text-white">Take</Text>
                            </LinearGradient>
                          </Pressable>

                          <View className="flex-row gap-2">
                            <Pressable
                              onPress={() => openSosEditModal(medicine)}
                              className="p-3 active:opacity-70"
                            >
                              <Ionicons name="create-outline" size={20} color="#6B5D50" />
                            </Pressable>
                            <Pressable
                              onPress={() => handleDeleteSosMedicine(medicine)}
                              className="p-3 active:opacity-70"
                            >
                              <Ionicons name="trash-outline" size={20} color="#A8A29E" />
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
              <View className="bg-white rounded-[20px] p-4 mb-4 border border-rose-100">
                <Calendar
                  className="rounded-xl"
                  theme={{
                    backgroundColor: '#FFFFFF',
                    calendarBackground: '#FFFFFF',
                    textSectionTitleColor: '#B8A89A',
                    selectedDayBackgroundColor: '#F43F5E',
                    selectedDayTextColor: '#FFFFFF',
                    todayTextColor: '#F43F5E',
                    dayTextColor: '#2D2824',
                    textDisabledColor: '#E8E0D8',
                    arrowColor: '#F43F5E',
                    monthTextColor: '#2D2824',
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

              <View className="bg-white rounded-[20px] p-5 border border-rose-100">
                <Text className="text-lg font-bold text-stone-800 mb-4">
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
                        className="flex-row items-center mb-4"
                      >
                        <View className="mr-3">
                          <View className="w-10 h-10 rounded-lg bg-rose-100 justify-center items-center">
                            <Ionicons name="medical" size={18} color="#F43F5E" />
                          </View>
                        </View>
                        <View className="flex-1">
                          <Text className="text-[15px] font-bold text-stone-800 mb-0.5">
                            {log.sosMedicine?.name || 'Unknown Medicine'}
                          </Text>
                          <Text className="text-[13px] text-stone-400">
                            {formatDate(log.takenAt)} at {formatTime(log.takenAt)}
                          </Text>
                          {log.notes && <Text className="text-[13px] text-stone-600 mt-1 italic">{log.notes}</Text>}
                        </View>
                      </Animated.View>
                    )
                  )
                )}
                {(selectedDate ? getLogsForDate(selectedDate) : allSosLogs).length === 0 &&
                  !isLoadingSosLogs && (
                    <Text className="text-sm text-stone-400 text-center py-5">
                      {selectedDate ? 'No medicines taken on this date' : 'No logs yet'}
                    </Text>
                  )}
              </View>
            </Animated.View>
          )}
        </View>

        {/* Floating Add Button */}
        <Pressable className="absolute bottom-6 right-6 rounded-[28px] overflow-hidden shadow-lg shadow-rose-500/30 active:opacity-90" onPress={openSosAddModal}>
          <LinearGradient
            colors={['#F43F5E', '#E11D48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-14 h-14 items-center justify-center"
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
          <View className="flex-1 bg-orange-50">
            <View className="flex-row justify-between items-center px-6 pt-5 pb-4 border-b border-stone-200">
              <Text className="text-[22px] font-extrabold text-stone-800">Add SOS Medicine</Text>
              <Pressable onPress={() => setSosAddModalVisible(false)} className="p-2 active:opacity-70">
                <Ionicons name="close" size={24} color="#2D2824" />
              </Pressable>
            </View>

            <View className="flex-1 p-6">
              <View className="mb-5">
                <Text className="text-sm font-semibold text-stone-800 mb-2">Name *</Text>
                <TextInput
                  className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-800"
                  placeholder="e.g., Pain Reliever"
                  value={sosFormData.name}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, name: t })}
                  placeholderTextColor="#A8A29E"
                />
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-stone-800 mb-2">Purpose *</Text>
                <TextInput
                  className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-800"
                  placeholder="What symptom or condition is this for?"
                  value={sosFormData.purpose}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, purpose: t })}
                  placeholderTextColor="#A8A29E"
                />
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-stone-800 mb-2">Dosage</Text>
                <TextInput
                  className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-800"
                  placeholder="e.g., 500mg, 1 tablet"
                  value={sosFormData.dosage}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, dosage: t })}
                  placeholderTextColor="#A8A29E"
                />
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-stone-800 mb-2">Instructions</Text>
                <TextInput
                  className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-800 min-h-[100px]"
                  placeholder="Any special instructions or warnings"
                  value={sosFormData.instructions}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, instructions: t })}
                  placeholderTextColor="#A8A29E"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View className="p-6 border-t border-stone-200">
              <Pressable
                className="flex-row items-center justify-center gap-2 bg-rose-500 py-4 rounded-[14px] active:opacity-80"
                onPress={handleSaveSosMedicine}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text className="text-base font-bold text-white">Save Medicine</Text>
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
          <View className="flex-1 bg-orange-50">
            <View className="flex-row justify-between items-center px-6 pt-5 pb-4 border-b border-stone-200">
              <Text className="text-[22px] font-extrabold text-stone-800">Edit SOS Medicine</Text>
              <Pressable onPress={() => setSosEditModalVisible(false)} className="p-2 active:opacity-70">
                <Ionicons name="close" size={24} color="#2D2824" />
              </Pressable>
            </View>

            <View className="flex-1 p-6">
              <View className="mb-5">
                <Text className="text-sm font-semibold text-stone-800 mb-2">Name</Text>
                <TextInput
                  className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-800"
                  value={sosFormData.name}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, name: t })}
                  placeholderTextColor="#A8A29E"
                />
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-stone-800 mb-2">Purpose</Text>
                <TextInput
                  className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-800"
                  value={sosFormData.purpose}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, purpose: t })}
                  placeholderTextColor="#A8A29E"
                />
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-stone-800 mb-2">Dosage</Text>
                <TextInput
                  className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-800"
                  value={sosFormData.dosage}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, dosage: t })}
                  placeholderTextColor="#A8A29E"
                />
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-stone-800 mb-2">Instructions</Text>
                <TextInput
                  className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-800 min-h-[100px]"
                  value={sosFormData.instructions}
                  onChangeText={(t) => setSosFormData({ ...sosFormData, instructions: t })}
                  placeholderTextColor="#A8A29E"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View className="p-6 border-t border-stone-200">
              <Pressable
                className="flex-row items-center justify-center gap-2 bg-rose-500 py-4 rounded-[14px] active:opacity-80"
                onPress={handleUpdateSosMedicine}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text className="text-base font-bold text-white">Update Medicine</Text>
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
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl max-h-[85%]">
              <View className="flex-row justify-between items-center p-6 border-b border-stone-200">
                <Text className="text-xl font-extrabold text-stone-800">Take {selectedSosMedicine?.name}</Text>
                <Pressable onPress={() => setSosTakeModalVisible(false)} className="p-2 active:opacity-70">
                  <Ionicons name="close" size={24} color="#2D2824" />
                </Pressable>
              </View>

              <View className="p-6">
                <View className="mb-5">
                  <Text className="text-sm font-semibold text-stone-800 mb-2">Time</Text>
                  <Text className="text-lg font-bold text-rose-500">
                    {formatTime(logFormData.takenAt)}
                  </Text>
                </View>

                <View className="mb-5">
                  <Text className="text-sm font-semibold text-stone-800 mb-2">Notes (Optional)</Text>
                  <TextInput
                    className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-800 min-h-[100px]"
                    placeholder="What's happening? Any symptoms?"
                    value={logFormData.notes}
                    onChangeText={(t) => setLogFormData({ ...logFormData, notes: t })}
                    placeholderTextColor="#A8A29E"
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

              <View className="p-6 pt-0">
                <Pressable className="rounded-[14px] overflow-hidden active:opacity-90" onPress={handleLogSosMedicine}>
                  <LinearGradient
                    colors={['#F43F5E', '#E11D48']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="flex-row items-center justify-center gap-2 py-4"
                  >
                    <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                    <Text className="text-base font-bold text-white">Confirm</Text>
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
