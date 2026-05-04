'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Film, MessageSquare, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Recommendation {
  title: string;
  reason: string;
  mood: string;
  tmdb_search: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Recommendation[];
}

export function WatchAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        body: JSON.stringify({ query: text, history }),
      });

      const data = await response.json();
      
      const assistantMsg: Message = { 
        role: 'assistant', 
        content: data.text || "I've found something special for you.",
        recommendations: data.data?.recommendations
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "My cinematic senses are a bit clouded. Let's try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-100">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 -right-2 md:right-0 w-[calc(100vw-32px)] md:w-[400px] max-h-[600px] h-[70vh] md:h-[80vh] bg-[--flx-bg]/95 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-linear-to-b from-white/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] flex items-center justify-center shadow-lg shadow-[--flx-purple]/20">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Watch Advisor</h3>
                  <p className="text-[10px] text-[--flx-cyan] font-bold uppercase tracking-tighter">Powered by Flixora AI</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.length === 0 && (
                <div className="space-y-6 animate-fade-up">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-[13px] text-white/70 leading-relaxed">
                      &quot;Tell me what you&apos;re in the mood for. Dark noir? A mind-bending thriller? Or maybe something to heal the soul?&quot;
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Classic Noir', 'Space Odyssey', 'Coming of Age', 'Visual Poetry'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleSend(`Recommend me some ${tag} movies.`)}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[--flx-cyan] transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex flex-col gap-3",
                  m.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-5 py-4 rounded-2xl text-[13px] leading-relaxed max-w-[85%]",
                    m.role === 'user' 
                      ? "bg-[--flx-purple] text-white rounded-tr-none shadow-lg shadow-[--flx-purple]/20" 
                      : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
                  )}>
                    {m.content}
                  </div>

                  {m.recommendations && (
                    <div className="w-full space-y-3 mt-2">
                      {m.recommendations.map((rec, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[--flx-cyan]/30 transition-all group cursor-pointer"
                          onClick={() => window.location.href = `/search?q=${encodeURIComponent(rec.tmdb_search || rec.title)}`}
                        >
                          <div className="p-4 flex gap-4">
                            <div className="w-16 h-24 bg-white/5 rounded-lg shrink-0 flex items-center justify-center border border-white/5">
                              <Film className="text-white/10" size={24} />
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-[12px] font-black text-white uppercase truncate">{rec.title}</h4>
                                <span className="text-[8px] font-black px-1.5 py-0.5 bg-[--flx-cyan]/20 text-[--flx-cyan] rounded uppercase">{rec.mood}</span>
                              </div>
                              <p className="mt-2 text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                                {rec.reason}
                              </p>
                              <div className="mt-3 flex items-center gap-1 text-[9px] font-black text-[--flx-cyan] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                View Details <ArrowRight size={10} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 text-white/40">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-200" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest italic animate-pulse">Scanning the archives...</span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 bg-white/2">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative"
              >
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for a recommendation..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-14 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[--flx-purple]/50 transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[--flx-purple] text-white flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none hover:scale-105 transition-all shadow-lg shadow-[--flx-purple]/20"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-2xl transition-all relative overflow-hidden group",
          isOpen 
            ? "bg-white text-black" 
            : "bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] text-white"
        )}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        
        {!isOpen && (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-white rounded-full"
          />
        )}
      </motion.button>
    </div>
  );
}
