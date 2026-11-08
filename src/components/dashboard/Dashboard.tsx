'use client';

import React, { useEffect, useRef } from 'react';
import { useLifeStore } from '@/store/lifeStore';
import './dashboard.css';
import { initDashboard } from './dashboardEngine';
import { DimensionId } from '@/data/demo-data';

export function Dashboard() {
  const rootRef = useRef<HTMLDivElement>(null);

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
