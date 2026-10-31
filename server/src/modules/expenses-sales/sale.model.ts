import mongoose, { Schema, Document } from 'mongoose';

export type PaymentStatus = 'Paid' | 'Pending' | 'Partial';

export interface ISale extends Document {
  buyerName: string;
  contact?: string;
  quantityLiters: number;
  ratePerLitre: number;
  totalAmount: number;
  date: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'UPI' | 'Cash' | 'Bank Transfer';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<ISale>(
  {
    buyerName: { type: String, required: true, trim: true, index: true },
    contact: { type: String, trim: true },
    quantityLiters: { type: Number, required: true, min: 1 },
    ratePerLitre: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true },
    date: { type: String, required: true, index: true },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Partial'], default: 'Paid', index: true },
    paymentMethod: { type: String, enum: ['UPI', 'Cash', 'Bank Transfer'], default: 'Bank Transfer' },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const SaleModel = mongoose.model<ISale>('Sale', SaleSchema);

export const memorySales: any[] = [
  {
    _id: 'sale-1',
    id: 'sale-1',
    buyerName: 'Amul Dairy Cooperative Society',
    contact: '+91 94160 11223',
    quantityLiters: 1650,
    ratePerLitre: 56,
    totalAmount: 92400,
    date: '2024-10-10',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    notes: 'Bi-weekly settlement cycle. Avg Fat 6.2%.',
    createdAt: new Date(),
  },
  {
    _id: 'sale-2',
    id: 'sale-2',
    buyerName: 'Mother Dairy Chilling Centre',
    contact: '+91 98120 44556',
    quantityLiters: 850,
    ratePerLitre: 58,
    totalAmount: 49300,
    date: '2024-10-25',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    notes: 'Premium Buffalo milk dispatch.',
    createdAt: new Date(),
  },
];
