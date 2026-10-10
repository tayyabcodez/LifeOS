'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

export interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export function AnimatedNumber({ value, className = '' }: AnimatedNumberProps) {
  const prefersReduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const spring = useSpring(prefersReduced ? value : 0, { 
    stiffness: 140, 
    damping: 20 
  });
  
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
    const timeout = setTimeout(() => setHasAnimated(true), 600); // Announcement after anim
    return () => clearTimeout(timeout);
  }, [value, spring]);

  if (prefersReduced) {
    return (
      <span className={`font-heading tabular-nums ${className}`} aria-live="polite">
        {value}
      </span>
    );
  }

  return (
    <span className="relative inline-flex items-center">
      {/* Invisible screen reader element for polite announcement */}
      <span className="sr-only" aria-live={hasAnimated ? "polite" : "off"}>{value}</span>
      <motion.span className={`font-heading tabular-nums ${className}`} aria-hidden="true">
        {display}
      </motion.span>
    </span>
  );
}
