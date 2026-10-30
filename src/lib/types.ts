// Core TypeScript types for DairyMitra AI

export type AnimalType = 'Cow' | 'Buffalo';

export type HealthStatus = 'Healthy' | 'Lactating' | 'Pregnant' | 'Dry' | 'Sick' | 'Under Treatment';

export type Breed = 
  | 'Gir' 
  | 'Sahiwal' 
  | 'Red Sindhi' 
  | 'Tharparkar' 
  | 'Kankrej' 
  | 'Rathi' 
  | 'Murrah' 
  | 'Nili-Ravi' 
  | 'Jaffarabadi' 
  | 'Surti' 
  | 'Mehsana' 
  | 'HF Cross' 
  | 'Jersey Cross';

export interface VaccinationRecord {
  id: string;
  vaccineName: string;
  dateGiven: string;
  dueDate: string;
  status: 'Completed' | 'Due' | 'Overdue';
  veterinarian?: string;
  notes?: string;
}

export interface VetVisit {
  id: string;
  date: string;
  doctorName: string;
  reason: string;
  diagnosis: string;
  prescriptions: string;
  cost: number;
  followUpDate?: string;
}

export interface FeedingDetail {
  feedType: string; // e.g. "Green Fodder (Napier/Barseem)", "Dry Fodder (Wheat straw)", "Concentrate Feed (Cattle pellet/Maize)"
  morningQtyKg: number;
  eveningQtyKg: number;
  supplements?: string; // e.g. "Mineral Mixture 50g, Cal/Phos"
}

export interface Animal {
  id: string;
  tagNumber: string; // e.g. "DM-101"
  name: string;
  type: AnimalType;
  breed: Breed | string;
  dob: string;
  purchasePrice: number;
  weight: number; // in kg
  healthStatus: HealthStatus;
  milkCapacity: number; // in Litres / day
  imageUrl?: string;
  lactationNumber?: number;
  calvingDate?: string;
  feeding: FeedingDetail;
  vaccinations: VaccinationRecord[];
  vetVisits: VetVisit[];
  notes?: string;
  createdAt: string;
}

export interface MilkRecord {
  id: string;
  animalId: string;
  animalTag: string;
  animalName: string;
  date: string; // YYYY-MM-DD
  morningQuantity: number; // in Litres
  eveningQuantity: number; // in Litres
  totalQuantity: number; // calculated morning + evening
  fatPercentage?: number; // e.g. 4.2% for cow, 7.5% for buffalo
  snfPercentage?: number; // e.g. 8.5%
  ratePerLitre: number; // in INR
  totalAmount: number; // calculated totalQuantity * ratePerLitre
  notes?: string;
}

export type ExpenseCategory = 
  | 'Animal Feed' 
  | 'Veterinary & Medicine' 
  | 'Labour' 
  | 'Transportation' 
  | 'Electricity & Water' 
  | 'Equipment & Maintenance' 
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paidTo?: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Credit';
  notes?: string;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Partial';

export interface Sale {
  id: string;
  buyerName: string; // e.g., "Amul Dairy Cooperative", "Mother Dairy Chilling Centre", "Sharma Sweets", "Village Direct"
  contact?: string;
  quantityLiters: number;
  ratePerLitre: number;
  totalAmount: number;
  date: string; // YYYY-MM-DD
  paymentStatus: PaymentStatus;
  paymentMethod?: 'UPI' | 'Cash' | 'Bank Transfer';
  notes?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  category?: 'nutrition' | 'health' | 'production' | 'financial' | 'general';
}

export interface FarmSettings {
  farmName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  registrationNumber: string;
  currency: string;
  language: 'en' | 'hi';
  lowYieldAlertThreshold: number; // in litres
  vaccinationAlertDays: number; // days in advance
  dailyMilkTarget: number; // in litres
  theme: 'light' | 'soft-farm';
}

export interface DashboardStats {
  totalAnimals: number;
  totalCows: number;
  totalBuffaloes: number;
  todayMilkProduction: number;
  yesterdayMilkProduction: number;
  monthlyMilkProduction: number;
  totalExpenses: number;
  totalMilkSales: number;
  netProfit: number;
  averageFat: number;
  activeLactatingCount: number;
}
