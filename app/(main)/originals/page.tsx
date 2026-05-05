import React from 'react';
import { Sparkles, Play, Info, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Flixora Originals | Exclusive Content',
  description: 'Discover movies and series you can only find on Flixora.',
};

export default function OriginalsPage() {
  const upcoming = [
    { title: "Aurora: The Beginning", date: "Coming July 2026", type: "Series" },
    { title: "Neon Shadows", date: "Coming August 2026", type: "Film" },
    { title: "The Last Pixel", date: "Coming September 2026", type: "Documentary" },
  ];

  return (
    <div className="min-h-screen bg-[--flx-bg] pt-32 pb-20 px-6 md:px-10 overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-[60vh] rounded-[48px] overflow-hidden mb-20 group">
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/40 to-transparent z-10" />
        <video 
          autoPlay 
          muted 
          loop 
          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[10s]"
          poster="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200"
        >
          {/* In a real app, this would be a high-quality trailer */}
        </video>
        <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-20 z-20">
          <div className="flex items-center gap-2 text-[--flx-cyan] text-xs font-black uppercase tracking-[4px] mb-6 animate-fade-up">
            <Sparkles className="w-4 h-4 fill-current" />
            Flixora Original
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-tight animate-fade-up [animation-delay:100ms]">
            Midnight <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[--flx-purple] to-[--flx-cyan]">Voyage.</span>
          </h1>
          <div className="flex gap-4 animate-fade-up [animation-delay:200ms]">
            <Button variant="primary" size="lg" className="px-10 flex items-center gap-3">
              <Play className="w-5 h-5 fill-current" />
              Watch Trailer
            </Button>
            <Button variant="secondary" size="lg" className="px-10 flex items-center gap-3">
              <Info className="w-5 h-5" />
              More Info
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-12 flex items-center gap-4">
          <Calendar className="w-8 h-8 text-[--flx-pink]" />
          Coming Soon to Flixora
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {upcoming.map((item, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-2/3 rounded-3xl overflow-hidden bg-white/5 border border-white/10 mb-6 relative">
                <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[--flx-cyan] mb-2">{item.type}</div>
                  <h4 className="text-xl font-bold text-white group-hover:text-[--flx-cyan] transition-colors">{item.title}</h4>
                </div>
              </div>
              <p className="text-sm text-[--flx-text-3] font-bold uppercase tracking-widest">{item.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
