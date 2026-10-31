import { Router } from 'express';
import { animalController } from './animal.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { idempotencyMiddleware } from '../../shared/middleware/idempotency.js';
import { createAnimalSchema, updateAnimalSchema, animalQuerySchema } from './animal.schemas.js';

const router = Router();

router.get('/', validate({ query: animalQuerySchema }), animalController.getAll);

router.get('/:id', animalController.getById);

router.post('/', idempotencyMiddleware, validate({ body: createAnimalSchema }), animalController.create);

router.put('/:id', validate({ body: updateAnimalSchema }), animalController.update);

router.delete('/:id', animalController.delete);

export const animalRoutes = router;
