'use client';

import { LanguageProvider } from '@/hooks/useLanguage';
import { AuthProvider } from '@/hooks/useAuth';
import { BottomNav } from '@/components/layout/BottomNav';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen pb-20">
          {children}
        </div>
        <BottomNav />
      </LanguageProvider>
    </AuthProvider>
  );
}
