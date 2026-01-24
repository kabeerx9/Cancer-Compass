import { Prisma, PrismaClient } from '@prisma/client';

export interface CreateTemplateInput {
  userId: string;
  name: string;
  color?: string;
  tasks: {
    title: string;
    description?: string;
    order: number;
  }[];
}

export interface UpdateTemplateInput {
  name?: string;
  color?: string;
  tasks?: {
    id?: string; // If present, update. If missing, create.
    title: string;
    description?: string;
    order: number;
  }[];
}

export class TemplateRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async findAll(userId: string) {
    return this.prisma.dayTemplate.findMany({
      where: { userId },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.dayTemplate.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async create(data: CreateTemplateInput) {
    return this.prisma.dayTemplate.create({
      data: {
        userId: data.userId,
        name: data.name,
        color: data.color,
        tasks: {
          create: data.tasks.map(task => ({
            title: task.title,
            description: task.description,
            order: task.order,
          })),
        },
      },
      include: {
        tasks: true,
      },
    });
  }

  async update(id: string, data: UpdateTemplateInput) {
    // If tasks are provided, we need to handle updates/creates/deletes smarty
    // For simplicity in MVP: We might just delete all and recreate, OR handle granularly
    // Let's implement a smarter update where we transactionally update the template fields
    // Updating nested tasks is complex in one go.
    // Recommended strategy for MVP "Editing Template":
    // 1. Updating name/color is easy.
    // 2. Editing tasks usually happens via separate endpoints OR we replace the whole list.

    // Let's assume the client sends the FULL list of desired state tasks.
    // Existing tasks have ID, new ones don't.
    // Tasks not in the list should be deleted?
    // Let's stick to simple update of template fields for now, and handle tasks separately?
    // User requested "Day Templates" feature which implies managing tasks.

    // Better approach for full sync:
    // Update basic fields
    // For tasks: if IDs are provided, better to handle in Service with transaction
    // But here we can use a transaction.

    // Let's keep this method simple for now: valid fields on the template itself.
    // We will separate Task Management inside Template if needed, or allow full replace.
    // Full replace is easiest for "Edit Template" screen.

    return this.prisma.dayTemplate.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
      },
      include: { tasks: true },
    });
  }

  // Helper to replace all tasks for a template (useful for complete re-ordering/editing)
  async replaceTasks(
    templateId: string,
    tasks: { title: string; description?: string; order: number }[],
  ) {
    return this.prisma.$transaction(async tx => {
      // Delete all existing tasks
      await tx.templateTask.deleteMany({
        where: { templateId },
      });

      // Create new ones
      return tx.dayTemplate.update({
        where: { id: templateId },
        data: {
          tasks: {
            create: tasks,
          },
        },
        include: { tasks: true },
      });
    });
  }

  async delete(id: string) {
    return this.prisma.dayTemplate.delete({
      where: { id },
    });
  }

  async assignToDate(
    templateId: string,
    date: Date,
    userId: string,
    tasks: { id: string; title: string; description?: string | null; order: number }[],
  ) {
    return this.prisma.$transaction(async tx => {
      // Check if already assigned
      const existing = await tx.assignedDay.findUnique({
        where: {
          userId_date_templateId: { userId, date, templateId },
        },
      });

      if (existing) {
        // If already assigned, maybe we shouldn't throw error but just return it?
        // Or throw to let user know.
        throw new Error('This template is already assigned to this date');
      }

      // Create assignment record
      const assigned = await tx.assignedDay.create({
        data: {
          userId,
          date,
          templateId,
        },
      });

      // Copy tasks
      if (tasks.length > 0) {
        await tx.dailyTask.createMany({
          data: tasks.map(t => ({
            userId,
            date,
            title: t.title,
            description: t.description || null,
            order: t.order,
            sourceType: 'template',
            templateId,
            templateTaskId: t.id,
            isCompleted: false,
          })),
        });
      }

      return assigned;
    });
  }

  async unassignFromDate(templateId: string, date: Date, userId: string) {
    return this.prisma.$transaction(async tx => {
      // 1. Delete associated tasks
      await tx.dailyTask.deleteMany({
        where: {
          userId,
          date,
          templateId,
        },
      });

      // 2. Delete assignment record
      return tx.assignedDay.delete({
        where: {
          userId_date_templateId: {
            userId,
            date,
            templateId,
          },
        },
      });
    });
  }

  async getAssignedDaysForRange(userId: string, startDate: Date, endDate: Date) {
    return this.prisma.assignedDay.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        template: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}
