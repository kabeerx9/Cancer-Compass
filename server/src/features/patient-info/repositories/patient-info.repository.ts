import { PrismaClient } from '@prisma/client';

export interface UpsertPatientInfoInput {
  userId: string;
  name?: string;
  dateOfBirth?: Date;
  bloodType?: string;
  allergies?: string;
  diagnosis?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

export interface CreateContactInput {
  userId: string;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  category: 'medical_team' | 'hospital' | 'logistics' | 'personal';
  notes?: string;
}

export interface UpdateContactInput {
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  category?: 'medical_team' | 'hospital' | 'logistics' | 'personal';
  notes?: string;
}

export class PatientInfoRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  // ============================================
  // PATIENT INFO
  // ============================================

  async findPatientInfoByUserId(userId: string) {
    return this.prisma.patientInfo.findUnique({
      where: { userId },
    });
  }

  async upsertPatientInfo(data: UpsertPatientInfoInput) {
    return this.prisma.patientInfo.upsert({
      where: { userId: data.userId },
      update: {
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        bloodType: data.bloodType,
        allergies: data.allergies,
        diagnosis: data.diagnosis,
        insuranceProvider: data.insuranceProvider,
        insurancePolicyNumber: data.insurancePolicyNumber,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        notes: data.notes,
      },
      create: {
        userId: data.userId,
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        bloodType: data.bloodType,
        allergies: data.allergies,
        diagnosis: data.diagnosis,
        insuranceProvider: data.insuranceProvider,
        insurancePolicyNumber: data.insurancePolicyNumber,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        notes: data.notes,
      },
    });
  }

  // ============================================
  // CONTACTS
  // ============================================

  async findAllContactsByUserId(userId: string) {
    return this.prisma.contact.findMany({
      where: { userId },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findContactsByCategory(userId: string, category: string) {
    return this.prisma.contact.findMany({
      where: { userId, category },
      orderBy: { name: 'asc' },
    });
  }

  async findContactById(id: string) {
    return this.prisma.contact.findUnique({
      where: { id },
    });
  }

  async findContactByIdAndUserId(id: string, userId: string) {
    return this.prisma.contact.findFirst({
      where: { id, userId },
    });
  }

  async createContact(data: CreateContactInput) {
    return this.prisma.contact.create({
      data: {
        userId: data.userId,
        name: data.name,
        role: data.role,
        phone: data.phone,
        email: data.email,
        category: data.category,
        notes: data.notes,
      },
    });
  }

  async updateContact(id: string, data: UpdateContactInput) {
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }

  async deleteContact(id: string) {
    return this.prisma.contact.delete({
      where: { id },
    });
  }
}
