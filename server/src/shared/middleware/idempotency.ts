import { Request, Response, NextFunction } from 'express';
import { redisManager } from '../../bootstrap/redis.js';
import { ConflictError } from '../errors/AppError.js';
import { ErrorCodes } from '../constants/errorCodes.js';

const IDEMPOTENCY_TTL_SEC = parseInt(process.env.IDEMPOTENCY_TTL_SEC || '86400', 10);

export function idempotencyMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Only apply to state-modifying POST / PUT / PATCH / DELETE requests
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.header('Idempotency-Key');
  if (!idempotencyKey) {
    return next(); // optional unless required
  }

  const cacheKey = `idempotency:${idempotencyKey}`;

  redisManager.get(cacheKey).then(async (cached) => {
    if (cached) {
      if (cached === 'PROCESSING') {
        return next(
          new ConflictError(
            'A request with this Idempotency-Key is currently being processed. Please retry shortly.',
            ErrorCodes.IDEMPOTENCY_CONFLICT
          )
        );
      }

      try {
        const parsed = JSON.parse(cached);
        res.setHeader('X-Cache-Lookup', 'IDEMPOTENT_HIT');
        return res.status(parsed.status).json(parsed.body);
      } catch {
        // Fall through
      }
    }

    // Set lock for 60 seconds while processing
    await redisManager.set(cacheKey, 'PROCESSING', 60);

    // Intercept response to cache upon completion
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const payloadToCache = JSON.stringify({ status: res.statusCode, body });
        redisManager.set(cacheKey, payloadToCache, IDEMPOTENCY_TTL_SEC);
      } else {
        redisManager.del(cacheKey); // clear on failure
      }
      return originalJson(body);
    };

    next();
  }).catch((err) => next(err));
}
