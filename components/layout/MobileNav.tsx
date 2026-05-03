'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, List, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

const NAV_ITEMS = [
  { icon: Home,    label: 'Home',     href: '/home' },
  { icon: Compass, label: 'Explore',  href: '/search' },
  { icon: List,    label: 'My List',  href: '/my-list' },
  { icon: User,    label: 'Profile',  href: '/profile' },
];

export function MobileNav() {
  const pathname = usePathname();
  const setSearchOpen = useStore((s) => s.setSearchOpen);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[--flx-bg]/90 backdrop-blur-2xl border-t border-white/5 px-6 pt-3 pb-6 flex justify-between items-center">
      {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300",
              isActive ? "text-[--flx-purple] scale-110" : "text-[--flx-text-3] hover:text-[--flx-text-2]"
            )}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            {isActive && (
              <div className="w-1 h-1 rounded-full bg-[--flx-purple] absolute -bottom-2" />
            )}
          </Link>
        );
      })}
      
      {/* Mobile Search Trigger */}
      <button
        onClick={() => setSearchOpen(true)}
        className="flex flex-col items-center gap-1.5 text-[--flx-text-3] hover:text-[--flx-text-2] transition-all cursor-pointer"
      >
        <Search size={22} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Search</span>
      </button>
    </nav>
  );
}
