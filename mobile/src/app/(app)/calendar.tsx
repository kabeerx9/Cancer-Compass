import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

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
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { ref: modalRef, present: openModal, dismiss: closeModal } = useModal();

  const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const { data: assignedDays = [], isLoading: assignedLoading } = useQuery(templateQueries.assignedDays(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  ));

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
      const dateString = new Date(assigned.date).toISOString().split('T')[0];

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
        selectedColor: '#2563EB',
      };
    }

    return marked;
  };

  const getAssignedTemplatesForDate = (dateString: string) => {
    return assignedDays.filter((assigned) => {
      const assignedDate = new Date(assigned.date).toISOString().split('T')[0];
      return assignedDate === dateString;
    });
  };

  const getAvailableTemplatesForDate = (dateString: string) => {
    const assignedTemplateIds = getAssignedTemplatesForDate(dateString).map((a) => a.templateId);
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
      await unassignMutation.mutateAsync({ id: templateId, date: selectedDate });
    } catch (error) {
      console.error('Failed to unassign template:', error);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const uniqueTemplates = Object.values(
    assignedDays.reduce((unique: { [key: string]: any }, assigned) => {
      const key = assigned.templateId;
      if (!unique[key]) {
        unique[key] = assigned.template;
      }
      return unique;
    }, {} as Record<string, any>)
  );

  const selectedDateTemplates = selectedDate ? getAssignedTemplatesForDate(selectedDate) : [];
  const availableTemplates = selectedDate ? getAvailableTemplatesForDate(selectedDate) : [];

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Calendar</Text>
      </View>

      <Calendar
        className="mx-4 mb-4 rounded-lg shadow-sm"
        theme={{
          backgroundColor: '#FFFFFF',
          calendarBackground: '#FFFFFF',
          textSectionTitleColor: '#6B7280',
          selectedDayBackgroundColor: '#2563EB',
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: '#2563EB',
          dayTextColor: '#1F2937',
          textDisabledColor: '#D1D5DB',
          arrowColor: '#2563EB',
          monthTextColor: '#111827',
          textMonthFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 13,
          textDayHeaderFontWeight: '600',
        }}
        markedDates={getMarkedDates()}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        markingType="multi-dot"
        enableSwipeMonths={true}
        current={today}
      />

      <ScrollView className="flex-1 px-4 pb-4">
        <Text className="text-base font-semibold text-gray-900 mb-3">Templates Legend</Text>
        {assignedLoading ? (
          <Text className="text-sm text-gray-500 italic">Loading...</Text>
        ) : uniqueTemplates.length === 0 ? (
          <Text className="text-sm text-gray-400 italic">No templates created yet</Text>
        ) : (
          <View className="gap-2">
            {uniqueTemplates.map((template: any) => (
              <View key={template.id} className="flex-row items-center">
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: template.color }} />
                <Text className="text-sm text-gray-600">{template.name}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal ref={modalRef} snapPoints={['70%']} title={selectedDate}>
        <View className="px-6 pb-6">
          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Assigned Templates</Text>
          {selectedDateTemplates.length === 0 ? (
            <View className="py-4">
              <Text className="text-sm text-gray-400 italic text-center">No templates assigned</Text>
            </View>
          ) : (
            <View className="mb-4">
              {selectedDateTemplates.map((assigned) => (
                <View key={assigned.id} className="flex-row items-center py-3 border-b border-gray-200">
                  <View className="w-4 h-4 rounded-lg mr-3" style={{ backgroundColor: assigned.template.color }} />
                  <Text className="flex-1 text-base text-gray-900">{assigned.template.name}</Text>
                  <Pressable
                    className="p-2"
                    onPress={() => handleUnassignTemplate(assigned.templateId)}
                    disabled={unassignMutation.isPending}
                  >
                    <Ionicons name="close-circle" size={22} color={unassignMutation.isPending ? '#9CA3AF' : '#EF4444'} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <View className="h-px bg-gray-200 my-4" />

          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Available Templates</Text>
          {availableTemplates.length === 0 ? (
            <View className="py-4">
              <Text className="text-sm text-gray-400 italic text-center">All templates assigned</Text>
            </View>
          ) : (
            <View>
              {availableTemplates.map((template: any) => (
                <Pressable
                  key={template.id}
                  className="flex-row items-center py-3 border-b border-gray-200"
                  onPress={() => handleAssignTemplate(template.id)}
                  disabled={assignMutation.isPending}
                >
                  <View className="w-4 h-4 rounded-lg mr-3" style={{ backgroundColor: template.color }} />
                  <Text className="flex-1 text-base text-gray-900">{template.name}</Text>
                  <View className="p-2">
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color={assignMutation.isPending ? '#9CA3AF' : '#2563EB'}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {assignMutation.isPending || unassignMutation.isPending ? (
            <View className="mt-4 py-2 bg-blue-50 rounded-lg">
              <Text className="text-sm text-blue-600 text-center">Saving...</Text>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
