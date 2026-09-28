import { Router } from 'express';
import { skillGapController } from './skillGap.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res, next) => {
  skillGapController.getAnalysis(req, res, next);
});

export const skillGapRoutes = router;
