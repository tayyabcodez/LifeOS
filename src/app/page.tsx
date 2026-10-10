'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { LandingOrbit } from '@/components/LifeOrbit/LandingOrbit';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

export default function LandingPage() {
  const prefersReduced = useReducedMotion();

  const containerVars: any = prefersReduced
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.2 } }
      }
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.12, delayChildren: 0.4 }
        }
      };

  const itemVars: any = prefersReduced
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.2 } }
      }
    : {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
      };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6">
      <LandingOrbit />

      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
        <span className="font-heading font-semibold text-sm tracking-[0.18em] uppercase text-ink">
          LIFEOS
        </span>
      </div>

      <motion.div 
        className="relative z-10 max-w-[600px] w-full text-center flex flex-col items-center"
        variants={containerVars}
        initial="hidden"
        animate="show"
      >
        <motion.h1 
          variants={itemVars}
          className="font-display text-[40px] leading-[1.1] tracking-[-0.01em] sm:text-[68px] mb-6 text-ink"
        >
          Your life,<br />in one clear view.
        </motion.h1>
        
        <motion.p 
          variants={itemVars}
          className="font-body text-ink-2 text-base sm:text-[18px] leading-relaxed max-w-[48ch] mb-10"
        >
          See how your study, sleep, health and money connect — then test a decision before you make it.
        </motion.p>
        
        <motion.div variants={itemVars} className="flex flex-col items-center gap-4 w-full sm:w-auto">
          <Link href="/onboarding" className="w-full sm:w-auto" tabIndex={-1}>
            <Button variant="primary" className="w-full sm:w-auto h-12 px-8 text-base shadow-[0_4px_14px_rgba(21,23,28,0.1)] hover:shadow-[0_6px_20px_rgba(21,23,28,0.15)]">
              Enter LIFEOS
            </Button>
          </Link>
          <Link 
            href="/app" 
            className="text-sm font-heading font-medium text-ink-2 hover:text-ink transition-colors underline underline-offset-4 decoration-line hover:decoration-ink-2 outline-none focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:ring-offset-2 rounded-sm"
          >
            Skip setup, go straight to the demo
          </Link>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-6 sm:bottom-8 z-10">
        <span className="font-body text-xs text-ink-2 opacity-70">
          Demo experience · No sign-up needed
        </span>
      </div>
    </main>
  );
}
