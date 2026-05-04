import { useStore } from '@/store/useStore';
import type { ToastItem } from '@/store/useStore';

interface ToastOptions {
  message: string;
  type?: ToastItem['type'];
  duration?: number;
}

/**
 * useToast — a thin hook over the Zustand toast slice.
 * Call toast({ message, type?, duration? }) to show a toast.
 */
export function useToast() {
  const addToast = useStore((s) => s.addToast);

  const toast = ({ message, type = 'info', duration = 3000 }: ToastOptions) => {
    addToast(message, type, duration);
  };

  return { toast };
}
