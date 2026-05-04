'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Hash } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { sendPartyMessage } from '@/lib/supabase/actions/watch-parties';
import type { User } from '@supabase/supabase-js';

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string;
  };
}

interface PartyChatProps {
  partyId: string;
  currentUser: User;
}

export const PartyChat: React.FC<PartyChatProps> = ({ partyId, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('party_messages')
        .select('*, user:profiles(*)')
        .eq('party_id', partyId)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data as unknown as Message[]);
    };

    fetchMessages();

    // Real-time subscription
    const channel = supabase
      .channel(`party_chat:${partyId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'party_messages',
          filter: `party_id=eq.${partyId}`
        },
        async (payload) => {
          // Fetch the full message with user info
          const { data } = await supabase
            .from('party_messages')
            .select('*, user:profiles(*)')
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            setMessages(prev => [...prev, data as unknown as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partyId, supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendPartyMessage(partyId, inputValue.trim());
      setInputValue('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[--flx-surface-1] border-l border-[--flx-border]">
      {/* Header */}
      <div className="p-4 border-b border-[--flx-border] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-[--flx-purple]" />
          <h3 className="font-bold text-white">Party Chat</h3>
        </div>
        <div className="flex items-center gap-2 text-[--flx-text-3] text-xs">
          <Users className="w-4 h-4" />
          <span>Active Now</span>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.user_id === currentUser?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[--flx-surface-2]">
                  <Image
                    src={msg.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user.username}`}
                    alt={msg.user.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className={`flex flex-col ${isMe ? 'items-end' : ''} max-w-[80%]`}>
                  <span className="text-[10px] font-bold text-[--flx-text-3] mb-1">
                    {msg.user.username}
                  </span>
                  <div className={`px-4 py-2 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-[--flx-purple] text-white rounded-tr-none' 
                      : 'bg-[--flx-surface-2] text-white rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[--flx-border]">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="React to the scene..."
            className="w-full bg-[--flx-surface-2] text-white text-sm rounded-2xl py-3 pl-4 pr-12 border border-[--flx-border] focus:border-[--flx-purple] outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-[--flx-purple] hover:bg-[--flx-purple]/10 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
