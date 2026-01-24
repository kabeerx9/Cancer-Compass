import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DayTemplate } from '@/features/templates';

const THEME = {
  textHeading: '#111827',
  textMuted: '#9CA3AF',
  border: '#F3F4F6',
};

interface TemplateItemProps {
  template: DayTemplate;
  onPress: (template: DayTemplate) => void;
  onDelete: (template: DayTemplate) => void;
}

export function TemplateItem({ template, onPress, onDelete }: TemplateItemProps) {
  return (
    <Pressable style={styles.container} onPress={() => onPress(template)}>
      <View style={[styles.colorStrip, { backgroundColor: template.color || '#3B82F6' }]} />

      <View style={styles.content}>
        <Text style={styles.name}>{template.name}</Text>
        <Text style={styles.taskCount}>
          {template.tasks.length} {template.tasks.length === 1 ? 'task' : 'tasks'}
        </Text>
      </View>

      <Pressable style={styles.deleteBtn} onPress={() => onDelete(template)}>
        <Ionicons name="trash-outline" size={20} color={THEME.textMuted} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: 'hidden',
    height: 72,
  },
  colorStrip: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textHeading,
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 13,
    color: THEME.textMuted,
  },
  deleteBtn: {
    padding: 16,
  },
});
