import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  type Medication,
  medicationMutations,
  medicationQueries,
} from '@/features/medications';
import { MedicationCardSkeleton, Skeleton } from '@/components/skeleton';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const queryClient = useQueryClient();
  const [isManuallyRefreshing, setIsManuallyRefreshing] = React.useState(false);

  // Wait for user to load before rendering
  if (!isUserLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  const {
    data: medications = [],
    isLoading,
    refetch,
  } = useQuery(medicationQueries.today());
  const logMutation = useMutation(medicationMutations.log(queryClient));

  const handleLogMedication = (
    medicationId: string,
    status: 'taken' | 'skipped'
  ) => {
    logMutation.mutate(
      { id: medicationId, status },
      {
        onSuccess: () => {
          const medication = medications.find((m) => m.id === medicationId);
          const medName = medication?.name || 'Medication';
          if (status === 'taken') {
            Toast.show({
              type: 'success',
              text1: `${medName} marked as taken`,
              text2: 'Great job! Keep it up 👍',
              position: 'bottom',
              visibilityTime: 2000,
            });
          } else {
            Toast.show({
              type: 'info',
              text1: `${medName} skipped`,
              position: 'bottom',
              visibilityTime: 2000,
            });
          }
        },
        onError: () => {
          Toast.show({
            type: 'error',
            text1: 'Failed to log medication',
            text2: 'Please try again',
            position: 'bottom',
          });
        },
      }
    );
  };

  const handleRefresh = () => {
    setIsManuallyRefreshing(true);
    refetch();
    setTimeout(() => setIsManuallyRefreshing(false), 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.firstName || 'there';

  const takenCount = medications.filter(
    (m) => m.todayStatus === 'taken'
  ).length;
  const totalCount = medications.length;
  const progress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  const renderMedicationItem = ({
    item: medication,
  }: {
    item: Medication;
    index: number;
  }) => {
    const isTaken = medication.todayStatus === 'taken';
    const isSkipped = medication.todayStatus === 'skipped';

    return (
      <View
        className={`mb-2.5 rounded-2xl border p-3 shadow-sm ${
          isTaken
            ? 'border-green-200 bg-green-50'
            : isSkipped
              ? 'border-neutral-200 bg-neutral-100 opacity-50'
              : 'border-neutral-100 bg-white'
        }`}
      >
        <View className="flex-row items-center">
          <View
            className={`mr-3 size-10 items-center justify-center rounded-xl ${
              isTaken ? 'bg-green-100' : 'bg-teal-100'
            }`}
          >
            <Ionicons
              name={isTaken ? 'checkmark-circle' : 'medical'}
              size={20}
              color={isTaken ? '#22C55E' : '#14B8A6'}
            />
          </View>

          <View className="flex-1">
            <Text className="mb-0.5 text-base font-bold text-neutral-900">
              {medication.name}
            </Text>
            {medication.dosage && (
              <Text className="text-sm font-medium text-neutral-600">
                {medication.dosage}
              </Text>
            )}
            {medication.timeLabel && (
              <Text className="text-xs font-medium text-neutral-400">
                {medication.timeLabel}
              </Text>
            )}
          </View>

          <View className="items-end gap-1.5">
            {medication.time && (
              <Text className="text-xs font-semibold text-neutral-600">
                {medication.time}
              </Text>
            )}

            {medication.todayStatus ? (
              <View
                className={`rounded-lg px-2.5 py-1 ${
                  isTaken ? 'bg-green-100' : 'bg-neutral-100'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isTaken ? 'text-green-600' : 'text-neutral-500'
                  }`}
                >
                  {isTaken ? 'Done' : 'Skipped'}
                </Text>
              </View>
            ) : (
              <View className="flex-row gap-1.5">
                <Pressable
                  className="size-11 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 active:bg-neutral-100"
                  onPress={() => handleLogMedication(medication.id, 'skipped')}
                >
                  <Ionicons name="close-outline" size={18} color="#9CA3AF" />
                </Pressable>
                <Pressable
                  className="size-11 items-center justify-center rounded-xl bg-teal-500 active:bg-teal-600"
                  onPress={() => handleLogMedication(medication.id, 'taken')}
                >
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Loading skeleton view
  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-50">
        <SafeAreaView className="flex-1">
          {/* Header Skeleton */}
          <View className="flex-row items-center justify-between px-6 py-5">
            <View>
              <Skeleton width={80} height={16} borderRadius={6} />
              <View className="mt-2">
                <Skeleton width={120} height={28} borderRadius={8} />
              </View>
            </View>
            <Skeleton width={48} height={48} borderRadius={24} />
          </View>

          {/* Patient Info Card Skeleton */}
          <View className="mb-4 px-6">
            <Skeleton width="100%" height={72} borderRadius={16} />
          </View>

          {/* Progress Card Skeleton */}
          <View className="mb-6 px-6">
            <Skeleton width="100%" height={120} borderRadius={24} />
          </View>

          {/* Section Title Skeleton */}
          <View className="mb-4 px-6">
            <Skeleton width={160} height={28} borderRadius={8} />
          </View>

          {/* Medication Cards Skeleton */}
          <View className="px-6 pb-8">
            <MedicationCardSkeleton />
            <MedicationCardSkeleton />
            <MedicationCardSkeleton />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <SafeAreaView className="flex-1">
        {/* Header with greeting */}
        <View className="flex-row items-center justify-between px-6 py-5">
          <View>
            <Text className="mb-1 text-sm font-medium text-neutral-500">
              {getGreeting()},
            </Text>
            <Text className="text-[28px] font-extrabold tracking-tight text-neutral-900">
              {firstName}
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
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text className="text-xl font-extrabold text-white">
                {firstName[0].toUpperCase()}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Patient Info Quick Access */}
        <View className="mb-4 px-6">
          <Pressable
            className="rounded-2xl overflow-hidden active:opacity-90"
            onPress={() => router.push('/quick-info')}
          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 16,
              }}
            >
              <View className="flex-row items-center flex-1">
                <View className="mr-3 size-12 items-center justify-center rounded-full bg-white/20">
                  <Ionicons name="person-circle" size={28} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white">
                    Patient Info
                  </Text>
                  <Text className="mt-0.5 text-sm text-white/80">
                    Medical details & contacts
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </View>

        {/* Warm progress card - always visible */}
        <View className="mb-6 px-6">
          <View className="rounded-3xl overflow-hidden">
            <LinearGradient
              colors={['#14B8A6', '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20 }}
            >
              <View className="mb-4 flex-row items-start justify-between">
                <View>
                  <Text className="mb-1 text-sm font-semibold text-white/90">
                    Daily Progress
                  </Text>
                  <Text className="text-sm font-medium text-white/80">
                    {takenCount} of {totalCount} done
                  </Text>
                </View>
                <View className="rounded-xl bg-white/20 px-3 py-1.5">
                  <Text className="text-xl font-extrabold text-white">
                    {totalCount > 0 ? Math.round(progress) : 0}%
                  </Text>
                </View>
              </View>
              <View className="h-2 rounded-full bg-white/20">
                <View
                  className="h-full rounded-full bg-white"
                  style={{ width: `${totalCount > 0 ? progress : 0}%` }}
                />
              </View>
              {progress === 100 && totalCount > 0 && (
                <View className="mt-3 flex-row items-center gap-2 self-start rounded-xl bg-white/15 px-3 py-1.5">
                  <Ionicons name="happy-outline" size={18} color="#FFFFFF" />
                  <Text className="text-sm font-bold text-white">
                    All done! 🎉
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Medications list */}
        <View className="mb-4 px-6">
          <Text className="text-xl font-bold text-neutral-900">
            Today's Medications
          </Text>
        </View>

        <FlatList
          data={medications}
          renderItem={renderMedicationItem}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pb-8"
          refreshControl={
            <RefreshControl
              refreshing={isManuallyRefreshing}
              onRefresh={handleRefresh}
              tintColor="#14B8A6"
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6">
              {/* Enhanced empty state illustration */}
              <View className="mb-6 size-28 items-center justify-center rounded-full bg-teal-50">
                <View className="size-20 items-center justify-center rounded-full bg-teal-100">
                  <Ionicons name="medical-outline" size={48} color="#14B8A6" />
                </View>
              </View>
              <Text className="mb-2 text-2xl font-bold text-neutral-900">
                No medications yet
              </Text>
              <Text className="mb-8 max-w-[80%] text-center text-base leading-relaxed text-neutral-600">
                Add your first medication to start tracking your daily health
                routine
              </Text>
              <Pressable
                className="flex-row items-center gap-2 rounded-2xl bg-teal-500 px-6 py-4 active:scale-[0.98]"
                onPress={() => router.push('/cabinet')}
              >
                <Ionicons name="add-circle" size={22} color="#FFFFFF" />
                <Text className="text-lg font-bold text-white">
                  Add Medication
                </Text>
              </Pressable>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}
