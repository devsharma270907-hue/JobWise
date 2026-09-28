import { Request, Response, NextFunction } from 'express';
import { interviewPrepService } from './interviewPrep.service.js';
import { AppError } from '../../utils/ownershipCheck.js';

export class InterviewPrepController {
  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const result = await interviewPrepService.generatePrep(req.user._id, req.body);

      res.status(201).json({
        success: true,
        data: result.session,
        metadata: {
          modelVersion: result.modelVersion,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async evaluate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const result = await interviewPrepService.evaluateAnswer(
        req.user._id,
        req.params.id as string,
        req.body
      );

      res.status(200).json({
        success: true,
        data: result.evaluation,
        metadata: {
          questionId: result.questionId,
          modelVersion: result.modelVersion,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const session = await interviewPrepService.getSession(
        req.user._id,
        req.params.id as string
      );

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const sessions = await interviewPrepService.listUserSessions(req.user._id);

      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const interviewPrepController = new InterviewPrepController();
