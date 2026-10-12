// @ts-nocheck
/* eslint-disable */
import { useLifeStore } from '@/store/lifeStore';

export interface HeroData {
  scores: number[];
  series?: number[][];
  advice?: Array<[string, 'good' | 'warn' | 'neutral', string]>;
  actions?: string[];
}

export function initHero(root: HTMLElement, data: HeroData): () => void {
  if (!root) return () => {};

  let cancelled = false;
  let rafId = 0;
  let tourTimer: any = null;

  const $ = (s: string) => root.querySelector(s);
  const $$ = (s: string) => [...root.querySelectorAll(s)];

  let RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    const storeRm = useLifeStore.getState().settings.reducedMotion;
    if (storeRm === 'on') RM = true;
    else if (storeRm === 'off') RM = false;
  } catch {}

  const N = ['Study', 'Focus', 'Health', 'Sleep', 'Money', 'Goals'];
  const K = N.map((n) => n.toLowerCase());
  const B = data.scores && data.scores.length === 6 ? data.scores : [82, 84, 68, 61, 74, 79];

  const INS = data.advice || [
    ['On track', 'good', 'On track for your exam in 3 days. Two focused hours today keeps it there.'],
    ['Strong', 'good', 'Your best hours are before noon. Protect them for the hardest topics.'],
    ['Below target', 'warn', 'Under your target of 80. A 30-minute daily walk lifts it by about 12 points.'],
    ['Needs attention', 'warn', 'Your lowest area. Short nights are pulling your Focus down.'],
    ['Steady', 'neutral', 'Holding steady. Food delivery is your biggest leak this week.'],
    ['On track', 'good', 'Moving well. Study and Focus are both feeding this goal.'],
  ];

  const ACT = data.actions || [
    'Block 2 focused hours before noon',
    'Hardest topic first, before noon',
    'Walk 30 minutes today',
    'Be in bed by 11:00 pm',
    'Cap delivery at 2 orders',
    'Review your goals on Sunday',
  ];

  const TG = 80;
  const SPK = data.series || [
    [76, 78, 79, 80, 81, 82, 82],
    [80, 82, 81, 83, 85, 84, 84],
    [64, 66, 65, 67, 66, 67, 68],
    [72, 70, 68, 66, 64, 63, 61],
    [70, 72, 71, 73, 72, 74, 74],
    [74, 75, 76, 77, 78, 79, 79],
  ];

  const bal = (a: number[]) => {
    const m = a.reduce((x, y) => x + y, 0) / 6;
    return Math.round(m - 0.05 * (m - Math.min(...a)));
  };

  const NS = 'http://www.w3.org/2000/svg';
  const mk = (n: string, a: Record<string, any>, p: Element) => {
    const e = document.createElementNS(NS, n);
    for (const k in a) e.setAttribute(k, a[k]);
    p.appendChild(e);
    return e;
  };

  const rn = $('#hero-rn');
  const rl = $('#hero-rl');
  const R0 = 74;
  const R1 = 112;
  const DM = 5;
  const HI = 0.385;
  const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

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
      const aa = fe + (RM ? 0 : Math.sin(r * 0.32 + T * 3.2 + i) * 0.022);
      d += `L${r * Math.cos(aa)} ${r * Math.sin(aa)}`;
    }
    return d + `L${r0 * Math.cos(fe)} ${r0 * Math.sin(fe)}A${r0} ${r0} 0 0 0 ${r0 * Math.cos(a0)} ${r0 * Math.sin(a0)}Z`;
  };

  const H = (a0: number, a1: number, r: number) =>
    `M${r * Math.cos(a0)} ${r * Math.sin(a0)}A${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)}`;

  // 1. Build graduation ticks inside #hero-tk
  const tk = $('#hero-tk');
  if (tk) {
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
          stroke: `rgba(21,23,28,${L ? 0.5 : 0.22})`,
          'stroke-width': L ? 1.6 : 1,
        },
        tk
      );
    }
  }

  // 2. Build 6 dial segment groups inside #hero-arcs
  const AG = $('#hero-arcs');
  const dsvDefs = $('#hero-dsv defs');
  const SM = (i: number) => ((-90 + i * 60 + 30) * Math.PI) / 180;

  // Clear any existing dynamically generated masks or arc segments from previous runs
  if (dsvDefs) {
    for (let i = 0; i < 6; i++) {
      const oldMask = dsvDefs.querySelector(`#hero-cp${i}`);
      if (oldMask) oldMask.remove();
    }
  }
  if (AG) AG.innerHTML = '';

  const A = K.map((k, i) => {
    const g = mk('g', {}, AG!);
    const tr = `color-mix(in srgb, var(--${k}) 80%, #fff)`;
    const f = `color-mix(in srgb, var(--${k}) 34%, var(--${k}d))`;
    return {
      g,
      u: mk(
        'path',
        {
          style: `fill:#fff;stroke:#fff;stroke-width:${2 * DM + 3};stroke-linejoin:round;opacity:.8`,
        },
        g
      ),
      t: mk(
        'path',
        {
          style: `fill:${tr};stroke:${tr};stroke-width:${2 * DM};stroke-linejoin:round`,
        },
        g
      ),
      p: mk('path', { style: `fill:${f};stroke:none` }, g),
      h: mk(
        'path',
        {
          fill: 'none',
          stroke: '#fff',
          'stroke-width': 1.8,
          'stroke-linecap': 'round',
        },
        g
      ),
    };
  });

  if (dsvDefs) {
    A.forEach((a, i) => {
      const mm = mk(
        'mask',
        {
          id: 'hero-cp' + i,
          maskUnits: 'userSpaceOnUse',
          x: -200,
          y: -200,
          width: 400,
          height: 400,
        },
        dsvDefs
      );
      const m = SM(i);
      mk(
        'path',
        {
          d: P(m - HI, m + HI, R0 + DM, R1 - DM),
          fill: '#fff',
          stroke: '#fff',
          'stroke-width': 2 * DM,
          'stroke-linejoin': 'round',
        },
        mm
      );
      a.p.setAttribute('mask', `url(#hero-cp${i})`);
      a.h.setAttribute('mask', `url(#hero-cp${i})`);
    });
  }

  const cur = B.map(() => 0);
  const hs = B.map(() => 0);
  let hov = -1;
  let fx = -1;
  let shownI = -2;
  let dv = 0;
  let lastL = '';
  const T0 = performance.now();

  // 3. Connect pill buttons rendered in JSX
  const pillButtons = $$('.hx-pl');
  const PL = pillButtons.map((e, i) => {
    const b = e.querySelector('b');
    e.onmouseenter = e.onfocus = () => {
      hov = i;
    };
    e.onmouseleave = e.onblur = () => {
      hov = -1;
    };
    return { e, b };
  });

  A.forEach((a, i) => {
    a.g.style.cursor = 'pointer';
    a.g.onmouseenter = () => {
      hov = i;
    };
    a.g.onmouseleave = () => {
      hov = -1;
    };
  });

  // 4. Insight Card elements
  const ins = $('#hero-ins');
  const insT = $('#hero-insT');
  const insS = $('#hero-insS');
  const insP = $('#hero-insP');
  const insSp = $('#hero-insSp');
  const insTile = $('#hero-insTile');
  const insSub = $('#hero-insSub');
  const insBt = $('#hero-insBt');
  const stA = $('#hero-stA');
  const stB = $('#hero-stB');
  const insAr = $('#hero-insAr');
  const insTg = $('#hero-insTg');
  const insTgT = $('#hero-insTgT');
  const insDot = $('#hero-insDot');
  const insHalo = $('#hero-insHalo');
  const insDays = $('#hero-insDays');
  const insGrid = $('#hero-insGrid');
  const insCh = $('#hero-insCh');
  const insHv = $('#hero-insHv');
  const insCl = $('#hero-insCl');
  const insCd = $('#hero-insCd');
  const insBub = $('#hero-insBub');

  const ICONS: Record<string, string> = {
    Study:
      '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
    Focus: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    Health:
      '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    Sleep: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    Money:
      '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.2 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>',
    Goals: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
    All:
      '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  };

  const svgI = (p: string) => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  const BALS = [69, 70, 71, 72, 73, 74, 74];

  /* crossfade helper */
  function xfade(el: HTMLElement | null) {
    if (!el) return;
    const p = el.offsetParent as HTMLElement;
    if (!p || RM) return;
    const g = el.cloneNode(true) as HTMLElement;
    g.removeAttribute('id');
    g.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    g.classList.remove('hx-enter');
    g.classList.add('hx-ghost');
    g.setAttribute('aria-hidden', 'true');
    g.style.cssText = `position:absolute;left:${el.offsetLeft}px;top:${el.offsetTop}px;width:${el.offsetWidth}px;height:${el.offsetHeight}px;margin:0;pointer-events:none`;
    p.appendChild(g);
    g.addEventListener('animationend', () => g.remove());
    el.classList.remove('hx-enter');
    void el.offsetWidth;
    el.classList.add('hx-enter');
  }

  /* series generation */
  const NP = 13;
  const rnd = (sd: number) => () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const lerpAt = (v: number[], t: number) => {
    const k = Math.min(5.999, Math.max(0, t));
    const f = Math.floor(k);
    return v[f] + (v[f + 1] - v[f]) * (k - f);
  };
  function mkSeries(v: number[], sd: number) {
    const r = rnd(sd * 131 + 17);
    const a: number[] = [];
    const b: number[] = [];
    let n1 = 0;
    let n2 = 0;
    for (let k = 0; k < NP; k++) {
      n1 = n1 * 0.5 + (r() - 0.5) * 8.5;
      n2 = n2 * 0.5 + (r() - 0.5) * 8.5;
      a.push(lerpAt(v, k / 2) + n1);
      b.push(lerpAt(v, k / 2 - 0.9) - 2.2 + n2);
    }
    a[NP - 1] = v[6];
    a[0] = v[0];
    return { a, b };
  }

  const DATA = [...SPK, BALS].map((v, i) => mkSeries(v, i + 3));
  const GL = 4;
  const GR = 178;
  const GT = 6;
  const GB = 52;
  const CX = (k: number) => GL + (k * (GR - GL)) / (NP - 1);
  let YL = 50;
  let YH = 95;
  const CY = (v: number) => GB - ((v - YL) / (YH - YL)) * (GB - GT);

  const DN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const DF = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOf = (j: number) => new Date(Date.now() - (6 - j) * 864e5).getDay();

  // Populate day labels and grid lines on client
  if (insDays) {
    insDays.innerHTML = '';
    for (let j = 0; j < 7; j++) {
      const t = mk('text', { x: CX(j * 2), y: 64, 'text-anchor': 'middle' }, insDays);
      t.textContent = DN[dayOf(j)];
      if (j === 6) t.setAttribute('class', 't');
    }
  }
  if (insGrid) {
    insGrid.innerHTML = '';
    [0, 1, 2, 3].forEach((q) => {
      const y = GB - (q * (GB - GT)) / 3;
      mk('line', { x1: GL, x2: GR, y1: y, y2: y }, insGrid);
    });
  }

  /* Catmull-Rom spline */
  function cr(p: number[][]) {
    let o = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let k = 0; k < p.length - 1; k++) {
      const p0 = p[k - 1] || p[k];
      const p1 = p[k];
      const p2 = p[k + 1];
      const p3 = p[k + 2] || p2;
      const cl = (y: number) => Math.min(GB, Math.max(GT - 2, y));
      o += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${cl(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${cl(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return o;
  }

  let sv = Array(NP).fill(50);
  let tv = DATA[6].a.slice();
  let sc = 0;
  let scT = 74;

  let hv = -1;
  function showHv(k: number) {
    if (!insCl || !insCd || !insBub || !insHv) return;
    hv = k;
    const x = CX(k);
    const y = CY(sv[k]);
    const t = `${DF[dayOf(Math.floor(k / 2))]} · ${Math.round(sv[k])}`;
    const w = t.length * 5.4 + 14;
    const bx = Math.min(GR + 16 - w / 2, Math.max(w / 2 - 6, x));
    insCl.setAttribute('x1', String(x));
    insCl.setAttribute('x2', String(x));
    insCd.setAttribute('cx', String(x));
    insCd.setAttribute('cy', String(y));
    insBub.setAttribute('transform', `translate(${bx} ${Math.max(y, 26)})`);
    const r = insBub.firstElementChild;
    const tx = insBub.lastElementChild;
    if (r) {
      r.setAttribute('x', String(-w / 2));
      r.setAttribute('width', String(w));
    }
    if (tx) tx.textContent = t;
    insHv.setAttribute('opacity', '1');
  }

  function drawChart() {
    if (!insTg || !insTgT || !insSp || !insAr || !insDot || !insHalo) return;
    let lo = Math.min(...sv, TG) - 3;
    let hi = Math.max(...sv, TG) + 3;
    if (hi - lo < 26) {
      const m = (hi + lo) / 2;
      lo = m - 13;
      hi = m + 13;
    }
    YL = lo;
    YH = hi;

    insTg.setAttribute('y1', String(CY(TG)));
    insTg.setAttribute('y2', String(CY(TG)));
    insTgT.setAttribute('y', String(CY(TG) + 3));

    const pa = sv.map((v, k) => [CX(k), CY(v)]);
    const da = cr(pa);
    const e = pa[NP - 1];

    insSp.setAttribute('d', da);
    insAr.setAttribute('d', da + `L${GR} ${GB}L${GL} ${GB}Z`);
    insDot.setAttribute('cx', String(e[0]));
    insDot.setAttribute('cy', String(e[1]));
    insHalo.setAttribute('cx', String(e[0]));
    insHalo.setAttribute('cy', String(e[1]));
    if (hv >= 0) showHv(hv);
  }

  const onChartPointerMove = (e: PointerEvent) => {
    if (!insCh) return;
    const q = insCh.getBoundingClientRect();
    const x = ((e.clientX - q.left) / q.width) * 200;
    showHv(Math.min(NP - 1, Math.max(0, Math.round(((x - GL) / (GR - GL)) * (NP - 1)))));
  };
  const onChartPointerLeave = () => {
    hv = -1;
    if (insHv) insHv.setAttribute('opacity', '0');
  };

  if (insCh) {
    insCh.addEventListener('pointermove', onChartPointerMove);
    insCh.addEventListener('pointerleave', onChartPointerLeave);
  }

  let tickInsDirty = true;
  function tickIns() {
    let moving = false;
    const st = (arr: number[], tg: number[]) =>
      arr.map((v, j) => {
        const d = tg[j] - v;
        if (Math.abs(d) < 0.02 || RM) return tg[j];
        moving = true;
        return v + d * 0.1;
      });
    sv = st(sv, tv);
    if (moving || tickInsDirty) {
      drawChart();
      tickInsDirty = false;
    }
    const dd = scT - sc;
    sc = Math.abs(dd) < 0.05 || RM ? scT : sc + dd * 0.14;
    const r = Math.round(sc);
    if (stA && stA.textContent !== String(r)) stA.textContent = String(r);
  }

  function paint(hi: number) {
    if (!insTile || !insT || !insSub || !insS || !insP || !insBt || !stB) return;
    if (hi < 0) {
      const top = B.indexOf(Math.max(...B));
      const low = B.indexOf(Math.min(...B));
      const d = bal(B) - TG;
      insTile.innerHTML = svgI(ICONS.All);
      insT.textContent = 'Overview';
      insSub.textContent = '';
      insS.textContent = '';
      insS.className = 'hx-ins-s';
      insP.textContent = 'Hover any area to see what it means for you.';
      insBt.innerHTML = `<div class="hx-ins-stats"><span><em class="up">▲</em>Best<b>${N[top]} ${B[top]}</b></span><u></u><span><em class="dn">▼</em>Lowest<b>${N[low]} ${B[low]}</b></span></div>`;
      stB.textContent = `▼ ${-d} vs target`;
      stB.className = 'hx-dchip warn';
      return;
    }
    const [lab, tone, txt] = INS[hi];
    const d = B[hi] - TG;
    const v = SPK[hi];
    const w = v[6] - v[0];
    insTile.innerHTML = svgI(ICONS[N[hi]]);
    insT.textContent = N[hi];
    insSub.textContent = `${w >= 0 ? '+' : '−'}${Math.abs(w)} this week`;
    insS.textContent = lab;
    insS.className = 'hx-ins-s ' + tone;
    insP.textContent = txt;
    insBt.innerHTML = `<a class="hx-ins-act" href="#nightpin"><span class="k">Next move</span><span class="v">${ACT[hi]}</span><i aria-hidden="true">→</i></a>`;
    const nextMoveBtn = insBt.querySelector('.hx-ins-act');
    if (nextMoveBtn) {
      nextMoveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const nightPin = document.getElementById('nightpin');
        if (nightPin) {
          nightPin.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    stB.textContent = d >= 0 ? `▲ ${d} vs target` : `▼ ${-d} vs target`;
    stB.className = 'hx-dchip ' + (d >= 0 ? 'good' : 'warn');
  }

  function setIns(hi: number) {
    if (hi === shownI || !ins) return;
    const first = shownI === -2;
    shownI = hi;
    const D = DATA[hi < 0 ? 6 : hi];
    tv = D.a.slice();
    scT = hi < 0 ? bal(B) : B[hi];
    ins.style.setProperty('--c', hi >= 0 ? `var(--${K[hi]}d)` : '#8a8f9a');
    if (!first) {
      xfade(root.querySelector('.hx-ins-main'));
      xfade($('#hero-insBt'));
      xfade(stB);
    }
    paint(hi);
  }

  // Animation frame loop
  function frame(t: number) {
    if (cancelled) return;
    const hi = hov >= 0 ? hov : fx;
    const T = t / 1000;
    let mn = 0;
    cur.forEach((v, i) => {
      if (v < cur[mn]) mn = i;
    });

    A.forEach((a, i) => {
      const goal = RM || t - T0 > 600 + i * 110 ? B[i] : 0;
      cur[i] += (goal - cur[i]) * (RM ? 1 : 0.07);
      hs[i] += ((hi === i ? 1 : 0) - hs[i]) * (RM ? 1 : 0.12);
      const mid = SM(i);
      const f0 = mid - HI - DM / 93;
      const f1 = mid + HI + DM / 93;
      const frac = clamp((cur[i] - 40) / 60) * hs[i];
      const fe = f0 + (f1 - f0) * frac;
      const o = hs[i] * 13;
      const td = P(mid - HI, mid + HI, R0 + DM, R1 - DM);
      a.t.setAttribute('d', td);
      a.u.setAttribute('d', td);
      a.p.setAttribute('d', frac > 0.006 ? W(f0 - 0.03, fe, R0 - 2, R1 + 2, T, i) : '');
      a.h.setAttribute('d', fe - f0 > 0.22 ? H(f0 + 0.1, fe - 0.07, R1 - 9) : '');
      a.h.style.opacity = String(hs[i]);
      a.g.setAttribute('transform', `translate(${o * Math.cos(mid)} ${o * Math.sin(mid)})`);
      a.g.style.opacity = hi < 0 || hi === i ? '1' : '.32';
      a.g.style.filter =
        hs[i] > 0.02 ? `drop-shadow(0 ${hs[i] * 8}px ${hs[i] * 9}px rgba(21,23,28,${0.3 * hs[i]}))` : '';

      const p = PL[i];
      if (p && p.b) {
        p.b.textContent = String(Math.round(cur[i]));
      }
      if (p && p.e) {
        p.e.classList.toggle('on', hi === i);
        p.e.classList.toggle('dim', hi >= 0 && hi !== i);
        p.e.classList.toggle('att', i === mn && hi < 0 && t - T0 > 2000);
      }
    });

    const tvv = hi >= 0 ? cur[hi] : bal(cur.map(Math.round));
    const l = hi >= 0 ? N[hi] : 'Life balance';
    dv += (tvv - dv) * (RM ? 1 : 0.2);
    if (rn) rn.textContent = String(Math.round(dv));
    if (rl && l !== lastL) {
      if (lastL) xfade(rl);
      lastL = l;
      rl.textContent = l;
    }

    tickIns();
    setIns(hi);
    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);

  // 5. Gentle tour
  const sl = (ms: number) =>
    new Promise((resolve) => {
      tourTimer = setTimeout(resolve, ms);
    });

  async function tour() {
    await sl(3400);
    for (let q = 0; ; q = (q + 1) % 6) {
      if (cancelled || RM) return;
      while (hov >= 0) {
        if (cancelled || RM) return;
        await sl(250);
      }
      fx = [3, 1, 0, 2, 4, 5][q];
      await sl(3800);
      if (q === 5) {
        fx = -1;
        await sl(2800);
      }
    }
  }

  if (!RM) {
    tour();
  }

  // 6. Interactive Spotlight & Dial Sheen
  const spot = $('#hero-spot');
  const sh = $('#hero-sh');
  const svg = $('#hero-dsv');

  const onPointerMove = (e: PointerEvent) => {
    if (RM || !root) return;
    const r = root.getBoundingClientRect();
    if (spot) {
      spot.style.setProperty('--sx', e.clientX - r.left + 'px');
      spot.style.setProperty('--sy', e.clientY - r.top + 'px');
    }
    if (svg && sh) {
      const q = svg.getBoundingClientRect();
      sh.setAttribute('cx', String(((e.clientX - q.left) / q.width) * 340 - 170));
      sh.setAttribute('cy', String(((e.clientY - q.top) / q.height) * 340 - 170));
    }
  };

  const ctaBtn = $('#hero-cta');
  const onCtaPointerMove = (e: PointerEvent) => {
    if (RM || !ctaBtn) return;
    const r = ctaBtn.getBoundingClientRect();
    ctaBtn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
  };
  const onCtaPointerLeave = () => {
    if (ctaBtn) ctaBtn.style.transform = '';
  };

  if (!RM) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    if (ctaBtn) {
      ctaBtn.addEventListener('pointermove', onCtaPointerMove);
      ctaBtn.addEventListener('pointerleave', onCtaPointerLeave);
    }
  }

  // 7. Store subscription to react live when in-page "Reduce motion" switch is clicked
  const unsubStore = useLifeStore.subscribe((state) => {
    const storeRm = state.settings.reducedMotion;
    const newRM =
      storeRm === 'on' ? true : storeRm === 'off' ? false : matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (newRM !== RM) {
      RM = newRM;
      if (RM) {
        fx = -1;
        if (tourTimer) clearTimeout(tourTimer);
        window.removeEventListener('pointermove', onPointerMove);
        if (ctaBtn) {
          ctaBtn.removeEventListener('pointermove', onCtaPointerMove);
          ctaBtn.removeEventListener('pointerleave', onCtaPointerLeave);
          ctaBtn.style.transform = '';
        }
      } else {
        tour();
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        if (ctaBtn) {
          ctaBtn.addEventListener('pointermove', onCtaPointerMove);
          ctaBtn.addEventListener('pointerleave', onCtaPointerLeave);
        }
      }
    }
  });

  // Return cleanup function
  return () => {
    cancelled = true;
    if (rafId) cancelAnimationFrame(rafId);
    if (tourTimer) clearTimeout(tourTimer);
    unsubStore();

    window.removeEventListener('pointermove', onPointerMove);
    if (ctaBtn) {
      ctaBtn.removeEventListener('pointermove', onCtaPointerMove);
      ctaBtn.removeEventListener('pointerleave', onCtaPointerLeave);
    }
    if (insCh) {
      insCh.removeEventListener('pointermove', onChartPointerMove);
      insCh.removeEventListener('pointerleave', onChartPointerLeave);
    }

    // Clean up any stray ghosts
    $$('.hx-ghost').forEach((g) => g.remove());
  };
}
