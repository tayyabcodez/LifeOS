'use client';

import React from 'react';
import { motion } from 'motion/react';
import { DimensionId } from '@/data/demo-data';

interface LowestAreaInfo {
  id: DimensionId;
  name: string;
  score: number;
  colorDVar: string;
}

interface StepThreeProps {
  lowestArea: LowestAreaInfo;
  onComplete: () => void;
  onSkipDemo: () => void;
  reducedMotion?: boolean;
}

const STARTER_ACTIONS: Record<DimensionId, { action: string; gain: string }> = {
  sleep: { action: 'Be in bed by 11:00 pm', gain: '+12 est.' },
  health: { action: 'Walk 30 minutes today', gain: '+12 est.' },
  money: { action: 'Skip one delivery order this week', gain: '+5 est.' },
  goals: { action: 'Review your goals on Sunday', gain: '+6 est.' },
  study: { action: 'Block 2 focused hours before noon', gain: '+8 est.' },
  focus: { action: 'Protect 9–11am for deep work', gain: '+6 est.' },
};

export function StepThree({
  lowestArea,
  onComplete,
  onSkipDemo,
  reducedMotion = false,
}: StepThreeProps) {
  const item = STARTER_ACTIONS[lowestArea.id] || STARTER_ACTIONS.sleep;

  return (
    <div className="w-full" id="ob-step3-container">
      {/* Glass Summary Card */}
      <motion.div
        id="ob-summary-card"
        className="ob-summary-card"
        initial={!reducedMotion ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0.05 } : { duration: 0.35, delay: 0.1 }}
      >
        <div className="ob-summary-row">
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--ink2)]">
            Balance Assessment
          </span>
          <span id="ob-summary-badge" className="ob-summary-badge">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: lowestArea.colorDVar }}
              aria-hidden="true"
            />
            {lowestArea.name} · {lowestArea.score}
          </span>
        </div>

        <p id="ob-summary-action" className="ob-summary-action">
          Start with <b>{lowestArea.name} ({lowestArea.score})</b>. Target 80.
          <br />
          Next move: <b>{item.action}</b>{' '}
          <span className="text-[var(--healthd)] font-semibold text-xs ml-1">
            ({item.gain})
          </span>
        </p>
      </motion.div>

      {/* Buttons */}
      <div className="ob-actions">
        <button
          type="button"
          id="ob-btn-continue"
          onClick={onComplete}
          className="ob-btn-primary"
        >
          <span>Open my LIFEOS</span>
          <svg
            width={18}
            height={18}
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
