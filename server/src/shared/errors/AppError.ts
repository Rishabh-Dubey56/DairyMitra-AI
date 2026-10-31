import { HttpStatus, HttpStatusCode } from '../constants/httpStatus.js';
import { ErrorCode, ErrorCodes } from '../constants/errorCodes.js';

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCode = ErrorCodes.INTERNAL_ERROR,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errorCode: ErrorCode = ErrorCodes.INVALID_PARAMETERS, details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, errorCode, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', errorCode: ErrorCode = ErrorCodes.AUTH_UNAUTHORIZED, details?: unknown) {
    super(message, HttpStatus.UNAUTHORIZED, errorCode, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden: Insufficient permissions', errorCode: ErrorCode = ErrorCodes.AUTH_FORBIDDEN, details?: unknown) {
    super(message, HttpStatus.FORBIDDEN, errorCode, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Requested resource not found', errorCode: ErrorCode = ErrorCodes.NOT_FOUND, details?: unknown) {
    super(message, HttpStatus.NOT_FOUND, errorCode, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict or duplicate detected', errorCode: ErrorCode = ErrorCodes.ANIMAL_DUPLICATE_TAG, details?: unknown) {
    super(message, HttpStatus.CONFLICT, errorCode, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Input validation failed', details?: unknown) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, ErrorCodes.VALIDATION_ERROR, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.', details?: unknown) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, ErrorCodes.RATE_LIMIT_EXCEEDED, details);
  }
}
