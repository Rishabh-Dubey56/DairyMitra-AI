'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  Search, 
  Bell, 
  Languages, 
  ChevronDown, 
  Sparkles,
  User
} from 'lucide-react';
import { useLanguage } from '@/components/common/LanguageContext';
import { NotificationsModal } from './NotificationsModal';
import { farmStore } from '@/lib/store';

export const Header: React.FC<{ onOpenMobileMenu: () => void }> = ({ onOpenMobileMenu }) => {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [farmSettings, setFarmSettings] = useState(() => {
    try {
      return farmStore.getSettings();
    } catch {
      return { ownerName: 'Rajesh Patel', farmName: 'Gokul Dairy Farm' };
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      setFarmSettings(farmStore.getSettings());
    };
    window.addEventListener('dairymitra_storage_updated', handleUpdate);
    return () => window.removeEventListener('dairymitra_storage_updated', handleUpdate);
  }, []);

  const ownerInitials = farmSettings.ownerName
    ? farmSettings.ownerName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'RP';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Route to animals page with search query
    router.push(`/animals?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Search */}
        <div className="flex items-center gap-3 lg:gap-6 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileMenu}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-forest focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </form>
        </div>

        {/* Right: Language, Quick AI, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Languages className="h-4 w-4 text-forest" />
              <span>{language === 'en' ? 'English' : 'हिन्दी'}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg z-50">
                <button
                  onClick={() => {
                    setLanguage('en');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs font-medium hover:bg-slate-50 ${
                    language === 'en' ? 'text-forest font-bold bg-emerald-50' : 'text-slate-700'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setLanguage('hi');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs font-medium hover:bg-slate-50 ${
                    language === 'hi' ? 'text-forest font-bold bg-emerald-50' : 'text-slate-700'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
              </div>
            )}
          </div>

          {/* AI Quick Button */}
          <button
            onClick={() => router.push('/ai-advisor')}
            className="hidden md:flex items-center gap-1.5 rounded-xl bg-forest/10 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-forest/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-forest" />
            <span>AI Advisor</span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">
              2
            </span>
          </button>

          {/* Farmer Profile */}
          <div 
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-1.5 pr-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest text-white font-semibold text-xs shadow-xs">
              {ownerInitials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{farmSettings.ownerName || 'Rajesh Patel'}</p>
              <p className="text-[10px] text-slate-500 font-medium">{farmSettings.farmName || 'Gokul Dairy Farm'}</p>
            </div>
          </div>
        </div>
      </header>

      <NotificationsModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
