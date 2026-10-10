'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { DeltaTag } from '@/components/ui/DeltaTag';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { BookOpen, Moon, DollarSign, Dumbbell, Calendar, Target, Check, Heart, Briefcase, Scale, ArrowDown } from 'lucide-react';

const NODES = [
  { id: 'study', label: 'Study', icon: BookOpen, color: 'var(--color-study-fill)', angle: 0 },
  { id: 'focus', label: 'Focus', icon: Target, color: 'var(--color-focus-fill)', angle: 60 },
  { id: 'health', label: 'Health', icon: Dumbbell, color: 'var(--color-health-fill)', angle: 120 },
  { id: 'sleep', label: 'Sleep', icon: Moon, color: 'var(--color-sleep-fill)', angle: 180 },
  { id: 'money', label: 'Money', icon: DollarSign, color: 'var(--color-money-fill)', angle: 240 },
  { id: 'goals', label: 'Goals', icon: Calendar, color: 'var(--color-goals-fill)', angle: 300 },
];

export default function ScrollStoryPage() {
  const prefersReduced = useReducedMotion();
  const { scrollY } = useScroll();

  // Topbar opacity
  const topbarOpacity = useTransform(scrollY, [0, 500, 600], [0, 0, 1]);

  return (
    <main className="relative min-h-screen bg-paper text-ink overflow-x-hidden">
      {/* Sticky Top Bar */}
      <motion.header 
        style={{ opacity: prefersReduced ? 1 : topbarOpacity }}
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-paper/90 backdrop-blur-sm border-b border-line"
      >
        <span className="font-heading font-semibold text-sm tracking-[0.18em] uppercase text-ink">LIFEOS</span>
        <Link href="/onboarding" tabIndex={-1}>
          <Button variant="primary" className="py-1.5 px-4 text-xs h-8">Enter LIFEOS</Button>
        </Link>
      </motion.header>

      <HeroSection prefersReduced={prefersReduced} />
      <ScatteredSection prefersReduced={prefersReduced} />
      <OneViewAndConnectedSection prefersReduced={prefersReduced} />
      <WhatIfSection prefersReduced={prefersReduced} />
      <EveryoneSection prefersReduced={prefersReduced} />
      <FinalCTASection />
    </main>
  );
}

// 0. HERO
function HeroSection({ prefersReduced }: { prefersReduced: boolean }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersReduced) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReduced]);

  const orbitVars = prefersReduced ? {} : {
    animate: { x: -mousePos.x, y: -mousePos.y }
  };

  return (
    <section className="relative w-full h-[100vh] flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
        <span className="font-heading font-semibold text-sm tracking-[0.18em] uppercase text-ink">LIFEOS</span>
      </div>

      {/* Background Orbit */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-40 mix-blend-multiply">
        <motion.div 
          className="relative w-[600px] h-[600px] sm:w-[800px] sm:h-[800px]"
          animate={orbitVars.animate}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        >
          <motion.svg viewBox="0 0 800 800" className="w-full h-full"
            animate={prefersReduced ? {} : { rotate: 360 }}
            transition={{ rotate: { duration: 120, repeat: Infinity, ease: 'linear' } }}
          >
            {[160, 240, 320].map((radius, i) => (
              <motion.circle key={radius} cx="400" cy="400" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="1"
                initial={prefersReduced ? {} : { pathLength: 0 }}
                animate={prefersReduced ? {} : { pathLength: 1 }}
                transition={{ duration: 1.2, delay: i * 0.2 }}
              />
            ))}
            <circle cx="400" cy="400" r="16" fill="var(--color-ink)" />
            {NODES.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              return (
                <g key={node.id}>
                  <line x1="400" y1="400" x2={400 + 240 * Math.cos(rad)} y2={400 + 240 * Math.sin(rad)} stroke="var(--color-line)" strokeWidth="1" />
                  <circle cx={400 + 240 * Math.cos(rad)} cy={400 + 240 * Math.sin(rad)} r="20" fill={node.color} />
                </g>
              );
            })}
          </motion.svg>
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-paper)_70%)]" />
      </div>

      <motion.div 
        className="relative z-10 max-w-[600px] w-full text-center flex flex-col items-center"
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
        animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="font-display text-[40px] sm:text-[68px] leading-[1.1] mb-6 text-ink">
          Your life,<br />in one clear view.
        </h1>
        <p className="font-body text-ink-2 text-base sm:text-lg max-w-[48ch] mb-10">
          See how your study, sleep, health and money connect — then test a decision before you make it.
        </p>
        <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
          <Link href="/onboarding" tabIndex={-1} className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto h-12 px-8 text-base">Enter LIFEOS</Button>
          </Link>
          <Link href="/app" className="text-sm font-heading font-medium text-ink-2 hover:text-ink underline underline-offset-4 decoration-line">
            Skip setup, go straight to the demo
          </Link>
        </div>
      </motion.div>

      <motion.div 
        className="absolute bottom-12 flex flex-col items-center text-ink-2 opacity-50"
        animate={prefersReduced ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-xs font-heading font-medium tracking-widest uppercase mb-2">Scroll</span>
        <ArrowDown size={16} />
      </motion.div>
    </section>
  );
}

// 1. SCATTERED
function ScatteredSection({ prefersReduced }: { prefersReduced: boolean }) {
  const cards = [
    { title: 'Study notes', color: 'var(--color-study-fill)', pos: 'top-10 left-10 sm:left-20 rotate-[-6deg]' },
    { title: 'Sleep tracker', color: 'var(--color-sleep-fill)', pos: 'bottom-20 left-4 sm:left-12 rotate-[4deg]' },
    { title: 'Bank balance', color: 'var(--color-money-fill)', pos: 'top-32 right-10 sm:right-24 rotate-[8deg]' },
    { title: 'Gym log', color: 'var(--color-health-fill)', pos: 'bottom-32 right-8 sm:right-16 rotate-[-4deg]' },
    { title: 'Calendar', color: 'var(--color-goals-fill)', pos: 'top-1/2 left-4 sm:left-1/4 rotate-[-2deg]' },
    { title: 'Goals notebook', color: 'var(--color-focus-fill)', pos: 'top-20 right-1/4 rotate-[5deg]' },
  ];

  return (
    <section className="relative w-full h-[100vh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
      <motion.h2 
        className="font-display text-4xl sm:text-5xl text-ink z-10"
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.7 }}
      >
        Your life is scattered.
      </motion.h2>
      
      <div className="absolute inset-0 max-w-6xl mx-auto pointer-events-none">
        {cards.map((c, i) => (
          <motion.div 
            key={i}
            className={`absolute ${c.pos} p-4 sm:p-6 bg-surface border border-line rounded-2xl shadow-sm flex items-center justify-center w-32 sm:w-48 text-center`}
            style={{ backgroundColor: c.color }}
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
            whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, type: 'spring' }}
          >
            <span className="font-heading text-sm font-medium text-ink/80">{c.title}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// 2 & 3. ONE VIEW & CONNECTED
function OneViewAndConnectedSection({ prefersReduced }: { prefersReduced: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  // Phase 1 (0 to 0.4): Scattered -> Orbit
  // Phase 2 (0.4 to 1.0): Connected Beats
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1, 0.3, 0.4], [0, 1, 1, 0]);
  const orbitScale = useTransform(scrollYProgress, [0.1, 0.3], [0.8, 1]);
  const orbitOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  
  const beat1Opacity = useTransform(scrollYProgress, [0.4, 0.5, 0.6, 0.7], [0, 1, 1, 0]);
  const beat2Opacity = useTransform(scrollYProgress, [0.6, 0.7, 0.8, 0.9], [0, 1, 1, 0]);
  const beat3Opacity = useTransform(scrollYProgress, [0.8, 0.9, 1, 1], [0, 1, 1, 1]);

  const activeBeat = useTransform(scrollYProgress, (p) => {
    if (p < 0.4) return 0;
    if (p < 0.65) return 1;
    if (p < 0.85) return 2;
    return 3;
  });

  const lineOpAll = useTransform(activeBeat, (b) => b === 0 ? 1 : 0.2);
  const lineOpHighlight1 = useTransform(activeBeat, (b) => b === 0 || b === 1 ? 1 : 0.2);
  const lineOpHighlight2 = useTransform(activeBeat, (b) => b === 0 || b === 2 ? 1 : 0.2);
  const lineOpHighlight3 = useTransform(activeBeat, (b) => b === 0 || b === 3 ? 1 : 0.2);

  return (
    <section ref={containerRef} className="relative w-full h-[600vh]">
      <div className="sticky top-0 w-full h-[100vh] flex flex-col items-center justify-center overflow-hidden">
        
        {/* Orbit Background */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: prefersReduced ? 1 : orbitOpacity, scale: prefersReduced ? 1 : orbitScale }}
        >
          <svg viewBox="0 0 800 800" className="w-[600px] h-[600px] sm:w-[800px] sm:h-[800px]">
            {[160, 240, 320].map((radius) => (
              <circle key={radius} cx="400" cy="400" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="1" />
            ))}
            <circle cx="400" cy="400" r="16" fill="var(--color-ink)" />
            {NODES.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              const isHighlight1 = node.id === 'sleep' || node.id === 'focus';
              const isHighlight2 = node.id === 'focus' || node.id === 'study';
              const isHighlight3 = true; // All feed goals
              
              let lineOp = lineOpAll;
              if (isHighlight1 && !isHighlight2) lineOp = lineOpHighlight1;
              else if (isHighlight2 && !isHighlight1) lineOp = lineOpHighlight2;
              else if (isHighlight3) lineOp = lineOpHighlight3; // Simplified for demo logic

              return (
                <g key={node.id}>
                  <motion.line x1="400" y1="400" x2={400 + 240 * Math.cos(rad)} y2={400 + 240 * Math.sin(rad)} stroke="var(--color-ink)" strokeWidth="2" style={{ opacity: lineOp }} />
                  <motion.circle cx={400 + 240 * Math.cos(rad)} cy={400 + 240 * Math.sin(rad)} r="20" fill={node.color} style={{ opacity: lineOp }} />
                  <motion.circle cx={400 + 240 * Math.cos(rad)} cy={400 + 240 * Math.sin(rad)} r="24" fill="none" stroke="var(--color-ink)" strokeWidth="2" style={{ opacity: lineOp }} />
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* Captions */}
        <motion.h2 className="absolute top-1/4 sm:top-1/3 font-display text-4xl sm:text-5xl text-center z-10 px-4" style={{ opacity: prefersReduced ? 0 : titleOpacity }}>
          LIFEOS brings it into one view.
        </motion.h2>

        <motion.h2 className="absolute top-1/4 sm:top-1/3 font-display text-4xl sm:text-5xl text-center z-10 px-4" style={{ opacity: prefersReduced ? 1 : beat1Opacity }}>
          Sleep shapes your focus.
        </motion.h2>

        <motion.h2 className="absolute top-1/4 sm:top-1/3 font-display text-4xl sm:text-5xl text-center z-10 px-4" style={{ opacity: prefersReduced ? 0 : beat2Opacity }}>
          Focus shapes your study.
        </motion.h2>

        <motion.h2 className="absolute top-1/4 sm:top-1/3 font-display text-4xl sm:text-5xl text-center z-10 px-4" style={{ opacity: prefersReduced ? 0 : beat3Opacity }}>
          Everything feeds your goals.
        </motion.h2>

      </div>
    </section>
  );
}

// 4. WHAT IF
function WhatIfSection({ prefersReduced }: { prefersReduced: boolean }) {
  const [typed, setTyped] = useState("");
  const [showResults, setShowResults] = useState(false);
  const textToType = "I sleep 1 hour earlier";

  const handleInView = () => {
    if (prefersReduced) {
      setTyped(textToType);
      setShowResults(true);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      setTyped(textToType.substring(0, i + 1));
      i++;
      if (i === textToType.length) {
        clearInterval(interval);
        setTimeout(() => setShowResults(true), 500);
      }
    }, 50);
  };

  return (
    <section className="relative w-full py-32 px-4 sm:px-6 flex items-center justify-center">
      <motion.div 
        className="w-full max-w-5xl rounded-[40px] bg-paper text-ink p-8 sm:p-16 min-h-[60vh] flex flex-col items-center justify-center shadow-lg border border-line"
        data-theme="night"
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        onViewportEnter={handleInView}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="font-display text-5xl sm:text-7xl mb-4 text-ink">What if…</h2>
        <div className="h-12 flex items-center mb-16">
          <p className="font-heading text-xl sm:text-3xl text-ink border-b-2 border-ink-2/30 pb-2 inline-block">
            {typed}
            {!showResults && <span className="animate-pulse ml-1">|</span>}
          </p>
        </div>

        {showResults && (
          <motion.div 
            className="flex flex-wrap gap-4 justify-center max-w-2xl"
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.2 }}
          >
            {[
              { label: 'Sleep', delta: 14, unit: 'pts', tradeOff: false },
              { label: 'Focus', delta: 9, unit: 'pts', tradeOff: false },
              { label: 'Energy', delta: 11, unit: '%', tradeOff: false },
              { label: 'Stress', delta: -8, unit: '%', tradeOff: true },
            ].map((stat) => (
              <motion.div 
                key={stat.label}
                className="bg-surface border border-line rounded-2xl p-4 sm:p-6 w-36 sm:w-48 text-center"
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
                animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              >
                <div className="font-heading font-medium text-sm text-ink-2 mb-2 uppercase tracking-wider">{stat.label}</div>
                <div className="text-2xl sm:text-3xl"><DeltaTag delta={stat.delta} unit={stat.unit as '%' | 'pts' | 'days' | ''} isTradeOff={stat.tradeOff} /></div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {showResults && (
          <motion.p 
            className="mt-16 text-sm font-body text-ink-2"
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Estimates based on demo data.
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}

// 5. MADE FOR EVERYONE
function EveryoneSection({ prefersReduced }: { prefersReduced: boolean }) {
  const features = [
    { title: 'Keyboard friendly', desc: 'Navigate everywhere without a mouse. Full focus-ring support.', icon: Calendar },
    { title: 'Reduced motion', desc: 'Respects your OS settings. Skips animations for a calmer experience.', icon: dumbIcon },
    { title: 'List view built in', desc: 'Swap the visual orbit for a structured list anytime. Screen-reader ready.', icon: dumbIcon }
  ];
  
  function dumbIcon(props: React.ComponentProps<typeof Check>) { return <Check {...props} />; }

  return (
    <section className="relative w-full py-32 px-4 sm:px-6 bg-surface-2 flex flex-col items-center">
      <motion.div
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-5xl"
      >
        <h2 className="font-display text-4xl sm:text-5xl text-center mb-16">Made for everyone.</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-surface border border-line p-8 rounded-3xl text-center flex flex-col items-center"
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
              whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 bg-surface-2 rounded-full flex items-center justify-center text-ink mb-6">
                <Check size={24} />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
              <p className="font-body text-ink-2 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// 6. FINAL CTA
function FinalCTASection() {
  return (
    <section className="w-full py-32 px-4 sm:px-6 flex flex-col items-center justify-center text-center">
      <h2 className="font-display text-5xl sm:text-7xl mb-12 max-w-3xl">
        Understand. Simulate.<br/>Decide. Act.
      </h2>
      <Link href="/onboarding">
        <Button variant="primary" className="h-14 px-10 text-lg rounded-full">Enter LIFEOS</Button>
      </Link>
      
      <footer className="mt-32 pt-8 border-t border-line w-full max-w-5xl flex justify-center text-sm font-body text-ink-2">
        <p>Built for the hackathon. Demo data only.</p>
      </footer>
    </section>
  );
}
