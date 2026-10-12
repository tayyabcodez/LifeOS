'use client';

import React from 'react';
import { motion } from 'motion/react';
import { DimensionId } from '@/data/demo-data';

export interface ChallengeOption {
  id: string;
  elemId: string;
  title: string;
  helper: string;
  targetDimension: DimensionId;
  keyNum: number;
}

export const CHALLENGE_OPTIONS: ChallengeOption[] = [
  {
    id: 'sleep',
    elemId: 'ob-ch-sleep',
    title: "I don't sleep enough",
    helper: "We'll start with Sleep and Focus",
    targetDimension: 'sleep',
    keyNum: 1,
  },
  {
    id: 'time',
    elemId: 'ob-ch-time',
    title: "I'm always short on time",
    helper: "We'll start with Focus and Goals",
    targetDimension: 'focus',
    keyNum: 2,
  },
  {
    id: 'consistent',
    elemId: 'ob-ch-focus',
    title: "I can't stay consistent",
    helper: "We'll start with Study and Habits",
    targetDimension: 'study',
    keyNum: 3,
  },
  {
    id: 'overspend',
    elemId: 'ob-ch-money',
    title: 'I overspend',
    helper: "We'll start with Money and Planning",
    targetDimension: 'money',
    keyNum: 4,
  },
  {
    id: 'overwhelmed',
    elemId: 'ob-ch-balance',
    title: 'I feel overwhelmed',
    helper: "We'll balance all six areas",
    targetDimension: 'health',
    keyNum: 5,
  },
];

interface StepTwoProps {
  selectedChallenge: string | null;
  onSelect: (option: ChallengeOption) => void;
  reducedMotion?: boolean;
}

export function StepTwo({ selectedChallenge, onSelect, reducedMotion = false }: StepTwoProps) {
  return (
    <div
      className="w-full"
      id="ob-step2-radiogroup"
      role="radiogroup"
      aria-labelledby="ob-title"
    >
      <div className="flex items-center justify-between mb-3 text-xs text-[var(--ink2)] opacity-70">
        <span>Select one challenge</span>
        <span>Press 1–5 to select</span>
      </div>

      <div className="ob-step2-list">
        {CHALLENGE_OPTIONS.map((opt) => {
          const isSelected = selectedChallenge === opt.title;

          return (
            <motion.button
              key={opt.id}
              id={opt.elemId}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(opt)}
              whileHover={!reducedMotion ? { y: -1 } : {}}
              whileTap={!reducedMotion ? { scale: 0.99 } : {}}
              animate={isSelected && !reducedMotion ? { scale: 1.02 } : { scale: 1 }}
              transition={
                reducedMotion
                  ? { duration: 0.1 }
                  : { type: 'spring', stiffness: 400, damping: 25 }
              }
              className={`ob-card-challenge ${isSelected ? 'is-selected' : ''}`}
            >
              <div className="ob-ch-text">
                <span className="ob-ch-title">{opt.title}</span>
                <span className="ob-ch-helper">{opt.helper}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="ob-dim-key">[{opt.keyNum}]</span>
                <div
                  className={`w-5 h-5 rounded-full border border-[var(--line)] flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[var(--ink)] border-[var(--ink)]' : 'bg-white/60'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
