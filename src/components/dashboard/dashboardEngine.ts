// @ts-nocheck
/* eslint-disable */

import { useLifeStore } from '@/store/lifeStore';

export interface InitDashboardOptions {
  name?: string;
  scores?: Record<string, number>;
  onApplyPlan?: (dims: Record<string, number>) => void;
}

export function initDashboard(root: HTMLElement, opts: InitDashboardOptions = {}): () => void {
  let cancelled = false;
  let fraf = 0;
  let toastT: any = null;
  let bootT: any = null;
  let stepsInterval: any = null;
  let focusInterval: any = null;
  let resizeObserver: ResizeObserver | null = null;

  const $ = (s: string) => root.querySelector(s);
  const $$ = (s: string) => [...root.querySelectorAll(s)];

  const reduced = () =>
    matchMedia('(prefers-reduced-motion: reduce)').matches ||
    root.dataset.calm === '1' ||
    useLifeStore.getState().settings.reducedMotion === 'on';

  /* ───────── icons ───────── */
  const ICON = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    study: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2.5 9 2.5 12 0v-5"/>',
    focus: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    health: '<path d="M12 20.5s-7.5-4.6-9.3-10C1.6 7 3.8 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.200 0 5.400 3 4.300 6.500-1.800 5.400-9.300 10-9.300 10z"/>',
    heart: '<path d="M12 20.5s-7.5-4.6-9.3-10C1.6 7 3.8 4 7 4c2 0 3.500 1 5 3 1.500-2 3-3 5-3 3.200 0 5.400 3 4.300 6.500-1.800 5.400-9.300 10-9.300 10z"/>',
    sleep: '<path d="M20.500 14.500A8.500 8.500 0 0 1 9.500 3.500 8.500 8.500 0 1 0 20.500 14.500z"/>',
    money: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.700 3.600 3 8 3s8-1.300 8-3V6"/><path d="M4 12v6c0 1.700 3.600 3 8 3s8-1.300 8-3v-6"/>',
    goals: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.400"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    steps: '<path d="M7.500 3c2 0 3 2 3 5s-1 4-2.500 4S5.500 10.500 5.500 8 6 3 7.500 3z"/><path d="M8 15.500h2.500V18a1.300 1.300 0 0 1-2.500 0z"/><path d="M16.500 9c2 0 3 2 3 5s-1 4-2.500 4-2.500-1.500-2.500-4 .5-5 2-5z"/><path d="M17 20h2.500"/>',
    check: '<rect x="3" y="3" width="18" height="18" rx="4.500"/><path d="m8 12.200 3 3 5-6"/>',
    calm: '<circle cx="12" cy="4.500" r="1.800"/><path d="M5 8.500l7 1.500 7-1.500M12 10v5M12 15l-3 6M12 15l3 6"/>',
    moon: '<path d="M20.500 14.500A8.500 8.500 0 0 1 9.500 3.500 8.500 8.500 0 1 0 20.500 14.500z"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flame: '<path d="M12 22c4.200 0 7-2.800 7-6.800 0-3.200-2-5.400-3.600-7.400-.4 2-1.400 3.200-2.900 3.200.3-3.500-1.200-6.800-4.500-9-.2 3.200-3 5.200-3 9.200 0 6 3.800 10.800 7 10.800z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.500-3.500"/>',
    spark: '<path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800z"/><path d="M19 17v4M17 19h4"/>',
    cal: '<rect x="3.500" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.500 10h17"/>',
  };
  const ic = (n: string, sz = 18, sw = 1.8) =>
    `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;

  /* ───────── data ───────── */
  const DIMS = [
    { k: 'study', name: 'Study', angle: -90, orb: 'study', nav: 'study' },
    { k: 'focus', name: 'Focus', angle: -30, orb: 'sun', nav: 'focus' },
    { k: 'health', name: 'Health', angle: 30, orb: 'heart', nav: 'health' },
    { k: 'sleep', name: 'Sleep', angle: 90, orb: 'sleep', nav: 'sleep' },
    { k: 'money', name: 'Money', angle: 150, orb: 'money', nav: 'money' },
    { k: 'goals', name: 'Goals', angle: 210, orb: 'goals', nav: 'goals' },
  ];

  const BASE = opts.scores || { study: 82, focus: 84, health: 68, sleep: 61, money: 74, goals: 79 };
  const NOTES = {
    study: '<b>Study · strong.</b> Your Marketing exam is in 3 days. Two focused hours a day keeps you on track.',
    focus: '<b>Focus · your best dimension.</b> It peaks between 9 and 11 AM, so protect that window.',
    health: '<b>Health · steady.</b> You’re at 60% of today’s steps. A 20-minute walk closes most of the gap.',
    sleep: '<b>Sleep · needs attention.</b> You got 6h 42m against a 7h 30m goal. It’s the one pulling the rest down.',
    money: '<b>Money · on plan.</b> Spending is tracking inside this month’s budget.',
    goals: '<b>Goals · on track.</b> Your weekly goal is 72% complete with two days still to go.',
  };
  const DEFAULT_NOTE = 'Six dimensions. One connected life. Select any of them to spotlight it.';
  const state = { dims: { ...BASE }, spot: null, view: 'orbit', hover: null, intro: true };
  const plan = { sleep: 0, study: 0, steps: 0 };

  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  function balance(d: Record<string, number>) {
    const v = DIMS.map((m) => d[m.k]);
    const mu = mean(v);
    const sd = Math.sqrt(mean(v.map((x) => (x - mu) ** 2)));
    return Math.round(mu - 0.1 * sd);
  }
  const weakest = (d: Record<string, number>) => DIMS.reduce((a, m) => (d[m.k] < d[a.k] ? m : a), DIMS[0]);
  const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

  function animateNum(el: HTMLElement | null, to: number, ms = 1100, fmt = (v: number) => String(Math.round(v))) {
    if (!el) return;
    const from = parseFloat(el.dataset.v || '0');
    el.dataset.v = String(to);
    if (reduced()) {
      el.textContent = fmt(to);
      return;
    }
    const t0 = performance.now();
    (function f(t) {
      if (cancelled) return;
      const p = Math.min(1, (t - t0) / ms),
        e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }

  function toast(msg: string) {
    const t = $('#db-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => {
      if (t) t.classList.remove('on');
    }, 3200);
  }

  /* ───────── header / chrome ───────── */
  const userName = opts.name || 'Alex';
  const now = new Date(),
    h = now.getHours();
  const dateEl = $('#db-dateEl');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const greet = $('#db-greet');
  if (greet) greet.textContent = `Good ${h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'}, ${userName}.`;
  const calmBtn = $('#db-calmBtn');
  if (calmBtn) calmBtn.innerHTML = ic('calm', 20);
  const askBtn = $('#db-askBtn');
  if (askBtn)
    askBtn.innerHTML = `${ic('search', 17)}<span>Ask LifeOS or run a command</span><kbd>${
      typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '') ? '⌘K' : 'Ctrl K'
    }</kbd>`;
  const drClose = $('#db-drClose');
  if (drClose) drClose.innerHTML = ic('x', 20);
  const ctaArr = $('#db-ctaArr');
  if (ctaArr) ctaArr.innerHTML = ic('arrow', 16, 2);
  const bestIc = $('#db-bestIc');
  if (bestIc) bestIc.innerHTML = ic('sun', 22);
  const sideCard = $('#db-sideCard');
  if (sideCard)
    sideCard.innerHTML = `${ic('clock', 22, 1.5)}<p>Your life works better together.</p><hr><small>LIFEOS</small><small>Your life, in one clear view.</small>`;

  const themeBtn = $('#db-themeBtn');
  const dark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);
  const setIcon = () => {
    if (themeBtn) themeBtn.innerHTML = ic(dark() ? 'sun' : 'moon', 20);
  };
  setIcon();

  if (themeBtn) {
    themeBtn.onclick = () => {
      root.dataset.theme = dark() ? 'light' : 'dark';
      setIcon();
    };
  }

  if (calmBtn) {
    calmBtn.onclick = (e) => {
      const on = root.dataset.calm !== '1';
      if (on) root.dataset.calm = '1';
      else delete root.dataset.calm;
      (e.currentTarget as HTMLElement).setAttribute('aria-pressed', String(on));
      toast(on ? 'Calm mode on: motion off, contrast up.' : 'Calm mode off.');
    };
  }

  /* ───────── nav ───────── */
  function renderNav() {
    const nav = $('#db-nav');
    if (!nav) return;
    const items = [{ k: 'home', name: 'Home', nav: 'home' }, ...DIMS];
    nav.innerHTML = items
      .map((m) => {
        const on = (state.spot || 'home') === m.k;
        return `<button class="nav-i${on ? ' on' : ''}" data-k="${m.k}" style="--c:var(--${
          m.k === 'home' ? 'ink' : m.k
        })" ${on ? 'aria-current="page"' : ''}>${ic(m.nav, 20)}<span>${m.name}</span><i class="dot"></i></button>`;
      })
      .join('');
  }

  const onNavClick = (e: MouseEvent) => {
    const b = (e.target as Element).closest('.nav-i') as HTMLElement;
    if (!b) return;
    spotlight(b.dataset.k === 'home' ? null : b.dataset.k);
    if (b.dataset.k !== 'home') {
      $('#db-orbitWrap')?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
    }
  };
  $('#db-nav')?.addEventListener('click', onNavClick);

  function spotlight(k: string | null) {
    state.spot = state.spot === k ? null : k;
    renderNav();
    renderOrbit();
    renderList();
    setNote();
    syncSpot();
  }

  /* ───────── orbit ───────── */
  function renderOrbit() {
    const ow = $('#db-orbitWrap');
    if (!ow) return;
    const cx = 320,
      cy = 200,
      R = 148,
      d = state.dims,
      weak = weakest(d).k;
    const P = (a: number) => [cx + R * Math.cos((a * Math.PI) / 180), cy + R * Math.sin((a * Math.PI) / 180)];
    const calm = reduced();
    let s = `<svg viewBox="60 0 520 400" role="group" aria-label="Life orbit: six dimensions around you" class="${
      state.intro ? 'intro' : ''
    }${state.spot ? ' has-spot' : ''}">
    <defs><filter id="db-blur" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="9"/></filter></defs>
    ${stars()}<circle class="ring" cx="${cx}" cy="${cy}" r="62"/><circle class="ring" cx="${cx}" cy="${cy}" r="106"/>
    <circle class="ring dash spin" cx="${cx}" cy="${cy}" r="${R}"/><circle class="ring" cx="${cx}" cy="${cy}" r="190" opacity=".6"/>`;
    DIMS.forEach((m, i) => {
      const [x, y] = P(m.angle);
      s += `<line class="spoke" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`;
      if (!calm) {
        s += `<circle r="2.6" fill="var(--${m.k})"><animateMotion dur="${3.2 + i * 0.45}s" begin="${
          -i * 0.8
        }s" repeatCount="indefinite" path="M${x},${y} L${cx},${cy}"/><animate attributeName="opacity" values="0;1;1;0" dur="${
          3.2 + i * 0.45
        }s" begin="${-i * 0.8}s" repeatCount="indefinite"/></circle>`;
      }
    });
    s += linksSvg(P, cx, cy);
    s += `<circle class="core-halo" cx="${cx}" cy="${cy}" r="48"/><circle class="core" cx="${cx}" cy="${cy}" r="35"/><text class="you" x="${cx}" y="${
      cy + 4.5
    }">YOU</text>`;
    DIMS.forEach((m, i) => {
      const [x, y] = P(m.angle),
        v = Math.round(d[m.k]),
        dv = v - BASE[m.k];
      const left = Math.cos((m.angle * Math.PI) / 180) < -0.1,
        tx = left ? x - 38 : x + 38,
        an = left ? 'end' : 'start';
      s += `<g class="node${weak === m.k ? ' weak' : ''}${state.spot === m.k ? ' on' : ''}" data-k="${m.k}" style="--c:var(--${
        m.k
      });--i:${i}" tabindex="0" role="button" aria-label="${m.name}, ${v} percent. Press to spotlight.">
        <g class="orb">
          ${weak === m.k ? `<circle class="pulse" cx="${x}" cy="${y}" r="25"/>` : ''}
          <circle class="glow" cx="${x}" cy="${y}" r="33"/>
          <circle class="disc" cx="${x}" cy="${y}" r="25"/>
          <circle class="halo" cx="${x}" cy="${y}" r="33"/>
          <g class="gl" transform="translate(${x - 10} ${y - 10}) scale(.8333)" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${
            ICON[m.orb]
          }</g>
        </g>
        <text class="nm" x="${tx}" y="${y - 3}" text-anchor="${an}">${m.name}</text>
        <text class="vl" x="${tx}" y="${y + 15}" text-anchor="${an}">${v}%${
          dv > 0 ? `<tspan class="up" dx="5">+${dv}</tspan>` : ''
        }</text>
      </g>`;
    });
    s += '</svg>';
    ow.innerHTML = s;
    state.intro = false;
  }

  function setNote(k?: string | null) {
    const key = k || state.spot,
      el = $('#db-orbNote');
    if (!el) return;
    if (key) {
      const v = Math.round(state.dims[key]),
        lk = (LINKS[key] || []).map(([t, vb]) => `${vb} ${dn(t)}`);
      el.innerHTML =
        NOTES[key] +
        (state.dims[key] !== BASE[key] ? ` <b>Now ${v}%, was ${BASE[key]}%.</b>` : '') +
        (lk.length ? ` ${dn(key)} ${lk.join(', ')}.` : '');
    } else {
      el.textContent = DEFAULT_NOTE;
    }
  }

  const ow = $('#db-orbitWrap');
  if (ow) {
    ow.addEventListener('mouseover', (e: MouseEvent) => {
      const n = (e.target as Element).closest('.node') as HTMLElement;
      if (n) setNote(n.dataset.k);
    });
    ow.addEventListener('mouseout', (e: MouseEvent) => {
      if ((e.target as Element).closest('.node')) setNote();
    });
    ow.addEventListener('focusin', (e: FocusEvent) => {
      const n = (e.target as Element).closest('.node') as HTMLElement;
      if (n) setNote(n.dataset.k);
    });
    ow.addEventListener('focusout', () => setNote());
    ow.addEventListener('click', (e: MouseEvent) => {
      const n = (e.target as Element).closest('.node') as HTMLElement;
      if (n) spotlight(n.dataset.k);
    });
    ow.addEventListener('keydown', (e: KeyboardEvent) => {
      const n = (e.target as Element).closest('.node') as HTMLElement;
      if (n && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        spotlight(n.dataset.k);
        const k = n.dataset.k;
        requestAnimationFrame(() => (root.querySelector(`.node[data-k="${k}"]`) as HTMLElement)?.focus());
      }
    });
  }

  function renderList() {
    const ol = $('#db-orbList');
    if (!ol) return;
    ol.innerHTML = DIMS.map((m) => {
      const v = Math.round(state.dims[m.k]);
      return `<button class="row" data-k="${m.k}" style="--c:var(--${m.k})"><span class="bdg">${ic(
        m.orb,
        17
      )}</span><span>${m.name}</span><span class="t"><i style="width:${v}%"></i></span><b>${v}%</b></button>`;
    }).join('');
  }

  $('#db-orbList')?.addEventListener('click', (e: MouseEvent) => {
    const r = (e.target as Element).closest('.row') as HTMLElement;
    if (r) spotlight(r.dataset.k);
  });

  function setView(v: string) {
    state.view = v;
    $('#db-vOrbit')?.setAttribute('aria-pressed', String(v === 'orbit'));
    $('#db-vList')?.setAttribute('aria-pressed', String(v === 'list'));
    $('#db-orbitWrap')?.classList.toggle('hide', v === 'list');
    $('#db-orbList')?.classList.toggle('show', v === 'list');
  }

  const vOrbitBtn = $('#db-vOrbit');
  if (vOrbitBtn) vOrbitBtn.onclick = () => setView('orbit');
  const vListBtn = $('#db-vList');
  if (vListBtn) vListBtn.onclick = () => setView('list');

  /* ───────── balance dial (onboarding style) ───────── */
  const R0 = 74,
    R1 = 112,
    DM = 5,
    HI = 0.385;
  const P_ = (a0: number, a1: number, r0: number, r1: number) => {
    const c = (a: number) => [Math.cos(a), Math.sin(a)];
    const [x0, y0] = c(a0);
    const [x1, y1] = c(a1);
    return `M${(r1 * x0).toFixed(2)} ${(r1 * y0).toFixed(2)}A${r1} ${r1} 0 0 1 ${(r1 * x1).toFixed(2)} ${(
      r1 * y1
    ).toFixed(2)}L${(r0 * x1).toFixed(2)} ${(r0 * y1).toFixed(2)}A${r0} ${r0} 0 0 0 ${(r0 * x0).toFixed(2)} ${(
      r0 * y0
    ).toFixed(2)}Z`;
  };
  const W = (a0: number, fe: number, r0: number, r1: number, T: number, i: number, rm: boolean) => {
    let d = `M${(r1 * Math.cos(a0)).toFixed(2)} ${(r1 * Math.sin(a0)).toFixed(2)}A${r1} ${r1} 0 0 1 ${(
      r1 * Math.cos(fe)
    ).toFixed(2)} ${(r1 * Math.sin(fe)).toFixed(2)}`;
    for (let r = r1; r >= r0; r -= 3) {
      const aa = fe + (rm ? 0 : Math.sin(r * 0.32 + T * 3.2 + i) * 0.022);
      d += `L${(r * Math.cos(aa)).toFixed(2)} ${(r * Math.sin(aa)).toFixed(2)}`;
    }
    return (
      d +
      `L${(r0 * Math.cos(fe)).toFixed(2)} ${(r0 * Math.sin(fe)).toFixed(2)}A${r0} ${r0} 0 0 0 ${(
        r0 * Math.cos(a0)
      ).toFixed(2)} ${(r0 * Math.sin(a0)).toFixed(2)}Z`
    );
  };
  const H_ = (a0: number, a1: number, r: number) =>
    `M${(r * Math.cos(a0)).toFixed(2)} ${(r * Math.sin(a0)).toFixed(2)}A${r} ${r} 0 0 1 ${(r * Math.cos(a1)).toFixed(
      2
    )} ${(r * Math.sin(a1)).toFixed(2)}`;

  const K = ['study', 'focus', 'health', 'sleep', 'money', 'goals'];
  const N = ['Study', 'Focus', 'Health', 'Sleep', 'Money', 'Goals'];
  const SM = (i: number) => ((-90 + i * 60 + 30) * Math.PI) / 180;

  let dialBuilt = false;
  let dialRafId = 0;
  let hovD = -1;
  const curScores = K.map((k) => state.dims[k] || 70);
  const hs = K.map(() => 0);
  let arcObjects: Array<{
    g: SVGElement;
    u: SVGPathElement;
    t: SVGPathElement;
    p: SVGPathElement;
    h: SVGPathElement;
  }> = [];
  let pillObjects: Array<{
    e: HTMLButtonElement;
    b: HTMLElement | null;
  }> = [];

  function buildDial() {
    if (dialBuilt) return;
    dialBuilt = true;

    // Ticks
    const tk = $('#db-tk');
    if (tk) {
      let s = '';
      for (let i = 0; i < 72; i++) {
        const a = (i * Math.PI) / 36;
        const L = i % 6 === 0;
        const r0 = L ? 127 : 132;
        s += `<line x1="${(r0 * Math.cos(a)).toFixed(2)}" y1="${(r0 * Math.sin(a)).toFixed(2)}" x2="${(
          140 * Math.cos(a)
        ).toFixed(2)}" y2="${(140 * Math.sin(a)).toFixed(2)}" stroke="rgba(21,23,28,${
          L ? 0.45 : 0.2
        })" stroke-width="${L ? 1.6 : 1}"/>`;
      }
      tk.innerHTML = s;
    }

    // Mask defs
    const defs = $('#db-dsv defs');
    if (defs) {
      K.forEach((k, i) => {
        const maskId = 'db-cp' + i;
        let mm = $('#' + maskId);
        if (!mm) {
          mm = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
          mm.setAttribute('id', maskId);
          mm.setAttribute('maskUnits', 'userSpaceOnUse');
          mm.setAttribute('x', '-200');
          mm.setAttribute('y', '-200');
          mm.setAttribute('width', '400');
          mm.setAttribute('height', '400');
          const m = SM(i);
          const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          p.setAttribute('d', P_(m - HI, m + HI, R0 + DM, R1 - DM));
          p.setAttribute('fill', '#fff');
          p.setAttribute('stroke', '#fff');
          p.setAttribute('stroke-width', String(2 * DM));
          p.setAttribute('stroke-linejoin', 'round');
          mm.appendChild(p);
          defs.appendChild(mm);
        }
      });
    }

    // Arcs
    const AG = $('#db-arcs');
    if (AG) {
      AG.innerHTML = '';
      arcObjects = K.map((k, i) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const tr = `color-mix(in srgb, var(--${k}) 80%, #fff)`;
        const f = `color-mix(in srgb, var(--${k}) 34%, var(--${k}d, var(--${k})))`;

        const u = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        u.setAttribute('style', `fill:#fff;stroke:#fff;stroke-width:${2 * DM + 3};stroke-linejoin:round;opacity:.8`);
        g.appendChild(u);

        const t = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        t.setAttribute('style', `fill:${tr};stroke:${tr};stroke-width:${2 * DM};stroke-linejoin:round`);
        g.appendChild(t);

        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('style', `fill:${f};stroke:none`);
        p.setAttribute('mask', `url(#db-cp${i})`);
        g.appendChild(p);

        const h = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        h.setAttribute('fill', 'none');
        h.setAttribute('stroke', '#fff');
        h.setAttribute('stroke-width', '1.8');
        h.setAttribute('stroke-linecap', 'round');
        h.setAttribute('mask', `url(#db-cp${i})`);
        g.appendChild(h);

        g.style.cursor = 'pointer';
        g.onclick = () => {
          spotlight(k);
        };
        g.onmouseenter = () => {
          hovD = i;
        };
        g.onmouseleave = () => {
          hovD = -1;
        };

        AG.appendChild(g);
        return { g, u, t, p, h };
      });
    }

    // Floating pills
    const pls = $('#db-pls');
    if (pls) {
      pls.innerHTML = '';
      pillObjects = K.map((k, i) => {
        const m = SM(i);
        const e = document.createElement('button');
        e.type = 'button';
        e.className = 'pl';
        const pr = 44 + 8 * Math.abs(Math.cos(m)) ** 3;
        e.style.cssText = `left:${(50 + pr * Math.cos(m)).toFixed(2)}%;top:${(50 + pr * Math.sin(m)).toFixed(
          2
        )}%;--c:var(--${k});--i:${i}`;
        e.innerHTML = `<i></i>${N[i]}<b class="num">${Math.round(state.dims[k] || 0)}</b>`;
        e.onmouseenter = e.onfocus = () => {
          hovD = i;
        };
        e.onmouseleave = e.onblur = () => {
          hovD = -1;
        };
        e.onclick = () => {
          spotlight(k);
        };
        pls.appendChild(e);
        return { e, b: e.querySelector('b') };
      });
    }

    // Dial animation loop
    function tickDial(now: number) {
      if (cancelled) return;
      const T = now * 0.001;
      const rm = reduced();
      const d = state.dims;
      const w = weakest(d);

      K.forEach((k, i) => {
        const targetVal = d[k] || 70;
        curScores[i] += (targetVal - curScores[i]) * (rm ? 1 : 0.08);

        const isSpot = state.spot === k;
        const isHover = hovD === i;
        const lit = isHover || isSpot;
        hs[i] += ((lit ? 1 : 0) - hs[i]) * (rm ? 1 : 0.15);

        const arc = arcObjects[i];
        if (arc) {
          const mid = SM(i);
          const f0 = mid - HI - DM / 93;
          const f1 = mid + HI + DM / 93;
          const frac = clamp((curScores[i] - 30) / 70);
          const fe = f0 + (f1 - f0) * frac;
          const o = hs[i] * 10;

          const td = P_(mid - HI, mid + HI, R0 + DM, R1 - DM);
          arc.t.setAttribute('d', td);
          arc.u.setAttribute('d', td);
          arc.p.setAttribute('d', frac > 0.006 ? W(f0 - 0.03, fe, R0 - 2, R1 + 2, T, i, rm) : '');
          arc.h.setAttribute('d', fe - f0 > 0.22 ? H_(f0 + 0.1, fe - 0.07, R1 - 9) : '');
          arc.h.style.opacity = String(hs[i]);
          arc.g.setAttribute('transform', `translate(${(o * Math.cos(mid)).toFixed(2)} ${(o * Math.sin(mid)).toFixed(2)})`);
          arc.g.style.filter =
            hs[i] > 0.02
              ? `drop-shadow(0 ${(hs[i] * 8).toFixed(1)}px ${(hs[i] * 9).toFixed(1)}px rgba(21,23,28,${(
                  0.3 * hs[i]
                ).toFixed(2)})) drop-shadow(0 0 ${(18 * hs[i]).toFixed(1)}px color-mix(in srgb,var(--${k}) 50%,transparent))`
              : '';
        }

        const pill = pillObjects[i];
        if (pill) {
          if (pill.b) pill.b.textContent = String(Math.round(curScores[i]));
          pill.e.classList.toggle('on', lit);
          pill.e.classList.toggle('att', w.k === k && !lit);
        }
      });

      // Update Center text
      const balN = $('#db-balN');
      const balS = $('#db-balS');
      const balL = $('#db-balL');
      if (hovD >= 0) {
        const k = K[hovD];
        if (balN) balN.textContent = String(Math.round(curScores[hovD]));
        if (balS) balS.style.opacity = '0';
        if (balL) {
          balL.textContent = N[hovD];
          balL.style.color = `var(--${k})`;
        }
      } else if (state.spot && state.spot !== 'home') {
        const idx = K.indexOf(state.spot);
        if (idx >= 0) {
          if (balN) balN.textContent = String(Math.round(curScores[idx]));
          if (balS) balS.style.opacity = '0';
          if (balL) {
            balL.textContent = N[idx];
            balL.style.color = `var(--${state.spot})`;
          }
        }
      } else {
        const b = balance(d);
        if (balN) balN.textContent = String(Math.round(b));
        if (balS) balS.style.opacity = '1';
        if (balL) {
          balL.textContent = 'BALANCE';
          balL.style.color = 'var(--ink3)';
        }
      }

      dialRafId = requestAnimationFrame(tickDial);
    }

    dialRafId = requestAnimationFrame(tickDial);
  }

  function updateBalance() {
    const d = state.dims;
    const b = balance(d);
    bump(b);
    const sorted = [...DIMS].sort((a, c) => d[c.k] - d[a.k]);
    const w = weakest(d);
    const chip = $('#db-balChip');
    const balP = $('#db-balP');
    if (d[w.k] >= 75) {
      if (balP) balP.textContent = 'Nothing is lagging right now. All six dimensions are in good shape, so keep the rhythm.';
      if (chip) {
        chip.style.setProperty('--c', 'var(--good)');
        chip.innerHTML = `${ic('check', 16)} All dimensions healthy`;
      }
    } else {
      if (balP)
        balP.textContent = `Your ${sorted[0].name.toLowerCase()} and ${sorted[1].name.toLowerCase()} are strong. ${
          w.name
        } is the dimension that needs the most attention.`;
      if (chip) {
        chip.style.setProperty('--c', `var(--${w.k})`);
        chip.innerHTML = `${ic(w.orb, 16)} ${w.name} needs attention ${ic('down', 14, 2)}`;
      }
    }
    if (chip) chip.dataset.k = w.k;
  }

  const balChip = $('#db-balChip');
  if (balChip) {
    balChip.onclick = (e) => {
      const k = (e.currentTarget as HTMLElement).dataset.k;
      openWhatIf(k === 'sleep' ? { sleep: 1 } : k === 'health' ? { steps: 3000 } : k === 'study' ? { study: 1.5 } : {});
    };
  }

  /* ───────── glance ───────── */
  function renderGlance() {
    const tiles = $('#db-tiles');
    if (!tiles) return;
    const T = [
      { c: 'focus', ic: 'check', v: '02', k: 'Priorities', d: 'Marketing exam preparation', btn: true },
      { c: 'sleep', ic: 'moon', v: '6h 42m', k: 'Sleep', d: 'Goal: 7h 30m', p: 89 },
      { c: 'health', ic: 'steps', v: '<span id="db-stepsV" data-v="0">0</span>', k: 'Steps', d: 'Goal: 8,000 steps', p: Math.round(steps / 80) },
      { c: 'goals', ic: 'goals', v: '72%', k: 'Weekly goal', d: 'You’re making progress', p: 72 },
    ];
    tiles.innerHTML = T.map(
      (t) => `
      <div class="tile" style="--c:var(--${t.c})">
        <div class="bd">${ic(t.ic, 22)}</div>
        <div><div class="v">${t.v}</div><div class="k">${t.k}${t.k === 'Steps' ? ' <em class="livebadge">live</em>' : ''}</div></div>
        <div class="d">${t.d}</div>
        ${
          t.btn
            ? `<button class="mini" data-go="study">View Study ${ic('arrow', 13, 2)}</button>`
            : `<div class="meter"><div class="bar"><i ${t.k === 'Steps' ? 'id="db-stepsBar" ' : ''}data-w="${
                t.p
              }"></i></div><span ${t.k === 'Steps' ? 'id="db-stepsPct"' : ''}>${t.p}%</span></div>`
        }
      </div>`
    ).join('');

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        root.querySelectorAll('.bar i').forEach((i: any) => (i.style.width = i.dataset.w + '%'));
        animateNum($('#db-stepsV'), steps, 1400, (v) => Math.round(v).toLocaleString('en-US'));
      })
    );
  }

  $('#db-tiles')?.addEventListener('click', (e: MouseEvent) => {
    if ((e.target as Element).closest('[data-go]')) {
      spotlight('study');
      $('#db-orbitWrap')?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
    }
  });

  /* ───────── rhythm chart ───────── */
  const HRS = [6, 8, 10, 12, 14, 16, 18, 20, 22];
  const SER = [
    { id: 'focus', name: 'Focus', c: 'var(--focus)', v: [25, 52, 72, 76, 45, 35, 38, 45, 31] },
    { id: 'energy', name: 'Energy', c: 'var(--energy)', v: [33, 64, 82, 76, 53, 41, 50, 46, 52] },
    { id: 'recovery', name: 'Recovery', c: 'var(--recovery)', v: [76, 48, 31, 27, 32, 41, 58, 64, 94] },
  ];
  const BEST = [9, 11];
  const hidden = new Set<string>();

  function cr(arr: number[], h: number) {
    const t = (h - 6) / 2,
      i = Math.max(0, Math.min(arr.length - 2, Math.floor(t))),
      u = t - i;
    const p0 = arr[Math.max(0, i - 1)],
      p1 = arr[i],
      p2 = arr[i + 1],
      p3 = arr[Math.min(arr.length - 1, i + 2)];
    const v = 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
    return clamp(v);
  }

  const fmtH = (h: number) => {
    const H = Math.floor(h),
      m = Math.round((h - H) * 60),
      ap = H >= 12 ? 'PM' : 'AM',
      hh = ((H + 11) % 12) + 1;
    return `${hh}:${String(m).padStart(2, '0')} ${ap}`;
  };
  const lbl = (h: number) => `${((h + 11) % 12) + 1} ${h >= 12 ? 'PM' : 'AM'}`;
  let drewOnce = false;

  function renderChart() {
    const el = $('#db-chart');
    if (!el) return;
    const W = Math.max(300, el.clientWidth),
      H = Math.min(250, Math.max(190, W * 0.34));
    const ml = 34,
      mr = 10,
      mt = 26,
      mb = 26,
      iw = W - ml - mr,
      ih = H - mt - mb;
    const X = (h: number) => ml + ((h - 6) / 16) * iw,
      Y = (v: number) => mt + (1 - v / 100) * ih;
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart of focus, energy and recovery from 6 AM to 10 PM. Focus peaks between 9 and 11 AM.">`;
    [0, 25, 50, 75, 100].forEach((v) => {
      s += `<line class="gridl" x1="${ml}" x2="${W - mr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="axis" x="${ml - 10}" y="${
        Y(v) + 4
      }" text-anchor="end">${v}</text>`;
    });
    HRS.forEach((h) => {
      s += `<text class="axis" x="${X(h)}" y="${H - 6}" text-anchor="middle">${lbl(h)}</text>`;
    });
    const bx = X(BEST[0]),
      bw = X(BEST[1]) - bx;
    s += `<rect class="band" x="${bx}" y="${mt}" width="${bw}" height="${ih}" rx="8"/>`;
    s += `<g transform="translate(${bx + bw / 2} ${
      mt - 6
    })"><rect x="-58" y="-17" width="116" height="30" rx="9" fill="var(--btn)"/><text x="0" y="-5" text-anchor="middle" font-size="9.5" font-weight="600" fill="var(--btnink)" font-family="var(--sans)">Best focus window</text><text x="0" y="7" text-anchor="middle" font-size="9" fill="var(--btnink)" opacity=".75" font-family="var(--sans)">9:00 – 11:00 AM</text></g>`;

    const n = new Date(),
      nh = n.getHours() + n.getMinutes() / 60;
    if (nh > 6.3 && nh < 21.7) {
      s += `<line class="now" x1="${X(nh)}" x2="${X(nh)}" y1="${mt}" y2="${mt + ih}"/><g transform="translate(${X(nh)} ${
        mt + ih - 4
      })"><rect x="-15" y="-15" width="30" height="16" rx="8" fill="var(--sleep)"/><text class="nowl" x="0" y="-3.5" text-anchor="middle">Now</text></g>`;
    }
    SER.forEach((se) => {
      if (hidden.has(se.id)) return;
      let d = '';
      for (let h = 6; h <= 22.001; h += 0.25) d += (d ? 'L' : 'M') + X(h).toFixed(1) + ',' + Y(cr(se.v, h)).toFixed(1);
      s += `<path class="ser${!drewOnce && !reduced() ? ' ser-draw' : ''}" pathLength="1" d="${d}" stroke="${se.c}"/>`;
      HRS.forEach((h, i) => {
        s += `<circle class="pt" cx="${X(h)}" cy="${Y(se.v[i])}" r="3.2" fill="${se.c}"/>`;
      });
    });
    s += `<g id="db-xh" style="display:none"><line class="xh" y1="${mt}" y2="${mt + ih}"/>${SER.map(
      (se) => `<circle id="db-xd-${se.id}" r="5" fill="${se.c}" stroke="var(--card)" stroke-width="2"/>`
    ).join('')}</g>`;
    s += `<rect id="db-hit" x="${ml}" y="${mt}" width="${iw}" height="${ih}" fill="transparent"/></svg><div class="tip" id="db-tip"></div>`;
    el.innerHTML = s;
    drewOnce = true;

    const svg = el.firstElementChild as SVGElement;
    const tip = $('#db-tip') as HTMLElement;
    const xh = $('#db-xh') as HTMLElement;

    function move(ev: PointerEvent) {
      if (!svg || !tip || !xh) return;
      const r = svg.getBoundingClientRect(),
        px = (ev.clientX - r.left) * (W / r.width);
      const h = clamp(6 + ((px - ml) / iw) * 16, 6, 22);
      xh.style.display = '';
      xh.querySelector('line')?.setAttribute('x1', String(X(h)));
      xh.querySelector('line')?.setAttribute('x2', String(X(h)));
      let rows = '';
      SER.forEach((se) => {
        const c = $('#db-xd-' + se.id);
        if (!c) return;
        if (hidden.has(se.id)) {
          c.style.display = 'none';
          return;
        }
        c.style.display = '';
        const v = cr(se.v, h);
        c.setAttribute('cx', String(X(h)));
        c.setAttribute('cy', String(Y(v)));
        rows += `<span><i style="background:${se.c}"></i>${se.name} ${Math.round(v)}</span>`;
      });
      tip.innerHTML = `<b>${fmtH(Math.round(h * 4) / 4)}</b>${rows}`;
      const tw = tip.offsetWidth || 110;
      tip.style.left = clamp(X(h), tw / 2, W - tw / 2) + 'px';
      tip.style.top = mt + 4 + 'px';
      tip.classList.add('show');
    }
    const leave = () => {
      if (xh) xh.style.display = 'none';
      if (tip) tip.classList.remove('show');
    };
    if (svg) {
      svg.addEventListener('pointermove', move);
      svg.addEventListener('pointerdown', move);
      svg.addEventListener('pointerleave', leave);
    }
  }

  function renderLegend() {
    const lgd = $('#db-legend');
    if (!lgd) return;
    lgd.innerHTML =
      SER.map(
        (se) => `<button class="lg" data-id="${se.id}" aria-pressed="${!hidden.has(se.id)}" style="--c:${se.c}"><i></i>${se.name}</button>`
      ).join('') + `<span class="pill">TODAY</span>`;
  }

  $('#db-legend')?.addEventListener('click', (e: MouseEvent) => {
    const b = (e.target as Element).closest('.lg') as HTMLElement;
    if (!b) return;
    const id = b.dataset.id;
    if (!id) return;
    if (hidden.has(id)) hidden.delete(id);
    else if (hidden.size < 2) hidden.add(id);
    renderLegend();
    renderChart();
  });

  const blockBtn = $('#db-blockBtn');
  if (blockBtn) {
    blockBtn.onclick = (e) => {
      const b = e.currentTarget as HTMLElement,
        on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? 'Blocked ✓' : 'Block on calendar';
      toast(on ? '9:00 – 11:00 AM is now protected for deep work.' : 'Calendar block removed.');
    };
  }

  const chartEl = $('#db-chart');
  if (chartEl && typeof ResizeObserver !== 'undefined') {
    let rt: any;
    resizeObserver = new ResizeObserver(() => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (!cancelled) renderChart();
      }, 80);
    });
    resizeObserver.observe(chartEl);
  }

  /* ───────── insights ───────── */
  function renderInsights() {
    const d = state.dims,
      s = Math.round(d.sleep),
      st = Math.round(d.study);
    const lag = s < st - 10;
    const I = [
      {
        c: 'sleep',
        ic: 'moon',
        t: lag ? 'Recovery is lagging' : 'Recovery is keeping pace',
        p: lag
          ? `Sleep is at ${s} while Study is at ${st}. Your recovery needs attention.`
          : `Sleep is at ${s}, close behind Study at ${st}. Keep your bedtime steady.`,
        a: 'Explore Sleep',
        f: () => openWhatIf({ sleep: 1 }),
      },
      {
        c: 'focus',
        ic: 'sun',
        t: 'Your best focus window',
        p: '9–11 AM is your strongest focus period. Keep it free for deep work.',
        a: 'Explore Study',
        f: () => {
          spotlight('study');
          $('#db-orbitWrap')?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
        },
      },
      {
        c: 'study',
        ic: 'study',
        t: 'Marketing exam in 3 days',
        p: 'See how two hours of daily study could change your plan.',
        a: 'Simulate a plan',
        f: () => openWhatIf({ study: 2 }),
      },
    ];
    const insList = $('#db-insList');
    if (insList) {
      insList.innerHTML = I.map(
        (x, i) =>
          `<div class="ins-i" style="--c:var(--${x.c})"><div class="bd">${ic(x.ic, 22)}</div><div><h4>${x.t}</h4><p>${
            x.p
          }</p><button class="lnk" data-i="${i}">${x.a} ${ic('arrow', 14, 2)}</button></div></div>`
      ).join('');
      insList.onclick = (e: MouseEvent) => {
        const b = (e.target as Element).closest('.lnk') as HTMLElement;
        if (b && I[+b.dataset.i]) I[+b.dataset.i].f();
      };
    }
  }

  /* ───────── what-if ───────── */
  function project(b: Record<string, number>, p: { sleep: number; study: number; steps: number }) {
    const o = { ...b },
      kS = p.steps / 1000;
    o.sleep = b.sleep + 11 * p.sleep - 2.2 * p.study;
    o.study = b.study + 3.2 * p.study + 1.2 * p.sleep;
    o.focus = b.focus + 2.6 * p.sleep + 0.8 * kS - 0.6 * p.study;
    o.health = b.health + 3 * p.sleep + 3.2 * kS;
    o.goals = b.goals + 1.2 * p.study + 0.6 * kS + 0.5 * p.sleep;
    DIMS.forEach((m) => (o[m.k] = clamp(o[m.k])));
    return o;
  }
  const exam = (p: { sleep: number; study: number; steps: number }) =>
    Math.round(clamp(62 + 5.5 * p.study + 2.4 * p.sleep + (0.4 * p.steps) / 1000, 0, 99));
  const bedtime = (h: number) => fmtH(23.5 - h);
  let lastFocus: any = null;

  function renderWhatIf() {
    const base = state.dims,
      proj = project(base, plan);
    const b0 = balance(base),
      b1 = balance(proj),
      df = b1 - b0;
    const oSleep = $('#db-oSleep');
    if (oSleep) oSleep.textContent = plan.sleep ? `${plan.sleep}h earlier · bed by ${bedtime(plan.sleep)}` : 'No change';
    const oStudy = $('#db-oStudy');
    if (oStudy) oStudy.textContent = plan.study ? `+${plan.study}h a day` : 'No change';
    const oSteps = $('#db-oSteps');
    if (oSteps) oSteps.textContent = plan.steps ? `+${plan.steps.toLocaleString('en-US')} steps` : 'No change';
    const wiA = $('#db-wiA');
    if (wiA) wiA.textContent = String(b0);
    const wiB = $('#db-wiB');
    if (wiB) wiB.textContent = String(b1);
    const D = $('#db-wiD');
    if (D) {
      D.textContent = df ? `${df > 0 ? '+' : ''}${df}` : '';
      D.classList.toggle('neg', df < 0);
    }
    const ds = DIMS.map((m) => ({ n: m.name, d: Math.round(proj[m.k]) - Math.round(base[m.k]) }))
      .filter((x) => x.d !== 0)
      .sort((a, b) => b.d - a.d);
    const up = ds.filter((x) => x.d > 0).slice(0, 2),
      down = ds.filter((x) => x.d < 0)[0];
    const wiN = $('#db-wiN');
    if (wiN) {
      wiN.textContent = ds.length
        ? `${up.length ? `This plan lifts ${up.map((u) => `${u.n} by ${u.d}`).join(' and ')}` : 'This plan costs more than it gives'}${
            down ? `, while ${down.n} slips ${-down.d}` : ''
          }. Balance moves from ${b0} to ${b1}.`
        : 'Move a lever to see how one change spreads across all six dimensions.';
    }
    const wiRows = $('#db-wiRows');
    if (wiRows) {
      wiRows.innerHTML = DIMS.map((m) => {
        const a = Math.round(base[m.k]),
          c = Math.round(proj[m.k]),
          dl = c - a;
        return `<div class="wr" style="--c:var(--${m.k})"><span>${
          m.name
        }</span><span class="t"><i class="b0" style="width:${a}%"></i><i class="b1" style="width:${Math.min(
          a,
          c
        )}%"></i>${c > a ? `<i class="b1" style="left:${a}%;width:${c - a}%;opacity:1"></i>` : ''}</span><em>${c}${
          dl ? ` <u class="${dl < 0 ? 'neg' : ''}">${dl > 0 ? '+' : ''}${dl}</u>` : ''
        }</em></div>`;
      }).join('');
    }
    const wiE = $('#db-wiE');
    if (wiE) wiE.textContent = exam(plan) + '%';
  }

  function openWhatIf(preset: any = {}) {
    plan.sleep = preset.sleep || 0;
    plan.study = preset.study || 0;
    plan.steps = preset.steps || 0;
    const rSleep = $('#db-rSleep') as HTMLInputElement;
    if (rSleep) rSleep.value = String(plan.sleep);
    const rStudy = $('#db-rStudy') as HTMLInputElement;
    if (rStudy) rStudy.value = String(plan.study);
    const rSteps = $('#db-rSteps') as HTMLInputElement;
    if (rSteps) rSteps.value = String(plan.steps);
    renderWhatIf();
    lastFocus = document.activeElement;
    const drawer = $('#db-drawer');
    if (drawer) {
      drawer.inert = false;
      drawer.classList.add('on');
    }
    $('#db-scrim')?.classList.add('on');
    const mainEl = $('#db-main');
    if (mainEl) mainEl.inert = true;
    setTimeout(() => ($('#db-drClose') as HTMLElement)?.focus(), 60);
  }

  function closeWhatIf() {
    const drawer = $('#db-drawer');
    if (drawer) drawer.classList.remove('on');
    $('#db-scrim')?.classList.remove('on');
    const mainEl = $('#db-main');
    if (mainEl) mainEl.inert = false;
    setTimeout(() => {
      if (drawer) drawer.inert = true;
    }, 400);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  [['db-rSleep', 'sleep'], ['db-rStudy', 'study'], ['db-rSteps', 'steps']].forEach(([id, k]) => {
    $('#' + id)?.addEventListener('input', (e: any) => {
      plan[k] = parseFloat(e.target.value);
      renderWhatIf();
    });
  });

  const drCloseBtn = $('#db-drClose');
  if (drCloseBtn) drCloseBtn.onclick = closeWhatIf;
  const scrim = $('#db-scrim');
  if (scrim) scrim.onclick = closeWhatIf;

  const ctaWhat = $('#db-ctaWhat');
  if (ctaWhat) ctaWhat.onclick = () => openWhatIf({ sleep: 1 });
  const tabWhatIf = $('#db-tabWhatIf');
  if (tabWhatIf) tabWhatIf.onclick = () => openWhatIf({ sleep: 1 });

  const wiApply = $('#db-wiApply');
  if (wiApply) {
    wiApply.onclick = () => {
      const before = balance(state.dims),
        next = project(state.dims, plan);
      DIMS.forEach((m) => (state.dims[m.k] = Math.round(next[m.k])));
      const after = balance(state.dims);
      closeWhatIf();
      refreshAll();
      toast(after === before ? 'Plan applied. Balance holds at ' + after + '.' : `Plan applied. Balance ${before} → ${after}.`);
      if (opts.onApplyPlan) opts.onApplyPlan(state.dims);
    };
  }

  const wiReset = $('#db-wiReset');
  if (wiReset) {
    wiReset.onclick = () => {
      state.dims = { ...BASE };
      plan.sleep = plan.study = plan.steps = 0;
      mdone.clear();
      xp = 640;
      level = 7;
      const rSleep = $('#db-rSleep') as HTMLInputElement;
      if (rSleep) rSleep.value = '0';
      const rStudy = $('#db-rStudy') as HTMLInputElement;
      if (rStudy) rStudy.value = '0';
      const rSteps = $('#db-rSteps') as HTMLInputElement;
      if (rSteps) rSteps.value = '0';
      refreshAll();
      renderMissions();
      setXP();
      renderWhatIf();
      toast('Back to the demo data.');
    };
  }

  function refreshAll() {
    renderNav();
    renderOrbit();
    renderList();
    updateBalance();
    renderInsights();
    setNote();
    syncSpot();
    renderWeekly();
  }

  /* ═════════ v2: effects, missions, palette, intro ═════════ */
  const COLORS = { study: '#6b8cff', focus: '#f2a22a', health: '#45c388', sleep: '#8a6cf2', money: '#3dbfab', goals: '#ee6e5a' };
  const HIST = {
    study: [74, 77, 76, 79, 80, 81, 82],
    focus: [78, 80, 79, 83, 82, 85, 84],
    health: [64, 66, 63, 69, 66, 70, 68],
    sleep: [70, 68, 66, 65, 63, 64, 61],
    money: [72, 72, 73, 73, 74, 74, 74],
    goals: [70, 73, 74, 76, 77, 78, 79],
  };
  const hist = (k: string) => {
    const a = [...HIST[k]];
    a[6] = Math.round(state.dims[k]);
    return a;
  };
  const dn = (k: string) => DIMS.find((m) => m.k === k)?.name || k;
  const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let steps = 4820,
    lastBal: number | null = null;

  /* starfield */
  function stars() {
    let r = 7,
      o = '';
    const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 46; i++) {
      const x = 70 + rnd() * 500,
        y = 8 + rnd() * 384,
        z = 0.6 + rnd() * 1.3,
        d = 2.5 + rnd() * 4,
        dl = -rnd() * 5;
      o += `<circle class="star" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${z.toFixed(
        2
      )}" fill="var(--ink)" style="animation-duration:${d.toFixed(1)}s;animation-delay:${dl.toFixed(2)}s"/>`;
    }
    return o;
  }

  /* links */
  const LINKS: Record<string, string[][]> = {
    sleep: [['focus', 'fuels'], ['health', 'restores'], ['study', 'sharpens']],
    study: [['goals', 'advances'], ['focus', 'trains'], ['sleep', 'costs']],
    focus: [['study', 'powers'], ['goals', 'drives']],
    health: [['sleep', 'improves'], ['focus', 'lifts']],
    money: [['goals', 'funds'], ['health', 'supports']],
    goals: [['study', 'motivates'], ['money', 'needs']],
  };

  function linksSvg(P: (a: number) => number[], cx: number, cy: number) {
    if (!state.spot) return '';
    const a = DIMS.find((m) => m.k === state.spot);
    if (!a) return '';
    const [x1, y1] = P(a.angle);
    let o = '';
    (LINKS[a.k] || []).forEach(([k, verb], i) => {
      const b = DIMS.find((m) => m.k === k);
      if (!b) return;
      const [x2, y2] = P(b.angle);
      const qx = cx + ((x1 + x2) / 2 - cx) * 0.3,
        qy = cy + ((y1 + y2) / 2 - cy) * 0.3;
      const lx = 0.25 * x1 + 0.5 * qx + 0.25 * x2,
        ly = 0.25 * y1 + 0.5 * qy + 0.25 * y2;
      o += `<g class="lk" style="--c:var(--${a.k});--i:${i}"><path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(
        1
      )} ${x2.toFixed(1)},${y2.toFixed(1)}"/><text x="${lx.toFixed(1)}" y="${(ly - 6).toFixed(1)}" text-anchor="middle">${verb}</text></g>`;
    });
    return o;
  }

  /* sparkline */
  function spark(a: number[], w: number, h: number, color: string) {
    const mn = Math.min(...a) - 4,
      mx = Math.max(...a) + 4,
      X = (i: number) => (i / (a.length - 1)) * w,
      Y = (v: number) => h - ((v - mn) / (mx - mn)) * (h - 6) - 3;
    const pts = a.map((v, i) => [X(i), Y(v)]);
    let d = `M${pts[0][0]},${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1],
        [x1, y1] = pts[i],
        c = (x0 + x1) / 2;
      d += ` C${c.toFixed(1)},${y0.toFixed(1)} ${c.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><path d="${d} L${w},${h} L0,${h}Z" fill="${color}" opacity=".16"/><path class="sp-l" d="${d}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/><circle cx="${
      last[0]
    }" cy="${last[1].toFixed(1)}" r="3.8" fill="${color}"/></svg>`;
  }

  function syncSpot() {
    const k = state.spot,
      sp = $('#db-spot');
    root.style.setProperty('--acc', COLORS[k || 'sleep']);
    if (sp) sp.classList.toggle('on', !!k);
    if (!k) return;
    const h = hist(k),
      v = h[6],
      dl = v - h[0];
    const act = {
      sleep: { sleep: 1 },
      study: { study: 1.5 },
      health: { steps: 3000 },
      focus: { sleep: 1 },
      goals: { study: 1 },
      money: null,
    }[k];
    const spotIn = $('#db-spotIn');
    if (spotIn) {
      spotIn.innerHTML = `<div class="spot-row" style="--c:var(--${k})">
      <div class="sp-v"><span class="sp-n">${v}</span><span class="sp-u">%</span><small>${dn(k)}</small></div>
      <div class="sp-c">${spark(h, 170, 54, COLORS[k])}<small>${dl >= 0 ? 'Up' : 'Down'} <b class="${
        dl < 0 ? 'neg' : ''
      }">${Math.abs(dl)}</b> points in 7 days</small></div>
      <button class="mini" id="db-spotAct">${act ? 'Simulate a change' : 'Log a spend'} ${ic('arrow', 13, 2)}</button></div>`;
      const spotAct = $('#db-spotAct');
      if (spotAct) spotAct.onclick = () => (act ? openWhatIf(act) : toast('Spending logged. Money stays on plan.'));
    }
  }

  /* confetti */
  const fx = $('#db-fx') as HTMLCanvasElement;
  const fctx = fx ? fx.getContext('2d') : null;
  let parts: any[] = [];

  function sizeFx() {
    if (!fx || !fctx) return;
    const r = window.devicePixelRatio || 1;
    fx.width = window.innerWidth * r;
    fx.height = window.innerHeight * r;
    fctx.setTransform(r, 0, 0, r, 0, 0);
  }
  sizeFx();
  window.addEventListener('resize', sizeFx);

  function confetti(x: number, y: number, n = 40, spread = 1) {
    if (reduced() || !fctx) return;
    const cols = Object.values(COLORS);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * spread,
        v = 4 + Math.random() * 8;
      parts.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        r: 3 + Math.random() * 4,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.35,
        c: cols[i % 6],
        life: 0,
        max: 70 + Math.random() * 55,
        sq: Math.random() < 0.5,
      });
    }
    if (!fraf) fraf = requestAnimationFrame(ftick);
  }

  function ftick() {
    if (!fctx || cancelled) return;
    fctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    parts = parts.filter((p) => p.life < p.max);
    parts.forEach((p) => {
      p.life++;
      p.vy += 0.22;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      fctx.save();
      fctx.globalAlpha = Math.max(0, 1 - p.life / p.max);
      fctx.translate(p.x, p.y);
      fctx.rotate(p.rot);
      fctx.fillStyle = p.c;
      if (p.sq) fctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      else {
        fctx.beginPath();
        fctx.arc(0, 0, p.r / 1.5, 0, 7);
        fctx.fill();
      }
      fctx.restore();
    });
    fraf = parts.length ? requestAnimationFrame(ftick) : 0;
  }

  function celebrate() {
    confetti(window.innerWidth * 0.25, window.innerHeight * 0.85, 80, 1.2);
    setTimeout(() => confetti(window.innerWidth * 0.75, window.innerHeight * 0.85, 80, 1.2), 150);
    setTimeout(() => confetti(window.innerWidth * 0.5, window.innerHeight * 0.9, 90, 1.5), 320);
  }

  function bump(b: number) {
    const n = $('#db-balN');
    if (n) {
      n.classList.remove('bump');
      void n.offsetWidth;
      n.classList.add('bump');
    }
    if (lastBal !== null && lastBal < 80 && b >= 80) {
      celebrate();
      toast(`Balance reached ${b}. Your life is in rhythm.`);
    }
    lastBal = b;
  }

  /* missions */
  const MS = [
    { id: 'm1', t: 'Lights out by 10:30 PM', fx: { sleep: 3 }, xp: 25 },
    { id: 'm2', t: 'Walk for 15 minutes', fx: { health: 2, focus: 1 }, xp: 15 },
    { id: 'm3', t: 'Two hours of deep work, 9–11 AM', fx: { focus: 2, study: 1 }, xp: 30 },
    { id: 'm4', t: 'Review Marketing exam notes', fx: { study: 3, goals: 1 }, xp: 30 },
    { id: 'm5', t: 'Log today’s spending', fx: { money: 2 }, xp: 10 },
  ];
  const mdone = new Set<string>();
  let xp = 640,
    level = 7,
    justId: string | null = null;
  const LVN = [
    'Spark',
    'Drifter',
    'Wayfinder',
    'Navigator',
    'Pathfinder',
    'Orbiter',
    'Steady Orbit',
    'Starlight',
    'Constellation',
    'Nebula',
    'Quasar',
    'Cosmos',
  ];

  function renderMissions() {
    const msList = $('#db-msList');
    if (!msList) return;
    msList.innerHTML = MS.map((m) => {
      const done = mdone.has(m.id),
        first = Object.keys(m.fx)[0];
      return `<li class="ms${done ? ' done' : ''}${justId === m.id ? ' just' : ''}" style="--c:var(--${first})">
        <button class="ck" data-id="${m.id}" role="checkbox" aria-checked="${done}" aria-label="${
        m.t
      }"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" pathLength="1"/></svg></button>
        <div class="ms-t"><span>${m.t}</span><div class="rw">${Object.entries(m.fx)
        .map(([k, v]) => `<i style="--c:var(--${k})">+${v} ${dn(k)}</i>`)
        .join('')}</div></div>
        <b class="xp">+${m.xp} XP</b></li>`;
    }).join('');
    const streak = $('#db-streak');
    if (streak) streak.innerHTML = `${ic('flame', 15)} ${12 + (mdone.size === MS.length ? 1 : 0)}-day streak`;
  }

  function setXP() {
    let up = false;
    while (xp >= 800) {
      xp -= 800;
      level++;
      up = true;
    }
    while (xp < 0 && level > 1) {
      xp += 800;
      level--;
    }
    const lvlBadge = $('#db-lvlBadge');
    if (lvlBadge) lvlBadge.textContent = String(level);
    const lvlName = $('#db-lvlName');
    if (lvlName) lvlName.innerHTML = `Level <b>${level}</b>, ${LVN[Math.min(level - 1, LVN.length - 1)]}`;
    const xpTxt = $('#db-xpTxt');
    if (xpTxt) xpTxt.textContent = `${xp} / 800 XP`;
    const xpBar = $('#db-xpBar');
    if (xpBar) xpBar.style.width = xp / 8 + '%';
    if (up) {
      if (lvlBadge) {
        lvlBadge.classList.remove('up');
        void lvlBadge.offsetWidth;
        lvlBadge.classList.add('up');
      }
      celebrate();
      toast(`Level up. You’re now level ${level}.`);
    }
  }

  $('#db-msList')?.addEventListener('click', (e: MouseEvent) => {
    const b = (e.target as Element).closest('.ck') as HTMLElement;
    if (!b) return;
    const m = MS.find((x) => x.id === b.dataset.id);
    if (!m) return;
    const on = !mdone.has(m.id),
      sg = on ? 1 : -1;
    if (on) mdone.add(m.id);
    else mdone.delete(m.id);
    Object.entries(m.fx).forEach(([k, v]) => (state.dims[k] = clamp(state.dims[k] + sg * v)));
    xp += sg * m.xp;
    justId = on ? m.id : null;
    const r = b.getBoundingClientRect();
    renderMissions();
    refreshAll();
    setXP();
    if (on) confetti(r.left + r.width / 2, r.top + r.height / 2, 34, 0.9);
    if (on && mdone.size === MS.length)
      setTimeout(() => {
        celebrate();
        toast('Perfect day. Every mission done.');
      }, 350);
    const nb = root.querySelector(`.ck[data-id="${m.id}"]`) as HTMLElement;
    if (nb) nb.focus();
  });

  /* weekly pulse */
  function renderWeekly() {
    const el = $('#db-wk');
    if (!el) return;
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    const bal = days.map((_, i) => {
      const d: Record<string, number> = {};
      DIMS.forEach((m) => (d[m.k] = i === 6 ? state.dims[m.k] : HIST[m.k][i]));
      return balance(d);
    });
    const W = 420,
      H = 210,
      ml = 16,
      mr = 16,
      mt = 34,
      mb = 30,
      iw = W - ml - mr,
      ih = H - mt - mb,
      mn = Math.min(...bal) - 5,
      mx = Math.max(...bal) + 5;
    const X = (i: number) => ml + (i / 6) * iw,
      Y = (v: number) => mt + (1 - (v - mn) / (mx - mn)) * ih;
    let d = `M${X(0)},${Y(bal[0]).toFixed(1)}`;
    for (let i = 1; i < 7; i++) {
      const c = (X(i - 1) + X(i)) / 2;
      d += ` C${c.toFixed(1)},${Y(bal[i - 1]).toFixed(1)} ${c.toFixed(1)},${Y(bal[i]).toFixed(1)} ${X(i).toFixed(1)},${Y(bal[i]).toFixed(1)}`;
    }
    const first = !el.dataset.drawn;
    el.dataset.drawn = '1';
    let o = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Balance score over the last seven days: ${bal.join(
      ', '
    )}"><defs><linearGradient id="db-wkg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sleep);stop-opacity:.34"/><stop offset="1" style="stop-color:var(--sleep);stop-opacity:0"/></linearGradient></defs>`;
    o += `<path d="${d} L${X(6)},${mt + ih} L${X(0)},${mt + ih}Z" fill="url(#db-wkg)"/>`;
    o += `<path class="ser${first && !reduced() ? ' ser-draw' : ''}" pathLength="1" d="${d}" style="stroke:var(--sleep);stroke-width:2.6"/>`;
    bal.forEach((v, i) => {
      const t = i === 6;
      o += `<g><circle class="pt" cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="${t ? 6 : 4}" style="fill:var(--sleep)"><title>${
        days[i]
      }: ${v}</title></circle>${t ? `<circle class="pulse" style="stroke:var(--sleep)" cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="6"/>` : ''}<text class="axis" x="${X(
        i
      ).toFixed(1)}" y="${(Y(v) - 13).toFixed(1)}" text-anchor="middle" style="font-weight:600;fill:var(--ink)">${v}</text><text class="axis" x="${X(
        i
      ).toFixed(1)}" y="${H - 8}" text-anchor="middle">${days[i]}</text></g>`;
    });
    el.innerHTML = o + '</svg>';
    const best = bal.indexOf(Math.max(...bal)),
      avg = Math.round(mean(bal)),
      dl = bal[6] - bal[0];
    const wkStats = $('#db-wkStats');
    if (wkStats) {
      wkStats.innerHTML = `<div><small>Best day</small><b>${days[best]} ${bal[best]}</b></div><div><small>Average</small><b>${avg}</b></div><div><small>Trend</small><b style="color:var(--${
        dl >= 0 ? 'good' : 'goals'
      })">${dl >= 0 ? '+' : ''}${dl}</b></div>`;
    }
    const wkDelta = $('#db-wkDelta');
    if (wkDelta) wkDelta.textContent = `${dl >= 0 ? '+' : ''}${dl} this week`;
  }

  /* live steps */
  stepsInterval = setInterval(() => {
    if (document.hidden || reduced() || cancelled) return;
    const el = $('#db-stepsV');
    if (!el) return;
    steps = Math.min(8000, steps + Math.round(6 + Math.random() * 28));
    el.textContent = steps.toLocaleString('en-US');
    el.dataset.v = String(steps);
    const p = Math.round(steps / 80);
    const stepsBar = $('#db-stepsBar');
    if (stepsBar) stepsBar.style.width = p + '%';
    const stepsPct = $('#db-stepsPct');
    if (stepsPct) stepsPct.textContent = p + '%';
    const t = el.closest('.tile');
    if (t) {
      t.classList.remove('tick');
      void t.offsetWidth;
      t.classList.add('tick');
    }
  }, 2800);

  /* hero: typed line + focus-window countdown */
  function typeLede() {
    const el = $('#db-lede'),
      txt = 'Here’s your life today. See what needs your attention.';
    if (!el) return;
    if (reduced()) {
      el.textContent = txt;
      return;
    }
    el.textContent = '';
    let i = 0;
    (function f() {
      if (cancelled) return;
      el.textContent = txt.slice(0, ++i);
      if (i < txt.length) setTimeout(f, 20);
    })();
  }

  function focusChip() {
    const n = new Date(),
      h = n.getHours() + n.getMinutes() / 60;
    const f = (x: number) => {
      const m = Math.max(1, Math.round(x * 60));
      return Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm';
    };
    const t =
      h < 9
        ? `Focus window opens in ${f(9 - h)}`
        : h < 11
        ? `Focus window is open, ${f(11 - h)} left`
        : 'Next focus window tomorrow at 9:00 AM';
    const lc = $('#db-liveChip');
    if (lc) lc.innerHTML = `<i></i>${t}`;
  }
  focusInterval = setInterval(focusChip, 30000);

  /* cursor glow, orbit parallax, magnetic buttons */
  const onPointerMove = (e: PointerEvent) => {
    const c = (e.target as Element)?.closest && (e.target as Element).closest('.card') as HTMLElement;
    if (c) {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', e.clientX - r.left + 'px');
      c.style.setProperty('--my', e.clientY - r.top + 'px');
    }
  };
  root.addEventListener('pointermove', onPointerMove);

  const oc = root.querySelector('.orbit-card') as HTMLElement;
  const ow2 = $('#db-orbitWrap') as HTMLElement;
  if (oc && ow2) {
    oc.addEventListener('pointermove', (e: PointerEvent) => {
      if (reduced()) return;
      const r = ow2.getBoundingClientRect(),
        x = (e.clientX - r.left) / r.width - 0.5,
        y = (e.clientY - r.top) / r.height - 0.5;
      ow2.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
      ow2.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
    });
    oc.addEventListener('pointerleave', () => {
      ow2.style.setProperty('--ry', '0deg');
      ow2.style.setProperty('--rx', '0deg');
    });
  }

  root.querySelectorAll('.cta').forEach((b: any) => {
    b.addEventListener('pointermove', (e: PointerEvent) => {
      if (reduced()) return;
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.08).toFixed(1)}px,${(
        (e.clientY - r.top - r.height / 2) * 0.2 -
        2
      ).toFixed(1)}px)`;
    });
    b.addEventListener('pointerleave', () => {
      b.style.transform = '';
    });
  });

  /* command palette */
  const pal = $('#db-pal');
  const palIn = $('#db-palIn') as HTMLInputElement;
  const palList = $('#db-palList');
  let palSel = 0,
    palItems: any[] = [],
    palPrev: any = null;
  const palIc = $('#db-palIc');
  if (palIc) palIc.innerHTML = ic('search', 20);

  const scrollOrbit = () => $('#db-orbitWrap')?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });

  function baseCmds() {
    return [
      ...DIMS.map((m) => ({
        t: `Go to ${m.name}`,
        h: 'Spotlight it in your orbit',
        ic: m.orb,
        c: m.k,
        run: () => {
          if (state.spot !== m.k) spotlight(m.k);
          scrollOrbit();
        },
      })),
      { t: 'Open the What If simulator', h: 'Move levers and watch your balance shift', ic: 'spark', run: () => openWhatIf({ sleep: 1 }) },
      {
        t: 'Block my best focus window',
        h: '9:00 – 11:00 AM, protected for deep work',
        ic: 'sun',
        c: 'focus',
        run: () => $('#db-blockBtn')?.click(),
      },
      { t: 'Celebrate', h: 'Because you showed up today', ic: 'spark', c: 'goals', run: celebrate },
      { t: 'Switch theme', h: 'Light or dark', ic: 'moon', run: () => $('#db-themeBtn')?.click() },
      { t: 'Toggle calm mode', h: 'Motion off, contrast up', ic: 'calm', run: () => $('#db-calmBtn')?.click() },
      { t: 'Replay the intro', h: 'Watch the opening again', ic: 'home', run: () => runBoot() },
      { t: 'Reset demo data', h: 'Back to where you started', ic: 'clock', run: () => $('#db-wiReset')?.click() },
    ];
  }

  function parsePlan(q: string) {
    const p: any = {},
      num = (t: string) => parseFloat(t.replace(/,/g, ''));
    let m;
    if ((m = q.match(/(?:sleep|bed|bedtime)\D{0,24}?(\d+(?:\.\d+)?)/)) || (m = q.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours?)?\s*earlier/)))
      p.sleep = num(m[1]);
    if ((m = q.match(/stud(?:y|ying)\D{0,24}?(\d+(?:\.\d+)?)/))) p.study = num(m[1]);
    if ((m = q.match(/(?:walk|steps?)\D{0,24}?(\d[\d,]*(?:\.\d+)?)/))) {
      const n = num(m[1]);
      p.steps = n < 100 ? n * 130 : n;
    }
    if (p.sleep !== undefined) p.sleep = Math.min(2, Math.round(p.sleep * 4) / 4);
    if (p.study !== undefined) p.study = Math.min(3, Math.round(p.study * 2) / 2);
    if (p.steps !== undefined) p.steps = Math.min(5000, Math.round(p.steps / 250) * 250);
    return Object.keys(p).length ? p : null;
  }

  function palRender() {
    if (!palIn || !palList) return;
    const q = palIn.value.trim().toLowerCase();
    let items: any[] = [];
    const pp = q ? parsePlan(q) : null;
    if (pp) {
      const parts = [];
      if (pp.sleep !== undefined) parts.push(`sleep ${pp.sleep}h earlier`);
      if (pp.study !== undefined) parts.push(`study +${pp.study}h`);
      if (pp.steps !== undefined) parts.push(`+${pp.steps.toLocaleString('en-US')} steps`);
      items.push({ t: 'Simulate this plan', h: parts.join(', '), ic: 'spark', c: 'sleep', run: () => openWhatIf(pp) });
    }
    const words = q.split(/\s+/).filter(Boolean);
    items = items.concat(
      baseCmds().filter((c) => {
        const hay = (c.t + ' ' + c.h).toLowerCase();
        return !words.length || words.every((w) => hay.includes(w));
      })
    );
    if (!items.length)
      items = [
        {
          t: 'Open the What If simulator',
          h: 'No command matched. Try “sleep 1 hour earlier”.',
          ic: 'spark',
          run: () => openWhatIf({ sleep: 1 }),
        },
      ];
    palItems = items;
    palSel = Math.min(palSel, items.length - 1);
    palList.innerHTML = items
      .map(
        (c, i) =>
          `<li class="pi${i === palSel ? ' sel' : ''}" role="option" aria-selected="${i === palSel}" data-i="${i}" style="--c:var(--${
            c.c || 'sleep'
          })"><span class="bd">${ic(c.ic, 17)}</span><div><b>${esc(c.t)}</b><small>${esc(c.h)}</small></div><span class="ret">${ic(
            'arrow',
            15,
            2
          )}</span></li>`
      )
      .join('');
    const sel = palList.querySelector('.sel') as HTMLElement;
    if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
  }

  function openPal() {
    if ($('#db-drawer')?.classList.contains('on')) closeWhatIf();
    palPrev = document.activeElement;
    if (pal) {
      pal.classList.add('on');
      pal.setAttribute('aria-hidden', 'false');
    }
    const shell = root.querySelector('.shell') as HTMLElement;
    if (shell) shell.inert = true;
    const top = root.querySelector('.top') as HTMLElement;
    if (top) top.inert = true;
    if (palIn) {
      palIn.value = '';
      palSel = 0;
      palRender();
      setTimeout(() => palIn.focus(), 40);
    }
  }

  function closePal(restore = true) {
    if (pal) {
      pal.classList.remove('on');
      pal.setAttribute('aria-hidden', 'true');
    }
    const shell = root.querySelector('.shell') as HTMLElement;
    if (shell) shell.inert = false;
    const top = root.querySelector('.top') as HTMLElement;
    if (top) top.inert = false;
    if (restore && palPrev && palPrev.focus) palPrev.focus();
  }

  function palRun(i: number) {
    const c = palItems[i];
    if (!c) return;
    closePal(false);
    setTimeout(() => c.run(), 70);
  }

  if (palIn) {
    palIn.addEventListener('input', () => {
      palSel = 0;
      palRender();
    });
    palIn.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        palSel = (palSel + 1) % palItems.length;
        palRender();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        palSel = (palSel - 1 + palItems.length) % palItems.length;
        palRender();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        palRun(palSel);
      }
    });
  }

  if (palList) {
    palList.addEventListener('click', (e: MouseEvent) => {
      const li = (e.target as Element).closest('.pi') as HTMLElement;
      if (li) palRun(+li.dataset.i);
    });
    palList.addEventListener('mousemove', (e: MouseEvent) => {
      const li = (e.target as Element).closest('.pi') as HTMLElement;
      if (!li || +li.dataset.i === palSel) return;
      palSel = +li.dataset.i;
      palList.querySelectorAll('.pi').forEach((n, i) => {
        n.classList.toggle('sel', i === palSel);
        n.setAttribute('aria-selected', String(i === palSel));
      });
    });
  }

  if (pal) {
    pal.addEventListener('click', (e: MouseEvent) => {
      if (e.target === pal) closePal();
    });
  }

  if (askBtn) askBtn.onclick = openPal;

  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      pal?.classList.contains('on') ? closePal() : openPal();
      return;
    }
    if (
      e.key === '/' &&
      !/INPUT|TEXTAREA|SELECT/.test((document.activeElement as Element)?.tagName || '') &&
      !pal?.classList.contains('on')
    ) {
      e.preventDefault();
      openPal();
      return;
    }
    if (e.key === 'Escape') {
      if (pal?.classList.contains('on')) {
        closePal();
        return;
      }
      if ($('#db-drawer')?.classList.contains('on')) {
        closeWhatIf();
        return;
      }
    }
    const b = $('#db-boot');
    if (b && !b.classList.contains('out') && b.style.display !== 'none' && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) {
      endBoot();
    }
  };
  window.addEventListener('keydown', onKeyDown);

  /* intro + start */
  function start() {
    if (cancelled) return;
    drewOnce = false;
    lastBal = null;
    state.intro = true;
    const balN = $('#db-balN');
    if (balN) balN.dataset.v = '0';
    const wk = $('#db-wk');
    if (wk) wk.removeAttribute('data-drawn');
    buildDial();
    renderLegend();
    renderGlance();
    renderChart();
    renderNav();
    renderOrbit();
    renderList();
    renderInsights();
    setNote();
    renderMissions();
    setXP();
    renderWeekly();
    focusChip();
    typeLede();
    syncSpot();
    root.classList.remove('go');
    void root.offsetWidth;
    root.classList.add('go');
    requestAnimationFrame(() => requestAnimationFrame(updateBalance));
  }

  function endBoot() {
    const b = $('#db-boot');
    if (!b || b.classList.contains('out')) return;
    clearTimeout(bootT);
    b.classList.add('out');
    start();
    setTimeout(() => {
      if (b) b.style.display = 'none';
    }, 950);
  }

  function runBoot() {
    let b = $('#db-boot');
    if (!b) return;
    if (reduced()) {
      start();
      b.style.display = 'none';
      return;
    }
    b.classList.remove('out');
    b.style.display = '';
    bootT = setTimeout(endBoot, 3200);
  }

  const onBootClick = (e: MouseEvent) => {
    if ((e.target as Element).closest('#db-boot')) endBoot();
  };
  root.addEventListener('click', onBootClick);

  runBoot();

  /* Cleanup */
  return () => {
    cancelled = true;
    if (dialRafId) cancelAnimationFrame(dialRafId);
    if (fraf) cancelAnimationFrame(fraf);
    if (toastT) clearTimeout(toastT);
    if (bootT) clearTimeout(bootT);
    if (stepsInterval) clearInterval(stepsInterval);
    if (focusInterval) clearInterval(focusInterval);
    if (resizeObserver) resizeObserver.disconnect();

    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', sizeFx);
    root.removeEventListener('pointermove', onPointerMove);
    root.removeEventListener('click', onBootClick);
  };
}
