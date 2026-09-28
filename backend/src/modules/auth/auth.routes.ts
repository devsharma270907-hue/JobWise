import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from './auth.schema.js';

const router = Router();

router.post('/register', validate({ body: registerSchema }), (req, res, next) => {
  authController.register(req, res, next);
});

router.post('/login', validate({ body: loginSchema }), (req, res, next) => {
  authController.login(req, res, next);
});

router.post('/refresh', (req, res, next) => {
  authController.refresh(req, res, next);
});

router.post('/logout', (req, res, next) => {
  authController.logout(req, res, next);
});

export const authRoutes = router;
