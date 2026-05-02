'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'Is Flixora really free to start?',
    a: 'Yes — the Free plan is free forever with no credit card required. You get HD streaming and a watchlist of up to 20 titles. Upgrade to Pro for 4K and unlimited features.',
  },
  {
    q: 'What devices does Flixora support?',
    a: 'Flixora works on any modern browser across desktop, tablet, and mobile. Your watchlist and progress sync across all devices automatically.',
  },
  {
    q: 'Are there any ads?',
    a: 'Never. Flixora is completely ad-free on all plans including the free tier. No pre-rolls, no banners, no sponsored content. We value your cinematic experience above all else.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. No contracts, no cancellation fees. Manage your subscription directly from your profile settings in seconds.',
  },
  {
    q: 'Where does the content come from?',
    a: 'Metadata is powered by TMDB. Video content is served through high-quality licensed streaming sources to ensure a legal and stable experience.',
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="px-12 py-32" id="faq">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[4px] uppercase text-[--flx-purple] font-bold mb-4">SUPPORT</p>
          <h2 className="font-bebas text-[clamp(44px,7vw,64px)] tracking-[1px] mb-4">Common Questions</h2>
          <p className="text-[16px] text-[--flx-text-2] font-light">Everything you need to know about Flixora.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div 
              key={i} 
              className={cn(
                "group rounded-[24px] border transition-all duration-300 overflow-hidden",
                open === i ? "bg-white/4 border-white/10" : "bg-white/2 border-white/5 hover:border-white/10"
              )}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-7 text-left bg-transparent border-none cursor-pointer"
              >
                <span className="text-[15px] font-medium text-white/90 group-hover:text-white transition-colors pr-6">
                  {faq.q}
                </span>
                <div className={cn(
                  "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300",
                  open === i ? "bg-[--flx-purple] border-[--flx-purple] rotate-180" : "bg-white/5"
                )}>
                  <ChevronDown size={14} className="text-white" />
                </div>
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-500 ease-in-out",
                  open === i ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="px-7 pb-7 text-[14px] text-[--flx-text-3] leading-relaxed max-w-[90%]">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
