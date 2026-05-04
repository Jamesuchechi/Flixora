'use client';

import { tmdb } from '@/lib/tmdb';
import { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SpotlightCardProps {
  item: TMDBMovie | TMDBTVShow;
}

export function SpotlightCard({ item }: SpotlightCardProps) {
  const isMovie = 'title' in item;
  const title = isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
  const rating = item.vote_average;
  const overview = item.overview;
  const backdrop = item.backdrop_path;
  const id = item.id;
  const mediaType = isMovie ? 'movie' : 'tv';

  return (
    <section className="px-10 py-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative aspect-video w-full rounded-3xl overflow-hidden group"
      >
        <Image
          src={tmdb.image(backdrop, 'original')}
          alt={title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          priority
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/20 to-transparent" />

        <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[--flx-cyan] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              Spotlight
            </span>
            <div className="flex items-center gap-1.5 text-white/90 text-sm font-bold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {rating.toFixed(1)}
            </div>
          </div>

          <h3 className="font-bebas text-4xl md:text-6xl lg:text-7xl text-white mb-4 tracking-tight">
            {title}
          </h3>

          <p className="text-[--flx-text-2] text-sm md:text-base line-clamp-3 mb-8 max-w-xl font-medium leading-relaxed">
            {overview}
          </p>

          <Link 
            href={`/watch/${mediaType}/${id}`}
            className="w-fit bg-white text-black px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-[2px] hover:bg-[--flx-cyan] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 group/btn"
          >
            Watch Now
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              className="transition-transform duration-300 group-hover/btn:translate-x-1"
            >
              <path d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
