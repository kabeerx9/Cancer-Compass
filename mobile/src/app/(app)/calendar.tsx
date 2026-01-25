import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Modal, useModal } from '@/components/ui/modal';
import { templateMutations, templateQueries } from '@/features/templates';

// Warm Healing Theme
const THEME = {
  primary: '#14B8A6', // Warm Teal
  primaryLight: '#CCFBF1',
  secondary: '#F43F5E', // Warm Coral
  background: '#FFFBF9', // Warm cream
  surface: '#FFFFFF',
  textHeading: '#2D2824',
  textBody: '#6B5D50',
  textMuted: '#B8A89A',
  border: '#E8E0D8',
  shadow: 'rgba(45, 40, 36, 0.08)',
};

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
        selectedColor: THEME.primary,
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Your</Text>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>
        <View style={styles.monthBadge}>
          <Text style={styles.monthText}>{getMonthName()}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Calendar Card */}
        <Animated.View entering={FadeInDown.springify()}>
          <View style={styles.calendarCard}>
            <Calendar
              style={styles.calendar}
              theme={{
                backgroundColor: THEME.surface,
                calendarBackground: THEME.surface,
                textSectionTitleColor: THEME.textMuted,
                selectedDayBackgroundColor: THEME.primary,
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: THEME.primary,
                dayTextColor: THEME.textHeading,
                textDisabledColor: THEME.border,
                arrowColor: THEME.primary,
                monthTextColor: THEME.textHeading,
                textMonthFontWeight: '700' as const,
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 13,
                textDayHeaderFontWeight: '700' as const,
                textSectionTitleDisabledColor: THEME.border,
              }}
              markedDates={getMarkedDates()}
              onDayPress={onDayPress}
              onMonthChange={onMonthChange}
              markingType="multi-dot"
              enableSwipeMonths={true}
              current={today}
            />
          </View>
        </Animated.View>

        {/* Templates Legend */}
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <View style={styles.legendSection}>
            <Text style={styles.sectionTitle}>Templates Legend</Text>
            {assignedLoading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={THEME.primary} />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : uniqueTemplates.length === 0 ? (
              <View style={styles.emptyLegend}>
                <Ionicons
                  name="calendar-outline"
                  size={32}
                  color={THEME.textMuted}
                />
                <Text style={styles.emptyLegendText}>
                  No templates created yet
                </Text>
              </View>
            ) : (
              <View style={styles.legendList}>
                {uniqueTemplates.map((template: any, index) => (
                  <Animated.View
                    key={template.id}
                    entering={FadeInDown.delay(150 + index * 50).springify()}
                    style={styles.legendItem}
                  >
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: template.color },
                      ]}
                    />
                    <View style={styles.legendInfo}>
                      <Text style={styles.legendName}>{template.name}</Text>
                      <Text style={styles.legendTaskCount}>
                        {template.tasks?.length || 0} tasks
                      </Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      <Modal ref={modalRef} snapPoints={['75%']} title={getDayName()}>
        <View style={styles.modalContent}>
          <View style={styles.modalSection}>
            <Text style={styles.sectionLabel}>ASSIGNED TEMPLATES</Text>
            {selectedDateTemplates.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons
                  name="folder-open-outline"
                  size={40}
                  color={THEME.textMuted}
                />
                <Text style={styles.emptySectionText}>
                  No templates assigned
                </Text>
              </View>
            ) : (
              <View style={styles.assignedList}>
                {selectedDateTemplates.map((assigned) => (
                  <Animated.View
                    key={assigned.id}
                    entering={FadeInDown.springify()}
                    style={styles.assignedItem}
                  >
                    <View style={styles.assignedLeft}>
                      <View
                        style={[
                          styles.assignedDot,
                          { backgroundColor: assigned.template.color },
                        ]}
                      />
                      <View style={styles.assignedInfo}>
                        <Text style={styles.assignedName}>
                          {assigned.template.name}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() =>
                        handleUnassignTemplate(assigned.templateId)
                      }
                      disabled={unassignMutation.isPending}
                    >
                      <Ionicons
                        name="remove-circle"
                        size={24}
                        color={
                          unassignMutation.isPending
                            ? THEME.textMuted
                            : THEME.secondary
                        }
                      />
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.modalSection}>
            <Text style={styles.sectionLabel}>AVAILABLE TEMPLATES</Text>
            {availableTemplates.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={40}
                  color={THEME.textMuted}
                />
                <Text style={styles.emptySectionText}>
                  All templates assigned
                </Text>
              </View>
            ) : (
              <View style={styles.availableList}>
                {availableTemplates.map((template: any, index) => (
                  <Animated.View
                    key={template.id}
                    entering={FadeInDown.delay(index * 50).springify()}
                  >
                    <Pressable
                      style={styles.availableItem}
                      onPress={() => handleAssignTemplate(template.id)}
                      disabled={assignMutation.isPending}
                    >
                      <View style={styles.availableLeft}>
                        <View
                          style={[
                            styles.availableDot,
                            { backgroundColor: template.color },
                          ]}
                        />
                        <View style={styles.availableInfo}>
                          <Text style={styles.availableName}>
                            {template.name}
                          </Text>
                          <Text style={styles.availableTaskCount}>
                            {template.tasks?.length || 0} tasks
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        style={[
                          styles.addBtn,
                          assignMutation.isPending && styles.addBtnDisabled,
                        ]}
                        onPress={() => handleAssignTemplate(template.id)}
                        disabled={assignMutation.isPending}
                      >
                        <LinearGradient
                          colors={[THEME.primary, '#0D9488']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.addBtnGradient}
                        >
                          <Ionicons name="add" size={24} color="#FFFFFF" />
                        </LinearGradient>
                      </Pressable>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            )}
          </View>

          {assignMutation.isPending || unassignMutation.isPending ? (
            <View style={styles.savingState}>
              <ActivityIndicator size="small" color={THEME.primary} />
              <Text style={styles.savingText}>Saving changes...</Text>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // Header
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.textMuted,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: THEME.textHeading,
    letterSpacing: -0.5,
  },
  monthBadge: {
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: THEME.primary,
  },
  // Calendar
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  calendarCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  calendar: {
    borderRadius: 12,
  },
  // Legend Section
  legendSection: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: THEME.textHeading,
    marginBottom: 16,
  },
  loadingState: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: THEME.textMuted,
    fontWeight: '600' as const,
  },
  emptyLegend: {
    alignItems: 'center' as const,
    paddingVertical: 32,
  },
  emptyLegendText: {
    fontSize: 15,
    color: THEME.textMuted,
    marginTop: 12,
  },
  legendList: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 14,
    backgroundColor: THEME.background,
    borderRadius: 14,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 14,
  },
  legendInfo: {
    flex: 1,
  },
  legendName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: THEME.textHeading,
  },
  legendTaskCount: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 2,
  },
  // Modal
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalSection: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: THEME.textMuted,
    marginBottom: 12,
    letterSpacing: 1,
  },
  emptySection: {
    alignItems: 'center' as const,
    paddingVertical: 24,
  },
  emptySectionText: {
    fontSize: 15,
    color: THEME.textMuted,
    marginTop: 12,
  },
  // Assigned List
  assignedList: {
    gap: 12,
  },
  assignedItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    backgroundColor: THEME.background,
    borderRadius: 14,
  },
  assignedLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  assignedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 14,
  },
  assignedInfo: {
    flex: 1,
  },
  assignedName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: THEME.textHeading,
  },
  removeBtn: {
    padding: 8,
  },
  // Available List
  availableList: {
    gap: 12,
  },
  availableItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    backgroundColor: THEME.background,
    borderRadius: 14,
  },
  availableLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  availableDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 14,
  },
  availableInfo: {
    flex: 1,
  },
  availableName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: THEME.textHeading,
  },
  availableTaskCount: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 2,
  },
  addBtn: {
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 20,
  },
  savingState: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    padding: 14,
    backgroundColor: THEME.primaryLight,
    borderRadius: 14,
  },
  savingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: THEME.primary,
  },
});
