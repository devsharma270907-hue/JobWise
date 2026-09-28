import { Request, Response, NextFunction } from 'express';
import { applicationService } from './application.service.js';
import { AppError } from '../../utils/ownershipCheck.js';
import { ApplicationStatus } from './application.model.js';

export class ApplicationController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const application = await applicationService.createApplication(req.user._id, req.body);

      res.status(201).json({
        success: true,
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const status = req.query.status as ApplicationStatus | undefined;
      const result = await applicationService.listApplications(req.user._id, status);

      res.status(200).json({
        success: true,
        data: result.data,
        metadata: {
          countsByStatus: result.countsByStatus,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const application = await applicationService.getApplicationById(
        req.user._id,
        req.params.id as string
      );

      res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const { status, note } = req.body;
      const updated = await applicationService.updateStatus(
        req.user._id,
        req.params.id as string,
        status,
        note
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async addNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const updated = await applicationService.addNote(
        req.user._id,
        req.params.id as string,
        req.body.content
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      await applicationService.deleteApplication(req.user._id, req.params.id as string);

      res.status(200).json({
        success: true,
        data: {
          message: 'Application tracker record deleted successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const applicationController = new ApplicationController();
