'use client';

import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

export interface ProgressBarProps {
  value: number; // 0-100
  colorVar?: string; // e.g. "var(--study-fill)"
  className?: string;
}

export function ProgressBar({ value, colorVar = 'var(--ink)', className = '' }: ProgressBarProps) {
  const prefersReduced = useReducedMotion();
  const [currentValue, setCurrentValue] = useState(prefersReduced ? value : 0);

  useEffect(() => {
    // Animate on mount if not reduced motion
    const raf = requestAnimationFrame(() => {
      setCurrentValue(value);
    });
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className={`w-full bg-surface-2 rounded-full h-2 overflow-hidden ${className}`}>
      <div 
        className="h-full rounded-full origin-left"
        style={{
          backgroundColor: colorVar,
          width: `${currentValue}%`,
          transition: prefersReduced ? 'none' : 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      />
    </div>
  );
}
