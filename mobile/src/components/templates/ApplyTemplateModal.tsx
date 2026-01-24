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

import { DayTemplate, templateQueries } from '@/features/templates';

interface ApplyTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (template: DayTemplate) => void;
}

export function ApplyTemplateModal({ visible, onClose, onApply }: ApplyTemplateModalProps) {
  const router = useRouter();
  const { data: templates = [], isLoading } = useQuery(templateQueries.all());

  const handleManage = () => {
    onClose();
    router.push('/manage-templates');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="flex-row justify-between items-center p-6 border-b border-neutral-100">
          <Text className="text-xl font-bold text-neutral-900">Apply Template</Text>
          <Pressable onPress={onClose} className="p-1 bg-neutral-100 rounded-full">
            <Ionicons name="close" size={24} color="#111827" />
          </Pressable>
        </View>

        <View className="flex-1 p-6">
           <Text className="text-neutral-500 mb-4">Choose a template to add its tasks to this day.</Text>

           {isLoading ? (
             <ActivityIndicator className="mt-5" color="#2563EB" />
           ) : (
             <ScrollView className="flex-1">
               {templates.length === 0 ? (
                 <View className="items-center mt-10">
                   <Text className="text-neutral-400">No templates found.</Text>
                   <Pressable onPress={handleManage} className="mt-2">
                     <Text className="text-primary-600 font-semibold">Create one now</Text>
                   </Pressable>
                 </View>
               ) : (
                 templates.map((t) => (
                   <Pressable
                      key={t.id}
                      className="flex-row items-center p-4 bg-neutral-50 rounded-2xl mb-3 border border-neutral-100 active:bg-neutral-100"
                      onPress={() => onApply(t)}
                   >
                     <View className="w-1 h-8 rounded-full mr-4" style={{ backgroundColor: t.color }} />
                     <View className="flex-1">
                       <Text className="text-base font-bold text-neutral-900">{t.name}</Text>
                       <Text className="text-sm text-neutral-500">{t.tasks.length} tasks</Text>
                     </View>
                     <Ionicons name="add-circle" size={28} color="#2563EB" />
                   </Pressable>
                 ))
               )}
             </ScrollView>
           )}
        </View>

        <View className="p-6 border-t border-neutral-100">
          <Pressable
            className="bg-neutral-100 py-4 rounded-xl items-center active:bg-neutral-200"
            onPress={handleManage}
          >
            <Text className="text-neutral-900 font-semibold text-base">Manage Templates</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
