import { Request, Response, NextFunction } from 'express';
import { freelanceGigService } from './freelanceGig.service.js';
import { AppError } from '../../utils/ownershipCheck.js';
import { GigStatus } from './freelanceGig.model.js';

export class FreelanceGigController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as GigStatus | undefined;
      const userId = req.user?._id;
      const gigs = await freelanceGigService.listGigs(userId, status);

      res.status(200).json({
        success: true,
        data: gigs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gig = await freelanceGigService.getGigById(req.params.id as string);

      res.status(200).json({
        success: true,
        data: gig,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const gig = await freelanceGigService.createGig(req.user._id, req.body);

      res.status(201).json({
        success: true,
        data: gig,
      });
    } catch (error) {
      next(error);
    }
  }

  async draftPitch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const result = await freelanceGigService.draftPitch(
        req.user._id,
        req.params.id as string,
        req.body?.tone
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await freelanceGigService.updateStatus(
        req.params.id as string,
        req.body.status
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const freelanceGigController = new FreelanceGigController();
