import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../errors/AppError.js';
import { redisManager } from '../../bootstrap/redis.js';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  prefix: string;
}

export function createRateLimiter(config: RateLimitConfig) {
  const memoryCounts = new Map<string, { count: number; resetTime: number }>();

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const key = `ratelimit:${config.prefix}:${ip}`;
    const now = Date.now();

    try {
      const cached = await redisManager.get(key);
      let count = cached ? parseInt(cached, 10) : 0;

      if (count >= config.max) {
        res.setHeader('Retry-After', Math.ceil(config.windowMs / 1000));
        throw new RateLimitError(`Too many requests from this IP. Max ${config.max} requests per ${Math.round(config.windowMs / 60000)} minutes.`);
      }

      count += 1;
      await redisManager.set(key, String(count), Math.ceil(config.windowMs / 1000));

      res.setHeader('X-RateLimit-Limit', config.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - count));

      next();
    } catch (err) {
      if (err instanceof RateLimitError) {
        return next(err);
      }

      // Memory fallback if Redis is down
      const item = memoryCounts.get(key);
      if (!item || item.resetTime < now) {
        memoryCounts.set(key, { count: 1, resetTime: now + config.windowMs });
        res.setHeader('X-RateLimit-Limit', config.max);
        res.setHeader('X-RateLimit-Remaining', config.max - 1);
        return next();
      }

      if (item.count >= config.max) {
        res.setHeader('Retry-After', Math.ceil((item.resetTime - now) / 1000));
        return next(new RateLimitError(`Rate limit exceeded. Please wait ${Math.ceil((item.resetTime - now) / 1000)}s.`));
      }

      item.count += 1;
      res.setHeader('X-RateLimit-Limit', config.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - item.count));
      next();
    }
  };
}

export const generalRateLimiter = createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '120', 10),
  prefix: 'general',
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '20', 10),
  prefix: 'auth',
});
