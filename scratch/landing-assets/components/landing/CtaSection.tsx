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
    <section className="px-12 py-24 text-center relative overflow-hidden" id="signup">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(139,92,246,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative z-10">
        <p className="text-[11px] tracking-[2.5px] uppercase text-[--flx-purple] font-semibold mb-3">Get started</p>
        <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(40px,6vw,72px)] tracking-[1.5px] mb-4">
          Ready to Watch?
        </h2>
        <p className="text-[15px] text-[--flx-text-2] font-light mb-10">
          Create your free account in seconds. No credit card needed.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2.5 max-w-[420px] mx-auto mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            required
            className="flex-1 px-5 py-3.5 bg-white/6 border border-white/12 focus:border-[--flx-purple]/50 rounded-xl text-[14px] text-[--flx-text-1] placeholder-[--flx-text-3] outline-none transition-colors font-['Outfit',sans-serif]"
          />
          <button
            type="submit"
            className="px-6 py-3.5 bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white text-[14px] font-semibold rounded-xl transition-all hover:-translate-y-px whitespace-nowrap cursor-pointer border-none font-['Outfit',sans-serif]"
          >
            Get Started
          </button>
        </form>

        <p className="text-[11px] text-[--flx-text-3]">
          Free forever · No ads · Cancel Pro anytime
        </p>
      </div>
    </section>
  );
}
