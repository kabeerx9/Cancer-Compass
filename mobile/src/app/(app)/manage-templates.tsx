import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TemplateItem } from '@/components/templates/TemplateItem';
import {
  type DayTemplate,
  templateMutations,
  templateQueries,
} from '@/features/templates';

const COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#6366F1',
];

export default function ManageTemplatesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: templates = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery(templateQueries.all());

  const createMutation = useMutation(templateMutations.create(queryClient));
  const updateMutation = useMutation(templateMutations.update(queryClient));
  const deleteMutation = useMutation(templateMutations.delete(queryClient));

  // Edit/Create Modal State
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState(COLORS[0]);
  const [tasks, setTasks] = React.useState<{ title: string; order: number }[]>(
    []
  );
  const [newTaskTitle, setNewTaskTitle] = React.useState('');

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setColor(COLORS[0]);
    setTasks([{ title: 'Arrive at hospital', order: 0 }]); // Default example
    setModalVisible(true);
  };

  const openEdit = (template: DayTemplate) => {
    setEditingId(template.id);
    setName(template.name);
    setColor(template.color);
    setTasks(template.tasks.map((t) => ({ title: t.title, order: t.order })));
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Template name is required');
      return;
    }

    const templateData = {
      name: name.trim(),
      color,
      tasks: tasks.map((t, idx) => ({ ...t, order: idx })),
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: templateData },
        { onSuccess: () => setModalVisible(false) }
      );
    } else {
      createMutation.mutate(templateData, {
        onSuccess: () => setModalVisible(false),
      });
    }
  };

  const handleDelete = (template: DayTemplate) => {
    Alert.alert(
      'Delete Template',
      'Are you sure? This will not affect past days assigned with this template.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(template.id),
        },
      ]
    );
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks([...tasks, { title: newTaskTitle.trim(), order: tasks.length }]);
    setNewTaskTitle('');
  };

  const removeTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between border-b border-neutral-100 p-4">
          <Pressable
            onPress={() => router.back()}
            className="rounded-full p-2 active:bg-neutral-100"
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-xl font-bold text-neutral-900">
            Manage Templates
          </Text>
          <View className="w-10" />
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            data={templates}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TemplateItem
                template={item}
                onPress={openEdit}
                onDelete={handleDelete}
              />
            )}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#2563EB"
              />
            }
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-12">
                <Text className="mb-2 text-neutral-500">No templates yet.</Text>
                <Text className="text-sm text-neutral-400">
                  Create one to quick-start your day planning.
                </Text>
              </View>
            }
          />
        )}

        <Pressable
          className="absolute bottom-6 right-6 size-14 items-center justify-center rounded-full bg-primary-600 shadow-lg active:opacity-90"
          onPress={openCreate}
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </Pressable>
      </SafeAreaView>

      {/* Edit/Create Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between border-b border-neutral-100 p-6">
            <Text className="text-xl font-bold text-neutral-900">
              {editingId ? 'Edit Template' : 'New Template'}
            </Text>
            <Pressable
              onPress={() => setModalVisible(false)}
              className="rounded-full bg-neutral-100 p-1"
            >
              <Ionicons name="close" size={24} color="#111827" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 p-6">
            <Text className="my-2 text-sm font-bold text-neutral-900">
              Template Name
            </Text>
            <TextInput
              className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-lg"
              placeholder="e.g. Infusion Day"
              value={name}
              onChangeText={setName}
            />

            <Text className="mb-2 text-sm font-bold text-neutral-900">
              Color Coding
            </Text>
            <View className="mb-6 flex-row flex-wrap gap-3">
              {COLORS.map((c) => (
                <Pressable
                  key={c}
                  className={`size-10 rounded-full ${color === c ? 'border-4 border-neutral-800' : ''}`}
                  style={{ backgroundColor: c }}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

            <Text className="mb-2 text-sm font-bold text-neutral-900">
              Default Tasks
            </Text>
            <View className="mb-4">
              {tasks.map((task, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between border-b border-neutral-100 py-3"
                >
                  <Text className="mr-2 flex-1 text-base text-neutral-900">
                    {task.title}
                  </Text>
                  <Pressable onPress={() => removeTask(index)} className="p-1">
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </Pressable>
                </View>
              ))}
            </View>

            <View className="mb-10 flex-row items-center gap-3">
              <TextInput
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                placeholder="Add checklist item..."
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                onSubmitEditing={addTask}
              />
              <Pressable
                className="rounded-xl bg-primary-50 p-3"
                onPress={addTask}
              >
                <Ionicons name="add" size={24} color="#2563EB" />
              </Pressable>
            </View>
          </ScrollView>

          <View className="border-t border-neutral-100 p-6">
            <Pressable
              className="items-center rounded-xl bg-primary-600 py-4 active:opacity-90"
              onPress={handleSave}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="text-lg font-bold text-white">
                  Save Template
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
