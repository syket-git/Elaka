'use client';

import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface OptionSelectorProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  columns?: 2 | 3 | 4;
}

export function OptionSelector({ options, value, onChange, columns = 3 }: OptionSelectorProps) {
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={cn('grid gap-2', gridClasses[columns])}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95',
            value === option.value
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
