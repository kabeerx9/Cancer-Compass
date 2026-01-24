import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DailyTask } from '@/features/tasks';

const THEME = {
  primary: '#2563EB',
  textHeading: '#111827',
  textBody: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#F3F4F6',
  success: '#10B981',
  successLight: '#D1FAE5',
};

interface TaskItemProps {
  task: DailyTask;
  onToggle: (task: DailyTask) => void;
  onDelete: (task: DailyTask) => void;
  isToggling?: boolean;
}

export function TaskItem({ task, onToggle, onDelete, isToggling }: TaskItemProps) {
  return (
    <View style={[styles.container, task.isCompleted && styles.containerCompleted]}>
      <Pressable
        style={styles.checkbox}
        onPress={() => onToggle(task)}
        disabled={isToggling}
      >
        {isToggling ? (
          <ActivityIndicator size="small" color={THEME.primary} />
        ) : (
          <Ionicons
            name={task.isCompleted ? 'checkbox' : 'square-outline'}
            size={24}
            color={task.isCompleted ? THEME.success : THEME.textMuted}
          />
        )}
      </Pressable>

      <View style={styles.content}>
        <Text
          style={[styles.title, task.isCompleted && styles.titleCompleted]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {task.description && (
           <Text style={styles.description} numberOfLines={1}>
             {task.description}
           </Text>
        )}
        {task.sourceType === 'template' && (
           <View style={styles.badge}>
             <Text style={styles.badgeText}>Template</Text>
           </View>
        )}
      </View>

      <Pressable style={styles.deleteBtn} onPress={() => onDelete(task)}>
        <Ionicons name="trash-outline" size={20} color={THEME.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  containerCompleted: {
    backgroundColor: '#F9FAFB',
    opacity: 0.8,
  },
  checkbox: {
    padding: 4,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textHeading,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: THEME.textMuted,
  },
  description: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    color: THEME.primary,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 8,
  },
});
