'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Layers, Check } from 'lucide-react';
import { Animal, AnimalType, HealthStatus, Breed } from '@/lib/types';
import { useLanguage } from '@/components/common/LanguageContext';
import { farmStore } from '@/lib/store';

const animalSchema = z.object({
  tagNumber: z.string().min(2, 'Tag ID is required (e.g. DM-111)'),
  name: z.string().min(2, 'Name is required'),
  type: z.enum(['Cow', 'Buffalo']),
  breed: z.string().min(2, 'Breed is required'),
  dob: z.string().min(4, 'DOB is required'),
  purchasePrice: z.number().min(0, 'Enter valid price'),
  weight: z.number().min(50, 'Weight in kg'),
  healthStatus: z.enum(['Healthy', 'Lactating', 'Pregnant', 'Dry', 'Sick', 'Under Treatment']),
  milkCapacity: z.number().min(0, 'Capacity in L/day'),
  feedType: z.string().optional(),
  imageUrl: z.string().optional(),
  notes: z.string().optional(),
});

type AnimalFormData = z.infer<typeof animalSchema>;

interface AnimalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  animalToEdit?: Animal | null;
}

const cowBreeds: Breed[] = ['Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Kankrej', 'Rathi', 'HF Cross', 'Jersey Cross'];
const buffaloBreeds: Breed[] = ['Murrah', 'Nili-Ravi', 'Jaffarabadi', 'Surti', 'Mehsana'];

export const AnimalFormModal: React.FC<AnimalFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  animalToEdit,
}) => {
  const { t } = useLanguage();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      tagNumber: 'DM-',
      name: '',
      type: 'Cow',
      breed: 'Gir',
      dob: '2022-01-01',
      purchasePrice: 65000,
      weight: 420,
      healthStatus: 'Lactating',
      milkCapacity: 15,
      feedType: 'Green Napier + Wheat Straw + 4kg Cattle Pellet',
      imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80',
      notes: '',
    },
  });

  const watchedType = watch('type');

  useEffect(() => {
    if (isOpen) {
      if (animalToEdit) {
        reset({
          tagNumber: animalToEdit.tagNumber,
          name: animalToEdit.name,
          type: animalToEdit.type,
          breed: animalToEdit.breed,
          dob: animalToEdit.dob,
          purchasePrice: animalToEdit.purchasePrice,
          weight: animalToEdit.weight,
          healthStatus: animalToEdit.healthStatus,
          milkCapacity: animalToEdit.milkCapacity,
          feedType: animalToEdit.feeding?.feedType || '',
          imageUrl: animalToEdit.imageUrl,
          notes: animalToEdit.notes || '',
        });
      } else {
        const existing = farmStore.getAnimals();
        const nextNum = 101 + existing.length;
        reset({
          tagNumber: `DM-${nextNum}`,
          name: '',
          type: 'Cow',
          breed: 'Gir',
          dob: '2022-04-15',
          purchasePrice: 65000,
          weight: 420,
          healthStatus: 'Lactating',
          milkCapacity: 15,
          feedType: 'Green Fodder (Napier) + Dry Straw + Balanced Pellets',
          imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80',
          notes: '',
        });
      }
      setSuccess(false);
    }
  }, [isOpen, animalToEdit, reset]);

  const onSubmit = (data: AnimalFormData) => {
    const animal: Animal = {
      id: animalToEdit ? animalToEdit.id : `a-${Date.now()}`,
      tagNumber: data.tagNumber.trim(),
      name: data.name.trim(),
      type: data.type,
      breed: data.breed,
      dob: data.dob,
      purchasePrice: Number(data.purchasePrice),
      weight: Number(data.weight),
      healthStatus: data.healthStatus,
      milkCapacity: Number(data.milkCapacity),
      imageUrl: data.imageUrl || (data.type === 'Buffalo' 
        ? 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80' 
        : 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80'),
      feeding: {
        feedType: data.feedType || 'Balanced Ration',
        morningQtyKg: 12,
        eveningQtyKg: 12,
        supplements: 'Mineral Mixture 50g',
      },
      vaccinations: animalToEdit?.vaccinations || [
        { id: `v-${Date.now()}`, vaccineName: 'FMD (Foot and Mouth)', dateGiven: new Date().toISOString().split('T')[0], dueDate: '2025-04-10', status: 'Completed' }
      ],
      vetVisits: animalToEdit?.vetVisits || [],
      notes: data.notes,
      createdAt: animalToEdit?.createdAt || new Date().toISOString(),
    };

    farmStore.saveAnimal(animal);
    setSuccess(true);
    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-50 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-modal-slide-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {animalToEdit ? 'Update Animal Profile' : t.addNewAnimal}
              </h3>
              <p className="text-xs text-slate-500">Tag identification, breed, health, and milk capacity</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Animal record saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.tagNumber} *</label>
              <input
                type="text"
                placeholder="e.g. DM-111"
                {...register('tagNumber')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
              {errors.tagNumber && <p className="text-[10px] text-rose-500 mt-1">{errors.tagNumber.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.animalName} *</label>
              <input
                type="text"
                placeholder="e.g. Ganga"
                {...register('name')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
              {errors.name && <p className="text-[10px] text-rose-500 mt-1">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.type} *</label>
              <select
                {...register('type')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              >
                <option value="Cow">Cow (गाय)</option>
                <option value="Buffalo">Buffalo (भैंस)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.breed} *</label>
              <select
                {...register('breed')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              >
                {(watchedType === 'Buffalo' ? buffaloBreeds : cowBreeds).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                {...register('dob')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.weight}</label>
              <input
                type="number"
                {...register('weight', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.milkCapacity}</label>
              <input
                type="number"
                step="0.5"
                {...register('milkCapacity', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.healthStatus} *</label>
              <select
                {...register('healthStatus')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              >
                <option value="Lactating">Lactating (दूध दे रही है)</option>
                <option value="Pregnant">Pregnant (गाभिन)</option>
                <option value="Healthy">Healthy (स्वस्थ)</option>
                <option value="Dry">Dry (सूखी)</option>
                <option value="Sick">Sick (बीमार)</option>
                <option value="Under Treatment">Under Treatment (उपचाराधीन)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.purchasePrice} (₹)</label>
              <input
                type="number"
                {...register('purchasePrice', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Feeding & Ration Details</label>
            <input
              type="text"
              placeholder="e.g. Green Napier Fodder + Wheat Straw + 4kg Cattle Pellet"
              {...register('feedType')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Behavioral Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. Calm demeanor, high fat producer, likes regular grooming"
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
              className="rounded-xl bg-forest px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-forest/20 hover:bg-forest/90"
            >
              {animalToEdit ? 'Save Changes' : t.addNewAnimal}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
