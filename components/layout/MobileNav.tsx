'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, List, User, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { icon: Home,       label: 'Home',     href: '/home' },
  { icon: Compass,    label: 'Search',   href: '/search' },
  // Center Play button handled separately
  { icon: List,       label: 'My List',  href: '/my-list' },
  { icon: User,       label: 'Profile',  href: '/profile' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[--flx-bg]/90 backdrop-blur-2xl border-t border-white/5 px-6 pt-2 pb-6 flex justify-between items-center h-[72px]">
      {/* First 2 items */}
      {NAV_ITEMS.slice(0, 2).map(({ icon: Icon, label, href }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 relative active:scale-90",
              isActive ? "text-[--flx-cyan]" : "text-[--flx-text-3]"
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            {isActive && (
              <motion.div 
                layoutId="mobile-nav-dot"
                className="w-1 h-1 rounded-full bg-[--flx-cyan] absolute -bottom-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
              />
            )}
          </Link>
        );
      })}

      {/* Center Play Button */}
      <Link 
        href="/trending" 
        className="relative -top-6 group active:scale-95 transition-transform"
      >
        <div className="w-[52px] h-[52px] rounded-full bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)] border-4 border-[--flx-bg] group-hover:scale-110 transition-all duration-300">
          <Play size={24} fill="currentColor" className="ml-1" />
        </div>
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[2px] text-[--flx-text-2] whitespace-nowrap">
          Trending
        </span>
      </Link>

      {/* Last 2 items */}
      {NAV_ITEMS.slice(2).map(({ icon: Icon, label, href }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 relative active:scale-90",
              isActive ? "text-[--flx-cyan]" : "text-[--flx-text-3]"
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            {isActive && (
              <motion.div 
                layoutId="mobile-nav-dot"
                className="w-1 h-1 rounded-full bg-[--flx-cyan] absolute -bottom-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
