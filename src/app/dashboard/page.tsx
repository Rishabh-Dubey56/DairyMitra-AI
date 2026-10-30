'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Droplets,
  Calendar,
  Receipt,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/components/common/LanguageContext';
import { farmStore } from '@/lib/store';
import { formatINR, formatNumber } from '@/lib/utils';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProductionChart } from '@/components/dashboard/ProductionChart';
import { RevenueExpenseChart } from '@/components/dashboard/RevenueExpenseChart';
import { AnimalYieldChart } from '@/components/dashboard/AnimalYieldChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { HealthActivities } from '@/components/dashboard/HealthActivities';
import { MilkEntryModal } from '@/components/milk/MilkEntryModal';
import { AnimalFormModal } from '@/components/animals/AnimalFormModal';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { SaleModal } from '@/components/expenses/SaleModal';
import { Animal, MilkRecord, Expense, Sale, DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [milkRecords, setMilkRecords] = useState<MilkRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Modals
  const [isMilkModalOpen, setIsMilkModalOpen] = useState(false);
  const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  const loadData = () => {
    setStats(farmStore.getDashboardStats());
    setAnimals(farmStore.getAnimals());
    setMilkRecords(farmStore.getMilkRecords());
    setExpenses(farmStore.getExpenses());
    setSales(farmStore.getSales());
  };

  useEffect(() => {
    loadData();

    const handleStorageUpdated = () => {
      loadData();
    };

    window.addEventListener('dairymitra_storage_updated', handleStorageUpdated);
    return () => window.removeEventListener('dairymitra_storage_updated', handleStorageUpdated);
  }, []);

  if (!stats) return null;

  const yieldTrendDiff = Math.round((stats.todayMilkProduction - stats.yesterdayMilkProduction) * 10) / 10;
  const isYieldUp = yieldTrendDiff >= 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.overviewTitle}</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t.overviewSubtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Sync</span>
          </button>

          <button
            onClick={() => router.push('/ai-advisor')}
            className="flex items-center gap-1.5 rounded-xl bg-forest px-3.5 py-2 text-xs font-semibold text-white hover:bg-forest/90 transition-colors shadow-sm shadow-forest/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask AI Advisor</span>
          </button>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Animals */}
        <StatCard
          title={t.totalAnimals}
          value={stats.totalAnimals}
          subtitle={`${stats.totalCows} Cows • ${stats.totalBuffaloes} Buffaloes`}
          icon={Layers}
          accentColor="forest"
          onClick={() => router.push('/animals')}
        />

        {/* Today's Milk */}
        <StatCard
          title={t.todayMilk}
          value={`${stats.todayMilkProduction} L`}
          subtitle={`Avg Fat: ${stats.averageFat}%`}
          icon={Droplets}
          trend={{
            value: `${isYieldUp ? '+' : ''}${yieldTrendDiff} L`,
            isPositive: isYieldUp,
            label: t.vsYesterday,
          }}
          accentColor="fresh"
          onClick={() => router.push('/milk-records')}
        />

        {/* Monthly Milk */}
        <StatCard
          title={t.monthlyMilk}
          value={`${formatNumber(stats.monthlyMilkProduction, 0)} L`}
          subtitle="Past 30 days total"
          icon={Calendar}
          accentColor="blue"
          onClick={() => router.push('/milk-records')}
        />

        {/* Total Expenses */}
        <StatCard
          title={t.totalExpenses}
          value={formatINR(stats.totalExpenses)}
          subtitle="Feed, Vet & Labour"
          icon={Receipt}
          accentColor="rose"
          onClick={() => router.push('/expenses')}
        />

        {/* Total Sales */}
        <StatCard
          title={t.totalSales}
          value={formatINR(stats.totalMilkSales)}
          subtitle="Cooperative & Retail"
          icon={ShoppingCart}
          accentColor="purple"
          onClick={() => router.push('/expenses')}
        />

        {/* Net Profit */}
        <StatCard
          title={t.netProfit}
          value={formatINR(stats.netProfit)}
          subtitle={t.profitFormula}
          icon={TrendingUp}
          trend={{
            value: stats.netProfit >= 0 ? '+Profitable' : '-Deficit',
            isPositive: stats.netProfit >= 0,
          }}
          accentColor={stats.netProfit >= 0 ? 'fresh' : 'rose'}
          onClick={() => router.push('/reports')}
        />
      </div>

      {/* Quick Actions Row */}
      <QuickActions
        onOpenMilkModal={() => setIsMilkModalOpen(true)}
        onOpenAnimalModal={() => setIsAnimalModalOpen(true)}
        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        onOpenSaleModal={() => setIsSaleModalOpen(true)}
        onOpenAI={() => router.push('/ai-advisor')}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionChart records={milkRecords} />
        <RevenueExpenseChart expenses={expenses} sales={sales} />
      </div>

      {/* Bottom Insights: Top Yielders, Recent Transactions, Health Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimalYieldChart records={milkRecords} />
        <RecentTransactions expenses={expenses} sales={sales} />
        <HealthActivities animals={animals} />
      </div>

      {/* Modals */}
      <MilkEntryModal
        isOpen={isMilkModalOpen}
        onClose={() => setIsMilkModalOpen(false)}
        onSuccess={loadData}
      />
      <AnimalFormModal
        isOpen={isAnimalModalOpen}
        onClose={() => setIsAnimalModalOpen(false)}
        onSuccess={loadData}
      />
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={loadData}
      />
      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
