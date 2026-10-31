import { Router } from 'express';
import { milkRecordController } from './milkRecord.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { idempotencyMiddleware } from '../../shared/middleware/idempotency.js';
import { createMilkRecordSchema, milkRecordQuerySchema } from './milkRecord.schemas.js';

const router = Router();

router.get('/', validate({ query: milkRecordQuerySchema }), milkRecordController.getAll);

router.post('/', idempotencyMiddleware, validate({ body: createMilkRecordSchema }), milkRecordController.create);

router.delete('/:id', milkRecordController.delete);
router.delete('/', milkRecordController.delete); // supports ?id= query param for frontend parity

export const milkRecordRoutes = router;
