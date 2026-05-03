'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Check, Loader2 } from 'lucide-react';

export default function AdminFreeFilmsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    tmdb_id: '',
    media_type: 'movie',
    youtube_id: '',
    title: '',
  });

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
        added_at: new Date().toISOString(),
      });

    setLoading(false);
    if (!error) {
      setSuccess(true);
      setFormData({ tmdb_id: '', media_type: 'movie', youtube_id: '', title: '' });
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
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[2px] text-white/60">Content Title</label>
            <input
              required
              type="text"
              placeholder="e.g. The Night of the Living Dead"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[--flx-cyan] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[2px] text-white/60">TMDB ID</label>
              <input
                required
                type="number"
                placeholder="12345"
                value={formData.tmdb_id}
                onChange={e => setFormData({ ...formData, tmdb_id: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[--flx-cyan] transition-all"
              />
            </div>
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

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-white text-black font-black uppercase tracking-[2px] rounded-2xl hover:bg-[--flx-cyan] transition-all flex items-center justify-center gap-2"
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
