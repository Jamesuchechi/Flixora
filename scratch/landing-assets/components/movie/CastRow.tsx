import Image from 'next/image';
import { tmdb } from '@/lib/tmdb';
import type { TMDBCastMember } from '@/types/tmdb';

interface CastRowProps {
  cast: TMDBCastMember[];
}

export function CastRow({ cast }: CastRowProps) {
  const visible = cast.slice(0, 12);

  return (
    <section>
      <h2 className="font-['Bebas_Neue',sans-serif] text-lg tracking-[2px] text-[--flx-text-1] mb-4">Cast</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {visible.map((member) => (
          <div key={member.id} className="flex-shrink-0 w-[88px] text-center">
            <div className="relative w-[88px] h-[88px] rounded-full overflow-hidden mb-2 mx-auto bg-[--flx-surface-2] border border-[--flx-border]">
              <Image
                src={tmdb.image(member.profile_path, 'w185')}
                alt={member.name}
                fill
                className="object-cover"
                sizes="88px"
              />
            </div>
            <p className="text-[11px] font-medium text-[--flx-text-1] leading-tight truncate">{member.name}</p>
            <p className="text-[10px] text-[--flx-text-3] leading-tight truncate mt-0.5">{member.character}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
