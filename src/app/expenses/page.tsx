'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Receipt, 
  ShoppingCart, 
  Trash2, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { useLanguage } from '@/components/common/LanguageContext';
import { farmStore } from '@/lib/store';
import { Expense, Sale, ExpenseCategory, PaymentStatus } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { SaleModal } from '@/components/expenses/SaleModal';

const CATEGORY_COLORS: { [key: string]: string } = {
  'Animal Feed': '#166534',
  'Veterinary & Medicine': '#0ea5e9',
  'Labour': '#f59e0b',
  'Transportation': '#8b5cf6',
  'Electricity & Water': '#ec4899',
  'Equipment & Maintenance': '#64748b',
  'Other': '#94a3b8',
};

export default function ExpensesPage() {
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'expenses' | 'sales'>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  const loadData = () => {
    setExpenses(farmStore.getExpenses());
    setSales(farmStore.getSales());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairymitra_storage_updated', loadData);
    return () => window.removeEventListener('dairymitra_storage_updated', loadData);
  }, []);

  const handleDeleteExpense = (id: string) => {
    if (confirm('Delete this expense?')) {
      farmStore.deleteExpense(id);
      loadData();
    }
  };

  const handleDeleteSale = (id: string) => {
    if (confirm('Delete this sale record?')) {
      farmStore.deleteSale(id);
      loadData();
    }
  };

  // Financial totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const netProfit = totalSales - totalExpenses;

  // Filtered lists
  const filteredExpenses = expenses.filter((e) => {
    return categoryFilter === 'ALL' || e.category === categoryFilter;
  });

  const filteredSales = sales.filter((s) => {
    return statusFilter === 'ALL' || s.paymentStatus === statusFilter;
  });

  // Category breakdown for pie chart
  const categoryTotals: { [cat: string]: number } = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const pieData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat],
    color: CATEGORY_COLORS[cat] || '#166534',
  }));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.financesTitle}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.financesSubtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs"
          >
            <Receipt className="h-4 w-4" />
            <span>{t.addExpense}</span>
          </button>

          <button
            onClick={() => setIsSaleModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest/90 transition-colors shadow-sm shadow-forest/20"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{t.addSale}</span>
          </button>
        </div>
      </div>

      {/* Financial Overview 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Milk Sales</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatINR(totalSales)}</p>
          <span className="text-xs text-slate-500">{sales.length} transactions recorded</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Expenses</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">{formatINR(totalExpenses)}</p>
          <span className="text-xs text-slate-500">{expenses.length} expense vouchers</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Net Farm Profit</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-forest' : 'text-rose-600'}`}>
            {formatINR(netProfit)}
          </p>
          <span className="text-xs text-slate-500">Sales minus farm expenses</span>
        </div>
      </div>

      {/* Cost Breakdown & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Expense Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown by operational cost category</p>
          
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatINR(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-1.5 text-xs">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 truncate max-w-[140px]">{d.name}</span>
                </div>
                <span className="font-bold text-slate-800">{formatINR(d.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabbed Transactions (Expenses / Sales) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                  activeTab === 'expenses'
                    ? 'bg-forest text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.expenseTab} ({expenses.length})
              </button>

              <button
                onClick={() => setActiveTab('sales')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                  activeTab === 'sales'
                    ? 'bg-forest text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.salesTab} ({sales.length})
              </button>
            </div>

            {/* Filter Dropdown */}
            {activeTab === 'expenses' ? (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Animal Feed">Animal Feed</option>
                <option value="Veterinary & Medicine">Veterinary & Medicine</option>
                <option value="Labour">Labour</option>
                <option value="Transportation">Transportation</option>
                <option value="Electricity & Water">Electricity & Water</option>
                <option value="Equipment & Maintenance">Equipment</option>
              </select>
            ) : (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Payment Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            )}
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto">
            {activeTab === 'expenses' ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Vendor / Paid To</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{formatDate(e.date, language)}</td>
                      <td className="py-2.5 px-3 font-medium">{e.title}</td>
                      <td className="py-2.5 px-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{e.paidTo || '-'}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600">{formatINR(e.amount)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteExpense(e.id)}
                          className="rounded-lg p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Buyer / Cooperative</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Rate</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Revenue (₹)</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{formatDate(s.date, language)}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{s.buyerName}</td>
                      <td className="py-2.5 px-3 font-medium text-forest">{s.quantityLiters} L</td>
                      <td className="py-2.5 px-3">₹{s.ratePerLitre}/L</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            s.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.paymentStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{formatINR(s.totalAmount)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteSale(s.id)}
                          className="rounded-lg p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

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
