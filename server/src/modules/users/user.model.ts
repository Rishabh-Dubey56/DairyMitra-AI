import mongoose, { Schema, Document } from 'mongoose';
import { dbManager } from '../../bootstrap/database.js';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'farmer' | 'vet' | 'staff';
  farmName: string;
  isVerified: boolean;
  otpCode?: string;
  otpExpires?: Date;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['admin', 'farmer', 'vet', 'staff'], default: 'farmer' },
    farmName: { type: String, default: 'Gokul Dairy Farm', trim: true },
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String },
    otpExpires: { type: Date },
    refreshTokenHash: { type: String },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);

// In-Memory store for resilient operation when local standalone MongoDB is offline
export const memoryUsers: Map<string, any> = new Map();
