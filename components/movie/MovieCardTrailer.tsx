'use client';

import { useEffect, useState, useRef } from 'react';
import { getTrailerWithCache } from '@/lib/supabase/actions/video-logic';
import { TrailerPlayer } from './TrailerPlayer';

interface MovieCardTrailerProps {
  id: number;
  mediaType: 'movie' | 'tv';
  isVisible: boolean;
}

/**
 * Trailer preview for MovieCard.
 * Fetches and plays a muted trailer after a delay when hovered.
 */
export function MovieCardTrailer({ id, mediaType, isVisible }: MovieCardTrailerProps) {
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    // 200ms delay before starting fetch/play
    timerRef.current = setTimeout(async () => {
      try {
        const key = await getTrailerWithCache(id, mediaType);
        if (key) {
          setVideoKey(key);
        }
      } catch (error) {
        console.error('Failed to fetch trailer for preview:', error);
      }
    }, 200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, id, mediaType]);

  if (!isVisible || !videoKey) return null;

  return (
    <div className={`absolute inset-0 z-10 bg-black transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      <TrailerPlayer
        videoKey={videoKey}
        title="Preview"
        autoplay={true}
        muted={true}
        onReady={() => setIsReady(true)}
        className="h-full w-full object-cover scale-[1.5]" // Scale more to hide YouTube branding in small card
      />
      {/* Dim the trailer slightly to keep card readable */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}
