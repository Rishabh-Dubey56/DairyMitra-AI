import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/AppError.js';
import { ErrorCodes } from '../constants/errorCodes.js';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authGuard(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header. Expected Bearer token.', ErrorCodes.AUTH_UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}
