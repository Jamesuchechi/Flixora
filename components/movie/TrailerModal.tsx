'use client';

import { useEffect, useState, useMemo } from 'react';
import { TMDBVideo } from '@/types/tmdb';
import { TrailerPlayer } from './TrailerPlayer';
import { getBestTrailer, groupVideosByType } from '@/lib/video';
import { cn } from '@/lib/utils';

interface TrailerModalProps {
  videos: TMDBVideo[];
  title: string;
  onClose: () => void;
}

/**
 * Premium Trailer Modal with multiple trailer support, tabs, and backdrop blur.
 */
export function TrailerModal({ videos, title, onClose }: TrailerModalProps) {
  const groupedVideos = useMemo(() => groupVideosByType(videos), [videos]);
  const categories = Object.keys(groupedVideos);
  
  const bestTrailer = useMemo(() => getBestTrailer(videos), [videos]);
  const [activeCategory, setActiveCategory] = useState(bestTrailer?.type || categories[0] || '');
  const [activeVideo, setActiveVideo] = useState<TMDBVideo | null>(bestTrailer || null);

  // Sync state if props change while component is mounted
  const [prevVideos, setPrevVideos] = useState(videos);
  if (videos !== prevVideos) {
    setPrevVideos(videos);
    setActiveCategory(bestTrailer?.type || categories[0] || '');
    setActiveVideo(bestTrailer || null);
  }

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!activeVideo) return null;

  return (
    <div
      className="fixed inset-0 z-200 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 px-1">
          <div>
            <p className="text-[10px] uppercase tracking-[2px] font-bold text-[--flx-cyan] mb-0.5">Now Playing</p>
            <h3 className="text-sm md:text-base text-[--flx-text-1] font-medium truncate max-w-xl">
              {title} — {activeVideo.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[--flx-text-2] hover:text-white transition-all cursor-pointer group order-2 md:order-3"
              aria-label="Close trailer"
            >
              <svg 
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                strokeWidth="2.5" className="group-hover:rotate-90 transition-transform duration-300"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 order-3 md:order-2">
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveVideo(groupedVideos[cat][0]);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer',
                    activeCategory === cat 
                      ? 'bg-[--flx-purple] text-white shadow-lg' 
                      : 'text-[--flx-text-3] hover:text-[--flx-text-1]'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-3">
            <TrailerPlayer 
              videoKey={activeVideo.key} 
              title={title} 
              className="border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5),0_0_50px_rgba(139,92,246,0.1)]"
            />
          </div>

          {/* Video List Sidebar */}
          <div className="hidden lg:flex flex-col gap-4 max-h-[calc(100vh-250px)]">
            <h4 className="text-[10px] uppercase tracking-[2px] font-bold text-[--flx-text-3]">
              More from {activeCategory}
            </h4>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {groupedVideos[activeCategory]?.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVideo(v)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border transition-all cursor-pointer group',
                    activeVideo.id === v.id
                      ? 'bg-[--flx-purple]/10 border-[--flx-purple]/30 text-[--flx-text-1]'
                      : 'bg-white/5 border-white/5 text-[--flx-text-3] hover:bg-white/10 hover:border-white/10 hover:text-[--flx-text-2]'
                  )}
                >
                  <p className="text-xs font-medium line-clamp-2 group-hover:text-white transition-colors">{v.name}</p>
                  <p className="text-[9px] uppercase tracking-wider mt-1 opacity-60">
                    {new Date(v.published_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer Hint */}
        <p className="mt-6 text-center text-[10px] text-[--flx-text-3] uppercase tracking-[1px]">
          Press <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 mx-1">ESC</kbd> to close
        </p>
      </div>
    </div>
  );
}
