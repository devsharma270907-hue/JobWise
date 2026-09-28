import { Request, Response, NextFunction } from 'express';
import { resumeService } from './resume.service.js';
import { AppError } from '../../utils/ownershipCheck.js';

export class ResumeController {
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      if (!req.file) throw new AppError('Resume file is required', 400, 'VALIDATION_ERROR');

      const { resume, modelVersion, generatedAt } = await resumeService.uploadAndParse(
        req.user._id,
        req.file
      );

      res.status(201).json({
        success: true,
        data: {
          resume,
          modelVersion,
          generatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await resumeService.listUserResumes(req.user._id, page, limit);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const resume = await resumeService.getResumeById(req.user._id, req.params.id as string);

      res.status(200).json({
        success: true,
        data: resume,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      await resumeService.deleteResume(req.user._id, req.params.id as string);

      res.status(200).json({
        success: true,
        data: {
          message: 'Resume deleted successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const resumeController = new ResumeController();
