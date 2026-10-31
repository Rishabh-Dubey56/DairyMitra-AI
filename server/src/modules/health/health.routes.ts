import { Router } from 'express';
import { healthController } from './health.controller.js';

const router = Router();

router.get('/', healthController.readiness);
router.get('/ready', healthController.readiness);
router.get('/live', healthController.liveness);

export const healthRoutes = router;
