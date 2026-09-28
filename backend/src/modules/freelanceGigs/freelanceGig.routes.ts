import { Router } from 'express';
import { freelanceGigController } from './freelanceGig.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { aiRateLimit } from '../../middleware/aiRateLimit.js';
import { validate } from '../../middleware/validate.js';
import {
  createGigSchema,
  draftPitchSchema,
  updateGigStatusSchema,
} from './freelanceGig.schema.js';

const router = Router();

router.get('/', (req, res, next) => {
  freelanceGigController.list(req, res, next);
});

router.get('/:id', (req, res, next) => {
  freelanceGigController.getOne(req, res, next);
});

router.post(
  '/',
  requireAuth,
  validate({ body: createGigSchema }),
  (req, res, next) => {
    freelanceGigController.create(req, res, next);
  }
);

router.post(
  '/:id/pitch',
  requireAuth,
  aiRateLimit,
  validate({ body: draftPitchSchema }),
  (req, res, next) => {
    freelanceGigController.draftPitch(req, res, next);
  }
);

router.patch(
  '/:id/status',
  requireAuth,
  validate({ body: updateGigStatusSchema }),
  (req, res, next) => {
    freelanceGigController.updateStatus(req, res, next);
  }
);

export const freelanceGigRoutes = router;
