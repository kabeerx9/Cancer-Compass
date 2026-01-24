import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  getAll = async (req: Request, res: Response) => {
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      res.status(400).json({ success: false, message: 'Date query param required (YYYY-MM-DD)' });
      return;
    }

    // @ts-ignore - req.userId comes from auth middleware
    const result = await this.taskService.getTasksForDate(req.userId, date);
    res.status(result.success ? 200 : 400).json(result);
  };

  create = async (req: Request, res: Response) => {
    // @ts-ignore
    const result = await this.taskService.createTask(req.body, req.userId);
    res.status(result.success ? 201 : 400).json(result);
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    // @ts-ignore
    const result = await this.taskService.updateTask(id, req.body, req.userId);
    res.status(result.success ? 200 : 400).json(result);
  };

  toggleComplete = async (req: Request, res: Response) => {
    const { id } = req.params;
    // @ts-ignore
    const result = await this.taskService.toggleTaskCompletion(id, req.userId);
    res.status(result.success ? 200 : 400).json(result);
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    // @ts-ignore
    const result = await this.taskService.deleteTask(id, req.userId);
    res.status(result.success ? 200 : 400).json(result);
  };
}
