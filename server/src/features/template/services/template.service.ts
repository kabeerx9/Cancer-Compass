import { unifiedResponse } from 'uni-response';
import { CreateTemplateInput, TemplateRepository, UpdateTemplateInput } from '../repositories/template.repository';

export class TemplateService {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async getAllTemplates(userId: string) {
    const templates = await this.templateRepository.findAll(userId);
    return unifiedResponse(true, 'Templates retrieved', templates);
  }

  async getTemplateById(id: string, userId: string) {
    const template = await this.templateRepository.findById(id);
    if (!template || template.userId !== userId) {
      return unifiedResponse(false, 'Template not found');
    }
    return unifiedResponse(true, 'Template retrieved', template);
  }

  async createTemplate(data: Omit<CreateTemplateInput, 'userId'>, userId: string) {
    const template = await this.templateRepository.create({
      ...data,
      userId,
    });
    return unifiedResponse(true, 'Template created', template);
  }

  async updateTemplate(id: string, data: UpdateTemplateInput & { tasks?: any[] }, userId: string) {
    const existing = await this.templateRepository.findById(id);
    if (!existing || existing.userId !== userId) {
       return unifiedResponse(false, 'Template not found');
    }

    let updatedTemplate;

    // If tasks array is provided, we do a full replace of tasks (simplest for edit screen)
    if (data.tasks) {
       updatedTemplate = await this.templateRepository.replaceTasks(id, data.tasks);

       // Also update name/color if provided
       if (data.name || data.color) {
         updatedTemplate = await this.templateRepository.update(id, { name: data.name, color: data.color });
       }
    } else {
       // Just update fields
       updatedTemplate = await this.templateRepository.update(id, data);
    }

    return unifiedResponse(true, 'Template updated', updatedTemplate);
  }

  async deleteTemplate(id: string, userId: string) {
    const existing = await this.templateRepository.findById(id);
    if (!existing || existing.userId !== userId) {
       return unifiedResponse(false, 'Template not found');
    }

    await this.templateRepository.delete(id);
    return unifiedResponse(true, 'Template deleted');
  }
}
