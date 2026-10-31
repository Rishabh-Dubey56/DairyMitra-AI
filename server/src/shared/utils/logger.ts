export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  requestId?: string;
  details?: unknown;
  stack?: string;
}

const LEVEL_WEIGHTS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Mask sensitive fields to prevent log leakage in production
const SENSITIVE_KEYS = new Set(['password', 'token', 'accessToken', 'refreshToken', 'secret', 'otp']);

function sanitizeMetadata(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeMetadata);

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object') {
      sanitized[key] = sanitizeMetadata(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

class Logger {
  private currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  private isStructured: boolean = process.env.STRUCTURED_LOGS === 'true' || process.env.NODE_ENV === 'production';

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_WEIGHTS[level] >= LEVEL_WEIGHTS[this.currentLevel];
  }

  private print(level: LogLevel, message: string, context?: string, details?: unknown, requestId?: string): void {
    if (!this.shouldLog(level)) return;

    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? { context } : {}),
      ...(requestId ? { requestId } : {}),
      ...(details !== undefined ? { details: sanitizeMetadata(details) } : {}),
    };

    if (details instanceof Error) {
      payload.stack = details.stack;
    }

    if (this.isStructured) {
      const output = JSON.stringify(payload);
      if (level === 'error') process.stderr.write(output + '\n');
      else process.stdout.write(output + '\n');
    } else {
      const tag = `[${payload.timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''}${requestId ? ` [req:${requestId}]` : ''}:`;
      if (level === 'error') {
        console.error(tag, message, details ? sanitizeMetadata(details) : '');
      } else if (level === 'warn') {
        console.warn(tag, message, details ? sanitizeMetadata(details) : '');
      } else {
        console.log(tag, message, details ? sanitizeMetadata(details) : '');
      }
    }
  }

  public debug(message: string, context?: string, details?: unknown, requestId?: string): void {
    this.print('debug', message, context, details, requestId);
  }

  public info(message: string, context?: string, details?: unknown, requestId?: string): void {
    this.print('info', message, context, details, requestId);
  }

  public warn(message: string, context?: string, details?: unknown, requestId?: string): void {
    this.print('warn', message, context, details, requestId);
  }

  public error(message: string, context?: string, details?: unknown, requestId?: string): void {
    this.print('error', message, context, details, requestId);
  }
}

export const logger = new Logger();
