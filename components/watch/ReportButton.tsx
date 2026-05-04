'use client';

import { useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { submitContentReport } from '@/lib/supabase/actions/reports';

interface ReportButtonProps {
  videoId: string;
  title: string;
  className?: string;
}

export function ReportButton({ videoId, title, className }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reason, setReason] = useState('');

  const REASONS = [
    'Video is unavailable',
    'Incorrect movie/title',
    'Poor quality / Out of sync',
    'Copyright / DMCA concern',
    'Other'
  ];


  const handleSubmit = async () => {
    if (!reason) return;
    setIsSubmitting(true);
    
    try {
      await submitContentReport({
        videoId,
        title,
        reason
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpen(false);
        setReason('');
      }, 2000);
    } catch (error) {
      console.error('Report failed:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
      >
        <AlertTriangle size={12} className="text-white/40 group-hover:text-red-400" />
        <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-wider">Report Issue</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-0 mb-4 w-64 bg-[#1a1429] border border-white/10 rounded-2xl shadow-2xl z-60 overflow-hidden"
            >
              <div className="p-4 border-b border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-[2px] text-white">Report Content</h4>
                <p className="text-[9px] text-white/40 mt-1 uppercase tracking-wider">{title}</p>
              </div>

              <div className="p-4 space-y-2">
                {isSuccess ? (
                  <div className="py-4 flex flex-col items-center justify-center gap-2 text-center">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check size={20} className="text-green-500" />
                    </div>
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Report Submitted</p>
                    <p className="text-[8px] text-white/40">Thank you for keeping Flixora clean.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      {REASONS.map((r) => (
                        <button
                          key={r}
                          onClick={() => setReason(r)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-[10px] font-medium transition-all border",
                            reason === r 
                              ? "bg-[--flx-cyan]/10 border-[--flx-cyan]/30 text-[--flx-cyan]" 
                              : "bg-white/5 border-transparent text-white/60 hover:text-white hover:bg-white/10"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={!reason || isSubmitting}
                      onClick={handleSubmit}
                      className="w-full mt-4 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[2px] rounded-xl hover:bg-[--flx-cyan] transition-all disabled:opacity-50 disabled:hover:bg-white"
                    >
                      {isSubmitting ? 'Sending...' : 'Submit Report'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
