'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Mail, MessageCircle, X, Globe, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, you'd handle form submission here
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[--flx-bg] flex items-center justify-center px-6">
        <div className="text-center animate-fade-up">
          <div className="w-24 h-24 rounded-full bg-[--flx-cyan]/10 flex items-center justify-center mx-auto mb-8 border border-[--flx-cyan]/20">
            <CheckCircle2 className="w-12 h-12 text-[--flx-cyan]" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Message Sent!</h1>
          <p className="text-[--flx-text-3] mb-8 max-w-sm mx-auto">
            Thank you for reaching out. Our team will get back to you within 24 hours.
          </p>
          <Button variant="secondary" onClick={() => setSubmitted(false)}>
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--flx-bg] pt-32 pb-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Info Side */}
          <div className="animate-fade-up">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">
              Get in <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[--flx-purple] to-[--flx-cyan]">Touch.</span>
            </h1>
            <p className="text-lg text-[--flx-text-3] mb-12 max-w-md leading-relaxed">
              Have a question, feedback, or just want to say hello? We&apos;d love to hear from you.
            </p>

            <div className="space-y-10">
              <div className="flex gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[--flx-cyan]/50 transition-colors">
                  <Mail className="w-6 h-6 text-[--flx-cyan]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Email Us</h4>
                  <p className="text-[--flx-text-2] hover:text-white transition-colors cursor-pointer">support@flixora.com</p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[--flx-purple]/50 transition-colors">
                  <MessageCircle className="w-6 h-6 text-[--flx-purple]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Live Chat</h4>
                  <p className="text-[--flx-text-2]">Available Mon-Fri, 9am-6pm EST</p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[--flx-pink]/50 transition-colors">
                  <MapPin className="w-6 h-6 text-[--flx-pink]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Office</h4>
                  <p className="text-[--flx-text-2]">123 Cinema Drive, Los Angeles, CA</p>
                </div>
              </div>
            </div>

            <div className="mt-16 flex gap-4">
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-[--flx-cyan]/10 hover:text-[--flx-cyan] transition-all">
                <X className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Form Side */}
          <div className="relative animate-fade-up [animation-delay:200ms]">
            <div className="absolute -inset-4 bg-linear-to-br from-[--flx-purple]/20 to-[--flx-cyan]/20 blur-3xl opacity-30 -z-10" />
            <form onSubmit={handleSubmit} className="bg-white/3 border border-white/10 rounded-[40px] p-8 md:p-12 backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 ml-4">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/20 focus:outline-none focus:border-[--flx-cyan]/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 ml-4">Email Address</label>
                  <input 
                    required
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/20 focus:outline-none focus:border-[--flx-cyan]/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 ml-4">Subject</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white appearance-none focus:outline-none focus:border-[--flx-cyan]/50 transition-all cursor-pointer">
                  <option className="bg-[--flx-bg]">General Inquiry</option>
                  <option className="bg-[--flx-bg]">Technical Support</option>
                  <option className="bg-[--flx-bg]">Billing Issue</option>
                  <option className="bg-[--flx-bg]">Feedback</option>
                </select>
              </div>

              <div className="space-y-2 mb-10">
                <label className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 ml-4">Message</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/20 focus:outline-none focus:border-[--flx-cyan]/50 transition-all resize-none"
                />
              </div>

              <Button variant="primary" size="lg" className="w-full py-5 rounded-2xl flex items-center justify-center gap-3">
                <Send className="w-5 h-5" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
