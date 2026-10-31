import mongoose, { Schema, Document } from 'mongoose';

export interface IMilkRecord extends Document {
  animalId: string;
  animalTag: string;
  animalName: string;
  date: string; // YYYY-MM-DD
  morningQuantity: number;
  eveningQuantity: number;
  totalQuantity: number;
  fatPercentage?: number;
  snfPercentage?: number;
  ratePerLitre: number;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MilkRecordSchema = new Schema<IMilkRecord>(
  {
    animalId: { type: String, required: true, index: true },
    animalTag: { type: String, required: true, uppercase: true, index: true },
    animalName: { type: String, required: true },
    date: { type: String, required: true, index: true },
    morningQuantity: { type: Number, required: true, min: 0 },
    eveningQuantity: { type: Number, required: true, min: 0 },
    totalQuantity: { type: Number, required: true, min: 0 },
    fatPercentage: { type: Number, min: 0, max: 15 },
    snfPercentage: { type: Number, min: 0, max: 15 },
    ratePerLitre: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries for the same animal on the same date
MilkRecordSchema.index({ animalId: 1, date: 1 }, { unique: true });

export const MilkRecordModel = mongoose.model<IMilkRecord>('MilkRecord', MilkRecordSchema);

export const memoryMilkRecords: any[] = [
  {
    _id: 'mr-1',
    id: 'mr-1',
    animalId: 'a-101',
    animalTag: 'DM-101',
    animalName: 'Gauri',
    date: new Date().toISOString().split('T')[0],
    morningQuantity: 8.2,
    eveningQuantity: 7.5,
    totalQuantity: 15.7,
    fatPercentage: 4.4,
    snfPercentage: 8.6,
    ratePerLitre: 45,
    totalAmount: 706,
    notes: 'Normal morning & evening yield.',
    createdAt: new Date(),
  },
  {
    _id: 'mr-2',
    id: 'mr-2',
    animalId: 'a-102',
    animalTag: 'DM-102',
    animalName: 'Kaali',
    date: new Date().toISOString().split('T')[0],
    morningQuantity: 9.0,
    eveningQuantity: 8.5,
    totalQuantity: 17.5,
    fatPercentage: 8.0,
    snfPercentage: 9.1,
    ratePerLitre: 66,
    totalAmount: 1155,
    notes: 'High butterfat content.',
    createdAt: new Date(),
  },
];
