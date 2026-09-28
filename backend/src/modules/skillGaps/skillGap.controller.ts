import { Request, Response, NextFunction } from 'express';
import { skillGapService } from './skillGap.service.js';
import { AppError } from '../../utils/ownershipCheck.js';

export class SkillGapController {
  async getAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const analysis = await skillGapService.analyzeGaps(req.user._id);

      res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const skillGapController = new SkillGapController();
