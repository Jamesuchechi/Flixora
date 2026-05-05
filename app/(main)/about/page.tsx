import React from 'react';
import Image from 'next/image';
import { Sparkles, Film, Zap, Globe, Users, Award } from 'lucide-react';

export const metadata = {
  title: 'About Us | Flixora',
  description: 'The story behind Flixora - redefining the cinematic experience.',
};

export default function AboutPage() {
  const stats = [
    { label: "Active Users", value: "2.4M+", icon: <Users className="w-5 h-5" /> },
    { label: "Movies & Series", value: "15k+", icon: <Film className="w-5 h-5" /> },
    { label: "Countries", value: "190+", icon: <Globe className="w-5 h-5" /> },
    { label: "Awards Won", value: "12", icon: <Award className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[--flx-bg] pt-32 pb-20 px-6 md:px-10 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-linear-to-b from-[--flx-purple]/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[--flx-cyan] text-xs font-bold uppercase tracking-widest mb-8 animate-fade-up">
            <Sparkles className="w-3 h-3" />
            Our Story
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-tight animate-fade-up">
            Redefining <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[--flx-purple] via-[--flx-cyan] to-[--flx-pink]">Cinema.</span>
          </h1>
          <p className="text-xl text-[--flx-text-3] max-w-2xl mx-auto leading-relaxed animate-fade-up [animation-delay:100ms]">
            Flixora was born from a simple idea: that the way we watch movies should be as beautiful as the movies themselves.
          </p>
        </div>

        {/* Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mb-32">
          <div className="relative group animate-fade-up [animation-delay:200ms]">
            <div className="absolute -inset-4 bg-linear-to-r from-[--flx-purple] to-[--flx-cyan] rounded-[40px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10 bg-white/5">
              <Image 
                src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1200" 
                alt="Cinema experience" 
                fill
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[--flx-bg] via-transparent to-transparent" />
            </div>
          </div>
          <div className="animate-fade-up [animation-delay:300ms]">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-6">Our Vision</h2>
            <p className="text-[--flx-text-2] leading-relaxed mb-8">
              We believe in a world where high-quality entertainment is accessible to everyone, everywhere. Our platform is built on cutting-edge technology and a passion for storytelling, ensuring every frame is delivered with precision and every interaction feels like magic.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/2 border border-white/5">
                  <div className="text-[--flx-cyan] mb-3">{stat.icon}</div>
                  <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-[--flx-text-3] uppercase tracking-widest font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-32">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-center mb-16">What drives us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Quality First",
                desc: "We never compromise on the technical aspects of streaming, from bitrates to buffer speeds.",
                icon: <Zap className="w-6 h-6 text-[--flx-purple]" />
              },
              {
                title: "Immersive Design",
                desc: "Our Aurora UI is designed to disappear, letting the content take center stage.",
                icon: <Sparkles className="w-6 h-6 text-[--flx-cyan]" />
              },
              {
                title: "Community Driven",
                desc: "We build Flixora with our users, constantly evolving based on your feedback.",
                icon: <Users className="w-6 h-6 text-[--flx-pink]" />
              }
            ].map((value, i) => (
              <div key={i} className="p-8 rounded-[32px] bg-white/2 border border-white/5 hover:bg-white/4 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-[--flx-text-3] leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-20 rounded-[48px] bg-linear-to-br from-[--flx-purple]/10 via-transparent to-[--flx-cyan]/10 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[--flx-purple]/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 relative z-10">
            Join the <span className="text-[--flx-cyan]">Revolution</span>
          </h2>
          <p className="text-[--flx-text-3] mb-12 max-w-xl mx-auto relative z-10">
            Be part of the next generation of streaming. Experience cinema like never before.
          </p>
          <a 
            href="/auth/register" 
            className="inline-flex items-center gap-3 px-10 py-5 bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 relative z-10"
          >
            Start Your Journey
            <Zap className="w-5 h-5 fill-current" />
          </a>
        </div>
      </div>
    </div>
  );
}
