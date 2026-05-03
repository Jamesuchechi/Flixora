'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Eye, Camera, Image as ImageIcon, ChevronRight, Check, Loader2 } from 'lucide-react';
import { getUserProfile, updateProfile } from '@/lib/supabase/actions/auth';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import Image from 'next/image';

export default function SettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'preferences'>('profile');
  
  // Local states for previews
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(updateProfile, {});

  useEffect(() => {
    async function loadData() {
      const data = await getUserProfile();
      if (data) {
        setUser(data.user);
        setProfile(data.profile);
        setAvatarUrl(data.profile?.avatar_url || '');
        setCoverUrl(data.profile?.cover_url || '');
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(type);
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const bucket = type === 'avatar' ? 'avatars' : 'covers';

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
      
      if (type === 'avatar') setAvatarUrl(publicUrl);
      else setCoverUrl(publicUrl);
      
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Make sure you ran the SQL script for storage buckets.');
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[--flx-bg] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-[--flx-cyan] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-[--flx-text-3] uppercase tracking-[4px]">Loading Settings</p>
      </div>
    );
  }

  const TABS = [
    { id: 'profile',     label: 'Edit Profile', icon: User },
    { id: 'account',     label: 'Account Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Eye },
  ] as const;

  return (
    <div className="min-h-screen bg-[--flx-bg] pb-32">
      {/* Header */}
      <div className="relative pt-24 pb-12 px-10 border-b border-white/5 bg-linear-to-b from-white/2 to-transparent">
        <div className="max-w-5xl mx-auto space-y-1">
          <h1 className="font-bebas text-5xl tracking-widest text-[--flx-text-1]">Settings</h1>
          <p className="text-xs font-bold text-[--flx-text-3] uppercase tracking-[3px]">Manage your account and preferences</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-10 py-12 flex flex-col md:flex-row gap-12">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group cursor-pointer",
                activeTab === id 
                  ? "bg-white/10 text-white shadow-lg border border-white/10" 
                  : "text-[--flx-text-3] hover:bg-white/5 hover:text-[--flx-text-2]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={cn("transition-colors", activeTab === id ? "text-[--flx-cyan]" : "group-hover:text-[--flx-cyan]")} />
                <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
              </div>
              <ChevronRight size={14} className={cn("transition-transform", activeTab === id ? "rotate-90 text-[--flx-cyan]" : "opacity-0 group-hover:opacity-100")} />
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 max-w-2xl">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.form
                key="profile"
                action={formAction}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                {/* Visual Identity Section */}
                <div className="space-y-6">
                   <h3 className="text-sm font-bold text-[--flx-text-3] uppercase tracking-[4px]">Visual Identity</h3>
                   
                   <div className="space-y-8">
                      {/* Avatar Upload */}
                      <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/3 border border-white/5">
                         <div className="relative group shrink-0">
                            <input 
                              type="file" 
                              ref={avatarInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleFileUpload(e, 'avatar')}
                            />
                            <div className="w-24 h-24 rounded-[28px] bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] p-0.5 shadow-xl relative overflow-hidden">
                               <div className="w-full h-full rounded-[27px] bg-[--flx-bg] flex items-center justify-center text-3xl font-bebas text-white overflow-hidden relative">
                                  {avatarUrl ? (
                                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" unoptimized />
                                  ) : (
                                    profile?.username?.slice(0, 2).toUpperCase() || '??'
                                  )}
                                  
                                  {uploading === 'avatar' && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                       <Loader2 className="animate-spin text-[--flx-cyan]" size={24} />
                                    </div>
                                  )}
                               </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => avatarInputRef.current?.click()}
                              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[--flx-surface-1] border border-white/10 flex items-center justify-center text-[--flx-cyan] hover:scale-110 transition-transform cursor-pointer"
                            >
                               <Camera size={14} />
                            </button>
                         </div>
                         <div className="space-y-1">
                            <p className="text-sm font-bold text-[--flx-text-1]">Profile Picture</p>
                            <p className="text-[11px] text-[--flx-text-3] leading-relaxed">PNG or JPG. Max 2MB. Recommended 400x400.</p>
                            <input type="hidden" name="avatar_url" value={avatarUrl} />
                         </div>
                      </div>

                      {/* Cover Photo Upload */}
                      <div className="relative group h-44 rounded-3xl bg-linear-to-br from-white/5 to-transparent border border-white/5 overflow-hidden flex items-center justify-center">
                         <input 
                            type="file" 
                            ref={coverInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleFileUpload(e, 'cover')}
                         />
                         
                         {coverUrl ? (
                            <Image src={coverUrl} alt="Cover" fill className="object-cover opacity-60" unoptimized />
                         ) : (
                            <div className="flex flex-col items-center gap-2 text-[--flx-text-3]">
                               <ImageIcon size={24} />
                               <span className="text-[10px] font-bold uppercase tracking-widest">Update Cover Photo</span>
                            </div>
                         )}

                         {uploading === 'cover' && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                               <Loader2 className="animate-spin text-[--flx-cyan]" size={32} />
                            </div>
                         )}

                         <button 
                            type="button"
                            onClick={() => coverInputRef.current?.click()}
                            className="absolute bottom-4 right-4 px-5 py-2.5 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-[9px] font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer z-20"
                         >
                            {coverUrl ? 'Change Cover' : 'Upload Cover'}
                         </button>
                         <input type="hidden" name="cover_url" value={coverUrl} />
                      </div>
                   </div>
                </div>

                {/* Information Section */}
                <div className="space-y-6">
                   <h3 className="text-sm font-bold text-[--flx-text-3] uppercase tracking-[4px]">Information</h3>
                   
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[2px] text-[--flx-text-3] ml-1">Username</label>
                        <input 
                          name="username"
                          type="text" 
                          defaultValue={profile?.username || ''}
                          placeholder="Your unique handle"
                          className="w-full bg-white/3 border border-white/10 rounded-2xl px-5 py-4 text-sm text-[--flx-text-1] placeholder-white/20 focus:border-[--flx-cyan]/50 focus:bg-white/5 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[2px] text-[--flx-text-3] ml-1">Bio</label>
                        <textarea 
                          name="bio"
                          rows={4}
                          defaultValue={profile?.bio || ''}
                          placeholder="Tell us about your cinematic taste..."
                          className="w-full bg-white/3 border border-white/10 rounded-2xl px-5 py-4 text-sm text-[--flx-text-1] placeholder-white/20 focus:border-[--flx-cyan]/50 focus:bg-white/5 outline-none transition-all resize-none"
                        />
                      </div>
                   </div>
                </div>

                {/* Feedback */}
                <div className="min-h-[24px]">
                  {state.error && <p className="text-xs text-red-400 font-bold text-center">{state.error}</p>}
                  {state.success && (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <Check size={14} />
                      <span className="text-xs font-bold uppercase tracking-widest">Changes saved successfully</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions - PROMINENT & VISIBLE */}
                <div className="pt-10 pb-4 flex items-center justify-end gap-6 border-t border-white/10 mt-10">
                   <button 
                    type="button" 
                    onClick={() => window.location.reload()}
                    className="text-[11px] font-bold uppercase tracking-widest text-[--flx-text-3] hover:text-[--flx-text-1] transition-colors cursor-pointer"
                   >
                     Discard Changes
                   </button>
                   <button 
                    disabled={isPending || uploading !== null}
                    type="submit"
                    className="flex items-center gap-3 px-12 py-5 bg-white text-black font-black text-[12px] uppercase tracking-[2px] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] disabled:opacity-30 disabled:grayscale cursor-pointer"
                   >
                     {isPending ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} className="text-green-600" />}
                     Save Changes
                   </button>
                </div>
              </motion.form>
            )}

            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                 <div className="p-8 rounded-[32px] bg-white/3 border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-[--flx-text-1]">Email Address</p>
                          <p className="text-xs text-[--flx-text-3]">{user?.email}</p>
                       </div>
                       <Badge variant="muted">VERIFIED</Badge>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-[--flx-text-1]">Password</p>
                          <p className="text-xs text-[--flx-text-3]">Last changed 3 months ago</p>
                       </div>
                       <button className="text-[10px] font-bold uppercase tracking-widest text-[--flx-cyan] hover:opacity-70 transition-opacity cursor-pointer">
                          Update
                       </button>
                    </div>
                 </div>

                 <div className="p-8 rounded-[32px] border border-red-500/20 bg-red-500/5 space-y-4">
                    <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest">Danger Zone</h4>
                    <p className="text-xs text-[--flx-text-3] leading-relaxed">Once you delete your account, there is no going back. All your data including watch history and watchlist will be permanently removed.</p>
                    <button className="px-6 py-3 rounded-xl border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                      Deactivate Account
                    </button>
                 </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                 <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[--flx-text-3] uppercase tracking-[4px] ml-1">Streaming</h3>
                    <div className="p-8 rounded-[32px] bg-white/3 border border-white/5 space-y-6">
                       <div className="flex justify-between items-center">
                          <div className="space-y-1">
                             <p className="text-sm font-bold text-[--flx-text-1]">Autoplay Trailers</p>
                             <p className="text-xs text-[--flx-text-3]">Play trailers automatically on movie pages.</p>
                          </div>
                          <div className="w-12 h-6 bg-[--flx-cyan] rounded-full relative p-1">
                             <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
                          </div>
                       </div>
                       <div className="h-px bg-white/5" />
                       <div className="flex justify-between items-center">
                          <div className="space-y-1">
                             <p className="text-sm font-bold text-[--flx-text-1]">Video Quality</p>
                             <p className="text-xs text-[--flx-text-3]">Always prioritize 4K UHD when available.</p>
                          </div>
                          <div className="w-12 h-6 bg-white/10 rounded-full relative p-1">
                             <div className="w-4 h-4 bg-white rounded-full" />
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
