import mongoose, { Schema, Document } from 'mongoose';

export type ExpenseCategory =
  | 'Animal Feed'
  | 'Veterinary & Medicine'
  | 'Labour'
  | 'Transportation'
  | 'Electricity & Water'
  | 'Equipment & Maintenance'
  | 'Other';

export interface IExpense extends Document {
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidTo?: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Credit';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'Animal Feed',
        'Veterinary & Medicine',
        'Labour',
        'Transportation',
        'Electricity & Water',
        'Equipment & Maintenance',
        'Other',
      ],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    date: { type: String, required: true, index: true },
    paidTo: { type: String, trim: true },
    paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Credit'], default: 'UPI' },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const ExpenseModel = mongoose.model<IExpense>('Expense', ExpenseSchema);

export const memoryExpenses: any[] = [
  {
    _id: 'exp-1',
    id: 'exp-1',
    title: 'Cattle Feed Pellets (50 Bags x 50kg)',
    category: 'Animal Feed',
    amount: 55000,
    date: '2024-10-05',
    paidTo: 'Kisan Pashu Aahar Kendra, Karnal',
    paymentMethod: 'Bank Transfer',
    notes: '20% crude protein, mineral mix and bypass fat.',
    createdAt: new Date(),
  },
  {
    _id: 'exp-2',
    id: 'exp-2',
    title: 'Monthly Labour Wages (2 Milkers)',
    category: 'Labour',
    amount: 36000,
    date: '2024-10-01',
    paidTo: 'Ramesh & Mohan',
    paymentMethod: 'Bank Transfer',
    notes: 'Milking & shed cleaning wages.',
    createdAt: new Date(),
  },
];
