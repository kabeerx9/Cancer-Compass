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
import Toast from 'react-native-toast-message';

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
  const deleteMutation = useMutation(templateMutations.delete(queryClient));

  // Create Modal State
  const [modalVisible, setModalVisible] = React.useState(false);
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState(COLORS[0]);
  const [tasks, setTasks] = React.useState<{ title: string; order: number }[]>(
    []
  );
  const [newTaskTitle, setNewTaskTitle] = React.useState('');

  // View Modal State
  const [viewModalVisible, setViewModalVisible] = React.useState(false);
  const [viewingTemplate, setViewingTemplate] = React.useState<DayTemplate | null>(null);

  const openCreate = () => {
    setName('');
    setColor(COLORS[0]);
    setTasks([{ title: 'Arrive at hospital', order: 0 }]);
    setModalVisible(true);
  };

  const openView = (template: DayTemplate) => {
    setViewingTemplate(template);
    setViewModalVisible(true);
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

    createMutation.mutate(templateData, {
      onSuccess: () => {
        setModalVisible(false);
      },
      onError: (error: Error) => {
        Toast.show({
          type: 'error',
          text1: 'Failed to create template',
          text2: error.message,
          position: 'bottom',
        });
      },
    });
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
          onPress: () => {
            deleteMutation.mutate(template.id, {
              onSuccess: () => {
                setViewModalVisible(false);
                Toast.show({
                  type: 'info',
                  text1: 'Template deleted',
                  text2: template.name,
                  position: 'bottom',
                });
              },
              onError: (error: Error) => {
                Toast.show({
                  type: 'error',
                  text1: 'Failed to delete template',
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
            <ActivityIndicator size="large" color="#14B8A6" />
          </View>
        ) : (
          <FlatList
            data={templates}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TemplateItem
                template={item}
                onPress={openView}
                onDelete={handleDelete}
              />
            )}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#14B8A6"
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
          className="absolute bottom-6 right-6 size-14 items-center justify-center rounded-full bg-teal-600 shadow-lg active:opacity-90"
          onPress={openCreate}
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </Pressable>
      </SafeAreaView>

      {/* Create Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between border-b border-neutral-100 p-6">
            <Text className="text-xl font-bold text-neutral-900">
              New Template
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
                className="rounded-xl bg-teal-50 p-3"
                onPress={addTask}
              >
                <Ionicons name="add" size={24} color="#14B8A6" />
              </Pressable>
            </View>
          </ScrollView>

          <View className="border-t border-neutral-100 p-6">
            <Pressable
              className="items-center rounded-xl bg-teal-600 py-4 active:opacity-90"
              onPress={handleSave}
            >
              {createMutation.isPending ? (
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

      {/* View Modal */}
      <Modal
        visible={viewModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between border-b border-neutral-100 p-6">
            <Text className="text-xl font-bold text-neutral-900">
              Template Details
            </Text>
            <Pressable
              onPress={() => setViewModalVisible(false)}
              className="rounded-full bg-neutral-100 p-1"
            >
              <Ionicons name="close" size={24} color="#111827" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 p-6">
            <Text className="my-2 text-sm font-bold text-neutral-900">
              Template Name
            </Text>
            <View className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <Text className="text-lg text-neutral-900">
                {viewingTemplate?.name}
              </Text>
            </View>

            <Text className="mb-2 text-sm font-bold text-neutral-900">
              Color Coding
            </Text>
            <View className="mb-6 flex-row items-center gap-3">
              <View
                className="size-10 rounded-full"
                style={{ backgroundColor: viewingTemplate?.color || '#3B82F6' }}
              />
            </View>

            <Text className="mb-2 text-sm font-bold text-neutral-900">
              Default Tasks
            </Text>
            <View className="mb-6">
              {viewingTemplate?.tasks.map((task, index) => (
                <View
                  key={index}
                  className="flex-row items-center border-b border-neutral-100 py-3"
                >
                  <Text className="flex-1 text-base text-neutral-900">
                    {task.title}
                  </Text>
                </View>
              ))}
              {viewingTemplate?.tasks.length === 0 && (
                <Text className="py-3 text-neutral-500">No tasks</Text>
              )}
            </View>

            <View className="mb-6 rounded-xl bg-neutral-100 p-4">
              <Text className="text-sm text-neutral-600">
                You cannot edit templates at this time. If you need to modify this template, delete it and create a new one.
              </Text>
            </View>
          </ScrollView>

          <View className="border-t border-neutral-100 p-6">
            <Pressable
              className="items-center rounded-xl bg-red-600 py-4 active:opacity-90"
              onPress={() => viewingTemplate && handleDelete(viewingTemplate)}
            >
              {deleteMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="text-lg font-bold text-white">
                  Delete Template
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
