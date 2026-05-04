'use client';

import Image from 'next/image';
import Link from 'next/link';
import { tmdb } from '@/lib/tmdb';
import { cn, getYear, BLUR_DATA_URL } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LandscapeCardProps {
  id: number;
  title: string;
  backdropPath: string | null;
  rating: number;
  releaseDate?: string;
  mediaType?: 'movie' | 'tv';
  className?: string;
}

export function LandscapeCard({
  id, title, backdropPath, rating, releaseDate,
  mediaType = 'movie', className,
}: LandscapeCardProps) {
  const href = `/${mediaType === 'tv' ? 'series' : 'movies'}/${id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("group relative aspect-video rounded-2xl overflow-hidden bg-[--flx-surface-1] border border-white/5 shadow-xl", className)}
    >
      <Link href={href} className="block w-full h-full">
        <Image
          src={tmdb.image(backdropPath, 'w780')}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
        
        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
              <span className="text-[--flx-gold] text-[10px] font-black">★</span>
              <span className="text-white text-[10px] font-bold">{rating.toFixed(1)}</span>
            </div>
            <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{getYear(releaseDate)}</span>
          </div>
          
          <h4 className="font-bebas text-xl text-white tracking-wide group-hover:text-[--flx-cyan] transition-colors line-clamp-1">
            {title}
          </h4>
        </div>

        {/* Hover Action */}
        <div className="absolute top-4 right-4 bg-[--flx-cyan] text-black w-8 h-8 rounded-full flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}
