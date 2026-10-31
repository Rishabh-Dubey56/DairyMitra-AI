import { Router } from 'express';
import { financeController } from './finance.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { idempotencyMiddleware } from '../../shared/middleware/idempotency.js';
import { createExpenseSchema, createSaleSchema, financeQuerySchema } from './finance.schemas.js';

export const expenseRoutes = Router();
expenseRoutes.get('/', validate({ query: financeQuerySchema }), financeController.getExpenses);
expenseRoutes.post('/', idempotencyMiddleware, validate({ body: createExpenseSchema }), financeController.createExpense);
expenseRoutes.delete('/:id', financeController.deleteExpense);
expenseRoutes.delete('/', financeController.deleteExpense);

export const saleRoutes = Router();
saleRoutes.get('/', validate({ query: financeQuerySchema }), financeController.getSales);
saleRoutes.post('/', idempotencyMiddleware, validate({ body: createSaleSchema }), financeController.createSale);
saleRoutes.delete('/:id', financeController.deleteSale);
saleRoutes.delete('/', financeController.deleteSale);
