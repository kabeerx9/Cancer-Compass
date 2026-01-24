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
  StyleSheet,
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

const THEME = {
  primary: '#2563EB',
  background: '#F9FAFB',
  textHeading: '#111827',
  textMuted: '#9CA3AF',
  border: '#F3F4F6',
};

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
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={THEME.textHeading} />
          </Pressable>
          <Text style={styles.headerTitle}>Manage Templates</Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={THEME.primary} />
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
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={{ color: THEME.textMuted }}>No templates yet.</Text>
                <Text style={{ color: THEME.textMuted, marginTop: 8 }}>Create one to quick-start your day planning.</Text>
              </View>
            }
          />
        )}

        <Pressable style={styles.fab} onPress={openCreate}>
          <Ionicons name="add" size={28} color="#FFF" />
        </Pressable>
      </SafeAreaView>

      {/* Edit/Create Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Template' : 'New Template'}</Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={THEME.textHeading} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>Template Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Infusion Day"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Color Coding</Text>
            <View style={styles.colorRow}>
              {COLORS.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.colorSelected]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

            <Text style={styles.label}>Default Tasks</Text>
            <View style={styles.taskList}>
              {tasks.map((task, index) => (
                <View key={index} style={styles.taskRow}>
                  <Text style={styles.taskText}>{task.title}</Text>
                  <Pressable onPress={() => removeTask(index)}>
                    <Ionicons name="close-circle" size={20} color={THEME.textMuted} />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.addTaskRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Add checklist item..."
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                onSubmitEditing={addTask}
              />
              <Pressable style={styles.addIconBtn} onPress={addTask}>
                 <Ionicons name="add" size={24} color={THEME.primary} />
              </Pressable>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.modalFooter}>
             <Pressable style={styles.saveBtn} onPress={handleSave}>
               {createMutation.isPending || updateMutation.isPending ? (
                 <ActivityIndicator color="#FFF" />
               ) : (
                 <Text style={styles.saveBtnText}>Save Template</Text>
               )}
             </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  safeArea: { flex: 1 },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: THEME.textHeading },
  backBtn: { padding: 4 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  list: { padding: 16 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalBody: { flex: 1, padding: 24 },

  label: { fontSize: 14, fontWeight: '600', color: THEME.textHeading, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: THEME.background,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    fontSize: 16,
  },

  colorRow: { flexDirection: 'row', gap: 12 },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },
  colorSelected: { borderWidth: 3, borderColor: '#111827' },

  taskList: { marginBottom: 12 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  taskText: { fontSize: 16, color: THEME.textHeading },

  addTaskRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addIconBtn: { padding: 12, backgroundColor: '#EFF6FF', borderRadius: 12 },

  modalFooter: { padding: 24, borderTopWidth: 1, borderTopColor: THEME.border },
  saveBtn: {
    backgroundColor: THEME.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
