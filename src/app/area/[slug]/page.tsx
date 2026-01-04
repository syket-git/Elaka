'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Users,
  Star,
  Shield,
  Building2,
  Home,
  Car,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Plus,
} from 'lucide-react';
import { ScoreCircle, ScoreBar } from '@/components/ui/ScoreCircle';
import { ReviewCard } from '@/components/ui/ReviewCard';
import { useLanguage } from '@/hooks/useLanguage';
import { getAreaBySlug, getReviewsByAreaId } from '@/lib/seed-data';
import { formatNumber } from '@/lib/utils';
import { Review } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface DBReview {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string | null;
    is_verified: boolean;
  } | null;
}

export default function AreaDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { lang, t } = useLanguage();

  const area = getAreaBySlug(slug);
  const seedReviews = area ? getReviewsByAreaId(area.id) : [];

  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Fetch reviews from database
  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch(`/api/ratings?area_slug=${slug}`);
        if (response.ok) {
          const data = await response.json();
          // Transform DB reviews to match Review type
          const transformed: Review[] = (data.reviews || []).map((r: DBReview) => ({
            id: r.id,
            area_id: area?.id || '',
            user_id: r.user_id,
            content: r.content,
            created_at: r.created_at,
            author_name: r.profiles?.display_name || (lang === 'bn' ? 'বাসিন্দা' : 'Resident'),
            is_verified: r.profiles?.is_verified || false,
          }));
          setDbReviews(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    }

    if (area) {
      fetchReviews();
    }
  }, [slug, area, lang]);

  // Combine DB reviews with seed reviews (DB reviews first)
  const allReviews = [...dbReviews, ...seedReviews];

  if (!area) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">
            {lang === 'bn' ? 'এলাকা পাওয়া যায়নি' : 'Area not found'}
          </p>
          <Link href="/search" className="text-emerald-400">
            {lang === 'bn' ? 'সব এলাকা দেখুন' : 'View all areas'}
          </Link>
        </div>
      </div>
    );
  }

  const categoryScores = [
    {
      key: 'safety',
      label: t.categories.safety,
      score: area.scores.safety_score,
      icon: Shield,
    },
    {
      key: 'infrastructure',
      label: t.categories.infrastructure,
      score: area.scores.infrastructure_score,
      icon: Building2,
    },
    {
      key: 'livability',
      label: t.categories.livability,
      score: area.scores.livability_score,
      icon: Home,
    },
    {
      key: 'accessibility',
      label: t.categories.accessibility,
      score: area.scores.accessibility_score,
      icon: Car,
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-slate-800 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-white truncate">
              {lang === 'bn' ? area.name_bn : area.name}
            </h1>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <MapPin className="w-3 h-3" />
              <span>
                {lang === 'bn' ? area.parent_area_bn : area.parent_area},{' '}
                {lang === 'bn' ? area.city_bn : area.city}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 max-w-lg mx-auto">
        {/* Score Overview */}
        <section className="py-6">
          <div className="flex items-center gap-6">
            <ScoreCircle score={area.scores.overall_score} size="lg" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-1">
                {t.area.score}
              </h2>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {formatNumber(area.scores.total_ratings, lang)} {t.area.ratings}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {formatNumber(area.scores.total_reviews, lang)} {t.area.reviews}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Scores */}
        <section className="mb-6 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <div className="space-y-4">
            {categoryScores.map((cat) => (
              <div key={cat.key} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <cat.icon className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1">
                  <ScoreBar score={cat.score} label={cat.label} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Summary */}
        {area.ai_summary && (
          <section className="mb-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white">{t.area.aiSummary}</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {area.ai_summary}
            </p>

            {/* Best for / Not ideal for */}
            <div className="mt-4 space-y-3">
              {area.best_for && area.best_for.length > 0 && (
                <div>
                  <span className="text-xs text-emerald-400 font-medium">
                    {t.area.bestFor}:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {area.best_for.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {area.not_ideal_for && area.not_ideal_for.length > 0 && (
                <div>
                  <span className="text-xs text-amber-400 font-medium">
                    {t.area.notIdealFor}:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {area.not_ideal_for.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Alerts */}
        {area.alerts && area.alerts.length > 0 && (
          <section className="mb-6 bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">{t.area.alerts}</h3>
            </div>
            <ul className="space-y-2">
              {area.alerts.map((alert, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-amber-200">
                  <span className="text-amber-400 mt-1">•</span>
                  {alert}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Good Things & Problems */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Good Things */}
          {area.good_things && area.good_things.length > 0 && (
            <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-medium text-white">{t.area.goodThings}</h4>
              </div>
              <ul className="space-y-1.5">
                {area.good_things.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-emerald-200">
                    <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Problems */}
          {area.problems && area.problems.length > 0 && (
            <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="w-4 h-4 text-red-400" />
                <h4 className="text-sm font-medium text-white">{t.area.problems}</h4>
              </div>
              <ul className="space-y-1.5">
                {area.problems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-red-200">
                    <span className="text-red-400 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Reviews */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">{t.area.reviews}</h3>
            <span className="text-sm text-slate-400">
              {formatNumber(allReviews.length, lang)} {t.area.reviews}
            </span>
          </div>

          {allReviews.length > 0 ? (
            <div className="space-y-3">
              {allReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-800/30 rounded-2xl">
              <p className="text-slate-400 text-sm">
                {lang === 'bn' ? 'এখনো কোনো রিভিউ নেই' : 'No reviews yet'}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-8">
        <div className="max-w-lg mx-auto">
          <Link
            href={`/area/${slug}/rate`}
            className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition-colors active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            {t.area.rateArea}
          </Link>
        </div>
      </div>
    </div>
  );
}
