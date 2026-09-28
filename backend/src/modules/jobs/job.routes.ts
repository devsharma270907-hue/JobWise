import { Router, Request, Response, NextFunction } from 'express';
import { jobController } from './job.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { aiRateLimit } from '../../middleware/aiRateLimit.js';
import { validate } from '../../middleware/validate.js';
import { createJobSchema, queryJobsSchema, tailorJobSchema } from './job.schema.js';
import { verifyAccessToken } from '../../utils/jwt.js';

const router = Router();

// Middleware to optionally attach user if bearer token is present (for public/optional routes)
function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const payload = verifyAccessToken(token);
        req.user = {
          _id: payload.sub,
          email: payload.email,
          role: payload.role,
          sub: payload.sub,
        };
      } catch {
        // Ignore invalid token on optional route
      }
    }
  }
  next();
}

router.get('/', optionalAuth, validate({ query: queryJobsSchema }), (req, res, next) => {
  jobController.list(req, res, next);
});

router.get('/:id', optionalAuth, (req, res, next) => {
  jobController.getOne(req, res, next);
});

router.post('/', requireAuth, validate({ body: createJobSchema }), (req, res, next) => {
  jobController.create(req, res, next);
});

router.post(
  '/:id/tailor',
  requireAuth,
  aiRateLimit,
  validate({ body: tailorJobSchema }),
  (req, res, next) => {
    jobController.tailor(req, res, next);
  }
);

export const jobRoutes = router;
