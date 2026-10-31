import { z } from 'zod';

export const createExpenseSchema = z.object({
  title: z.string().min(2, 'Description must be at least 2 characters').max(100),
  category: z.enum([
    'Animal Feed',
    'Veterinary & Medicine',
    'Labour',
    'Transportation',
    'Electricity & Water',
    'Equipment & Maintenance',
    'Other',
  ]),
  amount: z.number().positive('Expense amount must be positive'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  paidTo: z.string().optional(),
  paymentMethod: z.enum(['Cash', 'UPI', 'Bank Transfer', 'Credit']).default('UPI'),
  notes: z.string().optional(),
});

export const createSaleSchema = z.object({
  buyerName: z.string().min(2, 'Buyer name is required').max(100),
  contact: z.string().optional(),
  quantityLiters: z.number().positive('Quantity must be greater than 0'),
  ratePerLitre: z.number().positive('Price per litre must be greater than 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  paymentStatus: z.enum(['Paid', 'Pending', 'Partial']).default('Paid'),
  paymentMethod: z.enum(['UPI', 'Cash', 'Bank Transfer']).default('Bank Transfer'),
  notes: z.string().optional(),
});

export const financeQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
