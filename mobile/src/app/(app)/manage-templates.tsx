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
  DayTemplate,
  templateMutations,
  templateQueries,
} from '@/features/templates';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

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
  const [tasks, setTasks] = React.useState<{ title: string; order: number }[]>([]);
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
    setTasks(template.tasks.map(t => ({ title: t.title, order: t.order })));
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
      createMutation.mutate(
        templateData,
        { onSuccess: () => setModalVisible(false) }
      );
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
        <View className="px-4 py-4 flex-row justify-between items-center border-b border-neutral-100">
          <Pressable onPress={() => router.back()} className="p-2 rounded-full active:bg-neutral-100">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-xl font-bold text-neutral-900">Manage Templates</Text>
          <View className="w-10" />
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
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
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563EB" />}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-12">
                <Text className="text-neutral-500 mb-2">No templates yet.</Text>
                <Text className="text-neutral-400 text-sm">Create one to quick-start your day planning.</Text>
              </View>
            }
          />
        )}

        <Pressable
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full justify-center items-center shadow-lg active:opacity-90"
          onPress={openCreate}
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </Pressable>
      </SafeAreaView>

      {/* Edit/Create Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-6 border-b border-neutral-100">
            <Text className="text-xl font-bold text-neutral-900">{editingId ? 'Edit Template' : 'New Template'}</Text>
            <Pressable onPress={() => setModalVisible(false)} className="p-1 bg-neutral-100 rounded-full">
              <Ionicons name="close" size={24} color="#111827" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 p-6">
            <Text className="text-sm font-bold text-neutral-900 mb-2 mt-2">Template Name</Text>
            <TextInput
              className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-lg mb-6"
              placeholder="e.g. Infusion Day"
              value={name}
              onChangeText={setName}
            />

            <Text className="text-sm font-bold text-neutral-900 mb-2">Color Coding</Text>
            <View className="flex-row gap-3 mb-6 flex-wrap">
              {COLORS.map((c) => (
                <Pressable
                  key={c}
                  className={`w-10 h-10 rounded-full ${color === c ? 'border-4 border-neutral-800' : ''}`}
                  style={{ backgroundColor: c }}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

            <Text className="text-sm font-bold text-neutral-900 mb-2">Default Tasks</Text>
            <View className="mb-4">
              {tasks.map((task, index) => (
                <View key={index} className="flex-row items-center justify-between py-3 border-b border-neutral-100">
                  <Text className="text-base text-neutral-900 flex-1 mr-2">{task.title}</Text>
                  <Pressable onPress={() => removeTask(index)} className="p-1">
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </Pressable>
                </View>
              ))}
            </View>

            <View className="flex-row items-center gap-3 mb-10">
              <TextInput
                className="flex-1 bg-neutral-50 p-3 rounded-xl border border-neutral-200"
                placeholder="Add checklist item..."
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                onSubmitEditing={addTask}
              />
              <Pressable className="bg-primary-50 p-3 rounded-xl" onPress={addTask}>
                 <Ionicons name="add" size={24} color="#2563EB" />
              </Pressable>
            </View>
          </ScrollView>

          <View className="p-6 border-t border-neutral-100">
             <Pressable
               className="bg-primary-600 py-4 rounded-xl items-center active:opacity-90"
               onPress={handleSave}
             >
               {createMutation.isPending || updateMutation.isPending ? (
                 <ActivityIndicator color="#FFF" />
               ) : (
                 <Text className="text-white font-bold text-lg">Save Template</Text>
               )}
             </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
