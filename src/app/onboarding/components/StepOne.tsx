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
  iconPath: React.ReactNode;
}

const DIMENSION_OPTIONS: DimensionOption[] = [
  {
    id: 'goals',
    name: 'Goals',
    keyNum: 1,
    colorVar: 'var(--goals)',
    colorDVar: 'var(--goalsd)',
    iconPath: <path d="M4 22V4M4 4h13l-2 4 2 4H4" />,
  },
  {
    id: 'study',
    name: 'Study',
    keyNum: 2,
    colorVar: 'var(--study)',
    colorDVar: 'var(--studyd)',
    iconPath: (
      <>
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
      </>
    ),
  },
  {
    id: 'focus',
    name: 'Focus',
    keyNum: 3,
    colorVar: 'var(--focus)',
    colorDVar: 'var(--focusd)',
    iconPath: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" />
      </>
    ),
  },
  {
    id: 'health',
    name: 'Health',
    keyNum: 4,
    colorVar: 'var(--health)',
    colorDVar: 'var(--healthd)',
    iconPath: (
      <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    ),
  },
  {
    id: 'sleep',
    name: 'Sleep',
    keyNum: 5,
    colorVar: 'var(--sleep)',
    colorDVar: 'var(--sleepd)',
    iconPath: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  },
  {
    id: 'money',
    name: 'Money',
    keyNum: 6,
    colorVar: 'var(--money)',
    colorDVar: 'var(--moneyd)',
    iconPath: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.2 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2" />
      </>
    ),
  },
];

export function StepOne({ selected, onToggle, reducedMotion = false }: StepOneProps) {
  return (
    <div className="w-full" id="ob-step1-group" role="group" aria-labelledby="ob-title">
      <div className="flex items-center justify-between mb-2 text-xs text-[var(--ink2)]">
        <span id="ob-step1-counter" className="font-medium">
          {selected.length} of 3 chosen
        </span>
        <span className="opacity-70">
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
              whileHover={!isDisabled && !reducedMotion ? { y: -2 } : {}}
              whileTap={!isDisabled && !reducedMotion ? { scale: 0.98 } : {}}
              animate={isSelected && !reducedMotion ? { scale: 1.02, y: -1 } : { scale: 1, y: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0.05 }
                  : { type: 'spring', stiffness: 380, damping: 24 }
              }
              className={`ob-card-pill ${isSelected ? 'is-selected' : ''}`}
              style={
                {
                  '--card-c': opt.colorVar,
                  '--card-cd': opt.colorDVar,
                  opacity: isDisabled ? 0.42 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                } as React.CSSProperties
              }
            >
              {/* 36px circle icon tile tinted at ~18% opacity */}
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

              {/* Label 15px/600 */}
              <span className="ob-card-label">{opt.name}</span>

              {/* Muted 11px key hint */}
              <span className="ob-card-key">{opt.keyNum}</span>

              {/* 20px check circle */}
              <div className="ob-check-circle" aria-hidden="true">
                {isSelected && (
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
