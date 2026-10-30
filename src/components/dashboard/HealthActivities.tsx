'use client';

import React from 'react';
import Link from 'next/link';
import { Animal } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/components/common/LanguageContext';
import { HeartPulse, Syringe, ChevronRight, Stethoscope } from 'lucide-react';

interface HealthActivitiesProps {
  animals: Animal[];
}

export const HealthActivities: React.FC<HealthActivitiesProps> = ({ animals }) => {
  const { t, language } = useLanguage();

  interface ActivityItem {
    id: string;
    animalTag: string;
    animalName: string;
    type: 'vaccine' | 'vet';
    title: string;
    subtitle: string;
    date: string;
    status: string;
  }

  const activities: ActivityItem[] = [];

  animals.forEach((a) => {
    a.vaccinations.forEach((v) => {
      activities.push({
        id: `v-${v.id}-${a.id}`,
        animalTag: a.tagNumber,
        animalName: a.name,
        type: 'vaccine',
        title: `${v.vaccineName} Vaccination`,
        subtitle: v.veterinarian ? `Administered by ${v.veterinarian}` : 'Scheduled Routine',
        date: v.dateGiven,
        status: v.status,
      });
    });

    a.vetVisits.forEach((vv) => {
      activities.push({
        id: `vv-${vv.id}-${a.id}`,
        animalTag: a.tagNumber,
        animalName: a.name,
        type: 'vet',
        title: vv.reason,
        subtitle: `Diag: ${vv.diagnosis} (${vv.doctorName})`,
        date: vv.date,
        status: 'Completed',
      });
    });
  });

  const sorted = activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">{t.recentHealth}</h3>
          <p className="text-xs text-slate-500">Vaccination logs, deworming, and vet checkups</p>
        </div>
        <Link
          href="/animals"
          className="flex items-center gap-1 text-xs font-semibold text-forest hover:underline"
        >
          <span>{t.viewAll}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {sorted.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  item.type === 'vaccine'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {item.type === 'vaccine' ? (
                  <Syringe className="h-4 w-4" />
                ) : (
                  <Stethoscope className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-bold text-slate-800">{item.title}</span>
                  <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-bold text-slate-600">
                    {item.animalTag} ({item.animalName})
                  </span>
                </div>
                <p className="truncate text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
              </div>
            </div>

            <div className="text-right shrink-0 pl-3">
              <span className="text-[10px] text-slate-400 block">{formatDate(item.date, language)}</span>
              <span
                className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  item.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <p className="text-xs text-slate-400 py-6 text-center">{t.noRecords}</p>
        )}
      </div>
    </div>
  );
};
