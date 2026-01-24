import { Request, Response } from 'express';
import { TemplateService } from '../services/template.service';

export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  getAll = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const result = await this.templateService.getAllTemplates(req.user.id);
    res.status(result.success ? 200 : 400).json(result);
  };

  create = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const result = await this.templateService.createTemplate(req.body, req.user.id);
    res.status(result.success ? 201 : 400).json(result);
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const result = await this.templateService.updateTemplate(id as string, req.body, req.user.id);
    res.status(result.success ? 200 : 400).json(result);
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const result = await this.templateService.deleteTemplate(id as string, req.user.id);
    res.status(result.success ? 200 : 400).json(result);
  };
}
