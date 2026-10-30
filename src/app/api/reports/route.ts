import { NextResponse } from 'next/server';
import { initialAnimals, initialMilkRecords, initialExpenses, initialSales } from '@/lib/initialData';

export async function GET() {
  const totalAnimals = initialAnimals.length;
  const totalCows = initialAnimals.filter((a) => a.type === 'Cow').length;
  const totalBuffaloes = initialAnimals.filter((a) => a.type === 'Buffalo').length;
  const activeLactatingCount = initialAnimals.filter((a) => a.healthStatus === 'Lactating').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const recordDates = Array.from(new Set(initialMilkRecords.map((r) => r.date))).sort().reverse();
  const latestDate = recordDates[0] || todayStr;
  const prevDate = recordDates[1];

  const todayRecords = initialMilkRecords.filter((r) => r.date === latestDate);
  const yestRecords = initialMilkRecords.filter((r) => r.date === prevDate);

  const todayMilkProduction = Math.round(todayRecords.reduce((s, r) => s + r.totalQuantity, 0) * 10) / 10;
  const yesterdayMilkProduction = Math.round(yestRecords.reduce((s, r) => s + r.totalQuantity, 0) * 10) / 10;

  const monthlyMilkProduction = Math.round(initialMilkRecords.reduce((s, r) => s + r.totalQuantity, 0) * 10) / 10;
  const totalExpenses = initialExpenses.reduce((s, e) => s + e.amount, 0);
  const totalMilkSales = initialSales.reduce((s, e) => s + e.totalAmount, 0);
  const netProfit = totalMilkSales - totalExpenses;

  return NextResponse.json({
    totalAnimals,
    totalCows,
    totalBuffaloes,
    todayMilkProduction,
    yesterdayMilkProduction,
    monthlyMilkProduction,
    totalExpenses,
    totalMilkSales,
    netProfit,
    averageFat: 5.6,
    activeLactatingCount,
  });
}
