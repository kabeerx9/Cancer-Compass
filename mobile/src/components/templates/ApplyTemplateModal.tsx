import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { type DayTemplate, templateQueries } from '@/features/templates';

interface ApplyTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (template: DayTemplate) => void;
}

export function ApplyTemplateModal({
  visible,
  onClose,
  onApply,
}: ApplyTemplateModalProps) {
  const router = useRouter();
  const { data: templates = [], isLoading } = useQuery(templateQueries.all());

  const handleManage = () => {
    onClose();
    router.push('/manage-templates');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between border-b border-neutral-100 p-6">
          <Text className="text-xl font-bold text-neutral-900">
            Apply Template
          </Text>
          <Pressable
            onPress={onClose}
            className="rounded-full bg-neutral-100 p-1"
          >
            <Ionicons name="close" size={24} color="#111827" />
          </Pressable>
        </View>

        <View className="flex-1 p-6">
          <Text className="mb-4 text-neutral-500">
            Choose a template to add its tasks to this day.
          </Text>

          {isLoading ? (
            <ActivityIndicator className="mt-5" color="#14B8A6" />
          ) : (
            <ScrollView className="flex-1">
              {templates.length === 0 ? (
                <View className="mt-10 items-center">
                  <Text className="text-neutral-400">No templates found.</Text>
                  <Pressable onPress={handleManage} className="mt-2">
                    <Text className="font-semibold text-teal-600">
                      Create one now
                    </Text>
                  </Pressable>
                </View>
              ) : (
                templates.map((t) => (
                  <Pressable
                    key={t.id}
                    className="mb-3 flex-row items-center rounded-2xl border border-neutral-100 bg-neutral-50 p-4 active:bg-neutral-100"
                    onPress={() => onApply(t)}
                  >
                    <View
                      className="mr-4 h-8 w-1 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    <View className="flex-1">
                      <Text className="text-base font-bold text-neutral-900">
                        {t.name}
                      </Text>
                      <Text className="text-sm text-neutral-500">
                        {t.tasks.length} tasks
                      </Text>
                    </View>
                    <Ionicons name="add-circle" size={28} color="#14B8A6" />
                  </Pressable>
                ))
              )}
            </ScrollView>
          )}
        </View>

        <View className="border-t border-neutral-100 p-6">
          <Pressable
            className="items-center rounded-xl bg-neutral-100 py-4 active:bg-neutral-200"
            onPress={handleManage}
          >
            <Text className="text-base font-semibold text-neutral-900">
              Manage Templates
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
