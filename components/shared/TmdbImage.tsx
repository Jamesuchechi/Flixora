'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface TmdbImageProps extends Omit<ImageProps, 'src'> {
  path: string | null;
  size?: 'w342' | 'w500' | 'original' | 'w780';
}

/**
 * Enhanced TMDB Image component with dominant-color placeholders.
 */
export function TmdbImage({ path, size = 'w342', className, alt, ...props }: TmdbImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Deterministic dominant color extraction based on path hash
  const getDominantColor = (str: string | null) => {
    if (!str) return 'var(--flx-surface-2)';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#1e1b4b', // Indigo
      '#1e293b', // Slate
      '#171717', // Neutral
      '#2d1b4b', // Purple-deep
      '#1b334b', // Blue-deep
      '#1b4b3b', // Green-deep
      '#4b1b1b', // Red-deep
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const placeholderColor = getDominantColor(path);
  const src = path 
    ? `https://image.tmdb.org/t/p/${size}${path}` 
    : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop';

  return (
    <div 
      className={cn("relative overflow-hidden", className)} 
      style={{ backgroundColor: placeholderColor }}
    >
      <Image
        src={src}
        alt={alt}
        className={cn(
          "transition-all duration-700 ease-in-out",
          isLoading ? "scale-105 blur-lg opacity-0" : "scale-100 blur-0 opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
}
