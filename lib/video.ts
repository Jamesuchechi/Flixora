import { TMDBVideo } from '@/types/tmdb';

/**
 * Selects the best trailer from a list of TMDB videos.
 * Priority: Official Trailer > Trailer > Teaser > Clip
 */
export function getBestTrailer(videos: TMDBVideo[]): TMDBVideo | null {
  if (!videos || videos.length === 0) return null;

  // Filter for YouTube videos only
  const youtubeVideos = videos.filter((v) => v.site === 'YouTube');
  if (youtubeVideos.length === 0) return null;

  // Define priority order for video types
  const typePriority = {
    'Trailer': 1,
    'Teaser': 2,
    'Clip': 3,
    'Featurette': 4,
    'Behind the Scenes': 5,
    'Bloopers': 6,
  };

  return [...youtubeVideos].sort((a, b) => {
    // 1. Official status (highest priority)
    if (a.official && !b.official) return -1;
    if (!a.official && b.official) return 1;

    // 2. Type priority
    const priorityA = typePriority[a.type as keyof typeof typePriority] || 99;
    const priorityB = typePriority[b.type as keyof typeof typePriority] || 99;
    if (priorityA !== priorityB) return priorityA - priorityB;

    // 3. Recency (newer videos first)
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  })[0] || null;
}

/**
 * Groups videos by their type for a gallery view.
 */
export function groupVideosByType(videos: TMDBVideo[]) {
  const groups: Record<string, TMDBVideo[]> = {};
  
  videos
    .filter((v) => v.site === 'YouTube')
    .forEach((v) => {
      if (!groups[v.type]) {
        groups[v.type] = [];
      }
      groups[v.type].push(v);
    });

  return groups;
}
