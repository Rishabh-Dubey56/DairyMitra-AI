'use client';

import React from 'react';
import Link from 'next/link';
import { Expense, Sale } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { useLanguage } from '@/components/common/LanguageContext';
import { ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react';

interface RecentTransactionsProps {
  expenses: Expense[];
  sales: Sale[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ expenses, sales }) => {
  const { t, language } = useLanguage();

  // Combine and sort latest 5 transactions
  interface CombinedTx {
    id: string;
    title: string;
    type: 'Sale' | 'Expense';
    amount: number;
    date: string;
    party: string;
    status: string;
  }

  const combined: CombinedTx[] = [
    ...sales.map((s) => ({
      id: s.id,
      title: `Milk Sale (${s.quantityLiters}L)`,
      type: 'Sale' as const,
      amount: s.totalAmount,
      date: s.date,
      party: s.buyerName,
      status: s.paymentStatus,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      title: e.title,
      type: 'Expense' as const,
      amount: e.amount,
      date: e.date,
      party: e.paidTo || e.category,
      status: 'Paid',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">{t.recentTransactions}</h3>
          <p className="text-xs text-slate-500">Latest recorded income and farm expenses</p>
        </div>
        <Link
          href="/expenses"
          className="flex items-center gap-1 text-xs font-semibold text-forest hover:underline"
        >
          <span>{t.viewAll}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {combined.map((tx) => {
          const isSale = tx.type === 'Sale';

          return (
            <div key={tx.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isSale ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {isSale ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-800">{tx.title}</p>
                  <p className="truncate text-[11px] text-slate-500">{tx.party} • {formatDate(tx.date, language)}</p>
                </div>
              </div>

              <div className="text-right shrink-0 pl-3">
                <p
                  className={`text-xs font-bold ${
                    isSale ? 'text-emerald-700' : 'text-slate-800'
                  }`}
                >
                  {isSale ? '+' : '-'}{formatINR(tx.amount)}
                </p>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    tx.status === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700'
                      : tx.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          );
        })}

        {combined.length === 0 && (
          <p className="text-xs text-slate-400 py-6 text-center">{t.noRecords}</p>
        )}
      </div>
    </div>
  );
};
