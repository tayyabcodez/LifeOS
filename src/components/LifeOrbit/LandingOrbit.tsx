'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

export function LandingOrbit() {
  const prefersReduced = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReduced) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 16; // max 8px shift
      const y = (e.clientY / innerHeight - 0.5) * 16;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReduced]);

  const nodes = [
    { color: 'var(--color-study-fill)', angle: 0 },
    { color: 'var(--color-focus-fill)', angle: 60 },
    { color: 'var(--color-health-fill)', angle: 120 },
    { color: 'var(--color-sleep-fill)', angle: 180 },
    { color: 'var(--color-money-fill)', angle: 240 },
    { color: 'var(--color-goals-fill)', angle: 300 },
  ];

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-40 mix-blend-multiply night:mix-blend-screen"
    >
      <motion.div 
        className="relative w-[600px] h-[600px] sm:w-[800px] sm:h-[800px]"
        animate={prefersReduced ? {} : { 
          x: -mousePos.x, 
          y: -mousePos.y,
          rotate: 360 
        }}
        transition={{ 
          rotate: { duration: 120, repeat: Infinity, ease: 'linear' },
          x: { type: 'spring', stiffness: 50, damping: 20 },
          y: { type: 'spring', stiffness: 50, damping: 20 }
        }}
      >
        <svg viewBox="0 0 800 800" className="w-full h-full">
          {/* Rings */}
          {[160, 240, 320].map((radius, i) => (
            <motion.circle
              key={radius}
              cx="400"
              cy="400"
              r={radius}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth="1"
              initial={prefersReduced ? { opacity: 1 } : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: i * 0.2, ease: "easeOut" }}
            />
          ))}
          
          {/* Nodes */}
          {nodes.map((node, i) => {
            const radius = 240; // Mid ring
            const rad = (node.angle * Math.PI) / 180;
            const x = 400 + radius * Math.cos(rad);
            const y = 400 + radius * Math.sin(rad);
            
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="12"
                fill={node.color}
                initial={prefersReduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 + i * 0.08, type: 'spring' }}
              />
            );
          })}
        </svg>
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-paper)_70%)]" />
    </div>
  );
}
