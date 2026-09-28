import { Router } from 'express';
import { applicationController } from './application.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
  addNoteSchema,
} from './application.schema.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate({ body: createApplicationSchema }), (req, res, next) => {
  applicationController.create(req, res, next);
});

router.get('/', (req, res, next) => {
  applicationController.list(req, res, next);
});

router.get('/:id', (req, res, next) => {
  applicationController.getOne(req, res, next);
});

router.patch(
  '/:id/status',
  validate({ body: updateApplicationStatusSchema }),
  (req, res, next) => {
    applicationController.updateStatus(req, res, next);
  }
);

router.post('/:id/notes', validate({ body: addNoteSchema }), (req, res, next) => {
  applicationController.addNote(req, res, next);
});

router.delete('/:id', (req, res, next) => {
  applicationController.delete(req, res, next);
});

export const applicationRoutes = router;
