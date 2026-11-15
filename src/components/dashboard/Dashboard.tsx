'use client';

import React, { useEffect, useRef } from 'react';
import { useLifeStore } from '@/store/lifeStore';
import './dashboard.css';
import { initDashboard } from './dashboardEngine';
import { DimensionId } from '@/data/demo-data';

function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function Dashboard() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [appliedPlan, setAppliedPlan] = React.useState<{
    scenarioId: string;
    headline: string;
    socialHours?: number;
    noPhoneAfterMidnight?: boolean;
    bedtime?: string;
    sleepHours?: string;
    studyHours?: string;
    scoresBefore: number[];
    scoresAfter: number[];
    lifeBalanceBefore: number;
    lifeBalanceAfter: number;
    actionLine?: string;
    topGains?: string;
    appliedAt: string;
  } | null>(null);

  /* Phone habits & Nudges state */
  const [socialHours, setSocialHours] = React.useState<number>(3);
  const [midnightFreq, setMidnightFreq] = React.useState<'never' | 'sometimes' | 'often'>('never');
  const [dismissedNudges, setDismissedNudges] = React.useState<string[]>([]);
  const [showWhyId, setShowWhyId] = React.useState<string | null>(null);
  const [habitsMounted, setHabitsMounted] = React.useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lifeos.appliedPlan');
      if (saved) {
        setAppliedPlan(JSON.parse(saved));
      }
    } catch {}

    try {
      const savedHabits = localStorage.getItem('lifeos-phone-habits');
      if (savedHabits) {
        const parsed = JSON.parse(savedHabits);
        if (typeof parsed.socialHoursPerDay === 'number') {
          setSocialHours(parsed.socialHoursPerDay);
        }
        if (parsed.midnightFrequency) {
          setMidnightFreq(parsed.midnightFrequency);
        }
      }
      const dateKey = `lifeos-nudges-dismissed-${getLocalDateString()}`;
      const savedDismissed = localStorage.getItem(dateKey);
      if (savedDismissed) {
        setDismissedNudges(JSON.parse(savedDismissed));
      }
    } catch {}

    setHabitsMounted(true);
  }, []);

  const handleRemovePlan = () => {
    try {
      localStorage.removeItem('lifeos.appliedPlan');
    } catch {}
    setAppliedPlan(null);
  };

  const handleSocialChange = (nextVal: number) => {
    const clamped = Math.max(0, Math.min(12, +(nextVal.toFixed(1))));
    setSocialHours(clamped);
    try {
      const existing = JSON.parse(localStorage.getItem('lifeos-phone-habits') || '{}');
      const updated = {
        ...existing,
        socialHoursPerDay: clamped,
        midnightFrequency: midnightFreq,
      };
      localStorage.setItem('lifeos-phone-habits', JSON.stringify(updated));
      useLifeStore.getState().setPhoneHabits(updated);
      window.dispatchEvent(new CustomEvent('lifeos:phone-habits-changed'));
    } catch {}
  };

  const handleMidnightFreqChange = (freq: 'never' | 'sometimes' | 'often') => {
    setMidnightFreq(freq);
    try {
      const existing = JSON.parse(localStorage.getItem('lifeos-phone-habits') || '{}');
      const updated = {
        ...existing,
        socialHoursPerDay: socialHours,
        midnightFrequency: freq,
      };
      localStorage.setItem('lifeos-phone-habits', JSON.stringify(updated));
      useLifeStore.getState().setPhoneHabits(updated);
      window.dispatchEvent(new CustomEvent('lifeos:phone-habits-changed'));
    } catch {}
  };

  const handleDismissNudge = (nudgeId: string) => {
    const updated = [...dismissedNudges, nudgeId];
    setDismissedNudges(updated);
    try {
      const dateKey = `lifeos-nudges-dismissed-${getLocalDateString()}`;
      localStorage.setItem(dateKey, JSON.stringify(updated));
    } catch {}
  };

  const handleTryInWhatIf = () => {
    const tabWhatIf = document.getElementById('db-tabWhatIf');
    if (tabWhatIf) {
      tabWhatIf.click();
    }
  };

  /* Nudge candidate evaluation */
  const candidateNudges: Array<{
    id: string;
    category: 'focus' | 'sleep' | 'balanced';
    badge: string;
    text: string;
    actionText?: string;
    why: string;
  }> = [];

  if (socialHours >= 4) {
    candidateNudges.push({
      id: 'nudge-social-high',
      category: 'focus',
      badge: 'Focus impact',
      text: 'High social media time is associated with weaker focus. Try cutting 30–60 minutes today.',
      actionText: 'Try it in What if',
      why: 'Suggested because your reported social media time is 4 hours or more per day.'
    });
  } else if (socialHours >= 2 && socialHours < 4) {
    candidateNudges.push({
      id: 'nudge-social-mod',
      category: 'focus',
      badge: 'Study opportunity',
      text: 'Moderate use. One 30-minute cut would free time for study.',
      actionText: 'Try it in What if',
      why: 'Suggested because your reported social media time is between 2 and 4 hours per day.'
    });
  }

  if (midnightFreq === 'sometimes' || midnightFreq === 'often') {
    candidateNudges.push({
      id: 'nudge-midnight',
      category: 'sleep',
      badge: 'Sleep routine',
      text: 'Late-night phone use is associated with later sleep. Try keeping your phone away from bed tonight.',
      why: `Suggested because your phone use after midnight this week is marked as "${midnightFreq}".`
    });
  }

  let displayedNudges: Array<{
    id: string;
    category: 'focus' | 'sleep' | 'balanced';
    badge: string;
    text: string;
    actionText?: string;
    why: string;
  }> = [];

  if (candidateNudges.length === 0) {
    if (!dismissedNudges.includes('nudge-balanced')) {
      displayedNudges = [{
        id: 'nudge-balanced',
        category: 'balanced',
        badge: 'Balanced',
        text: 'Your phone habits look balanced today.',
        why: 'Suggested because your social media use is under 2 hours and you rarely use your phone past midnight.'
      }];
    }
  } else {
    displayedNudges = candidateNudges.filter(n => !dismissedNudges.includes(n.id)).slice(0, 2);
  }

  useEffect(() => {
    if (!rootRef.current) return;

    const state = useLifeStore.getState();
    const name = state.profile.name || 'Alex';
    const dims = state.dimensions;
    const scores: Record<string, number> = {
      study: dims.study?.score ?? 82,
      focus: dims.focus?.score ?? 84,
      health: dims.health?.score ?? 68,
      sleep: dims.sleep?.score ?? 61,
      money: dims.money?.score ?? 74,
      goals: dims.goals?.score ?? 79,
    };

    const cleanup = initDashboard(rootRef.current, {
      name,
      scores,
      onApplyPlan: (newScores) => {
        Object.entries(newScores).forEach(([k, v]) => {
          useLifeStore.getState().updateDimensionScore(k as DimensionId, v);
        });
      },
    });

    return () => {
      cleanup();
    };
  }, []);

  return (
    <div className="db" data-theme="light" id="db-root" ref={rootRef}>
      <div className="aurora" aria-hidden="true">
        <i></i>
        <i></i>
        <i></i>
      </div>

      <div className="boot" id="db-boot" role="presentation">
        <div className="boot-c">
          <div className="boot-orb">
            <i style={{ '--r': '0deg', '--k': 0, '--c': '#6b8cff' } as any}></i>
            <i style={{ '--r': '60deg', '--k': 1, '--c': '#f2a22a' } as any}></i>
            <i style={{ '--r': '120deg', '--k': 2, '--c': '#45c388' } as any}></i>
            <i style={{ '--r': '180deg', '--k': 3, '--c': '#8a6cf2' } as any}></i>
            <i style={{ '--r': '240deg', '--k': 4, '--c': '#3dbfab' } as any}></i>
            <i style={{ '--r': '300deg', '--k': 5, '--c': '#ee6e5a' } as any}></i>
            <b></b>
          </div>
          <div className="boot-word" aria-label="LifeOS">
            <img src="/logo.png" alt="LifeOS" className="boot-logo" />
          </div>
          <p className="boot-tag">Your life, in one clear view.</p>
          <div className="boot-bar">
            <i></i>
          </div>
          <p className="boot-skip">Click anywhere to skip</p>
        </div>
      </div>

      <header className="top">
        <div className="brand">
          <img src="/logo.png" alt="LifeOS" className="brand-logo" />
          <span className="demo">
            <i></i>Demo data
          </span>
        </div>
        <div className="top-r">
          <nav className="tabs" aria-label="Views">
            <button className="tab on" aria-current="page">
              Home
            </button>
            <button className="tab" id="db-tabWhatIf">
              What If?
            </button>
          </nav>
          <button
            className="icon-btn"
            id="db-calmBtn"
            aria-pressed="false"
            aria-label="Calm mode: stop motion and raise contrast"
            title="Calm mode"
          ></button>
          <button className="icon-btn" id="db-themeBtn" aria-label="Switch between light and dark" title="Theme"></button>
        </div>
      </header>

      <div className="shell">
        <aside className="side">
          <nav className="nav" id="db-nav" aria-label="Dimensions"></nav>
          <div className="side-card" id="db-sideCard"></div>
        </aside>

        <main id="db-main">
          <div className="hero rv" style={{ '--s': 0 } as any}>
            <div>
              <p className="eyebrow" id="db-dateEl"></p>
              <h1 className="serif" id="db-greet">
                Good afternoon, Alex.
              </h1>
              <p className="lede" id="db-lede">
                Here’s your life today. See what needs your attention.
              </p>
            </div>
            <div className="hero-r">
              <span className="livechip" id="db-liveChip">
                <i></i>Checking your focus window
              </span>
              <button className="ask" id="db-askBtn" aria-label="Open command palette"></button>
            </div>
          </div>

          {appliedPlan && (
            <div className="db-plan-card rv" style={{ '--s': 0.5 } as any}>
              <div className="db-plan-left">
                <div className="db-plan-badge">
                  <span className="db-plan-dot"></span>
                  <span>Active plan</span>
                </div>
                <h2 className="db-plan-headline">{appliedPlan.headline}</h2>
                <p className="db-plan-action">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{appliedPlan.actionLine || 'Stay on track today'}</span>
                </p>
              </div>

              <div className="db-plan-stats">
                <div className="db-plan-stat">
                  <span className="db-plan-stat-lbl">Expected life balance</span>
                  <span className="db-plan-stat-val">
                    {appliedPlan.lifeBalanceBefore} <i>→</i> <b>{appliedPlan.lifeBalanceAfter}</b>
                  </span>
                </div>
                {appliedPlan.topGains && (
                  <div className="db-plan-stat">
                    <span className="db-plan-stat-lbl">Top gains</span>
                    <span className="db-plan-stat-gains">{appliedPlan.topGains}</span>
                  </div>
                )}
              </div>

              <div className="db-plan-action-btn">
                <button
                  type="button"
                  className="db-plan-remove"
                  onClick={handleRemovePlan}
                  aria-label="Remove active plan"
                >
                  Remove plan
                </button>
              </div>
            </div>
          )}

          <section className="grid g1 rv" style={{ '--s': 1 } as any}>
            <article className="card orbit-card" aria-labelledby="db-orbT">
              <div className="card-h">
                <h2 className="lab" id="db-orbT">
                  Your life orbit
                </h2>
                <div className="seg" role="group" aria-label="View">
                  <button id="db-vOrbit" aria-pressed="true">
                    Orbit
                  </button>
                  <button id="db-vList" aria-pressed="false">
                    List
                  </button>
                </div>
              </div>
              <div className="orbit-wrap" id="db-orbitWrap"></div>
              <div className="list" id="db-orbList"></div>
              <div className="spot" id="db-spot">
                <div className="spot-in" id="db-spotIn"></div>
              </div>
              <p className="orb-note" id="db-orbNote" aria-live="polite"></p>
            </article>

            <article className="card bal" aria-labelledby="db-balT">
              <h2 className="lab" id="db-balT">
                Your balance
              </h2>
              <div className="bal-main">
                <div className="bal-dial-wrap" id="db-balDialWrap">
                  <div className="dial" id="db-dial">
                    <svg
                      id="db-dsv"
                      viewBox="-170 -170 340 340"
                      role="img"
                      aria-label="Life balance dial with six areas"
                    >
                      <defs>
                        <radialGradient id="db-plate" cx=".4" cy=".35" r=".8">
                          <stop offset="0" stopColor="#fff" />
                          <stop offset="1" stopColor="#EEEAE1" />
                        </radialGradient>
                        <radialGradient id="db-sh" gradientUnits="userSpaceOnUse" cx="0" cy="-60" r="150">
                          <stop offset="0" stopColor="#fff" stopOpacity=".65" />
                          <stop offset="1" stopColor="#fff" stopOpacity="0" />
                        </radialGradient>
                        <filter id="db-ps">
                          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#15171C" floodOpacity=".18" />
                        </filter>
                        <filter id="db-zb" x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="2.4" />
                        </filter>
                      </defs>
                      <g id="db-tk"></g>
                      <g className="arcs" id="db-arcs"></g>
                      <circle r="58" fill="url(#db-plate)" filter="url(#db-ps)" />
                      <circle r="62" fill="none" stroke="rgba(21,23,28,.35)" strokeDasharray="2 5" />
                      <circle
                        r="104"
                        fill="url(#db-sh)"
                        style={{ mixBlendMode: 'soft-light', pointerEvents: 'none' }}
                        id="db-shc"
                      />
                    </svg>
                    <div className="rc" id="db-rc">
                      <div className="n" id="db-balN">
                        0
                      </div>
                      <div className="s" id="db-balS">
                        /100
                      </div>
                      <div className="l" id="db-balL">
                        BALANCE
                      </div>
                    </div>
                    <div className="pls" id="db-pls"></div>
                  </div>
                </div>
                <div className="bal-t">
                  <h2 className="serif">Your life is finding its rhythm.</h2>
                  <p id="db-balP"></p>
                  <div className="bal-actions">
                    <button className="chip" id="db-balChip" style={{ '--c': 'var(--sleep)' } as any}></button>
                    <button className="cta" id="db-ctaWhat">
                      What if you slept 1 hour earlier? <span id="db-ctaArr"></span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="card glance rv" style={{ '--s': 2 } as any} aria-labelledby="db-glT">
            <h2 className="lab" id="db-glT">
              Today at a glance
            </h2>
            <div className="tiles" id="db-tiles"></div>
          </section>

          <section className="grid g1 rv" style={{ '--s': 3, marginTop: '14px' } as any}>
            <article className="card" aria-labelledby="db-msT">
              <div className="card-h">
                <h2 className="lab" id="db-msT">
                  Today’s missions
                </h2>
                <span className="streak" id="db-streak"></span>
              </div>
              <div className="lvl">
                <div className="lvl-b" id="db-lvlBadge">
                  7
                </div>
                <div className="lvl-m">
                  <div className="lvl-t">
                    <span id="db-lvlName">Level 7</span>
                    <span id="db-xpTxt">640 / 800 XP</span>
                  </div>
                  <div className="bar">
                    <i id="db-xpBar"></i>
                  </div>
                </div>
              </div>
              <ul className="ms-list" id="db-msList"></ul>
            </article>
            <article className="card" aria-labelledby="db-wkT">
              <div className="card-h">
                <h2 className="lab" id="db-wkT">
                  Weekly pulse
                </h2>
                <span className="pill" id="db-wkDelta"></span>
              </div>
              <p className="sub">Your balance score over the last seven days.</p>
              <div className="wk" id="db-wk"></div>
              <div className="wk-stats" id="db-wkStats"></div>
            </article>
          </section>

          <section className="grid g3 rv" style={{ '--s': 4, marginTop: '14px' } as any}>
            <article className="card" aria-labelledby="db-rhT">
              <div className="rh-h">
                <div>
                  <h3 className="serif" id="db-rhT">
                    Your Life Rhythm
                  </h3>
                  <p className="sub">How your focus, energy and recovery move through the day.</p>
                </div>
                <div className="legend" id="db-legend"></div>
              </div>
              <div className="chart" id="db-chart"></div>
              <div className="best">
                <span className="sun" id="db-bestIc"></span>
                <div>
                  <small>Your best window</small>
                  <strong id="db-bestT">9:00 AM – 11:00 AM</strong>
                </div>
                <p>Protect these hours for your most demanding work.</p>
                <button className="mini" id="db-blockBtn" aria-pressed="false">
                  Block on calendar
                </button>
              </div>
            </article>

            <article className="card ins" aria-labelledby="db-inT">
              <h3 className="serif" id="db-inT">
                Insights
              </h3>
              <p className="sub">Based on your current data and connections.</p>
              <div className="ins-list" id="db-insList"></div>
            </article>
          </section>

          {/* ── Card 1 (Phone habits) & Card 2 (Nudges) ── */}
          <section className="grid g1 rv" style={{ '--s': 5, marginTop: '14px' } as any}>
            {/* Card 1: Phone habits */}
            <article className="card phone-habits-card" aria-labelledby="db-phT">
              <div className="card-h">
                <div className="ph-title-wrap">
                  <div className="ph-icon-box">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="lab" id="db-phT">Phone habits</h3>
                    <p className="ph-subtitle">Screen exposure & bedtime hygiene</p>
                  </div>
                </div>
                <span className={`ph-status-pill ${socialHours >= 4 ? 'high' : socialHours >= 2 ? 'mod' : 'opt'}`}>
                  <i></i>
                  {socialHours >= 4 ? 'High screen time' : socialHours >= 2 ? 'Moderate usage' : 'Optimal · Focused'}
                </span>
              </div>

              <div className="ph-controls">
                {/* Row 1: Social Media Stepper */}
                <div className="ph-row">
                  <div className="ph-lbl-col">
                    <div className="ph-row-head">
                      <label id="db-social-lbl" htmlFor="db-social-val">Social media today</label>
                      <span className="ph-metric-tag">{socialHours <= 2 ? 'Low friction' : socialHours <= 4 ? 'Moderate' : 'Attention drag'}</span>
                    </div>
                    <small className="ph-desc">Usage tracked across entertainment & short video apps</small>
                    <div className="ph-bar-track" aria-hidden="true">
                      <div
                        className={`ph-bar-fill ${socialHours >= 4 ? 'high' : socialHours >= 2 ? 'mod' : 'opt'}`}
                        style={{ width: `${Math.min(100, Math.round((socialHours / 12) * 100))}%` }}
                      ></div>
                      <span className="ph-bar-target" title="Target: ≤2h"></span>
                    </div>
                  </div>

                  <div className="ph-stepper-wrap">
                    <div className="ph-stepper" role="group" aria-labelledby="db-social-lbl">
                      <button
                        type="button"
                        className="ph-step-btn"
                        onClick={() => handleSocialChange(socialHours - 0.5)}
                        disabled={socialHours <= 0}
                        aria-label="Decrease social media time by 30 minutes"
                      >
                        −
                      </button>
                      <span className="ph-val" id="db-social-val" aria-live="polite">
                        {habitsMounted ? `${socialHours % 1 === 0 ? socialHours : socialHours}h` : '3h'}
                      </span>
                      <button
                        type="button"
                        className="ph-step-btn"
                        onClick={() => handleSocialChange(socialHours + 0.5)}
                        disabled={socialHours >= 12}
                        aria-label="Increase social media time by 30 minutes"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 2: Midnight Phone Use Segmented Control */}
                <div className="ph-row ph-row-segmented">
                  <div className="ph-lbl-col">
                    <label id="db-midnight-lbl">Phone use after midnight this week</label>
                    <small className="ph-desc">Frequency of late-night scrolling or messaging</small>
                  </div>

                  <div className="ph-segmented" role="radiogroup" aria-labelledby="db-midnight-lbl">
                    {(['never', 'sometimes', 'often'] as const).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        role="radio"
                        aria-checked={midnightFreq === freq}
                        className={`ph-seg-btn ${midnightFreq === freq ? 'active' : ''}`}
                        onClick={() => handleMidnightFreqChange(freq)}
                      >
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* Card 2: Nudges */}
            <article className="card nudges-card" aria-labelledby="db-ndgT">
              <div className="card-h">
                <div className="ph-title-wrap">
                  <div className="ph-icon-box ndg-icon-box">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="lab" id="db-ndgT">Daily Nudges</h3>
                    <p className="ph-subtitle">Smart adjustments based on your habit patterns</p>
                  </div>
                </div>
                <span className="pill">Habit coaching</span>
              </div>

              <div className="ndg-list" role="feed" aria-label="Daily nudges">
                {displayedNudges.length > 0 ? (
                  displayedNudges.map((nudge) => (
                    <div key={nudge.id} className={`ndg-item ndg-${nudge.category}`} role="article">
                      <div className="ndg-top">
                        <span className={`ndg-badge ndg-badge-${nudge.category}`}>
                          <i></i>{nudge.badge}
                        </span>
                        <button
                          type="button"
                          className="ndg-dismiss"
                          onClick={() => handleDismissNudge(nudge.id)}
                          aria-label={`Dismiss nudge: ${nudge.badge}`}
                          title="Dismiss for today"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="ndg-text">{nudge.text}</p>
                      
                      <div className="ndg-footer">
                        {nudge.actionText && (
                          <button
                            type="button"
                            className="ndg-act-btn"
                            onClick={handleTryInWhatIf}
                          >
                            <span>{nudge.actionText}</span>
                            <span className="ndg-act-arr" aria-hidden="true">→</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="ndg-why-btn"
                          onClick={() => setShowWhyId(showWhyId === nudge.id ? null : nudge.id)}
                          aria-expanded={showWhyId === nudge.id}
                        >
                          <span>Why am I seeing this?</span>
                          <span className={`ndg-chevron ${showWhyId === nudge.id ? 'open' : ''}`} aria-hidden="true">›</span>
                        </button>
                      </div>

                      {showWhyId === nudge.id && (
                        <div className="ndg-why-box" role="region">
                          <div className="ndg-why-head">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="16" x2="12" y2="12"/>
                              <line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                            <span>Habit Rule Insight</span>
                          </div>
                          <p>{nudge.why}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="ndg-empty">
                    <div className="ndg-empty-icon">✓</div>
                    <p>No nudges left for today. You’re all caught up!</p>
                  </div>
                )}
              </div>

              <p className="ndg-disclaimer">Estimates, not medical advice.</p>
            </article>
          </section>
        </main>
      </div>

      <div className="scrim" id="db-scrim"></div>
      <aside className="drawer" id="db-drawer" role="dialog" aria-modal="true" aria-labelledby="db-drT">
        <div className="dr-h">
          <div>
            <p className="eyebrow">What if?</p>
            <h2 className="serif" id="db-drT">
              Move a lever. Watch your whole life shift.
            </h2>
          </div>
          <button className="icon-btn" id="db-drClose" aria-label="Close"></button>
        </div>

        <div className="dr-body">
          <div className="dr-levers">
            <div className="lev" style={{ '--c': 'var(--sleep)' } as any}>
              <div className="lev-h">
                <label htmlFor="db-rSleep">
                  <span className="lev-dot"></span>
                  Sleep earlier
                </label>
                <output id="db-oSleep">No change</output>
              </div>
              <input type="range" id="db-rSleep" min="0" max="2" step="0.25" defaultValue="0" />
            </div>

            <div className="lev" style={{ '--c': 'var(--study)' } as any}>
              <div className="lev-h">
                <label htmlFor="db-rStudy">
                  <span className="lev-dot"></span>
                  Study more each day
                </label>
                <output id="db-oStudy">No change</output>
              </div>
              <input type="range" id="db-rStudy" min="0" max="3" step="0.5" defaultValue="0" />
            </div>

            <div className="lev" style={{ '--c': 'var(--health)' } as any}>
              <div className="lev-h">
                <label htmlFor="db-rSteps">
                  <span className="lev-dot"></span>
                  Walk more each day
                </label>
                <output id="db-oSteps">No change</output>
              </div>
              <input type="range" id="db-rSteps" min="0" max="5000" step="250" defaultValue="0" />
            </div>
          </div>

          <div className="res" aria-live="polite">
            <div className="big">
              <span className="a" id="db-wiA">
                74
              </span>
              <span className="wi-arrow" aria-hidden="true">
                →
              </span>
              <span className="b" id="db-wiB">
                74
              </span>
              <span className="df" id="db-wiD">
                0
              </span>
            </div>
            <p className="narr" id="db-wiN">
              Move a lever to see how one change spreads across all six dimensions.
            </p>
            <div className="wrows" id="db-wiRows">
              <div className="wr" style={{ '--c': 'var(--study)' } as any}>
                <span className="wr-name"><i className="wr-dot"></i>Study</span>
                <div className="wr-track"><div className="wr-fill base" style={{ width: '82%', background: 'var(--study)' }}></div></div>
                <div className="wr-meta"><span className="wr-num">82</span><span className="wr-delta-empty"></span></div>
              </div>
              <div className="wr" style={{ '--c': 'var(--focus)' } as any}>
                <span className="wr-name"><i className="wr-dot"></i>Focus</span>
                <div className="wr-track"><div className="wr-fill base" style={{ width: '84%', background: 'var(--focus)' }}></div></div>
                <div className="wr-meta"><span className="wr-num">84</span><span className="wr-delta-empty"></span></div>
              </div>
              <div className="wr" style={{ '--c': 'var(--health)' } as any}>
                <span className="wr-name"><i className="wr-dot"></i>Health</span>
                <div className="wr-track"><div className="wr-fill base" style={{ width: '68%', background: 'var(--health)' }}></div></div>
                <div className="wr-meta"><span className="wr-num">68</span><span className="wr-delta-empty"></span></div>
              </div>
              <div className="wr" style={{ '--c': 'var(--sleep)' } as any}>
                <span className="wr-name"><i className="wr-dot"></i>Sleep</span>
                <div className="wr-track"><div className="wr-fill base" style={{ width: '61%', background: 'var(--sleep)' }}></div></div>
                <div className="wr-meta"><span className="wr-num">61</span><span className="wr-delta-empty"></span></div>
              </div>
              <div className="wr" style={{ '--c': 'var(--money)' } as any}>
                <span className="wr-name"><i className="wr-dot"></i>Money</span>
                <div className="wr-track"><div className="wr-fill base" style={{ width: '74%', background: 'var(--money)' }}></div></div>
                <div className="wr-meta"><span className="wr-num">74</span><span className="wr-delta-empty"></span></div>
              </div>
              <div className="wr" style={{ '--c': 'var(--goals)' } as any}>
                <span className="wr-name"><i className="wr-dot"></i>Goals</span>
                <div className="wr-track"><div className="wr-fill base" style={{ width: '79%', background: 'var(--goals)' }}></div></div>
                <div className="wr-meta"><span className="wr-num">79</span><span className="wr-delta-empty"></span></div>
              </div>
            </div>
            <div className="exam">
              <span className="exam-lbl">
                <svg className="exam-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                Marketing exam readiness
              </span>
              <b id="db-wiE">62%</b>
            </div>
          </div>

          {/* ── Impact Stats Strip ── */}
          <div className="wi-stats" id="db-wiStats">
            <div className="wis-pill" id="db-wisPill1">
              <span className="wis-label">Top gain</span>
              <span className="wis-val" id="db-wisTop">—</span>
            </div>
            <div className="wis-divider" aria-hidden="true"/>
            <div className="wis-pill" id="db-wisPill2">
              <span className="wis-label">Exam boost</span>
              <span className="wis-val" id="db-wisExam">62%</span>
            </div>
            <div className="wis-divider" aria-hidden="true"/>
            <div className="wis-pill" id="db-wisPill3">
              <span className="wis-label">Balance Δ</span>
              <span className="wis-val" id="db-wisBal">0</span>
            </div>
          </div>

          <div className="dr-f">
            <button
              className="cta"
              id="db-wiApply"
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).lifeOSApplyPlan) {
                  (window as any).lifeOSApplyPlan();
                }
              }}
            >
              Apply to my plan
            </button>
            <button
              className="ghost"
              id="db-wiReset"
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).lifeOSResetDemo) {
                  (window as any).lifeOSResetDemo();
                }
              }}
            >
              Reset demo
            </button>
          </div>
        </div>
      </aside>

      <div className="pal" id="db-pal" aria-hidden="true">
        <div className="pal-box" role="dialog" aria-modal="true" aria-label="Command palette">
          <div className="pal-in">
            <span id="db-palIc"></span>
            <input
              id="db-palIn"
              type="text"
              placeholder="Try “sleep 1.5 hours earlier and walk 4000 steps”"
              autoComplete="off"
              spellCheck="false"
              aria-label="Ask LifeOS"
            />
            <kbd>esc</kbd>
          </div>
          <ul id="db-palList" role="listbox"></ul>
          <div className="pal-f">
            <span>↑ ↓ to move</span>
            <span>↵ to run</span>
            <span>Describe a plan in plain words</span>
          </div>
        </div>
      </div>
      <canvas
        id="db-fx"
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 90 }}
      ></canvas>
      <div className="toast" id="db-toast" role="status"></div>
    </div>
  );
}
