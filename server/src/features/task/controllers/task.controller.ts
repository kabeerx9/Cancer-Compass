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

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await this.taskService.getTasksForDate(req.user.id, date);
    res.status(result.success ? 200 : 400).json(result);
  };

  create = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const result = await this.taskService.createTask(req.body, req.user.id);
    res.status(result.success ? 201 : 400).json(result);
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const result = await this.taskService.updateTask(id as string, req.body, req.user.id);
    res.status(result.success ? 200 : 400).json(result);
  };

  toggleComplete = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const result = await this.taskService.toggleTaskCompletion(id as string, req.user.id);
    res.status(result.success ? 200 : 400).json(result);
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const result = await this.taskService.deleteTask(id as string, req.user.id);
    res.status(result.success ? 200 : 400).json(result);
  };
}
