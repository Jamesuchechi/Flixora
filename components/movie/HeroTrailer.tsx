'use client';

import { useEffect, useRef, useState } from 'react';
import { TrailerPlayer } from './TrailerPlayer';
import { TMDBVideo } from '@/types/tmdb';
import { getBestTrailer } from '@/lib/video';

interface HeroTrailerProps {
  videos: TMDBVideo[];
  title: string;
}

/**
 * Background trailer for the hero section.
 * Autoplays muted when in view, fades in over the backdrop.
 */
export function HeroTrailer({ videos, title }: HeroTrailerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  const bestTrailer = getBestTrailer(videos);

  useEffect(() => {
    if (!bestTrailer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [bestTrailer]);

  if (!bestTrailer || hasEnded) return null;

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 z-1 transition-opacity duration-1000 ${
        isInView && isReady ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <TrailerPlayer
        videoKey={bestTrailer.key}
        title={title}
        autoplay={true}
        muted={true}
        onReady={() => setIsReady(true)}
        onEnd={() => setHasEnded(true)}
        className="h-full w-full object-cover scale-[1.35]" // Scale to hide controls/branding
      />
      {/* Overlay to ensure readability of hero content */}
      <div className="absolute inset-0 bg-linear-to-r from-[--flx-bg] via-[--flx-bg]/40 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-[--flx-bg] via-transparent to-[--flx-bg]/40" />
    </div>
  );
}
