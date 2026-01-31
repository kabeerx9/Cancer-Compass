import { PrismaClient } from '@prisma/client';

export interface CreateSymptomLogInput {
  userId: string;
  date: Date;
  content: string;
}

export interface UpdateSymptomLogInput {
  content?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export class SymptomRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async findAllByUserId(userId: string) {
    return this.prisma.symptomLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async findByDate(userId: string, date: Date) {
    return this.prisma.symptomLog.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });
  }

  async findByDateRange(userId: string, dateRange: DateRange) {
    return this.prisma.symptomLog.findMany({
      where: {
        userId,
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.symptomLog.findUnique({
      where: { id },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return this.prisma.symptomLog.findFirst({
      where: { id, userId },
    });
  }

  async create(data: CreateSymptomLogInput) {
    return this.prisma.symptomLog.upsert({
      where: {
        userId_date: {
          userId: data.userId,
          date: data.date,
        },
      },
      update: {
        content: data.content,
      },
      create: {
        userId: data.userId,
        date: data.date,
        content: data.content,
      },
    });
  }

  async update(id: string, data: UpdateSymptomLogInput) {
    return this.prisma.symptomLog.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.symptomLog.delete({
      where: { id },
    });
  }

  async hasLogForToday(userId: string, date: Date) {
    const log = await this.prisma.symptomLog.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });
    return !!log;
  }
}
