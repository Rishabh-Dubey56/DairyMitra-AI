import { Animal, MilkRecord, Expense, Sale, FarmSettings, DashboardStats } from './types';
import { initialAnimals, initialMilkRecords, initialExpenses, initialSales, initialFarmSettings } from './initialData';

const STORAGE_KEYS = {
  ANIMALS: 'dairymitra_animals',
  MILK_RECORDS: 'dairymitra_milk_records',
  EXPENSES: 'dairymitra_expenses',
  SALES: 'dairymitra_sales',
  SETTINGS: 'dairymitra_settings',
};

// Check if window is defined (browser environment)
const isBrowser = typeof window !== 'undefined';

export function getStoredData<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

export function setStoredData<T>(key: string, data: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch custom event for cross-component reactive synchronization
    window.dispatchEvent(new Event('dairymitra_storage_updated'));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

// Data Access Object Functions
export const farmStore = {
  // Animals
  getAnimals: (): Animal[] => {
    return getStoredData<Animal[]>(STORAGE_KEYS.ANIMALS, initialAnimals);
  },

  getAnimalById: (id: string): Animal | undefined => {
    const animals = farmStore.getAnimals();
    return animals.find((a) => a.id === id || a.tagNumber.toLowerCase() === id.toLowerCase());
  },

  saveAnimal: (animal: Animal): void => {
    const animals = farmStore.getAnimals();
    const existingIndex = animals.findIndex((a) => a.id === animal.id);
    if (existingIndex >= 0) {
      animals[existingIndex] = animal;
    } else {
      animals.unshift(animal);
    }
    setStoredData(STORAGE_KEYS.ANIMALS, animals);
  },

  deleteAnimal: (id: string): void => {
    const animals = farmStore.getAnimals().filter((a) => a.id !== id);
    setStoredData(STORAGE_KEYS.ANIMALS, animals);
  },

  // Milk Records
  getMilkRecords: (): MilkRecord[] => {
    return getStoredData<MilkRecord[]>(STORAGE_KEYS.MILK_RECORDS, initialMilkRecords);
  },

  saveMilkRecord: (record: MilkRecord): { success: boolean; duplicate?: boolean } => {
    const records = farmStore.getMilkRecords();
    // Check duplicate: same animal and same date
    const duplicateIndex = records.findIndex(
      (r) => r.animalId === record.animalId && r.date === record.date && r.id !== record.id
    );

    if (duplicateIndex >= 0) {
      return { success: false, duplicate: true };
    }

    const existingIndex = records.findIndex((r) => r.id === record.id);
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }
    setStoredData(STORAGE_KEYS.MILK_RECORDS, records);
    return { success: true };
  },

  deleteMilkRecord: (id: string): void => {
    const records = farmStore.getMilkRecords().filter((r) => r.id !== id);
    setStoredData(STORAGE_KEYS.MILK_RECORDS, records);
  },

  // Expenses
  getExpenses: (): Expense[] => {
    return getStoredData<Expense[]>(STORAGE_KEYS.EXPENSES, initialExpenses);
  },

  saveExpense: (expense: Expense): void => {
    const expenses = farmStore.getExpenses();
    const existingIndex = expenses.findIndex((e) => e.id === expense.id);
    if (existingIndex >= 0) {
      expenses[existingIndex] = expense;
    } else {
      expenses.unshift(expense);
    }
    setStoredData(STORAGE_KEYS.EXPENSES, expenses);
  },

  deleteExpense: (id: string): void => {
    const expenses = farmStore.getExpenses().filter((e) => e.id !== id);
    setStoredData(STORAGE_KEYS.EXPENSES, expenses);
  },

  // Sales
  getSales: (): Sale[] => {
    return getStoredData<Sale[]>(STORAGE_KEYS.SALES, initialSales);
  },

  saveSale: (sale: Sale): void => {
    const sales = farmStore.getSales();
    const existingIndex = sales.findIndex((s) => s.id === sale.id);
    if (existingIndex >= 0) {
      sales[existingIndex] = sale;
    } else {
      sales.unshift(sale);
    }
    setStoredData(STORAGE_KEYS.SALES, sales);
  },

  deleteSale: (id: string): void => {
    const sales = farmStore.getSales().filter((s) => s.id !== id);
    setStoredData(STORAGE_KEYS.SALES, sales);
  },

  // Settings
  getSettings: (): FarmSettings => {
    return getStoredData<FarmSettings>(STORAGE_KEYS.SETTINGS, initialFarmSettings);
  },

  saveSettings: (settings: FarmSettings): void => {
    setStoredData(STORAGE_KEYS.SETTINGS, settings);
  },

  // Compute Dashboard Statistics
  getDashboardStats: (): DashboardStats => {
    const animals = farmStore.getAnimals();
    const milkRecords = farmStore.getMilkRecords();
    const expenses = farmStore.getExpenses();
    const sales = farmStore.getSales();

    const totalAnimals = animals.length;
    const totalCows = animals.filter((a) => a.type === 'Cow').length;
    const totalBuffaloes = animals.filter((a) => a.type === 'Buffalo').length;
    const activeLactatingCount = animals.filter((a) => a.healthStatus === 'Lactating').length;

    // Dates for today & yesterday
    const todayStr = new Date().toISOString().split('T')[0];
    const yestDate = new Date();
    yestDate.setDate(yestDate.getDate() - 1);
    const yestStr = yestDate.toISOString().split('T')[0];

    // Find latest available record date if today has none yet
    const recordDates = Array.from(new Set(milkRecords.map((r) => r.date))).sort().reverse();
    const activeLatestDate = recordDates[0] || todayStr;
    const activePrevDate = recordDates[1] || yestStr;

    const todayRecords = milkRecords.filter((r) => r.date === activeLatestDate);
    const yesterdayRecords = milkRecords.filter((r) => r.date === activePrevDate);

    const todayMilkProduction = Math.round(todayRecords.reduce((sum, r) => sum + r.totalQuantity, 0) * 10) / 10;
    const yesterdayMilkProduction = Math.round(yesterdayRecords.reduce((sum, r) => sum + r.totalQuantity, 0) * 10) / 10;

    // Monthly Milk Production (current month or all in dataset)
    const currentMonthPrefix = activeLatestDate.substring(0, 7); // e.g. "2024-10"
    const monthlyRecords = milkRecords.filter((r) => r.date.startsWith(currentMonthPrefix));
    const monthlyMilkProduction = Math.round(monthlyRecords.reduce((sum, r) => sum + r.totalQuantity, 0) * 10) / 10;

    // Average Fat
    const fatRecords = monthlyRecords.filter((r) => r.fatPercentage && r.fatPercentage > 0);
    const averageFat = fatRecords.length > 0
      ? Math.round((fatRecords.reduce((sum, r) => sum + (r.fatPercentage || 0), 0) / fatRecords.length) * 10) / 10
      : 5.4;

    // Financial calculations
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalMilkSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const netProfit = totalMilkSales - totalExpenses;

    return {
      totalAnimals,
      totalCows,
      totalBuffaloes,
      todayMilkProduction,
      yesterdayMilkProduction,
      monthlyMilkProduction,
      totalExpenses,
      totalMilkSales,
      netProfit,
      averageFat,
      activeLactatingCount,
    };
  },

  // Reset to initial demo data
  resetAllData: (): void => {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.ANIMALS, JSON.stringify(initialAnimals));
    localStorage.setItem(STORAGE_KEYS.MILK_RECORDS, JSON.stringify(initialMilkRecords));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialExpenses));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(initialSales));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialFarmSettings));
    window.dispatchEvent(new Event('dairymitra_storage_updated'));
  },
};
