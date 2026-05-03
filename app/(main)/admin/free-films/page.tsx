'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Check, Loader2, Search } from 'lucide-react';
import { tmdb } from '@/lib/tmdb';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import Image from 'next/image';

export default function AdminFreeFilmsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    tmdb_id: '',
    media_type: 'movie',
    youtube_id: '',
    title: '',
    poster_path: '',
  });

  const handleFetchMetadata = async () => {
    if (!formData.tmdb_id) return;
    setFetching(true);
    try {
      const data = formData.media_type === 'movie'
        ? await tmdb.movies.detail(parseInt(formData.tmdb_id))
        : await tmdb.tv.detail(parseInt(formData.tmdb_id));
      
      let fetchedTitle = '';
      if (formData.media_type === 'movie') {
        fetchedTitle = (data as TMDBMovie).title || '';
      } else {
        fetchedTitle = (data as TMDBTVShow).name || '';
      }

      setFormData(prev => ({
        ...prev,
        title: fetchedTitle,
        poster_path: data.poster_path || '',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert('Failed to fetch TMDB data: ' + message);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const supabase = createClient();
    const { error } = await supabase
      .from('free_films')
      .upsert({
        tmdb_id: parseInt(formData.tmdb_id),
        media_type: formData.media_type,
        youtube_id: formData.youtube_id,
        title: formData.title,
        poster_path: formData.poster_path,
        added_at: new Date().toISOString(),
      });

    setLoading(false);
    if (!error) {
      setSuccess(true);
      setFormData({ tmdb_id: '', media_type: 'movie', youtube_id: '', title: '', poster_path: '' });
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[--flx-bg] pt-32 pb-20 px-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Curation Studio</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[3px] mt-2">Admin Only • Add Free Content</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-[32px] border border-white/10 backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[2px] text-white/60">Type</label>
              <select
                value={formData.media_type}
                onChange={e => setFormData({ ...formData, media_type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[--flx-cyan] transition-all appearance-none"
              >
                <option value="movie" className="bg-[#1a1429]">Movie</option>
                <option value="tv" className="bg-[#1a1429]">TV Show</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[2px] text-white/60">TMDB ID</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  placeholder="12345"
                  value={formData.tmdb_id}
                  onChange={e => setFormData({ ...formData, tmdb_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-[--flx-cyan] transition-all"
                />
                <button
                  type="button"
                  onClick={handleFetchMetadata}
                  disabled={fetching || !formData.tmdb_id}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:text-[--flx-cyan] transition-colors disabled:opacity-50"
                >
                  {fetching ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[2px] text-white/60">Content Title (Auto-filled)</label>
            <input
              required
              type="text"
              placeholder="e.g. The Night of the Living Dead"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[--flx-cyan] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[2px] text-white/60">YouTube Video ID</label>
            <input
              required
              type="text"
              placeholder="e.g. d_vHstZ5TUA"
              value={formData.youtube_id}
              onChange={e => setFormData({ ...formData, youtube_id: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[--flx-cyan] transition-all"
            />
          </div>

          {formData.poster_path && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="relative w-12 h-18 overflow-hidden rounded-md shadow-2xl">
                <Image 
                  src={tmdb.image(formData.poster_path, 'w92')} 
                  alt="Preview" 
                  width={48}
                  height={72}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Poster Detected</p>
                <p className="text-[10px] text-white/40 truncate max-w-[200px]">{formData.poster_path}</p>
              </div>
            </div>
          )}

          <button
            disabled={loading || fetching}
            type="submit"
            className="w-full py-4 bg-white text-black font-black uppercase tracking-[2px] rounded-2xl hover:bg-[--flx-cyan] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : success ? (
              <>
                <Check size={20} />
                Added Successfully
              </>
            ) : (
              <>
                <Plus size={20} />
                Publish to Flixora
              </>
            )}
          </button>
        </form>

        <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-wider">
            Quick Tip: Verified IDs ensure accurate matching. Always check the YouTube uploader before adding to ensure they are the legitimate rights holder.
          </p>
        </div>
      </div>
    </div>
  );
}
