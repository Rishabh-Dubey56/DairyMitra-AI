import { Request, Response, NextFunction } from 'express';
import { animalService } from './animal.service.js';
import { HttpStatus } from '../../shared/constants/httpStatus.js';

export class AnimalController {
  public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await animalService.getAll(req.query);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const animal = await animalService.getById(String(req.params.id));
      res.status(HttpStatus.OK).json({
        success: true,
        data: animal,
      });
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await animalService.create(req.body);
      res.status(HttpStatus.CREATED).json({
        success: true,
        data: created,
      });
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await animalService.update(String(req.params.id), req.body);
      res.status(HttpStatus.OK).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await animalService.delete(String(req.params.id));
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Animal record removed successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const animalController = new AnimalController();
