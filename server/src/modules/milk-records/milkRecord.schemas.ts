import { z } from 'zod';

export const createMilkRecordSchema = z.object({
  animalId: z.string().min(1, 'Animal selection is required'),
  animalTag: z.string().optional(),
  animalName: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  morningQuantity: z.number().min(0, 'Morning yield cannot be negative').max(50, 'Max 50L'),
  eveningQuantity: z.number().min(0, 'Evening yield cannot be negative').max(50, 'Max 50L'),
  fatPercentage: z.number().min(0).max(15).optional(),
  snfPercentage: z.number().min(0).max(15).optional(),
  ratePerLitre: z.number().positive('Rate per litre must be greater than 0').default(45),
  notes: z.string().optional(),
});

export const milkRecordQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  date: z.string().optional(),
  animalId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
