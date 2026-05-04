'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, List, Lock, Globe, ChevronRight, Play } from 'lucide-react';
import { getUserLists, createList } from '@/lib/supabase/actions/lists';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomList {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  item_count: number;
}

export function CustomListsView() {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const fetchLists = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const data = await getUserLists(user.id);
      setLists(data);
    }
    setLoading(false);
  }, [supabase]);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchLists();
      hasFetched.current = true;
    }
  }, [fetchLists]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    try {
      await createList(newListName, newListDesc, isPublic);
      setNewListName('');
      setNewListDesc('');
      setIsCreating(false);
      fetchLists();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-3xl" />)}</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white uppercase tracking-wider">Your Custom Lists</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[--flx-cyan] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[--flx-cyan]/20"
        >
          <Plus size={16} />
          Create New List
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8"
          >
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">List Name</label>
                  <input 
                    type="text" 
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g. Weekend Movie Marathon"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[--flx-cyan]/50 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Privacy</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${isPublic ? 'bg-[--flx-cyan]/10 border-[--flx-cyan]/30 text-[--flx-cyan]' : 'bg-black/40 border-white/10 text-white/40'}`}
                    >
                      <Globe size={14} />
                      <span className="text-[10px] font-black uppercase">Public</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${!isPublic ? 'bg-[--flx-purple]/10 border-[--flx-purple]/30 text-[--flx-purple]' : 'bg-black/40 border-white/10 text-white/40'}`}
                    >
                      <Lock size={14} />
                      <span className="text-[10px] font-black uppercase">Private</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Description (Optional)</label>
                <textarea 
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="What's this list about?"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[--flx-cyan]/50 transition-all h-24 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                 <button type="button" onClick={() => setIsCreating(false)} className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all">Cancel</button>
                 <button type="submit" className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Create List</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map((list) => (
          <Link 
            key={list.id} 
            href={`/list/${list.id}`}
            className="group p-6 bg-white/5 border border-white/10 rounded-[32px] hover:bg-white/10 hover:border-[--flx-cyan]/30 transition-all flex flex-col justify-between min-h-[160px]"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-white/5 rounded-2xl text-[--flx-cyan] group-hover:bg-[--flx-cyan] group-hover:text-black transition-colors">
                  <List size={20} />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-lg border border-white/5">
                   {list.is_public ? <Globe size={10} className="text-green-400" /> : <Lock size={10} className="text-[--flx-purple]" />}
                   <span className="text-[8px] font-black uppercase text-white/40">{list.is_public ? 'Public' : 'Private'}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-[--flx-cyan] transition-colors line-clamp-1">{list.name}</h3>
                <p className="text-xs text-white/40 line-clamp-2 mt-1">{list.description || 'No description provided.'}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Play size={12} className="text-white/40" />
                    <span className="text-[10px] font-bold text-white/60">{list.item_count} items</span>
                  </div>
               </div>
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:translate-x-1 group-hover:text-white transition-all">
                  <ChevronRight size={16} />
               </div>
            </div>
          </Link>
        ))}

        {lists.length === 0 && !isCreating && (
          <div className="md:col-span-2 lg:col-span-3 py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] space-y-4">
             <List size={40} className="mx-auto text-white/10" />
             <p className="text-sm text-white/20 font-bold uppercase tracking-widest">You haven&apos;t created any custom lists yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
