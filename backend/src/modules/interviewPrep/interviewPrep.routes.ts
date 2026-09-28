import { Router } from 'express';
import { interviewPrepController } from './interviewPrep.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { aiRateLimit } from '../../middleware/aiRateLimit.js';
import { validate } from '../../middleware/validate.js';
import {
  generateInterviewPrepSchema,
  evaluateInterviewAnswerSchema,
} from './interviewPrep.schema.js';

const router = Router();

router.use(requireAuth);

router.post(
  '/generate',
  aiRateLimit,
  validate({ body: generateInterviewPrepSchema }),
  (req, res, next) => {
    interviewPrepController.generate(req, res, next);
  }
);

router.post(
  '/:id/evaluate',
  aiRateLimit,
  validate({ body: evaluateInterviewAnswerSchema }),
  (req, res, next) => {
    interviewPrepController.evaluate(req, res, next);
  }
);

router.get('/', (req, res, next) => {
  interviewPrepController.list(req, res, next);
});

router.get('/:id', (req, res, next) => {
  interviewPrepController.getSession(req, res, next);
});

export const interviewPrepRoutes = router;
