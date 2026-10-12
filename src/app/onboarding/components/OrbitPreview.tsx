'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DimensionId } from '@/data/demo-data';

interface OrbitPreviewProps {
  step: number;
  selectedDimensions: DimensionId[];
  challengeTarget: DimensionId | null;
  pulseTrigger: number;
  reducedMotion?: boolean;
}

interface DimensionConfig {
  id: DimensionId;
  name: string;
  score: number;
  colorVar: string;
  colorDVar: string;
}

const DIMENSIONS: DimensionConfig[] = [
  { id: 'study', name: 'Study', score: 82, colorVar: 'var(--study)', colorDVar: 'var(--studyd)' },
  { id: 'focus', name: 'Focus', score: 84, colorVar: 'var(--focus)', colorDVar: 'var(--focusd)' },
  { id: 'health', name: 'Health', score: 68, colorVar: 'var(--health)', colorDVar: 'var(--healthd)' },
  { id: 'sleep', name: 'Sleep', score: 61, colorVar: 'var(--sleep)', colorDVar: 'var(--sleepd)' },
  { id: 'money', name: 'Money', score: 74, colorVar: 'var(--money)', colorDVar: 'var(--moneyd)' },
  { id: 'goals', name: 'Goals', score: 79, colorVar: 'var(--goals)', colorDVar: 'var(--goalsd)' },
];

const R0 = 74;
const R1 = 112;
const DM = 5;
const HI = 0.385;

function getArcPath(i: number, innerR: number, outerR: number) {
  const midAngle = (-90 + i * 60 + 30) * (Math.PI / 180);
  const a0 = midAngle - HI;
  const a1 = midAngle + HI;

  const x0 = Math.cos(a0);
  const y0 = Math.sin(a0);
  const x1 = Math.cos(a1);
  const y1 = Math.sin(a1);

  return `M ${(outerR * x0).toFixed(2)} ${(outerR * y0).toFixed(2)} A ${outerR} ${outerR} 0 0 1 ${(outerR * x1).toFixed(2)} ${(outerR * y1).toFixed(2)} L ${(innerR * x1).toFixed(2)} ${(innerR * y1).toFixed(2)} A ${innerR} ${innerR} 0 0 0 ${(innerR * x0).toFixed(2)} ${(innerR * y0).toFixed(2)} Z`;
}

// Generate static 72 ticks
const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i * Math.PI) / 36;
  const isMajor = i % 6 === 0;
  const r0 = isMajor ? 127 : 132;
  const r1 = 140;
  return {
    id: i,
    x1: +(r0 * Math.cos(a)).toFixed(2),
    y1: +(r0 * Math.sin(a)).toFixed(2),
    x2: +(r1 * Math.cos(a)).toFixed(2),
    y2: +(r1 * Math.sin(a)).toFixed(2),
    stroke: isMajor ? 'rgba(21, 23, 28, 0.45)' : 'rgba(21, 23, 28, 0.2)',
    strokeWidth: isMajor ? 1.5 : 1,
  };
});

// Calculate pill coordinates
const PILL_POSITIONS = DIMENSIONS.map((_, i) => {
  const m = (-90 + i * 60 + 30) * (Math.PI / 180);
  const pr = 44 + 8 * Math.pow(Math.abs(Math.cos(m)), 3);
  return {
    left: +(50 + pr * Math.cos(m)).toFixed(2),
    top: +(50 + pr * Math.sin(m)).toFixed(2),
  };
});

export function OrbitPreview({
  step,
  selectedDimensions,
  challengeTarget,
  pulseTrigger,
  reducedMotion = false,
}: OrbitPreviewProps) {
  const [displayScore, setDisplayScore] = useState(74);

  // Dynamic center score & label
  let targetScore = 74;
  let centerLabel = 'Life balance';

  if (step === 2 && challengeTarget) {
    const dim = DIMENSIONS.find((d) => d.id === challengeTarget);
    if (dim) {
      targetScore = dim.score;
      centerLabel = `${dim.name} · ${dim.score}`;
    }
  }

  // Animate score count up on step 3 or change
  useEffect(() => {
    if (reducedMotion) {
      setDisplayScore(targetScore);
      return;
    }

    if (step === 3) {
      // Assemble count-up from 0 to targetScore
      let current = 0;
      const stepDuration = 25;
      const totalSteps = 30;
      const increment = targetScore / totalSteps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetScore) {
          setDisplayScore(targetScore);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.round(current));
        }
      }, stepDuration);
      return () => clearInterval(timer);
    } else {
      let current = displayScore;
      const diff = targetScore - current;
      if (Math.abs(diff) <= 1) {
        setDisplayScore(targetScore);
        return;
      }
      const timer = setInterval(() => {
        current += diff > 0 ? 1 : -1;
        if (current === targetScore) {
          setDisplayScore(targetScore);
          clearInterval(timer);
        } else {
          setDisplayScore(current);
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [targetScore, step, reducedMotion]);

  return (
    <div className="ob-dial-wrap" id="ob-dial">
      <svg
        id="ob-dial-svg"
        className="ob-dial-svg"
        viewBox="-170 -170 340 340"
        role="img"
        aria-label={`Life balance orbit preview, score ${displayScore}`}
      >
        <defs>
          <radialGradient id="ob-dial-plate" cx="0.4" cy="0.35" r="0.8">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#EEEAE1" />
          </radialGradient>
          <filter id="ob-dial-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#15171C" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Outer tick marks */}
        <g id="ob-dial-ticks" opacity={0.85}>
          {TICKS.map((t) => (
            <line
              key={t.id}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.stroke}
              strokeWidth={t.strokeWidth}
            />
          ))}
        </g>

        {/* 6 Dimension Arc segments */}
        <g id="ob-dial-arcs" style={{ filter: 'drop-shadow(0 10px 12px rgba(21, 23, 28, 0.16))' }}>
          {DIMENSIONS.map((dim, i) => {
            const trackPath = getArcPath(i, R0 + DM, R1 - DM);
            const isSelected = selectedDimensions.includes(dim.id);
            const isPulsing = challengeTarget === dim.id && pulseTrigger > 0;

            // Opacity logic based on step
            let arcOpacity = 0.88;
            if (step === 1 && selectedDimensions.length > 0) {
              arcOpacity = isSelected ? 1 : 0.22;
            } else if (step === 2 && challengeTarget) {
              arcOpacity = challengeTarget === dim.id ? 1 : 0.35;
            }

            return (
              <motion.g
                key={dim.id}
                id={`ob-dial-arc-${dim.id}`}
                className={isPulsing && !reducedMotion ? 'ob-arc-pulsing' : ''}
                initial={step === 3 && !reducedMotion ? { scale: 0.6, opacity: 0 } : false}
                animate={{ scale: 1, opacity: arcOpacity }}
                transition={
                  reducedMotion
                    ? { duration: 0.1 }
                    : { duration: 0.45, delay: step === 3 ? i * 0.08 : 0 }
                }
              >
                {/* Arc White backing */}
                <path
                  d={trackPath}
                  fill="#ffffff"
                  stroke="#ffffff"
                  strokeWidth={2 * DM + 2}
                  strokeLinejoin="round"
                  opacity={0.85}
                />
                {/* Arc Color body */}
                <path
                  d={trackPath}
                  fill={`color-mix(in srgb, ${dim.colorVar} 75%, #ffffff)`}
                  stroke={`color-mix(in srgb, ${dim.colorVar} 80%, #ffffff)`}
                  strokeWidth={2 * DM}
                  strokeLinejoin="round"
                />
                {/* Arc filled value indicator */}
                <path
                  d={trackPath}
                  fill={`color-mix(in srgb, ${dim.colorVar} 40%, ${dim.colorDVar})`}
                  stroke="none"
                  opacity={isSelected || challengeTarget === dim.id || step === 3 ? 1 : 0.75}
                />
              </motion.g>
            );
          })}
        </g>

        {/* Center Plate Glass Disc */}
        <circle r={64} fill="url(#ob-dial-plate)" filter="url(#ob-dial-shadow)" />
        <circle r={68} fill="none" stroke="rgba(21, 23, 28, 0.35)" strokeDasharray="2 5" />
      </svg>

      {/* Center Score & Label */}
      <div className="ob-dial-center" id="ob-dial-center">
        <span className="ob-num ob-dial-score" id="ob-dial-score">
          {displayScore}
        </span>
        <small className="ob-dial-label" id="ob-dial-label">
          {centerLabel}
        </small>
      </div>

      {/* Orbiting pill labels */}
      <div className="ob-dial-pills" id="ob-dial-pills">
        {DIMENSIONS.map((dim, i) => {
          const isSelected = selectedDimensions.includes(dim.id);
          const isTargeted = challengeTarget === dim.id;
          const pos = PILL_POSITIONS[i];

          let isDimmed = false;
          if (step === 1 && selectedDimensions.length > 0) {
            isDimmed = !isSelected;
          } else if (step === 2 && challengeTarget) {
            isDimmed = !isTargeted;
          }

          const isActive = isSelected || isTargeted;

          return (
            <motion.div
              key={dim.id}
              id={`ob-pill-${dim.id}`}
              className={`ob-dial-pill ${isActive ? 'is-active' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
              style={
                {
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  '--pill-color': dim.colorDVar,
                } as React.CSSProperties
              }
              initial={step === 3 && !reducedMotion ? { scale: 0, opacity: 0 } : false}
              animate={{ scale: 1, opacity: isDimmed ? 0.35 : 1 }}
              transition={
                reducedMotion
                  ? { duration: 0.1 }
                  : {
                      type: 'spring',
                      stiffness: 320,
                      damping: 24,
                      delay: step === 3 ? 0.4 + i * 0.08 : 0,
                    }
              }
            >
              <i aria-hidden="true" />
              <span>{dim.name}</span>
              <b className="ob-num">{dim.score}</b>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
