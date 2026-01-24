import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';

import { DailyTask } from '@/features/tasks';

interface TaskItemProps {
  task: DailyTask;
  onToggle: (task: DailyTask) => void;
  onDelete: (task: DailyTask) => void;
  isToggling?: boolean;
}

export function TaskItem({ task, onToggle, onDelete, isToggling }: TaskItemProps) {
  return (
    <View
      className={`flex-row items-center bg-white p-4 rounded-xl mb-2 border border-neutral-100 ${
        task.isCompleted ? 'bg-neutral-50 opacity-80' : ''
      }`}
    >
      <Pressable
        className="p-1 mr-3"
        onPress={() => onToggle(task)}
        disabled={isToggling}
      >
        {isToggling ? (
          <ActivityIndicator size="small" color="#2563EB" />
        ) : (
          <Ionicons
            name={task.isCompleted ? 'checkbox' : 'square-outline'}
            size={24}
            color={task.isCompleted ? '#10B981' : '#9CA3AF'}
          />
        )}
      </Pressable>

      <View className="flex-1">
        <Text
          className={`text-base font-semibold text-neutral-900 ${
            task.isCompleted ? 'line-through text-neutral-400' : ''
          }`}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {task.description ? (
           <Text className="text-sm text-neutral-500 mt-0.5" numberOfLines={1}>
             {task.description}
           </Text>
        ) : null}

        {/* We don't really need a template badge if grouped by section, but keeping it small just in case it's mixed */}
        {task.sourceType === 'template' && !task.isCompleted && (
           <View className="mt-1 self-start bg-primary-50 px-2 py-0.5 rounded-lg">
             <Text className="text-xs font-medium text-primary-600">Template</Text>
           </View>
        )}
      </View>

      <Pressable className="p-2" onPress={() => onDelete(task)}>
        <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
      </Pressable>
    </View>
  );
}
