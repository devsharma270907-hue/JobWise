import { Router } from 'express';
import { userController } from './user.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema, deleteAccountSchema } from './user.schema.js';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/me', (req, res, next) => {
  userController.getMe(req, res, next);
});

router.patch('/me', validate({ body: updateProfileSchema }), (req, res, next) => {
  userController.updateMe(req, res, next);
});

router.get('/me/export', (req, res, next) => {
  userController.exportMe(req, res, next);
});

router.delete('/me', validate({ body: deleteAccountSchema }), (req, res, next) => {
  userController.deleteMe(req, res, next);
});

export const userRoutes = router;
