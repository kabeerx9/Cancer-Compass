import { PrismaClient } from '@prisma/client';

export interface CreateTaskInput {
  userId: string;
  date: Date;
  title: string;
  description?: string;
  sourceType?: 'custom' | 'template';
  templateId?: string;
  templateTaskId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  order?: number;
}

export class TaskRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async create(data: CreateTaskInput) {
    return this.prisma.dailyTask.create({
      data: {
        userId: data.userId,
        date: data.date,
        title: data.title,
        description: data.description,
        sourceType: data.sourceType || 'custom',
        templateId: data.templateId,
        templateTaskId: data.templateTaskId,
      },
    });
  }

  async findAllByDate(userId: string, date: Date) {
    // date object usually comes in with time, we need to ensure we query for the whole day
    // or exact match if date is stripped of time in DB.
    // Prisma Date type maps to DB Date type. If DB is DATE type (which I set as @db.Date),
    // passing a JS Date object usually matches the date part.
    // Let's rely on exact match assuming the service passes a normalized Date object (midnight).

    return this.prisma.dailyTask.findMany({
      where: {
        userId,
        date: date,
      },
      orderBy: [
        { sourceType: 'desc' }, // 'template' comes before 'custom' alphabetically? No, 'template' > 'custom'. Wait.
        // Actually, let's just sort by order for now, or created at.
        // Logic: Templates might have order. Custom tasks created later.
        { isCompleted: 'asc' }, // Incomplete first
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        template: true, // Include template info if needed (e.g. color)
      },
    });
  }

  async findById(id: string) {
    return this.prisma.dailyTask.findUnique({
      where: { id },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return this.prisma.dailyTask.findFirst({
      where: { id, userId },
    });
  }

  async update(id: string, data: UpdateTaskInput) {
    return this.prisma.dailyTask.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.dailyTask.delete({
      where: { id },
    });
  }
}
