'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CtaSection() {
  const router   = useRouter();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      router.push(`/signup?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <section className="px-6 lg:px-12 py-32 text-center relative overflow-hidden" id="signup">
      {/* Dynamic Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full lg:w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(139,92,246,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-[800px] mx-auto">
        <p className="text-[10px] tracking-[4px] uppercase text-[--flx-purple] font-bold mb-4">GET STARTED</p>
        <h2 className="font-bebas text-[clamp(44px,7vw,80px)] leading-[0.9] tracking-[1px] mb-6">
          Ready to Watch?
        </h2>
        <p className="text-[16px] lg:text-[18px] text-[--flx-text-2] font-light mb-12 max-w-[500px] mx-auto leading-relaxed">
          Create your free account in seconds. Join the community and start your cinematic journey today.
        </p>

        <form 
          onSubmit={handleSubmit} 
          className="flex flex-col sm:flex-row gap-3 max-w-[500px] mx-auto mb-6 px-4 sm:px-0"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            required
            className="flex-1 px-6 py-4 bg-white/5 border border-white/10 focus:border-[--flx-purple]/50 focus:bg-white/10 rounded-2xl text-[15px] text-white placeholder-white/20 outline-none transition-all"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-white text-black hover:bg-white/90 text-[15px] font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer border-none shadow-xl shadow-white/5"
          >
            Get Started
          </button>
        </form>

        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[11px] text-[--flx-text-3] font-medium tracking-wide">
          <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-[--flx-purple]" /> FREE FOREVER</span>
          <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-[--flx-cyan]" /> NO ADS</span>
          <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-[--flx-pink]" /> CANCEL PRO ANYTIME</span>
        </div>
      </div>
    </section>
  );
}
