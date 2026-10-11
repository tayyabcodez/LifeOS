'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useReducedMotion as useMotionReducedMotion } from 'motion/react';
import { useLifeStore } from '@/store/lifeStore';
import './hero.css';

const N = ['Study', 'Focus', 'Health', 'Sleep', 'Money', 'Goals'] as const;
const K = ['study', 'focus', 'health', 'sleep', 'money', 'goals'] as const;

const INS = [
  ['On track', 'good', 'On track for your exam in 3 days. Two focused hours today keeps it there.'],
  ['Strong', 'good', 'Your best hours are before noon. Protect them for the hardest topics.'],
  ['Below target', 'warn', 'Under your target of 80. A 30-minute daily walk lifts it by about 12 points.'],
  ['Needs attention', 'warn', 'Your lowest area. Short nights are pulling your Focus down.'],
  ['Steady', 'neutral', 'Holding steady. Food delivery is your biggest leak this week.'],
  ['On track', 'good', 'Moving well. Study and Focus are both feeding this goal.'],
] as const;

const SPK = [
  [76, 78, 79, 80, 81, 82, 82],
  [80, 82, 81, 83, 85, 84, 84],
  [64, 66, 65, 67, 66, 67, 68],
  [72, 70, 68, 66, 64, 63, 61],
  [70, 72, 71, 73, 72, 74, 74],
  [74, 75, 76, 77, 78, 79, 79],
];

const bal = (a: number[]) => {
  const m = a.reduce((x, y) => x + y) / 6;
  return Math.round(m - 0.05 * (m - Math.min(...a)));
};

export function Hero() {
  const dimensions = useLifeStore((s) => s.dimensions);
  const storeReducedMotion = useLifeStore((s) => s.settings.reducedMotion);
  const motionReduced = useMotionReducedMotion();

  const prefersReduced =
    storeReducedMotion === 'on' ? true : storeReducedMotion === 'off' ? false : !!motionReduced;

  // Scores pulled from store dynamically
  const B = [
    dimensions.study.score,
    dimensions.focus.score,
    dimensions.health.score,
    dimensions.sleep.score,
    dimensions.money.score,
    dimensions.goals.score,
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const dialSvgRef = useRef<SVGSVGElement>(null);
  const tkRef = useRef<SVGGElement>(null);
  const arcsRef = useRef<SVGGElement>(null);
  const shRef = useRef<SVGRadialGradientElement>(null);
  const rnRef = useRef<HTMLSpanElement>(null);
  const rlRef = useRef<HTMLElement>(null);
  const insRef = useRef<HTMLDivElement>(null);
  const insTRRef = useRef<HTMLElement>(null);
  const insSRef = useRef<HTMLSpanElement>(null);
  const insPRef = useRef<HTMLParagraphElement>(null);
  const insSpRef = useRef<SVGPathElement>(null);

  // Store refs to pill button elements
  const pillRefs = useRef<Array<{ el: HTMLButtonElement | null; b: HTMLElement | null }>>([]);

  useEffect(() => {
    let cancelled = false;
    const hx = sectionRef.current;
    const spot = spotRef.current;
    const cta = ctaRef.current;
    const dsv = dialSvgRef.current;
    const tk = tkRef.current;
    const arcsGroup = arcsRef.current;
    const sh = shRef.current;
    const rn = rnRef.current;
    const rl = rlRef.current;
    const ins = insRef.current;
    const insT = insTRRef.current;
    const insS = insSRef.current;
    const insP = insPRef.current;
    const insSp = insSpRef.current;

    if (!hx || !dsv || !tk || !arcsGroup || !rn || !rl || !ins || !insT || !insS || !insP || !insSp) {
      return;
    }

    const NS = 'http://www.w3.org/2000/svg';
    const mk = (n: string, a: Record<string, any>, p: SVGElement) => {
      const e = document.createElementNS(NS, n);
      for (const k in a) e.setAttribute(k, a[k]);
      p.appendChild(e);
      return e;
    };

    const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const R0 = 74;
    const R1 = 112;
    const SP = (55.2 * Math.PI) / 180;

    const P = (a0: number, a1: number, r0: number, r1: number) => {
      const c = (a: number) => [Math.cos(a), Math.sin(a)];
      const [x0, y0] = c(a0);
      const [x1, y1] = c(a1);
      return `M${r1 * x0} ${r1 * y0}A${r1} ${r1} 0 0 1 ${r1 * x1} ${r1 * y1}L${r0 * x1} ${r0 * y1}A${r0} ${r0} 0 0 0 ${r0 * x0} ${r0 * y0}Z`;
    };

    /* water-filled segment: wavy surface at the fill front */
    const W = (a0: number, fe: number, r0: number, r1: number, T: number, i: number) => {
      let d = `M${r1 * Math.cos(a0)} ${r1 * Math.sin(a0)}A${r1} ${r1} 0 0 1 ${r1 * Math.cos(fe)} ${r1 * Math.sin(fe)}`;
      for (let r = r1; r >= r0; r -= 3) {
        const aa = fe + (prefersReduced ? 0 : Math.sin(r * 0.32 + T * 3.2 + i) * 0.022);
        d += `L${r * Math.cos(aa)} ${r * Math.sin(aa)}`;
      }
      return d + `L${r0 * Math.cos(fe)} ${r0 * Math.sin(fe)}A${r0} ${r0} 0 0 0 ${r0 * Math.cos(a0)} ${r0 * Math.sin(a0)}Z`;
    };

    const H = (a0: number, a1: number, r: number) =>
      `M${r * Math.cos(a0)} ${r * Math.sin(a0)}A${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)}`;

    // Build 72 graduation tick marks
    tk.innerHTML = '';
    for (let i = 0; i < 72; i++) {
      const a = (i * Math.PI) / 36;
      const L = i % 6 === 0;
      const r0 = L ? 127 : 132;
      mk(
        'line',
        {
          x1: r0 * Math.cos(a),
          y1: r0 * Math.sin(a),
          x2: 140 * Math.cos(a),
          y2: 140 * Math.sin(a),
          stroke: `color-mix(in srgb, var(--ink) ${L ? 50 : 22}%, transparent)`,
          'stroke-width': L ? 1.6 : 1,
        },
        tk
      );
    }

    // Build 6 segment arcs
    arcsGroup.innerHTML = '';
    const A = K.map((k) => {
      const g = mk('g', {}, arcsGroup);
      const tr = `color-mix(in srgb, var(--${k}) 80%, var(--surface, #fff))`;
      const f = `color-mix(in srgb, var(--${k}) 34%, var(--${k}d))`;
      return {
        g,
        t: mk('path', { style: `fill:${tr};stroke:${tr};stroke-width:3;stroke-linejoin:round` }, g),
        p: mk('path', { style: `fill:${f};stroke:${f};stroke-width:2;stroke-linejoin:round` }, g),
        h: mk('path', { fill: 'none', stroke: 'var(--surface, #fff)', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g),
      };
    });

    const cur = B.map(() => 0);
    const hs = B.map(() => 0);
    let hov = -1;
    let fx = -1;
    let last = '';
    let shownI = -2;
    const T0 = performance.now();

    // Hook arc segment mouse events
    A.forEach((a, i) => {
      a.g.style.cursor = 'pointer';
      a.g.onmouseenter = () => (hov = i);
      a.g.onmouseleave = () => (hov = -1);
    });

    // Hook pill button events
    pillRefs.current.forEach((item, i) => {
      if (!item.el) return;
      item.el.onmouseenter = item.el.onfocus = () => (hov = i);
      item.el.onmouseleave = item.el.onblur = () => (hov = -1);
    });

    /* insight card updater */
    function setIns(hi: number) {
      if (!ins || !insT || !insS || !insP || !insSp) return;
      if (hi === shownI) return;
      shownI = hi;
      if (hi < 0) {
        ins.classList.remove('on');
        ins.style.removeProperty('--c');
        insT.textContent = 'Your six areas';
        insS.textContent = '';
        insS.className = 'ins-s';
        insP.textContent = 'Hover any area to see what it means for you.';
        insSp.style.transition = 'none';
        insSp.style.strokeDashoffset = '1';
        return;
      }
      const [lab, tone, txt] = INS[hi];
      const v = SPK[hi];
      const mn = Math.min(...v);
      const mx = Math.max(...v);
      ins.classList.add('on');
      ins.style.setProperty('--c', `var(--${K[hi]}d)`);
      insT.textContent = `${N[hi]} · ${B[hi]}`;
      insS.textContent = (tone === 'good' ? '▲ ' : tone === 'warn' ? '▼ ' : '● ') + lab;
      insS.className = 'ins-s ' + tone;
      insP.textContent = txt;
      insSp.setAttribute('d', v.map((y, j) => `${j ? 'L' : 'M'}${2 + j * 19.3} ${25 - ((y - mn) / (mx - mn || 1)) * 22}`).join(''));
      insSp.style.transition = 'none';
      insSp.style.strokeDashoffset = '1';
      insSp.getBoundingClientRect(); // trigger reflow
      insSp.style.transition = '';
      insSp.style.strokeDashoffset = '0';
    }

    let rafId: number;
    function frame(t: number) {
      if (cancelled) return;
      if (!rn || !rl) return;
      const hi = hov >= 0 ? hov : fx;
      const T = t / 1000;
      let mn = 0;
      cur.forEach((v, i) => {
        if (v < cur[mn]) mn = i;
      });

      A.forEach((a, i) => {
        const goal = prefersReduced || t - T0 > 600 + i * 110 ? B[i] : 0;
        cur[i] += (goal - cur[i]) * (prefersReduced ? 1 : 0.07);
        hs[i] += ((hi === i ? 1 : 0) - hs[i]) * (prefersReduced ? 1 : 0.12);

        const a0 = (-90 + i * 60 + 2.4) * (Math.PI / 180);
        const a1 = a0 + SP;
        const frac = clamp((cur[i] - 40) / 60) * hs[i];
        const fe = a0 + SP * frac;
        const mid = a0 + SP / 2;
        const o = prefersReduced ? 0 : hs[i] * 13;

        a.t.setAttribute('d', P(a0, a1, R0, R1));
        a.p.setAttribute('d', frac > 0.006 ? W(a0, fe, R0, R1, T, i) : '');
        a.h.setAttribute('d', fe - a0 > 0.18 ? H(a0 + 0.07, fe - 0.07, R1 - 6) : '');
        a.h.style.opacity = String(hs[i]);
        a.g.setAttribute('transform', `translate(${o * Math.cos(mid)} ${o * Math.sin(mid)})`);
        a.g.style.opacity = String(hi < 0 || hi === i ? 1 : 0.32);
        a.g.style.filter = !prefersReduced && hs[i] > 0.02 ? `drop-shadow(0 ${hs[i] * 8}px ${hs[i] * 9}px rgba(21,23,28,${0.3 * hs[i]}))` : '';

        const pItem = pillRefs.current[i];
        if (pItem?.b && pItem?.el) {
          pItem.b.textContent = String(Math.round(cur[i]));
          pItem.el.classList.toggle('on', hi === i);
          pItem.el.classList.toggle('dim', hi >= 0 && hi !== i);
          pItem.el.classList.toggle('att', !prefersReduced && i === mn && hi < 0 && t - T0 > 2000);
        }
      });

      const v = hi >= 0 ? Math.round(cur[hi]) : bal(cur.map(Math.round));
      const l = hi >= 0 ? N[hi] : 'Life balance';
      const s = v + l;
      if (s !== last) {
        last = s;
        rn.textContent = String(v);
        rl.textContent = l;
      }
      setIns(hi);
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    /* gentle tour through areas; pauses while visitor hovers or focuses */
    const sl = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    async function tour() {
      await sl(3400);
      for (let q = 0; ; q = (q + 1) % 6) {
        if (cancelled) break;
        while (hov >= 0) {
          if (cancelled) return;
          await sl(250);
        }
        fx = [3, 1, 0, 2, 4, 5][q];
        await sl(3600);
        fx = -1;
        await sl(800);
      }
    }
    if (!prefersReduced) {
      tour();
    }

    // Pointer movement: hero spotlight & dial sheen
    const onPointerMove = (e: PointerEvent) => {
      if (spot) {
        const r = hx.getBoundingClientRect();
        spot.style.setProperty('--sx', e.clientX - r.left + 'px');
        spot.style.setProperty('--sy', e.clientY - r.top + 'px');
      }
      if (sh && dsv) {
        const q = dsv.getBoundingClientRect();
        sh.setAttribute('cx', String(((e.clientX - q.left) / q.width) * 340 - 170));
        sh.setAttribute('cy', String(((e.clientY - q.top) / q.height) * 340 - 170));
      }
    };

    if (!prefersReduced) {
      window.addEventListener('pointermove', onPointerMove);
    }

    // Magnetic CTA button
    const onCtaMove = (e: PointerEvent) => {
      if (prefersReduced || !cta) return;
      const r = cta.getBoundingClientRect();
      cta.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    };
    const onCtaLeave = () => {
      if (cta) cta.style.transform = '';
    };

    if (cta && !prefersReduced) {
      cta.addEventListener('pointermove', onCtaMove);
      cta.addEventListener('pointerleave', onCtaLeave);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      if (cta) {
        cta.removeEventListener('pointermove', onCtaMove);
        cta.removeEventListener('pointerleave', onCtaLeave);
      }
    };
  }, [dimensions, prefersReduced]);

  return (
    <section className={`hx hero-v2 ${prefersReduced ? 'rm' : ''}`} id="hx" ref={sectionRef}>
      <span className="mark">LIFEOS</span>

      {/* Static soft gradient blobs in the background */}
      <div className="mesh" aria-hidden="true">
        <i style={{ left: '48%', top: '-6%', background: 'var(--study)' }} />
        <i style={{ left: '70%', top: '30%', background: 'var(--goals)' }} />
        <i style={{ left: '56%', top: '58%', background: 'var(--sleep)' }} />
        <i style={{ left: '-6%', top: '56%', background: 'var(--health)' }} />
        <i style={{ left: '18%', top: '-14%', background: 'var(--focus)' }} />
        <i style={{ left: '30%', top: '40%', background: 'var(--money)' }} />
      </div>

      {/* Cursor spotlight */}
      <div className="spot" id="spot" ref={spotRef} aria-hidden="true" />

      <div className="in">
        {/* Left Column */}
        <div>
          <span className="pill">
            <i />
            For students · Demo experience
          </span>

          <h1>
            <span className="ml" style={{ '--i': 0 } as React.CSSProperties}>
              <span>Your life,</span>
            </span>
            <span className="ml" style={{ '--i': 1 } as React.CSSProperties}>
              <span>
                in <em>one</em>
              </span>
            </span>
            <span className="ml" style={{ '--i': 2 } as React.CSSProperties}>
              <span>
                <em className="hl">clear view.</em>
              </span>
            </span>
          </h1>

          <p className="sub">See how your study, sleep, health and money connect, then test a decision before you make it.</p>

          <div className="cta">
            <Link className="btn" id="cta" ref={ctaRef} href="/onboarding">
              <span>Enter LIFEOS</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link className="skip" href="/app">
              Skip setup, open the demo
            </Link>
          </div>

          <ul className="trust">
            <li>Keyboard-first</li>
            <li>Reduced-motion ready</li>
            <li>No sign-up</li>
          </ul>
        </div>

        {/* Right Column: The Balance Dial */}
        <div className="hr">
          <div className="dial" id="dial">
            <svg
              id="hero-dial-svg"
              ref={dialSvgRef}
              viewBox="-170 -170 340 340"
              role="img"
              aria-label={`Life balance ${bal(B)} out of 100. Six areas around the dial. Hover or focus an area to see how full it is.`}
            >
              <defs>
                <radialGradient id="plate" cx=".4" cy=".35" r=".8">
                  <stop offset="0" stopColor="var(--surface, #fff)" />
                  <stop offset="1" stopColor="var(--surface-2, #EEEAE1)" />
                </radialGradient>
                <radialGradient id="sh" ref={shRef} gradientUnits="userSpaceOnUse" cx="0" cy="-60" r="150">
                  <stop offset="0" stopColor="var(--surface, #fff)" stopOpacity=".65" />
                  <stop offset="1" stopColor="var(--surface, #fff)" stopOpacity="0" />
                </radialGradient>
                <filter id="ps">
                  <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="var(--ink, #15171C)" floodOpacity=".18" />
                </filter>
              </defs>

              <g className="tk" id="tk" ref={tkRef} />
              <g className="arcs" id="arcs" ref={arcsRef} />

              <circle r="64" fill="url(#plate)" filter="url(#ps)" />
              <circle r="68" fill="none" stroke="color-mix(in srgb, var(--ink) 40%, transparent)" strokeDasharray="2 5" />
              <circle r="118" fill="url(#sh)" style={{ mixBlendMode: 'soft-light', pointerEvents: 'none' }} id="shc" />
            </svg>

            {/* Central balance readout */}
            <div className="rc">
              <span className="num" id="rn" ref={rnRef}>
                0
              </span>
              <small id="rl" ref={rlRef}>
                Life balance
              </small>
            </div>

            {/* Six pills around the dial */}
            <div className="pls" id="pls">
              {K.map((k, i) => {
                const m = (-90 + i * 60 + 30) * (Math.PI / 180);
                const r = 44 + 5.5 * Math.pow(Math.abs(Math.cos(m)), 3);
                const left = 50 + r * Math.cos(m);
                const top = 50 + r * Math.sin(m);
                const score = B[i];
                return (
                  <button
                    key={k}
                    ref={(el) => {
                      pillRefs.current[i] = {
                        el,
                        b: el ? el.querySelector('b') : null,
                      };
                    }}
                    type="button"
                    className="pl"
                    aria-label={`${N[i]}, ${score} out of 100`}
                    style={
                      {
                        left: `${left}%`,
                        top: `${top}%`,
                        '--c': `var(--${k}d)`,
                        '--i': i,
                      } as React.CSSProperties
                    }
                  >
                    <i />
                    {N[i]}
                    <b className="num" style={{ fontWeight: 600 }}>
                      {score}
                    </b>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Insight card under the dial */}
          <div className="ins" id="ins" ref={insRef} aria-live="polite">
            <div className="ins-h">
              <i className="ins-i" />
              <b id="insT" ref={insTRRef}>
                Your six areas
              </b>
              <span className="ins-s" id="insS" ref={insSRef} />
            </div>
            <p id="insP" ref={insPRef}>
              Hover any area to see what it means for you.
            </p>
            <svg className="ins-sp" viewBox="0 0 120 28" aria-hidden="true">
              <path id="insSp" ref={insSpRef} pathLength={1} d="" />
            </svg>
          </div>
        </div>
      </div>

      {/* Scroll cue indicator */}
      <div className="cue" aria-hidden="true" />
    </section>
  );
}
