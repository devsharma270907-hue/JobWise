import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service.js';
import { AppError } from '../../utils/ownershipCheck.js';

export class UserController {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const profile = await userService.getProfile(req.user._id);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const updated = await userService.updateProfile(req.user._id, req.body);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async exportMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const exported = await userService.exportUserData(req.user._id);

      res.status(200).json({
        success: true,
        data: exported,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      await userService.deleteUserAccount(req.user._id, req.body);

      res.status(200).json({
        success: true,
        data: {
          message: 'Account successfully deleted',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
