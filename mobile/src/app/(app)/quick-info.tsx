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
  Text,
  TextInput,
  View,
} from 'react-native';

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
    <View className="flex-1 bg-amber-50">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-amber-200">
          <Pressable onPress={() => router.back()} className="p-2 active:opacity-70">
            <Ionicons name="arrow-back" size={24} color="#451a03" />
          </Pressable>
          <Text className="text-xl font-bold text-amber-950">Quick Reference</Text>
          <Pressable onPress={handleShare} className="p-2 bg-teal-100 rounded-full active:opacity-70">
            <Ionicons name="share-outline" size={24} color="#0d9488" />
          </Pressable>
        </View>

        {/* Tabs */}
        <View className="flex-row px-6 pt-4 gap-3">
          <Pressable
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border gap-2 active:opacity-70 ${
              activeTab === 'patient'
                ? 'bg-teal-100 border-teal-600'
                : 'bg-white border-amber-200'
            }`}
            onPress={() => setActiveTab('patient')}
          >
            <Ionicons
              name="person"
              size={18}
              color={activeTab === 'patient' ? '#0d9488' : '#d6d3d1'}
            />
            <Text
              className={`text-sm font-semibold ${
                activeTab === 'patient' ? 'text-teal-600' : 'text-stone-400'
              }`}
            >
              Patient Info
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border gap-2 active:opacity-70 ${
              activeTab === 'contacts'
                ? 'bg-teal-100 border-teal-600'
                : 'bg-white border-amber-200'
            }`}
            onPress={() => setActiveTab('contacts')}
          >
            <Ionicons
              name="people"
              size={18}
              color={activeTab === 'contacts' ? '#0d9488' : '#d6d3d1'}
            />
            <Text
              className={`text-sm font-semibold ${
                activeTab === 'contacts' ? 'text-teal-600' : 'text-stone-400'
              }`}
            >
              Contacts
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 py-5 pb-10"
          refreshControl={
            <RefreshControl
              refreshing={isManuallyRefreshing}
              onRefresh={handleRefresh}
              tintColor="#0d9488"
            />
          }
        >
          {isLoading ? (
            <View className="flex-1 justify-center items-center pt-24">
              <ActivityIndicator size="large" color="#0d9488" />
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
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center px-6 py-5 border-b border-amber-200">
            <Text className="text-xl font-extrabold text-amber-950">Edit Patient Info</Text>
            <Pressable onPress={closePatientModal} className="p-1 active:opacity-70">
              <Ionicons name="close" size={24} color="#451a03" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-6 py-5">
            <View className="mb-5">
              <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Patient Name</Text>
              <TextInput
                className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950"
                placeholder="Full name"
                value={patientForm.name}
                onChangeText={(t) => setPatientForm({ ...patientForm, name: t })}
                placeholderTextColor="#d6d3d1"
              />
            </View>

            <View className="flex-row">
              <View className="flex-1 mr-3 mb-5">
                <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Date of Birth</Text>
                <TextInput
                  className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950"
                  placeholder="YYYY-MM-DD"
                  value={patientForm.dateOfBirth}
                  onChangeText={(t) => setPatientForm({ ...patientForm, dateOfBirth: t })}
                  placeholderTextColor="#d6d3d1"
                />
              </View>
              <View className="flex-1 mb-5">
                <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Blood Type</Text>
                <View className="flex-row flex-wrap gap-2">
                  {BLOOD_TYPE_OPTIONS.map((type) => (
                    <Pressable
                      key={type}
                      className={`px-3 py-2 rounded-lg border active:opacity-70 ${
                        patientForm.bloodType === type
                          ? 'bg-teal-600 border-teal-600'
                          : 'bg-amber-50 border-amber-200'
                      }`}
                      onPress={() => setPatientForm({ ...patientForm, bloodType: type })}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          patientForm.bloodType === type ? 'text-white' : 'text-amber-700'
                        }`}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Diagnosis / Cancer Type</Text>
              <TextInput
                className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950"
                placeholder="e.g., Non-Hodgkin Lymphoma"
                value={patientForm.diagnosis}
                onChangeText={(t) => setPatientForm({ ...patientForm, diagnosis: t })}
                placeholderTextColor="#d6d3d1"
              />
            </View>

            <View className="mb-5">
              <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Allergies</Text>
              <TextInput
                className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950 min-h-20"
                placeholder="List any allergies (drug, food, etc.)"
                value={patientForm.allergies}
                onChangeText={(t) => setPatientForm({ ...patientForm, allergies: t })}
                placeholderTextColor="#d6d3d1"
                multiline
                numberOfLines={2}
              />
            </View>

            <View className="mt-2 mb-4 pb-2 border-b border-amber-200">
              <Text className="text-sm font-bold text-teal-600">Insurance</Text>
            </View>

            <View className="mb-5">
              <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Insurance Provider</Text>
              <TextInput
                className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950"
                placeholder="e.g., Star Health"
                value={patientForm.insuranceProvider}
                onChangeText={(t) => setPatientForm({ ...patientForm, insuranceProvider: t })}
                placeholderTextColor="#d6d3d1"
              />
            </View>

            <View className="mb-5">
              <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Policy Number</Text>
              <TextInput
                className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950"
                placeholder="Policy number"
                value={patientForm.insurancePolicyNumber}
                onChangeText={(t) => setPatientForm({ ...patientForm, insurancePolicyNumber: t })}
                placeholderTextColor="#d6d3d1"
              />
            </View>

            <View className="mt-2 mb-4 pb-2 border-b border-amber-200">
              <Text className="text-sm font-bold text-teal-600">Emergency Contact</Text>
            </View>

            <View className="flex-row">
              <View className="flex-1 mr-3 mb-5">
                <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Name</Text>
                <TextInput
                  className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950"
                  placeholder="Contact name"
                  value={patientForm.emergencyContactName}
                  onChangeText={(t) => setPatientForm({ ...patientForm, emergencyContactName: t })}
                  placeholderTextColor="#d6d3d1"
                />
              </View>
              <View className="flex-1 mb-5">
                <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Phone</Text>
                <TextInput
                  className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950"
                  placeholder="Phone number"
                  value={patientForm.emergencyContactPhone}
                  onChangeText={(t) => setPatientForm({ ...patientForm, emergencyContactPhone: t })}
                  placeholderTextColor="#d6d3d1"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Additional Notes</Text>
              <TextInput
                className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950 min-h-24"
                placeholder="Any other important information"
                value={patientForm.notes}
                onChangeText={(t) => setPatientForm({ ...patientForm, notes: t })}
                placeholderTextColor="#d6d3d1"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View className="p-6 border-t border-amber-200">
            <Pressable
              className="bg-teal-600 h-14 rounded-xl justify-center items-center flex-row gap-2 active:opacity-80"
              onPress={handleSavePatient}
              disabled={updatePatientMutation.isPending}
            >
              {updatePatientMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text className="text-white text-base font-bold">Save Patient Info</Text>
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
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center px-6 py-5 border-b border-amber-200">
            <Text className="text-xl font-extrabold text-amber-950">
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </Text>
            <Pressable onPress={closeContactModal} className="p-1 active:opacity-70">
              <Ionicons name="close" size={24} color="#451a03" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-6 py-5">
            <View className="mb-5">
              <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Category *</Text>
              <View className="flex-row flex-wrap gap-2.5">
                {CONTACT_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    className={`flex-row items-center px-3.5 py-2.5 rounded-xl border gap-1.5 active:opacity-70 ${
                      contactForm.category === cat
                        ? 'bg-teal-100 border-teal-600'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                    onPress={() => setContactForm({ ...contactForm, category: cat })}
                  >
                    <Text className="text-base">{CATEGORY_ICONS[cat]}</Text>
                    <Text
                      className={`text-sm font-semibold ${
                        contactForm.category === cat ? 'text-teal-600' : 'text-amber-700'
                      }`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Name *</Text>
              <TextInput
                className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950"
                placeholder="Contact name"
                value={contactForm.name}
                onChangeText={(t) => setContactForm({ ...contactForm, name: t })}
                placeholderTextColor="#d6d3d1"
              />
            </View>

            <View className="mb-5">
              <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Role / Title</Text>
              <TextInput
                className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950"
                placeholder="e.g., Oncologist, Nurse Coordinator"
                value={contactForm.role}
                onChangeText={(t) => setContactForm({ ...contactForm, role: t })}
                placeholderTextColor="#d6d3d1"
              />
            </View>

            <View className="flex-row">
              <View className="flex-1 mr-3 mb-5">
                <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Phone</Text>
                <TextInput
                  className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950"
                  placeholder="Phone number"
                  value={contactForm.phone}
                  onChangeText={(t) => setContactForm({ ...contactForm, phone: t })}
                  placeholderTextColor="#d6d3d1"
                  keyboardType="phone-pad"
                />
              </View>
              <View className="flex-1 mb-5">
                <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Email</Text>
                <TextInput
                  className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950"
                  placeholder="Email address"
                  value={contactForm.email}
                  onChangeText={(t) => setContactForm({ ...contactForm, email: t })}
                  placeholderTextColor="#d6d3d1"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-xs font-bold text-amber-950 mb-2.5 uppercase tracking-wider">Notes</Text>
              <TextInput
                className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-base text-amber-950 min-h-20"
                placeholder="Additional notes about this contact"
                value={contactForm.notes}
                onChangeText={(t) => setContactForm({ ...contactForm, notes: t })}
                placeholderTextColor="#d6d3d1"
                multiline
                numberOfLines={2}
              />
            </View>
          </ScrollView>

          <View className="p-6 border-t border-amber-200">
            <Pressable
              className="bg-teal-600 h-14 rounded-xl justify-center items-center flex-row gap-2 active:opacity-80"
              onPress={handleSaveContact}
              disabled={createContactMutation.isPending || updateContactMutation.isPending}
            >
              {createContactMutation.isPending || updateContactMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text className="text-white text-base font-bold">
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
    <View>
      {/* Edit Button */}
      <Pressable className="mb-5 rounded-2xl overflow-hidden active:opacity-90" onPress={onEdit}>
        <LinearGradient
          colors={['#0d9488', '#0f766e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 }}
        >
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          <Text className="text-base font-bold text-white">
            {hasData ? 'Edit Patient Info' : 'Add Patient Info'}
          </Text>
        </LinearGradient>
      </Pressable>

      {!hasData ? (
        <View className="items-center pt-10">
          <View className="w-24 h-24 rounded-full bg-teal-100 justify-center items-center mb-5">
            <Ionicons name="person-outline" size={48} color="#0d9488" />
          </View>
          <Text className="text-xl font-bold text-amber-950 mb-2">No Patient Info Yet</Text>
          <Text className="text-base text-amber-800 text-center max-w-xs leading-relaxed">
            Add patient details for quick access during hospital visits
          </Text>
        </View>
      ) : (
        <>
          {/* Basic Info Card */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-amber-200">
            <View className="flex-row items-center mb-4 gap-2.5">
              <Ionicons name="person" size={20} color="#0d9488" />
              <Text className="text-base font-bold text-amber-950 flex-1">Basic Information</Text>
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
            <View className="bg-white rounded-2xl p-4 mb-4 border border-amber-200">
              <View className="flex-row items-center mb-4 gap-2.5">
                <Ionicons name="shield-checkmark" size={20} color="#0d9488" />
                <Text className="text-base font-bold text-amber-950 flex-1">Insurance</Text>
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
            <View className="bg-white rounded-2xl p-4 mb-4 border border-amber-200">
              <View className="flex-row items-center mb-4 gap-2.5">
                <Ionicons name="call" size={20} color="#dc2626" />
                <Text className="text-base font-bold text-amber-950 flex-1">Emergency Contact</Text>
              </View>
              {patientInfo?.emergencyContactName && (
                <InfoRow label="Name" value={patientInfo.emergencyContactName} />
              )}
              {patientInfo?.emergencyContactPhone && (
                <Pressable
                  onPress={() => Linking.openURL(`tel:${patientInfo.emergencyContactPhone}`)}
                  className="active:opacity-70"
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
          {medications.length > 0 && (() => {
            // Group medications by groupId or by name for single entries
            const slotLabels: Record<number, string> = { 1: 'Before Breakfast', 2: 'After Breakfast', 3: 'Before Lunch', 4: 'After Lunch', 5: 'Before Dinner', 6: 'After Dinner', 7: 'Bedtime' };

            type MedEntry = { timeSlotId: number | null; dosage: string | null; time: string | null };
            type GroupedMed = { name: string; purpose: string | null; entries: MedEntry[] };

            const grouped = medications.reduce((acc, med) => {
              // Use groupId if available, otherwise create a unique key from name+id
              const key = med.groupId || `solo_${med.id}`;
              if (!acc[key]) {
                acc[key] = {
                  name: med.name,
                  purpose: med.purpose,
                  entries: [],
                };
              }
              acc[key].entries.push({
                timeSlotId: med.timeSlotId,
                dosage: med.dosage,
                time: med.time,
              });
              return acc;
            }, {} as Record<string, GroupedMed>);

            const groupedMeds: GroupedMed[] = Object.values(grouped);
            // Sort entries within each group by timeSlotId
            groupedMeds.forEach((g: GroupedMed) => g.entries.sort((a: MedEntry, b: MedEntry) => (a.timeSlotId || 99) - (b.timeSlotId || 99)));

            return (
            <View className="bg-white rounded-2xl p-4 mb-4 border border-amber-200">
          <View className="flex-row items-center mb-4 gap-2.5">
            <Ionicons name="medical" size={20} color="#0d9488" />
            <Text className="text-base font-bold text-amber-950 flex-1">Current Medications</Text>
            <View className="bg-teal-100 px-2.5 py-1 rounded-xl">
              <Text className="text-xs font-bold text-teal-600">{groupedMeds.length}</Text>
            </View>
          </View>
          {groupedMeds.map((group, idx) => (
            <View key={idx} className="py-2.5 border-b border-amber-200 last:border-b-0">
              <Text className="text-base font-semibold text-amber-950 mb-1.5">{group.name}</Text>
              {group.purpose && (
                <Text className="text-xs text-stone-400 mb-2 italic">{group.purpose}</Text>
              )}
              <View className="flex-row flex-wrap gap-1.5">
                {group.entries.map((entry, entryIdx) => {
                  const label = entry.timeSlotId && slotLabels[entry.timeSlotId] ? slotLabels[entry.timeSlotId] : (entry.time || 'As needed');
                  return (
                    <View key={entryIdx} className="bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg flex-row items-center gap-1">
                      <Text className="text-xs font-medium text-teal-700">{label}</Text>
                      {entry.dosage && (
                        <Text className="text-xs font-bold text-teal-900">{entry.dosage}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
            );
          })()}

    </View>
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
    <View className="flex-row justify-between items-start py-2.5 border-b border-amber-200 last:border-b-0">
      <Text className="text-sm text-stone-400 font-medium">{label}</Text>
      <Text
        className={`text-sm font-semibold text-right flex-1 ml-4 ${
          highlight
            ? 'text-teal-600 font-bold'
            : warning
            ? 'text-red-600'
            : isLink
            ? 'text-teal-600 underline'
            : 'text-amber-950'
        }`}
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
    <View>
      {/* Add Button */}
      <Pressable className="mb-5 rounded-2xl overflow-hidden active:opacity-90" onPress={onAddContact}>
        <LinearGradient
          colors={['#0d9488', '#0f766e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 }}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text className="text-base font-bold text-white">Add Contact</Text>
        </LinearGradient>
      </Pressable>

      {totalContacts === 0 ? (
        <View className="items-center pt-10">
          <View className="w-24 h-24 rounded-full bg-teal-100 justify-center items-center mb-5">
            <Ionicons name="people-outline" size={48} color="#0d9488" />
          </View>
          <Text className="text-xl font-bold text-amber-950 mb-2">No Contacts Yet</Text>
          <Text className="text-base text-amber-800 text-center max-w-xs leading-relaxed">
            Save important phone numbers for doctors, hospitals, hotels, and more
          </Text>
        </View>
      ) : (
        CONTACT_CATEGORIES.map((category) => {
          const categoryContacts = contactsByCategory[category];
          if (categoryContacts.length === 0) return null;

          return (
            <View key={category} className="mb-6">
              <View className="flex-row items-center mb-3 gap-2">
                <Text className="text-xl">{CATEGORY_ICONS[category]}</Text>
                <Text className="text-base font-bold text-amber-950 flex-1">{CATEGORY_LABELS[category]}</Text>
                <View className="bg-teal-100 px-2.5 py-1 rounded-xl">
                  <Text className="text-xs font-bold text-teal-600">{categoryContacts.length}</Text>
                </View>
              </View>

              {categoryContacts.map((contact) => (
                <Pressable
                  key={contact.id}
                  className="flex-row items-center bg-white rounded-xl p-3.5 mb-2.5 border border-amber-200 active:opacity-80"
                  onPress={() => onEditContact(contact)}
                >
                  <View className="flex-1">
                    <Text className="text-base font-bold text-amber-950 mb-0.5">{contact.name}</Text>
                    {contact.role && <Text className="text-sm text-amber-700 mb-1.5">{contact.role}</Text>}
                    {contact.phone && (
                      <View className="flex-row items-center gap-1.5 mt-1">
                        <Ionicons name="call-outline" size={14} color="#d6d3d1" />
                        <Text className="text-sm text-stone-400">{contact.phone}</Text>
                      </View>
                    )}
                    {contact.email && (
                      <View className="flex-row items-center gap-1.5 mt-1">
                        <Ionicons name="mail-outline" size={14} color="#d6d3d1" />
                        <Text className="text-sm text-stone-400">{contact.email}</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row gap-2">
                    {contact.phone && (
                      <Pressable
                        className="w-10 h-10 rounded-full bg-green-100 justify-center items-center active:opacity-70"
                        onPress={(e) => {
                          e.stopPropagation();
                          onCallContact(contact.phone!);
                        }}
                      >
                        <Ionicons name="call" size={18} color="#16a34a" />
                      </Pressable>
                    )}
                    <Pressable
                      className="w-10 h-10 rounded-full bg-red-100 justify-center items-center active:opacity-70"
                      onPress={(e) => {
                        e.stopPropagation();
                        onDeleteContact(contact);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#dc2626" />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          );
        })
      )}
    </View>
  );
}
