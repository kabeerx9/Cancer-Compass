import { PrismaClient } from '@prisma/client';

export interface CreateMedicationInput {
  userId: string;
  name: string;
  purpose?: string;
  dosage?: string;
  time?: string;
  timeSlotId?: number;
  groupId?: string;
}

export interface UpdateMedicationInput {
  name?: string;
  purpose?: string;
  dosage?: string;
  time?: string;
  timeSlotId?: number;
  isActive?: boolean;
}

export interface LogMedicationInput {
  medicationId: string;
  date: Date;
  status: 'taken' | 'skipped';
  takenAt?: Date;
}

export class MedicationRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async findAllByUserId(userId: string) {
    return this.prisma.medication.findMany({
      where: { userId },
      orderBy: [{ timeSlotId: 'asc' }, { name: 'asc' }],
      include: {
        logs: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
      },
    });
  }

  async findActiveByUserId(userId: string) {
    return this.prisma.medication.findMany({
      where: { userId, isActive: true },
      orderBy: [{ timeSlotId: 'asc' }, { name: 'asc' }],
      include: {
        logs: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.medication.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 14, // Last 14 days for history view
        },
      },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return this.prisma.medication.findFirst({
      where: { id, userId },
    });
  }

  async create(data: CreateMedicationInput) {
    return this.prisma.medication.create({
      data: {
        userId: data.userId,
        name: data.name,
        purpose: data.purpose,
        dosage: data.dosage,
        time: data.time,
        timeSlotId: data.timeSlotId,
        groupId: data.groupId,
      },
    });
  }

  async update(id: string, data: UpdateMedicationInput) {
    return this.prisma.medication.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.medication.delete({
      where: { id },
    });
  }

  async logMedication(data: LogMedicationInput) {
    return this.prisma.medicationLog.upsert({
      where: {
        medicationId_date: {
          medicationId: data.medicationId,
          date: data.date,
        },
      },
      update: {
        status: data.status,
        takenAt: data.status === 'taken' ? data.takenAt || new Date() : null,
      },
      create: {
        medicationId: data.medicationId,
        date: data.date,
        status: data.status,
        takenAt: data.status === 'taken' ? data.takenAt || new Date() : null,
      },
    });
  }

  async getTodayLogs(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.medicationLog.findMany({
      where: {
        medication: { userId },
        date: today,
      },
      include: {
        medication: true,
      },
    });
  }
}
