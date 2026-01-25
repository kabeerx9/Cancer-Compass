import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { Pressable, Text, View } from 'react-native';

import { type DayTemplate } from '@/features/templates';

interface TemplateItemProps {
  template: DayTemplate;
  onPress: (template: DayTemplate) => void;
  onDelete: (template: DayTemplate) => void;
}

export function TemplateItem({
  template,
  onPress,
  onDelete,
}: TemplateItemProps) {
  return (
    <Pressable
      className="mb-3 h-20 flex-row items-center overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm active:bg-neutral-50"
      onPress={() => onPress(template)}
    >
      <View
        className="h-full w-2"
        style={{ backgroundColor: template.color || '#3B82F6' }}
      />

      <View className="flex-1 px-4">
        <Text className="mb-1 text-base font-bold text-neutral-900">
          {template.name}
        </Text>
        <Text className="text-xs font-medium text-neutral-500">
          {template.tasks.length}{' '}
          {template.tasks.length === 1 ? 'task' : 'tasks'}
        </Text>
      </View>

      <Pressable className="p-4" onPress={() => onDelete(template)}>
        <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
      </Pressable>
    </Pressable>
  );
}
