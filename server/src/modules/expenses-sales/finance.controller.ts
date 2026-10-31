import { Request, Response, NextFunction } from 'express';
import { financeService } from './finance.service.js';
import { HttpStatus } from '../../shared/constants/httpStatus.js';

export class FinanceController {
  // Expenses
  public async getExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await financeService.getExpenses(req.query);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  public async createExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await financeService.createExpense(req.body);
      res.status(HttpStatus.CREATED).json({
        success: true,
        data: expense,
      });
    } catch (err) {
      next(err);
    }
  }

  public async deleteExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id || req.query.id || '');
      await financeService.deleteExpense(id);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Expense removed successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // Sales
  public async getSales(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await financeService.getSales(req.query);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  public async createSale(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sale = await financeService.createSale(req.body);
      res.status(HttpStatus.CREATED).json({
        success: true,
        data: sale,
      });
    } catch (err) {
      next(err);
    }
  }

  public async deleteSale(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id || req.query.id || '');
      await financeService.deleteSale(id);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Sale record removed successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const financeController = new FinanceController();
