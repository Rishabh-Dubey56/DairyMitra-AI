import { Request, Response, NextFunction } from 'express';
import { milkRecordService } from './milkRecord.service.js';
import { HttpStatus } from '../../shared/constants/httpStatus.js';

export class MilkRecordController {
  public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await milkRecordService.getAll(req.query);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await milkRecordService.create(req.body);
      res.status(HttpStatus.CREATED).json({
        success: true,
        data: record,
      });
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id || req.query.id || '');
      await milkRecordService.delete(id);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Milk record deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const milkRecordController = new MilkRecordController();
