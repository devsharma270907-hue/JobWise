import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/ownershipCheck.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authorization bearer token required', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError('Authorization bearer token missing', 401, 'UNAUTHORIZED');
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      _id: payload.sub,
      email: payload.email,
      role: payload.role,
      tokenVersion: payload.tokenVersion,
      sub: payload.sub,
    };
    next();
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'name' in error) {
      const errorName = (error as { name: string }).name;
      if (errorName === 'TokenExpiredError') {
        throw new AppError('Access token expired', 401, 'TOKEN_EXPIRED');
      }
      if (errorName === 'JsonWebTokenError') {
        throw new AppError('Invalid access token', 401, 'TOKEN_INVALID');
      }
    }
    throw new AppError('Authentication failed', 401, 'UNAUTHORIZED');
  }
}
