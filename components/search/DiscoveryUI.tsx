'use client';

import Link from 'next/link';
import { Sparkles, Zap, Ghost, Heart, Sword, Brain, IceCream } from 'lucide-react';

const TRENDING = ['Dune: Part Two', 'Oppenheimer', 'Breaking Bad', 'Shogun', 'Poor Things', 'Succession', 'The Bear', 'Dark'];

const MOODS = [
  { id: 'chill', label: 'Chill', emoji: '🧊', icon: <IceCream size={20} />, color: 'from-blue-600/40 to-indigo-600/40', genre: 35 }, // Comedy
  { id: 'hyped', label: 'Hyped', emoji: '⚡', icon: <Zap size={20} />, color: 'from-orange-600/40 to-yellow-600/40', genre: 28 }, // Action
  { id: 'spooky', label: 'Spooky', emoji: '👻', icon: <Ghost size={20} />, color: 'from-purple-600/40 to-black/60', genre: 27 }, // Horror
  { id: 'romantic', label: 'Romantic', emoji: '💖', icon: <Heart size={20} />, color: 'from-pink-600/40 to-rose-600/40', genre: 10749 }, // Romance
  { id: 'epic', label: 'Epic', emoji: '⚔️', icon: <Sword size={20} />, color: 'from-amber-600/40 to-yellow-700/40', genre: 12 }, // Adventure
  { id: 'thoughtful', label: 'Thoughtful', emoji: '🧠', icon: <Brain size={20} />, color: 'from-teal-600/40 to-emerald-600/40', genre: 18 }, // Drama
];

const GENRES = [
  { id: 28, label: 'Action' },
  { id: 35, label: 'Comedy' },
  { id: 18, label: 'Drama' },
  { id: 27, label: 'Horror' },
  { id: 878, label: 'Sci-Fi' },
  { id: 53, label: 'Thriller' },
  { id: 10749, label: 'Romance' },
  { id: 16, label: 'Animation' },
];

export function DiscoveryUI() {
  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* Trending Searches */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[--flx-cyan]" size={18} />
          <h2 className="text-[10px] font-black uppercase tracking-[4px] text-white/40">Trending Searches</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {TRENDING.map((term, i) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="px-5 py-2.5 rounded-full bg-white/5 border border-white/5 hover:border-[--flx-cyan]/50 hover:bg-[--flx-cyan]/5 transition-all text-xs font-bold text-white/60 hover:text-white active:scale-95"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {term}
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by Mood */}
      <section className="space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-[4px] text-white/40">Browse by Mood</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MOODS.map((mood) => (
            <Link
              key={mood.id}
              href={`/search?q=${mood.label}&genre=${mood.genre}`}
              className={`relative h-32 md:h-40 rounded-3xl overflow-hidden group border border-white/5`}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${mood.color} transition-transform duration-700 group-hover:scale-110`} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                  {mood.icon}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bebas tracking-widest text-white uppercase">{mood.label}</span>
                  <span className="text-2xl group-hover:scale-125 transition-transform duration-500">{mood.emoji}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Genres */}
      <section className="space-y-6 pb-20">
        <h2 className="text-[10px] font-black uppercase tracking-[4px] text-white/40">Top Genres</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
          {GENRES.map((genre) => (
            <Link
              key={genre.id}
              href={`/search?q=${genre.label}&genre=${genre.id}`}
              className="px-8 py-4 rounded-2xl bg-[--flx-surface-2] border border-white/5 text-xs font-black uppercase tracking-[2px] text-[--flx-text-3] whitespace-nowrap hover:text-[--flx-cyan] hover:border-[--flx-cyan]/30 transition-all hover:-translate-y-1"
            >
              {genre.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
