'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Search, ChevronRight, HelpCircle, User, CreditCard, Play, Shield, MessageSquare } from 'lucide-react';

const CATEGORIES = [
  {
    icon: <User className="w-5 h-5 text-[--flx-purple]" />,
    title: 'Account & Profile',
    description: 'Manage your subscription, change your password, and profile settings.',
    links: ['Creating an account', 'Resetting password', 'Profiles for kids', 'Account security']
  },
  {
    icon: <Play className="w-5 h-5 text-[--flx-cyan]" />,
    title: 'Streaming & Content',
    description: 'Everything you need to know about watching on Flixora.',
    links: ['Watching offline', 'Video quality settings', 'Supported devices', 'Subtitle options']
  },
  {
    icon: <CreditCard className="w-5 h-5 text-[--flx-pink]" />,
    title: 'Billing & Plans',
    description: 'Update payment methods and understand your charges.',
    links: ['How billing works', 'Updating payment method', 'Plan comparison', 'Canceling subscription']
  },
  {
    icon: <Shield className="w-5 h-5 text-[--flx-gold]" />,
    title: 'Privacy & Security',
    description: 'Your data safety is our top priority.',
    links: ['Privacy settings', 'Data collection', 'Reporting security issues', 'Terms of use']
  }
];

const FAQS = [
  {
    question: "What is Flixora?",
    answer: "Flixora is a premium streaming platform that provides high-quality movies and series. We focus on delivering an immersive cinematic experience with our unique Aurora design system."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription at any time from your Account Settings page. Your access will continue until the end of your current billing period."
  },
  {
    question: "Can I watch on multiple devices?",
    answer: "Yes! Depending on your plan, you can stream on 1, 2, or 4 devices simultaneously. You can also create up to 5 individual profiles for your household."
  },
  {
    question: "How do I change my streaming quality?",
    answer: "During playback, click the settings icon (gear) to choose from Auto, 720p, 1080p, or 4K UHD. We recommend Auto for the smoothest experience."
  }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[--flx-bg] pt-32 pb-20 px-6 md:px-10">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 bg-linear-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
          How can we help?
        </h1>
        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[--flx-cyan] transition-colors" />
          <input 
            type="text" 
            placeholder="Search for articles, guides, and more..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:border-[--flx-cyan]/50 focus:bg-white/10 transition-all text-lg"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {CATEGORIES.map((cat, i) => (
            <div 
              key={i}
              className="p-8 rounded-3xl bg-white/2 border border-white/5 hover:border-white/10 hover:bg-white/4 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{cat.title}</h3>
              <p className="text-sm text-[--flx-text-3] mb-6 leading-relaxed">{cat.description}</p>
              <ul className="space-y-3">
                {cat.links.map((link, j) => (
                  <li key={j}>
                    <Link href="#" className="text-sm text-[--flx-text-2] hover:text-[--flx-cyan] flex items-center gap-2 group/link">
                      <ChevronRight className="w-3 h-3 text-white/20 group-hover/link:translate-x-1 transition-transform" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="mb-24">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-12 flex items-center gap-4">
            <HelpCircle className="w-8 h-8 text-[--flx-cyan]" />
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FAQS.map((faq, i) => (
              <div key={i} className="space-y-4">
                <h4 className="text-lg font-bold text-white">{faq.question}</h4>
                <p className="text-[--flx-text-3] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Still need help? */}
        <div className="relative rounded-3xl p-12 overflow-hidden bg-linear-to-br from-[--flx-purple]/20 to-[--flx-cyan]/20 border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[--flx-cyan]/20 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-3">
                Still need help?
              </h2>
              <p className="text-white/60">
                Our support team is available 24/7 to assist you with any questions.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button variant="primary" size="lg" className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Contact Support
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                Visit Community
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
