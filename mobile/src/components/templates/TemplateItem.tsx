import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { Pressable, Text, View } from 'react-native';

import { DayTemplate } from '@/features/templates';

interface TemplateItemProps {
  template: DayTemplate;
  onPress: (template: DayTemplate) => void;
  onDelete: (template: DayTemplate) => void;
}

export function TemplateItem({ template, onPress, onDelete }: TemplateItemProps) {
  return (
    <Pressable
      className="flex-row items-center bg-white rounded-2xl mb-3 border border-neutral-100 overflow-hidden h-20 active:bg-neutral-50 shadow-sm"
      onPress={() => onPress(template)}
    >
      <View
        className="w-2 h-full"
        style={{ backgroundColor: template.color || '#3B82F6' }}
      />

      <View className="flex-1 px-4">
        <Text className="text-base font-bold text-neutral-900 mb-1">{template.name}</Text>
        <Text className="text-xs text-neutral-500 font-medium">
          {template.tasks.length} {template.tasks.length === 1 ? 'task' : 'tasks'}
        </Text>
      </View>

      <Pressable className="p-4" onPress={() => onDelete(template)}>
        <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
      </Pressable>
    </Pressable>
  );
}
