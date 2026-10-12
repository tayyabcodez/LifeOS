'use client';

import React from 'react';
import { motion } from 'motion/react';
import { DimensionId } from '@/data/demo-data';

export interface ChallengeOption {
  id: string;
  elemId: string;
  title: string;
  helper: string;
  targetDimensions: DimensionId[];
  lowestDimension: DimensionId;
  lowestScore: number;
  colorVar: string;
  colorDVar: string;
  keyNum: number;
  iconPath: React.ReactNode;
}

export const CHALLENGE_OPTIONS: ChallengeOption[] = [
  {
    id: 'sleep',
    elemId: 'ob-ch-sleep',
    title: "I don't sleep enough",
    helper: "We'll start with Sleep and Focus",
    targetDimensions: ['sleep', 'focus'],
    lowestDimension: 'sleep',
    lowestScore: 61,
    colorVar: 'var(--sleep)',
    colorDVar: 'var(--sleepd)',
    keyNum: 1,
    iconPath: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  },
  {
    id: 'time',
    elemId: 'ob-ch-time',
    title: "I'm always short on time",
    helper: "We'll start with Focus and Goals",
    targetDimensions: ['focus', 'goals'],
    lowestDimension: 'goals',
    lowestScore: 79,
    colorVar: 'var(--focus)',
    colorDVar: 'var(--focusd)',
    keyNum: 2,
    iconPath: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" />
      </>
    ),
  },
  {
    id: 'consistent',
    elemId: 'ob-ch-focus',
    title: "I can't stay consistent",
    helper: "We'll start with Study and Goals",
    targetDimensions: ['study', 'goals'],
    lowestDimension: 'goals',
    lowestScore: 79,
    colorVar: 'var(--study)',
    colorDVar: 'var(--studyd)',
    keyNum: 3,
    iconPath: (
      <>
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
      </>
    ),
  },
  {
    id: 'overspend',
    elemId: 'ob-ch-money',
    title: 'I overspend',
    helper: "We'll start with Money and Planning",
    targetDimensions: ['money'],
    lowestDimension: 'money',
    lowestScore: 74,
    colorVar: 'var(--money)',
    colorDVar: 'var(--moneyd)',
    keyNum: 4,
    iconPath: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.2 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2" />
      </>
    ),
  },
  {
    id: 'overwhelmed',
    elemId: 'ob-ch-balance',
    title: 'I feel overwhelmed',
    helper: "We'll balance all six areas",
    targetDimensions: ['goals', 'study', 'focus', 'health', 'sleep', 'money'],
    lowestDimension: 'sleep',
    lowestScore: 61,
    colorVar: 'var(--health)',
    colorDVar: 'var(--healthd)',
    keyNum: 5,
    iconPath: (
      <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    ),
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
      <div className="flex items-center justify-between mb-2 text-xs text-[var(--ink2)] opacity-70">
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
              whileHover={!reducedMotion ? { y: -2 } : {}}
              whileTap={!reducedMotion ? { scale: 0.99 } : {}}
              animate={isSelected && !reducedMotion ? { scale: 1.02, y: -1 } : { scale: 1, y: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0.05 }
                  : { type: 'spring', stiffness: 380, damping: 24 }
              }
              className={`ob-card-challenge ${isSelected ? 'is-selected' : ''}`}
              style={
                {
                  '--card-c': opt.colorVar,
                  '--card-cd': opt.colorDVar,
                } as React.CSSProperties
              }
            >
              {/* 36px circle icon tile tinted at ~18% */}
              <div className="ob-icon-tile" aria-hidden="true">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {opt.iconPath}
                </svg>
              </div>

              {/* Text: Title 15px/600 + Helper 12.5px muted */}
              <div className="ob-ch-text">
                <span className="ob-ch-title">{opt.title}</span>
                <span className="ob-ch-helper">{opt.helper}</span>
              </div>

              {/* Muted 11px key hint */}
              <span className="ob-card-key">{opt.keyNum}</span>

              {/* Radio circle 20px on the right */}
              <div className="ob-radio-circle" aria-hidden="true">
                {isSelected && <div className="ob-radio-dot" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
