'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/actions/auth';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const NAV_LINKS = [
  { href: '/',        label: 'Home' },
  { href: '/movies',  label: 'Movies' },
  { href: '/series',  label: 'Series' },
  { href: '/search',  label: 'Search' },
  { href: '/profile', label: 'My List' },
];

export function Navbar() {
  const pathname       = usePathname();
  const router         = useRouter();
  const setSearchOpen  = useStore((s) => s.setSearchOpen);
  const [user, setUser]           = useState<User | null>(null);
  const [menuOpen, setMenuOpen]   = useState(false);
  const menuRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.user_metadata?.full_name
    ? (user.user_metadata.full_name as string).split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'JD';

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-10 h-[60px] border-b border-[--flx-border-p] bg-[--flx-bg]/85 backdrop-blur-xl">
      {/* Logo */}
      <Link href="/" className="font-['Bebas_Neue',sans-serif] text-[26px] tracking-[4px] bg-gradient-to-r from-[--flx-purple] via-[--flx-cyan] to-[--flx-pink] bg-clip-text text-transparent select-none">
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
                pathname === href ? 'text-[--flx-text-1]' : 'text-[--flx-text-3] hover:text-[--flx-text-1]'
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 bg-white/4 hover:bg-white/8 border border-white/8 hover:border-[--flx-purple]/40 rounded-full px-4 py-1.5 text-xs text-[--flx-text-3] hover:text-[--flx-text-2] transition-all cursor-pointer"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline text-[10px] bg-white/5 px-1.5 py-0.5 rounded">K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative w-[34px] h-[34px] flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/8 rounded-full transition-all cursor-pointer text-[--flx-text-2]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-[--flx-pink] rounded-full border-[1.5px] border-[--flx-bg]" />
        </button>

        {/* Avatar / Auth */}
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[--flx-purple] to-[--flx-cyan] flex items-center justify-center text-xs font-semibold text-white cursor-pointer select-none hover:opacity-90 transition-opacity"
            >
              {initials}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 w-52 bg-[--flx-surface-1] border border-[--flx-border] rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[--flx-border]">
                  <p className="text-xs font-medium text-[--flx-text-1] truncate">{user.user_metadata?.full_name ?? 'User'}</p>
                  <p className="text-[10px] text-[--flx-text-3] truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs text-[--flx-text-2] hover:bg-white/5 hover:text-[--flx-text-1] transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    My Profile
                  </Link>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs text-[--flx-text-2] hover:bg-white/5 hover:text-[--flx-text-1] transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    My List
                  </Link>
                  <div className="h-px bg-[--flx-border] my-1" />
                  <form action={signOut}>
                    <button type="submit" className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="text-xs font-medium px-4 py-2 rounded-lg bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
