'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DimensionId } from '@/data/demo-data';

interface OrbitPreviewProps {
  step: number;
  selectedDimensions: DimensionId[];
  activeChallengeDimensions: DimensionId[];
  centerScoreOverride?: number | null;
  centerLabelOverride?: string | null;
  pulseTrigger?: number;
  reducedMotion?: boolean;
}

interface DimItem {
  id: DimensionId;
  name: string;
  score: number;
}

const DIMENSIONS: DimItem[] = [
  { id: 'study', name: 'Study', score: 82 },
  { id: 'focus', name: 'Focus', score: 84 },
  { id: 'health', name: 'Health', score: 68 },
  { id: 'sleep', name: 'Sleep', score: 61 },
  { id: 'money', name: 'Money', score: 74 },
  { id: 'goals', name: 'Goals', score: 79 },
];

const R0 = 74;
const R1 = 112;
const DM = 5;
const HI = 0.385;

// Path generator P matching heroEngine
const P = (a0: number, a1: number, r0: number, r1: number) => {
  const [x0, y0] = [Math.cos(a0), Math.sin(a0)];
  const [x1, y1] = [Math.cos(a1), Math.sin(a1)];
  return `M${(r1 * x0).toFixed(2)} ${(r1 * y0).toFixed(2)}A${r1} ${r1} 0 0 1 ${(r1 * x1).toFixed(2)} ${(r1 * y1).toFixed(2)}L${(r0 * x1).toFixed(2)} ${(r0 * y1).toFixed(2)}A${r0} ${r0} 0 0 0 ${(r0 * x0).toFixed(2)} ${(r0 * y0).toFixed(2)}Z`;
};

// Highlight stroke generator H matching heroEngine
const H = (a0: number, a1: number, r: number) =>
  `M${(r * Math.cos(a0)).toFixed(2)} ${(r * Math.sin(a0)).toFixed(2)}A${r} ${r} 0 0 1 ${(r * Math.cos(a1)).toFixed(2)} ${(r * Math.sin(a1)).toFixed(2)}`;

// Static ticks
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
    stroke: isMajor ? 'rgba(21, 23, 28, 0.5)' : 'rgba(21, 23, 28, 0.22)',
    strokeWidth: isMajor ? 1.6 : 1,
  };
});

// Pill coordinates matching hero
const PILL_POS = DIMENSIONS.map((_, i) => {
  const m = (-90 + i * 60 + 30) * (Math.PI / 180);
  const pr = 44 + 8 * Math.pow(Math.abs(Math.cos(m)), 3);
  return {
    left: `${(50 + pr * Math.cos(m)).toFixed(2)}%`,
    top: `${(50 + pr * Math.sin(m)).toFixed(2)}%`,
  };
});

export function OrbitPreview({
  step,
  selectedDimensions,
  activeChallengeDimensions,
  centerScoreOverride,
  centerLabelOverride,
  pulseTrigger = 0,
  reducedMotion = false,
}: OrbitPreviewProps) {
  // Real logic computation for center score and label
  let targetScore = 74;
  let targetLabel = 'Life balance';

  if (step === 1) {
    if (selectedDimensions.length > 0) {
      const selectedScores = selectedDimensions.map(
        (id) => DIMENSIONS.find((d) => d.id === id)?.score ?? 74
      );
      const avg = Math.round(selectedScores.reduce((a, b) => a + b, 0) / selectedScores.length);
      targetScore = avg;
      targetLabel = 'Your priorities';
    } else {
      targetScore = 74;
      targetLabel = 'Life balance';
    }
  } else if (step === 2) {
    if (centerScoreOverride != null) {
      targetScore = centerScoreOverride;
      targetLabel = centerLabelOverride || 'Start here';
    } else {
      targetScore = 74;
      targetLabel = 'Life balance';
    }
  } else if (step === 3) {
    targetScore = 74;
    targetLabel = 'Life balance';
  }

  // Animated tween for the center score
  const [displayScore, setDisplayScore] = useState(targetScore);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayScore(targetScore);
      return;
    }

    const startScore = displayScore;
    const diff = targetScore - startScore;
    if (diff === 0) return;

    const duration = 400;
    const startTime = performance.now();

    const updateTween = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startScore + diff * ease);
      setDisplayScore(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(updateTween);
      }
    };

    animRef.current = requestAnimationFrame(updateTween);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [targetScore, reducedMotion]);

  // Chip logic for Step 1
  const selectedNames = selectedDimensions
    .map((id) => DIMENSIONS.find((d) => d.id === id)?.name)
    .filter(Boolean);
  const gapTo80 = targetScore - 80;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="ob-dial-wrap" id="ob-dial">
        <svg
          id="ob-dial-svg"
          className="ob-dial-svg"
          viewBox="-170 -170 340 340"
          role="img"
          aria-label={`Life balance orbit preview, score ${displayScore} out of 100`}
        >
          <defs>
            {/* Center plate radial gradient matching hero */}
            <radialGradient id="ob-plate" cx=".4" cy=".35" r=".8">
              <stop offset="0" stopColor="#fff" />
              <stop offset="1" stopColor="#EEEAE1" />
            </radialGradient>

            {/* Specular highlight gradient matching hero */}
            <radialGradient id="ob-sh" gradientUnits="userSpaceOnUse" cx="0" cy="-60" r="150">
              <stop offset="0" stopColor="#fff" stopOpacity=".65" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>

            {/* Drop shadow filter matching hero */}
            <filter id="ob-ps">
              <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#15171C" floodOpacity=".18" />
            </filter>

            {/* 6 Arc Segment Masks matching hero */}
            {DIMENSIONS.map((_, i) => {
              const m = ((-90 + i * 60 + 30) * Math.PI) / 180;
              const maskD = P(m - HI, m + HI, R0 + DM, R1 - DM);
              return (
                <mask
                  key={`ob-cp${i}`}
                  id={`ob-cp${i}`}
                  maskUnits="userSpaceOnUse"
                  x="-200"
                  y="-200"
                  width="400"
                  height="400"
                >
                  <path
                    d={maskD}
                    fill="#fff"
                    stroke="#fff"
                    strokeWidth={2 * DM}
                    strokeLinejoin="round"
                  />
                </mask>
              );
            })}
          </defs>

          {/* 72 graduation ticks matching hero */}
          <g id="ob-dial-tk">
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

          {/* 6 Segment Arcs with 3D Glossy Raised Active Styling */}
          <g className="ob-dial-arcs" id="ob-dial-arcs">
            {DIMENSIONS.map((dim, i) => {
              const m = ((-90 + i * 60 + 30) * Math.PI) / 180;
              const a0 = m - HI;
              const a1 = m + HI;

              // Fill end based on score
              const fe = a0 + (dim.score / 100) * (2 * HI);

              const trackD = P(a0, a1, R0 + DM, R1 - DM);
              const fillD = P(a0, fe, R0, R1);
              const highlightD = H(a0, fe, R1 - 2);

              const tr = `color-mix(in srgb, var(--${dim.id}) 80%, #fff)`;
              const f = `color-mix(in srgb, var(--${dim.id}) 34%, var(--${dim.id}d))`;

              // Selection / Active calculation
              let isHighlighted = false;
              let isDimmed = false;

              if (step === 1) {
                if (selectedDimensions.length > 0) {
                  isHighlighted = selectedDimensions.includes(dim.id);
                  isDimmed = !isHighlighted;
                }
              } else if (step === 2) {
                if (activeChallengeDimensions.length > 0) {
                  isHighlighted = activeChallengeDimensions.includes(dim.id);
                  isDimmed = !isHighlighted;
                }
              } else if (step === 3) {
                isHighlighted = true;
              }

              return (
                <g
                  key={dim.id}
                  id={`ob-dial-arc-${dim.id}`}
                  style={{
                    opacity: isDimmed ? 0.35 : 1,
                    transition: 'opacity 0.3s ease, filter 0.3s ease',
                    filter: isHighlighted
                      ? `drop-shadow(0 4px 10px color-mix(in srgb, var(--${dim.id}d) 40%, transparent))`
                      : 'none',
                  }}
                >
                  {/* Underlay white base */}
                  <path
                    d={trackD}
                    style={{
                      fill: '#fff',
                      stroke: '#fff',
                      strokeWidth: 2 * DM + 3,
                      strokeLinejoin: 'round',
                      opacity: 0.85,
                    }}
                  />
                  {/* Track colored base */}
                  <path
                    d={trackD}
                    style={{
                      fill: tr,
                      stroke: tr,
                      strokeWidth: 2 * DM,
                      strokeLinejoin: 'round',
                    }}
                  />
                  {/* Score progress fill */}
                  <path
                    d={fillD}
                    style={{ fill: f, stroke: 'none' }}
                    mask={`url(#ob-cp${i})`}
                  />
                  {/* Glossy inner edge highlight reflection */}
                  <path
                    d={highlightD}
                    style={{
                      fill: 'none',
                      stroke: '#fff',
                      strokeWidth: 1.8,
                      strokeLinecap: 'round',
                    }}
                    mask={`url(#ob-cp${i})`}
                  />
                </g>
              );
            })}
          </g>

          {/* Center Glass Plate matching hero */}
          <circle r={64} fill="url(#ob-plate)" filter="url(#ob-ps)" />
          <circle r={68} fill="none" stroke="rgba(21,23,28,.4)" strokeDasharray="2 5" />
          <circle
            r={118}
            fill="url(#ob-sh)"
            style={{ mixBlendMode: 'soft-light', pointerEvents: 'none' }}
            id="ob-dial-shc"
          />
        </svg>

        {/* Center Score & Label */}
        <div className="ob-dial-center" id="ob-dial-center">
          <span className="ob-num ob-dial-score" id="ob-dial-score">
            {displayScore}
          </span>
          <small className="ob-dial-label" id="ob-dial-label">
            {targetLabel}
          </small>
        </div>

        {/* Orbiting pill labels matching hero */}
        <div className="ob-dial-pills" id="ob-dial-pills">
          {DIMENSIONS.map((dim, i) => {
            let isHighlighted = false;
            let isDimmed = false;

            if (step === 1) {
              if (selectedDimensions.length > 0) {
                isHighlighted = selectedDimensions.includes(dim.id);
                isDimmed = !isHighlighted;
              }
            } else if (step === 2) {
              if (activeChallengeDimensions.length > 0) {
                isHighlighted = activeChallengeDimensions.includes(dim.id);
                isDimmed = !isHighlighted;
              }
            } else if (step === 3) {
              isHighlighted = true;
            }

            return (
              <div
                key={dim.id}
                id={`ob-pill-${dim.id}`}
                className={`ob-dial-pill ${isHighlighted ? 'is-active' : ''} ${
                  isDimmed ? 'is-dimmed' : ''
                }`}
                style={
                  {
                    left: PILL_POS[i].left,
                    top: PILL_POS[i].top,
                    '--pill-color': `var(--${dim.id}d)`,
                  } as React.CSSProperties
                }
              >
                <i aria-hidden="true" />
                <span>{dim.name}</span>
                <b className="ob-num">{dim.score}</b>
              </div>
            );
          })}
        </div>
      </div>

      {/* Small Glass Chip under Dial (Step 1) */}
      {step === 1 && selectedDimensions.length > 0 && (
        <div className="ob-dial-chip" id="ob-dial-chip">
          <span>Priorities: {selectedNames.join(' · ')}</span>
          <span className="ob-dial-chip-sep">·</span>
          <span className={gapTo80 >= 0 ? 'text-[var(--healthd)]' : 'text-[var(--goalsd)]'}>
            Gap to target 80: {gapTo80 >= 0 ? `+${gapTo80}` : gapTo80}
          </span>
        </div>
      )}
    </div>
  );
}
