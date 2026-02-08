import { unifiedResponse } from 'uni-response';

import {
  CreateContactInput,
  PatientInfoRepository,
  UpdateContactInput,
  UpsertPatientInfoInput,
} from '../repositories/patient-info.repository';

interface MedicationForExport {
  name: string;
  dosage?: string | null;
  time?: string | null;
  timeSlotId?: number | null;
}

// Time slot label helper
const TIME_SLOTS: Record<number, string> = {
  1: 'Before Breakfast',
  2: 'After Breakfast',
  3: 'Before Lunch',
  4: 'After Lunch',
  5: 'Before Dinner',
  6: 'After Dinner',
  7: 'Bedtime',
};
const getTimeSlotLabel = (id: number | null | undefined): string | null => {
  if (!id || !(id in TIME_SLOTS)) return null;
  return TIME_SLOTS[id];
};

export class PatientInfoService {
  constructor(private readonly patientInfoRepository: PatientInfoRepository) {}

  // ============================================
  // PATIENT INFO
  // ============================================

  async getPatientInfo(userId: string) {
    const patientInfo = await this.patientInfoRepository.findPatientInfoByUserId(userId);
    return unifiedResponse(true, 'Patient info retrieved', patientInfo);
  }

  async updatePatientInfo(data: Omit<UpsertPatientInfoInput, 'userId'>, userId: string) {
    const patientInfo = await this.patientInfoRepository.upsertPatientInfo({
      ...data,
      userId,
    });
    return unifiedResponse(true, 'Patient info updated', patientInfo);
  }

  // ============================================
  // CONTACTS
  // ============================================

  async getAllContacts(userId: string) {
    const contacts = await this.patientInfoRepository.findAllContactsByUserId(userId);
    return unifiedResponse(true, 'Contacts retrieved', contacts);
  }

  async getContactsByCategory(userId: string, category: string) {
    const contacts = await this.patientInfoRepository.findContactsByCategory(userId, category);
    return unifiedResponse(true, 'Contacts retrieved', contacts);
  }

  async getContactById(id: string, userId: string) {
    const contact = await this.patientInfoRepository.findContactByIdAndUserId(id, userId);

    if (!contact) {
      return unifiedResponse(false, 'Contact not found');
    }

    return unifiedResponse(true, 'Contact retrieved', contact);
  }

  async createContact(data: Omit<CreateContactInput, 'userId'>, userId: string) {
    const contact = await this.patientInfoRepository.createContact({
      ...data,
      userId,
    });
    return unifiedResponse(true, 'Contact created', contact);
  }

  async updateContact(id: string, data: UpdateContactInput, userId: string) {
    // Verify ownership
    const existing = await this.patientInfoRepository.findContactByIdAndUserId(id, userId);
    if (!existing) {
      return unifiedResponse(false, 'Contact not found');
    }

    const contact = await this.patientInfoRepository.updateContact(id, data);
    return unifiedResponse(true, 'Contact updated', contact);
  }

  async deleteContact(id: string, userId: string) {
    // Verify ownership
    const existing = await this.patientInfoRepository.findContactByIdAndUserId(id, userId);
    if (!existing) {
      return unifiedResponse(false, 'Contact not found');
    }

    await this.patientInfoRepository.deleteContact(id);
    return unifiedResponse(true, 'Contact deleted');
  }

  // ============================================
  // SHARE AS TEXT
  // ============================================

  async generateShareableText(userId: string, medications: MedicationForExport[]) {
    const patientInfo = await this.patientInfoRepository.findPatientInfoByUserId(userId);
    const contacts = await this.patientInfoRepository.findAllContactsByUserId(userId);

    let text = '═══════════════════════════\n';
    text += '     PATIENT INFORMATION\n';
    text += '═══════════════════════════\n\n';

    // Patient Info Section
    if (patientInfo) {
      if (patientInfo.name) text += `👤 Name: ${patientInfo.name}\n`;
      if (patientInfo.dateOfBirth) {
        const dob = new Date(patientInfo.dateOfBirth);
        text += `📅 Date of Birth: ${dob.toLocaleDateString()}\n`;
      }
      if (patientInfo.bloodType) text += `🩸 Blood Type: ${patientInfo.bloodType}\n`;
      if (patientInfo.diagnosis) text += `🏥 Diagnosis: ${patientInfo.diagnosis}\n`;
      if (patientInfo.allergies) text += `⚠️ Allergies: ${patientInfo.allergies}\n`;
      text += '\n';

      // Insurance
      if (patientInfo.insuranceProvider || patientInfo.insurancePolicyNumber) {
        text += '── Insurance ──\n';
        if (patientInfo.insuranceProvider) text += `Provider: ${patientInfo.insuranceProvider}\n`;
        if (patientInfo.insurancePolicyNumber)
          text += `Policy #: ${patientInfo.insurancePolicyNumber}\n`;
        text += '\n';
      }

      // Emergency Contact
      if (patientInfo.emergencyContactName || patientInfo.emergencyContactPhone) {
        text += '── Emergency Contact ──\n';
        if (patientInfo.emergencyContactName) text += `Name: ${patientInfo.emergencyContactName}\n`;
        if (patientInfo.emergencyContactPhone)
          text += `Phone: ${patientInfo.emergencyContactPhone}\n`;
        text += '\n';
      }
    }

    // Current Medications (grouped by name)
    if (medications && medications.length > 0) {
      text += '── Current Medications ──\n';

      // Group by name
      interface MedGroup {
        name: string;
        entries: Array<{ dosage?: string | null; timeSlotId?: number | null; time?: string | null }>
      }
      const groups: Record<string, MedGroup> = {};

      medications.forEach(med => {
        if (!groups[med.name]) {
          groups[med.name] = { name: med.name, entries: [] };
        }
        groups[med.name].entries.push({
          dosage: med.dosage,
          timeSlotId: med.timeSlotId,
          time: med.time,
        });
      });

      Object.values(groups).forEach(group => {
        text += `• ${group.name}\n`;
        // Sort entries by timeSlotId
        group.entries.sort((a, b) => (a.timeSlotId || 99) - (b.timeSlotId || 99));
        group.entries.forEach(entry => {
          const timeLabel = getTimeSlotLabel(entry.timeSlotId) || entry.time || '';
          const dosageStr = entry.dosage ? ` - ${entry.dosage}` : '';
          if (timeLabel) {
            text += `    ${timeLabel}${dosageStr}\n`;
          } else if (dosageStr) {
            text += `    ${dosageStr.substring(3)}\n`; // Remove " - " prefix
          }
        });
      });
      text += '\n';
    }

    // Contacts by Category
    const categories = ['medical_team', 'hospital', 'logistics', 'personal'];
    const categoryLabels: Record<string, string> = {
      medical_team: '👨‍⚕️ Medical Team',
      hospital: '🏥 Hospital',
      logistics: '🚗 Logistics',
      personal: '👥 Personal',
    };

    for (const category of categories) {
      const categoryContacts = contacts.filter(c => c.category === category);
      if (categoryContacts.length > 0) {
        text += `── ${categoryLabels[category]} ──\n`;
        categoryContacts.forEach(contact => {
          text += `• ${contact.name}`;
          if (contact.role) text += ` (${contact.role})`;
          text += '\n';
          if (contact.phone) text += `  📞 ${contact.phone}\n`;
          if (contact.email) text += `  ✉️ ${contact.email}\n`;
        });
        text += '\n';
      }
    }

    text += '═══════════════════════════\n';
    text += '  Generated by Cancer Compass\n';

    return unifiedResponse(true, 'Shareable text generated', { text });
  }
}
