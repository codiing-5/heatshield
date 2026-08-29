import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'destructive' | 'outline' | 'ghost' | 'thermal';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
    
    const variants = {
      default: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/60 shadow-sm',
      primary: 'bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-red-700 border-none',
      destructive: 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30',
      outline: 'border border-slate-700 text-slate-300 hover:bg-slate-800/80 hover:text-white',
      ghost: 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
      thermal: 'bg-orange-500/15 text-orange-300 border border-orange-500/30 hover:bg-orange-500/25 shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
