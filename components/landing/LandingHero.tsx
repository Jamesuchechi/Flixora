'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { tmdb } from '@/lib/tmdb';
import type { TMDBMovie } from '@/types/tmdb';

interface LandingHeroProps {
  backdrops?: TMDBMovie[];
}

export function LandingHero({ backdrops = [] }: LandingHeroProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (backdrops.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % backdrops.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [backdrops.length]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-12 pt-28 pb-20 overflow-hidden">
      {/* Background Images Carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {backdrops.length > 0 ? (
            <motion.div
              key={backdrops[index].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              <Image
                src={tmdb.image(backdrops[index].backdrop_path, 'original')}
                alt="Background"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(109,40,217,0.2),transparent_70%)]" />
          )}
        </AnimatePresence>
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-[--flx-bg]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(139,92,246,0.15),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-linear-to-t from-[--flx-bg] to-transparent" />
      </div>

      {/* Aurora orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
        <div className="absolute w-[700px] h-[500px] -top-48 -left-32 rounded-full bg-[#7c4dff]/15 blur-[100px] animate-aurora" style={{ animationDelay: '0s' }} />
        <div className="absolute w-[600px] h-[400px] top-0 -right-24 rounded-full bg-[--flx-cyan]/10 blur-[100px] animate-aurora" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 animate-fade-up flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-[--flx-purple] animate-pulse" />
          <span className="text-[10px] tracking-[2px] uppercase text-[--flx-text-2] font-semibold">Premium Streaming Experience</span>
        </div>

        {/* Headline */}
        <h1 className="font-bebas text-[clamp(60px,10vw,115px)] leading-[0.88] tracking-[1px] mb-8 max-w-[1000px] text-white">
          Cinema Without{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-violet-400 to-pink-400 brightness-125">
            Limits
          </span>
        </h1>

        <p className="text-[17px] text-[--flx-text-2] leading-relaxed max-w-[540px] mb-12 font-light">
          Flixora brings the world&apos;s best movies and series to your screen — in stunning 4K, with zero ads, and zero interruptions.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4 flex-wrap mb-16">
          <button
            onClick={() => scrollTo('signup')}
            className="flex items-center gap-2.5 px-10 py-4 bg-white text-black hover:bg-white/90 text-[15px] font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5 cursor-pointer border-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            Start Watching Free
          </button>
          <button
            onClick={() => scrollTo('features')}
            className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white text-[15px] font-semibold rounded-2xl transition-all hover:translate-x-1 cursor-pointer"
          >
            Learn More
          </button>
        </div>

        {/* Trust bar */}
        <div className="flex items-center justify-center gap-8 flex-wrap text-[11px] text-[--flx-text-3] uppercase tracking-[2px] font-medium">
          <div className="flex items-center gap-2">
            <span className="text-[--flx-gold]">★</span> 4.9/5 Rating
          </div>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <div>2.4M Viewers</div>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <div>4K Ultra HD</div>
        </div>
      </div>
    </section>
  );
}
