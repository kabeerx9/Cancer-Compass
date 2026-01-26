import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BLOOD_TYPE_OPTIONS,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  type Contact,
  type ContactCategory,
  type CreateContactData,
  patientInfoMutations,
  patientInfoQueries,
  type UpdateContactData,
  type UpdatePatientInfoData,
} from '@/features/patient-info';
import { medicationQueries } from '@/features/medications';
import { patientInfoApi } from '@/features/patient-info/api';

// Warm Healing Theme (matching medications screen)
const THEME = {
  primary: '#14B8A6',
  primaryLight: '#CCFBF1',
  background: '#FFFBF9',
  surface: '#FFFFFF',
  textHeading: '#2D2824',
  textBody: '#6B5D50',
  textMuted: '#B8A89A',
  border: '#E8E0D8',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  shadow: 'rgba(45, 40, 36, 0.08)',
};

type TabType = 'patient' | 'contacts';

const CONTACT_CATEGORIES: ContactCategory[] = ['medical_team', 'hospital', 'logistics', 'personal'];

export default function QuickInfoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<TabType>('patient');
  const [isManuallyRefreshing, setIsManuallyRefreshing] = React.useState(false);

  // Queries
  const { data: patientInfo, isLoading: isLoadingPatient, refetch: refetchPatient } = patientInfoQueries.usePatientInfo();
  const { data: contacts = [], isLoading: isLoadingContacts, refetch: refetchContacts } = patientInfoQueries.useContacts();
  const { data: medications = [] } = medicationQueries.useActiveMedications();

  // Mutations
  const updatePatientMutation = patientInfoMutations.useUpdatePatientInfo();
  const createContactMutation = patientInfoMutations.useCreateContact();
  const updateContactMutation = patientInfoMutations.useUpdateContact();
  const deleteContactMutation = patientInfoMutations.useDeleteContact();

  // Modal states
  const [patientModalVisible, setPatientModalVisible] = React.useState(false);
  const [contactModalVisible, setContactModalVisible] = React.useState(false);
  const [editingContact, setEditingContact] = React.useState<Contact | null>(null);

  // Patient form data
  const [patientForm, setPatientForm] = React.useState<UpdatePatientInfoData>({
    name: '',
    dateOfBirth: '',
    bloodType: '',
    allergies: '',
    diagnosis: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
  });

  // Contact form data
  const [contactForm, setContactForm] = React.useState<CreateContactData>({
    name: '',
    role: '',
    phone: '',
    email: '',
    category: 'medical_team',
    notes: '',
  });

  // Load patient data into form when modal opens
  React.useEffect(() => {
    if (patientModalVisible && patientInfo) {
      setPatientForm({
        name: patientInfo.name || '',
        dateOfBirth: patientInfo.dateOfBirth?.split('T')[0] || '',
        bloodType: patientInfo.bloodType || '',
        allergies: patientInfo.allergies || '',
        diagnosis: patientInfo.diagnosis || '',
        insuranceProvider: patientInfo.insuranceProvider || '',
        insurancePolicyNumber: patientInfo.insurancePolicyNumber || '',
        emergencyContactName: patientInfo.emergencyContactName || '',
        emergencyContactPhone: patientInfo.emergencyContactPhone || '',
        notes: patientInfo.notes || '',
      });
    }
  }, [patientModalVisible, patientInfo]);

  const handleRefresh = () => {
    setIsManuallyRefreshing(true);
    if (activeTab === 'patient') {
      refetchPatient();
    } else {
      refetchContacts();
    }
    setTimeout(() => setIsManuallyRefreshing(false), 1000);
  };

  const openPatientModal = () => {
    setPatientModalVisible(true);
  };

  const closePatientModal = () => {
    setPatientModalVisible(false);
  };

  const handleSavePatient = () => {
    updatePatientMutation.mutate(patientForm, {
      onSuccess: () => {
        closePatientModal();
        Alert.alert('Success', 'Patient information updated');
      },
    });
  };

  const openContactModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setContactForm({
        name: contact.name,
        role: contact.role || '',
        phone: contact.phone || '',
        email: contact.email || '',
        category: contact.category,
        notes: contact.notes || '',
      });
    } else {
      setEditingContact(null);
      setContactForm({
        name: '',
        role: '',
        phone: '',
        email: '',
        category: 'medical_team',
        notes: '',
      });
    }
    setContactModalVisible(true);
  };

  const closeContactModal = () => {
    setContactModalVisible(false);
    setEditingContact(null);
  };

  const handleSaveContact = () => {
    if (!contactForm.name.trim()) {
      Alert.alert('Error', 'Contact name is required');
      return;
    }

    if (editingContact) {
      const updateData: UpdateContactData = {
        name: contactForm.name.trim(),
        role: contactForm.role?.trim() || undefined,
        phone: contactForm.phone?.trim() || undefined,
        email: contactForm.email?.trim() || undefined,
        category: contactForm.category,
        notes: contactForm.notes?.trim() || undefined,
      };
      updateContactMutation.mutate(
        { id: editingContact.id, data: updateData },
        { onSuccess: closeContactModal }
      );
    } else {
      createContactMutation.mutate(
        {
          name: contactForm.name.trim(),
          role: contactForm.role?.trim() || undefined,
          phone: contactForm.phone?.trim() || undefined,
          email: contactForm.email?.trim() || undefined,
          category: contactForm.category,
          notes: contactForm.notes?.trim() || undefined,
        },
        { onSuccess: closeContactModal }
      );
    }
  };

  const handleDeleteContact = (contact: Contact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete "${contact.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteContactMutation.mutate(contact.id),
        },
      ]
    );
  };

  const handleCallContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleShare = async () => {
    try {
      const text = await patientInfoApi.getShareableText();
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied!', 'Patient information copied to clipboard. You can now paste it in any app.');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy information');
    }
  };

  const isLoading = activeTab === 'patient' ? isLoadingPatient : isLoadingContacts;

  // Group contacts by category
  const contactsByCategory = React.useMemo(() => {
    const grouped: Record<ContactCategory, Contact[]> = {
      medical_team: [],
      hospital: [],
      logistics: [],
      personal: [],
    };
    contacts.forEach((contact) => {
      if (grouped[contact.category]) {
        grouped[contact.category].push(contact);
      }
    });
    return grouped;
  }, [contacts]);

  const activeMeds = medications.filter((m) => m.isActive);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={THEME.textHeading} />
          </Pressable>
          <Text style={styles.headerTitle}>Quick Reference</Text>
          <Pressable onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-outline" size={24} color={THEME.primary} />
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'patient' && styles.tabActive]}
            onPress={() => setActiveTab('patient')}
          >
            <Ionicons
              name="person"
              size={18}
              color={activeTab === 'patient' ? THEME.primary : THEME.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'patient' && styles.tabTextActive]}>
              Patient Info
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'contacts' && styles.tabActive]}
            onPress={() => setActiveTab('contacts')}
          >
            <Ionicons
              name="people"
              size={18}
              color={activeTab === 'contacts' ? THEME.primary : THEME.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'contacts' && styles.tabTextActive]}>
              Contacts
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isManuallyRefreshing}
              onRefresh={handleRefresh}
              tintColor={THEME.primary}
            />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME.primary} />
            </View>
          ) : activeTab === 'patient' ? (
            <PatientInfoView
              patientInfo={patientInfo}
              medications={activeMeds}
              onEdit={openPatientModal}
            />
          ) : (
            <ContactsView
              contactsByCategory={contactsByCategory}
              onAddContact={() => openContactModal()}
              onEditContact={openContactModal}
              onDeleteContact={handleDeleteContact}
              onCallContact={handleCallContact}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Patient Info Modal */}
      <Modal
        visible={patientModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePatientModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Patient Info</Text>
            <Pressable onPress={closePatientModal} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={THEME.textHeading} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Patient Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                value={patientForm.name}
                onChangeText={(t) => setPatientForm({ ...patientForm, name: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Date of Birth</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={patientForm.dateOfBirth}
                  onChangeText={(t) => setPatientForm({ ...patientForm, dateOfBirth: t })}
                  placeholderTextColor={THEME.textMuted}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Blood Type</Text>
                <View style={styles.bloodTypeChips}>
                  {BLOOD_TYPE_OPTIONS.map((type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.bloodTypeChip,
                        patientForm.bloodType === type && styles.bloodTypeChipActive,
                      ]}
                      onPress={() => setPatientForm({ ...patientForm, bloodType: type })}
                    >
                      <Text
                        style={[
                          styles.bloodTypeText,
                          patientForm.bloodType === type && styles.bloodTypeTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Diagnosis / Cancer Type</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Non-Hodgkin Lymphoma"
                value={patientForm.diagnosis}
                onChangeText={(t) => setPatientForm({ ...patientForm, diagnosis: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Allergies</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="List any allergies (drug, food, etc.)"
                value={patientForm.allergies}
                onChangeText={(t) => setPatientForm({ ...patientForm, allergies: t })}
                placeholderTextColor={THEME.textMuted}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.sectionDivider}>
              <Text style={styles.sectionTitle}>Insurance</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Insurance Provider</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Star Health"
                value={patientForm.insuranceProvider}
                onChangeText={(t) => setPatientForm({ ...patientForm, insuranceProvider: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Policy Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Policy number"
                value={patientForm.insurancePolicyNumber}
                onChangeText={(t) => setPatientForm({ ...patientForm, insurancePolicyNumber: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.sectionDivider}>
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contact name"
                  value={patientForm.emergencyContactName}
                  onChangeText={(t) => setPatientForm({ ...patientForm, emergencyContactName: t })}
                  placeholderTextColor={THEME.textMuted}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Phone number"
                  value={patientForm.emergencyContactPhone}
                  onChangeText={(t) => setPatientForm({ ...patientForm, emergencyContactPhone: t })}
                  placeholderTextColor={THEME.textMuted}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any other important information"
                value={patientForm.notes}
                onChangeText={(t) => setPatientForm({ ...patientForm, notes: t })}
                placeholderTextColor={THEME.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={styles.saveBtn}
              onPress={handleSavePatient}
              disabled={updatePatientMutation.isPending}
            >
              {updatePatientMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.saveText}>Save Patient Info</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Contact Modal */}
      <Modal
        visible={contactModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeContactModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </Text>
            <Pressable onPress={closeContactModal} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={THEME.textHeading} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.categoryChips}>
                {CONTACT_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryChip,
                      contactForm.category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setContactForm({ ...contactForm, category: cat })}
                  >
                    <Text style={styles.categoryIcon}>{CATEGORY_ICONS[cat]}</Text>
                    <Text
                      style={[
                        styles.categoryChipText,
                        contactForm.category === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contact name"
                value={contactForm.name}
                onChangeText={(t) => setContactForm({ ...contactForm, name: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Role / Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Oncologist, Nurse Coordinator"
                value={contactForm.role}
                onChangeText={(t) => setContactForm({ ...contactForm, role: t })}
                placeholderTextColor={THEME.textMuted}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Phone number"
                  value={contactForm.phone}
                  onChangeText={(t) => setContactForm({ ...contactForm, phone: t })}
                  placeholderTextColor={THEME.textMuted}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  value={contactForm.email}
                  onChangeText={(t) => setContactForm({ ...contactForm, email: t })}
                  placeholderTextColor={THEME.textMuted}
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional notes about this contact"
                value={contactForm.notes}
                onChangeText={(t) => setContactForm({ ...contactForm, notes: t })}
                placeholderTextColor={THEME.textMuted}
                multiline
                numberOfLines={2}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={styles.saveBtn}
              onPress={handleSaveContact}
              disabled={createContactMutation.isPending || updateContactMutation.isPending}
            >
              {createContactMutation.isPending || updateContactMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.saveText}>
                    {editingContact ? 'Update Contact' : 'Add Contact'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Patient Info View Component
interface PatientInfoViewProps {
  patientInfo: any;
  medications: any[];
  onEdit: () => void;
}

function PatientInfoView({ patientInfo, medications, onEdit }: PatientInfoViewProps) {
  const hasData = patientInfo?.name || patientInfo?.bloodType || patientInfo?.diagnosis;

  return (
    <Animated.View entering={FadeInDown.springify()}>
      {/* Edit Button */}
      <Pressable style={styles.editCard} onPress={onEdit}>
        <LinearGradient
          colors={[THEME.primary, '#0D9488']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.editCardGradient}
        >
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          <Text style={styles.editCardText}>
            {hasData ? 'Edit Patient Info' : 'Add Patient Info'}
          </Text>
        </LinearGradient>
      </Pressable>

      {!hasData ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="person-outline" size={48} color={THEME.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Patient Info Yet</Text>
          <Text style={styles.emptySubtitle}>
            Add patient details for quick access during hospital visits
          </Text>
        </View>
      ) : (
        <>
          {/* Basic Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="person" size={20} color={THEME.primary} />
              <Text style={styles.infoCardTitle}>Basic Information</Text>
            </View>
            {patientInfo?.name && (
              <InfoRow label="Name" value={patientInfo.name} />
            )}
            {patientInfo?.dateOfBirth && (
              <InfoRow
                label="Date of Birth"
                value={new Date(patientInfo.dateOfBirth).toLocaleDateString()}
              />
            )}
            {patientInfo?.bloodType && (
              <InfoRow label="Blood Type" value={patientInfo.bloodType} highlight />
            )}
            {patientInfo?.diagnosis && (
              <InfoRow label="Diagnosis" value={patientInfo.diagnosis} />
            )}
            {patientInfo?.allergies && (
              <InfoRow label="Allergies" value={patientInfo.allergies} warning />
            )}
          </View>

          {/* Insurance Card */}
          {(patientInfo?.insuranceProvider || patientInfo?.insurancePolicyNumber) && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons name="shield-checkmark" size={20} color={THEME.primary} />
                <Text style={styles.infoCardTitle}>Insurance</Text>
              </View>
              {patientInfo?.insuranceProvider && (
                <InfoRow label="Provider" value={patientInfo.insuranceProvider} />
              )}
              {patientInfo?.insurancePolicyNumber && (
                <InfoRow label="Policy Number" value={patientInfo.insurancePolicyNumber} />
              )}
            </View>
          )}

          {/* Emergency Contact Card */}
          {(patientInfo?.emergencyContactName || patientInfo?.emergencyContactPhone) && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons name="call" size={20} color={THEME.danger} />
                <Text style={styles.infoCardTitle}>Emergency Contact</Text>
              </View>
              {patientInfo?.emergencyContactName && (
                <InfoRow label="Name" value={patientInfo.emergencyContactName} />
              )}
              {patientInfo?.emergencyContactPhone && (
                <Pressable
                  onPress={() => Linking.openURL(`tel:${patientInfo.emergencyContactPhone}`)}
                >
                  <InfoRow
                    label="Phone"
                    value={patientInfo.emergencyContactPhone}
                    isLink
                  />
                </Pressable>
              )}
            </View>
          )}
        </>
      )}

      {/* Current Medications Card */}
      {medications.length > 0 && (
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="medical" size={20} color={THEME.primary} />
            <Text style={styles.infoCardTitle}>Current Medications</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{medications.length}</Text>
            </View>
          </View>
          {medications.map((med) => (
            <View key={med.id} style={styles.medRow}>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medDetails}>
                {med.dosage || ''} {med.timeLabel ? `• ${med.timeLabel}` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

// Info Row Component
interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  warning?: boolean;
  isLink?: boolean;
}

function InfoRow({ label, value, highlight, warning, isLink }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          highlight && styles.infoValueHighlight,
          warning && styles.infoValueWarning,
          isLink && styles.infoValueLink,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// Contacts View Component
interface ContactsViewProps {
  contactsByCategory: Record<ContactCategory, Contact[]>;
  onAddContact: () => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
  onCallContact: (phone: string) => void;
}

function ContactsView({
  contactsByCategory,
  onAddContact,
  onEditContact,
  onDeleteContact,
  onCallContact,
}: ContactsViewProps) {
  const totalContacts = Object.values(contactsByCategory).flat().length;

  return (
    <Animated.View entering={FadeInDown.springify()}>
      {/* Add Button */}
      <Pressable style={styles.editCard} onPress={onAddContact}>
        <LinearGradient
          colors={[THEME.primary, '#0D9488']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.editCardGradient}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.editCardText}>Add Contact</Text>
        </LinearGradient>
      </Pressable>

      {totalContacts === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="people-outline" size={48} color={THEME.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Contacts Yet</Text>
          <Text style={styles.emptySubtitle}>
            Save important phone numbers for doctors, hospitals, hotels, and more
          </Text>
        </View>
      ) : (
        CONTACT_CATEGORIES.map((category) => {
          const categoryContacts = contactsByCategory[category];
          if (categoryContacts.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categorySectionHeader}>
                <Text style={styles.categoryEmoji}>{CATEGORY_ICONS[category]}</Text>
                <Text style={styles.categorySectionTitle}>{CATEGORY_LABELS[category]}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{categoryContacts.length}</Text>
                </View>
              </View>

              {categoryContacts.map((contact) => (
                <Pressable
                  key={contact.id}
                  style={styles.contactCard}
                  onPress={() => onEditContact(contact)}
                >
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.role && <Text style={styles.contactRole}>{contact.role}</Text>}
                    {contact.phone && (
                      <View style={styles.contactDetail}>
                        <Ionicons name="call-outline" size={14} color={THEME.textMuted} />
                        <Text style={styles.contactDetailText}>{contact.phone}</Text>
                      </View>
                    )}
                    {contact.email && (
                      <View style={styles.contactDetail}>
                        <Ionicons name="mail-outline" size={14} color={THEME.textMuted} />
                        <Text style={styles.contactDetailText}>{contact.email}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.contactActions}>
                    {contact.phone && (
                      <Pressable
                        style={styles.callBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          onCallContact(contact.phone!);
                        }}
                      >
                        <Ionicons name="call" size={18} color={THEME.success} />
                      </Pressable>
                    )}
                    <Pressable
                      style={styles.deleteBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        onDeleteContact(contact);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color={THEME.danger} />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          );
        })
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: THEME.textHeading },
  shareBtn: {
    padding: 8,
    backgroundColor: THEME.primaryLight,
    borderRadius: 20,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 8,
  },
  tabActive: {
    backgroundColor: THEME.primaryLight,
    borderColor: THEME.primary,
  },
  tabText: { fontSize: 14, fontWeight: '600', color: THEME.textMuted },
  tabTextActive: { color: THEME.primary },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 20, paddingBottom: 40 },

  // Edit Card
  editCard: { marginBottom: 20 },
  editCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  editCardText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  // Empty State
  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: THEME.textHeading, marginBottom: 8 },
  emptySubtitle: {
    fontSize: 15,
    color: THEME.textBody,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },

  // Info Card
  infoCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  infoCardTitle: { fontSize: 16, fontWeight: '700', color: THEME.textHeading, flex: 1 },
  badge: {
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: THEME.primary },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  infoLabel: { fontSize: 14, color: THEME.textMuted, fontWeight: '500' },
  infoValue: { fontSize: 14, color: THEME.textHeading, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 16 },
  infoValueHighlight: { color: THEME.primary, fontWeight: '700' },
  infoValueWarning: { color: THEME.danger },
  infoValueLink: { color: THEME.primary, textDecorationLine: 'underline' },

  // Medication Row
  medRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  medName: { fontSize: 15, fontWeight: '600', color: THEME.textHeading, marginBottom: 2 },
  medDetails: { fontSize: 13, color: THEME.textMuted },

  // Category Section
  categorySection: { marginBottom: 24 },
  categorySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryEmoji: { fontSize: 20 },
  categorySectionTitle: { fontSize: 16, fontWeight: '700', color: THEME.textHeading, flex: 1 },

  // Contact Card
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: '700', color: THEME.textHeading, marginBottom: 2 },
  contactRole: { fontSize: 13, color: THEME.textBody, marginBottom: 6 },
  contactDetail: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  contactDetailText: { fontSize: 13, color: THEME.textMuted },

  contactActions: { flexDirection: 'row', gap: 8 },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal
  modalContainer: { flex: 1, backgroundColor: THEME.surface },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: THEME.textHeading },
  closeBtn: { padding: 4 },
  modalBody: { flex: 1, paddingHorizontal: 24, paddingVertical: 20 },

  formGroup: { marginBottom: 20 },
  row: { flexDirection: 'row' },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textHeading,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: THEME.textHeading,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  sectionDivider: {
    marginTop: 8,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.primary,
  },

  bloodTypeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bloodTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  bloodTypeChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  bloodTypeText: { fontSize: 13, fontWeight: '600', color: THEME.textBody },
  bloodTypeTextActive: { color: '#FFFFFF' },

  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: THEME.primaryLight,
    borderColor: THEME.primary,
  },
  categoryIcon: { fontSize: 16 },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: THEME.textBody },
  categoryChipTextActive: { color: THEME.primary },

  modalFooter: { padding: 24, borderTopWidth: 1, borderTopColor: THEME.border },
  saveBtn: {
    backgroundColor: THEME.primary,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
