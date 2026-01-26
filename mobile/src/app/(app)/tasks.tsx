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
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TaskItem } from '@/components/tasks';
import { ApplyTemplateModal } from '@/components/templates';
import { type DailyTask, taskMutations, taskQueries } from '@/features/tasks';
import { templateMutations } from '@/features/templates';

interface TaskSection {
  title: string;
  template?: any;
  data: DailyTask[];
}

export default function TasksPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [date, setDate] = React.useState(new Date());
  const [isManuallyRefreshing, setIsManuallyRefreshing] = React.useState(false);

  // Format date as YYYY-MM-DD for API (handles timezone correctly)
  const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useQuery(taskQueries.byDate(dateString));

  const createMutation = useMutation(taskMutations.create(queryClient));
  const updateMutation = useMutation(taskMutations.update(queryClient));
  const toggleMutation = useMutation(taskMutations.toggleComplete(queryClient));
  const deleteMutation = useMutation(taskMutations.delete(queryClient));
  const assignTemplateMutation = useMutation(
    templateMutations.assign(queryClient)
  );
  const unassignTemplateMutation = useMutation(
    templateMutations.unassign(queryClient)
  );

  // Modals
  const [modalVisible, setModalVisible] = React.useState(false); // Add Task
  const [editModalVisible, setEditModalVisible] = React.useState(false); // Edit Task
  const [applyVisible, setApplyVisible] = React.useState(false); // Apply Template
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [editingTask, setEditingTask] = React.useState<DailyTask | null>(null);

  // Group tasks
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
        data: groupTasks.sort((a, b) => a.order - b.order),
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
          const msg = err.message || 'Failed to assign template';
          Alert.alert('Error', msg);
        },
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
            unassignTemplateMutation.mutate({
              id: template.id,
              date: dateString,
            });
          },
        },
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
          const msg = error.message || 'Failed to add task';
          Alert.alert('Error', msg);
        },
      }
    );
  };

  const handleEditTask = (task: DailyTask) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingTask || !newTaskTitle.trim()) return;

    updateMutation.mutate(
      {
        id: editingTask.id,
        data: {
          title: newTaskTitle.trim(),
          date: dateString,
        },
      },
      {
        onSuccess: () => {
          setEditingTask(null);
          setNewTaskTitle('');
          setEditModalVisible(false);
        },
        onError: (error: Error) => {
          const msg = error.message || 'Failed to update task';
          Alert.alert('Error', msg);
        },
      }
    );
  };

  const handleDelete = (task: DailyTask) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(task.id),
      },
    ]);
  };

  const handleRefresh = () => {
    setIsManuallyRefreshing(true);
    refetch();
    setTimeout(() => setIsManuallyRefreshing(false), 1000);
  };

  const formatDateDisplay = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const check = new Date(d);
    check.setHours(0, 0, 0, 0);

    if (check.getTime() === today.getTime()) return 'Today';

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (check.getTime() === tomorrow.getTime()) return 'Tomorrow';

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (check.getTime() === yesterday.getTime()) return 'Yesterday';

    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderSectionHeader = ({ section }: { section: TaskSection }) => (
    <View
      className={`my-2 flex-row items-center bg-neutral-50 py-3 ${section.template ? 'border-l-4 pl-2' : ''}`}
      style={
        section.template
          ? { borderLeftColor: section.template.color }
          : undefined
      }
    >
      <View className="flex-1">
        <Text className="pl-2 text-lg font-bold text-neutral-900">
          {section.title}
        </Text>
      </View>
      {section.template && (
        <Pressable
          onPress={() => handleUnassign(section.template)}
          className="p-2"
        >
          <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
        </Pressable>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-neutral-50">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between border-b border-neutral-100 bg-white px-6 py-4">
          <Text className="text-2xl font-bold text-neutral-900">Plan</Text>
          <View className="flex-row gap-3">
            <Pressable
              className="flex-row items-center gap-2 rounded-xl bg-primary-50 px-3 py-2 active:opacity-70"
              onPress={() => setApplyVisible(true)}
            >
              <Ionicons name="duplicate-outline" size={20} color="#2563EB" />
              <Text className="text-sm font-semibold text-primary-600">
                Template
              </Text>
            </Pressable>
            <Pressable
              className="rounded-xl bg-primary-600 p-2 active:opacity-70"
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* Date Navigator */}
        <View className="m-4 flex-row items-center justify-between rounded-2xl border border-neutral-100 bg-white p-2 shadow-sm">
          <Pressable
            onPress={handlePrevDay}
            className="rounded-full p-2 active:bg-neutral-100"
          >
            <Ionicons name="chevron-back" size={24} color="#4B5563" />
          </Pressable>
          <View className="flex-row items-center rounded-xl bg-primary-50 px-4 py-2">
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#2563EB"
              style={{ marginRight: 6 }}
            />
            <Text className="text-base font-semibold text-primary-600">
              {formatDateDisplay(date)}
            </Text>
          </View>
          <Pressable
            onPress={handleNextDay}
            className="rounded-full p-2 active:bg-neutral-100"
          >
            <Ionicons name="chevron-forward" size={24} color="#4B5563" />
          </Pressable>
        </View>

        {isLoading && !tasks.length ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563EB" />
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
                onEdit={handleEditTask}
              />
            )}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={isManuallyRefreshing}
                onRefresh={handleRefresh}
                tintColor="#2563EB"
              />
            }
            stickySectionHeadersEnabled={false}
            ListEmptyComponent={
              <View className="mx-4 mt-12 items-center rounded-2xl border border-dashed border-neutral-200 bg-white p-8">
                <View className="mb-4 rounded-full bg-neutral-50 p-4">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={48}
                    color="#D1D5DB"
                  />
                </View>
                <Text className="text-base font-medium text-neutral-500">
                  No tasks for {formatDateDisplay(date)}
                </Text>
                <Text className="mb-6 mt-2 text-center text-sm text-neutral-400">
                  Add custom tasks or apply a template to get started.
                </Text>

                <View className="flex-row gap-4">
                  <Pressable
                    className="rounded-xl bg-primary-600 px-5 py-3 shadow-sm active:opacity-80"
                    onPress={() => setModalVisible(true)}
                  >
                    <Text className="font-semibold text-white">Add Task</Text>
                  </Pressable>
                  <Pressable
                    className="rounded-xl border border-neutral-200 bg-white px-5 py-3 shadow-sm active:bg-neutral-50"
                    onPress={() => setApplyVisible(true)}
                  >
                    <Text className="font-semibold text-neutral-700">
                      Use Template
                    </Text>
                  </Pressable>
                </View>
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
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between border-b border-neutral-100 p-6">
            <Text className="text-xl font-bold text-neutral-900">New Task</Text>
            <Pressable
              onPress={() => setModalVisible(false)}
              className="rounded-full bg-neutral-100 p-1"
            >
              <Ionicons name="close" size={20} color="#111827" />
            </Pressable>
          </View>

          <View className="p-6">
            <TextInput
              className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-lg text-neutral-900"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
              placeholderTextColor="#9CA3AF"
            />
            <Pressable
              className={`flex-row items-center justify-center rounded-xl py-4 ${!newTaskTitle.trim() ? 'bg-neutral-200' : 'bg-primary-600'}`}
              onPress={handleAddTask}
              disabled={!newTaskTitle.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text
                  className={`text-base font-bold ${!newTaskTitle.trim() ? 'text-neutral-400' : 'text-white'}`}
                >
                  Create Task
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between border-b border-neutral-100 p-6">
            <Text className="text-xl font-bold text-neutral-900">Edit Task</Text>
            <Pressable
              onPress={() => {
                setEditModalVisible(false);
                setEditingTask(null);
                setNewTaskTitle('');
              }}
              className="rounded-full bg-neutral-100 p-1"
            >
              <Ionicons name="close" size={20} color="#111827" />
            </Pressable>
          </View>

          <View className="p-6">
            <TextInput
              className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-lg text-neutral-900"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
              placeholderTextColor="#9CA3AF"
            />
            <Pressable
              className={`flex-row items-center justify-center rounded-xl py-4 ${!newTaskTitle.trim() ? 'bg-neutral-200' : 'bg-primary-600'}`}
              onPress={handleSaveEdit}
              disabled={!newTaskTitle.trim() || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text
                  className={`text-base font-bold ${!newTaskTitle.trim() ? 'text-neutral-400' : 'text-white'}`}
                >
                  Save Changes
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
