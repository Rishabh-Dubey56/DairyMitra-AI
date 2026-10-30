import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatDate(dateString: string, locale: 'en' | 'hi' = 'en'): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function calculateAge(dobString: string): string {
  try {
    const dob = new Date(dobString);
    const now = new Date();
    const diffMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    if (years === 0) return `${months} months`;
    if (months === 0) return `${years} yrs`;
    return `${years} yrs ${months} mo`;
  } catch {
    return "Unknown";
  }
}
