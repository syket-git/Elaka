'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight, TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/ui/SearchBar';
import { AreaCard } from '@/components/ui/AreaCard';
import { ReviewCard } from '@/components/ui/ReviewCard';
import { useLanguage } from '@/hooks/useLanguage';
import { areas, reviews } from '@/lib/seed-data';
import { formatNumber } from '@/lib/utils';

export default function HomePage() {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Get top areas by score
  const popularAreas = [...areas]
    .sort((a, b) => b.scores.overall_score - a.scores.overall_score)
    .slice(0, 4);

  // Get recent reviews
  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="px-4 pb-8 max-w-lg mx-auto">
        {/* Hero Section */}
        <section className="py-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            {t.appTagline}
          </h1>
          <p className="text-slate-400 text-sm">
            {lang === 'bn'
              ? 'চট্টগ্রামের যেকোনো এলাকা সম্পর্কে জানুন বাসিন্দাদের কাছ থেকে'
              : 'Learn about any area in Chittagong from the residents'}
          </p>
        </section>

        {/* Search */}
        <section className="mb-6">
          <Link href="/search">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              className="pointer-events-none"
            />
          </Link>
        </section>

        {/* AI Assistant Card */}
        <Link href="/ask">
          <section className="mb-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-4 border border-emerald-500/30 active:scale-[0.98] transition-transform">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">
                  {t.home.askAI}
                </h3>
                <p className="text-sm text-slate-400">
                  {t.home.askPlaceholder}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-400 mt-2" />
            </div>
          </section>
        </Link>

        {/* Popular Areas */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">
                {t.home.popularAreas}
              </h2>
            </div>
            <Link
              href="/search"
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              {t.home.viewAll}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {popularAreas.map((area) => (
              <AreaCard key={area.id} area={area} variant="compact" />
            ))}
          </div>
        </section>

        {/* Recent Reviews */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {t.home.recentReviews}
            </h2>
          </div>

          <div className="space-y-3">
            {recentReviews.map((review) => {
              const area = areas.find((a) => a.id === review.area_id);
              return (
                <div key={review.id}>
                  {area && (
                    <Link href={`/area/${area.slug}`}>
                      <span className="text-xs text-emerald-400 mb-1 inline-block">
                        {lang === 'bn' ? area.name_bn : area.name}
                      </span>
                    </Link>
                  )}
                  <ReviewCard review={review} />
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">
              {formatNumber(areas.length, lang)}+
            </div>
            <div className="text-xs text-slate-400">
              {lang === 'bn' ? 'এলাকা' : 'Areas'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">
              {formatNumber(areas.reduce((sum, a) => sum + a.scores.total_ratings, 0), lang)}+
            </div>
            <div className="text-xs text-slate-400">
              {lang === 'bn' ? 'রেটিং' : 'Ratings'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">
              {formatNumber(reviews.length, lang)}+
            </div>
            <div className="text-xs text-slate-400">
              {lang === 'bn' ? 'রিভিউ' : 'Reviews'}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
