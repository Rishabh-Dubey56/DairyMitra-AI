import express, { Application, Request, Response, NextFunction } from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { requestIdMiddleware } from '../shared/middleware/requestId.js';
import { requestLoggerMiddleware } from '../shared/middleware/requestLogger.js';
import {
  helmetMiddleware,
  corsMiddleware,
  sanitizeNoSql,
  sanitizeXss,
  hppGuard,
} from '../shared/middleware/security.js';
import { generalRateLimiter } from '../shared/middleware/rateLimiter.js';
import { errorHandlerMiddleware } from '../shared/middleware/errorHandler.js';
import { NotFoundError } from '../shared/errors/AppError.js';
import { ErrorCodes } from '../shared/constants/errorCodes.js';

// Feature Routes
import { authRoutes } from '../modules/auth/auth.routes.js';
import { animalRoutes } from '../modules/animals/animal.routes.js';
import { milkRecordRoutes } from '../modules/milk-records/milkRecord.routes.js';
import { expenseRoutes, saleRoutes } from '../modules/expenses-sales/finance.routes.js';
import { reportRoutes } from '../modules/reports/report.routes.js';
import { aiAdvisorRoutes } from '../modules/ai-advisor/aiAdvisor.routes.js';
import { healthRoutes } from '../modules/health/health.routes.js';
import { uploadRoutes } from '../modules/uploads/upload.routes.js';

export function createApp(): Application {
  const app: Application = express();

  // Trust reverse proxies (Nginx / Cloudflare / Ingress)
  app.set('trust proxy', 1);

  // Static uploads directory
  const uploadsStaticPath = path.resolve(process.cwd(), 'public', 'uploads');
  app.use('/uploads', express.static(uploadsStaticPath));

  // Security headers & CORS
  app.use(helmetMiddleware);
  app.use(corsMiddleware);

  // Compression
  app.use(compression());

  // Request correlation tracking & structured logging
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  // Body parsers with support for image base64 uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Input Sanitization (NoSQL injection, XSS, HPP)
  app.use(sanitizeNoSql);
  app.use(sanitizeXss);
  app.use(hppGuard);

  // Rate Limiting
  app.use(generalRateLimiter);

  // Health probe (unversioned for Docker / Kubernetes probes)
  app.use('/health', healthRoutes);

  // Standard API Version 1
  const API_V1 = process.env.API_PREFIX || '/api/v1';

  app.use(`${API_V1}/health`, healthRoutes);
  app.use(`${API_V1}/auth`, authRoutes);
  app.use(`${API_V1}/animals`, animalRoutes);
  app.use(`${API_V1}/milk-records`, milkRecordRoutes);
  app.use(`${API_V1}/expenses`, expenseRoutes);
  app.use(`${API_V1}/sales`, saleRoutes);
  app.use(`${API_V1}/reports`, reportRoutes);
  app.use(`${API_V1}/ai-advisor`, aiAdvisorRoutes);
  app.use(`${API_V1}/uploads`, uploadRoutes);
  app.use(`${API_V1}/image-uploads`, uploadRoutes);

  // Direct Frontend Aliases (/api/*) for zero-configuration compatibility
  app.use('/api/animals', animalRoutes);
  app.use('/api/milk-records', milkRecordRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/sales', saleRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/ai-advisor', aiAdvisorRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/image-uploads', uploadRoutes);

  // 404 Route Handler
  app.use('*', (req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found on this server.`, ErrorCodes.NOT_FOUND));
  });

  // Centralized Error Handling Middleware
  app.use(errorHandlerMiddleware);

  return app;
}
