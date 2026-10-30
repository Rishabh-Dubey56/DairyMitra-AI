'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MilkRecord } from '@/lib/types';
import { useLanguage } from '@/components/common/LanguageContext';

interface ProductionChartProps {
  records: MilkRecord[];
}

export const ProductionChart: React.FC<ProductionChartProps> = ({ records }) => {
  const { t } = useLanguage();

  // Aggregate daily records
  const dailyMap: { [date: string]: { date: string; morning: number; evening: number; total: number } } = {};

  records.forEach((r) => {
    if (!dailyMap[r.date]) {
      dailyMap[r.date] = {
        date: r.date.substring(5), // MM-DD
        morning: 0,
        evening: 0,
        total: 0,
      };
    }
    dailyMap[r.date].morning += r.morningQuantity;
    dailyMap[r.date].evening += r.eveningQuantity;
    dailyMap[r.date].total += r.totalQuantity;
  });

  const chartData = Object.keys(dailyMap)
    .sort()
    .slice(-14)
    .map((d) => ({
      date: dailyMap[d].date,
      morning: Math.round(dailyMap[d].morning * 10) / 10,
      evening: Math.round(dailyMap[d].evening * 10) / 10,
      total: Math.round(dailyMap[d].total * 10) / 10,
    }));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-800">{t.dailyMilkTrend}</h3>
          <p className="text-xs text-slate-500">Morning and evening yield comparison across the herd</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-700" />
            <span className="text-slate-600 font-medium">{t.morning}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-600 font-medium">{t.evening}</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="morningGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#166534" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#166534" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="eveningGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                      <p className="text-xs font-bold text-slate-700 mb-1">Date: {label}</p>
                      <p className="text-xs text-emerald-800 font-semibold">
                        {t.morning}: {payload[0]?.value} L
                      </p>
                      <p className="text-xs text-emerald-600 font-semibold">
                        {t.evening}: {payload[1]?.value} L
                      </p>
                      <div className="mt-1 border-t border-slate-100 pt-1">
                        <p className="text-xs font-bold text-slate-900">
                          Total: {Number(payload[0]?.value || 0) + Number(payload[1]?.value || 0)} L
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="morning"
              stroke="#166534"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#morningGrad)"
            />
            <Area
              type="monotone"
              dataKey="evening"
              stroke="#22c55e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#eveningGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
