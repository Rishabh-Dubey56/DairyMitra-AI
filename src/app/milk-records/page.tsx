'use client';

import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Plus, 
  Calendar, 
  Trash2, 
  Search, 
  TrendingUp, 
  Filter, 
  BarChart3,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useLanguage } from '@/components/common/LanguageContext';
import { farmStore } from '@/lib/store';
import { MilkRecord, Animal } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { MilkEntryModal } from '@/components/milk/MilkEntryModal';

export default function MilkRecordsPage() {
  const { t, language } = useLanguage();

  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('ALL');
  const [viewTimeframe, setViewTimeframe] = useState<'all' | '7days' | '30days'>('7days');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = () => {
    setRecords(farmStore.getMilkRecords());
    setAnimals(farmStore.getAnimals());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairymitra_storage_updated', loadData);
    return () => window.removeEventListener('dairymitra_storage_updated', loadData);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this milk entry?')) {
      farmStore.deleteMilkRecord(id);
      loadData();
    }
  };

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.animalTag.toLowerCase().includes(search.toLowerCase()) ||
      r.animalName.toLowerCase().includes(search.toLowerCase());

    const matchesDate = !selectedDate || r.date === selectedDate;
    const matchesAnimal = selectedAnimalId === 'ALL' || r.animalId === selectedAnimalId;

    return matchesSearch && matchesDate && matchesAnimal;
  });

  // Calculate stats for current view
  const totalVolume = Math.round(filteredRecords.reduce((sum, r) => sum + r.totalQuantity, 0) * 10) / 10;
  const morningVolume = Math.round(filteredRecords.reduce((sum, r) => sum + r.morningQuantity, 0) * 10) / 10;
  const eveningVolume = Math.round(filteredRecords.reduce((sum, r) => sum + r.eveningQuantity, 0) * 10) / 10;
  const totalValue = filteredRecords.reduce((sum, r) => sum + r.totalAmount, 0);

  // Group for Bar Chart
  const dailyAgg: { [date: string]: { date: string; morning: number; evening: number; total: number } } = {};
  records.forEach((r) => {
    if (!dailyAgg[r.date]) {
      dailyAgg[r.date] = { date: r.date.substring(5), morning: 0, evening: 0, total: 0 };
    }
    dailyAgg[r.date].morning += r.morningQuantity;
    dailyAgg[r.date].evening += r.eveningQuantity;
    dailyAgg[r.date].total += r.totalQuantity;
  });

  const chartData = Object.keys(dailyAgg)
    .sort()
    .slice(viewTimeframe === '7days' ? -7 : -14)
    .map((k) => ({
      date: dailyAgg[k].date,
      morning: Math.round(dailyAgg[k].morning * 10) / 10,
      evening: Math.round(dailyAgg[k].evening * 10) / 10,
      total: Math.round(dailyAgg[k].total * 10) / 10,
    }));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.milkRecordsTitle}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.milkRecordsSubtitle}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-xs font-semibold text-white hover:bg-forest/90 transition-colors shadow-sm shadow-forest/20"
        >
          <Plus className="h-4 w-4" />
          <span>{t.logMilkEntry}</span>
        </button>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block">Total Volume</span>
          <p className="text-xl font-bold text-forest mt-0.5">{totalVolume} L</p>
          <span className="text-[10px] text-slate-500">{filteredRecords.length} session logs</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block">Morning Yield</span>
          <p className="text-xl font-bold text-emerald-800 mt-0.5">{morningVolume} L</p>
          <span className="text-[10px] text-slate-500">6:00 AM session</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block">Evening Yield</span>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">{eveningVolume} L</p>
          <span className="text-[10px] text-slate-500">5:00 PM session</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block">Calculated Value</span>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{formatINR(totalValue)}</p>
          <span className="text-[10px] text-slate-500">Gross milk worth</span>
        </div>
      </div>

      {/* Interactive Bar Chart for Yield Breakdown */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Production Trend by Milking Session</h3>
            <p className="text-xs text-slate-500">Morning and evening yield distribution over time</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTimeframe('7days')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewTimeframe === '7days' ? 'bg-forest text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setViewTimeframe('30days')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewTimeframe === '30days' ? 'bg-forest text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              14 Days
            </button>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const m = Number(payload[0]?.value || 0);
                    const e = Number(payload[1]?.value || 0);
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
                        <p className="font-bold text-slate-800 mb-1">Date: {label}</p>
                        <p className="text-emerald-800 font-semibold">{t.morning}: {m} L</p>
                        <p className="text-emerald-600 font-semibold">{t.evening}: {e} L</p>
                        <p className="font-bold text-slate-900 border-t border-slate-100 pt-1 mt-1">
                          Total: {m + e} L
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="morning" fill="#166534" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="evening" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tag (DM-101) or animal name..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
            />
          </div>

          <select
            value={selectedAnimalId}
            onChange={(e) => setSelectedAnimalId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 focus:border-forest focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Animals</option>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>
                {a.tagNumber} - {a.name} ({a.breed})
              </option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 focus:border-forest focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800">{filteredRecords.length}</strong> records
          </span>
          {(search || selectedDate || selectedAnimalId !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedDate('');
                setSelectedAnimalId('ALL');
              }}
              className="text-forest font-semibold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Animal</th>
                <th className="py-3 px-4">Morning (L)</th>
                <th className="py-3 px-4">Evening (L)</th>
                <th className="py-3 px-4">Total Yield</th>
                <th className="py-3 px-4">Fat / SNF</th>
                <th className="py-3 px-4">Rate (₹)</th>
                <th className="py-3 px-4">Calculated Value</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{formatDate(r.date, language)}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{r.animalName}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{r.animalTag}</div>
                  </td>
                  <td className="py-3 px-4 text-emerald-800 font-medium">{r.morningQuantity} L</td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">{r.eveningQuantity} L</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-forest text-sm">{r.totalQuantity} L</span>
                  </td>
                  <td className="py-3 px-4">
                    {r.fatPercentage ? (
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        {r.fatPercentage}% F / {r.snfPercentage || 8.5}%
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium">₹{r.ratePerLitre}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatINR(r.totalAmount)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">{t.noRecords}</div>
        )}
      </div>

      <MilkEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
