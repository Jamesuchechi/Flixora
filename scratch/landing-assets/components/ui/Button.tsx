import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary:   'bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white font-semibold',
  secondary: 'bg-white/7 hover:bg-white/12 border border-white/12 text-[--flx-text-1]',
  ghost:     'text-[--flx-text-2] hover:text-[--flx-text-1] hover:bg-white/5',
  icon:      'bg-white/7 hover:bg-white/12 border border-white/12 text-[--flx-text-2] hover:text-[--flx-text-1]',
};

const sizes = {
  sm:  'px-4 py-2 text-xs rounded-md gap-1.5',
  md:  'px-6 py-2.5 text-sm rounded-lg gap-2',
  lg:  'px-8 py-3 text-base rounded-lg gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--flx-purple]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : children}
    </button>
  )
);

Button.displayName = 'Button';
