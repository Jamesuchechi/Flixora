'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { UserMenu } from './UserMenu';
import dynamic from 'next/dynamic';

const SearchOverlay = dynamic(() => import('@/components/search/SearchOverlay').then(mod => mod.SearchOverlay), {
  ssr: false
});

const NAV_LINKS = [
  { href: '/home',    label: 'Home' },
  { href: '/movies',  label: 'Movies' },
  { href: '/series',  label: 'Series' },
  { href: '/search',  label: 'Trending' },
  { href: '/profile', label: 'My List' },
];

export function Navbar() {
  const pathname = usePathname();
  const setSearchOpen = useStore((s) => s.setSearchOpen);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-10 h-[60px] border-b border-[--flx-border-p] bg-[--flx-bg]/85 backdrop-blur-xl">
      {/* Logo */}
      <Link href="/home" className="flex items-center gap-2 group">
        <Image 
          src="/logo.png" 
          alt="Flixora" 
          width={132} 
          height={35} 
          className="h-8.5 w-auto transition-transform duration-300 group-hover:scale-105" 
          priority
        />
      </Link>

      {/* Links */}
      <ul className="hidden md:flex items-center gap-6 list-none">
        {NAV_LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                'text-sm tracking-wide transition-colors duration-200',
                pathname === href
                  ? 'text-[--flx-text-1]'
                  : 'text-[--flx-text-3] hover:text-[--flx-text-1]'
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Search - Hidden on very small screens, moved to MobileNav */}
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Open search"
          className="hidden sm:flex items-center gap-2 bg-white/4 hover:bg-white/8 border border-white/8 hover:border-[--flx-purple]/40 rounded-full px-4 py-1.5 text-xs text-[--flx-text-3] hover:text-[--flx-text-2] transition-all cursor-pointer"
        >
          <SearchIcon />
          <span className="hidden sm:inline">Search anything...</span>
          <kbd className="hidden sm:inline text-[10px] bg-white/5 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        {/* Notifications - Desktop only */}
        <button 
          aria-label="Notifications"
          className="hidden sm:flex relative w-[34px] h-[34px] items-center justify-center bg-white/5 hover:bg-white/10 border border-white/8 rounded-full transition-all cursor-pointer text-[--flx-text-2]"
        >
          <BellIcon />
          <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-[--flx-pink] rounded-full border-[1.5px] border-[--flx-bg]" />
        </button>

        {/* User Menu - Always visible for quick access */}
        <UserMenu />
      </div>

      <SearchOverlay />
    </nav>
  );
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
