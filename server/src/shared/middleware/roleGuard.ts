import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError.js';
import { ErrorCodes } from '../constants/errorCodes.js';

export function roleGuard(...allowedRoles: Array<'admin' | 'farmer' | 'vet' | 'staff'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required before checking permissions.', ErrorCodes.AUTH_UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied for role '${req.user.role}'. Required: [${allowedRoles.join(', ')}]`,
          ErrorCodes.AUTH_FORBIDDEN
        )
      );
    }

    next();
  };
}
