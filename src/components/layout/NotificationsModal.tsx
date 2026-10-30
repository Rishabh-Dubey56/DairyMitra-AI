'use client';

import React from 'react';
import { Bell, CheckCircle, AlertTriangle, Syringe, DollarSign, X } from 'lucide-react';
import { useLanguage } from '@/components/common/LanguageContext';

export interface NotificationItem {
  id: string;
  type: 'vaccine' | 'alert' | 'payment' | 'system';
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

export const sampleNotifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'vaccine',
    title: 'Vaccination Due: DM-101 Gauri',
    description: 'Brucellosis Booster is due for administration within next 14 days.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 'n2',
    type: 'alert',
    title: 'Health Watch: DM-110 Pari',
    description: 'Animal is recovering from ruminal acidosis. Follow up check scheduled.',
    time: '5 hours ago',
    unread: true,
  },
  {
    id: 'n3',
    type: 'payment',
    title: 'Pending Settlement: Amul Dairy',
    description: 'Payment of ₹81,925 for milk dispatch is due on 5th Nov.',
    time: '1 day ago',
    unread: false,
  },
  {
    id: 'n4',
    type: 'system',
    title: 'Milking Target Achieved',
    description: 'Herd surpassed daily production target of 120L today.',
    time: '2 days ago',
    unread: false,
  },
];

export const NotificationsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-2xs" onClick={onClose} />
      <div className="relative z-50 mt-14 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl animate-modal-slide-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-forest" />
            <h3 className="font-semibold text-slate-800 text-sm">{t.notifications}</h3>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              2 new
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {sampleNotifications.map((n) => {
            return (
              <div
                key={n.id}
                className={`flex gap-3 py-3 px-2 rounded-xl transition-colors ${
                  n.unread ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5">
                  {n.type === 'vaccine' && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Syringe className="h-4 w-4" />
                    </div>
                  )}
                  {n.type === 'alert' && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  )}
                  {n.type === 'payment' && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  )}
                  {n.type === 'system' && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.description}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
