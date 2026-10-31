import { ExpenseModel, memoryExpenses } from './expense.model.js';
import { SaleModel, memorySales } from './sale.model.js';
import { dbManager } from '../../bootstrap/database.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import { ErrorCodes } from '../../shared/constants/errorCodes.js';
import { parsePagination, formatPaginatedResult, PaginatedResult } from '../../shared/utils/pagination.js';

export class FinanceService {
  // Expenses
  public async getExpenses(query: any): Promise<PaginatedResult<any>> {
    const pagination = parsePagination(query);
    const category = query.category && query.category !== 'ALL' ? query.category : undefined;

    if (dbManager.isUsingFallback()) {
      let filtered = [...memoryExpenses];
      if (category) filtered = filtered.filter((e) => e.category === category);
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const total = filtered.length;
      const paginated = filtered.slice(pagination.skip, pagination.skip + pagination.limit);
      return formatPaginatedResult(paginated, total, pagination);
    }

    const filter: any = {};
    if (category) filter.category = category;

    const [data, total] = await Promise.all([
      ExpenseModel.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      ExpenseModel.countDocuments(filter),
    ]);

    return formatPaginatedResult(data, total, pagination);
  }

  public async createExpense(data: any): Promise<any> {
    if (dbManager.isUsingFallback()) {
      const newExpense = {
        _id: `exp-${Date.now()}`,
        id: `exp-${Date.now()}`,
        ...data,
        amount: Number(data.amount),
        createdAt: new Date(),
      };
      memoryExpenses.unshift(newExpense);
      return newExpense;
    }

    const expense = new ExpenseModel({
      ...data,
      amount: Number(data.amount),
    });
    return expense.save();
  }

  public async deleteExpense(id: string): Promise<void> {
    if (dbManager.isUsingFallback()) {
      const idx = memoryExpenses.findIndex((e) => e._id === id || e.id === id);
      if (idx === -1) throw new NotFoundError('Expense not found.', ErrorCodes.EXPENSE_NOT_FOUND);
      memoryExpenses.splice(idx, 1);
      return;
    }

    const res = await ExpenseModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundError('Expense not found.', ErrorCodes.EXPENSE_NOT_FOUND);
  }

  // Sales
  public async getSales(query: any): Promise<PaginatedResult<any>> {
    const pagination = parsePagination(query);
    const status = query.status && query.status !== 'ALL' ? query.status : undefined;

    if (dbManager.isUsingFallback()) {
      let filtered = [...memorySales];
      if (status) filtered = filtered.filter((s) => s.paymentStatus === status);
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const total = filtered.length;
      const paginated = filtered.slice(pagination.skip, pagination.skip + pagination.limit);
      return formatPaginatedResult(paginated, total, pagination);
    }

    const filter: any = {};
    if (status) filter.paymentStatus = status;

    const [data, total] = await Promise.all([
      SaleModel.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      SaleModel.countDocuments(filter),
    ]);

    return formatPaginatedResult(data, total, pagination);
  }

  public async createSale(data: any): Promise<any> {
    const qty = Number(data.quantityLiters) || 0;
    const rate = Number(data.ratePerLitre) || 0;
    const totalAmount = Math.round(qty * rate);

    if (dbManager.isUsingFallback()) {
      const newSale = {
        _id: `sale-${Date.now()}`,
        id: `sale-${Date.now()}`,
        ...data,
        quantityLiters: qty,
        ratePerLitre: rate,
        totalAmount,
        createdAt: new Date(),
      };
      memorySales.unshift(newSale);
      return newSale;
    }

    const sale = new SaleModel({
      ...data,
      quantityLiters: qty,
      ratePerLitre: rate,
      totalAmount,
    });
    return sale.save();
  }

  public async deleteSale(id: string): Promise<void> {
    if (dbManager.isUsingFallback()) {
      const idx = memorySales.findIndex((s) => s._id === id || s.id === id);
      if (idx === -1) throw new NotFoundError('Sale not found.', ErrorCodes.SALE_NOT_FOUND);
      memorySales.splice(idx, 1);
      return;
    }

    const res = await SaleModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundError('Sale not found.', ErrorCodes.SALE_NOT_FOUND);
  }
}

export const financeService = new FinanceService();
