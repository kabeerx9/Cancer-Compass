import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, type DateData } from 'react-native-calendars';


import { Modal, useModal } from '@/components/ui/modal';
import { templateMutations, templateQueries } from '@/features/templates';

interface MarkedDate {
  marked?: boolean;
  selected?: boolean;
  selectedColor?: string;
  color?: string;
  dotColor?: string;
  dots?: { color: string; selectedDotColor?: string }[];
}

export default function CalendarScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { ref: modalRef, present: openModal } = useModal();

  const startDate = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const endDate = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const { data: assignedDays = [], isLoading: assignedLoading } = useQuery(
    templateQueries.assignedDays(formatDate(startDate), formatDate(endDate))
  );
  const { data: allTemplates = [] } = useQuery(templateQueries.all());

  const assignMutation = useMutation(templateMutations.assign(queryClient));
  const unassignMutation = useMutation(templateMutations.unassign(queryClient));

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    openModal();
  };

  const onMonthChange = (month: DateData) => {
    setCurrentMonth(new Date(month.year, month.month - 1, 1));
  };

  const getMarkedDates = (): Record<string, MarkedDate> => {
    const marked: Record<string, MarkedDate> = {};

    assignedDays.forEach((assigned) => {
      const dateString = assigned.date.split('T')[0];

      if (!marked[dateString]) {
        marked[dateString] = { dots: [] };
      }

      if (marked[dateString]?.dots) {
        marked[dateString].dots!.push({
          color: assigned.template.color,
        });
      }
    });

    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#14B8A6',
      };
    }

    return marked;
  };

  const getAssignedTemplatesForDate = (dateString: string) => {
    return assignedDays.filter((assigned) => {
      const assignedDate = assigned.date.split('T')[0];
      return assignedDate === dateString;
    });
  };

  const getAvailableTemplatesForDate = (dateString: string) => {
    const assignedTemplateIds = getAssignedTemplatesForDate(dateString).map(
      (a) => a.templateId
    );
    return allTemplates.filter((t) => !assignedTemplateIds.includes(t.id));
  };

  const handleAssignTemplate = async (templateId: string) => {
    if (!selectedDate) return;
    try {
      await assignMutation.mutateAsync({ id: templateId, date: selectedDate });
    } catch (error) {
      console.error('Failed to assign template:', error);
    }
  };

  const handleUnassignTemplate = async (templateId: string) => {
    if (!selectedDate) return;
    try {
      await unassignMutation.mutateAsync({
        id: templateId,
        date: selectedDate,
      });
    } catch (error) {
      console.error('Failed to unassign template:', error);
    }
  };

  const today = formatDate(new Date());

  const uniqueTemplates = Object.values(
    assignedDays.reduce(
      (unique: { [key: string]: any }, assigned) => {
        const key = assigned.templateId;
        if (!unique[key]) {
          unique[key] = assigned.template;
        }
        return unique;
      },
      {} as Record<string, any>
    )
  );

  const selectedDateTemplates = selectedDate
    ? getAssignedTemplatesForDate(selectedDate)
    : [];
  const availableTemplates = selectedDate
    ? getAvailableTemplatesForDate(selectedDate)
    : [];

  const getMonthName = () => {
    return currentMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getDayName = () => {
    return selectedDate
      ? new Date(selectedDate).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      : 'Select a date';
  };

  return (
    <SafeAreaView className="flex-1 bg-orange-50" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <View className="flex-row items-center flex-1">
          <Pressable 
            className="mr-3 p-1 active:opacity-60" 
            onPress={() => router.push('/tasks')}
          >
            <Ionicons name="arrow-back" size={24} color="#2D2824" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-sm text-stone-400 font-semibold mb-1">Your</Text>
            <Text className="text-[28px] font-extrabold text-stone-800 -tracking-wide">
              Calendar
            </Text>
          </View>
        </View>
        <View className="bg-teal-100 px-4 py-2.5 rounded-[14px]">
          <Text className="text-sm font-bold text-teal-600">{getMonthName()}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-6">
        {/* Calendar Card */}
        <View>
          <View className="bg-white rounded-[20px] p-4 mb-6">
            <Calendar
              className="rounded-xl"
              theme={{
                backgroundColor: '#FFFFFF',
                calendarBackground: '#FFFFFF',
                textSectionTitleColor: '#B8A89A',
                selectedDayBackgroundColor: '#14B8A6',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#14B8A6',
                dayTextColor: '#2D2824',
                textDisabledColor: '#E8E0D8',
                arrowColor: '#14B8A6',
                monthTextColor: '#2D2824',
                textMonthFontWeight: '700' as const,
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 13,
                textDayHeaderFontWeight: '700' as const,
                textSectionTitleDisabledColor: '#E8E0D8',
              }}
              markedDates={getMarkedDates()}
              onDayPress={onDayPress}
              onMonthChange={onMonthChange}
              markingType="multi-dot"
              enableSwipeMonths={true}
              current={today}
            />
          </View>
        </View>

        {/* Templates Legend */}
        <View>
          <View className="bg-white rounded-[20px] p-5">
            <Text className="text-lg font-extrabold text-stone-800 mb-4">
              Templates Legend
            </Text>
            {assignedLoading ? (
              <View className="flex-row items-center gap-3 py-4">
                <ActivityIndicator size="small" color="#14B8A6" />
                <Text className="text-sm text-stone-400 font-semibold">Loading...</Text>
              </View>
            ) : uniqueTemplates.length === 0 ? (
              <View className="items-center py-8">
                <Ionicons name="calendar-outline" size={32} color="#B8A89A" />
                <Text className="text-[15px] text-stone-400 mt-3 mb-4">
                  No templates created yet
                </Text>
                <Pressable
                  className="flex-row items-center gap-1.5 bg-teal-500 px-4 py-2.5 rounded-xl active:opacity-80"
                  onPress={() => router.push('/manage-templates')}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text className="text-sm font-semibold text-white">Create Template</Text>
                </Pressable>
              </View>
            ) : (
              <View className="gap-3">
                {uniqueTemplates.map((template: any, index) => (
                  <View
                    key={template.id}
                    className="flex-row items-center p-3.5 bg-orange-50 rounded-[14px]"
                  >
                    <View
                      className="w-3.5 h-3.5 rounded-full mr-3.5"
                      style={{ backgroundColor: template.color }}
                    />
                    <View className="flex-1">
                      <Text className="text-[15px] font-bold text-stone-800">
                        {template.name}
                      </Text>
                      <Text className="text-[13px] text-stone-400 mt-0.5">
                        {template.tasks?.length || 0} tasks
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Assignment Modal */}
      <Modal ref={modalRef} snapPoints={['75%']} title={getDayName()}>
        <View className="px-6 py-5">
          {/* Assigned Templates */}
          <View className="mb-2">
            <Text className="text-xs font-bold text-stone-400 mb-3 tracking-wider">
              ASSIGNED TEMPLATES
            </Text>
            {selectedDateTemplates.length === 0 ? (
              <View className="items-center py-6">
                <Ionicons name="folder-open-outline" size={40} color="#B8A89A" />
                <Text className="text-[15px] text-stone-400 mt-3">
                  No templates assigned
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {selectedDateTemplates.map((assigned) => (
                  <View
                    key={assigned.id}
                    className="flex-row items-center justify-between p-4 bg-orange-50 rounded-[14px]"
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-4 h-4 rounded-full mr-3.5"
                        style={{ backgroundColor: assigned.template.color }}
                      />
                      <View className="flex-1">
                        <Text className="text-base font-bold text-stone-800">
                          {assigned.template.name}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      className="p-2 active:opacity-60"
                      onPress={() => handleUnassignTemplate(assigned.templateId)}
                      disabled={unassignMutation.isPending}
                    >
                      <Ionicons
                        name="remove-circle"
                        size={24}
                        color={unassignMutation.isPending ? '#B8A89A' : '#F43F5E'}
                      />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Divider */}
          <View className="h-px bg-stone-200 my-5" />

          {/* Available Templates */}
          <View className="mb-2">
            <Text className="text-xs font-bold text-stone-400 mb-3 tracking-wider">
              AVAILABLE TEMPLATES
            </Text>
            {availableTemplates.length === 0 ? (
              <View className="items-center py-6">
                <Ionicons name="checkmark-circle-outline" size={40} color="#B8A89A" />
                <Text className="text-[15px] text-stone-400 mt-3">
                  All templates assigned
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {availableTemplates.map((template: any, index) => (
                  <View
                    key={template.id}
                  >
                    <Pressable
                      className="flex-row items-center justify-between p-4 bg-orange-50 rounded-[14px] active:opacity-80"
                      onPress={() => handleAssignTemplate(template.id)}
                      disabled={assignMutation.isPending}
                    >
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-4 h-4 rounded-full mr-3.5"
                          style={{ backgroundColor: template.color }}
                        />
                        <View className="flex-1">
                          <Text className="text-base font-bold text-stone-800">
                            {template.name}
                          </Text>
                          <Text className="text-[13px] text-stone-400 mt-0.5">
                            {template.tasks?.length || 0} tasks
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        className={`${assignMutation.isPending ? 'opacity-50' : ''}`}
                        onPress={() => handleAssignTemplate(template.id)}
                        disabled={assignMutation.isPending}
                      >
                        <LinearGradient
                          colors={['#14B8A6', '#0D9488']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          className="w-11 h-11 rounded-xl justify-center items-center"
                        >
                          <Ionicons name="add" size={24} color="#FFFFFF" />
                        </LinearGradient>
                      </Pressable>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Saving State */}
          {assignMutation.isPending || unassignMutation.isPending ? (
            <View className="flex-row items-center justify-center gap-2.5 p-3.5 bg-teal-100 rounded-[14px]">
              <ActivityIndicator size="small" color="#14B8A6" />
              <Text className="text-sm font-semibold text-teal-600">Saving changes...</Text>
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
