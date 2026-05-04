'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { History, PlayCircle, Clock } from 'lucide-react';
import type { WatchProgress } from '@/types/supabase';
import { tmdb } from '@/lib/tmdb';

interface EnrichedWatchProgress extends WatchProgress {
  title?: string;
  backdrop_path?: string | null;
}

interface ActivityMiniFeedProps {
  history: EnrichedWatchProgress[];
}

export const ActivityMiniFeed: React.FC<ActivityMiniFeedProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-5 h-5 text-[--flx-cyan]" />
        <h2 className="text-xl font-bold text-white tracking-tight uppercase">Recent Activity</h2>
      </div>

      <div className="grid gap-4">
        {history.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group flex items-center gap-4 p-3 rounded-2xl bg-[--flx-surface-1] border border-[--flx-border] hover:border-[--flx-border-p] transition-all"
          >
            <div className="relative w-24 aspect-video rounded-lg overflow-hidden shrink-0 bg-[--flx-surface-2]">
               {item.backdrop_path ? (
                 <Image
                   src={tmdb.image(item.backdrop_path, 'w300')}
                   alt={item.title || 'Media'}
                   fill
                   className="object-cover group-hover:scale-110 transition-transform duration-500"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center">
                    <PlayCircle className="w-6 h-6 text-white/40" />
                 </div>
               )}
               <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate group-hover:text-[--flx-cyan] transition-colors">
                {item.title || (item.media_type === 'movie' ? 'Watched a movie' : `Watched Episode`)}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-[--flx-text-3]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(item.updated_at).toLocaleDateString()}
                </span>
                <span className="text-[--flx-cyan] font-medium">
                  {Math.round(item.progress)}% complete
                </span>
              </div>
            </div>

            <Link href={`/watch/${item.tmdb_id}?type=${item.media_type}`}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl bg-[--flx-surface-2] text-white hover:bg-[--flx-purple] transition-colors"
              >
                <PlayCircle className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
