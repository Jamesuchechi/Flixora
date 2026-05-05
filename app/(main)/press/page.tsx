import React from 'react';
import { Download, FileText, Image as ImageIcon, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Press Kit | Flixora',
  description: 'Download assets and find the latest news about Flixora.',
};

export default function PressPage() {
  const news = [
    { date: "May 1, 2026", title: "Flixora reaches 2 million active subscribers", source: "Variety" },
    { date: "April 15, 2026", title: "How Flixora is changing the way we watch together", source: "TechCrunch" },
    { date: "March 28, 2026", title: "The tech behind Flixora's Aurora design system", source: "The Verge" },
  ];

  return (
    <div className="min-h-screen bg-[--flx-bg] pt-32 pb-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-24">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 animate-fade-up">
            Press <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[--flx-cyan] to-[--flx-purple]">Center.</span>
          </h1>
          <p className="text-xl text-[--flx-text-3] max-w-2xl leading-relaxed animate-fade-up [animation-delay:100ms]">
            Everything you need to tell the Flixora story, from high-resolution assets to our latest announcements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-32">
          {/* Asset Downloads */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up [animation-delay:200ms]">
            {[
              { title: "Brand Assets", icon: <ImageIcon className="w-6 h-6" />, desc: "Logos, colors, and usage guidelines." },
              { title: "Product Shots", icon: <Share2 className="w-6 h-6" />, desc: "High-res screenshots of the platform." },
              { title: "Executive Bios", icon: <FileText className="w-6 h-6" />, desc: "Meet the team behind Flixora." },
              { title: "Press Releases", icon: <FileText className="w-6 h-6" />, desc: "Archive of all official news." }
            ].map((kit, i) => (
              <div key={i} className="p-8 rounded-[32px] bg-white/2 border border-white/5 hover:bg-white/4 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[--flx-cyan]/10 group-hover:text-[--flx-cyan] transition-all">
                  {kit.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{kit.title}</h3>
                <p className="text-sm text-[--flx-text-3] mb-6">{kit.desc}</p>
                <Button variant="secondary" size="sm" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Kit
                </Button>
              </div>
            ))}
          </div>

          {/* Latest News */}
          <div className="animate-fade-up [animation-delay:300ms]">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[--flx-cyan]" />
              Latest News
            </h2>
            <div className="space-y-6">
              {news.map((item, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="text-[10px] uppercase tracking-[2px] font-bold text-white/30 mb-2">{item.date} • {item.source}</div>
                  <h4 className="text-white font-bold group-hover:text-[--flx-cyan] transition-colors leading-snug">{item.title}</h4>
                  <div className="h-px w-full bg-white/5 mt-6 group-hover:bg-white/10 transition-colors" />
                </div>
              ))}
              <Button variant="secondary" className="w-full mt-4">View All News</Button>
            </div>
          </div>
        </div>

        {/* Contact Press */}
        <div className="p-12 rounded-[40px] bg-linear-to-r from-[--flx-purple]/20 to-[--flx-cyan]/20 border border-white/10 text-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Media Inquiries</h2>
          <p className="text-white/60 mb-8">For interviews, quotes, or additional information, please contact our press team.</p>
          <a href="mailto:press@flixora.com" className="text-2xl font-bold text-white hover:text-[--flx-cyan] transition-colors underline underline-offset-8 decoration-[--flx-cyan]/30">
            press@flixora.com
          </a>
        </div>
      </div>
    </div>
  );
}
