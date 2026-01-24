import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TaskItem } from '@/components/tasks';
import { ApplyTemplateModal } from '@/components/templates';
import {
  DailyTask,
  taskMutations,
  taskQueries,
} from '@/features/tasks';
import { templateMutations } from '@/features/templates';

const THEME = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  background: '#F9FAFB',
  textHeading: '#111827',
  textBody: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#F3F4F6',
};

export default function TasksPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [date, setDate] = React.useState(new Date());

  // Format date as YYYY-MM-DD for API
  const dateString = date.toISOString().split('T')[0];

  const {
    data: tasks = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery(taskQueries.byDate(dateString));

  const createMutation = useMutation(taskMutations.create(queryClient));
  const toggleMutation = useMutation(taskMutations.toggleComplete(queryClient));
  const deleteMutation = useMutation(taskMutations.delete(queryClient));
  const assignTemplateMutation = useMutation(templateMutations.assign(queryClient));
  const unassignTemplateMutation = useMutation(templateMutations.unassign(queryClient));

  // Modals
  const [modalVisible, setModalVisible] = React.useState(false); // Add Task
  const [applyVisible, setApplyVisible] = React.useState(false); // Apply Template
  const [newTaskTitle, setNewTaskTitle] = React.useState('');

  // Group tasks
  interface TaskSection {
    title: string;
    template?: any;
    data: DailyTask[];
  }

  const groupedTasks = React.useMemo(() => {
    const sections: TaskSection[] = [];
    const customTasks = tasks.filter((t) => t.sourceType === 'custom');
    const templateTasks = tasks.filter((t) => t.sourceType === 'template');

    // Always put "My Tasks" first if it has any
    if (customTasks.length > 0) {
      sections.push({ title: 'My Tasks', data: customTasks });
    }

    // Group by template
    const templateGroups = new Map<string, DailyTask[]>();
    const templateInfos = new Map<string, any>();

    templateTasks.forEach((t) => {
      if (t.templateId) {
        if (!templateGroups.has(t.templateId)) {
          templateGroups.set(t.templateId, []);
          templateInfos.set(t.templateId, t.template);
        }
        templateGroups.get(t.templateId)?.push(t);
      }
    });

    templateGroups.forEach((groupTasks, templateId) => {
      const template = templateInfos.get(templateId);
      sections.push({
        title: template?.name || 'Template Tasks',
        template: template,
        data: groupTasks.sort((a,b) => a.order - b.order),
      });
    });

    return sections;
  }, [tasks]);

  const handlePrevDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    setDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  const handleApplyTemplate = (template: any) => {
    setApplyVisible(false);
    assignTemplateMutation.mutate(
      { id: template.id, date: dateString },
      {
        onSuccess: () => {
          Alert.alert('Success', `Applied ${template.name} to this day.`);
        },
        onError: (err: Error) => {
           // check if error message contains "already assigned"
           const msg = err.message || 'Failed';
           Alert.alert('Error', msg);
        }
      }
    );
  };

  const handleUnassign = (template: any) => {
    Alert.alert(
      'Remove Template',
      `Remove "${template.name}" and all its tasks from today?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
             unassignTemplateMutation.mutate({ id: template.id, date: dateString });
          }
        }
      ]
    );
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    createMutation.mutate(
      {
        date: dateString,
        title: newTaskTitle.trim(),
      },
      {
        onSuccess: () => {
          setNewTaskTitle('');
          setModalVisible(false);
        },
        onError: (error: Error) => {
          Alert.alert('Error', error.message || 'Failed to create task');
        },
      }
    );
  };

  const handleDelete = (task: DailyTask) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(task.id),
        },
      ]
    );
  };

  const formatDateDisplay = (d: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const check = new Date(d);
    check.setHours(0,0,0,0);

    if (check.getTime() === today.getTime()) return 'Today';

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (check.getTime() === tomorrow.getTime()) return 'Tomorrow';

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (check.getTime() === yesterday.getTime()) return 'Yesterday';

    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const renderSectionHeader = ({ section }: { section: any }) => (
     <View style={[styles.sectionHeader, section.template && { borderLeftColor: section.template.color, borderLeftWidth: 4 }]}>
        <View style={{flex: 1}}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        {section.template && (
           <Pressable onPress={() => handleUnassign(section.template)} style={styles.trashBtn}>
             <Ionicons name="trash-outline" size={18} color={THEME.textMuted} />
           </Pressable>
        )}
     </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily Tasks</Text>
          <View style={{flexDirection: 'row', gap: 12}}>
            <Pressable style={styles.manageBtn} onPress={() => setApplyVisible(true)}>
               <Ionicons name="duplicate-outline" size={20} color={THEME.primary} />
               <Text style={styles.manageBtnText}>Apply Template</Text>
            </Pressable>
            <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
               <Ionicons name="add" size={24} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* Date Navigator */}
        <View style={styles.dateNav}>
          <Pressable onPress={handlePrevDay} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={24} color={THEME.textBody} />
          </Pressable>
          <View style={styles.dateDisplay}>
             <Ionicons name="calendar-outline" size={16} color={THEME.primary} style={{marginRight: 6}} />
             <Text style={styles.dateText}>{formatDateDisplay(date)}</Text>
          </View>
          <Pressable onPress={handleNextDay} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={24} color={THEME.textBody} />
          </Pressable>
        </View>

        {isLoading && !tasks.length ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.primary} />
          </View>
        ) : (
          <SectionList
            sections={groupedTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onToggle={(t) => toggleMutation.mutate({ id: t.id })}
                onDelete={handleDelete}
                isToggling={toggleMutation.isPending && toggleMutation.variables?.id === item.id}
              />
            )}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={THEME.primary} />
            }
            stickySectionHeadersEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color={THEME.textMuted} />
                <Text style={styles.emptyText}>No tasks for this day</Text>
                <Pressable onPress={() => setModalVisible(true)}>
                   <Text style={styles.emptyAction}>+ Add a task</Text>
                </Pressable>
              </View>
            }
          />
        )}
      </SafeAreaView>

      {/* Apply Template Modal */}
      <ApplyTemplateModal
         visible={applyVisible}
         onClose={() => setApplyVisible(false)}
         onApply={handleApplyTemplate}
      />

      {/* Add Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
           <View style={styles.modalHeader}>
             <Text style={styles.modalTitle}>New Task</Text>
             <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
               <Ionicons name="close" size={24} color={THEME.textHeading} />
             </Pressable>
           </View>

           <View style={styles.modalBody}>
             <TextInput
               style={styles.input}
               placeholder="What needs to be done?"
               value={newTaskTitle}
               onChangeText={setNewTaskTitle}
               autoFocus
               placeholderTextColor={THEME.textMuted}
             />
             <Pressable
                style={[styles.saveBtn, !newTaskTitle.trim() && styles.saveBtnDisabled]}
                onPress={handleAddTask}
                disabled={!newTaskTitle.trim() || createMutation.isPending}
             >
               {createMutation.isPending ? (
                 <ActivityIndicator color="#FFF" />
               ) : (
                 <Text style={styles.saveBtnText}>Create Task</Text>
               )}
             </Pressable>
           </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.textHeading,
  },
  addBtn: {
    backgroundColor: THEME.primary,
    padding: 8,
    borderRadius: 12,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: THEME.primaryLight,
  },
  manageBtnText: {
    color: THEME.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  navBtn: {
    padding: 8,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.primary,
  },
  listContent: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.textMuted,
    marginTop: 12,
  },
  emptyAction: {
    fontSize: 16,
    color: THEME.primary,
    fontWeight: '600',
    marginTop: 8,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textHeading,
    paddingLeft: 8,
  },
  trashBtn: {
    padding: 8,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textHeading,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  input: {
    backgroundColor: THEME.background,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: THEME.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: THEME.textMuted,
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
