'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Plus, Star } from 'lucide-react';
import { tmdb } from '@/lib/tmdb';
import { formatRuntime, getYear, BLUR_DATA_URL } from '@/lib/utils';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

type AnyMedia = (TMDBMovie | TMDBTVShow) & { media_type: 'movie' | 'tv' };

interface HeroCarouselProps {
  items: AnyMedia[];
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

export function HeroCarousel({ items }: HeroCarouselProps) {
  const shouldReduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const hero = items[currentIndex];
  const isMovie = hero.media_type === 'movie';
  const title = isMovie ? (hero as TMDBMovie).title : (hero as TMDBTVShow).name;
  const releaseDate = isMovie ? (hero as TMDBMovie).release_date : (hero as TMDBTVShow).first_air_date;
  const runtime = isMovie ? (hero as TMDBMovie).runtime : undefined;
  const backdrop = tmdb.image(hero.backdrop_path, 'original');
  const href = `/${isMovie ? 'movies' : 'series'}/${hero.id}`;
  const watchHref = `/watch/${hero.id}`;
  const isAdult = 'adult' in hero ? (hero as TMDBMovie).adult : false;

  // Get next 3 items for the side cards
  const sideItems = [
    items[(currentIndex + 1) % items.length],
    items[(currentIndex + 2) % items.length],
    items[(currentIndex + 3) % items.length],
  ];

  const variants = {
    enter: () => ({
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 1.15,
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(20px)',
    }),
    center: {
      zIndex: 1,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: () => ({
      zIndex: 0,
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 1.05,
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(20px)',
    }),
  };

  const textVariants = {
    initial: { opacity: 0, x: shouldReduceMotion ? 0 : -40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: shouldReduceMotion ? 0 : 40 },
  };

  return (
    <div className="relative h-[700px] md:h-[800px] w-full overflow-hidden bg-[#07050f]">
      {/* Film Grain Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={hero.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: 1.2 },
            scale: { duration: 1.5, ease: "easeOut" },
            filter: { duration: 1.0 },
          }}
          className="absolute inset-0"
        >
          {/* Backdrop image */}
          <div className="absolute inset-0">
            <Image
              src={backdrop}
              alt=""
              fill
              className="object-cover object-top opacity-55"
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          </div>

          {/* Cinematic Gradient Overlays */}
          <div className="absolute inset-0 bg-linear-[to_right,#07050f_0%,rgba(7,5,15,0.75)_55%,transparent_100%] z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-[#07050f] via-[#07050f]/60 to-transparent z-10" />
        </motion.div>
      </AnimatePresence>

      {/* Aurora orbs */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div className="absolute w-[900px] h-[600px] -top-48 -left-32 rounded-full bg-[--flx-purple]/25 blur-[120px] animate-aurora" style={{ animationDelay: '0s' }} />
          <div className="absolute w-[700px] h-[500px] top-1/4 -right-24 rounded-full bg-[--flx-cyan]/20 blur-[120px] animate-aurora" style={{ animationDelay: '-3s' }} />
        </div>
      )}

      {/* Content */}
      <div className="relative z-30 flex h-full px-12 md:px-20 items-center">
        <div className="flex flex-col max-w-[800px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={hero.id + '-content'}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={textVariants}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {/* Trending Badge */}
              <div className="flex items-center gap-2 mb-6">
                 <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[--flx-cyan] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[--flx-cyan]"></span>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[4px] text-[--flx-cyan]">Now Trending</span>
              </div>

              <h1 className="font-bebas text-7xl md:text-[100px] leading-[0.85] tracking-[1px] mb-8 text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                {title.split(' ').map((word, i, arr) => (
                  <span 
                    key={i} 
                    className={i === Math.floor(arr.length / 2) 
                      ? 'bg-linear-to-r from-(--flx-cyan) to-(--flx-purple) bg-clip-text text-transparent inline-block py-1' 
                      : 'inline-block py-1'
                    }
                  >
                    {word}{' '}
                  </span>
                ))}
              </h1>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {hero.genre_ids?.slice(0, 3).map(gid => (
                  <span key={gid} className="bg-[--flx-purple]/10 border border-[--flx-purple]/20 text-violet-200 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                    {GENRE_MAP[gid] || 'Featured'}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-5 text-sm text-white/80 mb-8 font-medium">
                <div className="flex items-center gap-1.5">
                  <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                  <span className="text-base font-black text-white">{hero.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-[--flx-cyan] font-black tracking-widest text-xs">96% MATCH</span>
                
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="font-bold">{getYear(releaseDate)}</span>
                
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="bg-white/10 border border-white/20 rounded-md px-2 py-0.5 text-[10px] font-black">
                  {isAdult ? '18+' : 'PG-13'}
                </span>

                {runtime && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/40" />
                    <span className="font-bold">{formatRuntime(runtime)}</span>
                  </>
                )}
              </div>

              <p className="text-[17px] leading-relaxed text-white/70 mb-12 font-light max-w-xl line-clamp-3 drop-shadow-md">
                {hero.overview}
              </p>

              <div className="flex items-center gap-5">
                <Link
                  href={watchHref}
                  className="flex items-center gap-3 bg-white text-black hover:bg-[--flx-purple] hover:text-white font-black text-xs px-12 py-5 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5 group"
                >
                  <Play size={18} fill="currentColor" className="group-hover:animate-pulse" />
                  WATCH NOW
                </Link>
                <Link
                  href={href}
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white text-xs font-black px-8 py-5 rounded-2xl transition-all hover:translate-x-1 uppercase tracking-widest"
                >
                  Details
                </Link>
                <button 
                  aria-label="Add to My List"
                  className="hidden sm:flex w-[60px] h-[60px] items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-2xl transition-all hover:rotate-90 cursor-pointer"
                >
                  <Plus size={24} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Side Stack - Netflix Style */}
        <div className="hidden xl:flex absolute right-20 bottom-32 flex-col items-end gap-8 z-40">
          <div className="flex gap-5 items-end">
             {sideItems.map((item, idx) => {
               const t = 'title' in item ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
               return (
                 <div key={item.id} className="relative group">
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white text-black text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                      {t}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                    </div>

                    <motion.button
                      whileHover={shouldReduceMotion ? {} : { y: -12, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setDirection(idx + 1 > 0 ? 1 : -1);
                        setCurrentIndex(items.findIndex(i => i.id === item.id));
                      }}
                      className={`relative rounded-3xl overflow-hidden transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.6)]
                        ${idx === 0 ? 'w-[180px] h-[270px] ring-2 ring-[--flx-cyan]' : 
                          idx === 1 ? 'w-[140px] h-[210px] opacity-60' : 
                          'w-[110px] h-[160px] opacity-30'}
                      `}
                    >
                      <Image 
                        src={tmdb.image(item.poster_path, 'w342')} 
                        alt="" 
                        fill 
                        className="object-cover"
                        sizes="200px"
                      />
                    </motion.button>
                 </div>
               );
             })}
          </div>
          
          {/* Progress Indicators - Up to 10 */}
          <div className="flex gap-3 pr-4" role="tablist">
            {items.slice(0, 10).map((item, i) => {
              return (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === currentIndex}
                  onClick={() => {
                    setDirection(i > currentIndex ? 1 : -1);
                    setCurrentIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentIndex ? 'w-10 bg-[--flx-cyan] shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'w-3 bg-white/10 hover:bg-white/30'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
