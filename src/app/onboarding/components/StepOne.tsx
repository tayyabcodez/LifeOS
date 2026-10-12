'use client';

import React from 'react';
import { motion } from 'motion/react';
import { DimensionId } from '@/data/demo-data';

interface StepOneProps {
  selected: DimensionId[];
  onToggle: (id: DimensionId) => void;
  reducedMotion?: boolean;
}

interface DimensionOption {
  id: DimensionId;
  name: string;
  keyNum: number;
  colorVar: string;
  colorDVar: string;
  iconPath: string;
}

const DIMENSION_OPTIONS: DimensionOption[] = [
  {
    id: 'goals',
    name: 'Goals',
    keyNum: 1,
    colorVar: 'var(--goals)',
    colorDVar: 'var(--goalsd)',
    iconPath: 'M4 22V4M4 4h13l-2 4 2 4H4',
  },
  {
    id: 'study',
    name: 'Study',
    keyNum: 2,
    colorVar: 'var(--study)',
    colorDVar: 'var(--studyd)',
    iconPath: 'M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z',
  },
  {
    id: 'focus',
    name: 'Focus',
    keyNum: 3,
    colorVar: 'var(--focus)',
    colorDVar: 'var(--focusd)',
    iconPath: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  },
  {
    id: 'health',
    name: 'Health',
    keyNum: 4,
    colorVar: 'var(--health)',
    colorDVar: 'var(--healthd)',
    iconPath: 'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z',
  },
  {
    id: 'sleep',
    name: 'Sleep',
    keyNum: 5,
    colorVar: 'var(--sleep)',
    colorDVar: 'var(--sleepd)',
    iconPath: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  },
  {
    id: 'money',
    name: 'Money',
    keyNum: 6,
    colorVar: 'var(--money)',
    colorDVar: 'var(--moneyd)',
    iconPath: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  },
];

export function StepOne({ selected, onToggle, reducedMotion = false }: StepOneProps) {
  return (
    <div className="w-full" id="ob-step1-group" role="group" aria-labelledby="ob-title">
      <div className="flex items-center justify-between mb-3 text-sm text-[var(--ink2)]">
        <span id="ob-step1-counter" className="font-medium">
          {selected.length} of 3 chosen
        </span>
        <span className="text-xs text-[var(--ink2)] opacity-70">
          Press 1–6 to toggle
        </span>
      </div>

      <div className="ob-step1-grid" role="group" aria-label="Select up to 3 dimensions">
        {DIMENSION_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id);
          const isDisabled = !isSelected && selected.length >= 3;

          return (
            <motion.button
              key={opt.id}
              id={`ob-opt-${opt.id}`}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              disabled={isDisabled}
              onClick={() => onToggle(opt.id)}
              whileHover={!isDisabled && !reducedMotion ? { y: -1 } : {}}
              whileTap={!isDisabled && !reducedMotion ? { scale: 0.98 } : {}}
              animate={isSelected && !reducedMotion ? { scale: 1.02 } : { scale: 1 }}
              transition={
                reducedMotion
                  ? { duration: 0.1 }
                  : { type: 'spring', stiffness: 400, damping: 25 }
              }
              className={`ob-card-pill ${isSelected ? 'is-selected' : ''}`}
              style={
                {
                  '--dim-color': opt.colorVar,
                  '--dim-colord': opt.colorDVar,
                  opacity: isDisabled ? 0.45 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                } as React.CSSProperties
              }
            >
              <div className="ob-card-left">
                <span
                  className="ob-dim-dot"
                  style={{ background: opt.colorDVar }}
                  aria-hidden="true"
                />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-[var(--ink2)] flex-shrink-0"
                  aria-hidden="true"
                >
                  <path d={opt.iconPath} />
                </svg>
                <span className="ob-dim-name">{opt.name}</span>
                <span className="ob-dim-key">[{opt.keyNum}]</span>
              </div>

              <div className="ob-check-wrap" aria-hidden="true">
                {isSelected ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3 text-white"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : null}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
