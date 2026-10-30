'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Sparkles, 
  FileText, 
  Settings, 
  Droplets,
  DollarSign,
  HeartPulse,
  Activity,
  Layers
} from 'lucide-react';
import { useLanguage } from '@/components/common/LanguageContext';
import { cn } from '@/lib/utils';

interface NavItem {
  nameKey: keyof typeof import('@/lib/translations').translations['en'];
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { nameKey: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { nameKey: 'animals', href: '/animals', icon: Layers },
  { nameKey: 'milkRecords', href: '/milk-records', icon: Droplets },
  { nameKey: 'expensesSales', href: '/expenses', icon: DollarSign },
  { nameKey: 'aiAdvisor', href: '/ai-advisor', icon: Sparkles, badge: 'AI', badgeColor: 'bg-emerald-500 text-white' },
  { nameKey: 'reports', href: '/reports', icon: FileText },
  { nameKey: 'settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC<{ isMobileOpen?: boolean; onCloseMobile?: () => void }> = ({
  isMobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-white shadow-md shadow-forest/20">
            <span className="text-xl font-bold">🐄</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight text-forest tracking-tight">
              {t.appName}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {t.appTagline}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-forest text-white shadow-sm shadow-forest/20 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-forest"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-forest"
                    )}
                  />
                  <span>{t[item.nameKey] as string}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      isActive ? "bg-white/20 text-white" : item.badgeColor
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Farm & User Profile Banner */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50/70 p-3 border border-emerald-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white shadow-xs">
              GD
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">
                {t.farmProfile}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <p className="truncate text-[10px] text-emerald-800 font-medium">
                  {t.onlineStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
