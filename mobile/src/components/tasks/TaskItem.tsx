import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { Pressable, Text, View } from 'react-native';

import { type DailyTask } from '@/features/tasks';

interface TaskItemProps {
  task: DailyTask;
  onToggle: (task: DailyTask) => void;
  onDelete: (task: DailyTask) => void;
  onEdit: (task: DailyTask) => void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  return (
    <View
      className={`mb-2 flex-row items-center rounded-xl border border-neutral-100 bg-white p-4 ${
        task.isCompleted ? 'bg-neutral-50 opacity-80' : ''
      }`}
    >
      <Pressable className="mr-3 p-1" onPress={() => onToggle(task)}>
        <Ionicons
          name={task.isCompleted ? 'checkbox' : 'square-outline'}
          size={24}
          color={task.isCompleted ? '#10B981' : '#9CA3AF'}
        />
      </Pressable>

      <View className="flex-1">
        <Text
          className={`text-base font-semibold text-neutral-900 ${
            task.isCompleted ? 'text-neutral-400 line-through' : ''
          }`}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {task.description ? (
          <Text className="mt-0.5 text-sm text-neutral-500" numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}

        {/* We don't really need a template badge if grouped by section, but keeping it small just in case it's mixed */}
        {task.sourceType === 'template' && !task.isCompleted && (
          <View className="mt-1 self-start rounded-lg bg-teal-50 px-2 py-0.5">
            <Text className="text-xs font-medium text-teal-600">
              Template
            </Text>
          </View>
        )}
      </View>

      <Pressable className="p-2" onPress={() => onEdit(task)}>
        <Ionicons name="create-outline" size={20} color="#9CA3AF" />
      </Pressable>
      <Pressable className="p-2" onPress={() => onDelete(task)}>
        <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
      </Pressable>
    </View>
  );
}
