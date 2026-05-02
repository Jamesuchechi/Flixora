'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/',        label: 'Home' },
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
      <Link href="/" className="font-bebas text-[26px] tracking-[4px] bg-linear-to-r from-[--flx-purple] via-[--flx-cyan] to-[--flx-pink] bg-clip-text text-transparent select-none">
        FLIXORA
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
        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 bg-white/4 hover:bg-white/8 border border-white/8 hover:border-[--flx-purple]/40 rounded-full px-4 py-1.5 text-xs text-[--flx-text-3] hover:text-[--flx-text-2] transition-all cursor-pointer"
        >
          <SearchIcon />
          <span className="hidden sm:inline">Search anything...</span>
          <kbd className="hidden sm:inline text-[10px] bg-white/5 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative w-[34px] h-[34px] flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/8 rounded-full transition-all cursor-pointer text-[--flx-text-2]">
          <BellIcon />
          <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-[--flx-pink] rounded-full border-[1.5px] border-[--flx-bg]" />
        </button>

        {/* Avatar */}
        <div className="w-[34px] h-[34px] rounded-full bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] flex items-center justify-center text-xs font-semibold text-white cursor-pointer select-none">
          JD
        </div>
      </div>
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
