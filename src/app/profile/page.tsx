'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  User,
  Star,
  MessageSquare,
  CheckCircle,
  LogIn,
  ChevronRight,
  Globe,
  Bell,
  HelpCircle,
  Shield,
  Loader2,
  MapPin,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';

interface UserStats {
  ratings_count: number;
  reviews_count: number;
  is_verified: boolean;
  verified_area: { name: string; name_bn: string } | null;
}

interface UserReview {
  id: string;
  content: string;
  created_at: string;
  areas: {
    id: string;
    name: string;
    name_bn: string;
    slug: string;
  };
}

interface UserRating {
  id: string;
  created_at: string;
  areas: {
    id: string;
    name: string;
    name_bn: string;
    slug: string;
  };
}

export default function ProfilePage() {
  const { lang, setLang, t } = useLanguage();
  const { user, loading, signOut } = useAuth();

  const [stats, setStats] = useState<UserStats>({
    ratings_count: 0,
    reviews_count: 0,
    is_verified: false,
    verified_area: null,
  });
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch user stats from API
  useEffect(() => {
    async function fetchStats() {
      if (!user) {
        setLoadingStats(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/stats?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setReviews(data.reviews || []);
          setRatings(data.ratings || []);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, [user]);

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 13) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 10)}-${digits.slice(10)}`;
    }
    return phone;
  };

  const getDisplayName = () => {
    if (user?.email) {
      return user.email;
    }
    if (user?.phone) {
      return formatPhone(user.phone);
    }
    return lang === 'bn' ? 'ব্যবহারকারী' : 'User';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header showLogo={false} title={t.profile.title} />
        <main className="px-4 py-8 max-w-lg mx-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header showLogo={false} title={t.profile.title} />

        <main className="px-4 py-8 max-w-lg mx-auto">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {lang === 'bn' ? 'লগইন করুন' : 'Login'}
            </h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
              {lang === 'bn'
                ? 'এলাকা রেট করতে এবং রিভিউ দিতে লগইন করুন'
                : 'Login to rate areas and write reviews'}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
            >
              <LogIn className="w-5 h-5" />
              {t.auth.login}
            </Link>
          </div>

          {/* Settings even when logged out */}
          <div className="mt-8 space-y-2">
            <SettingsItem
              icon={Globe}
              label={lang === 'bn' ? 'ভাষা' : 'Language'}
              value={lang === 'bn' ? 'বাংলা' : 'English'}
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            />
            <SettingsItem
              icon={HelpCircle}
              label={lang === 'bn' ? 'সাহায্য' : 'Help'}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Header showLogo={false} title={t.profile.title} />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Profile Card */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white truncate max-w-48">
                  {getDisplayName()}
                </span>
                {stats.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    {t.profile.verifiedBadge}
                  </span>
                )}
              </div>
              {stats.is_verified && stats.verified_area && (
                <p className="text-sm text-slate-400 mt-1">
                  {lang === 'bn' ? stats.verified_area.name_bn : stats.verified_area.name}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-700/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-white">
                <Star className="w-5 h-5 text-amber-400" />
                {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.ratings_count}
              </div>
              <div className="text-xs text-slate-400 mt-1">{t.profile.myRatings}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-white">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.reviews_count}
              </div>
              <div className="text-xs text-slate-400 mt-1">{t.profile.myReviews}</div>
            </div>
          </div>
        </div>

        {/* Verify Address CTA */}
        {!stats.is_verified && (
          <Link
            href="/verify"
            className="block bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 hover:bg-amber-500/15 transition-colors"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white mb-1">
                  {lang === 'bn' ? 'ঠিকানা যাচাই করুন' : 'Verify your address'}
                </h3>
                <p className="text-sm text-slate-400 mb-3">
                  {lang === 'bn'
                    ? 'আপনার এলাকার জন্য রেটিং দিতে ঠিকানা যাচাই করুন'
                    : 'Verify your address to rate your area'}
                </p>
                <span className="text-sm text-amber-400 font-medium">
                  {lang === 'bn' ? 'যাচাই করুন →' : 'Verify now →'}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* My Reviews */}
        {reviews.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3 px-1">
              {t.profile.myReviews}
            </h3>
            <div className="space-y-3">
              {reviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/area/${review.areas.slug}`}
                  className="block bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-white">
                      {lang === 'bn' ? review.areas.name_bn : review.areas.name}
                    </span>
                    <span className="text-xs text-slate-500 ml-auto">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {review.content}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* My Ratings */}
        {ratings.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3 px-1">
              {t.profile.myRatings}
            </h3>
            <div className="space-y-2">
              {ratings.map((rating) => (
                <Link
                  key={rating.id}
                  href={`/area/${rating.areas.slug}`}
                  className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700/50 hover:bg-slate-800 transition-colors"
                >
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="flex-1 text-sm text-white">
                    {lang === 'bn' ? rating.areas.name_bn : rating.areas.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatDate(rating.created_at)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loadingStats && reviews.length === 0 && ratings.length === 0 && (
          <div className="text-center py-8 bg-slate-800/30 rounded-2xl mb-6">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-4">
              {lang === 'bn'
                ? 'আপনি এখনো কোনো রেটিং বা রিভিউ দেননি'
                : "You haven't submitted any ratings or reviews yet"}
            </p>
            <Link
              href="/search"
              className="text-emerald-400 text-sm font-medium hover:underline"
            >
              {lang === 'bn' ? 'এলাকা খুঁজুন এবং রেট করুন →' : 'Find an area to rate →'}
            </Link>
          </div>
        )}

        {/* Settings */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-400 mb-3 px-1">
            {lang === 'bn' ? 'সেটিংস' : 'Settings'}
          </h3>

          <SettingsItem
            icon={Globe}
            label={lang === 'bn' ? 'ভাষা' : 'Language'}
            value={lang === 'bn' ? 'বাংলা' : 'English'}
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
          />

          <SettingsItem
            icon={Bell}
            label={lang === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}
            value={lang === 'bn' ? 'চালু' : 'On'}
          />

          <SettingsItem
            icon={HelpCircle}
            label={lang === 'bn' ? 'সাহায্য' : 'Help'}
          />

          <div className="pt-4">
            <button
              onClick={() => signOut()}
              className="w-full py-3 text-red-400 text-sm font-medium hover:bg-red-500/10 rounded-xl transition-colors"
            >
              {t.auth.logout}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

interface SettingsItemProps {
  icon: typeof User;
  label: string;
  value?: string;
  onClick?: () => void;
}

function SettingsItem({ icon: Icon, label, value, onClick }: SettingsItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
    >
      <Icon className="w-5 h-5 text-slate-400" />
      <span className="flex-1 text-left text-white">{label}</span>
      {value && <span className="text-sm text-slate-400">{value}</span>}
      <ChevronRight className="w-4 h-4 text-slate-500" />
    </button>
  );
}
