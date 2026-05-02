'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'Is Flixora really free to start?',
    a: 'Yes — the Free plan is free forever with no credit card required. You get HD streaming and a watchlist of up to 20 titles. Upgrade to Pro for 4K and unlimited features.',
  },
  {
    q: 'What devices does Flixora support?',
    a: 'Flixora works on any modern browser across desktop, tablet, and mobile. Your watchlist and progress sync across all devices automatically. Native iOS/Android apps are on the roadmap.',
  },
  {
    q: 'Are there any ads?',
    a: 'Never. Flixora is completely ad-free on all plans including the free tier. No pre-rolls, no banners, no sponsored content. The business model is subscriptions — not your attention.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No lock-ins, no cancellation fees. Cancel from your profile settings in under 10 seconds. Your access continues until the end of the billing period.',
  },
  {
    q: 'Where does the content come from?',
    a: 'Movie and series metadata is powered by TMDB. Video content is served through licensed streaming sources. We continuously expand our library through content partnerships.',
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="px-12 py-20" id="faq">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[2.5px] uppercase text-[--flx-purple] font-semibold mb-3">FAQ</p>
        <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(36px,5vw,56px)] tracking-[1.5px]">
          Common Questions
        </h2>
      </div>

      <div className="max-w-2xl mx-auto space-y-0">
        {FAQS.map((faq, i) => (
          <div key={i} className="border-b border-white/6">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between py-5 text-left bg-transparent border-none cursor-pointer group"
            >
              <span className="text-[14px] font-medium text-[--flx-text-1] group-hover:text-white transition-colors pr-4">
                {faq.q}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2"
                className={cn('flex-shrink-0 transition-transform duration-200', open === i && 'rotate-45')}
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <div
              className={cn(
                'overflow-hidden transition-all duration-300 ease-in-out',
                open === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <p className="text-[13px] text-[--flx-text-2] leading-relaxed pb-5">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
