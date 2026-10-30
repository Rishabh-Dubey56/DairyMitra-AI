'use client';

import React from 'react';
import { PlusCircle, Droplets, Receipt, ShoppingCart, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/common/LanguageContext';

interface QuickActionsProps {
  onOpenMilkModal: () => void;
  onOpenAnimalModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenSaleModal: () => void;
  onOpenAI: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenMilkModal,
  onOpenAnimalModal,
  onOpenExpenseModal,
  onOpenSaleModal,
  onOpenAI,
}) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h3 className="text-sm font-bold text-slate-800 mb-3">{t.quickActions}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={onOpenMilkModal}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3.5 text-center transition-all hover:bg-emerald-100 hover:shadow-xs group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-white shadow-xs group-hover:scale-105 transition-transform">
            <Droplets className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-emerald-900">{t.addMilk}</span>
        </button>

        <button
          onClick={onOpenAnimalModal}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-center transition-all hover:bg-slate-100 hover:shadow-xs group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs group-hover:scale-105 transition-transform">
            <PlusCircle className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-slate-800">{t.registerAnimal}</span>
        </button>

        <button
          onClick={onOpenExpenseModal}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/50 p-3.5 text-center transition-all hover:bg-rose-100 hover:shadow-xs group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs group-hover:scale-105 transition-transform">
            <Receipt className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-rose-900">{t.recordExpense}</span>
        </button>

        <button
          onClick={onOpenSaleModal}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-blue-200/60 bg-blue-50/50 p-3.5 text-center transition-all hover:bg-blue-100 hover:shadow-xs group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition-transform">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-blue-900">{t.recordSale}</span>
        </button>

        <button
          onClick={onOpenAI}
          className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-linear-to-b from-emerald-600 to-green-700 p-3.5 text-center text-white transition-all hover:shadow-md group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-white">{t.askAI}</span>
        </button>
      </div>
    </div>
  );
};
