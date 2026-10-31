import jwt, { SignOptions } from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/AppError.js';
import { ErrorCodes } from '../constants/errorCodes.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'farmer' | 'vet' | 'staff';
  farmName?: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_dairymitra_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_dairymitra_2026';

const ACCESS_EXPIRY = (process.env.JWT_ACCESS_EXPIRY || '15m') as any;
const REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY || '7d') as any;

export function signAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: ACCESS_EXPIRY,
    algorithm: 'HS256',
    issuer: 'DairyMitra-API',
  };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function signRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: REFRESH_EXPIRY,
    algorithm: 'HS256',
    issuer: 'DairyMitra-API',
  };
  return jwt.sign(payload, REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, ACCESS_SECRET, {
      algorithms: ['HS256'],
      issuer: 'DairyMitra-API',
    }) as TokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Access token has expired. Please refresh.', ErrorCodes.AUTH_TOKEN_EXPIRED);
    }
    throw new UnauthorizedError('Invalid authentication token.', ErrorCodes.AUTH_INVALID_TOKEN);
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, REFRESH_SECRET, {
      algorithms: ['HS256'],
      issuer: 'DairyMitra-API',
    }) as TokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Refresh token expired. Please login again.', ErrorCodes.AUTH_TOKEN_EXPIRED);
    }
    throw new UnauthorizedError('Invalid refresh token.', ErrorCodes.AUTH_REFRESH_TOKEN_INVALID);
  }
}
