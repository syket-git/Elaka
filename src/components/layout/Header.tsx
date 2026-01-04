'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { Globe, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  showBack?: boolean;
  showLanguageToggle?: boolean;
  transparent?: boolean;
}

export function Header({
  title,
  showLogo = true,
  showBack = false,
  showLanguageToggle = true,
  transparent = false,
}: HeaderProps) {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  const toggleLanguage = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 px-4 py-3',
        transparent
          ? 'bg-transparent'
          : 'bg-slate-900/95 backdrop-blur-lg border-b border-slate-800'
      )}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {showBack ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 -ml-1.5 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <h1 className="text-lg font-semibold text-white">{title}</h1>
          </div>
        ) : showLogo ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">এ</span>
            </div>
            <span className="text-xl font-bold text-white">{t.appName}</span>
          </div>
        ) : (
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        )}

        {showLanguageToggle && (
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-sm text-slate-300 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>{lang === 'bn' ? 'EN' : 'বাং'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
