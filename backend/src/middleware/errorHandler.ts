import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/ownershipCheck.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Handled operational AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    });
    return;
  }

  // 2. Zod validation error
  if (err instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.') || 'request';
      if (!fields[path]) {
        fields[path] = [];
      }
      fields[path].push(issue.message);
    }

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        fields,
      },
    });
    return;
  }

  // 3. Mongoose Duplicate Key Error (E11000)
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000) {
    const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue;
    const field = keyValue ? Object.keys(keyValue)[0] : 'field';
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `${field ? `${field} already exists` : 'Duplicate resource exists'}`,
      },
    });
    return;
  }

  // 4. JWT errors
  if (typeof err === 'object' && err !== null && 'name' in err) {
    const errorName = (err as { name: string }).name;
    if (errorName === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token expired',
        },
      });
      return;
    }
    if (errorName === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: 'Invalid access token',
        },
      });
      return;
    }
  }

  // 5. Malformed JSON Body (body-parser SyntaxError)
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400 && 'body' in err) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload. Please ensure valid JSON formatting.',
      },
    });
    return;
  }

  // 5. Unhandled internal error
  const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
  logger.error('Unhandled internal server error', {
    url: req.originalUrl,
    method: req.method,
    error: errorMessage,
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : errorMessage,
    },
  });
}
