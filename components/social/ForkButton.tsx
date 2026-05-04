'use client';

import { Copy } from 'lucide-react';
import { forkList } from '@/lib/supabase/actions/lists';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ForkButtonProps {
  listId: string;
}

export function ForkButton({ listId }: ForkButtonProps) {
  const [isForking, setIsForking] = useState(false);
  const router = useRouter();

  const handleFork = async () => {
    if (isForking) return;
    setIsForking(true);

    try {
      const newList = await forkList(listId);
      alert('List forked successfully! Redirecting to your new collection...');
      router.push(`/list/${newList.id}`);
    } catch (error) {
      console.error('Failed to fork list:', error);
      alert('Failed to fork list. Please try again.');
    } finally {
      setIsForking(false);
    }
  };

  return (
    <button 
      onClick={handleFork}
      disabled={isForking}
      className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-[--flx-cyan] hover:bg-white/10 transition-all disabled:opacity-50"
    >
      <Copy size={20} className={isForking ? 'animate-pulse' : ''} />
    </button>
  );
}
