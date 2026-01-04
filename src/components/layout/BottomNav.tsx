'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', icon: Home, label: t.nav.home },
    { href: '/search', icon: Search, label: t.nav.search },
    { href: '/ask', icon: MessageCircle, label: t.nav.ask },
    { href: '/profile', icon: User, label: t.nav.profile },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
                  isActive
                    ? 'text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <item.icon className={cn('w-6 h-6', isActive && 'scale-110')} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-slate-900" />
    </nav>
  );
}
