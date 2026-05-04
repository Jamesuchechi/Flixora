import { getListDetails } from '@/lib/supabase/actions/lists';
import { notFound } from 'next/navigation';
import { Heart, Play, Globe, Lock, Share2, Users } from 'lucide-react';
import Image from 'next/image';
import { tmdb } from '@/lib/tmdb';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import type { Profile } from '@/types/supabase';
import { getUserProfile } from '@/lib/supabase/actions/auth';
import { ForkButton } from '@/components/social/ForkButton';
import { EditableListGrid } from '@/components/social/EditableListGrid';

interface ListPageProps {
  params: Promise<{ id: string }>;
}

interface ListItem {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
}

type DisplayItem = (TMDBMovie | TMDBTVShow) & { media_type: 'movie' | 'tv' };

interface ListVote {
  tmdb_id: number;
  media_type: string;
  user_id: string;
  vote: number;
}

export default async function ListDetailsPage({ params }: ListPageProps) {
  const { id } = await params;
  const list = await getListDetails(id);

  if (!list) notFound();

  // Fetch TMDB data for all items
  const itemsData: DisplayItem[] = await Promise.all(
    (list.items as unknown as ListItem[]).map(async (item) => {
      const data = item.media_type === 'movie' 
        ? await tmdb.movies.detail(item.tmdb_id, { silent: true })
        : await tmdb.tv.detail(item.tmdb_id, { silent: true });
      return { ...data, media_type: item.media_type } as DisplayItem;
    })
  );

  const owner = list.owner as unknown as Profile;
  const userResponse = await getUserProfile();
  const currentUser = userResponse?.user;
  const isOwner = currentUser?.id === list.user_id;

  // Aggregate votes
  const votesMap: Record<string, { score: number, userVote: number }> = {};
  (list.votes as unknown as ListVote[])?.forEach((v) => {
     const key = `${v.tmdb_id}_${v.media_type}`;
     if (!votesMap[key]) votesMap[key] = { score: 0, userVote: 0 };
     votesMap[key].score += v.vote;
     if (v.user_id === currentUser?.id) votesMap[key].userVote = v.vote;
  });

  return (
    <div className="min-h-screen bg-[--flx-bg] pb-32">
      {/* List Header */}
      <div className="relative pt-32 pb-16 px-10 border-b border-white/5 overflow-hidden">
         {/* Background Glow */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[--flx-purple]/10 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
         
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8 relative z-10">
            <div className="space-y-6 max-w-2xl">
               <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                     {list.is_public ? <Globe size={12} className="text-green-400" /> : <Lock size={12} className="text-[--flx-purple]" />}
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        {list.is_public ? 'Public Collection' : 'Private List'}
                     </span>
                  </div>
                  {list.items.length > 0 && (
                    <div className="px-3 py-1 bg-[--flx-cyan]/10 border border-[--flx-cyan]/20 rounded-full text-[10px] font-black uppercase tracking-widest text-[--flx-cyan]">
                       {list.items.length} Titles
                    </div>
                  )}
               </div>
               
               <div className="space-y-2">
                  <h1 className="text-6xl font-black text-white uppercase tracking-tight leading-none">{list.name}</h1>
                  <p className="text-lg text-white/60 font-medium">{list.description || 'A curated cinematic collection.'}</p>
               </div>

               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-6">
                     <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-[--flx-surface-2]">
                        <Image 
                          src={owner.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${owner.username}`}
                          alt={owner.username || ''}
                          fill
                          className="object-cover"
                        />
                     </div>
                     <div>
                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Curated by</p>
                        <p className="text-sm font-bold text-white">{owner.username}</p>
                     </div>
                  </div>
               </div>
            </div>

             <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                   <Play size={18} fill="black" />
                   Watch All
                </button>
                <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
                   <Share2 size={20} />
                </button>
                {!isOwner && <ForkButton listId={list.id} />}
                {isOwner && (
                  <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-[--flx-cyan] hover:bg-white/10 transition-all">
                    <Users size={20} />
                  </button>
                )}
             </div>
          </div>
       </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-10 py-16">
         <EditableListGrid 
            listId={list.id}
            initialItems={itemsData}
            isOwner={isOwner}
            votesMap={votesMap}
         />

         {itemsData.length === 0 && (
           <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
             <div className="w-24 h-24 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                <Heart size={40} />
             </div>
             <p className="text-sm text-white/20 font-bold uppercase tracking-widest">This list is currently empty.</p>
           </div>
         )}
      </div>
    </div>
  );
}
