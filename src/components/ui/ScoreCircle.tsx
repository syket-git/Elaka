'use client';

import { cn, getScoreColor, getScoreBgColor } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { formatNumber } from '@/lib/utils';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export function ScoreCircle({ score, size = 'md', showLabel = false, label }: ScoreCircleProps) {
  const { lang } = useLanguage();

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
  };

  const radius = size === 'sm' ? 20 : size === 'md' ? 28 : 42;
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn('relative flex items-center justify-center', sizeClasses[size])}>
        <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}>
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn('transition-all duration-500', getScoreColor(score))}
          />
        </svg>
        <span className={cn('font-bold', getScoreColor(score))}>
          {formatNumber(score, lang)}
        </span>
      </div>
      {showLabel && label && (
        <span className="text-xs text-slate-400 text-center">{label}</span>
      )}
    </div>
  );
}

interface ScoreBarProps {
  score: number;
  label: string;
  maxScore?: number;
}

export function ScoreBar({ score, label, maxScore = 100 }: ScoreBarProps) {
  const { lang } = useLanguage();
  const percentage = (score / maxScore) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className={cn('font-medium', getScoreColor(score))}>
          {formatNumber(score, lang)}
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getScoreBgColor(score))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
