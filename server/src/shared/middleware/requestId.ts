import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      id: string;
      startTime: number;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.header('X-Request-Id');
  const reqId = incomingId || uuidv4();

  req.id = reqId;
  req.startTime = Date.now();
  res.setHeader('X-Request-Id', reqId);

  next();
}
