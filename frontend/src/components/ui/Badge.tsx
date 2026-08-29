import React from 'react';
import { cn } from '../../lib/utils';
import { ThermalRiskLevel } from '../../types/navigation';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'thermal' | 'danger' | 'warning' | 'success';
  riskLevel?: ThermalRiskLevel;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  riskLevel,
  children,
  ...props
}) => {
  let riskStyles = '';
  if (riskLevel) {
    switch (riskLevel) {
      case 'LOW':
        riskStyles = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
        break;
      case 'MODERATE':
        riskStyles = 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
        break;
      case 'HIGH':
        riskStyles = 'bg-orange-500/15 text-orange-300 border-orange-500/30';
        break;
      case 'EXTREME':
        riskStyles = 'bg-red-500/15 text-red-300 border-red-500/30 animate-pulse';
        break;
      case 'CRITICAL':
        riskStyles = 'bg-rose-600/20 text-rose-300 border-rose-600/40 animate-pulse font-bold';
        break;
    }
  }

  const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none';

  const variants = {
    default: 'border-transparent bg-slate-800 text-slate-100',
    secondary: 'border-transparent bg-slate-800/80 text-slate-300',
    outline: 'text-slate-300 border-slate-700',
    thermal: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    danger: 'bg-red-500/15 text-red-300 border-red-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  };

  return (
    <div
      className={cn(
        baseStyles,
        riskLevel ? riskStyles : variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
