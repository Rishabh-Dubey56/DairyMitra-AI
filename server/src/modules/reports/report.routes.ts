import { Router } from 'express';
import { reportController } from './report.controller.js';

const router = Router();

router.get('/', reportController.getStats);
router.get('/export/csv', reportController.exportCsv);

export const reportRoutes = router;
