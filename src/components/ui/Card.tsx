import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  children: React.ReactNode;
}

export function Card({ hoverable = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface border border-line rounded-[20px] shadow-[0_1px_0_rgba(21,23,28,0.04),0_10px_30px_rgba(21,23,28,0.06)] night:shadow-none
      ${hoverable ? 'transition-all duration-150 hover:-translate-y-[2px] hover:border-white/20' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
