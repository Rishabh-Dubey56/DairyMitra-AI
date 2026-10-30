'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Layers,
  Droplets,
  Check
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
import { Animal, MilkRecord, Expense, Sale } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';

export default function ReportsPage() {
  const { t, language } = useLanguage();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [milkRecords, setMilkRecords] = useState<MilkRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('30days');
  const [reportType, setReportType] = useState<'production' | 'financial' | 'animals'>('production');
  const [exportNotice, setExportNotice] = useState(false);

  useEffect(() => {
    setAnimals(farmStore.getAnimals());
    setMilkRecords(farmStore.getMilkRecords());
    setExpenses(farmStore.getExpenses());
    setSales(farmStore.getSales());
  }, []);

  // Filter records based on date range
  const now = new Date();
  const getDaysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const cutoffDate = dateRange === '7days' ? getDaysAgo(7) : dateRange === '30days' ? getDaysAgo(30) : '2000-01-01';

  const filteredMilk = milkRecords.filter((r) => r.date >= cutoffDate);
  const filteredExpenses = expenses.filter((e) => e.date >= cutoffDate);
  const filteredSales = sales.filter((s) => s.date >= cutoffDate);

  // Financial calculations
  const totalVolume = Math.round(filteredMilk.reduce((sum, r) => sum + r.totalQuantity, 0) * 10) / 10;
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSales = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const netProfit = totalSales - totalExpenses;

  // Animal performance ranking
  const animalPerformance: { [tag: string]: { tag: string; name: string; breed: string; totalYield: number; avgYield: number; count: number } } = {};
  filteredMilk.forEach((r) => {
    if (!animalPerformance[r.animalTag]) {
      animalPerformance[r.animalTag] = {
        tag: r.animalTag,
        name: r.animalName,
        breed: animals.find((a) => a.tagNumber === r.animalTag)?.breed || 'Cattle',
        totalYield: 0,
        avgYield: 0,
        count: 0,
      };
    }
    animalPerformance[r.animalTag].totalYield += r.totalQuantity;
    animalPerformance[r.animalTag].count += 1;
  });

  const rankedAnimals = Object.values(animalPerformance)
    .map((a) => ({
      ...a,
      totalYield: Math.round(a.totalYield * 10) / 10,
      avgYield: Math.round((a.totalYield / (a.count || 1)) * 10) / 10,
    }))
    .sort((a, b) => b.totalYield - a.totalYield);

  // Chart data
  const chartData = rankedAnimals.slice(0, 8).map((a) => ({
    name: a.name,
    tag: a.tag,
    yield: a.totalYield,
  }));

  // CSV Export Functionality
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (reportType === 'production') {
      csvContent += "Date,Animal Tag,Animal Name,Morning (L),Evening (L),Total (L),Fat %,Rate (INR),Total Value (INR)\n";
      filteredMilk.forEach((r) => {
        csvContent += `"${r.date}","${r.animalTag}","${r.animalName}",${r.morningQuantity},${r.eveningQuantity},${r.totalQuantity},${r.fatPercentage || ''},${r.ratePerLitre},${r.totalAmount}\n`;
      });
    } else if (reportType === 'financial') {
      csvContent += "Type,Date,Description/Buyer,Category,Amount (INR),Payment Status\n";
      filteredSales.forEach((s) => {
        csvContent += `"Sale","${s.date}","${s.buyerName}","Milk Dispatch",${s.totalAmount},"${s.paymentStatus}"\n`;
      });
      filteredExpenses.forEach((e) => {
        csvContent += `"Expense","${e.date}","${e.title}","${e.category}",${e.amount},"Paid"\n`;
      });
    } else {
      csvContent += "Tag Number,Name,Breed,Total Milk Yield (L),Average Daily Yield (L),Logged Days\n";
      rankedAnimals.forEach((a) => {
        csvContent += `"${a.tag}","${a.name}","${a.breed}",${a.totalYield},${a.avgYield},${a.count}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DairyMitra_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print-area">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.reportsTitle}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.reportsSubtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>{t.exportCSV}</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest/90 transition-colors shadow-sm shadow-forest/20"
          >
            <Printer className="h-4 w-4" />
            <span>{t.exportPDF}</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200 no-print">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>Report CSV downloaded successfully!</span>
        </div>
      )}

      {/* Report Controls (Type and Timeframe) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportType('production')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
              reportType === 'production'
                ? 'bg-forest text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Milk Production Logs
          </button>
          <button
            onClick={() => setReportType('financial')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
              reportType === 'financial'
                ? 'bg-forest text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Profit & Loss Summary
          </button>
          <button
            onClick={() => setReportType('animals')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
              reportType === 'animals'
                ? 'bg-forest text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Livestock Performance
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Range:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none"
          >
            <option value="7days">{t.last7Days}</option>
            <option value="30days">{t.last30Days}</option>
            <option value="all">{t.allTime}</option>
          </select>
        </div>
      </div>

      {/* KPI Cards for the selected period */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block">Period Production</span>
          <p className="text-xl font-bold text-forest mt-0.5">{totalVolume} L</p>
          <span className="text-[10px] text-slate-500">{filteredMilk.length} entries</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block">Total Revenue</span>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{formatINR(totalSales)}</p>
          <span className="text-[10px] text-slate-500">Gross sales</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block">Total Expenses</span>
          <p className="text-xl font-bold text-rose-600 mt-0.5">{formatINR(totalExpenses)}</p>
          <span className="text-[10px] text-slate-500">Farm overheads</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block">Period Net Profit</span>
          <p className={`text-xl font-bold mt-0.5 ${netProfit >= 0 ? 'text-forest' : 'text-rose-600'}`}>
            {formatINR(netProfit)}
          </p>
          <span className="text-[10px] text-slate-500">Sales - Expenses</span>
        </div>
      </div>

      {/* Printable Report Header for Official Export */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">DairyMitra AI - Farm Performance Report</h1>
            <p className="text-xs text-slate-600">Gokul Dairy Farm • Karnal, Haryana • Reg: HR-DAIRY-2024-8841</p>
          </div>
          <div className="text-right text-xs">
            <p><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Period:</strong> {dateRange.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          {reportType === 'production' && 'Daily Milk Yield Distribution'}
          {reportType === 'financial' && 'Income vs Operating Expenses'}
          {reportType === 'animals' && 'Top Producing Livestock (Litres in Period)'}
        </h3>
        <p className="text-xs text-slate-500 mb-4">Visual analytics for selected reporting interval</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(val) => `${val} L`} />
              <Bar dataKey="yield" fill="#166534" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dynamic Data Table based on Report Type */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            {reportType === 'production' && 'Detailed Milk Production Entries'}
            {reportType === 'financial' && 'Consolidated Financial Ledgers'}
            {reportType === 'animals' && 'Livestock Yield Rankings'}
          </h3>
          <span className="text-xs text-slate-400">Official Farm Record</span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'production' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Tag #</th>
                  <th className="py-2.5 px-3">Animal</th>
                  <th className="py-2.5 px-3">Morning</th>
                  <th className="py-2.5 px-3">Evening</th>
                  <th className="py-2.5 px-3">Total Yield</th>
                  <th className="py-2.5 px-3">Fat %</th>
                  <th className="py-2.5 px-3 text-right">Value (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredMilk.slice(0, 25).map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-3 font-semibold">{formatDate(r.date, language)}</td>
                    <td className="py-2.5 px-3 font-mono">{r.animalTag}</td>
                    <td className="py-2.5 px-3">{r.animalName}</td>
                    <td className="py-2.5 px-3">{r.morningQuantity} L</td>
                    <td className="py-2.5 px-3">{r.eveningQuantity} L</td>
                    <td className="py-2.5 px-3 font-bold text-forest">{r.totalQuantity} L</td>
                    <td className="py-2.5 px-3">{r.fatPercentage || 4.5}%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(r.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'financial' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Transaction</th>
                  <th className="py-2.5 px-3">Party / Cooperative</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold">{formatDate(s.date, language)}</td>
                    <td className="py-2.5 px-3 font-medium">Milk Dispatch ({s.quantityLiters}L)</td>
                    <td className="py-2.5 px-3">{s.buyerName}</td>
                    <td className="py-2.5 px-3">Milk Sales</td>
                    <td className="py-2.5 px-3"><span className="text-emerald-700 font-bold">Revenue</span></td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">+{formatINR(s.totalAmount)}</td>
                  </tr>
                ))}
                {filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold">{formatDate(e.date, language)}</td>
                    <td className="py-2.5 px-3 font-medium">{e.title}</td>
                    <td className="py-2.5 px-3">{e.paidTo || '-'}</td>
                    <td className="py-2.5 px-3">{e.category}</td>
                    <td className="py-2.5 px-3"><span className="text-rose-600 font-bold">Expense</span></td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600">-{formatINR(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'animals' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Tag #</th>
                  <th className="py-2.5 px-3">Animal Name</th>
                  <th className="py-2.5 px-3">Breed</th>
                  <th className="py-2.5 px-3">Total Production</th>
                  <th className="py-2.5 px-3">Average Yield</th>
                  <th className="py-2.5 px-3 text-right">Performance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {rankedAnimals.map((a, idx) => (
                  <tr key={a.tag}>
                    <td className="py-2.5 px-3 font-bold text-slate-600">#{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold">{a.tag}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{a.name}</td>
                    <td className="py-2.5 px-3">{a.breed}</td>
                    <td className="py-2.5 px-3 font-bold text-forest">{a.totalYield} L</td>
                    <td className="py-2.5 px-3 font-medium">{a.avgYield} L/day</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        idx < 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {idx < 3 ? 'Top Performer' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
