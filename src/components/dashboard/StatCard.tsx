'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'forest' | 'fresh' | 'amber' | 'blue' | 'purple' | 'rose';
  onClick?: () => void;
}

const colorMap = {
  forest: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200/60',
    iconBg: 'bg-forest text-white shadow-forest/20',
    text: 'text-forest',
  },
  fresh: {
    bg: 'bg-green-50/70',
    border: 'border-green-200/60',
    iconBg: 'bg-emerald-600 text-white shadow-emerald-500/20',
    text: 'text-emerald-700',
  },
  amber: {
    bg: 'bg-amber-50/70',
    border: 'border-amber-200/60',
    iconBg: 'bg-amber-500 text-white shadow-amber-500/20',
    text: 'text-amber-700',
  },
  blue: {
    bg: 'bg-blue-50/70',
    border: 'border-blue-200/60',
    iconBg: 'bg-blue-600 text-white shadow-blue-500/20',
    text: 'text-blue-700',
  },
  purple: {
    bg: 'bg-purple-50/70',
    border: 'border-purple-200/60',
    iconBg: 'bg-purple-600 text-white shadow-purple-500/20',
    text: 'text-purple-700',
  },
  rose: {
    bg: 'bg-rose-50/70',
    border: 'border-rose-200/60',
    iconBg: 'bg-rose-600 text-white shadow-rose-500/20',
    text: 'text-rose-700',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'forest',
  onClick,
}) => {
  const styling = colorMap[accentColor] || colorMap.forest;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md",
        onClick && "cursor-pointer hover:border-forest/40"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          )}
        </div>

        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl shadow-xs", styling.iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5 text-xs font-medium">
          <span
            className={cn(
              "font-bold",
              trend.isPositive ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {trend.value}
          </span>
          {trend.label && <span className="text-slate-400">{trend.label}</span>}
        </div>
      )}
    </div>
  );
};
