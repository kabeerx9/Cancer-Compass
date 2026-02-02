import { PrismaClient } from '@prisma/client';

export interface CreateSosMedicineInput {
  userId: string;
  name: string;
  purpose?: string;
  dosage?: string;
  instructions?: string;
}

export interface UpdateSosMedicineInput {
  name?: string;
  purpose?: string;
  dosage?: string;
  instructions?: string;
  isActive?: boolean;
}

export interface LogSosMedicineInput {
  sosMedicineId: string;
  takenAt: Date;
  notes?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export class SosMedicineRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async findAllByUserId(userId: string) {
    return this.prisma.sosMedicine.findMany({
      where: { userId },
      orderBy: [{ name: 'asc' }],
    });
  }

  async findActiveByUserId(userId: string) {
    return this.prisma.sosMedicine.findMany({
      where: { userId, isActive: true },
      orderBy: [{ name: 'asc' }],
    });
  }

  async findById(id: string) {
    return this.prisma.sosMedicine.findUnique({
      where: { id },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return this.prisma.sosMedicine.findFirst({
      where: { id, userId },
    });
  }

  async create(data: CreateSosMedicineInput) {
    return this.prisma.sosMedicine.create({
      data: {
        userId: data.userId,
        name: data.name,
        purpose: data.purpose,
        dosage: data.dosage,
        instructions: data.instructions,
      },
    });
  }

  async update(id: string, data: UpdateSosMedicineInput) {
    return this.prisma.sosMedicine.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.sosMedicine.delete({
      where: { id },
    });
  }

  async logSosMedicine(data: LogSosMedicineInput) {
    return this.prisma.sosMedicineLog.create({
      data: {
        sosMedicineId: data.sosMedicineId,
        takenAt: data.takenAt,
        notes: data.notes,
      },
    });
  }

  async getLogsByMedicineId(sosMedicineId: string) {
    return this.prisma.sosMedicineLog.findMany({
      where: { sosMedicineId },
      orderBy: { takenAt: 'desc' },
    });
  }

  async getAllLogsByUserId(userId: string, dateRange?: DateRange) {
    const whereClause: any = {
      sosMedicine: { userId },
    };

    if (dateRange) {
      whereClause.takenAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      };
    }

    return this.prisma.sosMedicineLog.findMany({
      where: whereClause,
      orderBy: { takenAt: 'desc' },
      include: {
        sosMedicine: true,
      },
    });
  }

  async getLogsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return this.prisma.sosMedicineLog.findMany({
      where: {
        sosMedicine: { userId },
        takenAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { takenAt: 'desc' },
      include: {
        sosMedicine: true,
      },
    });
  }

  async getStatsByUserId(userId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = {
      sosMedicine: { userId },
    };

    if (startDate && endDate) {
      whereClause.takenAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [totalLogs, uniqueMedicines, totalMedicines] = await Promise.all([
      this.prisma.sosMedicineLog.count({
        where: whereClause,
      }),
      this.prisma.sosMedicineLog.groupBy({
        by: ['sosMedicineId'],
        where: whereClause,
        _count: {
          sosMedicineId: true,
        },
      }),
      this.prisma.sosMedicine.count({
        where: { userId },
      }),
    ]);

    return {
      totalUses: totalLogs,
      uniqueMedicinesUsed: uniqueMedicines.length,
      totalMedicines,
    };
  }
}
