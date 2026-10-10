import React from 'react';
import { Check } from 'lucide-react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  colorFillVar?: string; // e.g. "var(--study-fill)"
  children: React.ReactNode;
}

export function Chip({ selected, colorFillVar, className = '', children, ...props }: ChipProps) {
  const style = selected && colorFillVar ? { backgroundColor: colorFillVar } : {};
  
  return (
    <button
      className={`relative rounded-full px-4 py-2 font-heading font-medium text-sm transition-all duration-150 border inline-flex items-center gap-2
        ${selected 
          ? 'border-ink text-ink shadow-[0_2px_10px_rgba(21,23,28,0.08)]' 
          : 'border-line bg-surface text-ink-2 hover:bg-surface-2 hover:-translate-y-[2px] hover:text-ink'
        } ${className}`}
      style={style}
      {...props}
    >
      {selected && <Check size={16} strokeWidth={3} />}
      {children}
    </button>
  );
}
