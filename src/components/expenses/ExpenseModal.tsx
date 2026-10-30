'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Receipt, Check } from 'lucide-react';
import { Expense, ExpenseCategory } from '@/lib/types';
import { useLanguage } from '@/components/common/LanguageContext';
import { farmStore } from '@/lib/store';

const expenseSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  category: z.enum([
    'Animal Feed',
    'Veterinary & Medicine',
    'Labour',
    'Transportation',
    'Electricity & Water',
    'Equipment & Maintenance',
    'Other',
  ]),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  date: z.string().min(4, 'Date is required'),
  paidTo: z.string().optional(),
  paymentMethod: z.enum(['Cash', 'UPI', 'Bank Transfer', 'Credit']),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [success, setSuccess] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      category: 'Animal Feed',
      amount: 5000,
      date: todayStr,
      paidTo: '',
      paymentMethod: 'UPI',
      notes: '',
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    const expense: Expense = {
      id: `exp-${Date.now()}`,
      title: data.title.trim(),
      category: data.category as ExpenseCategory,
      amount: Number(data.amount),
      date: data.date,
      paidTo: data.paidTo?.trim() || undefined,
      paymentMethod: data.paymentMethod,
      notes: data.notes?.trim() || undefined,
    };

    farmStore.saveExpense(expense);
    setSuccess(true);
    setTimeout(() => {
      onSuccess?.();
      onClose();
      reset();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-50 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-modal-slide-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.addExpense}</h3>
              <p className="text-xs text-slate-500">Record operating costs for feeds, medicines, or labour</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Expense recorded successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.description} *</label>
            <input
              type="text"
              placeholder="e.g. 20 Bags of Balanced Cattle Feed Pellets"
              {...register('title')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
            />
            {errors.title && <p className="text-[10px] text-rose-500 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.category} *</label>
              <select
                {...register('category')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              >
                <option value="Animal Feed">Animal Feed (पशु आहार)</option>
                <option value="Veterinary & Medicine">Veterinary & Medicine (दवा / इलाज)</option>
                <option value="Labour">Labour Wages (मजदूरी)</option>
                <option value="Transportation">Transportation (परिवहन)</option>
                <option value="Electricity & Water">Electricity & Water (बिजली / पानी)</option>
                <option value="Equipment & Maintenance">Equipment & Maintenance (उपकरण)</option>
                <option value="Other">Other (अन्य)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.amount} (₹) *</label>
              <input
                type="number"
                {...register('amount', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
              {errors.amount && <p className="text-[10px] text-rose-500 mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.date} *</label>
              <input
                type="date"
                {...register('date')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.paymentMethod}</label>
              <select
                {...register('paymentMethod')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              >
                <option value="UPI">UPI (PhonePe / GPay / Paytm)</option>
                <option value="Cash">Cash (नकद)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="Credit">Credit (उधार)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paid To / Vendor Name</label>
            <input
              type="text"
              placeholder="e.g. Kisan Agro Agency or Dr. Sharma"
              {...register('paidTo')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Invoice #2938, includes GST"
              {...register('notes')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700"
            >
              {t.recordExpense}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
