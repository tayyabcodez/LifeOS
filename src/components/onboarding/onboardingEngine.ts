// @ts-nocheck
/* eslint-disable */

import { useLifeStore } from '@/store/lifeStore';

export interface InitOnboardingOptions {
  baseline?: number[];
  onComplete: (detail: {
    priorities: string[];
    challenge: string | null;
    plan: {
      now: number;
      plan: number;
      areas: Record<string, { now: number; plan: number; gain: number }>;
    };
  }) => void;
}

export function initOnboarding(root: HTMLElement, opts: InitOnboardingOptions): () => void {
  let cancelled = false;
  let rafId = 0;
  let ambientTimer: any = null;
  let toastTimer: any = null;

  const $ = (s: string) => root.querySelector(s);
  const $$ = (s: string) => [...root.querySelectorAll(s)];

  // Reduced motion handling (both OS setting & store flag)
  const getRM = () => {
    try {
      const storeRm = useLifeStore.getState().settings.reducedMotion;
      if (storeRm === 'on') return true;
      if (storeRm === 'off') return false;
    } catch {}
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  let RM = getRM();
  if (RM) root.classList.add('rm');
  else root.classList.remove('rm');

  /* ===================== DATA ===================== */
  const N = ['Study', 'Focus', 'Health', 'Sleep', 'Money', 'Goals'];
  const K = N.map((n) => n.toLowerCase());
  const B = opts.baseline && opts.baseline.length === 6 ? opts.baseline : [82, 84, 68, 61, 74, 79];
  const TG = 80;
  const ACT = [
    'Block 90 minutes before the exam',
    'Two 25-minute focus blocks',
    'Walk 30 minutes today',
    'Be in bed by 11:00 pm',
    'Cap delivery at 2 orders',
    'Review your goals on Sunday',
  ];
  const CH = [
    { id: 'sleep', label: "I don't sleep enough", sub: 'Hits Sleep and Focus the most', map: [3, 1], ico: 'Sleep' },
    { id: 'time', label: "I'm always short on time", sub: 'Hits Focus and Goals the most', map: [1, 5], ico: 'Focus' },
    { id: 'consist', label: "I can't stay consistent", sub: 'Hits Study and Goals the most', map: [0, 5], ico: 'Study' },
    { id: 'spend', label: 'I overspend', sub: 'Hits Money first', map: [4], ico: 'Money' },
    { id: 'overw', label: 'I feel overwhelmed', sub: 'Spreads effort across all six areas', map: [0, 1, 2, 3, 4, 5], ico: 'All' },
  ];
  const ICONS = {
    Study: '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
    Focus: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    Health: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    Sleep: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    Money: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.2 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>',
    Goals: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
    All: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  };
  const svgI = (p: string) => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ===================== PLAN MODEL ===================== */
  const CAP = 96, LAM = 0.14, EFF = 6, TAU = 2, WK = 6;
  const S = [
    [0, 0.30, 0.05, 0.10, 0, 0],
    [0, 0, 0.20, 0.35, 0.05, 0.10],
    [0, 0, 0, 0.20, 0.05, 0],
    [0, 0, 0.15, 0, 0.08, 0],
    [0, 0, 0, 0, 0, 0.05],
    [0.25, 0.15, 0, 0, 0.10, 0],
  ];
  const bal = (a: number[]) => {
    const m = a.reduce((x, y) => x + y, 0) / a.length;
    return Math.round(m - 0.05 * (m - Math.min(...a)));
  };
  function plan(sel: number[], map: number[]) {
    const w = B.map((_, i) => (sel.includes(i) ? 1 : 0.15) + (map.includes(i) ? 0.6 : 0));
    const W = w.reduce((a, b) => a + b, 0);
    const any = sel.length || map.length;
    const e = w.map((x) => (any ? (EFF * x) / W : 0));
    const g = B.map((b, i) => (CAP - b) * (1 - Math.exp(-LAM * e[i])));
    let t = g.slice();
    for (let n = 0; n < 40; n++) {
      t = g.map((gi, i) => gi + S[i].reduce((s, c, j) => s + c * t[j], 0));
    }
    const P = B.map((b, i) => {
      const h = CAP - b;
      return b + h * (1 - Math.exp(-t[i] / h));
    });
    const R = P.map(Math.round);
    return { e, g, t, P, R, G: R.map((r, i) => r - B[i]), now: bal(B), plan: bal(R) };
  }
  const sCurve = (w: number) => (1 - Math.exp(-w / TAU)) / (1 - Math.exp(-WK / TAU));
  const val = (M: any, i: number, w: number) => B[i] + (M.P[i] - B[i]) * sCurve(w);

  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.calcPlan = plan;
  }

  /* ===================== STATE ===================== */
  const st = { step: 1, sel: [] as number[], ch: null as string | null, pre: [] as number[], hovD: -1, last: -1, fx: -1, touched: false };
  let M = plan([], []);
  let AS = new Set<number>();
  function sync() {
    const c = CH.find((x) => x.id === st.ch);
    const map = st.step >= 2 && c ? c.map : [];
    AS = new Set([...st.sel, ...map]);
    M = plan(st.sel, map);
    return map;
  }
  const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ===================== DIAL ===================== */
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (n: string, a: Record<string, any>, p: Element) => {
    const e = document.createElementNS(NS, n);
    for (const k in a) e.setAttribute(k, a[k]);
    p.appendChild(e);
    return e;
  };

  const rn = $('#ob-rn');
  const rl = $('#ob-rl');
  const R0 = 74, R1 = 112, DM = 5, HI = 0.385;
  const P_ = (a0: number, a1: number, r0: number, r1: number) => {
    const c = (a: number) => [Math.cos(a), Math.sin(a)];
    const [x0, y0] = c(a0);
    const [x1, y1] = c(a1);
    return `M${r1 * x0} ${r1 * y0}A${r1} ${r1} 0 0 1 ${r1 * x1} ${r1 * y1}L${r0 * x1} ${r0 * y1}A${r0} ${r0} 0 0 0 ${r0 * x0} ${r0 * y0}Z`;
  };
  const W = (a0: number, fe: number, r0: number, r1: number, T: number, i: number) => {
    let d = `M${r1 * Math.cos(a0)} ${r1 * Math.sin(a0)}A${r1} ${r1} 0 0 1 ${r1 * Math.cos(fe)} ${r1 * Math.sin(fe)}`;
    for (let r = r1; r >= r0; r -= 3) {
      const aa = fe + (RM ? 0 : Math.sin(r * 0.32 + T * 3.2 + i) * 0.022);
      d += `L${r * Math.cos(aa)} ${r * Math.sin(aa)}`;
    }
    return d + `L${r0 * Math.cos(fe)} ${r0 * Math.sin(fe)}A${r0} ${r0} 0 0 0 ${r0 * Math.cos(a0)} ${r0 * Math.sin(a0)}Z`;
  };
  const H_ = (a0: number, a1: number, r: number) =>
    `M${r * Math.cos(a0)} ${r * Math.sin(a0)}A${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)}`;

  const tk = $('#ob-tk');
  if (tk) {
    for (let i = 0; i < 72; i++) {
      const a = (i * Math.PI) / 36;
      const L = i % 6 === 0;
      const r0 = L ? 127 : 132;
      mk('line', {
        x1: r0 * Math.cos(a),
        y1: r0 * Math.sin(a),
        x2: 140 * Math.cos(a),
        y2: 140 * Math.sin(a),
        stroke: `rgba(21,23,28,${L ? 0.5 : 0.22})`,
        'stroke-width': L ? 1.6 : 1,
      }, tk);
    }
  }

  const AG = $('#ob-arcs');
  const SM = (i: number) => ((-90 + i * 60 + 30) * Math.PI) / 180;
  const A = K.map((k, i) => {
    const g = mk('g', {}, AG);
    const tr = `color-mix(in srgb, var(--${k}) 80%, #fff)`;
    const f = `color-mix(in srgb, var(--${k}) 34%, var(--${k}d))`;
    const gc = `color-mix(in srgb, var(--${k}d) 55%, #fff)`;
    const o = {
      g,
      u: mk('path', { style: `fill:#fff;stroke:#fff;stroke-width:${2 * DM + 3};stroke-linejoin:round;opacity:.8` }, g),
      t: mk('path', { style: `fill:${tr};stroke:${tr};stroke-width:${2 * DM};stroke-linejoin:round` }, g),
      p: mk('path', { style: `fill:${f};stroke:none` }, g),
      h: mk('path', { fill: 'none', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g),
      zg: mk('g', { filter: 'url(#ob-zb)', fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', style: `stroke:${gc};stroke-width:4.2` }, g),
      zc: mk('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', style: 'stroke:#fff;stroke-width:1.3' }, g),
      zOn: false,
    };
    return o;
  });

  const defs = $('#ob-dsv defs');
  if (defs) {
    A.forEach((a, i) => {
      const mm = mk('mask', { id: 'ob-cp' + i, maskUnits: 'userSpaceOnUse', x: -200, y: -200, width: 400, height: 400 }, defs);
      const m = SM(i);
      mk('path', { d: P_(m - HI, m + HI, R0 + DM, R1 - DM), fill: '#fff', stroke: '#fff', 'stroke-width': 2 * DM, 'stroke-linejoin': 'round' }, mm);
      a.p.setAttribute('mask', `url(#ob-cp${i})`);
      a.h.setAttribute('mask', `url(#ob-cp${i})`);
    });
  }

  const cur = B.map(() => 0), hs = B.map(() => 0), lv = B.slice(), pv = B.slice(), zt = B.map(() => -1e9), zl = B.map(() => 0);
  let dv = 0, lastL = '', shown = -1, T0 = performance.now();

  const pls = $('#ob-pls');
  const PL = K.map((k, i) => {
    const m = SM(i);
    const e = document.createElement('button');
    e.type = 'button';
    e.className = 'pl';
    const pr = 44 + 8 * Math.abs(Math.cos(m)) ** 3;
    e.style.cssText = `left:${50 + pr * Math.cos(m)}%;top:${50 + pr * Math.sin(m)}%;--c:var(--${k}d);--i:${i}`;
    e.innerHTML = `<i></i>${N[i]}<s></s><b class="num">0</b>`;
    e.onmouseenter = e.onfocus = () => { st.hovD = i; };
    e.onmouseleave = e.onblur = () => { st.hovD = -1; };
    if (pls) pls.appendChild(e);
    return { e, b: e.querySelector('b'), s: e.querySelector('s') };
  });

  A.forEach((a, i) => {
    a.g.style.cursor = 'pointer';
    a.g.onmouseenter = () => { st.hovD = i; };
    a.g.onmouseleave = () => { st.hovD = -1; };
  });

  /* Electric zap */
  const pol = (r: number, a: number) => [r * Math.cos(a), r * Math.sin(a)];
  function zig(p: number[], q: number[], n: number, amp: number) {
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, o = [p];
    for (let s = 1; s < n; s++) {
      const u = s / n, j = (Math.random() * 2 - 1) * amp * Math.sqrt(Math.sin(Math.PI * u));
      o.push([p[0] + dx * u + nx * j, p[1] + dy * u + ny * j]);
    }
    o.push(q);
    return o;
  }
  const D = (pts: number[][]) => 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
  function zap(a: any, i: number, f0: number, fe: number, mid: number, br: number, t: number) {
    const bolts = [], sp = [], rr = Math.random, span = fe - f0;
    const sa = fe + (rr() - 0.5) * 0.03, sb = zig(pol(R0 - 4, sa), pol(R1 + 4, sa), 7, 3.4 + 4 * br);
    bolts.push(sb);
    const bi = 2 + ((rr() * (sb.length - 3)) | 0), bp = sb[bi], ba = Math.atan2(bp[1], bp[0]) + (rr() - 0.5) * 0.5;
    bolts.push(zig(bp, pol(Math.hypot(bp[0], bp[1]) + 8 + rr() * 8, ba), 3, 2));
    if (span > 0.18) {
      for (let n = 0; n < 1 + (br > 0.2 ? 1 : 0) + (rr() < 0.5 ? 1 : 0); n++) {
        const r = R0 + 8 + rr() * (R1 - R0 - 16), pts = [];
        const m = 9;
        for (let s = 0; s <= m; s++) {
          const an = f0 + 0.05 + ((span - 0.08) * s) / m;
          pts.push(pol(r + (rr() - 0.5) * 5.5, an));
        }
        bolts.push(pts);
      }
    }
    if (br > 0.04 || rr() < 0.2) {
      const a0 = mid + (rr() - 0.5) * 0.5, a1 = clamp(a0, f0 + 0.06, fe - 0.02);
      bolts.push(zig(pol(66, a0), pol(R0 + 5, a1), 6, 4.5));
    }
    if (br > 0.25) {
      const ob = pol(R1 + 3, sa), oa = sa + (rr() - 0.5) * 0.4;
      bolts.push(zig(ob, pol(R1 + 16 + 10 * br, oa), 4, 3));
    }
    const ns = 2 + Math.round(5 * br);
    for (let n = 0; n < ns; n++) {
      const q = pol(R0 + rr() * (R1 - R0) + (rr() - 0.3) * 6, fe + (rr() - 0.5) * 0.09);
      sp.push(`<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${(0.7 + rr() * 1.3).toFixed(1)}" fill="#fff" stroke="none"/>`);
    }
    const ds = bolts.map((b) => `<path d="${D(b)}" opacity="${(0.55 + rr() * 0.45).toFixed(2)}"/>`).join('');
    a.zg.innerHTML = ds;
    a.zc.innerHTML = ds + sp.join('');
    a.zOn = true;
  }
  function zclear(a: any) {
    if (a.zOn) {
      a.zg.innerHTML = '';
      a.zc.innerHTML = '';
      a.zOn = false;
    }
  }

  function focusIdx() {
    if (st.hovD >= 0) return st.hovD;
    if (st.step === 3) return -1;
    if (st.pre.length) return st.pre[0];
    if (st.last >= 0 && AS.has(st.last)) return st.last;
    if (AS.size) return [...AS].pop();
    return st.fx;
  }
  let weakest = B.indexOf(Math.min(...B));

  function frame(t: number) {
    if (cancelled) return;
    const hi = focusIdx(), T = t / 1000, any = AS.size > 0 || hi >= 0 || st.pre.length > 0;
    A.forEach((a, i) => {
      const lit = AS.has(i) || i === hi || st.pre.includes(i), on = AS.has(i);
      const goal = RM || t - T0 > 500 + i * 110 ? B[i] : 0;
      cur[i] += (goal - cur[i]) * (RM ? 1 : 0.07);
      hs[i] += ((lit ? 1 : 0) - hs[i]) * (RM ? 1 : 0.12);
      lv[i] += ((on ? M.P[i] : B[i]) - lv[i]) * (RM ? 1 : 0.08);
      pv[i] += ((on ? M.P[i] : B[i]) - pv[i]) * (RM ? 1 : 0.1);
      const mid = SM(i), f0 = mid - HI - DM / 93, f1 = mid + HI + DM / 93, frac = clamp((lv[i] - 40) / 60) * hs[i], fe = f0 + (f1 - f0) * frac, o = hs[i] * 13;
      const br = Math.pow(Math.max(0, 1 - (t - zt[i]) / 1100), 2), el = on && frac > 0.02 && !RM && t > zt[i];
      const td = P_(mid - HI, mid + HI, R0 + DM, R1 - DM);
      a.t.setAttribute('d', td);
      a.u.setAttribute('d', td);
      a.p.setAttribute('d', frac > 0.006 ? W(f0 - 0.03, fe, R0 - 2, R1 + 2, T, i) : '');
      a.h.setAttribute('d', fe - f0 > 0.22 ? H_(f0 + 0.1, fe - 0.07, R1 - 9) : '');
      a.h.style.opacity = String(hs[i]);
      a.g.setAttribute('transform', `translate(${o * Math.cos(mid)} ${o * Math.sin(mid)})`);
      a.g.style.opacity = String(!any || lit ? 1 : 0.32);
      const glow = on ? 0.35 + br * 0.65 : 0;
      a.g.style.filter = hs[i] > 0.02
        ? `drop-shadow(0 ${hs[i] * 8}px ${hs[i] * 9}px rgba(21,23,28,${0.3 * hs[i]}))${glow > 0.01 ? ` drop-shadow(0 0 ${(4 + br * 16) * hs[i]}px color-mix(in srgb,var(--${K[i]}d) ${Math.round(40 + 55 * glow)}%,transparent))` : ''}`
        : '';
      if (el) {
        if (t - zl[i] > (br > 0.1 ? 45 : 70)) {
          zl[i] = t;
          zap(a, i, f0, fe, mid, br, t);
        }
      } else {
        zclear(a);
      }
      const p = PL[i];
      if (p) {
        if (p.b) p.b.textContent = String(Math.round(on ? pv[i] : cur[i]));
        if (p.s) p.s.textContent = String(B[i]);
        p.e.classList.toggle('act', on && Math.round(pv[i]) !== B[i]);
        p.e.classList.toggle('on', lit);
        p.e.classList.toggle('dim', any && !lit);
        p.e.classList.toggle('att', !any && i === weakest && t - T0 > 2400);
      }
    });

    const tvv = hi >= 0 ? (AS.has(hi) ? M.P[hi] : B[hi]) : AS.size ? M.plan : M.now;
    const l = hi >= 0 ? N[hi] : AS.size ? 'Plan estimate' : 'Life balance';
    dv += (tvv - dv) * (RM ? 1 : 0.2);
    if (rn) rn.textContent = String(Math.round(dv));
    if (l !== lastL) {
      if (lastL && rl) xfade(rl);
      lastL = l;
      if (rl) rl.textContent = l;
    }
    if (hi < 0) {
      const r = Math.round(tvv);
      if (shown >= 0 && r !== shown && AS.size && st.step < 3) delta(r - shown);
      shown = r;
    } else {
      shown = -1;
    }
    tickIns();
    setIns(hi);
    rafId = requestAnimationFrame(frame);
  }

  function delta(d: number) {
    const n = $('#ob-dlt');
    if (!n || !d || RM) return;
    n.textContent = (d > 0 ? '+' : '−') + Math.abs(d);
    n.style.background = d > 0 ? 'var(--healthd)' : 'var(--goalsd)';
    n.animate(
      [
        { opacity: 0, transform: 'translateY(8px) scale(.9)' },
        { opacity: 1, transform: 'none', offset: 0.18 },
        { opacity: 1, offset: 0.75 },
        { opacity: 0, transform: 'translateY(-8px)' },
      ],
      { duration: 1400 }
    );
  }

  function xfade(el: HTMLElement) {
    const p = el.offsetParent;
    if (!p || RM) return;
    const g = el.cloneNode(true) as HTMLElement;
    g.removeAttribute('id');
    g.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    g.classList.remove('enter');
    g.classList.add('ghost');
    g.setAttribute('aria-hidden', 'true');
    g.style.cssText = `position:absolute;left:${el.offsetLeft}px;top:${el.offsetTop}px;width:${el.offsetWidth}px;height:${el.offsetHeight}px;margin:0;pointer-events:none`;
    p.appendChild(g);
    g.addEventListener('animationend', () => g.remove());
    el.classList.remove('enter');
    void el.offsetWidth;
    el.classList.add('enter');
  }

  /* ===================== RIPPLE ENGINE CARD ===================== */
  const ins = $('#ob-ins');
  const insT = $('#ob-insT');
  const insS = $('#ob-insS');
  const insP = $('#ob-insP');
  const insTile = $('#ob-insTile');
  const insSub = $('#ob-insSub');
  const insBt = $('#ob-insBt');
  const nD = $('#ob-nD');
  const nR = $('#ob-nR');
  const nT = $('#ob-nT');
  const nTL = $('#ob-nTL');
  const rpE = $('#ob-rpE');
  const rpN = $('#ob-rpN');
  const eff = $('#ob-eff');

  const NC = K.map((_, i) => pol(36, SM(i)));
  const ED: any[] = [];
  if (rpE) {
    S.forEach((row, i) =>
      row.forEach((c, j) => {
        if (c > 0) {
          const [x1, y1] = NC[j], [x2, y2] = NC[i];
          ED.push({
            i,
            j,
            c,
            w: 0.5,
            o: 0.1,
            tw: 0.5,
            to: 0.1,
            e: mk(
              'path',
              {
                class: 'ed',
                d: `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${((x1 + x2) * 0.22).toFixed(1)} ${((y1 + y2) * 0.22).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
                style: `stroke:var(--${K[j]}d)`,
              },
              rpE
            ),
          });
        }
      })
    );
  }

  const NO = K.map((k, i) => {
    if (!rpN) return null;
    const [x, y] = NC[i];
    const g = mk('g', {}, rpN);
    const h = mk('circle', { cx: x, cy: y, r: 8, fill: 'none', 'stroke-width': 1.2, style: `stroke:var(--${k}d)` }, g);
    const c = mk('circle', { cx: x, cy: y, r: 6, style: `fill:var(--${k}d)` }, g);
    const [lx, ly] = pol(51, SM(i));
    const t = mk('text', { x: lx, y: ly + 2.2 }, g);
    t.textContent = N[i];
    return { g, c, h, r: 6, tr: 6, o: 1, to: 1 };
  });

  if (eff) {
    eff.innerHTML = K.map((k) => `<i style="--cd:var(--${k}d)"></i>`).join('');
  }
  const EF = eff ? [...eff.children] : [];
  const ef = B.map(() => 1), eft = B.map(() => 1), efo = B.map(() => 1), efot = B.map(() => 1), nv = [0, 0, 0];
  let nt = [0, 0, 0], shownI = '';

  function tickIns() {
    const k = RM ? 1 : 0.12, pu = Math.sin(performance.now() / 260);
    ED.forEach((d) => {
      d.w += (d.tw - d.w) * k;
      d.o += (d.to - d.o) * k;
      d.e.setAttribute('stroke-width', d.w.toFixed(2));
      d.e.style.opacity = d.o.toFixed(2);
    });
    NO.forEach((n) => {
      if (!n) return;
      n.r += (n.tr - n.r) * k;
      n.o += (n.to - n.o) * k;
      n.c.setAttribute('r', n.r.toFixed(2));
      const big = n.tr > 6.5;
      n.h.setAttribute('r', (n.r + 2.5 + (big ? pu * 1.2 : 0)).toFixed(2));
      n.h.style.opacity = String(big ? 0.5 * n.o : 0);
      n.g.style.opacity = n.o.toFixed(2);
    });
    EF.forEach((e: any, i) => {
      ef[i] += (eft[i] - ef[i]) * k;
      efo[i] += (efot[i] - efo[i]) * k;
      e.style.flexGrow = ef[i].toFixed(3);
      e.style.opacity = efo[i].toFixed(2);
    });
    [nD, nR, nT].forEach((n, j) => {
      if (!n) return;
      nv[j] += (nt[j] - nv[j]) * (RM ? 1 : 0.14);
      const x = nv[j];
      const s = j === 2 ? String(Math.round(x)) : x < 0.05 ? '0.0' : '+' + x.toFixed(1);
      if (n.textContent !== s) n.textContent = s;
    });
  }

  const tone = (v: number) => (v >= TG ? ['Above target', 'good'] : v >= 72 ? ['Close to target', 'neutral'] : ['Needs attention', 'warn']);
  const split = (i: number) => {
    const gain = M.P[i] - B[i], t = M.t[i];
    if (!(t > 1e-6)) return [0, 0];
    const d = Math.min(gain, (gain * M.g[i]) / t);
    return [d, gain - d];
  };

  function setIns(hi: number) {
    const sig = [hi, M.plan, [...AS].join(), st.step].join('|');
    if (sig === shownI) return;
    const first = shownI === '';
    shownI = sig;
    const planned = AS.size > 0;
    const on = hi >= 0 && AS.has(hi);

    ED.forEach((d) => {
      const f = d.c * M.t[d.j], rel = hi < 0 || d.i === hi || d.j === hi;
      d.tw = planned ? clamp(0.5 + f * 0.5, 0.5, 3.4) : 0.5;
      d.to = planned ? (f > 0.12 ? (rel ? 0.95 : 0.2) : 0.1) : hi < 0 ? 0.16 : rel ? 0.45 : 0.07;
    });
    NO.forEach((n, i) => {
      if (!n) return;
      const near = hi < 0 || i === hi || (planned && ED.some((d) => (d.i === hi && d.j === i) || (d.j === hi && d.i === i) && d.c * M.t[d.j] > 0.12));
      n.tr = planned ? 6 + Math.min(7, M.G[i] * 0.5) + (AS.has(i) ? 1.5 : 0) : 6;
      n.to = near ? 1 : 0.3;
    });
    const tot = M.e.reduce((a, b) => a + b, 0) || 1;
    M.e.forEach((e, i) => {
      eft[i] = Math.max(0.04, e / tot);
      efot[i] = hi < 0 || i === hi ? 1 : 0.3;
    });
    if (ins) ins.style.setProperty('--c', hi >= 0 ? `var(--${K[hi]}d)` : '#8a8f9a');
    if (!first) {
      if (insP) xfade(insP);
      if (insBt) xfade(insBt);
    }
    if (hi < 0) {
      const vals = planned ? M.R : B, low = vals.indexOf(Math.min(...vals));
      let d = 0, r = 0;
      B.forEach((_, i) => {
        const q = split(i);
        d += q[0] / 6;
        r += q[1] / 6;
      });
      nt = [d, r, planned ? M.plan : M.now];
      if (nTL) nTL.textContent = 'Balance';
      if (insTile) insTile.innerHTML = svgI(ICONS.All);
      if (insT) insT.textContent = 'Ripple engine';
      if (insSub) insSub.textContent = planned ? `${M.plan - M.now >= 0 ? '+' : '−'}${Math.abs(M.plan - M.now)} by week 6` : '';
      if (insS) {
        insS.textContent = '';
        insS.className = 'ins-s';
      }
      if (insP) {
        insP.textContent = planned
          ? `Balance ${M.now} → ${M.plan} in six weeks. Lines show gains spilling between areas.`
          : 'Pick an area and watch it charge. Lines show how gains spill between areas.';
      }
      if (insBt) insBt.textContent = planned ? `Weakest: ${N[low]} ${vals[low]}` : '';
      return;
    }
    const b = B[hi], p = on ? M.R[hi] : b, gap = TG - b, [lab, tn] = tone(p), q = on ? split(hi) : [0, 0];
    nt = [q[0], q[1], p];
    if (nTL) nTL.textContent = 'Week 6';
    if (insTile) insTile.innerHTML = svgI(ICONS[N[hi]]);
    if (insT) insT.textContent = N[hi];
    if (insSub) insSub.textContent = on ? `${p - b >= 0 ? '+' : '−'}${Math.abs(p - b)} by week 6` : `Now ${b}`;
    if (insS) {
      insS.textContent = lab;
      insS.className = 'ins-s ' + tn;
    }
    if (on) {
      let src = -1, bs = 0;
      S[hi].forEach((c, j) => {
        const v = c * M.t[j];
        if (v > bs) {
          bs = v;
          src = j;
        }
      });
      if (insP) {
        insP.textContent =
          `${N[hi]} starts ${gap > 0 ? gap + ' under' : -gap + ' above'} your target of ${TG}. Plan: ${p} by week 6` +
          (q[1] >= 1.5 && src >= 0 ? `, ${Math.round(q[1])} of it via ${N[src]}.` : '.');
      }
    } else {
      if (insP) {
        insP.textContent = `${N[hi]} sits at ${b}, ${gap > 0 ? gap + ' under' : -gap + ' above'} target. Add it to your picks to see what changes.`;
      }
    }
    if (insBt) insBt.textContent = 'Next: ' + ACT[hi];
  }

  /* ===================== STEPS ===================== */
  const body = $('#ob-body');
  const ttl = $('#ob-ttl');
  const sub = $('#ob-sub');
  const go = $('#ob-go');
  const sec = $('#ob-sec');

  const setTitle = (l: string[]) => {
    if (ttl) {
      ttl.innerHTML = l.map((x, i) => `<span class="ml" style="--i:${i}"><span>${x}</span></span>`).join('');
    }
  };
  const ann = (t: string) => {
    const a = $('#ob-ann');
    if (a) a.textContent = t;
  };
  function toast(t: string) {
    const n = $('#ob-toast');
    if (!n) return;
    n.textContent = t;
    n.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (n) n.classList.remove('show');
    }, 2400);
  }

  function goApp() {
    const detail = {
      priorities: st.sel.map((i) => K[i]),
      challenge: st.ch,
      plan: {
        now: M.now,
        plan: M.plan,
        areas: Object.fromEntries(K.map((k, i) => [k, { now: B[i], plan: M.R[i], gain: M.G[i] }])),
      },
    };
    opts.onComplete(detail);
  }

  function lowest() {
    const pool = AS.size ? [...AS] : [0, 1, 2, 3, 4, 5];
    return pool.reduce((m, i) => (B[i] < B[m] ? i : m), pool[0]);
  }

  function render(animate: boolean) {
    if (cancelled) return;
    const s = st.step;
    sync();
    const stepT = $('#ob-stepT');
    if (stepT) stepT.textContent = `Step ${s} of 3`;
    $$('.pbar i').forEach((n, j) => n.classList.toggle('on', j < s));
    let html = '';
    if (s === 1) {
      setTitle(['What matters most', '<em class="hl">right now?</em>']);
      if (sub) sub.textContent = 'Pick up to three areas. The dial shows what your plan could do for each.';
      html =
        `<div class="meta"><span id="ob-cnt"></span><span>Press 1–6 to toggle</span></div><div class="opts g1" role="group" aria-label="Areas that matter most">` +
        N.map(
          (n, i) =>
            `<button type="button" class="opt o1" data-i="${i}" role="checkbox" aria-checked="false" style="--c:var(--${K[i]});--cd:var(--${K[i]}d)"><span class="sp"></span><span class="ico">${svgI(ICONS[n])}</span><span class="tx"><span class="lbl">${n}</span><span class="sb">Now<b>${B[i]}</b><span class="gn"></span></span></span><span class="key">${i + 1}</span><span class="tick">${CHECK}</span><span class="mt"><i></i><u></u></span></button>`
        ).join('') +
        `</div>`;
      if (go) go.innerHTML = 'Continue ' + ARROW;
      if (sec) {
        sec.textContent = '';
        sec.style.display = 'none';
      }
    }
    if (s === 2) {
      setTitle(['What’s your biggest', '<em class="hl">challenge?</em>']);
      if (sub) sub.textContent = 'We’ll point your first plan at the areas this touches most.';
      html =
        `<div class="meta"><span>Choose one</span><span>Press 1–5 to select</span></div><div class="opts g2" role="radiogroup" aria-label="Biggest challenge">` +
        CH.map((c) => {
          const k = K[c.map[0]];
          return `<button type="button" class="opt o2" data-c="${c.id}" role="radio" aria-checked="${st.ch === c.id}" style="--c:var(--${k});--cd:var(--${k}d)"><span class="sp"></span><span class="ico">${svgI(ICONS[c.ico])}</span><span class="tx"><span class="lbl">${c.label}</span><span class="sb">${c.sub}</span></span><span class="dots" title="${c.map.map((j) => N[j]).join(', ')}">${c.map.slice(0, 4).map((j) => `<i style="--cx:var(--${K[j]}d)"></i>`).join('')}</span><span class="tick">${CHECK}</span></button>`;
        }).join('') +
        `</div>`;
      if (go) go.innerHTML = 'Continue ' + ARROW;
      if (sec) {
        sec.textContent = '← Back';
        sec.style.display = '';
      }
    }
    if (s === 3) {
      const low = lowest(), k = K[low];
      setTitle(['Your view is', '<em class="hl">ready.</em>']);
      if (sub) sub.textContent = 'Here is where your plan starts, based on what you told us.';
      html = `<div class="sum" style="--c:var(--${k});--cd:var(--${k}d)"><div class="sm-top"><span class="tag"><i></i>${N[low]} · ${B[low]}</span><span class="ov">Overall <b class="num" id="ob-ovA">${M.now}</b> → <b class="num" id="ob-ovB">${M.now}</b></span></div>
    <p class="sm-h">Start with <b>${N[low]} (${B[low]})</b>. Target ${TG}.</p>
    <div class="sm-mv"><span class="ico">${svgI(ICONS[N[low]])}</span><span class="tx"><span class="k">Next move</span><span class="v">${ACT[low]}</span></span><span class="est">+${M.G[low]} est.</span></div>
    <div class="sm-g">${N.map((n, i) => `<div class="gc${M.G[i] ? '' : ' z'}" style="--cd:var(--${K[i]}d);--c:var(--${K[i]});--b:${B[i]};--p:${M.R[i]};--n:${i}"><div class="r"><i></i>${n}<b>${M.G[i] ? '+' + M.G[i] : '–'}</b></div><span class="mt"><i></i><u></u></span></div>`).join('')}</div></div>`;
      if (go) go.innerHTML = 'Open my LIFEOS ' + ARROW;
      if (sec) {
        sec.textContent = 'Skip setup, open the demo';
        sec.style.display = '';
      }
    }

    const paint = () => {
      if (cancelled) return;
      if (body) body.innerHTML = html;
      refresh();
      if (s === 3) {
        const t = performance.now();
        [...AS].forEach((i, n) => (zt[i] = t + n * 130));
        countUp($('#ob-ovB'), M.now, M.plan, 900);
      }
    };

    if (animate && !RM && body) {
      body.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(-14px)' }], {
        duration: 140,
        easing: 'ease-in',
      }).onfinish = () => {
        paint();
        if (body && !cancelled) {
          body.animate([{ opacity: 0, transform: 'translateX(18px)' }, { opacity: 1, transform: 'none' }], {
            duration: 320,
            easing: 'cubic-bezier(.22,1,.36,1)',
          });
        }
      };
    } else {
      paint();
    }
    if (go) go.setAttribute('aria-disabled', String(s === 1 ? !st.sel.length : s === 2 ? !st.ch : false));
    ann(`Step ${s} of 3`);
  }

  function countUp(n: HTMLElement | null, a: number, b: number, ms: number) {
    if (!n) return;
    if (RM || a === b) {
      n.textContent = String(b);
      return;
    }
    const t0 = performance.now();
    (function f(now: number) {
      if (cancelled) return;
      const p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      n.textContent = String(Math.round(a + (b - a) * e));
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }

  function refresh() {
    if (st.step === 1) {
      const c = $('#ob-cnt');
      if (c) c.innerHTML = `<b>${st.sel.length}</b> of 3 chosen`;
      $$('.o1').forEach((b) => {
        const i = +b.dataset.i, on = st.sel.includes(i), g = M.G[i];
        b.setAttribute('aria-checked', String(on));
        b.classList.toggle('locked', !on && st.sel.length >= 3);
        b.style.setProperty('--b', String(B[i]));
        b.style.setProperty('--p', String(on ? M.R[i] : B[i]));
        const gn = b.querySelector('.gn');
        if (gn) {
          gn.textContent = on && g > 0 ? `+${g}` : gn.textContent;
          gn.classList.toggle('has', on && g > 0);
        }
      });
    }
    if (st.step === 2) {
      $$('.o2').forEach((b) => b.setAttribute('aria-checked', String(st.ch === b.dataset.c)));
    }
  }

  function zapIcon(b: Element | null) {
    const ic = b && b.querySelector('.ico');
    if (!ic || RM) return;
    ic.classList.remove('zapd');
    void ic.offsetWidth;
    ic.classList.add('zapd');
  }

  /* ===================== INTERACTIONS ===================== */
  function toggle(i: number) {
    st.touched = true;
    const k = st.sel.indexOf(i);
    if (k > -1) st.sel.splice(k, 1);
    else {
      if (st.sel.length >= 3) {
        toast('Up to 3 areas. Untick one first.');
        return;
      }
      st.sel.push(i);
      zt[i] = performance.now();
      st.last = i;
    }
    if (k > -1 && st.last === i) st.last = -1;
    sync();
    refresh();
    if (go) go.setAttribute('aria-disabled', String(!st.sel.length));
    if (k < 0) zapIcon(root.querySelector(`.o1[data-i="${i}"]`));
    ann(`${N[i]} ${k > -1 ? 'removed' : 'selected'}. ${st.sel.length} of 3 chosen.`);
  }

  function pick(id: string) {
    st.touched = true;
    st.ch = id;
    sync();
    const t = performance.now(), c = CH.find((x) => x.id === id);
    if (c) {
      c.map.forEach((i, n) => (zt[i] = t + n * 90));
      st.last = c.map[0];
    }
    refresh();
    if (go) go.setAttribute('aria-disabled', 'false');
    zapIcon(root.querySelector(`.o2[data-c="${id}"]`));
    ann('Challenge selected');
  }

  function next() {
    if (go && go.getAttribute('aria-disabled') === 'true') {
      toast(st.step === 1 ? 'Pick at least one area to continue.' : 'Choose a challenge to continue.');
      return;
    }
    if (st.step === 3) {
      goApp();
      return;
    }
    st.step++;
    st.pre = [];
    render(true);
  }

  function back() {
    if (st.step > 1) {
      st.step--;
      st.pre = [];
      render(true);
    }
  }

  const onBodyClick = (e: MouseEvent) => {
    const b = (e.target as Element).closest('.opt') as HTMLElement;
    if (!b) return;
    if (b.dataset.i !== undefined) toggle(+b.dataset.i);
    else if (b.dataset.c) pick(b.dataset.c);
  };

  const onBodyPointerOver = (e: PointerEvent) => {
    const b = (e.target as Element).closest('.opt') as HTMLElement;
    if (!b) return;
    st.pre = b.dataset.i !== undefined ? [+b.dataset.i] : b.dataset.c ? CH.find((x) => x.id === b.dataset.c)?.map || [] : [];
  };

  const onBodyPointerLeave = () => {
    st.pre = [];
  };

  const onBodyFocusIn = (e: FocusEvent) => {
    const b = (e.target as Element).closest('.opt') as HTMLElement;
    if (b) st.pre = b.dataset.i !== undefined ? [+b.dataset.i] : b.dataset.c ? CH.find((x) => x.id === b.dataset.c)?.map || [] : [];
  };

  const onBodyFocusOut = () => {
    st.pre = [];
  };

  const onBodyPointerMove = (e: PointerEvent) => {
    const b = (e.target as Element).closest('.opt') as HTMLElement;
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--mx', e.clientX - r.left + 'px');
    b.style.setProperty('--my', e.clientY - r.top + 'px');
  };

  const onGoClick = () => next();
  const onSecClick = () => (st.step === 3 ? goApp() : back());
  const onSkipTClick = () => goApp();

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Escape') {
      goApp();
      return;
    }
    if (e.key === 'Enter') {
      if ((e.target as Element)?.closest && (e.target as Element).closest('button')) return;
      e.preventDefault();
      next();
      return;
    }
    const n = parseInt(e.key, 10);
    if (st.step === 1 && n >= 1 && n <= 6) toggle(n - 1);
    if (st.step === 2 && n >= 1 && n <= 5 && CH[n - 1]) pick(CH[n - 1].id);
  };

  if (body) {
    body.addEventListener('click', onBodyClick);
    body.addEventListener('pointerover', onBodyPointerOver);
    body.addEventListener('pointerleave', onBodyPointerLeave);
    body.addEventListener('focusin', onBodyFocusIn);
    body.addEventListener('focusout', onBodyFocusOut);
    body.addEventListener('pointermove', onBodyPointerMove);
  }
  if (go) go.addEventListener('click', onGoClick);
  if (sec) sec.addEventListener('click', onSecClick);
  const skipT = $('#ob-skipT');
  if (skipT) skipT.addEventListener('click', onSkipTClick);
  window.addEventListener('keydown', onKeyDown);

  /* Ambient pointer & magnetic button */
  const spot = $('#ob-spot');
  const shc = $('#ob-sh');
  const svg = $('#ob-dsv');

  const onWindowPointerMove = (e: PointerEvent) => {
    if (RM) return;
    const r = root.getBoundingClientRect();
    if (spot) {
      spot.style.setProperty('--sx', e.clientX - r.left + 'px');
      spot.style.setProperty('--sy', e.clientY - r.top + 'px');
    }
    if (svg && shc) {
      const q = svg.getBoundingClientRect();
      shc.setAttribute('cx', String(((e.clientX - q.left) / q.width) * 340 - 170));
      shc.setAttribute('cy', String(((e.clientY - q.top) / q.height) * 340 - 170));
    }
  };

  const onGoPointerMove = (e: PointerEvent) => {
    if (RM || !go) return;
    const r = go.getBoundingClientRect();
    go.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
  };

  const onGoPointerLeave = () => {
    if (go) go.style.transform = '';
  };

  if (!RM) {
    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
    if (go) {
      go.addEventListener('pointermove', onGoPointerMove);
      go.addEventListener('pointerleave', onGoPointerLeave);
    }
    (async () => {
      const sl = (ms: number) => new Promise((r) => setTimeout(r, ms));
      await sl(3200);
      for (let q = 0; !st.touched && !cancelled; q = (q + 1) % 6) {
        while ((st.hovD >= 0 || st.pre.length) && !cancelled) await sl(250);
        if (st.touched || st.step !== 1 || cancelled) break;
        st.fx = [3, 1, 0, 2, 4, 5][q];
        await sl(3200);
      }
      st.fx = -1;
    })();
  }

  /* Listen to in-page reduced motion changes from store */
  const unsubStore = useLifeStore.subscribe((state) => {
    const newRM =
      state.settings.reducedMotion === 'on'
        ? true
        : state.settings.reducedMotion === 'off'
        ? false
        : matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (newRM !== RM) {
      RM = newRM;
      if (RM) {
        root.classList.add('rm');
        st.fx = -1;
        window.removeEventListener('pointermove', onWindowPointerMove);
        if (go) {
          go.removeEventListener('pointermove', onGoPointerMove);
          go.removeEventListener('pointerleave', onGoPointerLeave);
          go.style.transform = '';
        }
      } else {
        root.classList.remove('rm');
        window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
        if (go) {
          go.addEventListener('pointermove', onGoPointerMove);
          go.addEventListener('pointerleave', onGoPointerLeave);
        }
      }
    }
  });

  render(false);
  rafId = requestAnimationFrame(frame);

  /* Cleanup */
  return () => {
    cancelled = true;
    if (rafId) cancelAnimationFrame(rafId);
    if (ambientTimer) clearTimeout(ambientTimer);
    if (toastTimer) clearTimeout(toastTimer);
    unsubStore();

    if (body) {
      body.removeEventListener('click', onBodyClick);
      body.removeEventListener('pointerover', onBodyPointerOver);
      body.removeEventListener('pointerleave', onBodyPointerLeave);
      body.removeEventListener('focusin', onBodyFocusIn);
      body.removeEventListener('focusout', onBodyFocusOut);
      body.removeEventListener('pointermove', onBodyPointerMove);
    }
    if (go) {
      go.removeEventListener('click', onGoClick);
      go.removeEventListener('pointermove', onGoPointerMove);
      go.removeEventListener('pointerleave', onGoPointerLeave);
      go.style.transform = '';
    }
    if (sec) sec.removeEventListener('click', onSecClick);
    if (skipT) skipT.removeEventListener('click', onSkipTClick);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('pointermove', onWindowPointerMove);

    // Strict Mode: clean everything rendered by the engine into root
    if (tk) tk.innerHTML = '';
    if (AG) AG.innerHTML = '';
    if (pls) pls.innerHTML = '';
    if (rpE) rpE.innerHTML = '';
    if (rpN) rpN.innerHTML = '';
    if (eff) eff.innerHTML = '';
    if (ttl) ttl.innerHTML = '';
    if (sub) sub.textContent = '';
    if (body) body.innerHTML = '';
    if (go) go.innerHTML = '';
    if (sec) {
      sec.textContent = '';
      sec.style.display = '';
    }
    const a = $('#ob-ann');
    if (a) a.textContent = '';
    const tst = $('#ob-toast');
    if (tst) {
      tst.textContent = '';
      tst.classList.remove('show');
    }
    if (defs) {
      defs.querySelectorAll('[id^="ob-cp"]').forEach((m) => m.remove());
    }
    root.querySelectorAll('.ghost').forEach((g) => g.remove());
  };
}
