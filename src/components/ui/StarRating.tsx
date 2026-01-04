'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  };

  return (
    <div className={cn('flex', gapClasses[size])}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            'transition-all',
            !readonly && 'hover:scale-110 active:scale-95'
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              'transition-colors',
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-600 text-slate-600'
            )}
          />
        </button>
      ))}
    </div>
  );
}
