import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { HttpStatus } from '../constants/httpStatus.js';
import { ErrorCodes } from '../constants/errorCodes.js';
import { logger } from '../utils/logger.js';

export function errorHandlerMiddleware(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isProduction = process.env.NODE_ENV === 'production';
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let errorCode: string = ErrorCodes.INTERNAL_ERROR;
  let message = 'An unexpected internal error occurred.';
  let details: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    details = err.details;
  } else if ((err as any).name === 'ValidationError') {
    // Mongoose Validation Error
    statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    message = 'Database validation error';
    details = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  } else if ((err as any).code === 11000) {
    // Mongoose Duplicate Key Error
    statusCode = HttpStatus.CONFLICT;
    errorCode = ErrorCodes.ANIMAL_DUPLICATE_TAG;
    const key = Object.keys((err as any).keyValue || {})[0] || 'resource';
    message = `Duplicate field value entered for '${key}'. Must be unique.`;
  } else if ((err as any).name === 'CastError') {
    // Mongoose Cast Error (Invalid ObjectId)
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCodes.INVALID_PARAMETERS;
    message = `Invalid ID format: ${(err as any).value}`;
  } else {
    // Unhandled system error
    logger.error('Unhandled System Exception', 'ErrorHandler', err, req.id);
    if (!isProduction) {
      message = err.message || message;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details !== undefined && { details }),
    },
    requestId: req.id,
    timestamp: new Date().toISOString(),
  });
}
