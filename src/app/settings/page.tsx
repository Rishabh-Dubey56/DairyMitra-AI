'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Languages, 
  Bell, 
  RotateCcw, 
  Building2, 
  User, 
  Check, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/components/common/LanguageContext';
import { farmStore } from '@/lib/store';
import { FarmSettings } from '@/lib/types';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();

  const [settings, setSettings] = useState<FarmSettings>(farmStore.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    setSettings(farmStore.getSettings());
  }, []);

  const handleChange = (field: keyof FarmSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    farmStore.saveSettings(settings);
    setLanguage(settings.language);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    farmStore.resetAllData();
    setResetConfirm(false);
    setSettings(farmStore.getSettings());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.settingsTitle}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.settingsSubtitle}</p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-xs font-semibold text-white hover:bg-forest/90 transition-colors shadow-sm shadow-forest/20"
        >
          <Save className="h-4 w-4" />
          <span>{t.saveSettings}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-2xs">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{t.savedSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Farm Details */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Building2 className="h-5 w-5 text-forest" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.farmDetails}</h3>
              <p className="text-xs text-slate-500">Official dairy registration and contact address</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.farmName}</label>
              <input
                type="text"
                value={settings.farmName}
                onChange={(e) => handleChange('farmName', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.regNumber}</label>
              <input
                type="text"
                value={settings.registrationNumber}
                onChange={(e) => handleChange('registrationNumber', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.address}</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.state}</label>
              <input
                type="text"
                value={settings.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Owner & Profile */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <User className="h-5 w-5 text-forest" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.ownerName}</h3>
              <p className="text-xs text-slate-500">Authorized farm manager and account holder</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.ownerName}</label>
              <input
                type="text"
                value={settings.ownerName}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.phone}</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.email}</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Language & Localization */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Languages className="h-5 w-5 text-forest" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Language & Regional Preferences</h3>
              <p className="text-xs text-slate-500">Display language and regional currency formatting</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default UI Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              >
                <option value="en">English (UK/IN)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Standard</label>
              <input
                type="text"
                disabled
                value="Indian Rupee (INR ₹)"
                className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Operational Thresholds & Alerts */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Bell className="h-5 w-5 text-forest" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.alertPreferences}</h3>
              <p className="text-xs text-slate-500">Configure thresholds for automated farm notifications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.lowYieldAlert}</label>
              <input
                type="number"
                value={settings.lowYieldAlertThreshold}
                onChange={(e) => handleChange('lowYieldAlertThreshold', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.vaccinationAdvanceDays}</label>
              <input
                type="number"
                value={settings.vaccinationAlertDays}
                onChange={(e) => handleChange('vaccinationAlertDays', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.dailyTarget}</label>
              <input
                type="number"
                value={settings.dailyMilkTarget}
                onChange={(e) => handleChange('dailyMilkTarget', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-forest focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Data Management & Demo Reset */}
        <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-rose-900">Data Management</h3>
              <p className="text-xs text-rose-600/80">Restore initial demo farm dataset or reset records</p>
            </div>
            <RotateCcw className="h-5 w-5 text-rose-500" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-800">Reset to Sample Farm Records</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Restores the standard 10 demo animals (Gir & Murrah), 14 days of milk records, sample sales, and expenses.
              </p>
            </div>

            {!resetConfirm ? (
              <button
                type="button"
                onClick={() => setResetConfirm(true)}
                className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shrink-0"
              >
                Reset Demo Data
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setResetConfirm(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Yes, Restore Initial Data
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-forest px-6 py-3 text-xs font-semibold text-white shadow-md shadow-forest/20 hover:bg-forest/90"
          >
            <Save className="h-4 w-4" />
            <span>{t.saveSettings}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
