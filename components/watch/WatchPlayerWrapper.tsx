'use client';

import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('@/components/watch/VideoPlayer').then(mod => mod.VideoPlayer), {
  ssr: false,
  loading: () => <div className="aspect-video w-full bg-white/5 animate-pulse rounded-2xl border border-white/10" />
});

interface WatchPlayerWrapperProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  backdrop: string;
  season?: number;
  episode?: number;
  youtubeId?: string;
  fullFilmYoutubeId?: string;
  nextEpisodeUrl?: string;
  overview?: string;
  imdbId?: string;
  releaseDate?: string;
  status?: string;
  rating?: number;
}

export function WatchPlayerWrapper(props: WatchPlayerWrapperProps) {
  return <VideoPlayer {...props} />;
}
