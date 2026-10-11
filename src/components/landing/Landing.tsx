'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import './landing.css';
import { initLanding } from './engine';
import { Hero } from './Hero';

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
        <span className="mark">LIFEOS</span>
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
                          <svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
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
            <div className="dctl">
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
            <p className="ftt">Understand. Simulate. Decide. Act.</p>
            <p className="fts">A student project for the HyperBloom October UI/UX &amp; Web Design Hackathon.</p>
          </div>
          <nav className="ftn" aria-label="Footer">
            <a href="#hx">Top</a>
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
