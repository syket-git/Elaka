'use client';

import Link from 'next/link';
import { MapPin, Users, Star } from 'lucide-react';
import { cn, getScoreColor, formatNumber } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { AreaWithScore } from '@/types';
import { ScoreCircle } from './ScoreCircle';

interface AreaCardProps {
  area: AreaWithScore;
  variant?: 'default' | 'compact';
}

export function AreaCard({ area, variant = 'default' }: AreaCardProps) {
  const { lang, t } = useLanguage();

  if (variant === 'compact') {
    return (
      <Link href={`/area/${area.slug}`}>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 hover:border-emerald-500/50 transition-all active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <ScoreCircle score={area.scores.overall_score} size="sm" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">
                {lang === 'bn' ? area.name_bn : area.name}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {lang === 'bn' ? area.parent_area_bn : area.parent_area}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/area/${area.slug}`}>
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 hover:border-emerald-500/50 transition-all active:scale-[0.98]">
        <div className="flex gap-4">
          <ScoreCircle score={area.scores.overall_score} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-lg">
              {lang === 'bn' ? area.name_bn : area.name}
            </h3>
            <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
              <MapPin className="w-3 h-3" />
              <span>{lang === 'bn' ? area.parent_area_bn : area.parent_area}, {lang === 'bn' ? area.city_bn : area.city}</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {formatNumber(area.scores.total_ratings, lang)} {t.area.ratings}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {formatNumber(area.scores.total_reviews, lang)} {t.area.reviews}
              </span>
            </div>
          </div>
        </div>

        {/* Quick highlights */}
        {area.good_things && area.good_things.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {area.good_things.slice(0, 3).map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        {/* Alerts */}
        {area.alerts && area.alerts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {area.alerts.slice(0, 2).map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
