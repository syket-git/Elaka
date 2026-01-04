'use client';

import { Search } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, onFocus, placeholder, className }: SearchBarProps) {
  const { t } = useLanguage();

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder || t.home.searchPlaceholder}
        className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
      />
    </div>
  );
}
