import { Router } from 'express';
import { aiAdvisorController } from './aiAdvisor.controller.js';

const router = Router();

router.post('/', aiAdvisorController.ask);

export const aiAdvisorRoutes = router;
