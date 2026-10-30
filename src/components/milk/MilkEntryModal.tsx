'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Droplets, AlertCircle, Check } from 'lucide-react';
import { Animal, MilkRecord } from '@/lib/types';
import { useLanguage } from '@/components/common/LanguageContext';
import { farmStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';

const milkSchema = z.object({
  animalId: z.string().min(1, 'Please select an animal'),
  date: z.string().min(1, 'Please select a date'),
  morningQuantity: z.number().min(0, 'Must be positive').max(50, 'Max 50L'),
  eveningQuantity: z.number().min(0, 'Must be positive').max(50, 'Max 50L'),
  fatPercentage: z.number().min(0).max(15).optional(),
  snfPercentage: z.number().min(0).max(15).optional(),
  ratePerLitre: z.number().min(1, 'Rate is required'),
  notes: z.string().optional(),
});

type MilkFormData = z.infer<typeof milkSchema>;

interface MilkEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialAnimalId?: string;
}

export const MilkEntryModal: React.FC<MilkEntryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialAnimalId,
}) => {
  const { t } = useLanguage();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MilkFormData>({
    resolver: zodResolver(milkSchema),
    defaultValues: {
      animalId: initialAnimalId || '',
      date: todayStr,
      morningQuantity: 7.0,
      eveningQuantity: 6.5,
      ratePerLitre: 45,
      fatPercentage: 4.5,
      snfPercentage: 8.5,
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      const list = farmStore.getAnimals();
      setAnimals(list);
      if (initialAnimalId) {
        setValue('animalId', initialAnimalId);
        const selected = list.find((a) => a.id === initialAnimalId);
        if (selected) {
          setValue('ratePerLitre', selected.type === 'Buffalo' ? 65 : 44);
          setValue('fatPercentage', selected.type === 'Buffalo' ? 7.6 : 4.4);
        }
      } else if (list.length > 0 && !watch('animalId')) {
        setValue('animalId', list[0].id);
        setValue('ratePerLitre', list[0].type === 'Buffalo' ? 65 : 44);
        setValue('fatPercentage', list[0].type === 'Buffalo' ? 7.6 : 4.4);
      }
      setDuplicateWarning(null);
      setSuccessMessage(false);
    }
  }, [isOpen, initialAnimalId, setValue]);

  const watchedAnimalId = watch('animalId');
  const watchedDate = watch('date');
  const watchedMorning = watch('morningQuantity') || 0;
  const watchedEvening = watch('eveningQuantity') || 0;
  const watchedRate = watch('ratePerLitre') || 45;

  const totalCalculated = Math.round((Number(watchedMorning) + Number(watchedEvening)) * 10) / 10;
  const estimatedAmount = Math.round(totalCalculated * Number(watchedRate));

  // Check duplicate on change
  useEffect(() => {
    if (watchedAnimalId && watchedDate) {
      const records = farmStore.getMilkRecords();
      const existing = records.find((r) => r.animalId === watchedAnimalId && r.date === watchedDate);
      if (existing) {
        setDuplicateWarning(`A record for this animal on ${watchedDate} already exists (${existing.totalQuantity}L).`);
      } else {
        setDuplicateWarning(null);
      }
    }
  }, [watchedAnimalId, watchedDate]);

  const handleAnimalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setValue('animalId', id);
    const chosen = animals.find((a) => a.id === id);
    if (chosen) {
      setValue('ratePerLitre', chosen.type === 'Buffalo' ? 65 : 44);
      setValue('fatPercentage', chosen.type === 'Buffalo' ? 7.6 : 4.4);
    }
  };

  const onSubmit = (data: MilkFormData) => {
    const chosen = animals.find((a) => a.id === data.animalId);
    if (!chosen) return;

    const record: MilkRecord = {
      id: `mr-${Date.now()}`,
      animalId: chosen.id,
      animalTag: chosen.tagNumber,
      animalName: chosen.name,
      date: data.date,
      morningQuantity: Number(data.morningQuantity),
      eveningQuantity: Number(data.eveningQuantity),
      totalQuantity: Math.round((Number(data.morningQuantity) + Number(data.eveningQuantity)) * 10) / 10,
      fatPercentage: data.fatPercentage ? Number(data.fatPercentage) : undefined,
      snfPercentage: data.snfPercentage ? Number(data.snfPercentage) : undefined,
      ratePerLitre: Number(data.ratePerLitre),
      totalAmount: Math.round(totalCalculated * Number(data.ratePerLitre)),
      notes: data.notes,
    };

    const res = farmStore.saveMilkRecord(record);
    if (!res.success && res.duplicate) {
      setDuplicateWarning(t.duplicateWarning);
      return;
    }

    setSuccessMessage(true);
    setTimeout(() => {
      onSuccess?.();
      onClose();
      reset();
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-50 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-modal-slide-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.logMilkEntry}</h3>
              <p className="text-xs text-slate-500">Record morning and evening production session</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {duplicateWarning && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>{duplicateWarning}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Milk record saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Animal Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.selectAnimal}</label>
              <select
                {...register('animalId')}
                onChange={handleAnimalChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest"
              >
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.tagNumber} - {a.name} ({a.type}, {a.breed})
                  </option>
                ))}
              </select>
              {errors.animalId && <p className="text-[10px] text-rose-500 mt-1">{errors.animalId.message}</p>}
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.selectDate}</label>
              <input
                type="date"
                {...register('date')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest"
              />
              {errors.date && <p className="text-[10px] text-rose-500 mt-1">{errors.date.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Morning Yield */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.morningLiters}</label>
              <input
                type="number"
                step="0.1"
                {...register('morningQuantity', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
              {errors.morningQuantity && <p className="text-[10px] text-rose-500 mt-1">{errors.morningQuantity.message}</p>}
            </div>

            {/* Evening Yield */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.eveningLiters}</label>
              <input
                type="number"
                step="0.1"
                {...register('eveningQuantity', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
              {errors.eveningQuantity && <p className="text-[10px] text-rose-500 mt-1">{errors.eveningQuantity.message}</p>}
            </div>
          </div>

          {/* Quality and Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.fatPercentage}</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 4.5"
                {...register('fatPercentage', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.snfPercentage}</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 8.5"
                {...register('snfPercentage', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.pricePerLiter}</label>
              <input
                type="number"
                step="0.5"
                {...register('ratePerLitre', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Total Preview Box */}
          <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-100">
            <div>
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                {t.totalYield}
              </span>
              <span className="text-xl font-bold text-forest">
                {totalCalculated} <span className="text-xs font-normal">Litres</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                {t.calculatedRevenue}
              </span>
              <span className="text-xl font-bold text-emerald-700">
                {formatINR(estimatedAmount)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Remarks (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Fed additional bypass fat, normal milk texture"
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
              disabled={isSubmitting || !!duplicateWarning}
              className="rounded-xl bg-forest px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-forest/20 hover:bg-forest/90 disabled:opacity-50"
            >
              {t.saveEntry}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
