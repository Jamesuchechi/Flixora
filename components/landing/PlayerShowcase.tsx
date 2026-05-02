'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Volume2, Maximize2, SkipForward } from 'lucide-react';
import { tmdb } from '@/lib/tmdb';
import type { TMDBMovie } from '@/types/tmdb';

const CAPABILITY_TAGS = [
  { label: 'Keyboard shortcuts', color: 'border-violet-500/30 text-violet-300 bg-violet-500/10' },
  { label: 'Auto-advance',       color: 'border-cyan-500/25 text-cyan-300 bg-cyan-500/8'        },
  { label: '4K + HDR',           color: 'border-yellow-500/20 text-yellow-300 bg-yellow-500/8'      },
  { label: 'Dolby Atmos',        color: 'border-pink-500/25 text-pink-300 bg-pink-500/8'        },
];

interface PlayerShowcaseProps {
  movie?: TMDBMovie;
  trailerKey?: string;
  nextMovies?: TMDBMovie[];
}

export function PlayerShowcase({ movie, trailerKey, nextMovies = [] }: PlayerShowcaseProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!movie) return null;

  return (
    <section className="px-12 py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        {/* Left — text */}
        <div className="animate-fade-up">
          <p className="text-[10px] tracking-[4px] uppercase text-[--flx-purple] font-bold mb-4">THE PLAYER</p>
          <h2 className="font-bebas text-[clamp(44px,7vw,64px)] tracking-[1px] leading-[0.95] mb-8">
            Watch the Way<br />You Want
          </h2>
          <p className="text-[16px] text-[--flx-text-2] font-light leading-relaxed mb-10 max-w-[460px]">
            Our custom-built cinematic player is optimized for speed and immersion. Experience 4K HDR playback with Dolby audio and seamless device syncing.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {CAPABILITY_TAGS.map(({ label, color }) => (
              <span key={label} className={`px-4 py-2 rounded-xl text-[11px] font-semibold border ${color} tracking-wide`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Interactive Player */}
        <div className="relative group">
          {/* Decorative Glows */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[--flx-purple]/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-[--flx-purple]/30 transition-colors duration-700" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[--flx-cyan]/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 bg-white/3 border border-white/10 rounded-[40px] p-4 lg:p-6 shadow-2xl backdrop-blur-md">
            {/* Main Player Area */}
            <div className="aspect-video rounded-[24px] overflow-hidden relative group/player cursor-pointer bg-black shadow-inner">
              {isPlaying && trailerKey ? (
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&modestbranding=1&rel=0`}
                  className="absolute inset-0 w-full h-full border-none"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <Image 
                    src={tmdb.image(movie.backdrop_path, 'original')}
                    alt={movie.title}
                    fill
                    className="object-cover opacity-60 transition-transform duration-1000 group-hover/player:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div 
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center group/btn"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center group-hover/btn:scale-110 group-hover/btn:bg-[--flx-purple] transition-all duration-500 shadow-2xl">
                      <Play className="text-white fill-white ml-1" size={28} />
                    </div>
                  </div>

                  {/* Player Controls Mockup */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/90 via-black/40 to-transparent">
                    <div className="h-1 w-full bg-white/10 rounded-full mb-4 overflow-hidden">
                      <div className="h-full w-[45%] bg-linear-to-r from-[--flx-purple] to-[--flx-cyan] rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Play size={18} className="text-white" />
                        <SkipForward size={18} className="text-white/60" />
                        <Volume2 size={18} className="text-white/60" />
                        <span className="text-[12px] font-bold text-white tracking-[1px] uppercase ml-2">{movie.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] text-white/60 font-mono">01:42:15 / 02:30:00</span>
                        <Maximize2 size={18} className="text-white/60" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Queue Preview */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] text-[--flx-text-3] tracking-[3px] uppercase font-bold">UP NEXT</p>
                <p className="text-[10px] text-[--flx-purple] font-bold cursor-pointer hover:underline">VIEW ALL</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {nextMovies.map((m) => (
                  <div key={m.id} className="group/next relative aspect-video rounded-2xl bg-white/5 border border-white/5 overflow-hidden hover:border-[--flx-purple]/40 transition-all cursor-pointer">
                    <Image 
                      src={tmdb.image(m.backdrop_path, 'w780')}
                      alt={m.title}
                      fill
                      className="object-cover opacity-40 group-hover/next:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover/next:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-[9px] font-bold text-white truncate">{m.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
