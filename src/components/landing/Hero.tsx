'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLifeStore } from '@/store/lifeStore';
import { HERO_SERIES, HERO_ADVICE, HERO_ACTIONS } from '@/data/demo-data';
import './hero.css';
import { initHero } from './heroEngine';

const N = ['Study', 'Focus', 'Health', 'Sleep', 'Money', 'Goals'] as const;
const K = ['study', 'focus', 'health', 'sleep', 'money', 'goals'] as const;

// Deterministic pill position helper rounding to 2 decimals to eliminate float hydration mismatch
const pos = (i: number) => {
  const m = ((-90 + i * 60 + 30) * Math.PI) / 180;
  const pr = 44 + 8 * Math.abs(Math.cos(m)) ** 3;
  return {
    left: `${(50 + pr * Math.cos(m)).toFixed(2)}%`,
    top: `${(50 + pr * Math.sin(m)).toFixed(2)}%`,
  };
};

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const dimensions = useLifeStore((s) => s.dimensions);

  // Scores pulled from store dynamically
  const B = [
    dimensions.study.score,
    dimensions.focus.score,
    dimensions.health.score,
    dimensions.sleep.score,
    dimensions.money.score,
    dimensions.goals.score,
  ];

  useEffect(() => {
    if (!rootRef.current) return;
    const cleanup = initHero(rootRef.current, {
      scores: B,
      series: HERO_SERIES,
      advice: HERO_ADVICE,
      actions: HERO_ACTIONS,
    });
    return () => {
      cleanup();
    };
  }, []);

  return (
    <section className="hx" id="hero-hx" ref={rootRef}>
      {/* Top Wordmark */}
      <span className="mark">LIFEOS</span>

      {/* Background ambient mesh blobs */}
      <div className="hx-mesh" aria-hidden="true">
        <i style={{ left: '48%', top: '-6%', background: 'var(--study)' }}></i>
        <i style={{ left: '70%', top: '30%', background: 'var(--goals)', animationDelay: '-4s' }}></i>
        <i style={{ left: '56%', top: '58%', background: 'var(--sleep)', animationDelay: '-8s' }}></i>
        <i style={{ left: '-6%', top: '56%', background: 'var(--health)', animationDelay: '-2s' }}></i>
        <i style={{ left: '18%', top: '-14%', background: 'var(--focus)', animationDelay: '-6s' }}></i>
        <i style={{ left: '30%', top: '40%', background: 'var(--money)', animationDelay: '-10s' }}></i>
      </div>

      {/* Pointer interactive spotlight */}
      <div className="hx-spot" id="hero-spot" aria-hidden="true"></div>

      <div className="hx-in">
        {/* Left Column: Headlines, pitch, CTAs, trust chips */}
        <div>
          <span className="hx-pill">
            <i></i>For students · Demo experience
          </span>
          <h1>
            <span className="hx-ml" style={{ ['--i' as any]: '0' }}>
              <span>Your life,</span>
            </span>
            <span className="hx-ml" style={{ ['--i' as any]: '1' }}>
              <span>
                in <em>one</em>
              </span>
            </span>
            <span className="hx-ml" style={{ ['--i' as any]: '2' }}>
              <span>
                <em className="hx-hl">clear view.</em>
              </span>
            </span>
          </h1>
          <p className="hx-sub">
            See how your study, sleep, health and money connect, then test a decision before you make it.
          </p>
          <div className="hx-cta">
            <Link className="hx-btn" id="hero-cta" href="/onboarding">
              <span>Enter LIFEOS</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link className="hx-skip" href="/app">
              Skip setup, open the demo
            </Link>
          </div>
          <ul className="hx-trust">
            <li>Keyboard-first</li>
            <li>Reduced-motion ready</li>
            <li>No sign-up</li>
          </ul>
        </div>

        {/* Right Column: Balance dial & Insight card */}
        <div className="hx-hr">
          <div className="hx-dial" id="hero-dial">
            <svg
              id="hero-dsv"
              viewBox="-170 -170 340 340"
              role="img"
              aria-label="Life balance 74 out of 100. Six areas around the dial. Hover or focus an area to see how full it is."
            >
              <defs>
                <radialGradient id="hero-plate" cx=".4" cy=".35" r=".8">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset="1" stopColor="#EEEAE1" />
                </radialGradient>
                <radialGradient id="hero-sh" gradientUnits="userSpaceOnUse" cx="0" cy="-60" r="150">
                  <stop offset="0" stopColor="#fff" stopOpacity=".65" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
                <filter id="hero-ps">
                  <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#15171C" floodOpacity=".18" />
                </filter>
              </defs>
              <g className="hx-tk" id="hero-tk"></g>
              <g className="hx-arcs" id="hero-arcs"></g>
              <circle r="64" fill="url(#hero-plate)" filter="url(#hero-ps)" />
              <circle r="68" fill="none" stroke="rgba(21,23,28,.4)" strokeDasharray="2 5" />
              <circle
                r="118"
                fill="url(#hero-sh)"
                style={{ mixBlendMode: 'soft-light', pointerEvents: 'none' }}
                id="hero-shc"
              />
            </svg>
            <div className="hx-rc">
              <span className="hx-num" id="hero-rn">
                0
              </span>
              <small id="hero-rl">Life balance</small>
            </div>
            <div className="hx-pls" id="hero-pls">
              {N.map((name, i) => {
                const p = pos(i);
                return (
                  <button
                    key={name}
                    type="button"
                    className="hx-pl"
                    aria-label={`${name}, ${B[i]} out of 100`}
                    style={{
                      left: p.left,
                      top: p.top,
                      ['--c' as any]: `var(--${K[i]}d)`,
                      ['--i' as any]: String(i),
                    }}
                  >
                    <i></i>
                    {name}
                    <b className="hx-num">0</b>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive insight panel below dial */}
          <div className="hx-ins" id="hero-ins" aria-live="polite">
            <div className="hx-ins-l">
              <div className="hx-ins-main">
                <div className="hx-ins-top">
                  <span className="hx-ins-tile" id="hero-insTile"></span>
                  <b id="hero-insT">Overview</b>
                  <small id="hero-insSub"></small>
                  <span className="hx-ins-s" id="hero-insS"></span>
                </div>
                <p id="hero-insP">Hover any area to see what it means for you.</p>
              </div>
              <div className="hx-ins-foot" id="hero-insBt"></div>
            </div>
            <div className="hx-ins-r">
              <div className="hx-rleg">
                <span>
                  <i className="a"></i>Last 7 days
                </span>
              </div>
              <div className="hx-rtop">
                <div className="hx-rbig">
                  <b className="hx-num" id="hero-stA">
                    0
                  </b>
                  <span>/100</span>
                </div>
                <span className="hx-dchip" id="hero-stB"></span>
              </div>
              <svg className="hx-ins-ch" id="hero-insCh" viewBox="0 0 200 68">
                <defs>
                  <linearGradient id="hero-insGa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" style={{ stopColor: 'var(--c,#7a7f8c)', stopOpacity: 0.32 }} />
                    <stop offset="1" style={{ stopColor: 'var(--c,#7a7f8c)', stopOpacity: 0.02 }} />
                  </linearGradient>
                  <linearGradient id="hero-insGb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#9aa3b5" stopOpacity=".22" />
                    <stop offset="1" stopColor="#9aa3b5" stopOpacity=".02" />
                  </linearGradient>
                </defs>
                <g id="hero-insGrid"></g>
                <line id="hero-insTg" x1="4" x2="178" y1="20" y2="20" />
                <text id="hero-insTgT" x="199" y="23" textAnchor="end">
                  80
                </text>
                <path id="hero-insAr" d="" />
                <path id="hero-insSp" d="" />
                <g id="hero-insHv" opacity="0">
                  <line id="hero-insCl" y1="4" y2="52" />
                  <circle id="hero-insCd" r="3.6" />
                  <g id="hero-insBub">
                    <rect rx="5" height="17" y="-27" />
                    <text y="-15.5" textAnchor="middle"></text>
                  </g>
                </g>
                <circle id="hero-insHalo" r="7" cx="0" cy="52" />
                <circle id="hero-insDot" r="3.2" cx="0" cy="52" />
                <g id="hero-insDays"></g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
