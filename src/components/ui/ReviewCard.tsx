'use client';

import { CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Review } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { lang } = useLanguage();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (lang === 'bn') {
      return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
          <span className="text-sm text-slate-300">
            {review.user?.display_name?.[0] || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-slate-200">
              {lang === 'bn' ? 'যাচাইকৃত বাসিন্দা' : 'Verified Resident'}
            </span>
            {review.user?.is_verified && (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          <span className="text-xs text-slate-500">{formatDate(review.created_at)}</span>
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-300 text-sm leading-relaxed mb-3">
        {review.content}
      </p>

      {/* Pros */}
      {review.pros && review.pros.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {review.pros.map((pro, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full"
            >
              <ThumbsUp className="w-3 h-3" />
              {pro}
            </span>
          ))}
        </div>
      )}

      {/* Cons */}
      {review.cons && review.cons.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {review.cons.map((con, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full"
            >
              <ThumbsDown className="w-3 h-3" />
              {con}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
