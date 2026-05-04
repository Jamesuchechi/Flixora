'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Star, Info, Trophy } from 'lucide-react';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { tmdb } from '@/lib/tmdb';

interface PinnedMediaProps {
  media: TMDBMovie | TMDBTVShow;
  mediaType: 'movie' | 'tv';
}

export const PinnedMedia: React.FC<PinnedMediaProps> = ({ media, mediaType }) => {
  const title = (media as TMDBMovie).title || (media as TMDBTVShow).name;
  const releaseDate = (media as TMDBMovie).release_date || (media as TMDBTVShow).first_air_date;
  
  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-[--flx-gold]" />
        <h2 className="text-xl font-bold text-white tracking-tight uppercase">Pinned Film</h2>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="group relative w-full aspect-21/9 rounded-3xl overflow-hidden shadow-2xl border border-[--flx-border] bg-[--flx-surface-1]"
      >
        {/* Backdrop */}
        <Image
          src={tmdb.image(media.backdrop_path, 'original')}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[--flx-bg] via-[--flx-bg]/60 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 lg:p-16 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-white/10">
              <Star className="w-4 h-4 text-[--flx-gold] fill-[--flx-gold]" />
              {media.vote_average.toFixed(1)}
            </div>
            <span className="text-white/60 text-sm font-medium">
              {tmdb.releaseYear(releaseDate)}
            </span>
          </div>

          <h3 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tighter">
            {title}
          </h3>

          <p className="text-[--flx-text-2] text-lg mb-8 line-clamp-3 md:line-clamp-4 leading-relaxed">
            {media.overview}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href={`/watch/${media.id}?type=${mediaType}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-3.5 bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white rounded-2xl font-bold shadow-lg shadow-[--flx-purple]/20 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </motion.button>
            </Link>
            <Link href={`/${mediaType === 'movie' ? 'movies' : 'series'}/${media.id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl font-bold border border-white/10 transition-all"
              >
                <Info className="w-5 h-5" />
                View Details
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Floating Detail Overlay on Right (Small Screens) */}
        <div className="absolute top-8 right-8 hidden lg:block">
           <div className="w-48 aspect-2/3 relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl rotate-3 transition-transform group-hover:rotate-0">
             <Image 
              src={tmdb.image(media.poster_path)}
              alt={title}
              fill
              className="object-cover"
             />
           </div>
        </div>
      </motion.div>
    </section>
  );
};
