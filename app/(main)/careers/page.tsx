'use client';

import React from 'react';
import { Briefcase, MapPin, Clock, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Careers | Flixora',
  description: 'Join the team building the future of streaming.',
};

export default function CareersPage() {
  const jobs = [
    { title: "Senior Frontend Engineer", location: "Remote / LA", type: "Full-time", team: "Product" },
    { title: "Product Designer", location: "New York", type: "Full-time", team: "Design" },
    { title: "Backend Architect", location: "Remote", type: "Contract", team: "Engineering" },
    { title: "Content Strategist", location: "London", type: "Full-time", team: "Content" },
    { title: "Customer Success Lead", location: "Remote", type: "Full-time", team: "Support" },
  ];

  return (
    <div className="min-h-screen bg-[--flx-bg] pt-32 pb-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 animate-fade-up">
            Build the <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[--flx-purple] to-[--flx-cyan]">Future.</span>
          </h1>
          <p className="text-xl text-[--flx-text-3] max-w-2xl mx-auto leading-relaxed animate-fade-up [animation-delay:100ms]">
            We&apos;re looking for visionaries, dreamers, and builders to help us create the most immersive streaming experience on the planet.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 animate-fade-up [animation-delay:200ms]">
          {[
            { title: "Remote First", desc: "Work from anywhere in the world. We believe in talent, not time zones." },
            { title: "Equity & Growth", desc: "Every employee is an owner. We grow together and share the success." },
            { title: "Latest Tech", desc: "Work with the best tools. We stay on the bleeding edge of technology." }
          ].map((benefit, i) => (
            <div key={i} className="p-8 rounded-[32px] bg-white/2 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4">{benefit.title}</h3>
              <p className="text-[--flx-text-3] text-sm leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* Job Listings */}
        <div className="animate-fade-up [animation-delay:300ms]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Open Positions</h2>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[--flx-cyan]" />
              <input 
                type="text" 
                placeholder="Search jobs..."
                className="bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[--flx-cyan]/50 transition-all w-full md:w-64"
              />
            </div>
          </div>

          <div className="space-y-4">
            {jobs.map((job, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 hover:border-white/10 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[--flx-cyan] transition-colors">{job.title}</h4>
                  <div className="flex flex-wrap gap-4 text-xs text-[--flx-text-3] uppercase tracking-widest font-bold">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {job.location}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {job.type}</span>
                    <span className="flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> {job.team}</span>
                  </div>
                </div>
                <Button variant="secondary" className="flex items-center gap-2">
                  Apply Now
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
