'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CastRow } from '@/components/movie/CastRow';
import { MovieRow } from '@/components/home/MovieRow';
import { Star } from 'lucide-react';
import type { TMDBCastMember, TMDBMovie } from '@/types/tmdb';

interface WatchMetadataTabsProps {
  overview: string;
  genres: string[];
  director?: string;
  runtime?: number;
  language?: string;
  cast: TMDBCastMember[];
  similar: TMDBMovie[];
}

export function WatchMetadataTabs({ overview, genres, director, runtime, language, cast, similar }: WatchMetadataTabsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'similar' | 'reviews'>('overview');

  const tabs: { id: 'overview' | 'cast' | 'similar' | 'reviews'; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'cast', label: 'Cast' },
    { id: 'similar', label: 'More Like This' },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="space-y-8">
      {/* Tab Headers */}
      <div className="flex items-center gap-8 border-b border-white/5 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-4 text-[11px] font-black uppercase tracking-[3px] transition-all relative whitespace-nowrap",
              activeTab === tab.id ? "text-[--flx-cyan]" : "text-white/40 hover:text-white"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--flx-cyan]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-6">
              <p className="text-lg leading-relaxed text-white/70">{overview}</p>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <span key={g} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-widest">{g}</span>
                ))}
              </div>
            </div>
            <div className="space-y-6 bg-white/5 rounded-3xl p-8 border border-white/5">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[2px] text-white/20">Director</p>
                <p className="text-sm font-bold text-white">{director || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[2px] text-white/20">Runtime</p>
                <p className="text-sm font-bold text-white">{runtime ? `${runtime} mins` : 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[2px] text-white/20">Language</p>
                <p className="text-sm font-bold text-white">{language?.toUpperCase() || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cast' && (
          <div className="lg:-mx-10">
            <CastRow cast={cast} />
          </div>
        )}

        {activeTab === 'similar' && (
          <div className="lg:-mx-10">
            <MovieRow title="" items={similar.slice(0, 10)} className="px-10!" />
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { user: 'MovieBuff99', rating: 9, text: 'Absolutely stunning visual experience. The pacing was perfect and the soundtrack really elevated the whole movie.' },
                { user: 'CinephileJames', rating: 8, text: 'A masterclass in storytelling. Flixora really delivered on the quality here. Highly recommended for fans of the genre.' },
                { user: 'SarahReviews', rating: 10, text: 'I have watched this three times now. Every detail is meticulously crafted. One of my favorites this year!' },
              ].map((rev, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{rev.user}</span>
                    <div className="flex items-center gap-1 text-[--flx-gold]">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] font-bold">{rev.rating}/10</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed italic">&quot;{rev.text}&quot;</p>
                </div>
              ))}
            </div>
            <p className="text-center text-[9px] font-bold text-white/20 uppercase tracking-[3px]">Reviews powered by community</p>
          </div>
        )}
      </div>
    </div>
  );
}
