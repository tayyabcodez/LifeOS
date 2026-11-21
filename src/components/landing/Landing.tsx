'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import './landing.css';
import { initLanding } from './engine';
import { Hero } from './Hero';
import { PartnersMarquee } from './PartnersMarquee';

export function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const cleanup = initLanding(rootRef.current);
    return () => {
      cleanup();
    };
  }, []);

  return (
    <div ref={rootRef} className="lp">
      <div id="sp"></div>
      <header className="bar" id="bar">
        <Link href="/" className="mark-link" aria-label="LifeOS Home">
          <img src="/logo.png" alt="LifeOS" className="landing-logo" />
        </Link>
        <Link className="btn" href="/onboarding">
          <span className="rl">
            <span>Enter LIFEOS</span>
            <span aria-hidden="true">Enter LIFEOS</span>
          </span>
          <svg className="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </header>

      <div id="mainw">
        <Hero />
        <PartnersMarquee />

        <section className="pin" id="pin">
          <div className="stage" id="stage">
            <h2 id="head" aria-live="polite">Your life is scattered.</h2>
            <p id="sub"></p>
            <svg id="svg" aria-hidden="true"></svg>
          </div>
        </section>

        <section className="npin" id="nightpin">
          <div className="sticky">
            <div id="nw">
              <div id="np"></div>
              <div id="nc">
                <h2 className="nh mask in"><span className="ml"><span id="nhs">What if…</span></span></h2>
                <div className="nrow">
                  <div id="ty" className="serif" aria-label="I sleep 1 hour earlier"></div>
                  <div className="slr" id="slr" data-k="Sleep" aria-hidden="true">
                    <span className="slab">Sleep</span>
                    <div className="sbox">
                      <div className="trk">
                        <i id="fill"></i>
                        <div className="tks">
                          <s style={{ left: '13%' }}>6h</s>
                          <s style={{ left: '43%' }}>7h</s>
                          <s style={{ left: '73%' }}>8h</s>
                        </div>
                        <b id="knob">
                          <u className="halo"></u>
                          <svg viewBox="0 0 24 24" fill="#4338ca" stroke="none" aria-hidden="true">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                          </svg>
                        </b>
                      </div>
                      <span className="sbed" id="sbed">Bedtime 12:18 am</span>
                    </div>
                    <span className="num" id="sl">6h 42m</span>
                  </div>
                </div>
                <div className="nmain">
                  <div className="bars" id="bars">
                    <div id="status" className="shim">Simulating…</div>
                    <div className="bh"><span>Your six areas · score out of 100</span><span className="bk"><i className="kn1"></i>Now<i className="kn2"></i>Gain</span></div>
                    <div className="brs" id="brs">
                      <div className="rail" id="rail"></div>
                      <i className="pls" id="pls"></i>
                    </div>
                  </div>
                  <div className="ncards">
                    <div className="nk" style={{ '--c': 'var(--sleep)' } as React.CSSProperties} data-ic="Sleep" data-row="0" data-dl="0" data-v="14" data-u=" pts" data-s="+" data-a="↑">
                      <div className="nh2"><span className="pi"></span><b>Sleep</b></div>
                      <span className="num big"></span>
                      <svg className="sp" viewBox="0 0 100 30"><path pathLength={1} d="M2 26L18 23L34 24L50 16L66 14L82 7L98 4" /></svg>
                      <small className="why">Bedtime 1 hour earlier</small>
                    </div>
                    <div className="nk" style={{ '--c': 'var(--focus)' } as React.CSSProperties} data-ic="Focus" data-row="1" data-dl="0" data-v="9" data-u=" pts" data-s="+" data-a="↑">
                      <div className="nh2"><span className="pi"></span><b>Focus</b></div>
                      <span className="num big"></span>
                      <svg className="sp" viewBox="0 0 100 30"><path pathLength={1} d="M2 24L18 22L34 19L50 20L66 13L82 10L98 5" /></svg>
                      <small className="why">Rested mornings, sharper hours</small>
                    </div>
                    <div className="nk" style={{ '--c': 'var(--health)' } as React.CSSProperties} data-ic="Energy" data-row="5" data-dl="0" data-v="11" data-u="%" data-s="+" data-a="↑">
                      <div className="nh2"><span className="pi"></span><b>Energy</b></div>
                      <span className="num big"></span>
                      <svg className="sp" viewBox="0 0 100 30"><path pathLength={1} d="M2 25L18 24L34 20L50 17L66 15L82 9L98 6" /></svg>
                      <small className="why">Sleep and health lift together</small>
                    </div>
                    <div className="nk" style={{ '--c': 'var(--goals)' } as React.CSSProperties} data-ic="Stress" data-row="5" data-dl=".12" data-v="8" data-u="%" data-s="−" data-a="↓">
                      <div className="nh2"><span className="pi"></span><b>Stress</b></div>
                      <span className="num big"></span>
                      <svg className="sp" viewBox="0 0 100 30"><path pathLength={1} d="M2 4L18 7L34 6L50 14L66 16L82 23L98 26" /></svg>
                      <small className="why">Lower is better</small>
                    </div>
                  </div>
                </div>
                <div className="nfoot">
                  {/* ── Phone-habit inputs ── */}
                  <div className="ph-controls-wrap">
                    <div className="ph-row" id="ph-row">
                      <label className="ph-label" htmlFor="ph-minus">
                        <svg className="ph-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                          <line x1="12" y1="18" x2="12.01" y2="18"/>
                        </svg>
                        My daily social media time
                      </label>
                      <div className="ph-stepper" role="group" aria-label="Daily social media hours">
                        <button type="button" className="ph-btn ph-minus" id="ph-minus" aria-label="Decrease by 30 minutes">−</button>
                        <output id="ph-val" htmlFor="ph-minus ph-plus" className="ph-val">3h</output>
                        <button type="button" className="ph-btn ph-plus" id="ph-plus" aria-label="Increase by 30 minutes">+</button>
                      </div>
                    </div>
                    <div className="ph-chips" id="ph-chips">
                      <span>What if I…</span>
                      <button type="button" id="ph-cut1" className="ph-chip" aria-pressed="false">Cut social by 1h</button>
                      <button type="button" id="ph-cut2" className="ph-chip" aria-pressed="false">Cut social by 2h</button>
                      <button type="button" id="ph-midnight" className="ph-chip" aria-pressed="false">No phone after midnight</button>
                    </div>
                  </div>
                  <p className="ph-disc" id="ph-disc">
                    Heavy late-night phone use is associated with later bedtimes and poorer sleep quality. Estimates, not medical advice.
                  </p>
                  {/* Feature 2: Why it matters panel */}
                  <div id="why-matters" className="why-matters" hidden aria-live="polite">
                    <div className="wm-header">
                      <svg className="wm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <b>Why this matters</b>
                    </div>
                    <ul className="wm-list">
                      <li id="wm-studies"></li>
                      <li id="wm-sleep"></li>
                      <li id="wm-health"></li>
                    </ul>
                  </div>
                  <div className="nfoot-actions">
                    <div className="chips" id="chips">
                      <span>Try another what-if</span>
                      <button type="button" className="on">Sleep 1h earlier</button>
                      <button type="button">Study 2h more</button>
                      <button type="button">Work out 3× a week</button>
                    </div>
                    <p className="stat" id="stat">Life balance <b className="num" id="bn">74</b><span className="ar2">→</span><b className="num up" id="bn2">74</b><small>estimate</small></p>
                    <a className="btn nb" id="apply" href="/onboarding">
                      <span className="rl">
                        <span>Apply to my plan</span>
                        <span aria-hidden="true">Apply to my plan</span>
                      </span>
                    </a>
                  </div>
                  <p className="note">Estimates based on demo data, not medical advice.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dd" id="dd">
          <span className="eyebrow">Decide</span>
          <h2>Design your day.<br /><em>Watch your life react.</em></h2>
          <p>Alex has an exam in 3 days. Drag the sliders and see what every hour really costs.</p>
          <div className="ddg">
            <div className="dd-left">
              <div className="dialw">
                <div className="dial">
                  <svg id="dsv" viewBox="-190 -190 380 380" aria-hidden="true"></svg>
                  <div className="dc"><small>Free time</small><b className="num" id="dfree">8h 48m</b><span id="dnote">per day</span></div>
                </div>
                <ul className="dleg" aria-hidden="true">
                  <li><i style={{ background: 'var(--sleep)' }}></i>Sleep</li>
                  <li><i style={{ background: 'var(--study)' }}></i>Study</li>
                  <li><i style={{ background: 'var(--health)' }}></i>Move</li>
                  <li><i style={{ background: '#D9D3C4' }}></i>Routine</li>
                  <li><i style={{ background: '#fff', border: '1px solid #CFC9B8' }}></i>Free</li>
                </ul>
              </div>
              <div className="res">
                <div className="rdy">
                  <svg viewBox="-60 -60 120 120" aria-hidden="true">
                    <circle r="48" className="rt0" />
                    <circle r="48" className="rt1" id="rring" transform="rotate(-90)" />
                  </svg>
                  <div className="rn"><b className="num" id="rnum">78</b><small>%</small></div>
                </div>
                <div className="rtx"><b>Exam readiness</b><span id="rlab">On track</span></div>
                <div className="mini" id="mini"></div>
              </div>
            </div>

            <div className="dctl">
              {/* Feature 1: Plan my day collapsible panel */}
              <div className="pl-wrap" id="pl-wrap">
                <button
                  type="button"
                  id="pl-toggle"
                  className="pl-toggle-btn"
                  aria-expanded="false"
                  aria-controls="pl-panel"
                >
                  <span className="pl-toggle-left">
                    <svg className="pl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <b>Plan my day</b>
                  </span>
                  <span className="pl-toggle-tag">Rule-based planner</span>
                  <span className="pl-toggle-chevron" id="pl-chevron" aria-hidden="true">▾</span>
                </button>
                <div id="pl-panel" className="pl-panel" hidden>
                  <div className="pl-grid">
                    <div className="pl-field">
                      <label htmlFor="pl-uni">University hours per day</label>
                      <input id="pl-uni" type="number" min="0" max="10" step="0.5" defaultValue="6" />
                    </div>
                    <div className="pl-field">
                      <label htmlFor="pl-study">Self-study hours I want per day</label>
                      <input id="pl-study" type="number" min="0" max="8" step="0.5" defaultValue="2" />
                    </div>
                    <div className="pl-field">
                      <label htmlFor="pl-due">Assignments / exams due this week</label>
                      <input id="pl-due" type="number" min="0" max="10" step="1" defaultValue="2" />
                    </div>
                    <div className="pl-field">
                      <label htmlFor="pl-sleep">Sleep target hours</label>
                      <input id="pl-sleep" type="number" min="4" max="10" step="0.5" defaultValue="7.5" />
                    </div>
                    <div className="pl-field">
                      <label htmlFor="pl-personal">Personal / free time wanted per day</label>
                      <input id="pl-personal" type="number" min="0" max="6" step="0.5" defaultValue="1.5" />
                    </div>
                    <div className="pl-field">
                      <label htmlFor="pl-routine">Fixed routine (meals, travel, prayer, chores) hours</label>
                      <input id="pl-routine" type="number" min="0" max="6" step="0.5" defaultValue="3" />
                    </div>
                  </div>
                  <div className="pl-actions">
                    <button type="button" id="pl-build" className="btn pl-build-btn">
                      <span className="rl">
                        <span>Build my plan</span>
                        <span aria-hidden="true">Build my plan</span>
                      </span>
                    </button>
                  </div>
                  <div id="pl-summary" className="pl-summary" hidden aria-live="polite">
                    <div id="pl-warn" className="pl-warn" hidden></div>
                    <ul id="pl-lines" className="pl-lines"></ul>
                    <div className="pl-split-wrap">
                      <span className="pl-split-title">24h Time Allocation:</span>
                      <div id="pl-split-bar" className="pl-split-bar" role="img" aria-label="24 hour time allocation breakdown"></div>
                      <div id="pl-split-labels" className="pl-split-labels"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="srow">
                <label htmlFor="inS">Sleep</label>
                <output id="outS" htmlFor="inS">6h 42m</output>
                <input id="inS" type="range" min="4" max="10" step="0.1" defaultValue="6.7" style={{ '--k': 'var(--sleepd)' } as React.CSSProperties} />
              </div>
              <div className="srow">
                <label htmlFor="inT">Study</label>
                <output id="outT" htmlFor="inT">3h</output>
                <input id="inT" type="range" min="0" max="10" step="0.5" defaultValue="3" style={{ '--k': 'var(--studyd)' } as React.CSSProperties} />
              </div>
              <div className="srow">
                <label htmlFor="inM">Move</label>
                <output id="outM" htmlFor="inM">30 min</output>
                <input id="inM" type="range" min="0" max="120" step="5" defaultValue="30" style={{ '--k': 'var(--healthd)' } as React.CSSProperties} />
              </div>
              <div className="acts">
                <button type="button" className="btn" id="dbest"><span className="rl"><span>Suggest a plan</span><span aria-hidden="true">Suggest a plan</span></span></button>
                <button type="button" className="gh" id="dreset">Reset to today</button>
              </div>
              <p className="dins" id="dins" aria-live="polite">Slide to see the trade-offs.</p>
            </div>
          </div>
        </section>

        <section className="axs">
          <div className="axi">
            <b>Built to be used by everyone</b>
            <span>Keyboard-first</span>
            <span>Text size up to +25%</span>
            <span>List view for the orbit</span>
            <span>Text contrast up to 16:1</span>
            <button className="tog" id="tog" role="switch" aria-checked="false">
              <span className="kn"></span>
              <span>Reduce motion: <b id="tl">Off</b></span>
            </button>
          </div>
        </section>

        <section className="final" id="final">
          <span className="eyebrow">Ready when you are</span>
          <h2 className="mask" id="fin">
            <span className="ml" style={{ '--i': 0 } as React.CSSProperties}><span><b className="fw" style={{ '--c': 'var(--study)' } as React.CSSProperties}>Understand.</b></span></span>
            <span className="ml" style={{ '--i': 1 } as React.CSSProperties}><span><b className="fw" style={{ '--c': 'var(--sleep)' } as React.CSSProperties}>Simulate.</b></span></span>
            <span className="ml" style={{ '--i': 2 } as React.CSSProperties}><span><b className="fw" style={{ '--c': 'var(--focus)' } as React.CSSProperties}>Decide.</b></span></span>
            <span className="ml" style={{ '--i': 3 } as React.CSSProperties}><span><b className="fw" style={{ '--c': 'var(--goals)' } as React.CSSProperties}>Act.</b></span></span>
          </h2>
          <p className="fp">Alex has an exam in 3 days. Start with a plan you can see.</p>
          <div className="octa" id="octa">
            <svg className="otxt" viewBox="-130 -130 260 260" aria-hidden="true">
              <defs>
                <path id="otp" d="M-104 0a104 104 0 1 1 208 0a104 104 0 1 1 -208 0" />
              </defs>
              <text>
                <textPath href="#otp" textLength="648" lengthAdjust="spacing">TRY THE DEMO · NO SIGN-UP · TWO MINUTES · </textPath>
              </text>
            </svg>
            <div className="odots" aria-hidden="true">
              <i style={{ background: 'var(--study)', transform: 'rotate(0deg) translateY(-98px)' }}></i>
              <i style={{ background: 'var(--focus)', transform: 'rotate(60deg) translateY(-98px)' }}></i>
              <i style={{ background: 'var(--health)', transform: 'rotate(120deg) translateY(-98px)' }}></i>
              <i style={{ background: 'var(--sleep)', transform: 'rotate(180deg) translateY(-98px)' }}></i>
              <i style={{ background: 'var(--money)', transform: 'rotate(240deg) translateY(-98px)' }}></i>
              <i style={{ background: 'var(--goals)', transform: 'rotate(300deg) translateY(-98px)' }}></i>
            </div>
            <Link className="orb" id="orb2" href="/onboarding">
              <span>Enter<br />LIFEOS</span>
              <svg className="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <Link className="skip" href="/app">Skip setup, open the demo</Link>
        </section>
      </div>

      <footer className="ft" id="ft">
        <div className="mqs" aria-hidden="true">
          <div className="mr">
            <div className="mt2">
              <span className="g">
                <span className="it"><i style={{ background: 'var(--study)' }}></i>Study</span>
                <span className="it"><i style={{ background: 'var(--focus)' }}></i>Focus</span>
                <span className="it"><i style={{ background: 'var(--health)' }}></i>Health</span>
                <span className="it"><i style={{ background: 'var(--sleep)' }}></i>Sleep</span>
                <span className="it"><i style={{ background: 'var(--money)' }}></i>Money</span>
                <span className="it"><i style={{ background: 'var(--goals)' }}></i>Goals</span>
              </span>
              <span className="g">
                <span className="it"><i style={{ background: 'var(--study)' }}></i>Study</span>
                <span className="it"><i style={{ background: 'var(--focus)' }}></i>Focus</span>
                <span className="it"><i style={{ background: 'var(--health)' }}></i>Health</span>
                <span className="it"><i style={{ background: 'var(--sleep)' }}></i>Sleep</span>
                <span className="it"><i style={{ background: 'var(--money)' }}></i>Money</span>
                <span className="it"><i style={{ background: 'var(--goals)' }}></i>Goals</span>
              </span>
              <span className="g">
                <span className="it"><i style={{ background: 'var(--study)' }}></i>Study</span>
                <span className="it"><i style={{ background: 'var(--focus)' }}></i>Focus</span>
                <span className="it"><i style={{ background: 'var(--health)' }}></i>Health</span>
                <span className="it"><i style={{ background: 'var(--sleep)' }}></i>Sleep</span>
                <span className="it"><i style={{ background: 'var(--money)' }}></i>Money</span>
                <span className="it"><i style={{ background: 'var(--goals)' }}></i>Goals</span>
              </span>
              <span className="g">
                <span className="it"><i style={{ background: 'var(--study)' }}></i>Study</span>
                <span className="it"><i style={{ background: 'var(--focus)' }}></i>Focus</span>
                <span className="it"><i style={{ background: 'var(--health)' }}></i>Health</span>
                <span className="it"><i style={{ background: 'var(--sleep)' }}></i>Sleep</span>
                <span className="it"><i style={{ background: 'var(--money)' }}></i>Money</span>
                <span className="it"><i style={{ background: 'var(--goals)' }}></i>Goals</span>
              </span>
            </div>
          </div>
          <div className="mr">
            <div className="mt2 rev">
              <span className="g">
                <span className="it"><i style={{ background: 'var(--sleep)' }}></i>Sleep</span>
                <span className="it"><i style={{ background: 'var(--goals)' }}></i>Goals</span>
                <span className="it"><i style={{ background: 'var(--focus)' }}></i>Focus</span>
                <span className="it"><i style={{ background: 'var(--study)' }}></i>Study</span>
                <span className="it"><i style={{ background: 'var(--money)' }}></i>Money</span>
                <span className="it"><i style={{ background: 'var(--health)' }}></i>Health</span>
              </span>
              <span className="g">
                <span className="it"><i style={{ background: 'var(--sleep)' }}></i>Sleep</span>
                <span className="it"><i style={{ background: 'var(--goals)' }}></i>Goals</span>
                <span className="it"><i style={{ background: 'var(--focus)' }}></i>Focus</span>
                <span className="it"><i style={{ background: 'var(--study)' }}></i>Study</span>
                <span className="it"><i style={{ background: 'var(--money)' }}></i>Money</span>
                <span className="it"><i style={{ background: 'var(--health)' }}></i>Health</span>
              </span>
              <span className="g">
                <span className="it"><i style={{ background: 'var(--sleep)' }}></i>Sleep</span>
                <span className="it"><i style={{ background: 'var(--goals)' }}></i>Goals</span>
                <span className="it"><i style={{ background: 'var(--focus)' }}></i>Focus</span>
                <span className="it"><i style={{ background: 'var(--study)' }}></i>Study</span>
                <span className="it"><i style={{ background: 'var(--money)' }}></i>Money</span>
                <span className="it"><i style={{ background: 'var(--health)' }}></i>Health</span>
              </span>
              <span className="g">
                <span className="it"><i style={{ background: 'var(--sleep)' }}></i>Sleep</span>
                <span className="it"><i style={{ background: 'var(--goals)' }}></i>Goals</span>
                <span className="it"><i style={{ background: 'var(--focus)' }}></i>Focus</span>
                <span className="it"><i style={{ background: 'var(--study)' }}></i>Study</span>
                <span className="it"><i style={{ background: 'var(--money)' }}></i>Money</span>
                <span className="it"><i style={{ background: 'var(--health)' }}></i>Health</span>
              </span>
            </div>
          </div>
        </div>
        <div className="ftc" id="ftc">
          <div>
            <div style={{ marginBottom: 12 }}>
              <img src="/logo.png" alt="LifeOS" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />
            </div>
            <p className="ftt">Understand. Simulate. Decide. Act.</p>
            <p className="fts">A student project for the HyperBloom October UI/UX &amp; Web Design Hackathon.</p>
          </div>
          <nav className="ftn" aria-label="Footer">
            <a href="#hero-hx">Top</a>
            <a href="#pin">How it works</a>
            <a href="#nightpin">What if?</a>
            <a href="#dd">Design your day</a>
          </nav>
          <button type="button" id="totop">Back to top ↑</button>
        </div>
        <div className="wm" id="wm" aria-hidden="true">LIFEOS</div>
        <p className="fine">Demo experience · No sign-up needed · Simulations are estimates, not advice.</p>
      </footer>
    </div>
  );
}
