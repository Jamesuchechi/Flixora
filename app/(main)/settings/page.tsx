'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Eye, Camera, Image as ImageIcon, ChevronRight, Check, Loader2, Palette, Trash2, X, Sparkles } from 'lucide-react';
import { getUserProfile, updateProfile, deleteAccount } from '@/lib/supabase/actions/auth';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'preferences' | 'appearance'>('profile');
  
  // Local states for previews
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null);

  // Preference states
  interface UserPreferences {
    autoplay: boolean;
    notifications: boolean;
    quality: string;
    compactMode: boolean;
    accentColor: string;
    soundEffects: boolean;
  }

  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    // Default values
    const defaults: UserPreferences = {
      autoplay: true,
      notifications: true,
      quality: '4k',
      compactMode: false,
      accentColor: '#8b5cf6',
      soundEffects: false // Default to false as requested
    };
    
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flx_user_prefs');
      if (saved) return JSON.parse(saved);
    }
    return defaults;
  });

  // Danger Zone Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(updateProfile, {});

  // Load preferences from localStorage (Applied via lazy init above)
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

  // Save preferences
  useEffect(() => {
    if (!loading && prefs.accentColor) {
      localStorage.setItem('flx_user_prefs', JSON.stringify(prefs));
      document.documentElement.style.setProperty('--flx-purple', prefs.accentColor);
    }
  }, [prefs, loading]);

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Simple size check
    if (file.size > 2 * 1024 * 1024) {
      alert('File too large. Max 2MB.');
      return;
    }

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
      alert('Upload failed. Check storage bucket permissions.');
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[--flx-bg] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-[--flx-cyan] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-[--flx-text-3] uppercase tracking-[4px]">Syncing Controls</p>
      </div>
    );
  }

  const TABS = [
    { id: 'profile',     label: 'Identity', icon: User },
    { id: 'account',     label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Engine', icon: Eye },
    { id: 'appearance',  label: 'Aesthetics', icon: Palette },
  ] as const;

  return (
    <div className="min-h-screen bg-[--flx-bg] pb-32">
      {/* Header */}
      <div className="relative pt-28 pb-14 px-10 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-100%,var(--flx-purple),transparent_70%)] opacity-20" />
        <div className="max-w-6xl mx-auto space-y-1 relative z-10">
          <h1 className="font-bebas text-6xl tracking-tight text-white uppercase">Control Center</h1>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[5px]">Personalize your cinematic experience</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-10 py-16 flex flex-col md:flex-row gap-16">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-72 shrink-0 space-y-3">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center justify-between px-6 py-5 rounded-3xl transition-all group cursor-pointer border",
                activeTab === id 
                  ? "bg-white/10 text-white shadow-2xl border-white/10 scale-[1.02]" 
                  : "text-white/30 hover:bg-white/5 hover:text-white border-transparent"
              )}
            >
              <div className="flex items-center gap-4">
                <Icon size={20} className={cn("transition-all", activeTab === id ? "text-[--flx-cyan]" : "group-hover:text-[--flx-cyan]")} />
                <span className="text-[10px] font-black uppercase tracking-[3px]">{label}</span>
              </div>
              <ChevronRight size={16} className={cn("transition-transform duration-500", activeTab === id ? "rotate-90 text-[--flx-cyan]" : "opacity-0 group-hover:opacity-100")} />
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Visual Identity Section */}
                <div className="space-y-8">
                   <div className="flex items-center gap-4">
                      <Camera className="text-[--flx-cyan]" size={20} />
                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[5px]">Visual Identity</h3>
                   </div>
                   
                   <div className="space-y-10">
                      {/* Avatar Upload with "Crop" Preview Style */}
                      <div className="flex items-center gap-8 p-8 rounded-[40px] bg-white/3 border border-white/10 shadow-2xl">
                         <div className="relative group shrink-0">
                            <input 
                              type="file" 
                              ref={avatarInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleFileUpload(e, 'avatar')}
                            />
                            <div className="w-28 h-28 rounded-[40px] bg-linear-to-br from-[--flx-purple] via-[--flx-cyan] to-[--flx-pink] p-1 shadow-2xl relative overflow-hidden group">
                               <div className="w-full h-full rounded-[37px] bg-[--flx-bg] flex items-center justify-center text-4xl font-bebas text-white overflow-hidden relative">
                                  {avatarUrl ? (
                                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" unoptimized />
                                  ) : (
                                    profile?.username?.slice(0, 2).toUpperCase() || '??'
                                  )}
                                  
                                  {uploading === 'avatar' && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
                                       <Loader2 className="animate-spin text-[--flx-cyan]" size={32} />
                                    </div>
                                  )}
                                  
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-xs cursor-pointer">
                                     <Camera className="text-white" size={24} />
                                  </div>
                               </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => avatarInputRef.current?.click()}
                              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl cursor-pointer"
                            >
                               <ImageIcon size={18} />
                            </button>
                         </div>
                         <div className="space-y-2">
                            <p className="text-sm font-black text-white uppercase tracking-widest">Avatar Projection</p>
                            <p className="text-[11px] text-white/30 font-medium leading-relaxed">Customize your digital shadow. PNG, JPG or WEBP. Max 2MB.</p>
                            <input type="hidden" name="avatar_url" value={avatarUrl} />
                         </div>
                      </div>

                      {/* Cover Photo Upload */}
                      <div className="relative group h-56 rounded-[40px] bg-[--flx-surface-1] border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl">
                         <input 
                            type="file" 
                            ref={coverInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleFileUpload(e, 'cover')}
                         />
                         
                         {coverUrl ? (
                            <Image src={coverUrl} alt="Cover" fill className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-2000" unoptimized />
                         ) : (
                            <div className="flex flex-col items-center gap-4 text-white/20">
                               <ImageIcon size={40} className="opacity-50" />
                               <span className="text-[10px] font-black uppercase tracking-[5px]">Background Atmosphere</span>
                            </div>
                         )}

                         <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                         {uploading === 'cover' && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                               <Loader2 className="animate-spin text-[--flx-cyan]" size={40} />
                            </div>
                         )}

                         <button 
                            type="button"
                            onClick={() => coverInputRef.current?.click()}
                            className="absolute bottom-6 right-6 px-8 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer z-20 shadow-2xl"
                         >
                            {coverUrl ? 'Change Atmosphere' : 'Upload Atmosphere'}
                         </button>
                         <input type="hidden" name="cover_url" value={coverUrl} />
                      </div>
                   </div>
                </div>

                {/* Profile Data */}
                <div className="space-y-8">
                   <div className="flex items-center gap-4">
                      <User className="text-[--flx-purple]" size={20} />
                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[5px]">Core Metadata</h3>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[3px] text-white/30 ml-1">Unique Handle</label>
                        <input 
                          name="username"
                          type="text" 
                          defaultValue={profile?.username || ''}
                          placeholder="Your identity..."
                          className="w-full bg-white/3 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white placeholder-white/10 focus:border-[--flx-cyan]/50 focus:bg-white/5 outline-none transition-all shadow-inner"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[3px] text-white/30 ml-1">Cinematic Bio</label>
                        <textarea 
                          name="bio"
                          rows={4}
                          defaultValue={profile?.bio || ''}
                          placeholder="What drives your cinematic passion?"
                          className="w-full bg-white/3 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white placeholder-white/10 focus:border-[--flx-cyan]/50 focus:bg-white/5 outline-none transition-all resize-none shadow-inner leading-relaxed"
                        />
                      </div>
                   </div>
                </div>

                {/* Feedback */}
                <div className="min-h-[32px] flex items-center justify-center">
                  {state.error && <p className="text-xs text-red-500 font-black uppercase tracking-widest animate-shake">{state.error}</p>}
                  {state.success && (
                    <div className="flex items-center gap-3 text-[--flx-cyan] animate-fade-up">
                      <Check size={18} />
                      <span className="text-[10px] font-black uppercase tracking-[4px]">System Synced Successfully</span>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-8 pt-8">
                   <button 
                    disabled={isPending || uploading !== null}
                    type="submit"
                    className="group flex items-center gap-4 px-14 py-5 bg-white text-black font-black text-[13px] uppercase tracking-[3px] rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-30 disabled:grayscale cursor-pointer"
                   >
                     {isPending ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />}
                     Commit Changes
                   </button>
                </div>
              </motion.form>
            )}

            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                 <div className="p-10 rounded-[40px] bg-white/3 border border-white/10 space-y-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[3px] text-white/30">Primary Email</p>
                          <p className="text-sm font-black text-white">{user?.email}</p>
                       </div>
                       <Badge variant="cyan" className="px-4 py-1.5 text-[9px]">SECURE</Badge>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex items-center justify-between group cursor-pointer">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[3px] text-white/30">Password Access</p>
                          <p className="text-sm font-black text-white">••••••••••••••••</p>
                       </div>
                       <button className="text-[10px] font-black uppercase tracking-widest text-[--flx-cyan] hover:translate-x-1 transition-transform cursor-pointer flex items-center gap-2">
                          Update Password
                          <ChevronRight size={14} />
                       </button>
                    </div>
                 </div>

                 <div className="p-10 rounded-[40px] border border-red-500/20 bg-red-500/5 space-y-8 shadow-xl">
                    <div className="space-y-3">
                       <div className="flex items-center gap-3 text-red-500">
                          <Trash2 size={24} />
                          <h4 className="text-sm font-black uppercase tracking-[5px]">Danger Zone</h4>
                       </div>
                       <p className="text-[11px] text-white/30 font-medium leading-relaxed uppercase tracking-widest">Immediate account termination. Your watch history, preferences, and identity will be permanently deleted from our servers.</p>
                    </div>
                    <button 
                      onClick={() => setShowDeleteModal(true)}
                      className="px-8 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-[10px] font-black text-red-500 uppercase tracking-[3px] hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-lg hover:shadow-red-500/30"
                    >
                      Delete Account Forever
                    </button>
                 </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                 <div className="space-y-6">
                    <div className="flex items-center gap-4 ml-4">
                       <Eye className="text-[--flx-cyan]" size={18} />
                       <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[5px]">Engine Rules</h3>
                    </div>
                    <div className="p-10 rounded-[40px] bg-white/3 border border-white/10 space-y-10 shadow-2xl">
                       <div className="flex justify-between items-center group cursor-pointer" onClick={() => togglePref('autoplay')}>
                          <div className="space-y-1.5">
                             <p className="text-sm font-black text-white group-hover:text-[--flx-cyan] transition-colors">Autoplay Trailers</p>
                             <p className="text-[11px] text-white/30 font-medium">Automatic engagement on detail pages.</p>
                          </div>
                          <div className={cn(
                             "w-14 h-7 rounded-full relative transition-all duration-500 p-1.5 cursor-pointer",
                             prefs.autoplay ? "bg-[--flx-cyan]" : "bg-white/10"
                          )}>
                             <div className={cn(
                                "w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-xl",
                                prefs.autoplay ? "translate-x-7" : "translate-x-0"
                             )} />
                          </div>
                       </div>
                       <div className="h-px bg-white/5" />
                       <div className="flex justify-between items-center group cursor-pointer" onClick={() => togglePref('notifications')}>
                          <div className="space-y-1.5">
                             <p className="text-sm font-black text-white group-hover:text-[--flx-cyan] transition-colors">System Notifications</p>
                             <p className="text-[11px] text-white/30 font-medium">Weekly intelligence on new arrivals.</p>
                          </div>
                          <div className={cn(
                             "w-14 h-7 rounded-full relative transition-all duration-500 p-1.5 cursor-pointer",
                             prefs.notifications ? "bg-[--flx-purple]" : "bg-white/10"
                          )}>
                             <div className={cn(
                                "w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-xl",
                                prefs.notifications ? "translate-x-7" : "translate-x-0"
                             )} />
                          </div>
                       </div>
                       <div className="h-px bg-white/5" />
                       <div className="flex justify-between items-center group cursor-pointer" onClick={() => togglePref('soundEffects')}>
                          <div className="space-y-1.5">
                             <p className="text-sm font-black text-white group-hover:text-[--flx-cyan] transition-colors">Cinematic Audio Feedback</p>
                             <p className="text-[11px] text-white/30 font-medium">Soft audio cues for micro-interactions.</p>
                          </div>
                          <div className={cn(
                             "w-14 h-7 rounded-full relative transition-all duration-500 p-1.5 cursor-pointer",
                             prefs.soundEffects ? "bg-[--flx-cyan]" : "bg-white/10"
                          )}>
                             <div className={cn(
                                "w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-xl",
                                prefs.soundEffects ? "translate-x-7" : "translate-x-0"
                             )} />
                          </div>
                       </div>
                       <div className="h-px bg-white/5" />
                       <div className="flex justify-between items-center">
                          <div className="space-y-1.5">
                             <p className="text-sm font-black text-white">Default Resolution</p>
                             <p className="text-[11px] text-white/30 font-medium">Always prioritize maximum fidelity.</p>
                          </div>
                          <select 
                            value={prefs.quality}
                            onChange={(e) => setPrefs(p => ({ ...p, quality: e.target.value }))}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white outline-none cursor-pointer hover:bg-white/10 transition-colors"
                          >
                             <option value="4k">4K UHD</option>
                             <option value="1080p">1080P HD</option>
                             <option value="720p">720P SD</option>
                          </select>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                 <div className="space-y-10">
                    {/* Theme Locked */}
                    <div className="p-8 rounded-[40px] bg-linear-to-br from-[--flx-surface-2] to-[--flx-bg] border border-white/5 flex items-center justify-between shadow-2xl">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-3xl bg-black flex items-center justify-center border border-white/5 shadow-2xl">
                             <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-sm font-black text-white uppercase tracking-widest">Shadow Mode</p>
                             <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest">Locked for maximum immersion</p>
                          </div>
                       </div>
                       <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                          Active
                       </div>
                    </div>

                    {/* Accent Color */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-4 ml-4">
                          <Palette className="text-[--flx-cyan]" size={18} />
                          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[5px]">Accent Resonance</h3>
                       </div>
                       <div className="p-10 rounded-[40px] bg-white/3 border border-white/10 shadow-2xl">
                          <div className="grid grid-cols-4 gap-6">
                             {[
                               { name: 'Nebula', color: '#8b5cf6' },
                               { name: 'Aurora', color: '#22d3ee' },
                               { name: 'Hyper',  color: '#f472b6' },
                               { name: 'Core',   color: '#fbbf24' },
                             ].map((c) => (
                               <button 
                                 key={c.name}
                                 onClick={() => setPrefs(p => ({ ...p, accentColor: c.color }))}
                                 className="flex flex-col items-center gap-4 group cursor-pointer"
                               >
                                  <div className={cn(
                                    "w-16 h-16 rounded-[24px] transition-all duration-500 shadow-2xl relative p-1",
                                    prefs.accentColor === c.color ? "bg-white scale-110" : "bg-white/5 hover:bg-white/20"
                                  )}>
                                     <div 
                                        className="w-full h-full rounded-[20px] shadow-inner" 
                                        style={{ backgroundColor: c.color }} 
                                     />
                                     {prefs.accentColor === c.color && (
                                       <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[--flx-cyan] flex items-center justify-center shadow-lg border-2 border-white animate-fade-up">
                                          <Check size={12} className="text-black font-black" />
                                       </div>
                                     )}
                                  </div>
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest transition-colors",
                                    prefs.accentColor === c.color ? "text-white" : "text-white/20 group-hover:text-white/40"
                                  )}>
                                    {c.name}
                                  </span>
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Compact Mode */}
                    <div className="p-10 rounded-[40px] bg-white/3 border border-white/10 flex items-center justify-between shadow-2xl group cursor-pointer" onClick={() => togglePref('compactMode')}>
                       <div className="space-y-1.5">
                          <p className="text-sm font-black text-white group-hover:text-[--flx-cyan] transition-colors">Information Density</p>
                          <p className="text-[11px] text-white/30 font-medium">Reduce UI scale for professional oversight.</p>
                       </div>
                       <div className={cn(
                          "w-14 h-7 rounded-full relative transition-all duration-500 p-1.5 cursor-pointer",
                          prefs.compactMode ? "bg-[--flx-cyan]" : "bg-white/10"
                       )}>
                          <div className={cn(
                             "w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-xl",
                             prefs.compactMode ? "translate-x-7" : "translate-x-0"
                          )} />
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ── DANGER MODAL ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[--flx-surface-1] rounded-[40px] border border-red-500/20 p-12 shadow-[0_50px_100px_rgba(0,0,0,0.8)] space-y-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                 <div className="w-20 h-20 rounded-[30px] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                    <Trash2 size={40} />
                 </div>
                 <h2 className="font-bebas text-5xl text-white uppercase tracking-tight">Final Warning</h2>
                 <p className="text-[11px] text-white/30 font-medium leading-relaxed uppercase tracking-widest">
                    This action is irreversible. All your data will be purged. Type <span className="text-red-500 font-black">&quot;DELETE&quot;</span> to confirm destruction.
                 </p>
              </div>

              <div className="space-y-4">
                 <input 
                   type="text" 
                   value={deleteConfirmText}
                   onChange={(e) => setDeleteConfirmText(e.target.value)}
                   placeholder="Confirmation Code..."
                   className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-center font-black tracking-[4px] text-red-500 outline-none focus:border-red-500/50 transition-all"
                 />
                 <div className="flex gap-4">
                    <button 
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 py-5 rounded-2xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Abort Mission
                    </button>
                    <button 
                      disabled={deleteConfirmText !== 'DELETE'}
                      onClick={async () => {
                        await deleteAccount();
                        window.location.href = '/';
                      }}
                      className="flex-1 py-5 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-20 shadow-2xl shadow-red-600/20 cursor-pointer"
                    >
                      Delete Forever
                    </button>
                 </div>
              </div>

              <button 
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
