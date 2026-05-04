'use client';

import { tmdb } from '@/lib/tmdb';
import { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface EditorialGridProps {
  items: (TMDBMovie | TMDBTVShow)[];
  title: string;
}

export function EditorialGrid({ items, title }: EditorialGridProps) {
  return (
    <section className="px-10 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-bebas text-3xl tracking-[4px] text-[--flx-text-1]">
          {title}
        </h2>
        <div className="h-1 flex-1 mx-8 bg-white/5 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, idx) => {
          const isMovie = 'title' in item;
          const title = isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
          const id = item.id;
          const mediaType = isMovie ? 'movie' : 'tv';
          const backdrop = item.backdrop_path;

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link 
                href={`/watch/${mediaType}/${id}`}
                className="relative block aspect-video rounded-2xl overflow-hidden group border border-white/5"
              >
                <Image
                  src={tmdb.image(backdrop, 'w780')}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-80" />
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h4 className="font-bebas text-2xl text-white tracking-wide group-hover:text-[--flx-cyan] transition-colors">
                    {title}
                  </h4>
                </div>

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    Preview
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
