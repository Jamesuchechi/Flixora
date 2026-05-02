'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing',  href: '#pricing'  },
  { label: 'FAQ',      href: '#faq'      },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 transition-all duration-500 px-6 lg:px-12",
          scrolled || mobileMenuOpen ? "py-4 bg-[#090514]/95 backdrop-blur-xl border-b border-white/5" : "py-8 bg-transparent",
          // High z-index to stay above sections, but below the toggle button's container
          "z-400"
        )}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link href="/" className="relative z-510" onClick={() => setMobileMenuOpen(false)}>
            <Image src="/logo.png" alt="Flixora" width={132} height={33} className="h-8 w-auto" priority />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map(link => (
              <Link 
                key={link.label} 
                href={link.href} 
                className="text-[13px] font-medium text-white/60 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-[13px] font-medium text-white hover:text-white/80 transition-opacity px-6">
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="bg-white text-black text-[13px] font-bold px-6 py-2.5 rounded-full hover:bg-white/90 transition-all shadow-lg shadow-white/5"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Menu Toggle — Highest Z-Index */}
          <button 
            className="md:hidden relative z-510 p-2 text-white bg-white/5 rounded-xl border border-white/10 active:scale-95 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay — Solid & High Priority */}
      <div 
        className={cn(
          "fixed inset-0 z-500 bg-[#090514] transition-all duration-500 md:hidden flex flex-col items-center justify-center p-12",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-y-8"
        )}
        onClick={() => setMobileMenuOpen(false)} // Click background to close
      >
        <div className="flex flex-col items-center gap-10 w-full" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link 
                key={link.label} 
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className="text-[32px] font-bebas tracking-[3px] text-white/60 hover:text-white transition-all active:scale-110"
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="h-px w-20 bg-white/10 my-4" />
          
          <div className="flex flex-col items-center gap-6 w-full max-w-[300px]">
            <Link 
              href="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-white hover:text-[--flx-purple] transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-[--flx-purple] text-white text-center py-4 rounded-2xl font-bold text-[15px] shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
