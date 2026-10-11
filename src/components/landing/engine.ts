// @ts-nocheck
/* eslint-disable */
import { useLifeStore } from '@/store/lifeStore';

export function initLanding(root: HTMLElement): () => void {
  let cancelled = false;
  const $ = (s: string) => root.querySelector(s);
  const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const ease = (t: number) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  let RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    const storeRm = useLifeStore.getState().settings.reducedMotion;
    if (storeRm === 'on') RM = true;
    else if (storeRm === 'off') RM = false;
  } catch {}

  root.style.colorScheme = "light";
  if (RM) root.classList.add('rm');

  /* name, card label, scatter x, scatter y, rotation */
  const D = [
    ['Study', 'Study notes', .16, .40, -7],
    ['Focus', 'Calendar', .82, .36, 5],
    ['Health', 'Gym log', .22, .80, 6],
    ['Sleep', 'Sleep tracker', .78, .82, -5],
    ['Money', 'Bank balance', .91, .62, 8],
    ['Goals', 'Goals notebook', .07, .62, -4]
  ];
  /* related pairs; third value = which beat lights them */
  const L = [[3, 1, 1], [2, 3, 1], [1, 0, 2], [0, 5, 3], [4, 5, 3], [1, 5, 3]];
  const HEADS = [
    [0, 'Your life is scattered.', 'Study in one app, sleep in another, money in a third.'],
    [.14, 'LIFEOS brings it into one view.', 'Six areas of your life, one balance score.'],
    [.56, 'Sleep shapes your focus.', 'Short nights cost you focus the next day.'],
    [.72, 'Focus shapes your study.', 'One focused hour beats three distracted ones.'],
    [.86, 'And it all feeds your goals.', 'Change one thing and the whole chain moves.']
  ];
  const SCORE = [82, 84, 68, 61, 74, 79];
  const ICON = {
    Study: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    Focus: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    Health: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    Sleep: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    Money: '<circle cx="12" cy="12" r="10"/><path d="M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2a3 3 0 0 1-3-1.5"/><path d="M12 6v2M12 16v2"/>',
    Goals: '<path d="M4 22V4"/><path d="M4 4c3-2 5 2 8 0s5-2 8 0v9c-3-2-5-2-8 0s-5 2-8 0"/>'
  };
  const ic = (n: string) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;

  const stage = $('#stage'), svg = $('#svg'), head = $('#head'), sub = $('#sub'), NS = 'http://www.w3.org/2000/svg';
  
  // Clear any previously appended nodes in SVG for safety
  svg.innerHTML = '';

  const mk = (n: string, a: Record<string, any>, par?: SVGElement) => {
    const e = document.createElementNS(NS, n);
    for (const k in a) e.setAttribute(k, a[k]);
    (par || svg).appendChild(e);
    return e;
  };
  const defs = mk('defs', {});
  const CH = [3, 1, 0, 5];
  const CAP = ['Short nights cost you focus', 'Focus lifts your study', 'Study moves your goals'];
  const SPK = {
    3: 'M2 6L12 9L22 8L32 13L42 11L52 16L62 18',
    1: 'M2 16L12 14L22 15L32 9L42 11L52 6L62 4',
    0: 'M2 14L12 12L22 15L32 9L42 8L52 10L62 5',
    5: 'M2 15L12 13L22 12L32 10L42 11L52 7L62 6'
  };
  let hl = -1;

  // Track dynamically appended stage elements so we can remove them on cleanup
  const stageAppended: HTMLElement[] = [];

  const amb = document.createElement('div');
  amb.className = 'amb';
  amb.innerHTML = '<i class="o1"></i><i class="o2"></i><i class="o3"></i>';
  stage.prepend(amb);
  stageAppended.push(amb);

  /* realistic balance ring: shadow, gradients, ticks, target line, gloss */
  const rsh = mk('filter', { id: 'rsh', x: '-20%', y: '-20%', width: '140%', height: '150%' }, defs);
  mk('feDropShadow', { dx: 0, dy: 8, stdDeviation: 9, 'flood-color': '#15171C', 'flood-opacity': .2 }, rsh);
  const halo = [0, 1].map(() => mk('circle', { fill: 'none', stroke: 'rgba(21,23,28,.07)', 'stroke-width': 1 }));
  const disc = mk('circle', { fill: 'rgba(255,255,255,.78)', stroke: 'rgba(21,23,28,.08)' });
  const tg = mk('g', {});
  for (let q = 0; q < 72; q++) {
    const a = q / 72 * 2 * Math.PI, mj = q % 6 === 0, r1 = 122, r2 = mj ? 133 : 127;
    mk('line', { x1: Math.cos(a) * r1, y1: Math.sin(a) * r1, x2: Math.cos(a) * r2, y2: Math.sin(a) * r2, stroke: 'rgba(21,23,28,.28)', 'stroke-width': mj ? 1.6 : 1 }, tg);
  }
  const target = mk('circle', { fill: 'none', stroke: 'rgba(21,23,28,.5)', 'stroke-width': 1.5, 'stroke-dasharray': '4 5' });
  D.forEach((d, i) => {
    const k = d[0].toLowerCase(), g = mk('linearGradient', { id: 'ag' + i, x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    mk('stop', { offset: 0, style: `stop-color:var(--${k})` }, g);
    mk('stop', { offset: 1, style: `stop-color:color-mix(in srgb,var(--${k}) 82%,var(--${k}d))` }, g);
  });
  const rg = mk('g', { filter: 'url(#rsh)' });
  const arcs2 = D.map((d, i) => {
    const e = mk('circle', { fill: 'none', stroke: `url(#ag${i})`, style: 'cursor:pointer;pointer-events:visibleStroke' }, rg);
    e.onmouseenter = () => hl = i;
    e.onmouseleave = () => hl = -1;
    return e;
  });
  const gloss = D.map(() => mk('circle', { fill: 'none', stroke: '#fff', 'stroke-linecap': 'round', style: 'pointer-events:none' }, rg));
  const lk = [0, 1, 2].map(j => {
    const g = mk('linearGradient', { id: 'cg' + j, gradientUnits: 'userSpaceOnUse' }, defs);
    [CH[j], CH[j + 1]].forEach((n, q) => mk('stop', { offset: q, style: `stop-color:var(--${D[n][0].toLowerCase()}d)` }, g));
    const c = document.createElement('div');
    c.className = 'cap';
    c.textContent = '↓ ' + CAP[j];
    stage.appendChild(c);
    stageAppended.push(c);
    return { g, c, path: mk('path', { fill: 'none', stroke: `url(#cg${j})`, 'stroke-width': 3, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 }) };
  });
  const dot = mk('circle', { r: 6, fill: '#15171C' });
  const alabs = D.map((d, i) => {
    const e = document.createElement('div');
    e.className = 'alab' + (i === 3 ? ' low' : '');
    e.innerHTML = `<i style="background:var(--${d[0].toLowerCase()}d)"></i>${d[0]} <b>${SCORE[i]}</b>${i === 3 ? ' ↓' : ''}`;
    stage.appendChild(e);
    stageAppended.push(e);
    e.onmouseenter = () => hl = i;
    e.onmouseleave = () => hl = -1;
    return e;
  });

  /* scattered phase: mini-app widgets, notifications, chaos scribble */
  const MINI = {
    Study: '<s></s><s></s><s class="s2"></s>',
    Focus: '<span>Thu · Exam 10:00</span>',
    Health: '<span class="bars"><s></s><s></s><s></s><s></s></span>',
    Sleep: '<span class="big">6h 42m</span>',
    Money: '<span class="big">Rs 12,400</span>',
    Goals: '<span>☐ Pass exam<br>☐ Save Rs 5,000</span>'
  };
  const cards = D.map(d => {
    const k = d[0].toLowerCase(), e = document.createElement('div');
    e.className = 'card';
    e.style.background = `var(--${k})`;
    e.style.color = 'var(--ink)';
    e.innerHTML = `<span class="t"><span class="cht"><i style="background:var(--${k}d)"></i>${d[1]}</span><span class="mini">${MINI[d[0]]}</span></span><span class="i" style="color:var(--${k}d)">${ic(d[0])}</span>`;
    stage.appendChild(e);
    stageAppended.push(e);
    return e;
  });
  const NOTES = [
    ['3 new messages', .34, .5, 3],
    ['Rent due Friday', .5, .39, -4],
    ['Low balance', .66, .52, -5],
    ['Gym streak broken', .36, .76, 4],
    ['Assignment due', .64, .77, -3],
    ['Slept only 4h', .5, .9, 3]
  ];
  const nts = NOTES.map(n => {
    const e = document.createElement('div');
    e.className = 'ntf';
    e.textContent = n[0];
    stage.appendChild(e);
    stageAppended.push(e);
    return e;
  });
  const chaos = document.createElement('div');
  chaos.className = 'chaos';
  chaos.innerHTML = '<svg class="csv" viewBox="0 0 220 110" aria-hidden="true"><path d="M10 60C40 5 70 110 100 55S150 5 175 60 205 95 212 40M20 90C60 60 90 100 120 70S170 95 200 70M30 25C60 50 100 10 140 40S190 20 205 60"/></svg><b>6 apps. 0 connections.</b>';
  stage.appendChild(chaos);
  stageAppended.push(chaos);

  const rnum = document.createElement('div');
  rnum.className = 'rnum';
  rnum.innerHTML = '<span class="num">0</span><small>Life balance</small>';
  stage.appendChild(rnum);
  stageAppended.push(rnum);

  const rcap = document.createElement('div');
  rcap.className = 'rcap';
  rcap.textContent = 'Thicker arc = stronger area · dashed line = target 80';
  stage.appendChild(rcap);
  stageAppended.push(rcap);

  const pills = CH.map(n => {
    const k = D[n][0].toLowerCase(), e = document.createElement('div');
    e.className = 'pill';
    e.innerHTML = `<span class="pi" style="background:var(--${k});color:var(--${k}d)">${ic(D[n][0])}</span><b>${D[n][0]}</b>${n === 3 ? '<em>↓ lowest</em>' : '<em class="ok">' + (n === 5 ? 'on track' : 'strong') + '</em>'}<svg class="psp" viewBox="0 0 64 22" aria-hidden="true"><path pathLength="1" d="${SPK[n]}" style="stroke:var(--${k}d)"/></svg><span class="num">${SCORE[n]}</span>`;
    e._sp = e.querySelector('.psp path');
    e.onmouseenter = () => hl = n;
    e.onmouseleave = () => hl = -1;
    stage.appendChild(e);
    stageAppended.push(e);
    return e;
  });

  let shown = -1;
  let headTimeout: any = null;
  function setHead(i: number) {
    if (i === shown) return;
    shown = i;
    const up = () => {
      head.textContent = HEADS[i][1];
      sub.textContent = HEADS[i][2];
      head.classList.remove('out');
      sub.classList.remove('out');
    };
    if (RM) { up(); return; }
    head.classList.add('out');
    sub.classList.add('out');
    clearTimeout(headTimeout);
    headTimeout = setTimeout(up, 170);
  }

  function draw(p: number, t: number) {
    const w = stage.clientWidth, h = stage.clientHeight, sm = w < 760, top = Math.max(sm ? 200 : 190, h * .27), avail = h - top - 30;
    const S = sm ? Math.min(w * .56, 210) : Math.min(360, avail - 26, h * .5), k = S / 240;
    const eA = ease(clamp((p - .1) / .3)), ra = ease(clamp((p - .26) / .2)), mv = ease(clamp((p - .46) / .1));
    const cyA = sm ? top + S / 2 : top + avail / 2 - 8, cx = lerp(w / 2, sm ? w / 2 : w * .30, mv), cy = cyA;
    const beat = p < .56 ? 0 : p < .72 ? 1 : p < .86 ? 2 : 3, all = beat === 0 || p > .93, litB = all ? [0, 1, 2, 3, 4, 5] : beat === 1 ? [3, 1] : beat === 2 ? [1, 0] : [0, 5], lit = hl >= 0 ? [hl] : litB;
    [halo[0], halo[1], disc, target].forEach(e => { e.setAttribute('cx', cx); e.setAttribute('cy', cy); });
    halo[0].setAttribute('r', 205 * k); halo[1].setAttribute('r', 300 * k); halo.forEach(e => e.style.opacity = ra);
    disc.setAttribute('r', 62 * k); disc.style.opacity = ra; target.setAttribute('r', 72 * k); target.style.opacity = ra * clamp(1 - (1 - ra) * 2);
    tg.setAttribute('transform', `translate(${cx} ${cy}) scale(${k})`); tg.style.opacity = ra * .9;
    D.forEach((d, i) => {
      const th0 = 12 + SCORE[i] * .3, th = th0 * k * (.35 + .65 * ra), r = 108 * k - th / 2, C = 2 * Math.PI * r, a = arcs2[i], op = clamp((eA - .5) / .5) * clamp(ra / .3) * (lit.includes(i) ? 1 : .22);
      a.setAttribute('cx', cx); a.setAttribute('cy', cy); a.setAttribute('r', r); a.setAttribute('stroke-width', th);
      a.setAttribute('stroke-dasharray', `${(54 / 360) * C * ra} ${C}`); a.setAttribute('transform', `rotate(${-90 + i * 60 + 3} ${cx} ${cy})`); a.style.opacity = op;
      const gl = gloss[i], gr = 108 * k - 3.4 * k, GC = 2 * Math.PI * gr; gl.setAttribute('cx', cx); gl.setAttribute('cy', cy); gl.setAttribute('r', gr); gl.setAttribute('stroke-width', 2.4 * k);
      gl.setAttribute('stroke-dasharray', `${Math.max(0, (54 / 360) * GC * ra - 8 * k)} ${GC}`); gl.setAttribute('stroke-dashoffset', -4 * k); gl.setAttribute('transform', `rotate(${-90 + i * 60 + 3} ${cx} ${cy})`); gl.style.opacity = op * .55;
      const ang = (-90 + i * 60 + 30) * Math.PI / 180, rm = 108 * k - th0 * k / 2, dr = Math.sin(t / 900 + i * 1.7) * 8 * (1 - eA) * (RM ? 0 : 1), par = (1 - eA) * p * 70 * (i % 2 ? -1 : 1);
      const hw = (sm ? 142 : 178) / 2 + 8, x = lerp(clamp(d[2] * w, hw, w - hw), cx + rm * Math.cos(ang), eA) + dr, y = lerp(d[3] * h, cy + rm * Math.sin(ang), eA) + dr * .6 + par;
      const W = lerp(sm ? 142 : 178, 24, eA), H = lerp(sm ? 74 : 90, 24, eA), c = cards[i];
      c.style.width = W + 'px'; c.style.height = H + 'px'; c.style.borderRadius = lerp(16, 12, eA) + 'px';
      c.style.transform = `translate3d(${x - W / 2}px,${y - H / 2}px,0) rotate(${lerp(d[4], 0, eA)}deg)`;
      c.style.opacity = 1 - clamp((eA - .72) / .28); c.children[0].style.opacity = 1 - clamp(eA * 2.4); c.children[1].style.opacity = clamp((eA - .55) / .35);
      const al = alabs[i], rl = (108 + 30) * k; al.style.transform = `translate(${cx + rl * Math.cos(ang)}px,${cy + rl * Math.sin(ang)}px) translate(-50%,-50%)`; al.style.opacity = sm ? 0 : clamp((ra - .6) / .4) * (lit.includes(i) ? 1 : .35); al.style.pointerEvents = ra > .7 ? 'auto' : 'none';
    });
    nts.forEach((n, i) => {
      const [, nx, ny, rot] = NOTES[i], dx = Math.sin(t / 1100 + i * 2.3) * 10 * (RM ? 0 : 1) * (1 - eA), dy = Math.cos(t / 1300 + i * 1.9) * 8 * (RM ? 0 : 1) * (1 - eA);
      const x = lerp(nx * w, cx, eA) + dx, y = lerp(ny * h, cy, eA) + dy + (1 - eA) * p * 40 * (i % 2 ? 1 : -1);
      n.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) rotate(${lerp(rot, 0, eA)}deg) scale(${lerp(1, .3, eA)})`; n.style.opacity = 1 - clamp(eA * 2.2);
    });
    chaos.style.transform = `translate(${w / 2}px,${cyA}px) translate(-50%,-50%)`; chaos.style.opacity = 1 - clamp(eA * 3);
    rnum.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; rnum.style.opacity = ra; rnum.style.fontSize = (46 * k) + 'px'; rnum.firstChild.textContent = Math.round(74 * ra);
    rcap.style.transform = `translate(${cx}px,${cy + S / 2 + (sm ? 16 : 30)}px) translate(-50%,0)`; rcap.style.opacity = sm ? 0 : clamp((ra - .7) / .3);
    const x0 = sm ? 24 : w * .53, pw = sm ? w - 48 : Math.min(470, w * .36), ph = sm ? 50 : 64, sp = sm ? 74 : Math.min(120, (avail - 64) / 3), y0 = sm ? top + S + 34 : top + (avail - (ph + 3 * sp)) / 2;
    const T = [.54, .56, .72, .86], LT = [.58, .73, .87], ys = (j: number) => y0 + j * sp;
    pills.forEach((e, j) => {
      const kj = ease(clamp((p - T[j]) / .06)), dim = CH[j], on = hl >= 0 ? hl === dim : (!all && lit.includes(dim));
      e.style.width = pw + 'px'; e.style.height = ph + 'px';
      e.style.transform = `translate3d(${x0 + (1 - kj) * 40}px,${ys(j)}px,0)`; e.style.opacity = hl >= 0 && hl !== dim ? kj * .55 : kj; e._sp.style.strokeDashoffset = 1 - kj;
      e.style.boxShadow = on ? `0 0 0 3px var(--${D[dim][0].toLowerCase()}),0 10px 30px rgba(21,23,28,.08)` : '';
    });
    const lx = x0 + ph / 2;
    lk.forEach((o, j) => {
      const lp = ease(clamp((p - LT[j]) / .08)), ya = ys(j) + ph, yb = ys(j + 1);
      o.path.setAttribute('d', `M${lx} ${ya}L${lx} ${yb}`); o.path.setAttribute('stroke-dashoffset', 1 - lp); o.g.setAttribute('x1', lx); o.g.setAttribute('y1', ya); o.g.setAttribute('x2', lx); o.g.setAttribute('y2', yb);
      o.c.style.width = (pw - ph / 2 - 14) + 'px'; o.c.style.transform = `translate3d(${lx + 16}px,${(ya + yb) / 2 - 11}px,0)`; o.c.style.opacity = clamp((lp - .4) / .6);
    });
    const fl = p > .95 && !RM; dot.style.opacity = fl ? 1 : 0;
    if (fl) { const u = ((t / 3000) % 1) * 3, j = Math.min(2, Math.floor(u)), f = u - j; dot.setAttribute('cx', lx); dot.setAttribute('cy', lerp(ys(j) + ph, ys(j + 1), f)); }
    let hd = 0; HEADS.forEach(([st], i) => { if (p >= st) hd = i; }); setHead(hd);
  }

  const rlg = $('.rlg'), nnote = $('.nfoot .note'), nw = $('#nw'), np = $('#np'), nhs = $('#nhs'), ty = $('#ty'), S = 'I sleep 1 hour earlier', nrow = $('.nrow'), status = $('#status'), stat = $('#stat'), apply = $('#apply');
  const fillE = $('#fill'), knob = $('#knob'), sl = $('#sl'), bn2 = $('#bn2'), nks = [...root.querySelectorAll('.nk')], rd = $('#rd');
  
  // Clear any existing stars in np
  np.querySelectorAll('.star').forEach(s => s.remove());
  for (let i = 0; i < 46; i++) {
    const d = document.createElement('i');
    d.className = 'star';
    d.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${1 + Math.random() * 1.6}px;height:${1 + Math.random() * 1.6}px;animation-delay:${-Math.random() * 6}s;animation-duration:${3 + Math.random() * 4}s`;
    np.appendChild(d);
  }

  /* before/after bars + live scenarios */
  ICON.Energy = '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>';
  ICON.Stress = '<path d="M2 12h3l2-6 4 12 3-9 2 3h6"/>';
  const ROWS = [3, 1, 0, 5, 4, 2], UP = 'M2 26L18 23L34 24L50 16L66 14L82 7L98 4', DN = 'M2 4L18 7L34 6L50 14L66 16L82 23L98 26', brs = $('#brs'), rail = $('#rail'), pls = $('#pls');

  /* card tuple: name, colour-dim, row that triggers it, value, unit, sign, why */
  const SCEN = [
    {
      t: 'I sleep 1 hour earlier', lab: 'Sleep', fr: 402, to: 462, fmt: (m: number) => `${Math.floor(m / 60)}h ${String(Math.round(m) % 60).padStart(2, '0')}m`, sim: [86, 93, 72, 75, 74, 82], bal: 80,
      cards: [
        ['Sleep', 3, 0, 14, ' pts', '+', 'Bedtime 1 hour earlier'],
        ['Focus', 1, 1, 9, ' pts', '+', 'Rested mornings, sharper hours'],
        ['Energy', 2, 5, 11, '%', '+', 'Sleep and health lift together'],
        ['Stress', 5, 5, 8, '%', '−', 'Lower is better']
      ]
    },
    {
      t: 'I study 2 hours more', lab: 'Study', fr: 120, to: 240, fmt: (m: number) => `${Math.round(m / 60)}h a day`, sim: [91, 80, 66, 57, 74, 84], bal: 75,
      cards: [
        ['Study', 0, 2, 9, ' pts', '+', 'Deeper revision before the exam'],
        ['Focus', 1, 1, 4, ' pts', '−', 'Long days wear attention down'],
        ['Energy', 2, 0, 6, '%', '−', 'Less sleep, less energy'],
        ['Stress', 5, 3, 7, '%', '+', 'Cramming raises pressure']
      ]
    },
    {
      t: 'I work out 3 times a week', lab: 'Gym', fr: 0, to: 3, fmt: (m: number) => `${Math.round(m)}× a week`, sim: [83, 88, 80, 68, 71, 82], bal: 79,
      cards: [
        ['Health', 2, 5, 12, ' pts', '+', 'Three sessions a week'],
        ['Sleep', 3, 0, 7, ' pts', '+', 'Training helps you wind down'],
        ['Energy', 2, 5, 14, '%', '+', 'Movement lifts your day'],
        ['Stress', 5, 3, 10, '%', '−', 'Exercise clears the mind']
      ]
    }
  ];

  let sc = 0, liveT: number | null = null;
  // Clear any existing br items in brs except rail and pls
  brs.querySelectorAll('.br').forEach(b => b.remove());

  const rowsE = ROWS.map(d => {
    const k = D[d][0].toLowerCase(), e = document.createElement('div');
    e.className = 'br';
    e.innerHTML = `<span class="nd" style="background:var(--${k})"></span><span class="bl" style="color:var(--${k})">${ic(D[d][0])}<b>${D[d][0]}</b></span><div class="bt"><canvas class="cv"></canvas></div><span class="bv"><b class="num">${SCORE[d]}</b><small></small></span>`;
    brs.appendChild(e);
    return {
      e, d,
      cv: e.querySelector('.cv') as HTMLCanvasElement,
      bub: [...Array(7)].map(() => ({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 1.8, s: .3 + Math.random() * .6, ph: Math.random() * 6 })),
      col: (getComputedStyle(root).getPropertyValue('--' + D[d][0].toLowerCase()).trim() || '#cccccc'),
      bv: e.querySelector('.bv b') as HTMLElement,
      dl: e.querySelector('.bv small') as HTMLElement,
      nd: e.querySelector('.nd') as HTMLElement
    };
  });

  const dg = '<span class="dg"><span class="st">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => `<span>${x}</span>`).join('') + '</span></span>';
  const BASEV = { Energy: 62, Stress: 41 };

  function buildCards(i: number) {
    let prev = -1;
    nks.forEach((n, q) => {
      const [nm, cd, row, v, u, sg, why] = SCEN[i].cards[q], k = D[cd][0].toLowerCase(), good = nm === 'Stress' ? sg === '−' : sg === '+';
      n.style.setProperty('--c', `var(--${k})`);
      n.dataset.row = String(row);
      n.dataset.dl = String(row === prev ? .12 : 0);
      prev = row;
      n.querySelector('.pi')!.innerHTML = ic(nm);
      n.querySelector('.nh2 b')!.textContent = nm;
      n.querySelector('.why')!.textContent = why;
      const box = n.querySelector('.num')!;
      box.className = 'num big' + (good ? '' : ' bad');
      box.innerHTML = `<span class="ar">${sg === '+' ? '↑' : '↓'}</span> ${sg}` + [...String(v)].map(() => dg).join('') + `<span class="u${u[0] === ' ' ? ' sp2' : ''}">${u.trim()}</span>`;
      n._st = [...box.querySelectorAll('.st')];
      n._dig = [...String(v)].map(Number);
      n._sp = n.querySelector('.sp path');
      let bd = n.querySelector('.badge');
      if (!bd) {
        bd = document.createElement('span');
        bd.className = 'badge';
        n.querySelector('.nh2')!.appendChild(bd);
      }
      bd.textContent = good ? '▲ Better' : '▼ Worse';
      bd.classList.toggle('bad', !good);
      let ft = n.querySelector('.ftl');
      if (!ft) {
        ft = document.createElement('small');
        ft.className = 'ftl';
        box.after(ft);
      }
      const di = D.findIndex(x => x[0] === nm);
      ft.textContent = di >= 0 ? `${SCORE[di]} → ${SCEN[i].sim[di]} · est.` : `${BASEV[nm]} → ${Math.round(BASEV[nm] * (1 + (sg === '+' ? 1 : -1) * v / 100))} · est.`;
      let ed = n.querySelector('.sp .ed');
      if (!ed) {
        ed = document.createElementNS(NS, 'circle');
        ed.setAttribute('class', 'ed');
        ed.setAttribute('r', 3);
        n.querySelector('.sp')!.appendChild(ed);
      }
      ed.setAttribute('cx', 98);
      ed.setAttribute('cy', sg === '+' ? 4 : 26);
      ed.classList.toggle('bad', !good);
      n._ed = ed;
      n._sp.setAttribute('d', sg === '+' ? UP : DN);
      n._sp.classList.toggle('bad', !good);
    });
  }
  buildCards(0);

  const pointerMoveHandlers: Array<{ el: HTMLElement; fn: (e: any) => void }> = [];
  nks.forEach(n => {
    const fn = (e: PointerEvent) => {
      const r = n.getBoundingClientRect();
      n.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      n.style.setProperty('--my', (e.clientY - r.top) + 'px');
    };
    n.addEventListener('pointermove', fn);
    pointerMoveHandlers.push({ el: n, fn });
  });

  const slLab = $('.slr span'), chipB = [...root.querySelectorAll('#chips button')], chipsE = $('#chips'), ncE = $('#nc');
  let nin = ncE.querySelector('#nin');
  if (!nin) {
    nin = document.createElement('div');
    nin.id = 'nin';
    [...ncE.children].forEach(c => nin.appendChild(c));
    ncE.appendChild(nin);
  }

  function afterSc() {
    chipB.forEach((b, i) => b.classList.toggle('on', i === sc));
    slLab.textContent = SCEN[sc].lab;
    ty.setAttribute('aria-label', SCEN[sc].t);
    apply.querySelectorAll('.rl>span').forEach(x => x.textContent = 'Apply to my plan');
    bn2.className = 'num ' + (SCEN[sc].bal >= 74 ? 'up' : 'dn');
  }

  chipB.forEach((b, i) => {
    b.onclick = () => {
      sc = i;
      buildCards(i);
      liveT = performance.now();
      afterSc();
    };
  });

  /* water tubes + electric bolt */
  const npinE = root.querySelector('#nightpin') as HTMLElement;
  let bolt = brs.querySelector('.bolt') as HTMLCanvasElement;
  if (!bolt) {
    bolt = document.createElement('canvas');
    bolt.className = 'bolt';
    brs.appendChild(bolt);
  }
  let NV = false;
  const hexA = (h: string, a: number) => {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  };

  function water(r: any, cur: number, now: number, tg: number, vp: number) {
    if (!NV) return;
    const cv = r.cv, dpr = Math.min(2, window.devicePixelRatio || 1), W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    if (cv._w !== W || cv._h !== H) {
      cv.width = W * dpr; cv.height = H * dpr; cv._w = W; cv._h = H;
    }
    const g = cv.getContext('2d'), tm = performance.now() / 1000, X = cur / 100 * W, Xn = now / 100 * W, rad = H / 2, act = vp > .02 && vp < .98 && !RM, amp = (act ? 3.4 : 1.7) * (RM ? 0 : 1) + .01;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const rr = () => {
      g.beginPath();
      g.roundRect ? g.roundRect(0, 0, W, H, rad) : g.rect(0, 0, W, H);
    };
    const wave = (xe: number, ph: number, a: number) => {
      g.beginPath(); g.moveTo(0, 0); g.lineTo(xe, 0);
      for (let y = 0; y <= H; y += 1.5) g.lineTo(xe + Math.sin(y * .6 + tm * 3 + ph) * a + Math.sin(y * .23 - tm * 2) * a * .5, y);
      g.lineTo(0, H); g.closePath();
    };
    g.save(); rr(); g.clip(); g.fillStyle = 'rgba(246,243,236,.09)'; g.fillRect(0, 0, W, H);
    const xe = Math.max(2, X), gr = g.createLinearGradient(0, 0, xe, 0); gr.addColorStop(0, hexA(r.col, .55)); gr.addColorStop(1, hexA(r.col, .98));
    wave(xe, 0, amp); g.fillStyle = gr; g.fill();
    if (X > Xn + 1) {
      g.save(); g.beginPath(); g.rect(Xn, 0, X - Xn + 10, H); g.clip(); wave(xe, 0, amp); g.fillStyle = 'rgba(255,255,255,.36)'; g.fill(); g.restore();
    } else if (X < Xn - 1) {
      g.fillStyle = hexA('#FFC1B0', .55); g.fillRect(X + 2, 0, Xn - X - 2, H);
    }
    wave(xe - 4, 1.7, amp * .8); g.fillStyle = 'rgba(255,255,255,.12)'; g.fill();
    g.beginPath();
    for (let y = 0; y <= H; y += 1.5) {
      const x = xe + Math.sin(y * .6 + tm * 3) * amp + Math.sin(y * .23 - tm * 2) * amp * .5;
      y ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.3; g.stroke();
    r.bub.forEach((b: any) => {
      if (!RM) { b.y -= b.s * .006; if (b.y < -.1) b.y = 1.1; }
      const bx = b.x * W + Math.sin(tm * 2 + b.ph) * 2;
      if (bx < xe - 6) { g.beginPath(); g.arc(bx, b.y * H, b.r, 0, 7); g.fillStyle = 'rgba(255,255,255,.42)'; g.fill(); }
    });
    const gl = g.createLinearGradient(0, 0, 0, H); gl.addColorStop(0, 'rgba(255,255,255,.36)'); gl.addColorStop(.45, 'rgba(255,255,255,.05)'); gl.addColorStop(1, 'rgba(0,0,0,.2)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
    if (act) {
      const y0 = H / 2, xs = Math.min(Xn, X);
      for (let q = 0; q < 2; q++) {
        g.beginPath(); g.moveTo(xs - 6, y0);
        for (let x = xs; x <= xe + 6; x += 7) g.lineTo(x, y0 + (Math.random() - .5) * H * .9);
        g.lineTo(xe + 7, y0);
        g.strokeStyle = q ? 'rgba(255,255,255,.95)' : hexA(r.col, .95);
        g.lineWidth = q ? 1.1 : 2.6; g.shadowColor = '#fff'; g.shadowBlur = q ? 6 : 12; g.stroke();
      }
      g.shadowBlur = 0;
      for (let q = 0; q < 5; q++) {
        const a = Math.random() * 6.28, l = 3 + Math.random() * 7;
        g.beginPath(); g.moveTo(xe, y0); g.lineTo(xe + Math.cos(a) * l, y0 + Math.sin(a) * l); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1; g.stroke();
      }
    }
    g.restore(); g.fillStyle = 'rgba(246,243,236,.95)'; g.fillRect(Math.max(0, Xn - 1), 1, 2, H - 2); rr(); g.strokeStyle = 'rgba(246,243,236,.22)'; g.lineWidth = 1; g.stroke();
  }

  function drawBolt(rk: number, u: number, rh: number) {
    const dpr = Math.min(2, window.devicePixelRatio || 1), Wc = bolt.clientWidth, Hc = bolt.clientHeight;
    if (!Wc || !Hc) return;
    if (bolt._w !== Wc || bolt._h !== Hc) {
      bolt.width = Wc * dpr; bolt.height = Hc * dpr; bolt._w = Wc; bolt._h = Hc;
    }
    const g = bolt.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, Wc, Hc);
    if (!NV || RM || rk <= 0 || rk >= 1) return;
    const x0 = 17, yE = Math.min(u, 5) * rh + rh / 2, yS = Math.max(0, yE - rh * 1.5);
    for (let q = 0; q < 2; q++) {
      g.beginPath(); g.moveTo(x0, yS);
      for (let y = yS; y <= yE; y += 8) g.lineTo(x0 + (Math.random() - .5) * (q ? 10 : 16), y);
      g.lineTo(x0, yE);
      g.strokeStyle = q ? 'rgba(255,255,255,.95)' : 'rgba(166,240,255,.85)';
      g.lineWidth = q ? 1.2 : 3; g.shadowColor = '#A6F0FF'; g.shadowBlur = q ? 6 : 14; g.stroke();
    }
    g.shadowBlur = 0;
    for (let q = 0; q < 6; q++) {
      const a = Math.random() * 6.28, l = 4 + Math.random() * 10;
      g.beginPath(); g.moveTo(x0, yE); g.lineTo(x0 + Math.cos(a) * l, yE + Math.sin(a) * l); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1; g.stroke();
    }
  }

  const fclock = (m: number) => {
    m = ((Math.round(m) % 1440) + 1440) % 1440;
    let h = Math.floor(m / 60), mm = m % 60;
    const ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `${h}:${String(mm).padStart(2, '0')} ${ap}`;
  };
  const slrE = root.querySelector('#slr') as HTMLElement, sbed = root.querySelector('#sbed') as HTMLElement;

  function night(p: number) {
    if (liveT !== null && p < .9) {
      liveT = null;
      if (sc) { sc = 0; buildCards(0); afterSc(); }
    }
    const nr = npinE.getBoundingClientRect();
    NV = nr.top < window.innerHeight && nr.bottom > 0;
    const lp = liveT === null ? 0 : clamp((performance.now() - liveT) / 3000), pe = liveT === null ? p : .2 + .6 * lp, S0 = SCEN[sc], SM = S0.sim;
    nin.style.transform = `scale(${Math.min(1, (ncE.clientHeight - 48) / nin.offsetHeight)})`;
    const e = ease(clamp(p / .16)), hk = ease(clamp((p - .1) / .1));
    nw.style.clipPath = `circle(${lerp(0, 150, e)}% at 50% 64%)`; nhs.style.transform = `translateY(${(1 - hk) * 115}%)`;
    const tp = clamp((pe - .2) / .14); ty.textContent = S0.t.slice(0, Math.floor(tp * S0.t.length)); nrow.style.opacity = clamp((pe - .18) / .04);
    const sk = ease(clamp((pe - .34) / .08)); knob.style.left = lerp(34, 64, sk) + '%'; fillE.style.width = lerp(34, 64, sk) + '%'; sl.textContent = S0.fmt(lerp(S0.fr, S0.to, sk)); slrE.dataset.k = S0.lab; sbed.textContent = S0.lab === 'Sleep' ? 'Bedtime ' + fclock(420 - lerp(S0.fr, S0.to, sk)) : '';
    const rk = clamp((pe - .42) / .34), u = rk * 5.9, rh = rowsE[0].e.offsetHeight || 48, V: number[] = [];
    rowsE.forEach((r, j) => {
      const ap = ease(clamp((pe - .28 - j * .012) / .06)), vp = ease(clamp((u - j) / .9)), now = SCORE[r.d], tg = SM[r.d], cur = lerp(now, tg, vp), df = tg - now; V[j] = vp;
      r.e.style.opacity = ap; r.e.style.transform = `translateY(${(1 - ap) * 12}px)`;
      water(r, cur, now, tg, vp); r.bv.textContent = String(Math.round(cur));
      r.dl.textContent = df ? (vp > .5 ? (df > 0 ? '+' : '−') + Math.abs(df) : '') : (ap > .9 ? '–' : ''); r.dl.classList.toggle('neg', df < 0); r.dl.style.opacity = df ? clamp((vp - .4) / .4) : ap * .5;
      r.nd.style.transform = `scale(${.6 + .6 * vp})`; r.nd.style.opacity = .35 + .65 * vp;
    });
    rail.style.transform = `scaleY(${clamp(u / 5)})`; drawBolt(rk, u, rh); pls.style.transform = `translateY(${Math.min(u, 5) * rh}px)`; pls.style.opacity = rk > 0 && rk < 1 ? 1 : 0;
    status.style.opacity = clamp((pe - .36) / .03) * (liveT === null && p > .9 ? 0 : 1); status.classList.toggle('done', pe > .78); status.textContent = pe > .78 ? '✓ Estimate ready' : 'Simulating…';
    nks.forEach(n => {
      const dl = +n.dataset.dl || 0, k = clamp((V[+n.dataset.row] - dl) / (1 - dl)), o = clamp(k * 3);
      n.style.opacity = o; n.style.transform = `translateY(${(1 - o) * 18}px)`;
      if (k > .04 && !n._f) { n._f = 1; n.classList.add('fire'); setTimeout(() => n.classList.remove('fire'), 1300); }
      if (k <= .01) n._f = 0;
      n.classList.toggle('live', k > .6); n._ed.style.opacity = k > .95 ? 1 : 0;
      n._st.forEach((st: HTMLElement, i: number) => st.style.transform = `translateY(${-n._dig[i] * ease(k)}em)`); n._sp.style.strokeDashoffset = 1 - k;
    });
    nnote.style.opacity = clamp((p - .3) / .1);
    const sg = liveT === null ? ease(clamp((p - .76) / .08)) : ease(clamp((pe - .7) / .1)); stat.style.opacity = sg; bn2.textContent = String(Math.round(lerp(74, S0.bal, sg)));
    const ab = clamp((p - .82) / .05); apply.style.opacity = ab; apply.style.pointerEvents = ab > .5 ? 'auto' : 'none';
    const cb = clamp((p - .86) / .05); chipsE.style.opacity = cb; chipsE.style.pointerEvents = cb > .5 ? 'auto' : 'none';
  }

  apply.onclick = (e: MouseEvent) => {
    e.preventDefault();
    apply.querySelectorAll('.rl>span').forEach(x => x.textContent = 'Added to today ✓');
    if (RM) {
      window.location.href = '/onboarding';
      return;
    }
    const r = apply.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 22; i++) {
      const d = document.createElement('i'), a = Math.random() * Math.PI * 2, dist = 70 + Math.random() * 90, k = D[i % 6][0].toLowerCase();
      d.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:8px;height:8px;border-radius:${i % 2 ? '50%' : '2px'};background:var(--${k});pointer-events:none;z-index:60`;
      root.appendChild(d);
      d.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * dist}px,${Math.sin(a) * dist - 30}px) scale(.3) rotate(${Math.random() * 360}deg)`, opacity: 0 }
      ], {
        duration: 800 + Math.random() * 300,
        easing: 'cubic-bezier(.22,1,.36,1)'
      }).onfinish = () => d.remove();
    }
    setTimeout(() => {
      if (!cancelled) {
        window.location.href = '/onboarding';
      }
    }, 450);
  };

  /* hero balance card */
  const hx = $('#hx'), dash = $('#dash'), card = $('#c2'), ringS = $('#ring'), rn = $('#rn'), lg = $('#lg');
  ringS.innerHTML = '';
  const arcs = D.map((d, i) => mk('circle', { cx: 0, cy: 0, fill: 'none', style: `stroke:var(--${d[0].toLowerCase()});transition:opacity .25s` }, ringS));
  
  lg.innerHTML = '';
  D.forEach((d, i) => {
    const li = document.createElement('li'), k = d[0].toLowerCase();
    li.innerHTML = `<i style="background:var(--${k}d)"></i>${d[0]}<span class="num">${SCORE[i]}</span>`;
    lg.appendChild(li);
    li.onmouseenter = () => setHv(i);
    li.onmouseleave = () => setHv(-1);
    arcs[i].onmouseenter = () => setHv(i);
    arcs[i].onmouseleave = () => setHv(-1);
  });
  let hvi = -1;
  function setHv(i: number) {
    hvi = i;
    arcs.forEach((a, j) => a.style.opacity = i < 0 || i === j ? 1 : .25);
    [...lg.children].forEach((l: HTMLElement, j) => {
      l.classList.toggle('on', i === j);
      l.style.opacity = i < 0 || i === j ? 1 : .5;
    });
  }

  let t0 = 0;
  const onPointerMove = (e: PointerEvent) => {
    hx.style.setProperty('--mx', e.clientX + 'px');
    hx.style.setProperty('--my', (e.clientY + window.scrollY) + 'px');
    const r = dash.getBoundingClientRect(), px = clamp((e.clientX - r.left) / r.width), py = clamp((e.clientY - r.top) / r.height);
    if (!RM) {
      card.style.transform = `rotateY(${(px - .5) * 12}deg) rotateX(${((.5 - py) * 10)}deg)`;
      card.style.setProperty('--gx', px * 100 + '%');
      card.style.setProperty('--gy', py * 100 + '%');
    }
  };

  if (window.matchMedia('(pointer:fine)').matches && !RM) {
    window.addEventListener('pointermove', onPointerMove);
  }

  function heroOrbit(t: number) {
    if (!t0) t0 = t;
    const pr = RM ? 1 : ease(clamp((t - t0 - 900) / 1500));
    D.forEach((d, i) => {
      const th = 12 + SCORE[i] * .3 * pr, r = 108 - th / 2, C = 2 * Math.PI * r, seg = (54 / 360) * C * pr, a = arcs[i];
      a.setAttribute('r', r);
      a.setAttribute('stroke-width', th);
      a.setAttribute('stroke-dasharray', `${seg} ${C}`);
      a.setAttribute('transform', `rotate(${-90 + i * 60 + 3})`);
    });
    rn.textContent = String(Math.round(74 * pr));
  }

  const prog = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (el.offsetHeight - window.innerHeight));
  };
  const A = $('#pin'), B = $('#nightpin'), bar = $('#bar');
  let c1 = 0, c2 = 0, lastY = 0;
  let rafFrame: number;

  function frame(t: number) {
    if (cancelled) return;
    const t1 = RM ? 1 : prog(A), t2 = RM ? 1 : prog(B);
    c1 += (t1 - c1) * (RM ? 1 : .14);
    c2 += (t2 - c2) * (RM ? 1 : .14);
    draw(c1, t);
    night(c2);
    {
      const y = window.scrollY;
      bar.classList.toggle('on', (y > window.innerHeight * .6 && y < lastY) || (y > window.innerHeight * .6 && y < window.innerHeight * 1.2));
      lastY = y;
    }
    heroOrbit(t);
    rafFrame = requestAnimationFrame(frame);
  }
  rafFrame = requestAnimationFrame(frame);

  /* ---- v4 additions ---- */
  const pSub = $('#hsub');
  const originalHsubText = pSub.getAttribute('data-orig') || pSub.textContent;
  pSub.setAttribute('data-orig', originalHsubText);
  pSub.setAttribute('aria-label', originalHsubText);
  pSub.innerHTML = originalHsubText.split(' ').map((w: string, i: number) => `<span class="w" aria-hidden="true" style="--i:${i}">${w}</span> `).join('');

  const goHero = () => {
    if (cancelled) return;
    hx.classList.add('in');
    $('#hh1').classList.add('in');
  };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => setTimeout(goHero, 150));
  } else {
    goHero();
  }

  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .25 });
  root.querySelectorAll('.ac,#fin,.pg,.ddg').forEach(el => io.observe(el));

  const sp = $('#sp'), tog = $('#tog'), tl = $('#tl');
  const onScroll = () => {
    sp.style.transform = `scaleX(${clamp(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight))})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  tog.onclick = () => {
    RM = !RM;
    root.classList.toggle('rm', RM);
    tog.setAttribute('aria-checked', RM);
    tl.textContent = RM ? 'On' : 'Off';
    try {
      useLifeStore.getState().updateSetting('reducedMotion', RM ? 'on' : 'off');
    } catch {}
  };
  if (RM) {
    tog.setAttribute('aria-checked', true);
    tl.textContent = 'On';
  }

  const btnMoveHandlers: Array<{ el: HTMLElement; move: (e: any) => void; leave: () => void }> = [];
  if (window.matchMedia('(pointer:fine)').matches) {
    root.querySelectorAll('.btn').forEach(b => {
      const move = (e: PointerEvent) => {
        if (RM) return;
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      };
      const leave = () => b.style.transform = '';
      b.addEventListener('pointermove', move);
      b.addEventListener('pointerleave', leave);
      btnMoveHandlers.push({ el: b, move, leave });
    });
  }

  /* day designer */
  let rafDay: number;
  {
    const Q = (id: string) => root.querySelector('#' + id) as HTMLElement;
    const inS = Q('inS') as HTMLInputElement, inT = Q('inT') as HTMLInputElement, inM = Q('inM') as HTMLInputElement;
    const dsv = Q('dsv') as SVGElement, dfree = Q('dfree'), dnote = Q('dnote'), dcE = root.querySelector('.dc') as HTMLElement, mini = Q('mini'), dins = Q('dins');
    const fh = (h: number) => `${Math.floor(h + 1e-6)}h ${String(Math.round((h % 1) * 60) % 60).padStart(2, '0')}m`;
    const R = 130, C = 2 * Math.PI * R, deg = (h: number) => h / 24 * 360 - 90;
    
    dsv.innerHTML = '';
    const calc = (sl: number, st: number, mv: number) => {
      const f = 24 - (sl + 5 + st + mv / 60), over = Math.max(0, -f), cl = (x: number) => Math.max(10, Math.min(99, x));
      const Study = cl((st < 3 ? 82 - (3 - st) * 9 : st <= 6 ? 82 + (st - 3) * 4.5 : 95.5 - (st - 6) * 4) - over * 5);
      const Sleep = cl(sl <= 8.5 ? 61 + (sl - 6.7) * 14 : 86.2 - (sl - 8.5) * 12);
      const Focus = cl(84 + (sl - 6.7) * 9 + (Math.min(mv, 60) - 30) / 30 * 3 - Math.max(0, st - 5) * 6 - over * 6);
      const Health = cl(60 + mv * .27);
      const Money = 74;
      const Goals = cl(79 + (Study - 82) * .25 + (Focus - 84) * .2);
      const v = [Study, Focus, Health, Sleep, Money, Goals];
      return { v, free: Math.max(0, f), over, bal: Math.floor(v.reduce((a, b) => a + b, 0) / 6), ready: Math.max(10, Math.round(.5 * Study + .3 * Focus + .2 * Sleep - over * 6)) };
    };
    const BASE = calc(6.7, 3, 30);
    mk('circle', { r: R, fill: 'none', stroke: '#EAE5D8', 'stroke-width': 30 }, dsv);
    for (let h = 0; h < 24; h++) {
      const a = h / 24 * 2 * Math.PI - Math.PI / 2, r1 = R + 20, r2 = R + (h % 6 ? 24 : 30);
      mk('line', { x1: Math.cos(a) * r1, y1: Math.sin(a) * r1, x2: Math.cos(a) * r2, y2: Math.sin(a) * r2, stroke: 'rgba(21,23,28,.35)', 'stroke-width': h % 6 ? 1 : 1.6 }, dsv);
    }
    [['12a', 0], ['6a', 6], ['12p', 12], ['6p', 18]].forEach(([t, h]) => {
      const a = h / 24 * 2 * Math.PI - Math.PI / 2, x = mk('text', { x: Math.cos(a) * (R + 44), y: Math.sin(a) * (R + 44) + 4, 'text-anchor': 'middle', style: 'font:500 12px var(--font-inter),sans-serif;fill:#5B606B' }, dsv);
      x.textContent = t;
    });
    const COL = ['var(--sleep)', '#D9D3C4', 'var(--study)', 'var(--health)', '#D9D3C4', '#FFFFFF'];
    const segs = COL.map(c => {
      const e = mk('circle', { r: R, class: 'sg2', stroke: c }, dsv);
      if (c === '#FFFFFF') { e.setAttribute('stroke', '#fff'); e.style.opacity = .95; }
      return e;
    });
    const over = mk('circle', { r: R + 14, fill: 'none', stroke: '#A33A20', 'stroke-width': 3, 'stroke-dasharray': '6 6', opacity: 0, style: 'transition:opacity .4s' }, dsv);
    const marker = (ico: string, col: string) => {
      const g = mk('g', { class: 'mk2' }, dsv);
      mk('circle', { r: 15, fill: '#fff', stroke: col, 'stroke-width': 2 }, g);
      const i = mk('g', { transform: 'translate(-9 -9) scale(.75)', fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      i.innerHTML = ico;
      return g;
    };
    const SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
    const wake = marker(SUN, '#8A5A00'), bed = marker(ICON.Sleep, '#4B3A9A');
    const pos = (h: number) => {
      const a = h / 24 * 2 * Math.PI - Math.PI / 2;
      return `translate(${Math.cos(a) * R}px,${Math.sin(a) * R}px)`;
    };
    wake.style.transform = pos(7);

    mini.innerHTML = D.map((d, i) => `<div class="mi"><div><span>${d[0]}</span><b></b></div><div class="mb"><i style="background:var(--${d[0].toLowerCase()}d)"></i></div><small></small></div>`).join('');
    const mis = [...mini.children].map(e => ({ b: e.querySelector('b'), i: e.querySelector('.mb i'), d: e.querySelector('small') }));
    const rring = Q('rring'), rnum = Q('rnum'), rlab = Q('rlab');
    const setP = (el: HTMLInputElement) => el.style.setProperty('--p', (Number(el.value) - Number(el.min)) / (Number(el.max) - Number(el.min)) * 100 + '%');

    function upd() {
      const sl = +inS.value, st = +inT.value, mv = +inM.value, r = calc(sl, st, mv);
      [inS, inT, inM].forEach(setP);
      Q('outS').textContent = fh(sl);
      Q('outT').textContent = fh(st);
      Q('outM').textContent = mv + ' min';
      const bedH = (7 - sl + 24) % 24;
      const seq = [[bedH, sl], [7, 2], [9, st], [9 + st, mv / 60], [9 + st + mv / 60, 3], [9 + st + mv / 60 + 3, r.free]];
      seq.forEach(([a, l], i) => {
        const e = segs[i], len = Math.max(0, l - (l > .3 ? .14 : 0)), st0 = a + (l > .3 ? .07 : 0);
        e.style.strokeDasharray = `${len / 24 * C} ${C}`;
        e.style.transform = `rotate(${deg(st0)}deg)`;
      });
      bed.style.transform = pos(bedH);
      over.setAttribute('opacity', r.over > 0 ? 1 : 0);
      dfree.textContent = r.over > 0 ? 'Over by ' + fh(r.over) : fh(r.free);
      dnote.textContent = r.over > 0 ? 'something has to give' : 'per day';
      dcE.classList.toggle('over', r.over > 0);
      rring.style.strokeDashoffset = String(301.6 * (1 - r.ready / 100));
      rnum.textContent = String(r.ready);
      rlab.textContent = r.ready >= 85 ? 'Strong' : r.ready >= 72 ? 'On track' : 'Needs work';
      r.v.forEach((x, i) => {
        const dl = Math.round(x) - Math.round(BASE.v[i]);
        mis[i].b.textContent = String(Math.round(x));
        mis[i].i.style.width = x + '%';
        mis[i].d.textContent = dl ? (dl > 0 ? '+' : '−') + Math.abs(dl) + ' vs today' : 'same as today';
        mis[i].d.className = dl < 0 ? 'dn' : '';
      });
      let tText: string, cClass = '';
      if (r.over > 0) {
        tText = `That's ${fh(24 + r.over)} in a 24-hour day. Something has to give, and it will be sleep or focus.`;
        cClass = 'warn';
      } else if (sl < 6) {
        tText = 'Under 6 hours of sleep: focus falls fast and exam recall suffers.';
        cClass = 'warn';
      } else if (st > 6) {
        tText = 'Past 6 hours of study the gains shrink. Protect sleep and a short walk.';
        cClass = 'warn';
      } else if (sl >= 7.5 && st >= 3 && mv >= 20) {
        tText = 'A balanced day: strong exam readiness without burning out.';
        cClass = 'good';
      } else {
        tText = 'Move a slider and watch which areas pay for it.';
      }
      dins.textContent = tText;
      dins.className = 'dins ' + cClass;
    }

    [inS, inT, inM].forEach(e => e.addEventListener('input', upd));

    const go = (a: number, b: number, c: number) => {
      cancelAnimationFrame(rafDay);
      const f = [+inS.value, +inT.value, +inM.value], t0 = performance.now();
      if (RM) {
        inS.value = String(a); inT.value = String(b); inM.value = String(c);
        upd();
        return;
      }
      const step = (t: number) => {
        if (cancelled) return;
        const k = ease(clamp((t - t0) / 900));
        inS.value = String(lerp(f[0], a, k));
        inT.value = String(lerp(f[1], b, k));
        inM.value = String(lerp(f[2], c, k));
        upd();
        if (k < 1) rafDay = requestAnimationFrame(step);
      };
      rafDay = requestAnimationFrame(step);
    };

    Q('dbest').onclick = () => go(7.8, 4, 40);
    Q('dreset').onclick = () => go(6.7, 3, 30);
    upd();
  }

  /* finale: scroll-scrub words, magnetic orbit CTA, curtain footer */
  let rafLoop: number;
  {
    const fls = [...root.querySelectorAll('.fw')], ft = $('#ft'), wm = $('#wm'), ftc = $('#ftc'), octa = $('#octa'), orb2 = $('#orb2');
    const totop = $('#totop');
    if (totop) {
      totop.onclick = () => window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
    }

    const onOctaMove = (e: PointerEvent) => {
      if (RM) return;
      const r = octa.getBoundingClientRect();
      orb2.style.translate = `${(e.clientX - r.left - r.width / 2) * .28}px ${(e.clientY - r.top - r.height / 2) * .28}px`;
    };
    const onOctaLeave = () => orb2.style.translate = '';

    if (window.matchMedia('(pointer:fine)').matches) {
      octa.addEventListener('pointermove', onOctaMove);
      octa.addEventListener('pointerleave', onOctaLeave);
    }

    function loop() {
      if (cancelled) return;
      const vh = window.innerHeight;
      fls.forEach(f => {
        const r = f.getBoundingClientRect(), t = RM ? 1 : ease(clamp((vh * .8 - r.top) / (vh * .3)));
        f.style.setProperty('--t', t);
        f.style.color = `rgba(21,23,28,${lerp(.14, 1, t)})`;
      });
      const dist = document.documentElement.scrollHeight - (window.scrollY + vh), h = ft.offsetHeight || 1, r = clamp(1 - dist / h);
      ft.style.visibility = r > 0 ? 'visible' : 'hidden';
      wm.style.transform = `translateY(${(1 - ease(r)) * 38}%)`;
      ftc.style.opacity = clamp((r - .25) / .5);
      rafLoop = requestAnimationFrame(loop);
    }
    rafLoop = requestAnimationFrame(loop);
  }

  // Cleanup function returned for useEffect
  return () => {
    cancelled = true;
    cancelAnimationFrame(rafFrame);
    cancelAnimationFrame(rafLoop);
    cancelAnimationFrame(rafDay);
    clearTimeout(headTimeout);

    window.removeEventListener('scroll', onScroll);
    if (window.matchMedia('(pointer:fine)').matches) {
      window.removeEventListener('pointermove', onPointerMove);
    }
    pointerMoveHandlers.forEach(({ el, fn }) => el.removeEventListener('pointermove', fn));
    btnMoveHandlers.forEach(({ el, move, leave }) => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    });

    io.disconnect();
    stageAppended.forEach(el => el.remove());
    root.classList.remove('rm');
  };
}
