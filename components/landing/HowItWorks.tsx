'use client';

import { motion } from 'framer-motion';
import { Search, Play, Bookmark } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    step: '01',
    title: 'Discover',
    description: 'Browse 500,000+ titles powered by real-time data from every major streaming platform.',
    color: '#8b5cf6', // flx-purple
  },
  {
    icon: Play,
    step: '02',
    title: 'Choose How to Watch',
    description: 'Free on Flixora, or find it on your streaming services — all in one place.',
    color: '#06b6d4', // flx-cyan
  },
  {
    icon: Bookmark,
    step: '03',
    title: 'Never Lose Your Place',
    description: 'Progress synced across every device, automatically. Pick up exactly where you left off.',
    color: '#f59e0b', // flx-gold
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[60px_60px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="text-[10px] font-black uppercase tracking-[4px] text-[--flx-cyan] mb-4">
            How it works
          </p>
          <h2 className="font-bebas text-5xl md:text-7xl tracking-tight text-[--flx-text-1]">
            Simple as it gets
          </h2>
        </div>

        {/* Steps */}
        <div className="relative flex flex-col md:flex-row items-stretch gap-0">
          {STEPS.map((step, i) => (
            <div key={step.step} className="flex flex-col md:flex-row items-stretch flex-1">
              {/* Card */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex-1 group relative bg-[--flx-surface-1] border border-white/5 rounded-[32px] p-10 flex flex-col gap-6 hover:border-white/10 transition-all duration-500 hover:-translate-y-1"
                style={{ boxShadow: `0 0 60px ${step.color}08` }}
              >
                {/* Step number watermark */}
                <span className="absolute top-6 right-8 font-bebas text-8xl text-white/3 leading-none select-none pointer-events-none">
                  {step.step}
                </span>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${step.color}18`, border: `1px solid ${step.color}30` }}
                >
                  <step.icon size={24} style={{ color: step.color }} />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="font-bebas text-3xl tracking-wider text-[--flx-text-1]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[--flx-text-3] font-medium">
                    {step.description}
                  </p>
                </div>

                {/* Bottom accent */}
                <div
                  className="absolute bottom-0 left-10 right-10 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(to right, transparent, ${step.color}60, transparent)` }}
                />
              </motion.div>

              {/* Connector arrow (between cards, not after last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex items-center justify-center w-10 shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/10">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
