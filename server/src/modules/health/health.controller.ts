import { Request, Response } from 'express';
import { dbManager } from '../../bootstrap/database.js';
import { redisManager } from '../../bootstrap/redis.js';
import { HttpStatus } from '../../shared/constants/httpStatus.js';

export class HealthController {
  public liveness(_req: Request, res: Response): void {
    res.status(HttpStatus.OK).json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  public readiness(_req: Request, res: Response): void {
    const dbHealth = dbManager.getHealth();
    const redisHealth = redisManager.getHealth();
    const memory = process.memoryUsage();

    const isHealthy = dbHealth.status !== 'disconnected';

    res.status(isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json({
      status: isHealthy ? 'UP' : 'DEGRADED',
      environment: process.env.NODE_ENV,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        redis: redisHealth,
      },
      system: {
        nodeVersion: process.version,
        memoryUsageMb: {
          rss: Math.round(memory.rss / 1024 / 1024),
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        },
      },
    });
  }
}

export const healthController = new HealthController();
