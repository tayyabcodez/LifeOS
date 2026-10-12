'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useLifeStore } from '@/store/lifeStore';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { DimensionId } from '@/data/demo-data';

import './onboarding.css';
import { OrbitPreview } from './components/OrbitPreview';
import { StepOne } from './components/StepOne';
import { StepTwo, CHALLENGE_OPTIONS, ChallengeOption } from './components/StepTwo';
import { StepThree } from './components/StepThree';

export default function OnboardingPage() {
  const router = useRouter();
  const setProfileField = useLifeStore((state) => state.setProfileField);
  const storeSettings = useLifeStore((state) => state.settings);
  const systemReducedMotion = useReducedMotion();

  const isReducedMotion =
    storeSettings.reducedMotion === 'on' ||
    (storeSettings.reducedMotion === 'auto' && systemReducedMotion);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // User selections
  const [selectedDimensions, setSelectedDimensions] = useState<DimensionId[]>(['study', 'sleep']);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [challengeTargetDim, setChallengeTargetDim] = useState<DimensionId | null>(null);
  const [pulseTrigger, setPulseTrigger] = useState(0);

  // Announce step change to screen readers
  const [announcement, setAnnouncement] = useState('Step 1 of 3: What matters most right now?');

  const updateStep = useCallback(
    (newStep: number, dir: number) => {
      setDirection(dir);
      setStep(newStep);
      if (newStep === 1) {
        setAnnouncement('Step 1 of 3: What matters most right now?');
      } else if (newStep === 2) {
        setAnnouncement("Step 2 of 3: What's your biggest challenge?");
      } else if (newStep === 3) {
        setAnnouncement('Step 3 of 3: Your view is ready.');
      }
    },
    []
  );

  const toggleDimension = useCallback((id: DimensionId) => {
    setSelectedDimensions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((d) => d !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const handleChallengeSelect = useCallback((opt: ChallengeOption) => {
    setSelectedChallenge(opt.title);
    setChallengeTargetDim(opt.targetDimension);
    setPulseTrigger((prev) => prev + 1);
  }, []);

  const handleFinish = useCallback(() => {
    setProfileField('selectedDimensions', selectedDimensions);
    setProfileField('onboardingChallenge', selectedChallenge);
    setProfileField('onboardingCompleted', true);

    if (selectedDimensions.length > 0) {
      const first = selectedDimensions[0];
      if (first === 'study' || first === 'health' || first === 'money') {
        setProfileField('priority', first);
      }
    }
    if (selectedChallenge) {
      setProfileField('challenge', selectedChallenge);
    }

    router.push('/app');
  }, [selectedDimensions, selectedChallenge, setProfileField, router]);

  const handleSkip = useCallback(() => {
    setProfileField('onboardingCompleted', true);
    router.push('/app');
  }, [setProfileField, router]);

  // Global Keyboard listener: 1-6, Enter, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
        return;
      }

      if (e.key === 'Enter') {
        if (step === 1 && selectedDimensions.length > 0) {
          e.preventDefault();
          updateStep(2, 1);
        } else if (step === 2 && selectedChallenge) {
          e.preventDefault();
          updateStep(3, 1);
        } else if (step === 3) {
          e.preventDefault();
          handleFinish();
        }
        return;
      }

      // Keys 1 to 6
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= 6) {
        if (step === 1) {
          const dimOrder: DimensionId[] = ['goals', 'study', 'focus', 'health', 'sleep', 'money'];
          const target = dimOrder[num - 1];
          if (target) {
            toggleDimension(target);
          }
        } else if (step === 2 && num <= 5) {
          const challenge = CHALLENGE_OPTIONS[num - 1];
          if (challenge) {
            handleChallengeSelect(challenge);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, selectedDimensions, selectedChallenge, updateStep, toggleDimension, handleChallengeSelect, handleFinish, handleSkip]);

  // Mouse spotlight tracking matching hero
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--sx', `${x}%`);
    e.currentTarget.style.setProperty('--sy', `${y}%`);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: isReducedMotion ? 0 : dir > 0 ? 28 : -28,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: isReducedMotion ? 0 : dir > 0 ? -28 : 28,
      opacity: 0,
    }),
  };

  return (
    <main
      id="ob-root"
      className="ob"
      onMouseMove={handleMouseMove}
      aria-labelledby="ob-title"
    >
      {/* Screen Reader Step Announcer */}
      <div id="ob-announcer" className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Hero-matched Pastel Mesh Background Blobs */}
      <div className="ob-mesh" id="ob-mesh" aria-hidden="true">
        <i style={{ left: '48%', top: '-6%', background: 'var(--study)' }} />
        <i style={{ left: '70%', top: '30%', background: 'var(--goals)' }} />
        <i style={{ left: '56%', top: '58%', background: 'var(--sleep)' }} />
        <i style={{ left: '-6%', top: '56%', background: 'var(--health)' }} />
        <i style={{ left: '18%', top: '-14%', background: 'var(--focus)' }} />
        <i style={{ left: '30%', top: '40%', background: 'var(--money)' }} />
      </div>

      {/* Spotlight overlay */}
      <div className="ob-spot" id="ob-spot" aria-hidden="true" />

      {/* Top Header Bar */}
      <header className="ob-header" id="ob-header">
        <Link href="/" className="ob-mark" id="ob-mark">
          LIFEOS
        </Link>
        <button
          type="button"
          onClick={handleSkip}
          className="ob-skip-top"
          id="ob-skip-top"
          aria-label="Skip onboarding and open app"
        >
          Skip (Esc)
        </button>
      </header>

      {/* Main 2-column Content Area */}
      <div className="ob-content" id="ob-content">
        {/* Left Column: Flow & Questions */}
        <section className="ob-left-col" id="ob-left-col" aria-label="Onboarding questions">
          {/* Step Pill with 3-segment progress indicator */}
          <div className="ob-step-pill" id="ob-step-pill">
            <span>Step {step} of 3</span>
            <div className="ob-progress-segments" id="ob-progress-bar" aria-hidden="true">
              <span className={`ob-segment ${step >= 1 ? 'active' : ''}`} />
              <span className={`ob-segment ${step >= 2 ? 'active' : ''}`} />
              <span className={`ob-segment ${step >= 3 ? 'active' : ''}`} />
            </div>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: isReducedMotion ? 0.05 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex flex-col"
              >
                <h1 className="ob-h1" id="ob-title">
                  What matters most <em>right now?</em>
                </h1>
                <p className="ob-subtitle" id="ob-subtitle">
                  Select up to 3 dimensions to prioritize. Your life dial responds in real-time.
                </p>

                <StepOne
                  selected={selectedDimensions}
                  onToggle={toggleDimension}
                  reducedMotion={isReducedMotion}
                />

                <div className="ob-actions" id="ob-actions">
                  <button
                    type="button"
                    id="ob-btn-continue"
                    disabled={selectedDimensions.length === 0}
                    onClick={() => updateStep(2, 1)}
                    className="ob-btn-primary"
                  >
                    <span>Continue</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: isReducedMotion ? 0.05 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex flex-col"
              >
                <h1 className="ob-h1" id="ob-title">
                  What&apos;s your biggest <em>challenge?</em>
                </h1>
                <p className="ob-subtitle" id="ob-subtitle">
                  We&apos;ll configure your default daily rhythm and focal actions around this.
                </p>

                <StepTwo
                  selectedChallenge={selectedChallenge}
                  onSelect={handleChallengeSelect}
                  reducedMotion={isReducedMotion}
                />

                <div className="ob-actions" id="ob-actions">
                  <button
                    type="button"
                    id="ob-btn-continue"
                    disabled={!selectedChallenge}
                    onClick={() => updateStep(3, 1)}
                    className="ob-btn-primary"
                  >
                    <span>Continue</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    id="ob-btn-back"
                    onClick={() => updateStep(1, -1)}
                    className="ob-btn-secondary"
                  >
                    ← Back
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: isReducedMotion ? 0.05 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex flex-col"
              >
                <h1 className="ob-h1 ob-h1-step3" id="ob-title">
                  Your view is <em>ready.</em>
                </h1>
                <p className="ob-subtitle" id="ob-subtitle">
                  All six dimensions are calibrated and mapped to your weekly targets.
                </p>

                <StepThree
                  onComplete={handleFinish}
                  onSkipDemo={handleSkip}
                  reducedMotion={isReducedMotion}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Column: Live Orbit Preview */}
        <section
          className="ob-right-col"
          id="ob-right-col"
          aria-label="Live orbit preview"
        >
          <OrbitPreview
            step={step}
            selectedDimensions={selectedDimensions}
            challengeTarget={challengeTargetDim}
            pulseTrigger={pulseTrigger}
            reducedMotion={isReducedMotion}
          />
        </section>
      </div>
    </main>
  );
}
