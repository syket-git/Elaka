'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  Building2,
  Home,
  Car,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { OptionSelector } from '@/components/ui/OptionSelector';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { getAreaBySlug } from '@/lib/seed-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

type RatingStep = 'safety' | 'infrastructure' | 'livability' | 'accessibility' | 'review' | 'done';

export default function RateAreaPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const area = getAreaBySlug(slug);

  const [step, setStep] = useState<RatingStep>('safety');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ratings, setRatings] = useState({
    // Safety
    safety_night: 0,
    safety_women: 0,
    theft: '',
    police_response: 0,
    // Infrastructure
    flooding: '',
    load_shedding: '',
    water_supply: '',
    road_condition: 0,
    mobile_network: 0,
    // Livability
    noise_level: '',
    cleanliness: 0,
    community: 0,
    parking: '',
    // Accessibility
    transport: '',
    main_road_distance: '',
    hospital_nearby: '',
    school_nearby: '',
    market_distance: '',
  });
  const [review, setReview] = useState('');

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

  const steps: { key: RatingStep; label: string; icon: typeof Shield }[] = [
    { key: 'safety', label: t.categories.safety, icon: Shield },
    { key: 'infrastructure', label: t.categories.infrastructure, icon: Building2 },
    { key: 'livability', label: t.categories.livability, icon: Home },
    { key: 'accessibility', label: t.categories.accessibility, icon: Car },
    { key: 'review', label: lang === 'bn' ? 'রিভিউ' : 'Review', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex].key);
    } else {
      // Submit
      setStep('done');
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1].key);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          area_slug: slug,
          ratings,
          review,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit rating');
      }

      setStep('done');
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(
        lang === 'bn'
          ? 'জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
          : 'Failed to submit. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {lang === 'bn' ? 'ধন্যবাদ!' : 'Thank you!'}
          </h2>
          <p className="text-slate-400 mb-6">
            {t.rating.thankYou}
          </p>
          <Link
            href={`/area/${slug}`}
            className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
          >
            {lang === 'bn' ? 'এলাকায় ফিরে যান' : 'Back to area'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-slate-800 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex-1">
              <h1 className="font-semibold text-white">{t.rating.title}</h1>
              <p className="text-xs text-slate-400">
                {lang === 'bn' ? area.name_bn : area.name}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-2">
            {steps.map((s, idx) => (
              <div
                key={s.key}
                className={`flex items-center gap-1 text-xs ${
                  idx <= currentStepIndex ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                <s.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Safety Step */}
        {step === 'safety' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.safetyNight}
              </label>
              <StarRating
                value={ratings.safety_night}
                onChange={(v) => setRatings({ ...ratings, safety_night: v })}
                size="lg"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.safetyWomen}
              </label>
              <StarRating
                value={ratings.safety_women}
                onChange={(v) => setRatings({ ...ratings, safety_women: v })}
                size="lg"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.theft}
              </label>
              <OptionSelector
                options={[
                  { value: 'rare', label: t.options.rare },
                  { value: 'sometimes', label: t.options.sometimes },
                  { value: 'frequent', label: t.options.frequent },
                ]}
                value={ratings.theft}
                onChange={(v) => setRatings({ ...ratings, theft: v })}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.policeResponse}
              </label>
              <StarRating
                value={ratings.police_response}
                onChange={(v) => setRatings({ ...ratings, police_response: v })}
                size="lg"
              />
            </div>
          </div>
        )}

        {/* Infrastructure Step */}
        {step === 'infrastructure' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.flooding}
              </label>
              <OptionSelector
                options={[
                  { value: 'never', label: t.options.never },
                  { value: 'sometimes', label: t.options.sometimes },
                  { value: 'always', label: t.options.always },
                ]}
                value={ratings.flooding}
                onChange={(v) => setRatings({ ...ratings, flooding: v })}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.loadShedding}
              </label>
              <OptionSelector
                options={[
                  { value: '0', label: t.options.hours0 },
                  { value: '1-2', label: t.options.hours12 },
                  { value: '3-5', label: t.options.hours35 },
                  { value: '5+', label: t.options.hours5plus },
                ]}
                value={ratings.load_shedding}
                onChange={(v) => setRatings({ ...ratings, load_shedding: v })}
                columns={4}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.waterSupply}
              </label>
              <OptionSelector
                options={[
                  { value: '24/7', label: t.options.supply247 },
                  { value: 'scheduled', label: t.options.scheduled },
                  { value: 'irregular', label: t.options.irregular },
                ]}
                value={ratings.water_supply}
                onChange={(v) => setRatings({ ...ratings, water_supply: v })}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.roadCondition}
              </label>
              <StarRating
                value={ratings.road_condition}
                onChange={(v) => setRatings({ ...ratings, road_condition: v })}
                size="lg"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.mobileNetwork}
              </label>
              <StarRating
                value={ratings.mobile_network}
                onChange={(v) => setRatings({ ...ratings, mobile_network: v })}
                size="lg"
              />
            </div>
          </div>
        )}

        {/* Livability Step */}
        {step === 'livability' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.noiseLevel}
              </label>
              <OptionSelector
                options={[
                  { value: 'quiet', label: t.options.quiet },
                  { value: 'moderate', label: t.options.moderate },
                  { value: 'noisy', label: t.options.noisy },
                ]}
                value={ratings.noise_level}
                onChange={(v) => setRatings({ ...ratings, noise_level: v })}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.cleanliness}
              </label>
              <StarRating
                value={ratings.cleanliness}
                onChange={(v) => setRatings({ ...ratings, cleanliness: v })}
                size="lg"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.community}
              </label>
              <StarRating
                value={ratings.community}
                onChange={(v) => setRatings({ ...ratings, community: v })}
                size="lg"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.parking}
              </label>
              <OptionSelector
                options={[
                  { value: 'easy', label: t.options.easy },
                  { value: 'moderate', label: t.options.moderate },
                  { value: 'difficult', label: t.options.difficult },
                ]}
                value={ratings.parking}
                onChange={(v) => setRatings({ ...ratings, parking: v })}
              />
            </div>
          </div>
        )}

        {/* Accessibility Step */}
        {step === 'accessibility' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.transport}
              </label>
              <OptionSelector
                options={[
                  { value: 'easy', label: t.options.easy },
                  { value: 'moderate', label: t.options.moderate },
                  { value: 'difficult', label: t.options.difficult },
                ]}
                value={ratings.transport}
                onChange={(v) => setRatings({ ...ratings, transport: v })}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.mainRoad}
              </label>
              <OptionSelector
                options={[
                  { value: 'walking', label: t.options.walking },
                  { value: '5mins', label: t.options.mins5 },
                  { value: '10mins', label: t.options.mins10 },
                  { value: '15+mins', label: t.options.mins15 },
                ]}
                value={ratings.main_road_distance}
                onChange={(v) => setRatings({ ...ratings, main_road_distance: v })}
                columns={4}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.hospital}
              </label>
              <OptionSelector
                options={[
                  { value: 'yes', label: t.common.yes },
                  { value: 'no', label: t.common.no },
                ]}
                value={ratings.hospital_nearby}
                onChange={(v) => setRatings({ ...ratings, hospital_nearby: v })}
                columns={2}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.school}
              </label>
              <OptionSelector
                options={[
                  { value: 'yes', label: t.common.yes },
                  { value: 'no', label: t.common.no },
                ]}
                value={ratings.school_nearby}
                onChange={(v) => setRatings({ ...ratings, school_nearby: v })}
                columns={2}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.rating.market}
              </label>
              <OptionSelector
                options={[
                  { value: 'walking', label: t.options.walking },
                  { value: '5mins', label: t.options.mins5 },
                  { value: '10mins', label: t.options.mins10 },
                  { value: '15+mins', label: t.options.mins15 },
                ]}
                value={ratings.market_distance}
                onChange={(v) => setRatings({ ...ratings, market_distance: v })}
                columns={4}
              />
            </div>
          </div>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm text-slate-300 mb-3">
                {t.area.writeReview} ({lang === 'bn' ? 'ঐচ্ছিক' : 'Optional'})
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'আপনার অভিজ্ঞতা শেয়ার করুন...'
                    : 'Share your experience...'
                }
                rows={5}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              />
            </div>

            {/* Error message */}
            {submitError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {submitError}
              </div>
            )}

            {/* Login reminder */}
            {!user && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm">
                {lang === 'bn'
                  ? 'রেটিং জমা দিতে লগইন করুন'
                  : 'Please login to submit your rating'}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-8">
        <div className="max-w-lg mx-auto flex gap-3">
          {step !== 'review' ? (
            <button
              onClick={handleNext}
              className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition-colors active:scale-[0.98]"
            >
              {t.common.next}
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push(`/area/${slug}`)}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-medium rounded-2xl transition-colors"
              >
                {t.common.skip}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-semibold rounded-2xl transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {lang === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...'}
                  </>
                ) : (
                  t.rating.submit
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
