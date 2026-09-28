import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { resumeRoutes } from './modules/resumes/resume.routes.js';
import { jobRoutes } from './modules/jobs/job.routes.js';
import { applicationRoutes } from './modules/applications/application.routes.js';
import { skillGapRoutes } from './modules/skillGaps/skillGap.routes.js';
import { interviewPrepRoutes } from './modules/interviewPrep/interviewPrep.routes.js';
import { freelanceGigRoutes } from './modules/freelanceGigs/freelanceGig.routes.js';

// Express 5 compatibility: req.query is getter-only on express.request, which breaks
// middlewares like express-mongo-sanitize or validators that reassign or sanitize req.query.
const queryDescriptor = Object.getOwnPropertyDescriptor(express.request, 'query');
if (queryDescriptor && !queryDescriptor.set) {
  Object.defineProperty(express.request, 'query', {
    get: queryDescriptor.get,
    set(v) {
      Object.defineProperty(this, 'query', {
        value: v,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    },
    configurable: true,
    enumerable: true,
  });
}

export function createApp(): Express {
  const app = express();

  // 1. Security Headers
  app.use(helmet());

  // 2. CORS - Explicit origin allowlist only, never wildcard with credentials
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 3. Health & Readiness (Mounted before rate limiting per blueprint)
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/ready', (_req: Request, res: Response) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      res.status(200).json({ status: 'ready', database: 'connected' });
    } else {
      res.status(503).json({ status: 'degraded', database: 'disconnected' });
    }
  });

  // 4. Body parsing & Cookie parser
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // 5. NoSQL injection prevention
  app.use(mongoSanitize());

  // 6. Request Logging in development
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // 7. Global API Rate Limiter
  const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please slow down.',
      },
    },
  });
  app.use('/api', globalLimiter);

  // 8. Strict Auth Rate Limiter
  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts. Please try again later.',
      },
    },
  });
  app.use('/api/v1/auth', authLimiter);

  // 9. API Module Route Mounts
  const apiRouter = express.Router();
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/users', userRoutes);
  apiRouter.use('/resumes', resumeRoutes);
  apiRouter.use('/jobs', jobRoutes);
  apiRouter.use('/applications', applicationRoutes);
  apiRouter.use('/skill-gaps', skillGapRoutes);
  apiRouter.use('/interview-prep', interviewPrepRoutes);
  apiRouter.use('/freelance-gigs', freelanceGigRoutes);

  app.use('/api/v1', apiRouter);

  // 10. 404 Route Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  // 11. Centralized Error Handler (Always last in chain)
  app.use(errorHandler);

  return app;
}
