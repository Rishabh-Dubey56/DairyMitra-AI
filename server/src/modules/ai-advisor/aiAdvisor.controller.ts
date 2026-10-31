import { Request, Response, NextFunction } from 'express';
import { aiClient } from '../../integration/ai/geminiClient.js';
import { HttpStatus } from '../../shared/constants/httpStatus.js';
import { BadRequestError } from '../../shared/errors/AppError.js';
import { ErrorCodes } from '../../shared/constants/errorCodes.js';

export class AIAdvisorController {
  public async ask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, language = 'en', farmContext } = req.body;

      if (!query || typeof query !== 'string' || !query.trim()) {
        throw new BadRequestError('Query is required and must not be empty.', ErrorCodes.INVALID_PARAMETERS);
      }

      if (query.length > 1000) {
        throw new BadRequestError('Query exceeds maximum allowed length of 1000 characters.', ErrorCodes.INVALID_PARAMETERS);
      }

      const answer = await aiClient.generateAdvice(query.trim(), language as 'en' | 'hi', farmContext);

      res.status(HttpStatus.OK).json({
        answer,
        category: 'general',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const aiAdvisorController = new AIAdvisorController();
