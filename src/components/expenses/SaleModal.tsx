'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, ShoppingCart, Check } from 'lucide-react';
import { Sale, PaymentStatus } from '@/lib/types';
import { useLanguage } from '@/components/common/LanguageContext';
import { farmStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';

const saleSchema = z.object({
  buyerName: z.string().min(2, 'Buyer name is required'),
  contact: z.string().optional(),
  quantityLiters: z.number().min(1, 'Quantity must be at least 1L'),
  ratePerLitre: z.number().min(1, 'Price per litre is required'),
  date: z.string().min(4, 'Date is required'),
  paymentStatus: z.enum(['Paid', 'Pending', 'Partial']),
  paymentMethod: z.enum(['UPI', 'Cash', 'Bank Transfer']).optional(),
  notes: z.string().optional(),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SaleModal: React.FC<SaleModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [success, setSuccess] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      buyerName: 'Amul Dairy Cooperative Society',
      contact: '+91 94160 11223',
      quantityLiters: 150,
      ratePerLitre: 56,
      date: todayStr,
      paymentStatus: 'Paid',
      paymentMethod: 'Bank Transfer',
      notes: '',
    },
  });

  const watchedQty = watch('quantityLiters') || 0;
  const watchedRate = watch('ratePerLitre') || 0;
  const calculatedTotal = Math.round(Number(watchedQty) * Number(watchedRate));

  const onSubmit = (data: SaleFormData) => {
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      buyerName: data.buyerName.trim(),
      contact: data.contact?.trim() || undefined,
      quantityLiters: Number(data.quantityLiters),
      ratePerLitre: Number(data.ratePerLitre),
      totalAmount: Math.round(Number(data.quantityLiters) * Number(data.ratePerLitre)),
      date: data.date,
      paymentStatus: data.paymentStatus as PaymentStatus,
      paymentMethod: data.paymentMethod,
      notes: data.notes?.trim() || undefined,
    };

    farmStore.saveSale(sale);
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.addSale}</h3>
              <p className="text-xs text-slate-500">Record milk dispatch to dairy collection centre or vendor</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Milk sale recorded successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.buyer} *</label>
            <input
              type="text"
              placeholder="e.g. Amul Dairy Cooperative Society or Local Dairy"
              {...register('buyerName')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
            />
            {errors.buyerName && <p className="text-[10px] text-rose-500 mt-1">{errors.buyerName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact / Center Phone</label>
              <input
                type="text"
                placeholder="+91 94160 11223"
                {...register('contact')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.date} *</label>
              <input
                type="date"
                {...register('date')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity Sold (Litres) *</label>
              <input
                type="number"
                step="0.5"
                {...register('quantityLiters', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
              {errors.quantityLiters && <p className="text-[10px] text-rose-500 mt-1">{errors.quantityLiters.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Rate (₹ / Litre) *</label>
              <input
                type="number"
                step="0.5"
                {...register('ratePerLitre', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
              {errors.ratePerLitre && <p className="text-[10px] text-rose-500 mt-1">{errors.ratePerLitre.message}</p>}
            </div>
          </div>

          {/* Total Calculation Display */}
          <div className="flex items-center justify-between rounded-xl bg-blue-50/70 p-3.5 border border-blue-100">
            <div>
              <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                Total Quantity
              </span>
              <span className="text-xl font-bold text-blue-950">
                {watchedQty} <span className="text-xs font-normal">Litres</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                Total Revenue
              </span>
              <span className="text-xl font-bold text-blue-700">
                {formatINR(calculatedTotal)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.paymentStatus}</label>
              <select
                {...register('paymentStatus')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              >
                <option value="Paid">{t.paid}</option>
                <option value="Pending">{t.pending}</option>
                <option value="Partial">{t.partial}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.paymentMethod}</label>
              <select
                {...register('paymentMethod')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI (PhonePe / GPay)</option>
                <option value="Cash">Cash (नकद)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Milk fat test 6.4%, dispatched via morning van"
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
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
            >
              {t.addSale}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
