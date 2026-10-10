'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { 
  BookOpen, Heart, DollarSign, Briefcase, Scale,
  Check
} from 'lucide-react';
import { useLifeStore } from '@/store/lifeStore';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { Button } from '@/components/ui/Button';

const priorities = [
  { id: 'study', label: 'Study', icon: BookOpen },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'money', label: 'Money', icon: DollarSign },
  { id: 'career', label: 'Career', icon: Briefcase },
  { id: 'balance', label: 'Balance', icon: Scale },
] as const;

const challenges = [
  "I can't stay consistent",
  "I'm always short on time",
  "I don't sleep enough",
  "I can't see the big picture",
  "I overspend"
];

export default function OnboardingPage() {
  const router = useRouter();
  const setProfileField = useLifeStore((state) => state.setProfileField);
  const prefersReduced = useReducedMotion();
  
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  
  const handlePrioritySelect = (id: string) => {
    setProfileField('priority', id as any);
    setDirection(1);
    setStep(2);
  };
  
  const handleChallengeSelect = (challenge: string) => {
    setProfileField('challenge', challenge);
    setDirection(1);
    setStep(3);
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const variants = {
    enter: (dir: number) => ({
      x: prefersReduced ? 0 : dir > 0 ? 24 : -24,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: prefersReduced ? 0 : dir > 0 ? -24 : 24,
      opacity: 0
    })
  };

  const transition: any = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.25 }
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-12 pb-24 px-4 sm:px-6">
      {/* Shell / Header */}
      <div className="w-full max-w-[640px] mb-12 flex flex-col gap-6">
        <div className="flex justify-between items-center text-sm font-heading font-medium text-ink-2">
          {step > 1 && step < 3 ? (
            <button 
              onClick={handleBack}
              className="hover:text-ink transition-colors outline-none focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:ring-offset-2 rounded-sm"
              aria-label="Go back"
            >
              ← Back
            </button>
          ) : (
            <span className={step === 3 ? "opacity-0 pointer-events-none" : "w-10"} />
          )}
          
          <div className="flex flex-col items-center gap-2" aria-live="polite">
            <span className={step === 3 ? "sr-only" : ""}>Step {step} of 3</span>
            {step < 3 && (
              <div className="w-32 h-[2px] bg-line rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-ink"
                  initial={{ width: `${((step - 1) / 3) * 100}%` }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
          
          <Link 
            href="/app" 
            className={`hover:text-ink transition-colors outline-none focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:ring-offset-2 rounded-sm ${step === 3 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            Skip
          </Link>
        </div>
      </div>

      <div className="w-full max-w-[640px] relative">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.section
              key="step1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="flex flex-col items-center"
            >
              <h1 className="font-display text-[40px] sm:text-5xl text-ink mb-10 text-center">
                What matters most right now?
              </h1>
              
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
                role="radiogroup"
                aria-label="Priority"
              >
                {priorities.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      role="radio"
                      aria-checked={false}
                      onClick={() => handlePrioritySelect(p.id)}
                      className="flex items-center gap-4 p-5 bg-surface border border-line rounded-[20px] hover:-translate-y-1 hover:border-ink/20 transition-all text-left outline-none focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-ink-2">
                        <Icon size={20} />
                      </div>
                      <span className="font-heading font-medium text-lg text-ink">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section
              key="step2"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="flex flex-col items-center"
            >
              <h1 className="font-display text-[40px] sm:text-5xl text-ink mb-10 text-center">
                What's your biggest challenge?
              </h1>
              
              <div 
                className="flex flex-col gap-3 w-full max-w-[480px]"
                role="radiogroup"
                aria-label="Biggest challenge"
              >
                {challenges.map((c, i) => (
                  <button
                    key={i}
                    role="radio"
                    aria-checked={false}
                    onClick={() => handleChallengeSelect(c)}
                    className="flex items-center gap-4 px-6 py-4 bg-surface border border-line rounded-[20px] hover:-translate-y-1 hover:border-ink/20 transition-all text-left outline-none focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
                  >
                    <span className="font-body text-base text-ink">{c}</span>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {step === 3 && (
            <motion.section
              key="step3"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="flex flex-col items-center justify-center pt-12"
            >
              <Step3Building />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Step3Building() {
  const [phase, setPhase] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 1600);
    const t3 = setTimeout(() => setPhase(3), 2500); // Ready

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const messages = [
    "Reading your priorities",
    "Connecting your dimensions",
    "Preparing your day"
  ];

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Simple assembling orbit animation */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-line"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.div 
          className="absolute inset-2 rounded-full border border-line"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <motion.div 
          className="w-4 h-4 bg-ink rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.6 }}
        />
        
        {/* Nodes appearing */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div 
              className="absolute top-0 right-4 w-3 h-3 bg-study-fill rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            />
          )}
          {phase >= 2 && (
            <motion.div 
              className="absolute bottom-2 left-2 w-3 h-3 bg-health-fill rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="h-8 relative w-full max-w-[280px] text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {phase < 3 ? (
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-heading text-lg text-ink absolute inset-0"
            >
              {messages[phase]}…
            </motion.p>
          ) : (
            <motion.p
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading text-lg text-ink absolute inset-0"
            >
              Your view is ready.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="h-12 mt-6">
        <AnimatePresence>
          {phase === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button onClick={() => router.push('/app')} variant="primary" className="px-8 py-3 rounded-full text-base">
                Continue
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
