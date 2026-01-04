import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export function getScoreGradient(score: number): string {
  if (score >= 80) return "from-emerald-500 to-emerald-600";
  if (score >= 60) return "from-yellow-500 to-yellow-600";
  if (score >= 40) return "from-orange-500 to-orange-600";
  return "from-red-500 to-red-600";
}

export function formatNumber(num: number, lang: 'bn' | 'en'): string {
  if (lang === 'en') return num.toString();

  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => {
    const digit = parseInt(d);
    return isNaN(digit) ? d : bnDigits[digit];
  }).join('');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
