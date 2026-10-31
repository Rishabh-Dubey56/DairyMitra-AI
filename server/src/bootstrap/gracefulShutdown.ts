import { Server } from 'http';
import { logger } from '../shared/utils/logger.js';
import { dbManager } from './database.js';
import { redisManager } from './redis.js';

export function setupGracefulShutdown(server: Server): void {
  const shutdown = async (signal: string) => {
    logger.warn(`Received ${signal}. Initiating graceful application shutdown...`, 'Lifecycle');

    // Stop accepting new connections
    server.close(async () => {
      logger.info('HTTP server has closed all socket listeners.', 'Lifecycle');

      try {
        // Disconnect database connection pool
        await dbManager.disconnect();

        // Disconnect redis connection pool
        await redisManager.disconnect();

        logger.info('All database & cache connection pools cleanly closed. Shutdown complete.', 'Lifecycle');
        process.exit(0);
      } catch (err) {
        logger.error('Error during cleanup shutdown sequence', 'Lifecycle', err);
        process.exit(1);
      }
    });

    // Forceful shutdown timer if sockets hang beyond 15s
    setTimeout(() => {
      logger.error('Graceful shutdown timeout exceeded (15s). Force-terminating process.', 'Lifecycle');
      process.exit(1);
    }, 15000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Promise Rejection detected', 'Process', reason);
  });

  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception caught. Shutting down gracefully...', 'Process', err);
    shutdown('UNCAUGHT_EXCEPTION');
  });
}
