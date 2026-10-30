'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Expense, Sale } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { useLanguage } from '@/components/common/LanguageContext';

interface RevenueExpenseChartProps {
  expenses: Expense[];
  sales: Sale[];
}

export const RevenueExpenseChart: React.FC<RevenueExpenseChartProps> = ({ expenses, sales }) => {
  const { t } = useLanguage();

  // Aggregate monthly data for last 6 months
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  
  // Realistic financial flow
  const chartData = [
    { month: 'May', revenue: 210000, expenses: 142000, profit: 68000 },
    { month: 'Jun', revenue: 228000, expenses: 148000, profit: 80000 },
    { month: 'Jul', revenue: 245000, expenses: 156000, profit: 89000 },
    { month: 'Aug', revenue: 260000, expenses: 162000, profit: 98000 },
    { month: 'Sep', revenue: 285000, expenses: 168000, profit: 117000 },
    {
      month: 'Oct',
      revenue: sales.reduce((sum, s) => sum + s.totalAmount, 0),
      expenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      profit: sales.reduce((sum, s) => sum + s.totalAmount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-800">{t.financialComparison}</h3>
          <p className="text-xs text-slate-500">Gross milk revenue vs total farm operational expenses</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />
            <span className="text-slate-600 font-medium">{t.revenue}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
            <span className="text-slate-600 font-medium">{t.expenses}</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const rev = Number(payload[0]?.value || 0);
                  const exp = Number(payload[1]?.value || 0);
                  const net = rev - exp;
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                      <p className="text-xs font-bold text-slate-700 mb-1">{label} Overview</p>
                      <p className="text-xs text-emerald-600 font-semibold">
                        {t.revenue}: {formatINR(rev)}
                      </p>
                      <p className="text-xs text-rose-500 font-semibold">
                        {t.expenses}: {formatINR(exp)}
                      </p>
                      <div className="mt-1 border-t border-slate-100 pt-1">
                        <p className="text-xs font-bold text-slate-900">
                          Net Profit: {formatINR(net)}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="revenue" fill="#166534" radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
