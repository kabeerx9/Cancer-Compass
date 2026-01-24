import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DayTemplate, templateQueries } from '@/features/templates';

const THEME = {
  primary: '#2563EB',
  textHeading: '#111827',
  textBody: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#F3F4F6',
};

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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Apply Template</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color={THEME.textHeading} />
          </Pressable>
        </View>

        <View style={styles.body}>
           <Text style={styles.subtitle}>Choose a template to add its tasks to this day.</Text>

           {isLoading ? (
             <ActivityIndicator style={{marginTop: 20}} color={THEME.primary} />
           ) : (
             <ScrollView style={styles.list}>
               {templates.length === 0 ? (
                 <View style={styles.empty}>
                   <Text style={styles.emptyText}>No templates found.</Text>
                   <Pressable onPress={handleManage}>
                     <Text style={styles.link}>Create one now</Text>
                   </Pressable>
                 </View>
               ) : (
                 templates.map((t) => (
                   <Pressable key={t.id} style={styles.item} onPress={() => onApply(t)}>
                     <View style={[styles.colorStrip, { backgroundColor: t.color }]} />
                     <View style={styles.itemContent}>
                       <Text style={styles.itemName}>{t.name}</Text>
                       <Text style={styles.itemCount}>{t.tasks.length} tasks</Text>
                     </View>
                     <Ionicons name="add-circle-outline" size={24} color={THEME.primary} />
                   </Pressable>
                 ))
               )}
             </ScrollView>
           )}
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.manageBtn} onPress={handleManage}>
            <Text style={styles.manageText}>Manage Templates</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: THEME.textHeading },
  body: { flex: 1, padding: 24 },
  subtitle: { fontSize: 14, color: THEME.textMuted, marginBottom: 16 },
  list: { flex: 1 },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  colorStrip: { width: 4, height: 24, borderRadius: 2, marginRight: 12 },
  itemContent: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: THEME.textHeading },
  itemCount: { fontSize: 12, color: THEME.textMuted },

  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: THEME.textMuted },
  link: { color: THEME.primary, fontWeight: '600', marginTop: 8 },

  footer: { padding: 24, borderTopWidth: 1, borderTopColor: THEME.border },
  manageBtn: { alignItems: 'center', padding: 12 },
  manageText: { color: THEME.primary, fontWeight: '600', fontSize: 16 },
});
