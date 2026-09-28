import { Router } from 'express';
import { resumeController } from './resume.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { aiRateLimit } from '../../middleware/aiRateLimit.js';
import { uploadResume } from '../../middleware/upload.js';

const router = Router();

router.use(requireAuth);

router.post(
  ['/', '/upload'],
  aiRateLimit,
  uploadResume.single('resume'),
  (req, res, next) => {
    resumeController.upload(req, res, next);
  }
);

router.get('/', (req, res, next) => {
  resumeController.list(req, res, next);
});

router.get('/:id', (req, res, next) => {
  resumeController.getOne(req, res, next);
});

router.delete('/:id', (req, res, next) => {
  resumeController.delete(req, res, next);
});

export const resumeRoutes = router;
