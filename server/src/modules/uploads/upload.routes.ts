import { Router } from 'express';
import { UploadController } from './upload.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.js';

export const uploadRoutes = Router();

// Upload image endpoint
uploadRoutes.post('/image', authGuard, UploadController.uploadImage);
uploadRoutes.post('/', authGuard, UploadController.uploadImage);
