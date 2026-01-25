import { unifiedResponse } from 'uni-response';
import { TaskRepository, CreateTaskInput, UpdateTaskInput } from '../repositories/task.repository';

export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async createTask(data: Omit<CreateTaskInput, 'userId' | 'date'> & { date: string }, userId: string) {
    // Normalize date to midnight UTC or local?
    // Usually best to store simpler YYYY-MM-DD.
    // The Input comes as string, we convert to Date.
    const dateObj = new Date(data.date);
    // Warning: new Date('2026-01-24') might treat as UTC 00:00.

    // We'll trust the client sends a proper ISO string or YYYY-MM-DD.
    // Ideally we strip time part to ensure consistency.

    // For storing in a @db.Date column, the time part is ignored by Postgres,
    // but Prisma Client behavior dictates.

    const task = await this.taskRepository.create({
      ...data,
      date: dateObj,
      userId,
    });

    return unifiedResponse(true, 'Task created', task);
  }

  async getTasksForDate(userId: string, dateString: string) {
    const dateObj = new Date(dateString);
    const tasks = await this.taskRepository.findAllByDate(userId, dateObj);
    return unifiedResponse(true, 'Tasks retrieved', tasks);
  }

  async updateTask(id: string, data: UpdateTaskInput, userId: string) {
    const existing = await this.taskRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      return unifiedResponse(false, 'Task not found');
    }

    const task = await this.taskRepository.update(id, data);
    return unifiedResponse(true, 'Task updated', task);
  }

  async toggleTaskCompletion(id: string, userId: string) {
    const existing = await this.taskRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      return unifiedResponse(false, 'Task not found');
    }

    const task = await this.taskRepository.update(id, {
      isCompleted: !existing.isCompleted
    });

    return unifiedResponse(true, task.isCompleted ? 'Task completed' : 'Task uncompleted', task);
  }

  async deleteTask(id: string, userId: string) {
    const existing = await this.taskRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      return unifiedResponse(false, 'Task not found');
    }

    try {
      await this.taskRepository.delete(id);
      return unifiedResponse(true, 'Task deleted');
    } catch (error) {
      return unifiedResponse(false, error instanceof Error ? error.message : 'Failed to delete task');
    }
  }
}
