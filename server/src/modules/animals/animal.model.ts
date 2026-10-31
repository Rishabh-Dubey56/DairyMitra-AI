import mongoose, { Schema, Document } from 'mongoose';

export interface IVaccination {
  id: string;
  vaccineName: string;
  dateGiven: string;
  dueDate: string;
  status: 'Completed' | 'Due' | 'Overdue';
  veterinarian?: string;
  notes?: string;
}

export interface IVetVisit {
  id: string;
  date: string;
  doctorName: string;
  reason: string;
  diagnosis: string;
  prescriptions: string;
  cost: number;
  followUpDate?: string;
}

export interface IFeeding {
  feedType: string;
  morningQtyKg: number;
  eveningQtyKg: number;
  supplements?: string;
}

export interface IAnimal extends Document {
  tagNumber: string;
  name: string;
  type: 'Cow' | 'Buffalo';
  breed: string;
  dob: string;
  purchasePrice: number;
  weight: number;
  healthStatus: 'Healthy' | 'Lactating' | 'Pregnant' | 'Dry' | 'Sick' | 'Under Treatment';
  milkCapacity: number;
  imageUrl?: string;
  lactationNumber?: number;
  calvingDate?: string;
  feeding: IFeeding;
  vaccinations: IVaccination[];
  vetVisits: IVetVisit[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnimalSchema = new Schema<IAnimal>(
  {
    tagNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    type: { type: String, enum: ['Cow', 'Buffalo'], required: true, index: true },
    breed: { type: String, required: true, trim: true, index: true },
    dob: { type: String, required: true },
    purchasePrice: { type: Number, default: 0 },
    weight: { type: Number, required: true },
    healthStatus: {
      type: String,
      enum: ['Healthy', 'Lactating', 'Pregnant', 'Dry', 'Sick', 'Under Treatment'],
      default: 'Lactating',
      index: true,
    },
    milkCapacity: { type: Number, required: true },
    imageUrl: { type: String },
    lactationNumber: { type: Number, default: 1 },
    calvingDate: { type: String },
    feeding: {
      feedType: { type: String, default: 'Green Napier + Dry Straw + Balanced Pellets' },
      morningQtyKg: { type: Number, default: 12 },
      eveningQtyKg: { type: Number, default: 12 },
      supplements: { type: String, default: 'Mineral Mixture 50g' },
    },
    vaccinations: [
      {
        id: { type: String },
        vaccineName: { type: String, required: true },
        dateGiven: { type: String, required: true },
        dueDate: { type: String, required: true },
        status: { type: String, enum: ['Completed', 'Due', 'Overdue'], default: 'Completed' },
        veterinarian: { type: String },
        notes: { type: String },
      },
    ],
    vetVisits: [
      {
        id: { type: String },
        date: { type: String, required: true },
        doctorName: { type: String, required: true },
        reason: { type: String, required: true },
        diagnosis: { type: String, required: true },
        prescriptions: { type: String },
        cost: { type: Number, default: 0 },
        followUpDate: { type: String },
      },
    ],
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const AnimalModel = mongoose.model<IAnimal>('Animal', AnimalSchema);

// Initial in-memory seed for resilient fallback mode
export const memoryAnimals: any[] = [
  {
    _id: 'a-101',
    id: 'a-101',
    tagNumber: 'DM-101',
    name: 'Gauri',
    type: 'Cow',
    breed: 'Gir',
    dob: '2021-03-15',
    purchasePrice: 65000,
    weight: 420,
    healthStatus: 'Lactating',
    milkCapacity: 16,
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80',
    feeding: {
      feedType: 'Green Napier Fodder + Wheat Straw + 4kg Cattle Pellet',
      morningQtyKg: 12,
      eveningQtyKg: 12,
      supplements: 'Mineral Mixture 60g, Chelated Calcium 100ml',
    },
    vaccinations: [
      { id: 'v1', vaccineName: 'FMD', dateGiven: '2024-04-10', dueDate: '2024-10-10', status: 'Completed', veterinarian: 'Dr. R. K. Sharma' },
    ],
    vetVisits: [],
    notes: 'Champion Gir cow, high butterfat content.',
    createdAt: new Date(),
  },
  {
    _id: 'a-102',
    id: 'a-102',
    tagNumber: 'DM-102',
    name: 'Kaali',
    type: 'Buffalo',
    breed: 'Murrah',
    dob: '2020-07-22',
    purchasePrice: 95000,
    weight: 560,
    healthStatus: 'Lactating',
    milkCapacity: 18,
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80',
    feeding: {
      feedType: 'Green Sorghum + Mustard Cake + Wheat Bran',
      morningQtyKg: 15,
      eveningQtyKg: 15,
      supplements: 'Bypass Fat 100g, Mineral Mix 75g',
    },
    vaccinations: [
      { id: 'v2', vaccineName: 'FMD', dateGiven: '2024-04-10', dueDate: '2024-10-10', status: 'Completed', veterinarian: 'Dr. R. K. Sharma' },
    ],
    vetVisits: [],
    notes: 'Top yielder Murrah buffalo, milk fat reaches 8.2%.',
    createdAt: new Date(),
  },
];
