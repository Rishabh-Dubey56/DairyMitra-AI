'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Droplets,
  Syringe,
  Stethoscope,
  Utensils,
  Calendar,
  Layers,
  Edit3,
  CheckCircle,
  Clock,
  Plus,
  TrendingUp,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useLanguage } from '@/components/common/LanguageContext';
import { farmStore } from '@/lib/store';
import { Animal, MilkRecord, VaccinationRecord, VetVisit } from '@/lib/types';
import { formatINR, formatDate, calculateAge } from '@/lib/utils';
import { MilkEntryModal } from '@/components/milk/MilkEntryModal';
import { AnimalFormModal } from '@/components/animals/AnimalFormModal';

export default function AnimalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const animalId = params?.id as string;

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [animalRecords, setAnimalRecords] = useState<MilkRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'milk' | 'health' | 'feeding'>('overview');

  const [isMilkModalOpen, setIsMilkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadData = () => {
    if (!animalId) return;
    const a = farmStore.getAnimalById(animalId);
    if (a) {
      setAnimal(a);
      const allRecords = farmStore.getMilkRecords();
      const filtered = allRecords
        .filter((r) => r.animalId === a.id || r.animalTag === a.tagNumber)
        .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime());
      setAnimalRecords(filtered);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairymitra_storage_updated', loadData);
    return () => window.removeEventListener('dairymitra_storage_updated', loadData);
  }, [animalId]);

  if (!animal) {
    return (
      <div className="space-y-4">
        <Link href="/animals" className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Animals</span>
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm font-bold text-slate-700">Animal not found</p>
          <p className="text-xs text-slate-500 mt-1">The requested tag or ID could not be located in records.</p>
        </div>
      </div>
    );
  }

  // Calculate animal lifetime stats
  const totalMilkYield = Math.round(animalRecords.reduce((sum, r) => sum + r.totalQuantity, 0) * 10) / 10;
  const avgYield = animalRecords.length > 0 ? Math.round((totalMilkYield / animalRecords.length) * 10) / 10 : 0;
  const totalRevenue = animalRecords.reduce((sum, r) => sum + r.totalAmount, 0);

  // Chart data
  const chartData = animalRecords.slice(-14).map((r) => ({
    date: r.date.substring(5),
    morning: r.morningQuantity,
    evening: r.eveningQuantity,
    total: r.totalQuantity,
  }));

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          href="/animals"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-forest transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Livestock Directory</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMilkModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-forest px-3.5 py-2 text-xs font-semibold text-white hover:bg-forest/90 transition-colors shadow-xs"
          >
            <Droplets className="h-3.5 w-3.5" />
            <span>Log Milk for {animal.name}</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Edit3 className="h-3.5 w-3.5 text-slate-500" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Hero Animal Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="relative h-48 sm:h-56 w-full bg-slate-900">
          <img
            src={animal.imageUrl || "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80"}
            alt={animal.name}
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 text-white">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold backdrop-blur-md">
                  {animal.tagNumber}
                </span>
                <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold">
                  {animal.type} ({animal.breed})
                </span>
                <span className="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold text-white">
                  {animal.healthStatus}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1.5 leading-tight">{animal.name}</h1>
              <p className="text-xs text-white/80">Age: {calculateAge(animal.dob)} • Weight: {animal.weight} kg</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 backdrop-blur-md px-3.5 py-2 text-center border border-white/10">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">Daily Capacity</span>
                <span className="text-lg font-bold text-white">{animal.milkCapacity} L/day</span>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-md px-3.5 py-2 text-center border border-white/10">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">Logged Total</span>
                <span className="text-lg font-bold text-white">{totalMilkYield} L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`border-b-2 py-3 px-3 text-xs font-bold transition-colors ${
              activeTab === 'overview'
                ? 'border-forest text-forest'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Stats
          </button>
          <button
            onClick={() => setActiveTab('milk')}
            className={`border-b-2 py-3 px-3 text-xs font-bold transition-colors ${
              activeTab === 'milk'
                ? 'border-forest text-forest'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Milk Yield History ({animalRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`border-b-2 py-3 px-3 text-xs font-bold transition-colors ${
              activeTab === 'health'
                ? 'border-forest text-forest'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Vaccinations & Vet Visits ({animal.vaccinations.length + animal.vetVisits.length})
          </button>
          <button
            onClick={() => setActiveTab('feeding')}
            className={`border-b-2 py-3 px-3 text-xs font-bold transition-colors ${
              activeTab === 'feeding'
                ? 'border-forest text-forest'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Nutrition & Feeding
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* 14 Day Yield Chart */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Recent 14 Days Production</h3>
                  <p className="text-xs text-slate-500">Daily morning and evening sessions for {animal.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Average: </span>
                  <span className="text-xs font-bold text-forest">{avgYield} L/day</span>
                </div>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="animalArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#166534" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#166534" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
                              <p className="font-bold text-slate-800">Date: {label}</p>
                              <p className="text-emerald-800 font-semibold">Morning: {payload[0]?.payload.morning}L</p>
                              <p className="text-emerald-600 font-semibold">Evening: {payload[0]?.payload.evening}L</p>
                              <p className="font-bold text-slate-900 border-t border-slate-100 pt-1 mt-1">Total: {payload[0]?.value}L</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#166534" strokeWidth={2.5} fill="url(#animalArea)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Basic Info Specs Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Livestock Specifications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-400 font-medium block">Tag ID</span>
                  <span className="text-slate-800 font-bold text-sm">{animal.tagNumber}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-400 font-medium block">Date of Birth</span>
                  <span className="text-slate-800 font-bold">{formatDate(animal.dob, language)}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-400 font-medium block">Purchase Price</span>
                  <span className="text-slate-800 font-bold">{formatINR(animal.purchasePrice)}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-400 font-medium block">Lactation #</span>
                  <span className="text-slate-800 font-bold">{animal.lactationNumber || 2}</span>
                </div>
              </div>

              {animal.notes && (
                <div className="rounded-xl bg-emerald-50/50 p-3.5 border border-emerald-100 text-xs">
                  <strong className="text-forest font-bold block mb-0.5">Farm Notes:</strong>
                  <p className="text-slate-700">{animal.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Health & Feeding Quick Summary */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Vaccination Status</h3>
                <Syringe className="h-4 w-4 text-forest" />
              </div>

              <div className="space-y-2.5">
                {animal.vaccinations.map((v) => (
                  <div key={v.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-800">{v.vaccineName}</p>
                      <p className="text-[11px] text-slate-400">Due: {formatDate(v.dueDate, language)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      v.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Current Feeding Plan</h3>
                <Utensils className="h-4 w-4 text-forest" />
              </div>
              <div className="text-xs space-y-2">
                <p className="text-slate-600"><strong className="text-slate-800">Ration:</strong> {animal.feeding.feedType}</p>
                <div className="grid grid-cols-2 gap-2 text-center pt-2">
                  <div className="rounded-xl bg-emerald-50 p-2">
                    <span className="text-[10px] text-emerald-800 block">Morning Feed</span>
                    <span className="font-bold text-forest">{animal.feeding.morningQtyKg} kg</span>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-2">
                    <span className="text-[10px] text-emerald-800 block">Evening Feed</span>
                    <span className="font-bold text-forest">{animal.feeding.eveningQtyKg} kg</span>
                  </div>
                </div>
                {animal.feeding.supplements && (
                  <p className="text-[11px] text-slate-500 pt-1">
                    <strong className="text-slate-700">Supplements:</strong> {animal.feeding.supplements}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Milk Yield Logs */}
      {activeTab === 'milk' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Daily Milk Production Logs</h3>
              <p className="text-xs text-slate-500">Historical morning and evening yield entries</p>
            </div>
            <button
              onClick={() => setIsMilkModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-forest px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-forest/90"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Record</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Morning (L)</th>
                  <th className="py-2.5 px-3">Evening (L)</th>
                  <th className="py-2.5 px-3">Total Yield (L)</th>
                  <th className="py-2.5 px-3">Fat %</th>
                  <th className="py-2.5 px-3">Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right">Value (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {animalRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold">{formatDate(r.date, language)}</td>
                    <td className="py-2.5 px-3 text-emerald-800 font-medium">{r.morningQuantity} L</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-medium">{r.eveningQuantity} L</td>
                    <td className="py-2.5 px-3 font-bold text-forest">{r.totalQuantity} L</td>
                    <td className="py-2.5 px-3">{r.fatPercentage ? `${r.fatPercentage}%` : '-'}</td>
                    <td className="py-2.5 px-3">₹{r.ratePerLitre}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(r.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Health & Vet */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800">Veterinary Clinical History</h3>
            <div className="divide-y divide-slate-100">
              {animal.vetVisits.map((vv) => (
                <div key={vv.id} className="py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{vv.reason}</span>
                      <span className="text-[10px] text-slate-400">({formatDate(vv.date, language)})</span>
                    </div>
                    <p className="text-slate-600"><strong className="text-slate-700">Diagnosis:</strong> {vv.diagnosis}</p>
                    <p className="text-slate-600"><strong className="text-slate-700">Prescription:</strong> {vv.prescriptions}</p>
                    <p className="text-slate-400 text-[11px]">Attending Doctor: {vv.doctorName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-800 block">{formatINR(vv.cost)}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                      Checkup Cleared
                    </span>
                  </div>
                </div>
              ))}
              {animal.vetVisits.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No past veterinary incidents recorded. Animal is in healthy state.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Feeding */}
      {activeTab === 'feeding' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-800">Customized Dietary & Ration Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-2">
              <h4 className="font-bold text-forest text-sm">Morning Feeding Session (6:00 AM)</h4>
              <p className="text-slate-700"><strong>Quantity:</strong> {animal.feeding.morningQtyKg} kg</p>
              <p className="text-slate-700"><strong>Composition:</strong> High moisture green fodder (Lucerne / Napier) mixed with chopped wheat straw and concentrate mash.</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-2">
              <h4 className="font-bold text-forest text-sm">Evening Feeding Session (5:00 PM)</h4>
              <p className="text-slate-700"><strong>Quantity:</strong> {animal.feeding.eveningQtyKg} kg</p>
              <p className="text-slate-700"><strong>Composition:</strong> Dry fodder base mixed with mustard oil cake, crushed maize, and mineral premix.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <MilkEntryModal
        isOpen={isMilkModalOpen}
        onClose={() => setIsMilkModalOpen(false)}
        onSuccess={loadData}
        initialAnimalId={animal.id}
      />
      <AnimalFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadData}
        animalToEdit={animal}
      />
    </div>
  );
}
