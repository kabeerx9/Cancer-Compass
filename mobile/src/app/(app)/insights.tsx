import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
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

import { LogCardSkeleton, Skeleton } from '@/components/skeleton';
import {
  type CreateSymptomLogData,
  symptomMutations,
  symptomQueries,
  type SymptomLog,
} from '@/features/symptom';

type DateRange = '7' | '14' | '30' | 'custom';

export default function InsightsPage() {
  const queryClient = useQueryClient();
  const [isManuallyRefreshing, setIsManuallyRefreshing] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<DateRange>('7');
  const [showSummary, setShowSummary] = React.useState(false);
  const [addModalVisible, setAddModalVisible] = React.useState(false);
  const [symptomContent, setSymptomContent] = React.useState('');

  // Check if today's log exists
  const { data: hasTodayLog, refetch: refetchToday } = useQuery(symptomQueries.today());

  // Calculate dates based on selected range
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    if (selectedRange === 'custom') {
      startDate.setDate(endDate.getDate() - 30);
    } else {
      startDate.setDate(endDate.getDate() - parseInt(selectedRange));
    }

    const formatDate = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch logs and summary
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery(
    symptomQueries.byDateRange(startDate, endDate)
  );

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    ...symptomQueries.summary(startDate, endDate),
    enabled: showSummary,
  });

  const createMutation = useMutation(symptomMutations.createOrUpdate(queryClient));

  const handleRefresh = () => {
    setIsManuallyRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['symptoms'] });
    refetchToday();
    setTimeout(() => setIsManuallyRefreshing(false), 1000);
  };

  const handleSaveSymptom = () => {
    if (!symptomContent.trim()) {
      Alert.alert('Error', 'Please enter some symptoms or notes');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    createMutation.mutate(
      {
        date: today,
        content: symptomContent.trim(),
      },
      {
        onSuccess: () => {
          setAddModalVisible(false);
          setSymptomContent('');
          refetchToday();
          queryClient.invalidateQueries({ queryKey: ['symptoms'] });
        },
        onError: (error: Error) => {
          Alert.alert('Error', error.message || 'Failed to save symptom log');
        },
      }
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const rangeOptions: { value: DateRange; label: string }[] = [
    { value: '7', label: 'Last 7 Days' },
    { value: '14', label: 'Last 14 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom' },
  ];

  // Loading skeleton
  if (isLoadingLogs && logs.length === 0) {
    return (
      <View className="flex-1 bg-[#FFFBF9]">
        <SafeAreaView className="flex-1">
          {/* Header Skeleton */}
          <View className="px-6 pt-5 pb-4">
            <View>
              <Skeleton width={50} height={16} />
              <View className="h-2" />
              <Skeleton width={140} height={36} />
            </View>
          </View>

          {/* Range Selector Skeleton */}
          <View className="mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Skeleton width={100} height={40} borderRadius={20} />
              <Skeleton width={100} height={40} borderRadius={20} />
              <Skeleton width={100} height={40} borderRadius={20} />
              <Skeleton width={100} height={40} borderRadius={20} />
            </ScrollView>
          </View>

          {/* Summary Button Skeleton */}
          <View className="px-6 mb-4">
            <Skeleton width="100%" height={48} borderRadius={14} />
          </View>

          {/* Logs Skeleton */}
          <ScrollView className="flex-1 px-6 pb-4">
            <LogCardSkeleton />
            <LogCardSkeleton />
            <LogCardSkeleton />
            <LogCardSkeleton />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FFFBF9]">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-5 pb-4">
          <View>
            <Text className="text-sm font-semibold text-[#B8A89A] mb-1">Health</Text>
            <Text className="text-[28px] font-extrabold text-[#2D2824] tracking-tight">Insights</Text>
          </View>
        </View>

        {/* Date Range Selector */}
        <View className="mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          >
            {rangeOptions.map((option) => (
              <Pressable
                key={option.value}
                className={`px-4 py-2.5 rounded-full border ${
                  selectedRange === option.value
                    ? 'bg-teal-500 border-teal-500'
                    : 'bg-white border-[#E8E0D8] active:bg-gray-50'
                }`}
                onPress={() => {
                  setSelectedRange(option.value);
                  setShowSummary(false);
                }}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedRange === option.value ? 'text-white' : 'text-[#6B5D50]'
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

          {/* Summary Button */}
          <View className="px-6 mb-4">
            <Pressable
              className="rounded-[14px] overflow-hidden"
              onPress={() => setShowSummary(!showSummary)}
            >
            <LinearGradient
              colors={showSummary ? ['#14B8A6', '#0D9488'] : ['#F3F4F6', '#E5E7EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 }}
            >
              <Ionicons
                name={showSummary ? 'close' : 'sparkles'}
                size={20}
                color={showSummary ? '#FFFFFF' : '#6B5D50'}
              />
              <Text
                className={`text-[15px] font-bold ${
                  showSummary ? 'text-white' : 'text-[#6B5D50]'
                }`}
              >
                {showSummary ? 'Hide Summary' : 'Generate AI Summary'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isManuallyRefreshing}
              onRefresh={handleRefresh}
              tintColor="#14B8A6"
            />
          }
        >
          {/* AI Summary Card */}
          {showSummary && (
            <View
              className="bg-white rounded-[20px] p-5 mb-5 border border-[#E8E0D8]"
            >
              {isLoadingSummary ? (
                <View className="items-center py-5">
                  <ActivityIndicator color="#14B8A6" />
                  <Text className="mt-3 text-sm text-[#B8A89A]">Generating summary...</Text>
                </View>
              ) : summaryData ? (
                <>
                  <View className="flex-row items-center gap-2 mb-3">
                    <Ionicons name="sparkles" size={24} color="#14B8A6" />
                    <Text className="text-lg font-extrabold text-[#2D2824]">AI Summary</Text>
                  </View>
                  <Text className="text-sm text-[#6B5D50] leading-[22px] mb-4">
                    {summaryData.summary}
                  </Text>
                  <View className="flex-row gap-6 pt-4 border-t border-[#E8E0D8]">
                    <View className="items-center">
                      <Text className="text-2xl font-extrabold text-teal-500">
                        {summaryData.entriesCount}
                      </Text>
                      <Text className="text-xs text-[#B8A89A] mt-0.5">Entries</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-2xl font-extrabold text-teal-500">
                        {summaryData.daysCount}
                      </Text>
                      <Text className="text-xs text-[#B8A89A] mt-0.5">Days</Text>
                    </View>
                  </View>
                </>
              ) : null}
            </View>
          )}

          {/* Add Today's Log Button */}
          {!hasTodayLog && !isLoadingLogs && (
            <View className="mb-5">
              <Pressable
                className="rounded-[14px] overflow-hidden active:opacity-90"
                onPress={() => setAddModalVisible(true)}
              >
                <LinearGradient
                  colors={['#14B8A6', '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 }}
                >
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text className="text-[15px] font-bold text-white">Log Today's Symptoms</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {/* Logs List */}
          <View className="flex-1">
            <Text className="text-lg font-extrabold text-[#2D2824] mb-4">
              Symptom Logs ({logs.length} entries)
            </Text>

            {logs.length === 0 ? (
              <View
                className="items-center pt-10"
              >
                <View className="w-20 h-20 rounded-full bg-teal-50 justify-center items-center mb-4">
                  <Ionicons name="document-text-outline" size={48} color="#14B8A6" />
                </View>
                <Text className="text-lg font-bold text-[#2D2824] mb-2">No Logs Yet</Text>
                <Text className="text-sm text-[#B8A89A] text-center">
                  Start logging your symptoms to track your health journey
                </Text>
              </View>
            ) : (
              <View>
                {logs.map((log, index) => (
                  <View
                    key={log.id}
                    className="bg-white rounded-2xl p-4 mb-3 border border-[#E8E0D8]"
                  >
                    <View className="mb-3">
                      <View className="bg-teal-50 px-3 py-1.5 rounded-lg self-start">
                        <Text className="text-[13px] font-bold text-teal-500">
                          {formatDate(log.date)}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-[15px] text-[#6B5D50] leading-[22px]">{log.content}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Symptom Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={addModalVisible}
          onRequestClose={() => setAddModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className="bg-white rounded-3xl p-6 w-full max-w-[360px] items-center">
              <View className="mb-4">
                <LinearGradient
                  colors={['#14B8A6', '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-16 h-16 rounded-full justify-center items-center"
                >
                  <Ionicons name="create-outline" size={28} color="#FFFFFF" />
                </LinearGradient>
              </View>

              <Text className="text-2xl font-extrabold text-[#2D2824] mb-2 text-center">
                Log Symptoms
              </Text>
              <Text className="text-[15px] text-[#6B5D50] mb-5 text-center">
                How are you feeling today?
              </Text>

              <TextInput
                className="w-full min-h-[100px] bg-[#FFFBF9] rounded-2xl p-4 text-[15px] text-[#2D2824] border border-[#E8E0D8] mb-5"
                multiline
                numberOfLines={4}
                placeholder="Share any symptoms, feelings, or notes about your day..."
                placeholderTextColor="#B8A89A"
                value={symptomContent}
                onChangeText={setSymptomContent}
                textAlignVertical="top"
              />

              <Pressable
                className="w-full mb-3 rounded-xl overflow-hidden active:opacity-90"
                onPress={handleSaveSymptom}
                disabled={createMutation.isPending || !symptomContent.trim()}
              >
                <LinearGradient
                  colors={['#14B8A6', '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className={`py-3.5 items-center justify-center ${
                    !symptomContent.trim() || createMutation.isPending ? 'opacity-50' : ''
                  }`}
                >
                  {createMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-base font-bold text-white">Save</Text>
                  )}
                </LinearGradient>
              </Pressable>

              <Pressable
                className="py-2.5 active:opacity-70"
                onPress={() => {
                  setAddModalVisible(false);
                  setSymptomContent('');
                }}
              >
                <Text className="text-[15px] font-semibold text-[#B8A89A]">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
