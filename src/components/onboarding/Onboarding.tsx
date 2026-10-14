'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLifeStore } from '@/store/lifeStore';
import './onboarding.css';
import { initOnboarding } from './onboardingEngine';

export function Onboarding() {
  const rootRef = useRef<HTMLElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!rootRef.current) return;

    const dimensions = useLifeStore.getState().dimensions;
    const baseline = [
      dimensions.study?.score ?? 82,
      dimensions.focus?.score ?? 84,
      dimensions.health?.score ?? 68,
      dimensions.sleep?.score ?? 61,
      dimensions.money?.score ?? 74,
      dimensions.goals?.score ?? 79,
    ];

    const cleanup = initOnboarding(rootRef.current, {
      baseline,
      onComplete: (detail) => {
        useLifeStore.getState().setOnboarding(detail);
        router.push('/app');
      },
    });

    return () => {
      cleanup();
    };
  }, [router]);

  return (
    <section className="ob" id="ob-root" ref={rootRef}>
      <span className="mark">LIFEOS</span>
      <button className="skipt" id="ob-skipT" type="button">
        Skip (Esc)
      </button>

      <div className="mesh" aria-hidden="true">
        <i style={{ left: '48%', top: '-6%', background: 'var(--study)' }}></i>
        <i style={{ left: '70%', top: '30%', background: 'var(--goals)', animationDelay: '-4s' }}></i>
        <i style={{ left: '56%', top: '58%', background: 'var(--sleep)', animationDelay: '-8s' }}></i>
        <i style={{ left: '-6%', top: '56%', background: 'var(--health)', animationDelay: '-2s' }}></i>
        <i style={{ left: '18%', top: '-14%', background: 'var(--focus)', animationDelay: '-6s' }}></i>
        <i style={{ left: '30%', top: '40%', background: 'var(--money)', animationDelay: '-10s' }}></i>
      </div>

      <div className="spot" id="ob-spot" aria-hidden="true"></div>
      <div id="ob-ann" aria-live="polite"></div>

      <div className="in">
        <div className="lc">
          <span className="pill">
            <span id="ob-stepT">Step 1 of 3</span>
            <span className="pbar" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </span>
          </span>
          <h1 id="ob-ttl"></h1>
          <p className="sub" id="ob-sub"></p>
          <div id="ob-body"></div>
          <div className="cta">
            <button className="btn" id="ob-go" type="button"></button>
            <button className="skip" id="ob-sec" type="button"></button>
          </div>
        </div>

        <div className="hr">
          <div className="dial" id="ob-dial">
            <svg
              id="ob-dsv"
              viewBox="-170 -170 340 340"
              role="img"
              aria-label="Life balance dial with six areas. Your picks lift the matching area."
            >
              <defs>
                <radialGradient id="ob-plate" cx=".4" cy=".35" r=".8">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset="1" stopColor="#EEEAE1" />
                </radialGradient>
                <radialGradient id="ob-sh" gradientUnits="userSpaceOnUse" cx="0" cy="-60" r="150">
                  <stop offset="0" stopColor="#fff" stopOpacity=".65" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
                <filter id="ob-ps">
                  <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#15171C" floodOpacity=".18" />
                </filter>
                <filter id="ob-zb" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2.4" />
                </filter>
              </defs>
              <g id="ob-tk"></g>
              <g className="arcs" id="ob-arcs"></g>
              <circle r="64" fill="url(#ob-plate)" filter="url(#ob-ps)" />
              <circle r="68" fill="none" stroke="rgba(21,23,28,.4)" strokeDasharray="2 5" />
              <circle
                r="118"
                fill="url(#ob-sh)"
                style={{ mixBlendMode: 'soft-light', pointerEvents: 'none' }}
                id="ob-shc"
              />
            </svg>
            <div className="rc">
              <span className="num" id="ob-rn">
                0
              </span>
              <small id="ob-rl">Life balance</small>
            </div>
            <span className="dlt num" id="ob-dlt"></span>
            <div className="pls" id="ob-pls"></div>
          </div>

          <div className="ins" id="ob-ins" aria-live="polite">
            <div className="rp">
              <svg id="ob-rpS" viewBox="-64 -64 128 128" aria-hidden="true">
                <g id="ob-rpE"></g>
                <g id="ob-rpN"></g>
              </svg>
            </div>
            <div className="rt">
              <div className="ins-top">
                <span className="ins-tile" id="ob-insTile"></span>
                <b id="ob-insT">Ripple engine</b>
                <small id="ob-insSub"></small>
                <span className="ins-s" id="ob-insS"></span>
              </div>
              <p id="ob-insP"></p>
              <div className="trio">
                <div>
                  <small>Direct</small>
                  <b className="num" id="ob-nD">
                    0
                  </b>
                </div>
                <div>
                  <small>Ripple</small>
                  <b className="num" id="ob-nR">
                    0
                  </b>
                </div>
                <div>
                  <small id="ob-nTL">Balance</small>
                  <b className="num" id="ob-nT">
                    0
                  </b>
                </div>
              </div>
              <div className="ef-l">
                <span>Weekly effort split</span>
                <span id="ob-insBt"></span>
              </div>
              <div className="eff" id="ob-eff"></div>
            </div>
          </div>
        </div>
      </div>

      <div id="ob-toast" role="status"></div>
    </section>
  );
}
