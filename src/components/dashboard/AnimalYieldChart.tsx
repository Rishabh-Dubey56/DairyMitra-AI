'use client';

import React from 'react';
import { MilkRecord } from '@/lib/types';
import { useLanguage } from '@/components/common/LanguageContext';
import { Droplet, Award } from 'lucide-react';

interface AnimalYieldChartProps {
  records: MilkRecord[];
}

export const AnimalYieldChart: React.FC<AnimalYieldChartProps> = ({ records }) => {
  const { t } = useLanguage();

  // Find latest date in records
  const latestDate = records.length > 0 ? records[0].date : '';
  const latestRecords = records.filter((r) => r.date === latestDate);

  // Sort descending by total quantity
  const topYielders = [...latestRecords]
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);

  const maxCapacity = topYielders.length > 0 ? topYielders[0].totalQuantity : 20;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">{t.yieldByAnimal}</h3>
          <p className="text-xs text-slate-500">Highest daily producers on {latestDate || 'today'}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Award className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-3.5">
        {topYielders.map((item, index) => {
          const percentage = Math.min(100, Math.round((item.totalQuantity / maxCapacity) * 100));

          return (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                    #{index + 1}
                  </span>
                  <span className="font-bold text-slate-800">{item.animalName}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    {item.animalTag}
                  </span>
                  {item.fatPercentage && (
                    <span className="text-[10px] text-emerald-700 font-medium">
                      {item.fatPercentage}% Fat
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 font-bold text-forest">
                  <Droplet className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{item.totalQuantity} L</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-600 to-green-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400">
                <span>M: {item.morningQuantity}L / E: {item.eveningQuantity}L</span>
                <span>₹{item.totalAmount} est.</span>
              </div>
            </div>
          );
        })}

        {topYielders.length === 0 && (
          <p className="text-xs text-slate-400 py-6 text-center">{t.noRecords}</p>
        )}
      </div>
    </div>
  );
};
