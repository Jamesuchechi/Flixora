'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 h-16 transition-all duration-300',
        scrolled && 'bg-[--flx-bg]/92 backdrop-blur-xl border-b border-[--flx-border-p]'
      )}
    >
      {/* Logo */}
      <Link
        href="/"
        className="font-['Bebas_Neue',sans-serif] text-[26px] tracking-[4px] bg-gradient-to-r from-[--flx-purple] via-[--flx-cyan] to-[--flx-pink] bg-clip-text text-transparent select-none"
      >
        FLIXORA
      </Link>

      {/* Links */}
      <ul className="hidden md:flex items-center gap-7 list-none">
        {[
          { label: 'Features', id: 'features' },
          { label: 'Pricing',  id: 'pricing'  },
          { label: 'FAQ',      id: 'faq'       },
        ].map(({ label, id }) => (
          <li key={id}>
            <button
              onClick={() => scrollTo(id)}
              className="text-[13px] text-[--flx-text-3] hover:text-[--flx-text-1] transition-colors cursor-pointer bg-transparent border-none font-['Outfit',sans-serif]"
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* CTAs */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/login"
          className="px-4 py-2 text-[13px] text-[--flx-text-1] border border-white/12 rounded-lg hover:bg-white/8 transition-all"
        >
          Sign In
        </Link>
        <button
          onClick={() => scrollTo('signup')}
          className="px-5 py-2 bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white text-[13px] font-semibold rounded-lg transition-all hover:-translate-y-px cursor-pointer border-none font-['Outfit',sans-serif]"
        >
          Get Started Free
        </button>
      </div>
    </nav>
  );
}
