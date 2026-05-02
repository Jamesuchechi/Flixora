import Image from 'next/image';
import { tmdb } from '@/lib/tmdb';
import type { TMDBCastMember } from '@/types/tmdb';
import { cn } from '@/lib/utils';

interface CastRowProps {
  cast: TMDBCastMember[];
  className?: string;
}

/**
 * Premium horizontal cast list with circular profile images.
 */
export function CastRow({ cast, className }: CastRowProps) {
  const visible = cast.slice(0, 12);

  return (
    <section className={cn('space-y-5', className)}>
      <h2 className="font-bebas text-lg tracking-[2px] text-[--flx-text-1]">Cast</h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
        {visible.map((member) => (
          <div 
            key={member.id} 
            className="shrink-0 w-[94px] group"
          >
            {/* Avatar Circle */}
            <div className="relative w-[88px] h-[88px] rounded-full overflow-hidden mb-3 mx-auto bg-[--flx-surface-2] border border-white/5 transition-transform duration-300 group-hover:scale-105 group-hover:border-[--flx-purple]/30 shadow-lg">
              {member.profile_path ? (
                <Image
                  src={tmdb.image(member.profile_path, 'w185')}
                  alt={member.name}
                  fill
                  className="object-cover transition-opacity duration-300 opacity-90 group-hover:opacity-100"
                  sizes="88px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[--flx-surface-3] text-[--flx-text-3] text-xs font-bebas">
                  {member.name.charAt(0)}
                </div>
              )}
              {/* Subtle Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Info */}
            <div className="text-center px-1">
              <p className="text-[11px] font-semibold text-[--flx-text-1] leading-tight line-clamp-1 group-hover:text-[--flx-cyan] transition-colors">
                {member.name}
              </p>
              <p className="text-[10px] text-[--flx-text-3] leading-tight line-clamp-1 mt-1 italic">
                {member.character}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
