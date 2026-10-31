import { Request, Response, NextFunction } from 'express';
import { redisManager } from '../../bootstrap/redis.js';
import { UnauthorizedError } from '../errors/AppError.js';
import { ErrorCodes } from '../constants/errorCodes.js';

export function bloomFilterAuthGuard(req: Request, _res: Response, next: NextFunction): void {
  const email = req.body?.email;

  if (email && typeof email === 'string') {
    const isPossiblyRegistered = redisManager.bloomFilter.has(email.toLowerCase().trim());

    if (!isPossiblyRegistered) {
      // Reject immediately: Bloom filter confirms item was NEVER inserted into the system.
      // Defends against massive dictionary brute force & prevents expensive bcrypt hashing
      return next(
        new UnauthorizedError('Invalid credentials or unregistered account.', ErrorCodes.AUTH_INVALID_CREDENTIALS)
      );
    }
  }

  next();
}
