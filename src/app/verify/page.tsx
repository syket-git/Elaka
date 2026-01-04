'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  CheckCircle,
  Circle,
  Loader2,
  AlertCircle,
  Navigation,
  ChevronRight,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { areas as seedAreas } from '@/lib/seed-data';

interface Area {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
}

interface VerificationStatus {
  is_verified: boolean;
  verification_area_id: string | null;
  valid_checkins: number;
  days_span: number;
  remaining_checkins: number;
  remaining_days: number;
}

type CheckinState = 'idle' | 'locating' | 'checking' | 'success' | 'error';

export default function VerifyPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [checkinState, setCheckinState] = useState<CheckinState>('idle');
  const [checkinResult, setCheckinResult] = useState<{
    distance?: number;
    is_valid?: boolean;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch areas and verification status
  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch areas from Supabase
        const { data: areasData } = await supabase
          .from('areas')
          .select('id, name, name_bn, slug, center_lat, center_lng, radius_meters')
          .order('name');

        if (areasData && areasData.length > 0) {
          setAreas(areasData);
        } else {
          // Use seed data as fallback
          setAreas(
            seedAreas.map((a, i) => ({
              id: `seed-${i}`,
              name: a.name,
              name_bn: a.name_bn,
              slug: a.slug,
              center_lat: 22.35 + Math.random() * 0.05,
              center_lng: 91.8 + Math.random() * 0.05,
              radius_meters: 1500,
            }))
          );
        }

        // Fetch verification status
        const { data: statusData } = await supabase.rpc('get_verification_status');
        if (statusData) {
          setStatus(statusData);
          // If user has a verification area, select it
          if (statusData.verification_area_id) {
            const area = areasData?.find((a: Area) => a.id === statusData.verification_area_id);
            if (area) setSelectedArea(area);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use seed data as fallback
        setAreas(
          seedAreas.map((a, i) => ({
            id: `seed-${i}`,
            name: a.name,
            name_bn: a.name_bn,
            slug: a.slug,
            center_lat: 22.35 + Math.random() * 0.05,
            center_lng: 91.8 + Math.random() * 0.05,
            radius_meters: 1500,
          }))
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, supabase]);

  const handleCheckin = async () => {
    if (!selectedArea || !user) return;

    setCheckinState('locating');
    setCheckinResult(null);

    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      setCheckinState('checking');

      const { latitude, longitude } = position.coords;

      // Call Supabase function
      const { data, error } = await supabase.rpc('checkin_for_verification', {
        p_area_id: selectedArea.id,
        p_latitude: latitude,
        p_longitude: longitude,
      });

      if (error) throw error;

      if (data.success) {
        setCheckinState('success');
        setCheckinResult({
          distance: data.distance,
          is_valid: data.is_valid,
        });

        // Update status
        setStatus((prev) =>
          prev
            ? {
                ...prev,
                valid_checkins: data.checkin_count,
                days_span: data.days_span,
                remaining_checkins: data.remaining_checkins || 0,
                remaining_days: data.remaining_days || 0,
                is_verified: data.verified || false,
              }
            : null
        );
      } else {
        setCheckinState('error');
        setCheckinResult({ error: data.error });
      }
    } catch (error) {
      setCheckinState('error');
      if (error instanceof GeolocationPositionError) {
        setCheckinResult({
          error:
            error.code === 1
              ? t.verification.locationDenied
              : t.verification.checkinFailed,
        });
      } else {
        setCheckinResult({ error: t.verification.checkinFailed });
      }
    }
  };

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen">
        <Header showBack title={t.verification.title} />
        <main className="px-4 py-8 max-w-lg mx-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </main>
      </div>
    );
  }

  // Already verified
  if (status?.is_verified) {
    return (
      <div className="min-h-screen">
        <Header showBack title={t.verification.title} />
        <main className="px-4 py-8 max-w-lg mx-auto">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t.verification.verified}
            </h2>
            <p className="text-slate-400 mb-6">{t.verification.verifiedMessage}</p>
            <button
              onClick={() => router.push('/profile')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
            >
              {t.common.done}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header showBack title={t.verification.title} />

      <main className="px-4 py-6 max-w-lg mx-auto pb-24">
        {/* How it works */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 mb-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            {t.verification.howItWorks}
          </h3>
          <div className="space-y-3">
            <Step number={1} text={t.verification.step1} done={!!selectedArea} />
            <Step
              number={2}
              text={t.verification.step2}
              done={(status?.valid_checkins || 0) >= 3}
              progress={status?.valid_checkins ? `${status.valid_checkins}/3` : undefined}
            />
            <Step number={3} text={t.verification.step3} done={status?.is_verified || false} />
          </div>
        </div>

        {/* Area Selection */}
        {!selectedArea ? (
          <div className="space-y-3">
            <h3 className="font-medium text-white px-1">{t.verification.selectArea}</h3>
            {areas.map((area) => (
              <button
                key={area.id}
                onClick={() => setSelectedArea(area)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
              >
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span className="flex-1 text-left text-white">
                  {lang === 'bn' ? area.name_bn : area.name}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Selected Area */}
            <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {lang === 'bn' ? selectedArea.name_bn : selectedArea.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {lang === 'bn' ? 'চট্টগ্রাম' : 'Chittagong'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArea(null)}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  {lang === 'bn' ? 'পরিবর্তন' : 'Change'}
                </button>
              </div>

              {/* Progress */}
              {status && (
                <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-400">{t.verification.progress}</span>
                    <span className="text-sm font-medium text-emerald-400">
                      {status.valid_checkins}/3 {t.verification.checkinsComplete}
                    </span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full ${
                          i < (status.valid_checkins || 0)
                            ? 'bg-emerald-500'
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  {status.remaining_days > 0 && (
                    <p className="text-xs text-slate-500 text-center">
                      {status.remaining_days} {t.verification.daysRemaining}
                    </p>
                  )}
                </div>
              )}

              {/* Check-in Result */}
              {checkinResult && (
                <div
                  className={`rounded-xl p-4 mb-4 ${
                    checkinResult.is_valid
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {checkinResult.is_valid ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p
                        className={`font-medium ${
                          checkinResult.is_valid ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {checkinResult.is_valid
                          ? t.verification.checkinSuccess
                          : checkinResult.error || t.verification.tooFar}
                      </p>
                      {checkinResult.distance !== undefined && (
                        <p className="text-sm text-slate-400">
                          {t.verification.distance}: {checkinResult.distance}{' '}
                          {t.verification.meters}
                          {' • '}
                          {checkinResult.is_valid
                            ? t.verification.withinArea
                            : t.verification.outsideArea}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Check-in Button */}
              <button
                onClick={handleCheckin}
                disabled={checkinState === 'locating' || checkinState === 'checking'}
                className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium rounded-xl transition-colors"
              >
                {checkinState === 'locating' || checkinState === 'checking' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.verification.checkingLocation}
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    {t.verification.checkin}
                  </>
                )}
              </button>
            </div>

            {/* Tips */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-sm text-amber-200">
                💡{' '}
                {lang === 'bn'
                  ? 'চেক-ইন করতে আপনার বাসায় থাকুন এবং GPS চালু রাখুন'
                  : 'Stay at home and keep GPS enabled for check-in'}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

interface StepProps {
  number: number;
  text: string;
  done: boolean;
  progress?: string;
}

function Step({ number, text, done, progress }: StepProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          done
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-slate-700 text-slate-400'
        }`}
      >
        {done ? <CheckCircle className="w-4 h-4" /> : number}
      </div>
      <span className={`flex-1 ${done ? 'text-emerald-400' : 'text-slate-300'}`}>
        {text}
      </span>
      {progress && <span className="text-xs text-slate-500">{progress}</span>}
    </div>
  );
}
