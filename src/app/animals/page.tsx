'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Eye, 
  Droplets, 
  Calendar,
  Layers,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/components/common/LanguageContext';
import { farmStore } from '@/lib/store';
import { Animal, AnimalType, HealthStatus } from '@/lib/types';
import { formatINR, calculateAge } from '@/lib/utils';
import { AnimalFormModal } from '@/components/animals/AnimalFormModal';

function AnimalsContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'capacity' | 'tag' | 'name' | 'price'>('capacity');
  
  // Modals & Edit state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [animalToEdit, setAnimalToEdit] = useState<Animal | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadAnimals = () => {
    setAnimals(farmStore.getAnimals());
  };

  useEffect(() => {
    loadAnimals();
    const handleStorageUpdated = () => {
      loadAnimals();
    };
    window.addEventListener('dairymitra_storage_updated', handleStorageUpdated);
    return () => window.removeEventListener('dairymitra_storage_updated', handleStorageUpdated);
  }, []);

  const handleDelete = (id: string) => {
    farmStore.deleteAnimal(id);
    setDeleteConfirmId(null);
    loadAnimals();
  };

  // Filter & Search Logic
  const filteredAnimals = animals.filter((a) => {
    const matchesSearch =
      a.tagNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.breed.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedType === 'ALL' || a.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || a.healthStatus === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'capacity') return b.milkCapacity - a.milkCapacity;
    if (sortBy === 'tag') return a.tagNumber.localeCompare(b.tagNumber);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'price') return b.purchasePrice - a.purchasePrice;
    return 0;
  });

  const getStatusBadge = (status: HealthStatus) => {
    switch (status) {
      case 'Lactating':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pregnant':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Healthy':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Dry':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Sick':
      case 'Under Treatment':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.animalsTitle}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.animalsSubtitle}</p>
        </div>

        <button
          onClick={() => {
            setAnimalToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-xs font-semibold text-white hover:bg-forest/90 transition-colors shadow-sm shadow-forest/20"
        >
          <Plus className="h-4 w-4" />
          <span>{t.addNewAnimal}</span>
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tag (DM-101), name, breed..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-forest focus:bg-white focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 focus:border-forest focus:bg-white focus:outline-none"
          >
            <option value="ALL">{t.filterByType}</option>
            <option value="Cow">Cows (गायें)</option>
            <option value="Buffalo">Buffaloes (भैंसें)</option>
          </select>

          {/* Health Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 focus:border-forest focus:bg-white focus:outline-none"
          >
            <option value="ALL">{t.filterByStatus}</option>
            <option value="Lactating">Lactating (दूध दे रही है)</option>
            <option value="Pregnant">Pregnant (गाभिन)</option>
            <option value="Healthy">Healthy (स्वस्थ)</option>
            <option value="Dry">Dry (सूखी)</option>
            <option value="Sick">Sick (बीमार)</option>
            <option value="Under Treatment">Under Treatment</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 focus:border-forest focus:bg-white focus:outline-none"
          >
            <option value="capacity">Sort: Milk Capacity (High to Low)</option>
            <option value="tag">Sort: Tag Number</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="price">Sort: Purchase Price</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800">{filteredAnimals.length}</strong> of {animals.length} animals
          </span>
          {(search || selectedType !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedType('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-forest font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Livestock Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredAnimals.map((animal) => (
          <div
            key={animal.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:border-forest/40"
          >
            {/* Image / Header */}
            <div className="relative h-44 w-full overflow-hidden bg-slate-100">
              <img
                src={animal.imageUrl || "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80"}
                alt={animal.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

              {/* Tag & Type badges on image */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white">
                  {animal.tagNumber}
                </span>
                <span className="rounded-lg bg-white/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-slate-800">
                  {animal.type}
                </span>
              </div>

              {/* Health status badge */}
              <div className="absolute top-3 right-3">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-xs ${getStatusBadge(
                    animal.healthStatus
                  )}`}
                >
                  {animal.healthStatus}
                </span>
              </div>

              {/* Animal name & breed bottom overlay */}
              <div className="absolute bottom-2.5 left-3 right-3 text-white">
                <h3 className="text-base font-bold leading-tight">{animal.name}</h3>
                <p className="text-xs text-white/80">{animal.breed} Breed • {calculateAge(animal.dob)}</p>
              </div>
            </div>

            {/* Info details body */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-emerald-50/60 p-2 border border-emerald-100/60">
                  <span className="text-[10px] text-emerald-800 font-semibold uppercase block">Capacity</span>
                  <div className="flex items-center gap-1 font-bold text-forest text-sm">
                    <Droplets className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{animal.milkCapacity} L/day</span>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Weight</span>
                  <span className="font-bold text-slate-800 text-sm">{animal.weight} kg</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                <p className="text-[11px] truncate text-slate-500">
                  <strong className="text-slate-700">Ration:</strong> {animal.feeding.feedType}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Vaccinations: {animal.vaccinations.length} done</span>
                  <span className="font-medium text-slate-700">{formatINR(animal.purchasePrice)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Link
                  href={`/animals/${animal.id}`}
                  className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-forest/10 py-1.5 text-xs font-semibold text-forest hover:bg-forest/20 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{t.viewProfile}</span>
                </Link>

                <button
                  onClick={() => {
                    setAnimalToEdit(animal);
                    setIsAddModalOpen(true);
                  }}
                  className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => setDeleteConfirmId(animal.id)}
                  className="rounded-xl border border-rose-200 p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAnimals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-800">No animals match your search</h3>
          <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or register a new livestock animal.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedType('ALL');
              setSelectedStatus('ALL');
            }}
            className="mt-4 rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest/90"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative z-50 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-slate-600">{t.confirmDeleteAnimal}</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                {t.deleteAnimal}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <AnimalFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAnimalToEdit(null);
        }}
        onSuccess={loadAnimals}
        animalToEdit={animalToEdit}
      />
    </div>
  );
}

export default function AnimalsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading livestock...</div>}>
      <AnimalsContent />
    </Suspense>
  );
}
