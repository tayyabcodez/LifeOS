import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  let variantClasses = '';
  
  if (variant === 'primary') {
    variantClasses = 'bg-ink text-paper hover:scale-[0.98] transition-transform active:scale-95 night:bg-paper night:text-ink';
  } else if (variant === 'secondary') {
    variantClasses = 'bg-surface border border-line hover:-translate-y-[2px] transition-transform active:scale-95';
  } else if (variant === 'ghost') {
    variantClasses = 'bg-transparent text-ink hover:bg-surface-2 transition-colors active:scale-95';
  }

  return (
    <button
      className={`px-4 py-2 rounded-xl font-heading font-medium tracking-tight text-sm inline-flex items-center justify-center gap-2 ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
