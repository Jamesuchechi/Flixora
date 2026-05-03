'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Info, Plus, Star } from 'lucide-react';
import { tmdb } from '@/lib/tmdb';
import { Badge } from '@/components/ui/Badge';
import { formatRuntime, getYear, BLUR_DATA_URL } from '@/lib/utils';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

type AnyMedia = (TMDBMovie | TMDBTVShow) & { media_type: 'movie' | 'tv' };

interface HeroCarouselProps {
  items: AnyMedia[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const shouldReduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

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

  // Get next 3 items for the side cards
  const sideItems = [
    items[(currentIndex + 1) % items.length],
    items[(currentIndex + 2) % items.length],
    items[(currentIndex + 3) % items.length],
  ];

  const variants = {
    enter: () => ({
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 1.1,
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(10px)',
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
      scale: shouldReduceMotion ? 1 : 0.95,
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(10px)',
    }),
  };

  const textVariants = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: shouldReduceMotion ? 0 : -20 },
  };

  return (
    <div className="relative h-[600px] w-full overflow-hidden bg-[--flx-bg]">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={hero.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: 0.8 },
            scale: { duration: 1.2 },
            filter: { duration: 0.8 },
          }}
          className="absolute inset-0"
        >
          {/* Backdrop image */}
          <div className="absolute inset-0">
            <Image
              src={backdrop}
              alt=""
              fill
              className="object-cover object-top opacity-40"
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-linear-to-r from-[--flx-bg] via-[--flx-bg]/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-linear-to-t from-[--flx-bg] to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Aurora orbs */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[800px] h-[500px] -top-48 -left-32 rounded-full bg-[--flx-purple]/20 blur-[100px] animate-aurora" style={{ animationDelay: '0s' }} />
          <div className="absolute w-[600px] h-[400px] top-0 -right-24 rounded-full bg-[--flx-cyan]/15 blur-[100px] animate-aurora" style={{ animationDelay: '-3s' }} />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full px-12 items-center">
        <div className="flex flex-col max-w-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={hero.id + '-content'}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={textVariants}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Badge variant="purple" className="mb-6 self-start px-3 py-1 text-[10px] uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mr-2 animate-pulse" />
                Featured Selection
              </Badge>

              <h1 className="font-bebas text-[50px] md:text-[90px] leading-[0.95] tracking-[1px] mb-6 text-[--flx-text-1]">
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

              <div className="flex items-center gap-4 text-sm text-[--flx-text-2] mb-6 font-medium">
                <div className="flex items-center gap-1.5 text-[--flx-gold]">
                  <Star size={16} fill="currentColor" />
                  <span className="text-base font-bold">{hero.vote_average.toFixed(1)}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{getYear(releaseDate)}</span>
                {runtime && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{formatRuntime(runtime)}</span>
                  </>
                )}
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="bg-white/10 border border-white/10 rounded px-2.5 py-0.5 text-[11px] uppercase tracking-wider">
                  {isMovie ? 'Movie' : 'TV Series'}
                </span>
              </div>

              <p className="text-[15px] leading-relaxed text-[--flx-text-1]/60 mb-10 font-light max-w-lg line-clamp-3">
                {hero.overview}
              </p>

              <div className="flex items-center gap-4">
                <Link
                  href={watchHref}
                  className="flex items-center gap-2.5 bg-white text-black hover:bg-white/90 font-bold text-sm px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                >
                  <Play size={18} fill="currentColor" />
                  Play Now
                </Link>
                <Link
                  href={href}
                  className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white text-sm font-semibold px-6 py-4 rounded-xl transition-all hover:translate-x-1"
                >
                  <Info size={18} />
                  More Info
                </Link>
                <button 
                  aria-label="Add to My List"
                  className="hidden sm:flex w-[52px] h-[52px] items-center justify-center bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white rounded-xl transition-all hover:rotate-90 cursor-pointer"
                >
                  <Plus size={22} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Side Stack - Hidden on Mobile */}
        <div className="hidden lg:flex absolute right-12 bottom-20 flex-col items-end gap-6">
          <div className="flex gap-4 items-end">
             {sideItems.map((item, idx) => {
               const t = 'title' in item ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
               return (
                 <motion.button
                   key={item.id}
                   whileHover={shouldReduceMotion ? {} : { y: -10, scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => {
                     setDirection(idx + 1 > 0 ? 1 : -1);
                     setCurrentIndex(items.findIndex(i => i.id === item.id));
                   }}
                   aria-label={`Switch to ${t}`}
                   className={`relative rounded-2xl overflow-hidden transition-all duration-500 shadow-2xl group
                     ${idx === 0 ? 'w-[160px] h-[240px] opacity-100 ring-2 ring-[--flx-purple]/50' : 
                       idx === 1 ? 'w-[130px] h-[190px] opacity-60 hover:opacity-100' : 
                       'w-[110px] h-[160px] opacity-40 hover:opacity-100'}
                   `}
                 >
                   <Image 
                     src={tmdb.image(item.poster_path, 'w342')} 
                     alt="" 
                     fill 
                     className="object-cover"
                     sizes="200px"
                     placeholder="blur"
                     blurDataURL={BLUR_DATA_URL}
                   />
                   <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                     <p className="text-[10px] font-bold text-white truncate">{t}</p>
                   </div>
                 </motion.button>
               );
             })}
          </div>
          
          {/* Progress Indicators */}
          <div className="flex gap-2 pr-4" role="tablist">
            {items.slice(0, 5).map((item, i) => {
              const t = 'title' in item ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
              return (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === currentIndex}
                  aria-label={`Go to slide ${i + 1}: ${t}`}
                  onClick={() => {
                    setDirection(i > currentIndex ? 1 : -1);
                    setCurrentIndex(i);
                  }}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === currentIndex ? 'w-8 bg-[--flx-purple]' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Bottom info bar refinement */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-black/40 to-transparent z-20 pointer-events-none" />
    </div>
  );
}
