import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/ownershipCheck.js';
import { verifyRefreshToken } from '../../utils/jwt.js';

const COOKIE_NAME = 'refreshToken';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: SEVEN_DAYS_MS,
    path: '/api/v1/auth',
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/v1/auth',
  });
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);
      setRefreshCookie(res, refreshToken);

      res.status(201).json({
        success: true,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            skills: user.skills,
            targetRoles: user.targetRoles,
          },
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);
      setRefreshCookie(res, refreshToken);

      res.status(200).json({
        success: true,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            skills: user.skills,
            targetRoles: user.targetRoles,
          },
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawCookie = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
      if (!rawCookie) {
        throw new AppError('Refresh token required', 401, 'UNAUTHORIZED');
      }

      const { accessToken, newRefreshToken } = await authService.refresh(rawCookie);
      setRefreshCookie(res, newRefreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken,
        },
      });
    } catch (error) {
      clearRefreshCookie(res);
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.[COOKIE_NAME];
      const userId = req.user?._id;

      if (userId) {
        await authService.logout(userId, refreshToken);
      } else if (refreshToken) {
        try {
          const payload = verifyRefreshToken(refreshToken);
          await authService.logout(payload.sub, refreshToken);
        } catch {
          // Ignore invalid or expired token on logout
        }
      }

      clearRefreshCookie(res);

      res.status(200).json({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
