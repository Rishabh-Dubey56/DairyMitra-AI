import { z } from 'zod';

export const createAnimalSchema = z.object({
  tagNumber: z.string().min(2, 'Tag ID is required').max(20).toUpperCase(),
  name: z.string().min(2, 'Name is required').max(50),
  type: z.enum(['Cow', 'Buffalo']),
  breed: z.string().min(2, 'Breed is required'),
  dob: z.string().min(4, 'DOB is required'),
  purchasePrice: z.number().nonnegative().default(0),
  weight: z.number().positive('Weight must be positive'),
  healthStatus: z
    .enum(['Healthy', 'Lactating', 'Pregnant', 'Dry', 'Sick', 'Under Treatment'])
    .default('Lactating'),
  milkCapacity: z.number().nonnegative('Capacity in L/day'),
  imageUrl: z.string().url().optional(),
  lactationNumber: z.number().int().positive().optional(),
  calvingDate: z.string().optional(),
  feeding: z
    .object({
      feedType: z.string().default('Balanced Ration'),
      morningQtyKg: z.number().nonnegative().default(12),
      eveningQtyKg: z.number().nonnegative().default(12),
      supplements: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
});

export const updateAnimalSchema = createAnimalSchema.partial();

export const animalQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  type: z.enum(['Cow', 'Buffalo', 'ALL']).optional(),
  healthStatus: z.enum(['Healthy', 'Lactating', 'Pregnant', 'Dry', 'Sick', 'Under Treatment', 'ALL']).optional(),
  sortBy: z.enum(['capacity', 'tag', 'name', 'price', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
