'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Shield, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type AuthMethod = 'email' | 'phone';
type Step = 'input' | 'otp' | 'success';
type Mode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const { signUpWithEmail, signInWithEmail, signInWithOtp, verifyOtp } = useAuth();

  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('input');

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
  };

  const getFullPhone = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('880')) return `+${digits}`;
    if (digits.startsWith('0')) return `+88${digits}`;
    return `+880${digits}`;
  };

  // Email authentication
  const handleEmailAuth = async () => {
    if (!email || !password) {
      setError(lang === 'bn' ? 'ইমেইল ও পাসওয়ার্ড দিন' : 'Enter email and password');
      return;
    }

    if (password.length < 6) {
      setError(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = mode === 'signup'
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      setStep('success');
      setLoading(false);
      // For signup, show success message about email verification
    } else {
      setStep('success');
      setLoading(false);
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    }
  };

  // Phone OTP
  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError(lang === 'bn' ? 'সঠিক ফোন নম্বর দিন' : 'Enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await signInWithOtp(getFullPhone());

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setStep('otp');
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError(lang === 'bn' ? '৬ সংখ্যার কোড দিন' : 'Enter 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await verifyOtp(getFullPhone(), otp);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setStep('success');
    setLoading(false);

    setTimeout(() => {
      router.push('/profile');
    }, 1500);
  };

  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
  };

  // Success screen
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {mode === 'signup' && authMethod === 'email'
              ? (lang === 'bn' ? 'ইমেইল যাচাই করুন!' : 'Check your email!')
              : (lang === 'bn' ? 'সফলভাবে লগইন হয়েছে!' : 'Successfully logged in!')}
          </h2>
          <p className="text-slate-400">
            {mode === 'signup' && authMethod === 'email'
              ? (lang === 'bn' ? 'আপনার ইমেইলে একটি লিংক পাঠানো হয়েছে' : 'A verification link has been sent to your email')
              : (lang === 'bn' ? 'আপনাকে রিডাইরেক্ট করা হচ্ছে...' : 'Redirecting you...')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => {
              if (step === 'otp') {
                setStep('input');
                setOtp('');
              } else {
                router.back();
              }
            }}
            className="p-2 -ml-2 hover:bg-slate-800 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <h1 className="font-semibold text-white">
            {mode === 'signup'
              ? (lang === 'bn' ? 'সাইন আপ' : 'Sign Up')
              : (lang === 'bn' ? 'লগইন' : 'Login')}
          </h1>
        </div>
      </header>

      <main className="px-4 py-8 max-w-lg mx-auto">
        {/* Auth Method Tabs */}
        {step === 'input' && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setAuthMethod('email');
                setError('');
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors',
                authMethod === 'email'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              )}
            >
              <Mail className="w-4 h-4" />
              {lang === 'bn' ? 'ইমেইল' : 'Email'}
            </button>
            <button
              onClick={() => {
                setAuthMethod('phone');
                setError('');
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors',
                authMethod === 'phone'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              )}
            >
              <Phone className="w-4 h-4" />
              {lang === 'bn' ? 'ফোন' : 'Phone'}
            </button>
          </div>
        )}

        {/* Email Auth Form */}
        {authMethod === 'email' && step === 'input' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {mode === 'signup'
                  ? (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account')
                  : (lang === 'bn' ? 'ইমেইল দিয়ে লগইন' : 'Login with Email')}
              </h2>
              <p className="text-slate-400 text-sm">
                {lang === 'bn'
                  ? 'আপনার ইমেইল ও পাসওয়ার্ড দিন'
                  : 'Enter your email and password'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {lang === 'bn' ? 'ইমেইল' : 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={lang === 'bn' ? 'কমপক্ষে ৬ অক্ষর' : 'At least 6 characters'}
                    className="w-full px-4 py-3 pr-12 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                onClick={handleEmailAuth}
                disabled={loading || !email || !password}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {lang === 'bn' ? 'অপেক্ষা করুন...' : 'Please wait...'}
                  </>
                ) : mode === 'signup' ? (
                  lang === 'bn' ? 'সাইন আপ করুন' : 'Sign Up'
                ) : (
                  lang === 'bn' ? 'লগইন করুন' : 'Login'
                )}
              </button>

              <div className="text-center">
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError('');
                  }}
                  className="text-sm text-emerald-400 hover:text-emerald-300"
                >
                  {mode === 'login'
                    ? (lang === 'bn' ? 'অ্যাকাউন্ট নেই? সাইন আপ করুন' : "Don't have an account? Sign Up")
                    : (lang === 'bn' ? 'অ্যাকাউন্ট আছে? লগইন করুন' : 'Already have an account? Login')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phone Input Step */}
        {authMethod === 'phone' && step === 'input' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {lang === 'bn' ? 'ফোন নম্বর দিন' : 'Enter phone number'}
              </h2>
              <p className="text-slate-400 text-sm">
                {lang === 'bn'
                  ? 'আমরা আপনার নম্বরে একটি ওটিপি পাঠাব'
                  : 'We will send an OTP to your number'}
              </p>
            </div>

            {/* Twilio Notice */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
              <p className="text-amber-300 text-xs text-center">
                {lang === 'bn'
                  ? '⚠️ ফোন ওটিপি-র জন্য Twilio সেটআপ প্রয়োজন। ইমেইল ব্যবহার করুন।'
                  : '⚠️ Phone OTP requires Twilio setup. Please use Email instead.'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {lang === 'bn' ? 'ফোন নম্বর' : 'Phone number'}
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300">
                    +880
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="1XXX-XXX-XXX"
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading || phone.replace(/\D/g, '').length < 10}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {lang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}
                  </>
                ) : (
                  lang === 'bn' ? 'ওটিপি পাঠান' : 'Send OTP'
                )}
              </button>
            </div>
          </div>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {lang === 'bn' ? 'ওটিপি যাচাই করুন' : 'Verify OTP'}
              </h2>
              <p className="text-slate-400 text-sm">
                {lang === 'bn'
                  ? `${getFullPhone()} নম্বরে পাঠানো ৬ সংখ্যার কোড দিন`
                  : `Enter the 6-digit code sent to ${getFullPhone()}`}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {lang === 'bn' ? 'ওটিপি কোড' : 'OTP Code'}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {lang === 'bn' ? 'যাচাই হচ্ছে...' : 'Verifying...'}
                  </>
                ) : (
                  lang === 'bn' ? 'যাচাই করুন' : 'Verify'
                )}
              </button>

              <button
                onClick={() => {
                  setOtp('');
                  setError('');
                  handleSendOtp();
                }}
                disabled={loading}
                className="w-full py-3 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
              >
                {lang === 'bn' ? 'আবার ওটিপি পাঠান' : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-500 mt-8">
          {lang === 'bn'
            ? 'লগইন করে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন'
            : 'By logging in, you agree to our terms of service'}
        </p>
      </main>
    </div>
  );
}
