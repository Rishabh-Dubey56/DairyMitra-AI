import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Avoid logging noisy health checks in normal logs
  if (req.path.startsWith('/api/v1/health')) {
    return next();
  }

  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || Date.now());
    const statusCode = res.statusCode;
    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel](
      `${req.method} ${req.originalUrl} ${statusCode} - ${duration}ms`,
      'HTTP',
      {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        statusCode,
        durationMs: duration,
      },
      req.id
    );
  });

  next();
}
