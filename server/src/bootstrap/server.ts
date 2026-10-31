import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { createApp } from './app.js';
import { dbManager } from './database.js';
import { redisManager } from './redis.js';
import { authService } from '../modules/auth/auth.service.js';
import { setupGracefulShutdown } from './gracefulShutdown.js';
import { logger } from '../shared/utils/logger.js';

async function bootstrapServer(): Promise<void> {
  const PORT = parseInt(process.env.PORT || '5001', 10);
  const APP_NAME = process.env.APP_NAME || 'DairyMitra-API';

  logger.info(`Starting ${APP_NAME} in ${process.env.NODE_ENV || 'development'} mode...`, 'Bootstrap');

  // Step 1: Initialize Redis cache & Bloom filter service
  await redisManager.connect();

  // Step 2: Initialize MongoDB Connection Pool
  await dbManager.connect();

  // Step 3: Seed Admin User & register into Bloom Filter
  await authService.seedDefaultAdmin();

  // Step 4: Create Express Application
  const app = createApp();
  const server = http.createServer(app);

  // Step 5: Start HTTP listener
  server.listen(PORT, () => {
    logger.info(
      `🚀 ${APP_NAME} operational and listening on port ${PORT}`,
      'Bootstrap',
      {
        port: PORT,
        prefix: process.env.API_PREFIX || '/api/v1',
        healthCheck: `http://localhost:${PORT}/api/v1/health`,
      }
    );
  });

  // Step 6: Hook graceful shutdown signals (SIGINT / SIGTERM)
  setupGracefulShutdown(server);
}

bootstrapServer().catch((err) => {
  logger.error('Fatal initialization error during server bootstrap', 'Bootstrap', err);
  process.exit(1);
});
