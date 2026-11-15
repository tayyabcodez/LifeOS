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
  /* ───────── icons (upgraded detailed SVGs) ───────── */
  const ICON = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    study:
      '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12.2v4.5c0 0 2.5 3.3 6 3.3s6-3.3 6-3.3v-4.5"/><path d="M22 10v6"/><circle cx="22" cy="16.5" r="1.3" fill="currentColor"/><polygon points="12 6.5 17.5 9.5 12 12.5 6.5 9.5" fill="currentColor" fill-opacity=".25"/>',
    focus:
      '<circle cx="12" cy="12" r="5" fill="currentColor" fill-opacity=".22"/><circle cx="12" cy="12" r="2.8"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/><circle cx="12" cy="12" r="8" stroke-dasharray="2 3" opacity=".55"/>',
    sun:
      '<circle cx="12" cy="12" r="4.8" fill="currentColor" fill-opacity=".22"/><circle cx="12" cy="12" r="2.8"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/><circle cx="12" cy="12" r="8" stroke-dasharray="2 3" opacity=".55"/>',
    health:
      '<path d="M12 21s-7.5-4.5-9.3-10C1.2 7.2 3.5 4 7 4c2.2 0 3.8 1.2 5 3.2 1.2-2 2.8-3.2 5-3.2 3.5 0 5.8 3.2 4.3 7-1.8 5.5-9.3 10-9.3 10z" fill="currentColor" fill-opacity=".15"/><path d="M7.5 12.5h2l1.5-3 2 5.5 1.5-2.5h2" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    heart:
      '<path d="M12 21s-7.5-4.5-9.3-10C1.2 7.2 3.5 4 7 4c2.2 0 3.8 1.2 5 3.2 1.2-2 2.8-3.2 5-3.2 3.5 0 5.8 3.2 4.3 7-1.8 5.5-9.3 10-9.3 10z" fill="currentColor" fill-opacity=".15"/><path d="M7.5 12.5h2l1.5-3 2 5.5 1.5-2.5h2" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    sleep:
      '<path d="M20.5 14.5A8.8 8.8 0 0 1 9.5 3.5 9 9 0 1 0 20.5 14.5z" fill="currentColor" fill-opacity=".2"/><path d="M15.5 6.5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" fill="currentColor" stroke="none"/><circle cx="12.5" cy="5.2" r=".8" fill="currentColor"/><circle cx="17.8" cy="11.2" r=".6" fill="currentColor"/>',
    money:
      '<ellipse cx="12" cy="6" rx="8" ry="3" fill="currentColor" fill-opacity=".25"/><path d="M4 6v5c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 11v5c0 1.66 3.58 3 8 3s8-1.34 8-3v-5"/><path d="M12 8.5v3.5M10.5 10.2h3" stroke-width="1.2" opacity=".7"/><path d="M12 13.5v3.5M10.5 15.2h3" stroke-width="1.2" opacity=".7"/>',
    goals:
      '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="6" fill="currentColor" fill-opacity=".2"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" stroke-width="1.3"/>',
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

  /* ───────── hyper-realistic 3D pure icons (volumetric models with lighting & bevels) ───────── */
  function render3DIcon(k: string, cx?: number, cy?: number, size = 32, idSuffix = 'i') {
    const s = size;
    const isPlaced = cx !== undefined && cy !== undefined;
    const pfx = `i3d-${k}-${idSuffix}`;
    let content = '';

    if (k === 'goals') {
      content = `
        <defs>
          <radialGradient id="${pfx}-core" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="25%" stop-color="#fca5a5"/>
            <stop offset="60%" stop-color="#ef4444"/>
            <stop offset="100%" stop-color="#991b1b"/>
          </radialGradient>
          <radialGradient id="${pfx}-ring" cx="32%" cy="28%" r="70%">
            <stop offset="0%" stop-color="#ff8577"/>
            <stop offset="40%" stop-color="#ee4444"/>
            <stop offset="80%" stop-color="#b91c1c"/>
            <stop offset="100%" stop-color="#701010"/>
          </radialGradient>
          <linearGradient id="${pfx}-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="35%" stop-color="#e2e8f0"/>
            <stop offset="70%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#f8fafc"/>
          </linearGradient>
          <filter id="${pfx}-sh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#7f1d1d" flood-opacity="0.35"/>
          </filter>
        </defs>
        <g filter="url(#${pfx}-sh)">
          <circle cx="18" cy="18" r="16" fill="url(#${pfx}-metal)"/>
          <circle cx="18" cy="18" r="14.2" fill="#701010"/>
          <circle cx="18" cy="18" r="13.8" fill="url(#${pfx}-ring)"/>
          <circle cx="18" cy="18" r="9.8" fill="url(#${pfx}-metal)"/>
          <circle cx="18" cy="18" r="7.8" fill="url(#${pfx}-ring)"/>
          <circle cx="18" cy="18" r="4.8" fill="url(#${pfx}-core)"/>
          <path d="M 5.5,16 A 13,13 0 0,1 30.5,16 A 13,6.5 0 0,0 5.5,16 Z" fill="#ffffff" opacity="0.45"/>
          <rect x="17.2" y="2.5" width="1.6" height="3" rx="0.8" fill="#ffffff" opacity="0.9"/>
          <rect x="17.2" y="30.5" width="1.6" height="3" rx="0.8" fill="#ffffff" opacity="0.9"/>
          <rect x="2.5" y="17.2" width="3" height="1.6" rx="0.8" fill="#ffffff" opacity="0.9"/>
          <rect x="30.5" y="17.2" width="3" height="1.6" rx="0.8" fill="#ffffff" opacity="0.9"/>
          <circle cx="16.5" cy="16.5" r="1.3" fill="#ffffff" opacity="0.95"/>
        </g>
      `;
    } else if (k === 'study') {
      content = `
        <defs>
          <linearGradient id="${pfx}-top" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stop-color="#93c5fd"/>
            <stop offset="25%" stop-color="#4f75f7"/>
            <stop offset="65%" stop-color="#2546cf"/>
            <stop offset="100%" stop-color="#1e2f8d"/>
          </linearGradient>
          <linearGradient id="${pfx}-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fffbeb"/>
            <stop offset="35%" stop-color="#f59e0b"/>
            <stop offset="75%" stop-color="#b45309"/>
            <stop offset="100%" stop-color="#fbbf24"/>
          </linearGradient>
          <linearGradient id="${pfx}-book" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="50%" stop-color="#dbeafe"/>
            <stop offset="100%" stop-color="#93c5fd"/>
          </linearGradient>
          <filter id="${pfx}-sh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#1e3a8a" flood-opacity="0.35"/>
          </filter>
        </defs>
        <g filter="url(#${pfx}-sh)">
          <path d="M 6,26 Q 18,21 18,24 Q 18,21 30,26 L 30,29 Q 18,24 18,27 Q 18,24 6,29 Z" fill="url(#${pfx}-book)"/>
          <ellipse cx="18" cy="20.5" rx="7.5" ry="4" fill="#172554"/>
          <polygon points="18,6 33,13.5 18,20 3,13.5" fill="url(#${pfx}-top)"/>
          <polyline points="3,13.5 18,20 33,13.5" stroke="rgba(255,255,255,0.6)" stroke-width="0.9" fill="none"/>
          <polygon points="18,7.5 29.5,13 18,17.5 6.5,13" fill="rgba(255,255,255,0.2)"/>
          <ellipse cx="18" cy="13.5" rx="2.5" ry="1.6" fill="url(#${pfx}-gold)"/>
          <path d="M 18,13.5 Q 26,14.5 27.5,19 Q 28.5,23.5 29,27" fill="none" stroke="url(#${pfx}-gold)" stroke-width="1.8" stroke-linecap="round"/>
          <circle cx="29" cy="27" r="1.8" fill="url(#${pfx}-gold)"/>
          <circle cx="29" cy="29.2" r="1.2" fill="#d97706"/>
        </g>
      `;
    } else if (k === 'focus' || k === 'sun') {
      content = `
        <defs>
          <radialGradient id="${pfx}-lens" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#fffbeb"/>
            <stop offset="25%" stop-color="#fde047"/>
            <stop offset="55%" stop-color="#f59e0b"/>
            <stop offset="85%" stop-color="#d97706"/>
            <stop offset="100%" stop-color="#78350f"/>
          </radialGradient>
          <linearGradient id="${pfx}-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef9c3"/>
            <stop offset="35%" stop-color="#fbbf24"/>
            <stop offset="70%" stop-color="#b45309"/>
            <stop offset="100%" stop-color="#78350f"/>
          </linearGradient>
          <linearGradient id="${pfx}-ray-l" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
          <linearGradient id="${pfx}-ray-d" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#d97706"/>
            <stop offset="100%" stop-color="#78350f"/>
          </linearGradient>
          <filter id="${pfx}-sh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#78350f" flood-opacity="0.3"/>
          </filter>
        </defs>
        <g filter="url(#${pfx}-sh)">
          <polygon points="18,1 18,9 15.5,9" fill="url(#${pfx}-ray-l)"/>
          <polygon points="18,1 20.5,9 18,9" fill="url(#${pfx}-ray-d)"/>
          <polygon points="18,35 15.5,27 18,27" fill="url(#${pfx}-ray-l)"/>
          <polygon points="18,35 18,27 20.5,27" fill="url(#${pfx}-ray-d)"/>
          <polygon points="1,18 9,15.5 9,18" fill="url(#${pfx}-ray-l)"/>
          <polygon points="1,18 9,18 9,20.5" fill="url(#${pfx}-ray-d)"/>
          <polygon points="35,18 27,15.5 27,18" fill="url(#${pfx}-ray-l)"/>
          <polygon points="35,18 27,18 27,20.5" fill="url(#${pfx}-ray-d)"/>
          <polygon points="30,6 23.5,10.5 25,12" fill="url(#${pfx}-ray-l)"/>
          <polygon points="30,6 25,12 26.5,13.5" fill="url(#${pfx}-ray-d)"/>
          <polygon points="6,6 11,12.5 9.5,14" fill="url(#${pfx}-ray-l)"/>
          <polygon points="6,6 12.5,11 11,12.5" fill="url(#${pfx}-ray-d)"/>
          <polygon points="30,30 25,24 23.5,25.5" fill="url(#${pfx}-ray-l)"/>
          <polygon points="30,30 26.5,22.5 25,24" fill="url(#${pfx}-ray-d)"/>
          <polygon points="6,30 12.5,25 11,23.5" fill="url(#${pfx}-ray-l)"/>
          <polygon points="6,30 9.5,22 11,23.5" fill="url(#${pfx}-ray-d)"/>
          <circle cx="18" cy="18" r="11" fill="url(#${pfx}-gold)"/>
          <circle cx="18" cy="18" r="9.5" fill="#451a03"/>
          <circle cx="18" cy="18" r="8.8" fill="url(#${pfx}-lens)"/>
          <path d="M 11,17 A 7.5,7.5 0 0,1 25,17 A 7.5,4 0 0,0 11,17 Z" fill="#ffffff" opacity="0.55"/>
          <circle cx="18" cy="18" r="3.2" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="0.8"/>
          <circle cx="16.5" cy="16.5" r="1.3" fill="#ffffff"/>
        </g>
      `;
    } else if (k === 'health' || k === 'heart') {
      content = `
        <defs>
          <linearGradient id="${pfx}-heart" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stop-color="#a7f3d0"/>
            <stop offset="25%" stop-color="#34d399"/>
            <stop offset="65%" stop-color="#059669"/>
            <stop offset="100%" stop-color="#064e3b"/>
          </linearGradient>
          <filter id="${pfx}-sh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#064e3b" flood-opacity="0.35"/>
          </filter>
        </defs>
        <g filter="url(#${pfx}-sh)">
          <path d="M 18,31 C 10,24 4,18 4,11 C 4,6 8,2.5 13,2.5 C 15.8,2.5 17.2,3.8 18,5.5 C 18.8,3.8 20.2,2.5 23,2.5 C 28,2.5 32,6 32,11 C 32,18 26,24 18,31 Z" fill="url(#${pfx}-heart)"/>
          <ellipse cx="11.5" cy="7.5" rx="4.5" ry="2.6" transform="rotate(-30 11.5 7.5)" fill="#ffffff" opacity="0.6"/>
          <ellipse cx="24.5" cy="7.5" rx="4.5" ry="2.6" transform="rotate(30 24.5 7.5)" fill="#ffffff" opacity="0.45"/>
          <path d="M 23,3.5 C 27,3.5 30.5,6.5 30.5,11 C 30.5,17 25,23 18,29" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M 6.5,16 L 11.5,16 L 14,10.5 L 17.5,21.5 L 20.5,12.5 L 23,17 L 29.5,17" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" filter="drop-shadow(0 0 3px #10b981)"/>
          <circle cx="17.5" cy="21.5" r="1.2" fill="#ffffff"/>
        </g>
      `;
    } else if (k === 'sleep' || k === 'moon') {
      content = `
        <defs>
          <radialGradient id="${pfx}-moon" cx="30%" cy="25%" r="70%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="25%" stop-color="#ddd6fe"/>
            <stop offset="60%" stop-color="#8b5cf6"/>
            <stop offset="85%" stop-color="#6d28d9"/>
            <stop offset="100%" stop-color="#4c1d95"/>
          </radialGradient>
          <linearGradient id="${pfx}-cloud" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ede9fe"/>
            <stop offset="45%" stop-color="#c4b5fd"/>
            <stop offset="85%" stop-color="#7c3aed"/>
            <stop offset="100%" stop-color="#4c1d95"/>
          </linearGradient>
          <filter id="${pfx}-sh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#4c1d95" flood-opacity="0.35"/>
          </filter>
        </defs>
        <g filter="url(#${pfx}-sh)">
          <path d="M 7,27 C 4.5,27 3,25 3,23 C 3,21 4.5,19.2 6.5,18.8 C 7.5,15.5 10.8,13.5 14.5,13.5 C 18.5,13.5 21.8,16 22.8,19.5 C 23.6,19 24.8,18.5 26,18.5 C 28.5,18.5 31,20.5 31,23 C 31,25.5 29,27 26.5,27 Z" fill="url(#${pfx}-cloud)" opacity="0.95"/>
          <path d="M 26,6 C 18,6.8 11.5,13.5 11.5,21.5 C 11.5,24.2 12.2,26.8 13.5,29 C 9.8,26.2 7.5,22 7.5,17 C 7.5,8.8 14.2,2 22.5,2 C 23.7,2 24.9,2.2 26,2.5 C 25.1,3.5 25.5,4.9 26,6 Z" fill="url(#${pfx}-moon)"/>
          <path d="M 25,3 C 23.9,2.5 22.7,2.2 21.5,2.2 C 14,2.2 8,8.5 8,16.5 C 8,21 10.2,25 13.5,27.5" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.1" stroke-linecap="round"/>
          <path d="M 27,4 L 28,8 L 32,9 L 28,10 L 27,14 L 26,10 L 22,9 L 26,8 Z" fill="#ffffff" filter="drop-shadow(0 0 2.5px #c4b5fd)"/>
          <circle cx="21" cy="15.5" r="1.1" fill="#ffffff"/>
        </g>
      `;
    } else if (k === 'money') {
      content = `
        <defs>
          <linearGradient id="${pfx}-gold-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="35%" stop-color="#f59e0b"/>
            <stop offset="70%" stop-color="#b45309"/>
            <stop offset="100%" stop-color="#78350f"/>
          </linearGradient>
          <radialGradient id="${pfx}-coin" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#99f6e4"/>
            <stop offset="30%" stop-color="#2dd4bf"/>
            <stop offset="65%" stop-color="#0d9488"/>
            <stop offset="90%" stop-color="#115e59"/>
            <stop offset="100%" stop-color="#042f2e"/>
          </radialGradient>
          <linearGradient id="${pfx}-edge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fde047"/>
            <stop offset="50%" stop-color="#d97706"/>
            <stop offset="100%" stop-color="#78350f"/>
          </linearGradient>
          <filter id="${pfx}-sh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#042f2e" flood-opacity="0.35"/>
          </filter>
        </defs>
        <g filter="url(#${pfx}-sh)">
          <ellipse cx="14" cy="14" rx="10" ry="5.5" fill="url(#${pfx}-edge)"/>
          <ellipse cx="14" cy="13" rx="10" ry="5.5" fill="url(#${pfx}-coin)"/>
          <path d="M 5.5,19 L 5.5,23.5 C 5.5,27.5 11,30.5 18,30.5 C 25,30.5 30.5,27.5 30.5,23.5 L 30.5,19 Z" fill="url(#${pfx}-edge)"/>
          <line x1="8" y1="21" x2="8" y2="25" stroke="#92400e" stroke-width="0.8"/>
          <line x1="12" y1="23" x2="12" y2="27" stroke="#92400e" stroke-width="0.8"/>
          <line x1="18" y1="24.5" x2="18" y2="28.5" stroke="#92400e" stroke-width="0.8"/>
          <line x1="24" y1="23" x2="24" y2="27" stroke="#92400e" stroke-width="0.8"/>
          <line x1="28" y1="21" x2="28" y2="25" stroke="#92400e" stroke-width="0.8"/>
          <ellipse cx="18" cy="19" rx="12.5" ry="7" fill="url(#${pfx}-gold-rim)"/>
          <ellipse cx="18" cy="19" rx="10.2" ry="5.5" fill="url(#${pfx}-coin)"/>
          <ellipse cx="18" cy="19" rx="5.8" ry="3" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.2"/>
          <path d="M 18,15 L 18,23 M 15.5,17.5 Q 18,16.5 20.5,18 Q 18,19.5 15.5,20.5" stroke="#ffffff" stroke-width="1.3" fill="none" stroke-linecap="round"/>
          <ellipse cx="14.5" cy="17" rx="6.5" ry="2.2" fill="#ffffff" opacity="0.5" transform="rotate(-15 14.5 17)"/>
        </g>
      `;
    } else {
      content = ic(k, s);
    }

    if (isPlaced) {
      const scale = (s / 36).toFixed(3);
      const ox = (cx! - s / 2).toFixed(1);
      const oy = (cy! - s / 2).toFixed(1);
      return `<g class="icon-3d icon-3d-${k}" transform="translate(${ox} ${oy}) scale(${scale})">${content}</g>`;
    }

    return `<svg class="icon-3d icon-3d-${k}" viewBox="0 0 36 36" width="${s}" height="${s}" aria-hidden="true">${content}</svg>`;
  }

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
    sideCard.innerHTML = `${ic('clock', 22, 1.5)}<p>Your life works better together.</p><hr><div style="display:flex;align-items:center;margin-bottom:2px;"><img src="/logo.png" alt="LifeOS" style="height:18px;width:auto;object-fit:contain;" /></div><small>Your life, in one clear view.</small>`;

  const themeBtn = $('#db-themeBtn');
  const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('lifeos-theme') : null;
  if (savedTheme === 'dark' || savedTheme === 'light') {
    root.dataset.theme = savedTheme;
  } else {
    root.dataset.theme = 'light';
  }
  const dark = () => root.dataset.theme === 'dark';
  const setIcon = () => {
    if (themeBtn) themeBtn.innerHTML = ic(dark() ? 'sun' : 'moon', 20);
  };
  setIcon();

  if (themeBtn) {
    themeBtn.onclick = () => {
      const nextTheme = dark() ? 'light' : 'dark';
      root.dataset.theme = nextTheme;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('lifeos-theme', nextTheme);
      }
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
      R = 152,
      d = state.dims,
      weak = weakest(d).k;
    const P = (a: number) => [cx + R * Math.cos((a * Math.PI) / 180), cy + R * Math.sin((a * Math.PI) / 180)];

    let s = `<svg viewBox="60 0 520 400" role="group" aria-label="Life orbit: six dimensions around you" class="${
      state.intro ? 'intro' : ''
    }${state.spot ? ' has-spot' : ''}">
    <defs>
      <filter id="db-blur" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="11"/></filter>
      <radialGradient id="db-core-flare" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="var(--acc)" stop-opacity="0.8"/>
        <stop offset="40%" stop-color="var(--acc)" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="var(--acc)" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="db-glass-gleam" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle class="ring" cx="${cx}" cy="${cy}" r="64"/>
    <circle class="ring" cx="${cx}" cy="${cy}" r="108"/>
    <circle class="ring dash spin" cx="${cx}" cy="${cy}" r="${R}"/>
    <circle class="ring" cx="${cx}" cy="${cy}" r="195" opacity=".4"/>`;

    // Connected spokes to each dimension
    DIMS.forEach((m) => {
      const [x, y] = P(m.angle);
      s += `<line class="spoke spoke-${m.k}" data-k="${m.k}" style="--c:var(--${m.k})" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    });

    s += linksSvg(P, cx, cy);
    s += `<circle class="core-glow" cx="${cx}" cy="${cy}" r="68" fill="url(#db-core-flare)" pointer-events="none"/>
    <circle class="core-halo" cx="${cx}" cy="${cy}" r="52"/><circle class="core" cx="${cx}" cy="${cy}" r="38"/><text class="you" x="${cx}" y="${
      cy + 5
    }">YOU</text>`;

    DIMS.forEach((m, i) => {
      const [x, y] = P(m.angle),
        v = Math.round(d[m.k]),
        dv = v - BASE[m.k];
      const left = Math.cos((m.angle * Math.PI) / 180) < -0.1,
        tx = left ? x - 48 : x + 48,
        an = left ? 'end' : 'start';
      s += `<g class="node${weak === m.k ? ' weak' : ''}${state.spot === m.k ? ' on' : ''}" data-k="${m.k}" style="--c:var(--${
        m.k
      });--i:${i}" tabindex="0" role="button" aria-label="${m.name}, ${v} percent. Press to spotlight.">
        <g class="orb-anchor" transform="translate(${x.toFixed(1)}, ${y.toFixed(1)})">
          <g class="orb">
            ${weak === m.k ? `<circle class="pulse" cx="0" cy="0" r="28"/>` : ''}
            <circle class="glow" cx="0" cy="0" r="38"/>
            <circle class="disc" cx="0" cy="0" r="28"/>
            <circle class="glass-gleam" cx="0" cy="-8" r="16" fill="url(#db-glass-gleam)" opacity="0.4" pointer-events="none"/>
            <circle class="halo" cx="0" cy="0" r="38"/>
            <circle class="hover-ring" cx="0" cy="0" r="32" pointer-events="none"/>
            ${render3DIcon(m.k, 0, 0, 32, 'orb-' + m.k)}
          </g>
        </g>
        <text class="nm" x="${tx.toFixed(1)}" y="${(y - 4).toFixed(1)}" text-anchor="${an}">${m.name}</text>
        <text class="vl" x="${tx.toFixed(1)}" y="${(y + 16).toFixed(1)}" text-anchor="${an}">${v}%${
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
    const handleNodeHover = (k?: string | null) => {
      setNote(k);
      const svg = ow.querySelector('svg');
      if (!svg) return;
      svg.querySelectorAll('.spoke').forEach((sp) => sp.classList.remove('active'));
      const core = svg.querySelector('.core');
      if (k) {
        svg.querySelector(`.spoke-${k}`)?.classList.add('active');
        core?.classList.add('active-core');
      } else {
        core?.classList.remove('active-core');
      }
    };

    ow.addEventListener('mouseover', (e: MouseEvent) => {
      const n = (e.target as Element).closest('.node') as HTMLElement;
      if (n) handleNodeHover(n.dataset.k);
    });
    ow.addEventListener('mouseout', (e: MouseEvent) => {
      if ((e.target as Element).closest('.node')) handleNodeHover(null);
    });
    ow.addEventListener('focusin', (e: FocusEvent) => {
      const n = (e.target as Element).closest('.node') as HTMLElement;
      if (n) handleNodeHover(n.dataset.k);
    });
    ow.addEventListener('focusout', () => handleNodeHover(null));
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
    ol.innerHTML = DIMS.map((m, i) => {
      const v = Math.round(state.dims[m.k]);
      const isSelected = state.spot === m.k;
      return `<button class="row${isSelected ? ' on electric' : ''}" data-k="${m.k}" style="--c:var(--${m.k});--i:${i}" tabindex="0" role="button" aria-label="${m.name}, ${v} percent. Press to spotlight.">
        <span class="bdg">
          <i class="bdg-blob"></i>
          ${isSelected ? '<span class="electric-ring"></span>' : ''}
          ${render3DIcon(m.k, undefined, undefined, 26, 'lst-' + m.k)}
        </span>
        <span class="nm">${m.name}</span>
        <span class="t" role="progressbar" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="100">
          <i class="t-liquid" style="width:${v}%">
            <!-- Living Water Wave Crest -->
            <svg class="water-wave-svg" viewBox="0 0 120 20" preserveAspectRatio="none" aria-hidden="true">
              <path class="wave-crest" d="M0,10 C15,4 30,16 45,10 C60,4 75,16 90,10 C105,4 120,16 135,10 L135,20 L0,20 Z" />
            </svg>
            <span class="t-wave"></span>
            <span class="t-sheen"></span>
            <!-- Rising Micro-bubbles -->
            <span class="t-bubbles">
              <i class="b1"></i><i class="b2"></i><i class="b3"></i>
            </span>
            <!-- Leading Meniscus Blob -->
            <span class="t-blob"></span>
            <!-- Electric Lightning Arcs when Clicked -->
            ${
              isSelected
                ? `
              <svg class="lightning-svg" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
                <path class="electric-bolt b1" d="M0,10 L12,4 L24,16 L38,5 L52,14 L66,6 L80,15 L92,5 L100,10" />
                <path class="electric-bolt b2" d="M0,10 L16,15 L30,5 L44,15 L58,4 L72,16 L86,6 L94,14 L100,10" />
              </svg>
              <span class="electric-sparks">
                <i class="es1"></i><i class="es2"></i><i class="es3"></i><i class="es4"></i>
              </span>
            `
                : ''
            }
          </i>
        </span>
        <b class="val">${v}%</b>
      </button>`;
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
  const R0 = 66,
    R1 = 98,
    DM = 4.5,
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
        const r0 = L ? 104 : 108;
        const r1 = 117;
        s += `<line x1="${(r0 * Math.cos(a)).toFixed(2)}" y1="${(r0 * Math.sin(a)).toFixed(2)}" x2="${(
          r1 * Math.cos(a)
        ).toFixed(2)}" y2="${(r1 * Math.sin(a)).toFixed(2)}" stroke="rgba(21,23,28,${
          L ? 0.55 : 0.28
        })" stroke-width="${L ? 2.2 : 1.4}"/>`;
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
        const isSide = Math.abs(Math.sin(m)) < 0.2;
        const prX = isSide ? 49 : 43;
        const prY = isSide ? 0 : 42;
        const px = 50 + prX * Math.cos(m);
        const py = 50 + (isSide ? 0 : prY * Math.sin(m));
        e.style.cssText = `left:${px.toFixed(2)}%;top:${py.toFixed(2)}%;--c:var(--${k});--i:${i}`;
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
          const td = P_(mid - HI, mid + HI, R0 + DM, R1 - DM);
          arc.t.setAttribute('d', td);
          arc.u.setAttribute('d', td);
          arc.p.setAttribute('d', frac > 0.006 ? W(f0 - 0.03, fe, R0 - 2, R1 + 2, T, i, rm) : '');
          arc.h.setAttribute('d', fe - f0 > 0.22 ? H_(f0 + 0.1, fe - 0.07, R1 - 8) : '');
          arc.h.style.opacity = String(hs[i]);
          const o = hs[i] * 5;
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
      const k = (e.currentTarget as HTMLElement).dataset.k || 'sleep';
      spotlight(k);
      const target = document.getElementById('db-msList') || document.getElementById('db-tiles');
      target?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
      toast(`Jumped to today's ${dn(k)} missions.`);
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
  const hidden = new Set<string>();

  function getDynamicSeries() {
    const focusVal = typeof state.dims.focus === 'number' ? state.dims.focus : 84;
    const sleepVal = typeof state.dims.sleep === 'number' ? state.dims.sleep : 61;
    const healthVal = typeof state.dims.health === 'number' ? state.dims.health : 68;

    let socialH = 3;
    let midFreq: 'never' | 'sometimes' | 'often' = 'never';
    try {
      const saved = JSON.parse(localStorage.getItem('lifeos-phone-habits') || '{}');
      if (typeof saved.socialHoursPerDay === 'number') socialH = saved.socialHoursPerDay;
      if (saved.midnightFrequency) midFreq = saved.midnightFrequency;
    } catch {}

    // Focus curve across 9 intervals: 6, 8, 10, 12, 14, 16, 18, 20, 22
    const baseFocusProfile = [0.30, 0.62, 0.86, 0.90, 0.54, 0.42, 0.45, 0.54, 0.36];
    const afternoonPenalty = socialH >= 4 ? Math.min(18, (socialH - 2) * 3) : socialH >= 2 ? (socialH - 1.5) * 2 : 0;
    
    const focusV = baseFocusProfile.map((mult, idx) => {
      let raw = (focusVal / 84) * (mult * 85);
      if (idx >= 4 && idx <= 6) raw -= afternoonPenalty;
      return clamp(Math.round(raw), 15, 98);
    });

    // Recovery curve
    const baseRecProfile = [0.82, 0.52, 0.33, 0.29, 0.34, 0.44, 0.62, 0.68, 1.0];
    const midnightPenalty = midFreq === 'often' ? 14 : midFreq === 'sometimes' ? 7 : 0;
    const recV = baseRecProfile.map((mult, idx) => {
      let raw = (sleepVal / 61) * (mult * 76);
      if (idx >= 7) raw -= midnightPenalty;
      return clamp(Math.round(raw), 18, 98);
    });

    // Energy curve
    const combinedVitality = (healthVal * 0.55 + sleepVal * 0.45);
    const baseEnergyProfile = [0.38, 0.74, 0.95, 0.88, 0.62, 0.48, 0.58, 0.53, 0.59];
    const energyV = baseEnergyProfile.map((mult) => {
      let raw = (combinedVitality / 65) * (mult * 82);
      return clamp(Math.round(raw), 20, 98);
    });

    return [
      { id: 'focus', name: 'Focus', c: 'var(--focus)', grad: 'grad-focus', v: focusV },
      { id: 'energy', name: 'Energy', c: 'var(--energy)', grad: 'grad-energy', v: energyV },
      { id: 'recovery', name: 'Recovery', c: 'var(--recovery)', grad: 'grad-recovery', v: recV },
    ];
  }

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
      H = Math.min(200, Math.max(160, W * 0.28));
    const ml = 32,
      mr = 12,
      mt = 22,
      mb = 24,
      iw = W - ml - mr,
      ih = H - mt - mb;
    const X = (h: number) => ml + ((h - 6) / 16) * iw,
      Y = (v: number) => mt + (1 - v / 100) * ih;

    const SER = getDynamicSeries();

    // Dynamically calculate peak focus window
    const focusVals = SER.find(s => s.id === 'focus')?.v || [];
    let peakIdx = 2;
    let maxF = -1;
    focusVals.forEach((val, idx) => {
      if (val > maxF) { maxF = val; peakIdx = idx; }
    });
    const peakHour = HRS[peakIdx] || 10;
    const bestStart = Math.max(6, peakHour - 1);
    const bestEnd = Math.min(22, peakHour + 1);
    const BEST = [bestStart, bestEnd];

    // Update bottom recommendation banner text
    const bestT = $('#db-bestT');
    if (bestT) bestT.textContent = `${fmtH(bestStart)} – ${fmtH(bestEnd)}`;

    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart of focus, energy and recovery from 6 AM to 10 PM.">
      <defs>
        <linearGradient id="grad-focus" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--focus)" stop-opacity="0.25" />
          <stop offset="80%" stop-color="var(--focus)" stop-opacity="0.02" />
          <stop offset="100%" stop-color="var(--focus)" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="grad-energy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--energy)" stop-opacity="0.22" />
          <stop offset="80%" stop-color="var(--energy)" stop-opacity="0.02" />
          <stop offset="100%" stop-color="var(--energy)" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="grad-recovery" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--recovery)" stop-opacity="0.22" />
          <stop offset="80%" stop-color="var(--recovery)" stop-opacity="0.02" />
          <stop offset="100%" stop-color="var(--recovery)" stop-opacity="0" />
        </linearGradient>
        <filter id="chart-glow" x="-10%" y="-20%" width="120%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity="0.12" />
        </filter>
      </defs>`;

    // Subtle modern gridlines
    [0, 25, 50, 75, 100].forEach((v) => {
      s += `<line class="gridl" x1="${ml}" x2="${W - mr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="axis" x="${ml - 8}" y="${
        Y(v) + 4
      }" text-anchor="end">${v}</text>`;
    });

    HRS.forEach((h) => {
      s += `<text class="axis" x="${X(h)}" y="${H - 6}" text-anchor="middle">${lbl(h)}</text>`;
    });

    // Best focus window band
    const bx = X(BEST[0]),
      bw = X(BEST[1]) - bx;
    s += `<rect class="band" x="${bx}" y="${mt}" width="${bw}" height="${ih}" rx="10"/>`;
    s += `<g transform="translate(${bx + bw / 2} ${
      mt - 6
    })"><rect class="band-tip-bg" x="-60" y="-18" width="120" height="30" rx="9" fill="var(--btn)"/><text class="band-tip-txt" x="0" y="-5" text-anchor="middle" font-size="9.5" font-weight="600" fill="var(--btnink)" font-family="var(--sans)">Best focus window</text><text class="band-tip-sub" x="0" y="7" text-anchor="middle" font-size="9" fill="var(--btnink)" opacity=".8" font-family="var(--sans)">${fmtH(bestStart)} – ${fmtH(bestEnd)}</text></g>`;

    // Now indicator
    const n = new Date(),
      nh = n.getHours() + n.getMinutes() / 60;
    if (nh > 6.3 && nh < 21.7) {
      s += `<line class="now" x1="${X(nh)}" x2="${X(nh)}" y1="${mt}" y2="${mt + ih}"/><g transform="translate(${X(nh)} ${
        mt + ih - 4
      })"><rect x="-16" y="-16" width="32" height="18" rx="9" fill="var(--sleep)"/><text class="nowl" x="0" y="-3.5" text-anchor="middle">Now</text></g>`;
    }

    // 1) Render area fills first (for modern depth)
    SER.forEach((se) => {
      if (hidden.has(se.id)) return;
      let d = '';
      for (let h = 6; h <= 22.001; h += 0.25) {
        d += (d ? 'L' : 'M') + X(h).toFixed(1) + ',' + Y(cr(se.v, h)).toFixed(1);
      }
      const areaD = d + ` L${X(22).toFixed(1)},${Y(0).toFixed(1)} L${X(6).toFixed(1)},${Y(0).toFixed(1)} Z`;
      s += `<path class="ser-area" d="${areaD}" fill="url(#${se.grad})"/>`;
    });

    // 2) Render lines & points with glow
    SER.forEach((se) => {
      if (hidden.has(se.id)) return;
      let d = '';
      for (let h = 6; h <= 22.001; h += 0.25) {
        d += (d ? 'L' : 'M') + X(h).toFixed(1) + ',' + Y(cr(se.v, h)).toFixed(1);
      }
      s += `<path class="ser${!drewOnce && !reduced() ? ' ser-draw' : ''}" pathLength="1" d="${d}" stroke="${se.c}" stroke-width="2.6" filter="url(#chart-glow)"/>`;
      HRS.forEach((h, i) => {
        s += `<circle class="pt-halo" cx="${X(h)}" cy="${Y(se.v[i])}" r="5" fill="var(--card)" stroke="${se.c}" stroke-width="2"/>`;
        s += `<circle class="pt" cx="${X(h)}" cy="${Y(se.v[i])}" r="2.2" fill="${se.c}"/>`;
      });
    });

    s += `<g id="db-xh" style="display:none"><line class="xh" y1="${mt}" y2="${mt + ih}"/>${SER.map(
      (se) => `<circle id="db-xd-${se.id}" r="5.5" fill="${se.c}" stroke="var(--card)" stroke-width="2"/>`
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
        rows += `<span><i style="background:${se.c}"></i>${se.name} <b>${Math.round(v)}%</b></span>`;
      });
      tip.innerHTML = `<div class="tip-time">${fmtH(Math.round(h * 4) / 4)}</div><div class="tip-rows">${rows}</div>`;
      const tw = tip.offsetWidth || 120;
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
    const SER = getDynamicSeries();
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
    const d = state.dims;
    const walkDone = mdone.has('m2');
    const I = [
      {
        c: 'health',
        ic: 'health',
        t: 'Active Momentum Streak',
        p: `You're at ${steps.toLocaleString('en-US')} steps today. A quick 15-min walk will hit your daily activity goal and unlock +15 XP.`,
        a: walkDone ? 'Walk logged today ✓' : 'Log 15-min walk (+15 XP)',
        f: () => {
          if (!mdone.has('m2')) {
            mdone.add('m2');
            steps += 1200;
            state.dims.health = clamp(state.dims.health + 2);
            state.dims.focus = clamp(state.dims.focus + 1);
            xp += 15;
            setXP();
            renderMissions();
            renderGlance();
            renderInsights();
            celebrate();
            toast('🚶 15-min walk logged! +1,200 steps & +15 XP earned.');
          } else {
            $('#db-msList')?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
            toast('Walk goal already completed for today!');
          }
        },
      },
      {
        c: 'focus',
        ic: 'sun',
        t: 'Peak Focus Window: 9–11 AM',
        p: 'Your natural circadian rhythm peaks from 9:00–11:00 AM. Guard these two hours from shallow distractions.',
        a: 'Protect on Calendar 📅',
        f: () => {
          const rh = $('#db-chart') || $('#db-rhT');
          rh?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
          const blockBtn = document.getElementById('db-blockBtn') as HTMLElement;
          if (blockBtn && blockBtn.getAttribute('aria-pressed') !== 'true') {
            blockBtn.click();
          } else {
            toast('📅 9:00 – 11:00 AM is protected on your calendar for Deep Work.');
          }
        },
      },
      {
        c: 'study',
        ic: 'study',
        t: 'Marketing Exam in 3 Days',
        p: 'Exam readiness is at 73%. Completing today’s notes will advance your score past the 85% mastery threshold.',
        a: 'Start Study Session ⏱',
        f: () => {
          spotlight('study');
          const ms = $('#db-msList');
          ms?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
          toast('🎓 Marketing Exam review block started! Let’s lock in +3 Study XP.');
        },
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
    const findEl = (s: string) => (root.querySelector(s) || document.querySelector(s)) as HTMLElement | null;
    const base = state.dims,
      proj = project(base, plan);
    const b0 = balance(base),
      b1 = balance(proj),
      df = b1 - b0;

    const rSleep = findEl('#db-rSleep') as HTMLInputElement;
    if (rSleep) {
      if (document.activeElement !== rSleep) rSleep.value = String(plan.sleep || 0);
      rSleep.style.setProperty('--pct', `${((plan.sleep || 0) / 2) * 100}%`);
    }
    const rStudy = findEl('#db-rStudy') as HTMLInputElement;
    if (rStudy) {
      if (document.activeElement !== rStudy) rStudy.value = String(plan.study || 0);
      rStudy.style.setProperty('--pct', `${((plan.study || 0) / 3) * 100}%`);
    }
    const rSteps = findEl('#db-rSteps') as HTMLInputElement;
    if (rSteps) {
      if (document.activeElement !== rSteps) rSteps.value = String(plan.steps || 0);
      rSteps.style.setProperty('--pct', `${((plan.steps || 0) / 5000) * 100}%`);
    }

    const oSleep = findEl('#db-oSleep');
    if (oSleep) {
      oSleep.textContent = plan.sleep ? `${plan.sleep}h earlier · bed by ${bedtime(plan.sleep)}` : 'No change';
      oSleep.classList.toggle('active', !!plan.sleep);
    }
    const oStudy = findEl('#db-oStudy');
    if (oStudy) {
      oStudy.textContent = plan.study ? `+${plan.study}h a day` : 'No change';
      oStudy.classList.toggle('active', !!plan.study);
    }
    const oSteps = findEl('#db-oSteps');
    if (oSteps) {
      oSteps.textContent = plan.steps ? `+${plan.steps.toLocaleString('en-US')} steps` : 'No change';
      oSteps.classList.toggle('active', !!plan.steps);
    }
    const wiA = findEl('#db-wiA');
    if (wiA) wiA.textContent = String(b0);
    const wiB = findEl('#db-wiB');
    if (wiB) wiB.textContent = String(b1);
    const D = findEl('#db-wiD');
    if (D) {
      D.textContent = df !== 0 ? `${df > 0 ? '+' : ''}${df}` : '0';
      D.classList.toggle('neg', df < 0);
    }
    const ds = DIMS.map((m) => ({ n: m.name, d: Math.round(proj[m.k]) - Math.round(base[m.k]) }))
      .filter((x) => x.d !== 0)
      .sort((a, b) => b.d - a.d);
    const up = ds.filter((x) => x.d > 0).slice(0, 2),
      down = ds.filter((x) => x.d < 0)[0];
    const wiN = findEl('#db-wiN');
    if (wiN) {
      wiN.textContent = ds.length
        ? `${up.length ? `This plan lifts ${up.map((u) => `${u.n} by ${u.d}`).join(' and ')}` : 'This plan costs more than it gives'}${
            down ? `, while ${down.n} slips ${-down.d}` : ''
          }. Balance moves from ${b0} to ${b1}.`
        : 'Move a lever to see how one change spreads across all six dimensions.';
    }
    const wiRows = findEl('#db-wiRows');
    if (wiRows) {
      wiRows.innerHTML = DIMS.map((m) => {
        const a = Math.round(base[m.k]),
          c = Math.round(proj[m.k]),
          dl = c - a;
        const baseW = Math.min(a, c);
        const gainW = c > a ? c - a : 0;
        const lossW = c < a ? a - c : 0;
        return `<div class="wr" style="--c:var(--${m.k})">
          <span class="wr-name"><i class="wr-dot" style="background:var(--${m.k})"></i>${m.name}</span>
          <div class="wr-track">
            <div class="wr-fill base" style="width:${baseW}%;background:var(--${m.k})"></div>
            ${gainW > 0 ? `<div class="wr-fill gain" style="left:${a}%;width:${gainW}%;background:var(--${m.k})"></div>` : ''}
            ${lossW > 0 ? `<div class="wr-fill loss" style="left:${c}%;width:${lossW}%"></div>` : ''}
          </div>
          <div class="wr-meta">
            <span class="wr-num">${c}</span>
            ${dl !== 0 ? `<span class="wr-delta ${dl > 0 ? 'pos' : 'neg'}">${dl > 0 ? '+' + dl : dl}</span>` : '<span class="wr-delta-empty"></span>'}
          </div>
        </div>`;
      }).join('');
    }
    const wiE = findEl('#db-wiE');
    if (wiE) wiE.textContent = exam(plan) + '%';

    // ── Impact Stats Strip (use getElementById for reliability) ──
    const hasChange = plan.sleep !== 0 || plan.study !== 0 || plan.steps !== 0;
    const wisTop  = document.getElementById('db-wisTop');
    const wisExam = document.getElementById('db-wisExam');
    const wisBal  = document.getElementById('db-wisBal');

    const examPct = exam(plan);
    if (wisExam) wisExam.textContent = examPct + '%';

    const topGainer = DIMS
      .map((m) => ({ n: m.name, d: Math.round(proj[m.k]) - Math.round(base[m.k]) }))
      .sort((a, b) => b.d - a.d)[0];

    if (wisTop) {
      if (hasChange && topGainer && topGainer.d !== 0) {
        wisTop.textContent = `${topGainer.n} ${topGainer.d > 0 ? '+' : ''}${topGainer.d}`;
        wisTop.className = 'wis-val' + (topGainer.d > 0 ? ' pos' : ' neg');
      } else {
        wisTop.textContent = '—';
        wisTop.className = 'wis-val';
      }
    }
    if (wisBal) {
      if (hasChange && df !== 0) {
        wisBal.textContent = df > 0 ? `+${df}` : String(df);
        wisBal.className = 'wis-val' + (df > 0 ? ' pos' : ' neg');
      } else {
        wisBal.textContent = df !== 0 ? (df > 0 ? `+${df}` : String(df)) : '0';
        wisBal.className = 'wis-val' + (df > 0 ? ' pos' : df < 0 ? ' neg' : '');
      }
    }
  }

  function openWhatIf(preset: any = {}) {
    const findEl = (s: string) => (root.querySelector(s) || document.querySelector(s)) as HTMLElement | null;
    plan.sleep = preset.sleep || 0;
    plan.study = preset.study || 0;
    plan.steps = preset.steps || 0;
    const drawer = findEl('#db-drawer');
    if (drawer) {
      drawer.removeAttribute('inert');
      drawer.classList.add('on');
    }
    const scrim = findEl('#db-scrim');
    if (scrim) scrim.classList.add('on');
    // Lock page scroll — both html and body to cover all browsers
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    renderWhatIf();
    lastFocus = document.activeElement;
    setTimeout(() => findEl('#db-drClose')?.focus(), 60);
  }

  function closeWhatIf() {
    const findEl = (s: string) => (root.querySelector(s) || document.querySelector(s)) as HTMLElement | null;
    const drawer = findEl('#db-drawer');
    if (drawer) drawer.classList.remove('on');
    const scrim = findEl('#db-scrim');
    if (scrim) scrim.classList.remove('on');
    // Restore page scroll
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  const updateLever = (k: 'sleep' | 'study' | 'steps', val: number) => {
    plan[k] = val;
    renderWhatIf();
  };

  const onRangeEvent = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (!t || !t.id) return;
    if (t.id === 'db-rSleep') updateLever('sleep', parseFloat(t.value) || 0);
    else if (t.id === 'db-rStudy') updateLever('study', parseFloat(t.value) || 0);
    else if (t.id === 'db-rSteps') updateLever('steps', parseFloat(t.value) || 0);
  };
  root.addEventListener('input', onRangeEvent, true);
  root.addEventListener('change', onRangeEvent, true);
  window.addEventListener('input', onRangeEvent, true);
  window.addEventListener('change', onRangeEvent, true);

  const rSleepInput = $('#db-rSleep') as HTMLInputElement;
  if (rSleepInput) {
    const fn = () => updateLever('sleep', parseFloat(rSleepInput.value) || 0);
    rSleepInput.oninput = fn;
    rSleepInput.onchange = fn;
  }
  const rStudyInput = $('#db-rStudy') as HTMLInputElement;
  if (rStudyInput) {
    const fn = () => updateLever('study', parseFloat(rStudyInput.value) || 0);
    rStudyInput.oninput = fn;
    rStudyInput.onchange = fn;
  }
  const rStepsInput = $('#db-rSteps') as HTMLInputElement;
  if (rStepsInput) {
    const fn = () => updateLever('steps', parseFloat(rStepsInput.value) || 0);
    rStepsInput.oninput = fn;
    rStepsInput.onchange = fn;
  }

  const drCloseBtn = $('#db-drClose');
  if (drCloseBtn) drCloseBtn.onclick = closeWhatIf;
  const scrim = $('#db-scrim');
  if (scrim) scrim.onclick = closeWhatIf;

  const ctaWhat = $('#db-ctaWhat');
  if (ctaWhat) ctaWhat.onclick = () => openWhatIf({ sleep: 1 });
  const tabWhatIf = $('#db-tabWhatIf');
  if (tabWhatIf) tabWhatIf.onclick = () => openWhatIf({ sleep: 1 });

  // ── Drawer buttons: use document-level delegation so they always fire ──
  function applyPlan() {
    const before = balance(state.dims),
      next = project(state.dims, plan);
    DIMS.forEach((m) => (state.dims[m.k] = Math.round(next[m.k])));
    const after = balance(state.dims);
    closeWhatIf();
    refreshAll();
    toast(after === before ? 'Plan applied. Balance holds at ' + after + '.' : `Plan applied. Balance ${before} → ${after}.`);
    if (opts.onApplyPlan) opts.onApplyPlan(state.dims);
  }

  function resetDemo() {
    state.dims = { ...BASE };
    plan.sleep = plan.study = plan.steps = 0;
    mdone.clear();
    xp = 640;
    level = 7;
    const rSleep = document.getElementById('db-rSleep') as HTMLInputElement;
    if (rSleep) rSleep.value = '0';
    const rStudy = document.getElementById('db-rStudy') as HTMLInputElement;
    if (rStudy) rStudy.value = '0';
    const rSteps = document.getElementById('db-rSteps') as HTMLInputElement;
    if (rSteps) rSteps.value = '0';
    refreshAll();
    renderMissions();
    setXP();
    renderWhatIf();
    toast('Back to the demo data.');
  }

  (window as any).lifeOSApplyPlan = applyPlan;
  (window as any).lifeOSResetDemo = resetDemo;

  // Single delegated click on document catches Apply + Reset even if React re-renders
  const onDrawerClick = (e: MouseEvent) => {
    const t = e.target as Element;
    if (t.closest('#db-wiApply')) { applyPlan(); return; }
    if (t.closest('#db-wiReset')) { resetDemo(); return; }
  };
  document.addEventListener('click', onDrawerClick, true);

  function refreshAll() {
    renderNav();
    renderOrbit();
    renderList();
    updateBalance();
    renderInsights();
    setNote();
    syncSpot();
    renderWeekly();
    renderChart();
  }

  // Reactive listener for phone habits updates from Dashboard widgets
  const onHabitsChange = () => {
    if (!cancelled) {
      renderChart();
    }
  };
  window.addEventListener('lifeos:phone-habits-changed', onHabitsChange);

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

  /* particles removed for a clean, distraction-free orbit */
  function stars() {
    return '';
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

      // Cleanly offset start and end points by 34px towards the curve control point so lines don't collide with disks or text
      const d1 = Math.hypot(qx - x1, qy - y1) || 1;
      const sx = x1 + ((qx - x1) / d1) * 34;
      const sy = y1 + ((qy - y1) / d1) * 34;
      const d2 = Math.hypot(qx - x2, qy - y2) || 1;
      const ex = x2 + ((qx - x2) / d2) * 34;
      const ey = y2 + ((qy - y2) / d2) * 34;

      const lx = 0.25 * sx + 0.5 * qx + 0.25 * ex,
        ly = 0.25 * sy + 0.5 * qy + 0.25 * ey;

      o += `<g class="lk" style="--c:var(--${a.k});--i:${i}">
        <path d="M${sx.toFixed(1)},${sy.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}"/>
        <g class="lk-pill" transform="translate(${lx.toFixed(1)}, ${ly.toFixed(1)})">
          <rect x="-30" y="-11" width="60" height="22" rx="11" class="lk-pill-bg" />
          <text x="0" y="3.5" text-anchor="middle" class="lk-pill-txt">${verb}</text>
        </g>
      </g>`;
    });
    return o;
  }

  /* hyper-realistic telemetry sparkline graph */
  function spark(a: number[], w: number, h: number, color: string, k: string) {
    const mn = Math.min(...a) - 4,
      mx = Math.max(...a) + 4,
      X = (i: number) => 12 + (i / (a.length - 1)) * (w - 24),
      Y = (v: number) => h - 14 - ((v - mn) / (mx - mn)) * (h - 26);
    const pts = a.map((v, i) => [X(i), Y(v)]);
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1],
        [x1, y1] = pts[i],
        c = (x0 + x1) / 2;
      d += ` C${c.toFixed(1)},${y0.toFixed(1)} ${c.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    const gid = `sp-grad-${k}`;
    const fltid = `sp-flt-${k}`;

    const gridY1 = (h * 0.28).toFixed(1);
    const gridY2 = (h * 0.54).toFixed(1);
    const gridY3 = (h * 0.8).toFixed(1);

    const nodes = pts
      .map(
        ([px, py], i) => `
        <g class="sp-node">
          <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${i === 6 ? '5' : '2.5'}" fill="${
            i === 6 ? '#fff' : color
          }" stroke="${color}" stroke-width="${i === 6 ? '2.8' : '1.2'}"/>
        </g>`
      )
      .join('');

    return `<svg class="hyper-graph" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" aria-hidden="true">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.48"/>
          <stop offset="45%" stop-color="${color}" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.0"/>
        </linearGradient>
        <filter id="${fltid}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Telemetry horizon grid -->
      <line class="sp-grid" x1="6" y1="${gridY1}" x2="${w - 6}" y2="${gridY1}"/>
      <line class="sp-grid" x1="6" y1="${gridY2}" x2="${w - 6}" y2="${gridY2}"/>
      <line class="sp-grid" x1="6" y1="${gridY3}" x2="${w - 6}" y2="${gridY3}"/>
      <!-- Luminous Area Fill -->
      <path class="sp-area" d="${d} L${(w - 12).toFixed(1)},${h} L12,${h}Z" fill="url(#${gid})"/>
      <!-- Diffuse Ambient Neon Tube Glow -->
      <path d="${d}" fill="none" stroke="${color}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.38" filter="url(#${fltid})"/>
      <!-- Main Colored Laser Core -->
      <path class="sp-l" d="${d}" fill="none" stroke="${color}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Razor Specular Thread -->
      <path d="${d}" fill="none" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
      <!-- Daily Telemetry Nodes -->
      ${nodes}
      <!-- Radar Pulse at Current Day 7 -->
      <circle class="sp-radar" cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="5" fill="none" stroke="${color}" stroke-width="2"/>
      <circle class="sp-radar r2" cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="5" fill="none" stroke="#fff" stroke-width="1.5"/>
    </svg>`;
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
        <div class="sp-left">
          <div class="sp-v"><span class="sp-n">${v}</span><span class="sp-u">%</span></div>
          <span class="sp-tag"><i class="sp-dot"></i>${dn(k)}</span>
        </div>
        <div class="sp-c">
          <div class="sp-graph-hdr">
            <span class="sp-gh-title">7-DAY TELEMETRY</span>
            <span class="sp-pill ${dl >= 0 ? 'pos' : 'neg'}">${dl >= 0 ? '▲ +' : '▼ -'}${Math.abs(dl)} pts</span>
          </div>
          ${spark(h, 250, 72, COLORS[k], k)}
        </div>
        <button class="mini" id="db-spotAct">
          <span>${act ? 'Simulate a change' : 'Log a spend'}</span>
          ${ic('arrow', 13, 2)}
        </button>
      </div>`;
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
    renderWhatIf();
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
    // Always restore body scroll on unmount
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', sizeFx);
    window.removeEventListener('lifeos:phone-habits-changed', onHabitsChange);
    root.removeEventListener('pointermove', onPointerMove);
    root.removeEventListener('click', onBootClick);
    document.removeEventListener('click', onDrawerClick, true);
  };
}
