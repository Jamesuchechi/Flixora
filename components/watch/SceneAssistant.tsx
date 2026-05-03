'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, History, Info, HelpCircle } from 'lucide-react';
import { askFlixora } from '@/lib/supabase/actions/ai';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SceneAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  timestamp: number;
  plotContext: string;
}

export function SceneAssistant({ isOpen, onClose, title, timestamp, plotContext }: SceneAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [noSpoilers, setNoSpoilers] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askFlixora(title, timestamp, text, plotContext, noSpoilers);
      const assistantMsg: Message = { role: 'assistant', content: response || "I'm speechless." };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const templates = [
    { label: "What did I miss?", icon: History, query: "I just joined/got distracted. What's the recap of the plot so far in this movie?" },
    { label: "Who is this?", icon: Info, query: "Who are the main characters on screen right now and what are their motivations?" },
    { label: "Explain this scene", icon: HelpCircle, query: "I'm a bit confused. What exactly just happened in this scene?" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-[350px] bg-[--flx-bg]/95 backdrop-blur-2xl border-l border-white/5 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Scene Advisor</h3>
                  <p className="text-[9px] text-[--flx-cyan] font-bold uppercase tracking-tighter">AI-Powered Intelligence</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setNoSpoilers(!noSpoilers)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all flex items-center gap-2",
                    noSpoilers ? "bg-[--flx-cyan]/10 text-[--flx-cyan] border border-[--flx-cyan]/20" : "bg-white/5 text-white/30 border border-white/10"
                  )}
                  title={noSpoilers ? "Anti-Spoiler Active" : "Anti-Spoiler Disabled"}
                >
                  <div className={cn("w-1 h-1 rounded-full", noSpoilers ? "bg-[--flx-cyan] animate-pulse" : "bg-white/30")} />
                  {noSpoilers ? "No Spoilers" : "Spoiler Mode"}
                </button>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.length === 0 && (
                <div className="space-y-6 animate-fade-up">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                    <p className="text-[11px] text-white/50 leading-relaxed italic">
                      &quot;I&apos;ve analyzed the cinematic structure of <span className="text-[--flx-cyan] font-bold">#{title}</span>. Ask me anything about the plot, characters, or themes.&quot;
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Suggested Queries</p>
                    {templates.map((t) => (
                      <button
                        key={t.label}
                        onClick={() => handleSend(t.query)}
                        className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-left transition-all group"
                      >
                        <t.icon size={16} className="text-[--flx-purple] group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold text-white/80">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex flex-col gap-2 max-w-[85%]",
                  m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-[12px] leading-relaxed shadow-lg",
                    m.role === 'user' 
                      ? "bg-[--flx-purple] text-white rounded-tr-none" 
                      : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
                  )}>
                    {m.content}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-tighter text-white/20">
                    {m.role === 'user' ? 'You' : 'Flixora AI'}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 text-white/40">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-current animate-bounce" />
                    <div className="w-1 h-1 rounded-full bg-current animate-bounce delay-100" />
                    <div className="w-1 h-1 rounded-full bg-current animate-bounce delay-200" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest italic animate-pulse">Analyzing frames...</span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative"
              >
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 pr-12 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[--flx-purple]/50 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[--flx-purple] hover:text-[--flx-cyan] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="mt-4 text-[8px] text-center text-white/20 uppercase tracking-widest font-black">
                Press <span className="text-white/40 font-bold">?</span> to toggle AI Advisor
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
