'use client';

import React from 'react';
import { motion } from 'motion/react';
import { demoDimensions, DimensionId } from '@/data/demo-data';

interface StepThreeProps {
  onComplete: () => void;
  onSkipDemo: () => void;
  reducedMotion?: boolean;
}

export function StepThree({ onComplete, onSkipDemo, reducedMotion = false }: StepThreeProps) {
  // Find lowest area dynamically from demoDimensions
  const dimensionEntries = Object.entries(demoDimensions) as [DimensionId, typeof demoDimensions[DimensionId]][];
  const lowest = dimensionEntries.reduce((min, curr) =>
    curr[1].score < min[1].score ? curr : min
  , dimensionEntries[0]);

  const lowestName = lowest[0].charAt(0).toUpperCase() + lowest[0].slice(1);
  const lowestScore = lowest[1].score;
  const recommendedAction = "Be in bed by 11:00 pm";

  return (
    <div className="w-full" id="ob-step3-container">
      {/* Glass Summary Card */}
      <motion.div
        id="ob-summary-card"
        className="ob-summary-card"
        initial={!reducedMotion ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0.1 } : { duration: 0.4, delay: 0.15 }}
      >
        <div className="ob-summary-row">
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--ink2)]">
            Balance Assessment
          </span>
          <span id="ob-summary-badge" className="ob-summary-badge">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--sleepd)' }}
              aria-hidden="true"
            />
            {lowestName} · {lowestScore}
          </span>
        </div>

        <p id="ob-summary-action" className="ob-summary-action">
          Based on your answers: <b>{lowestName} is your lowest area.</b>
          <br />
          Start with: <b>{recommendedAction}</b>
        </p>
      </motion.div>

      {/* Buttons: Primary "Open my LIFEOS", Secondary "Skip setup, open the demo" */}
      <div className="ob-actions">
        <button
          type="button"
          id="ob-btn-continue"
          onClick={onComplete}
          className="ob-btn-primary"
        >
          <span>Open my LIFEOS</span>
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
          id="ob-btn-skip-demo"
          onClick={onSkipDemo}
          className="ob-btn-secondary"
        >
          Skip setup, open the demo
        </button>
      </div>
    </div>
  );
}
