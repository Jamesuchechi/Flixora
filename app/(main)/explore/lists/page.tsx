import { createClient } from '@/lib/supabase/server';
import { List, Globe, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Profile } from '@/types/supabase';

interface DiscoveryList {
  id: string;
  name: string;
  description: string | null;
  owner: Profile;
  items: { count: number }[];
}

export default async function ListDiscoveryPage() {
  const supabase = await createClient();

  // Get public lists with owner details and item counts
  const { data: lists } = await supabase
    .from('custom_lists')
    .select(`
      *,
      owner:profiles!custom_lists_user_id_fkey(*),
      items:list_items(count)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(20);

  const typedLists = lists as unknown as DiscoveryList[];

  return (
    <div className="min-h-screen bg-[--flx-bg] pb-32">
      {/* Header */}
      <div className="relative pt-32 pb-16 px-10 border-b border-white/5 overflow-hidden">
         <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[--flx-purple]/5 blur-[150px] rounded-full -ml-96 -mt-96 pointer-events-none" />
         
         <div className="max-w-7xl mx-auto space-y-8 relative z-10">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-[--flx-cyan]/10 border border-[--flx-cyan]/20 rounded-full">
                  <Globe size={12} className="text-[--flx-cyan]" />
                  <span className="text-[10px] font-black text-[--flx-cyan] uppercase tracking-widest">Community Collections</span>
               </div>
               <h1 className="text-6xl font-black text-white uppercase tracking-tight leading-none">Discovery</h1>
               <p className="text-xl text-white/40 max-w-2xl font-medium">Browse curated watchlists from the Flixora community. From &ldquo;A24 Masterpieces&rdquo; to &ldquo;Best Horror of the 2010s&rdquo;.</p>
            </div>

            {/* Search Bar Placeholder */}
            <div className="relative max-w-2xl group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[--flx-cyan] transition-colors" size={20} />
               <input 
                 type="text" 
                 placeholder="Search collections (e.g. '80s Sci-Fi')" 
                 className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-8 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-[--flx-cyan]/50 focus:bg-white/10 transition-all"
               />
            </div>
         </div>
      </div>

      {/* Discovery Grid */}
      <div className="max-w-7xl mx-auto px-10 py-16">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {typedLists?.map((list) => {
              const itemCount = list.items?.[0]?.count || 0;

              return (
                <Link 
                  key={list.id} 
                  href={`/list/${list.id}`}
                  className="group relative flex flex-col bg-white/5 border border-white/10 rounded-[40px] p-8 hover:bg-white/10 hover:border-[--flx-cyan]/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Decorative Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[--flx-purple]/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-[--flx-cyan]/20 transition-colors" />

                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-[--flx-cyan] transition-colors">
                       <List size={24} />
                    </div>
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">
                       {itemCount} Titles
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                     <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-[--flx-cyan] transition-colors">{list.name}</h3>
                     <p className="text-sm text-white/40 font-medium line-clamp-2 leading-relaxed">
                        {list.description || 'A unique cinematic journey curated by a Flixora user.'}
                     </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[--flx-surface-2] border border-white/10">
                           <Image 
                             src={list.owner.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${list.owner.username}`}
                             alt={list.owner.username || ''}
                             fill
                             className="object-cover"
                           />
                        </div>
                        <span className="text-[11px] font-bold text-white/60">@{list.owner.username}</span>
                     </div>
                     <div className="flex items-center gap-2 text-white/20 group-hover:text-white transition-colors">
                        <span className="text-[10px] font-black uppercase tracking-widest">Explore</span>
                        <ChevronRight size={16} />
                     </div>
                  </div>
                </Link>
              );
            })}
         </div>

         {(!lists || lists.length === 0) && (
           <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
             <div className="w-24 h-24 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                <Search size={40} />
             </div>
             <p className="text-sm text-white/20 font-bold uppercase tracking-widest">No public collections found yet.</p>
           </div>
         )}
      </div>
    </div>
  );
}
