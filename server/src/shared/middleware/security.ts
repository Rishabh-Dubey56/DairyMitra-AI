import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { BadRequestError, ForbiddenError } from '../errors/AppError.js';
import { ErrorCodes } from '../constants/errorCodes.js';

// NoSQL Injection Defense (sanitizes $, . keys)
export function sanitizeNoSql(req: Request, _res: Response, next: NextFunction): void {
  const sanitize = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitize);

    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
}

// XSS Sanitization Filter
export function sanitizeXss(req: Request, _res: Response, next: NextFunction): void {
  const cleanString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:[^\s]*/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  };

  const traverse = (obj: any): any => {
    if (!obj) return obj;
    if (typeof obj === 'string') return cleanString(obj);
    if (Array.isArray(obj)) return obj.map(traverse);
    if (typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        obj[k] = traverse(obj[k]);
      }
    }
    return obj;
  };

  if (req.body) traverse(req.body);
  if (req.query) traverse(req.query);
  next();
}

// HTTP Parameter Pollution (HPP) Prevention
export function hppGuard(req: Request, _res: Response, next: NextFunction): void {
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (Array.isArray(req.query[key]) && !['sort', 'fields', 'status'].includes(key)) {
        req.query[key] = (req.query[key] as string[])[0];
      }
    }
  }
  next();
}

// CORS Whitelisting
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowed = (process.env.CORS_ORIGIN || 'http://localhost:3000')
      .split(',')
      .map((s) => s.trim());

    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowed.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new ForbiddenError('Origin not permitted by CORS policy', ErrorCodes.AUTH_FORBIDDEN));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Idempotency-Key', 'Accept-Language', 'X-Requested-With'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400, // 24 hours
});

// Production Helmet Configuration
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});
