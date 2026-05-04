'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn, BLUR_DATA_URL } from '@/lib/utils';

interface TmdbImageProps extends Omit<ImageProps, 'src'> {
  path: string | null | undefined;
  size?: 'w342' | 'w500' | 'original' | 'w780';
}

/**
 * Enhanced TMDB Image component with dominant-color placeholders and smooth loading.
 */
export function TmdbImage({ path, size = 'w342', className, alt, ...props }: TmdbImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Deterministic dominant color extraction based on path hash
  const getDominantColor = (str: string | null | undefined) => {
    if (!str) return 'rgba(255, 255, 255, 0.05)';
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
  
  // Construct TMDB URL or fallback to a high-quality placeholder
  const src = path 
    ? (path.startsWith('http') ? path : `https://image.tmdb.org/t/p/${size}${path}`)
    : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop';

  return (
    <div 
      className={cn("relative overflow-hidden w-full h-full bg-white/5", className?.replace(/object-\w+/g, ''))} 
      style={{ backgroundColor: placeholderColor }}
    >
      <Image
        src={src}
        alt={alt || "Media poster"}
        className={cn(
          "transition-all duration-1000 ease-in-out",
          isLoading ? "scale-110 blur-2xl opacity-0" : "scale-100 blur-0 opacity-100",
          props.fill ? "object-cover" : "",
          className?.match(/object-\w+/g)?.[0]
        )}
        onLoad={() => setIsLoading(false)}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        {...props}
      />
      
      {/* Fallback for when path is explicitly null or image fails */}
      {!path && (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <span className="text-[10px] font-black uppercase tracking-[2px] text-white/40 text-center leading-relaxed">
            Poster<br/>Unavailable
          </span>
        </div>
      )}
    </div>
  );
}
