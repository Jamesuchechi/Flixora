'use client';

import { Star, Share2, Home, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { tmdb } from '@/lib/tmdb';

interface EndPartyScreenProps {
  title: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  posterPath: string;
}

export function EndPartyScreen({ title, posterPath }: EndPartyScreenProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="fixed inset-0 z-100 bg-[--flx-bg] flex items-center justify-center p-8 overflow-y-auto">
       <div className="max-w-4xl w-full flex flex-col md:flex-row gap-12 items-center">
          
          {/* Poster Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="relative w-64 aspect-2/3 rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 group"
          >
             <Image 
                src={tmdb.image(posterPath, 'w500')} 
                alt={title} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-110" 
             />
             <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-60" />
          </motion.div>

          {/* Content Area */}
          <div className="flex-1 space-y-10 text-center md:text-left">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[--flx-cyan]/10 border border-[--flx-cyan]/20 rounded-full">
                   <div className="w-2 h-2 rounded-full bg-[--flx-cyan] animate-pulse" />
                   <span className="text-[10px] font-black text-[--flx-cyan] uppercase tracking-widest">Party Concluded</span>
                </div>
                <h1 className="text-5xl font-black text-white uppercase tracking-tight leading-none">
                   That was a <span className="text-[--flx-cyan]">Classic!</span>
                </h1>
                <p className="text-lg text-white/40 font-medium">You just watched <span className="text-white">{title}</span> with your crew.</p>
             </div>

             {/* Group Rating Prompt */}
             <div className="space-y-4 p-8 bg-white/5 border border-white/10 rounded-[32px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                   <Star size={80} fill="currentColor" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest relative z-10">Rate this experience</h3>
                <div className="flex items-center gap-2 justify-center md:justify-start relative z-10">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button 
                        key={star}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-all hover:scale-125"
                      >
                         <Star 
                           size={24} 
                           fill={(hoveredRating || rating) >= star ? '#FFD700' : 'none'} 
                           className={(hoveredRating || rating) >= star ? 'text-[#FFD700]' : 'text-white/20'}
                         />
                      </button>
                   ))}
                </div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Your rating helps curate better recommendations for the group</p>
             </div>

             {/* Action Buttons */}
             <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                <Link 
                  href="/"
                  className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                   <Home size={18} fill="black" />
                   Back to Home
                </Link>
                <button className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                   <Share2 size={18} />
                   Share on Social
                </button>
                <button className="p-4 bg-white/5 border border-white/10 text-white/40 hover:text-[--flx-cyan] rounded-2xl transition-all">
                   <Heart size={20} />
                </button>
             </div>
          </div>
       </div>

       {/* Background Glows */}
       <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[--flx-purple]/10 blur-[150px] rounded-full -ml-48 -mt-48 pointer-events-none" />
       <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[--flx-cyan]/10 blur-[150px] rounded-full -mr-48 -mb-48 pointer-events-none" />
    </div>
  );
}
