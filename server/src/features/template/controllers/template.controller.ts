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

  assign = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { date } = req.body; // YYYY-MM-DD

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!date) {
      res.status(400).json({ success: false, message: 'Date is required' });
      return;
    }

    const result = await this.templateService.assignTemplateToDate(id as string, date, req.user.id);
    res.status(result.success ? 200 : 400).json(result);
  };

  unassign = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { date } = req.body; // YYYY-MM-DD

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!date) {
      res.status(400).json({ success: false, message: 'Date is required' });
      return;
    }

    const result = await this.templateService.unassignTemplateFromDate(
      id as string,
      date,
      req.user.id,
    );
    res.status(result.success ? 200 : 400).json(result);
  };

  getAssignedDays = async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query; // YYYY-MM-DD

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!startDate || !endDate) {
      res.status(400).json({ success: false, message: 'Start date and end date are required' });
      return;
    }

    const result = await this.templateService.getAssignedDaysForRange(
      req.user.id,
      new Date(startDate as string),
      new Date(endDate as string),
    );
    res.status(result.success ? 200 : 400).json(result);
  };
}
