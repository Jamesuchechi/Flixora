'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { UserMenu } from './UserMenu';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const SearchOverlay = dynamic(() => import('@/components/search/SearchOverlay').then(mod => mod.SearchOverlay), {
  ssr: false
});

const NAV_LINKS = [
  { href: '/home',     label: 'Home' },
  { href: '/movies',   label: 'Movies', hasDropdown: true },
  { href: '/series',   label: 'Series', hasDropdown: true },
  { href: '/free',     label: 'Watch Free' },
  { href: '/trending', label: 'Trending' },
  { href: '/search',   label: 'Search' },
  { href: '/my-list',  label: 'My List' },
];

export function Navbar() {
  const pathname = usePathname();
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const unreadCount = useStore((s) => s.unreadNotifications);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "sticky top-0 z-50 flex items-center justify-between px-10 h-[70px] transition-all duration-500",
        isScrolled 
          ? "bg-[--flx-bg]/90 backdrop-blur-xl border-b border-white/5" 
          : "bg-transparent border-b border-transparent"
      )}
    >
      {/* Logo */}
      <Link href="/home" className="flex items-center gap-2 group shrink-0">
        <Image 
          src="/logo.png" 
          alt="Flixora" 
          width={132} 
          height={35} 
          className="h-9 w-auto transition-transform duration-300 group-hover:scale-105" 
          priority
        />
      </Link>

      {/* Links */}
      <ul className="hidden md:flex items-center gap-8 list-none">
        {NAV_LINKS.map(({ href, label, hasDropdown }) => {
          const isActive = pathname === href;
          return (
            <li 
              key={href} 
              className="relative py-4"
              onMouseEnter={() => hasDropdown && setHoveredLink(label)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <Link
                href={href}
                className={cn(
                  'text-sm font-bold tracking-wider transition-all duration-300 relative pb-1',
                  isActive
                    ? 'text-white'
                    : 'text-[--flx-text-3] hover:text-white'
                )}
              >
                {label}
                {isActive && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[--flx-cyan] rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                  />
                )}
              </Link>

              {/* Hover Dropdown */}
              <AnimatePresence>
                {hasDropdown && hoveredLink === label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-[--flx-surface-1]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl mt-1"
                  >
                    <div className="space-y-3">
                      <Link href={`${href}?sort=top_rated`} className="block text-[11px] font-black uppercase tracking-widest text-[--flx-text-2] hover:text-[--flx-cyan] transition-colors">
                        Top Rated
                      </Link>
                      <Link href={`${href}?sort=new`} className="block text-[11px] font-black uppercase tracking-widest text-[--flx-text-2] hover:text-[--flx-cyan] transition-colors">
                        New Releases
                      </Link>
                      <Link href="/genres" className="block text-[11px] font-black uppercase tracking-widest text-[--flx-text-2] hover:text-[--flx-cyan] transition-colors border-t border-white/5 pt-3">
                        By Genre
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* LIVE Badge */}
        {unreadCount > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">{unreadCount} new</span>
          </div>
        )}

        {/* Search */}
        <div className="relative group/search">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[--flx-purple]/40 rounded-full px-4 py-2 text-xs text-[--flx-text-3] hover:text-[--flx-text-2] transition-all duration-300 cursor-pointer w-[140px] focus-within:w-[280px] group-hover/search:w-[160px] group-hover/search:border-[--flx-cyan]/30"
          >
            <SearchIcon />
            <span className="truncate">Search...</span>
            <kbd className="hidden lg:inline text-[9px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 ml-auto font-mono">⌘K</kbd>
          </button>
        </div>

        {/* Notifications */}
        <Link 
          href="/notifications"
          aria-label="Notifications"
          className="hidden sm:flex relative w-10 h-10 items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all cursor-pointer text-[--flx-text-2] hover:text-[--flx-cyan]"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[--flx-pink] rounded-full border-2 border-[--flx-bg] shadow-[0_0_8px_rgba(244,114,182,0.5)]" />
          )}
        </Link>

        {/* User Menu */}
        <UserMenu />
      </div>

      <SearchOverlay />
    </nav>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

