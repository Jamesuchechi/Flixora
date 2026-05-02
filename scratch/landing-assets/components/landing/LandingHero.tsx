'use client';

import Link from 'next/link';

export function LandingHero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-12 pt-28 pb-20 overflow-hidden">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(109,40,217,0.2),transparent_70%)]" />

      {/* Aurora orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[700px] h-[500px] -top-48 -left-36 rounded-full bg-[#7c4dff]/20 blur-[90px] animate-aurora" style={{ animationDelay: '0s' }} />
        <div className="absolute w-[600px] h-[400px] -top-24 -right-24 rounded-full bg-[--flx-cyan]/18 blur-[90px] animate-aurora" style={{ animationDelay: '-3s', animationDuration: '13s' }} />
        <div className="absolute w-[500px] h-[350px] -bottom-24 left-1/3 rounded-full bg-[--flx-pink]/15 blur-[90px] animate-aurora" style={{ animationDelay: '-4s', animationDuration: '9s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 animate-fade-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[--flx-purple]/15 border border-[--flx-purple]/30 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse-dot" />
          <span className="text-[11px] tracking-[1.5px] uppercase text-violet-300 font-medium">Now streaming · 50,000+ titles</span>
        </div>

        {/* Headline */}
        <h1 className="font-['Bebas_Neue',sans-serif] text-[clamp(64px,9vw,110px)] leading-[.92] tracking-[2px] mb-6 max-w-[900px] mx-auto">
          Cinema Without{' '}
          <span className="bg-gradient-to-r from-[--flx-cyan] to-[--flx-purple] bg-clip-text text-transparent">
            Limits
          </span>
        </h1>

        <p className="text-[17px] text-[--flx-text-2] leading-relaxed max-w-[500px] mx-auto mb-10 font-light">
          Flixora brings the world&apos;s best movies and series to your screen — in stunning quality, with zero ads, forever.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-14">
          <button
            onClick={() => scrollTo('signup')}
            className="flex items-center gap-2.5 px-8 py-3.5 bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white text-[15px] font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(139,92,246,0.35)] cursor-pointer border-none font-['Outfit',sans-serif]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            Start Watching Free
          </button>
          <button
            onClick={() => scrollTo('features')}
            className="flex items-center gap-2 px-7 py-3.5 bg-white/7 hover:bg-white/12 border border-white/14 text-[--flx-text-1] text-[15px] font-medium rounded-xl transition-all cursor-pointer font-['Outfit',sans-serif]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            How it works
          </button>
        </div>

        {/* Trust bar */}
        <div className="flex items-center justify-center gap-6 flex-wrap text-[12px] text-[--flx-text-3]">
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            4.9 / 5 rating
          </div>
          <span className="w-px h-4 bg-white/8" />
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            2.4M active viewers
          </div>
          <span className="w-px h-4 bg-white/8" />
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
            4K Ultra HD
          </div>
        </div>
      </div>
    </section>
  );
}
