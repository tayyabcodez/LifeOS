# LIFEOS — UX Blueprint & Build Spec

> **For the AI agent:** Read this entire file before writing any code. It is the single source of truth. If something is not in this file, ask or choose the simplest option. Do NOT add features, pages, libraries or backend services that are not listed here.

---

## 0. Context

- **Context:** A UI/UX & web design hackathon for students. Reviewers will open the live link for a few minutes, so the product must impress fast and never break.
- **What judges look for (from the hackathon page):**
  1. Thoughtful UX and user flows
  2. Intuitive, visually compelling UI
  3. Accessibility and inclusive design
  4. Creative interaction and information architecture
  5. Strong problem-solving and originality
  6. A polished prototype or working implementation
- **No complex backend is needed.** Frontend only, local state, demo data.
- **Reviewers are engineers.** First 10 seconds must impress; every click must work; nothing may crash.

---

## 1. Product

### 1.1 One-liner
**LIFEOS — Your life, in one clear view.**
A visual operating system that helps students understand how their study, sleep, health, money and goals affect each other, and test decisions *before* making them.

### 1.2 The problem
Students don't lack productivity tools. They lack **context**. Study is in one app, sleep in another, money in a third, goals in a notebook. Nothing shows how they connect, so people can't tell whether skipping sleep to study actually helps, or what a change would cost them elsewhere.

### 1.3 The user (persona — use consistently everywhere)
- **Alex, 20**, second-year university student (business/marketing).
- Juggling classes, a part-time job, gym attempts, a tight budget.
- Has an exam on Friday and hasn't started. Sleeps ~6h42m. Feels busy but unfocused.
- Wants: clarity, not another to-do list.

### 1.4 The loop (this is the product)
**Understand → Simulate → Decide → Act**
Home (understand) → Dimensions (go deeper) → What If? (simulate) → Apply to plan (decide) → Today's actions (act).

### 1.5 Positioning rules
- Do **not** market it as "AI-powered" or add a chatbot. The experience is the product.
- It is **not** a habit tracker, to-do app, or fitness dashboard.
- Everything simulated is labelled as an **estimate**. Never claim medical or scientific accuracy.
- All data shown is **demo data** — show a small, honest "Demo data" badge in the app chrome.

---

## 2. Scope

### 2.1 Build (5 experiences)
| # | Screen | Route |
|---|--------|-------|
| 1 | Landing | `/` |
| 2 | Onboarding (3 steps) | `/onboarding` |
| 3 | Home (Life Orbit + today) | `/app` |
| 4 | Dimension detail (Study, Focus, Health, Sleep, Money, Goals) | `/app?view=<id>` |
| 5 | What If? simulator | `/app?view=whatif` |

Plus: a **Settings panel** (reduced motion, text size) and a **List view** toggle for the orbit (accessibility).

### 2.2 Do NOT build
- Login / signup / auth
- Supabase, any database, any API server
- Real LLM / chatbot / "Ask AI" box
- Three.js / React Three Fiber (orbit is SVG — see §6)
- GSAP, Lenis (unless explicitly requested later)
- Extra pages (settings page, profile page, blog, pricing, etc.)
- Theme switcher. The app is a light "daylight" theme; only the What If? screen uses the "night" theme (see §4.1).
- Real data entry forms for tracking (demo data only)

### 2.3 Priority if time runs short
1. Landing → Onboarding → Home must be flawless
2. What If? simulator (the climax)
3. Dimension detail screens
4. Accessibility proof (keyboard, reduced motion, list view)
5. Extra polish

---

## 3. Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) + React + TypeScript (latest stable) |
| Styling | Tailwind CSS + custom design tokens as CSS variables |
| Animation | `motion` (Framer Motion's successor; `import { motion } from "motion/react"`) |
| Charts | Recharts — only if SVG hand-built charts become too costly; prefer small hand-built SVG for the Rhythm chart |
| Icons | `lucide-react` |
| State | React state + one small `useLifeStore` via Zustand **only if** prop drilling gets painful; otherwise Context |
| Fonts | `Instrument Serif` (display headlines only) + `Geist` (UI headings, numbers) + `Inter` (body), via `next/font` (self-hosted, no layout shift) |
| Build target | Standard Next.js production build that can deploy on any host. |

Install dependencies **only when a feature needs them**.

---

## 4. Design system

### 4.1 Colour system — "Daylight → Night"

**Concept (use this wording in the README and UI rationale):**
LIFEOS is about *clarity*, so the product lives in **daylight**: a warm paper-white canvas with ink-black text — calm, editorial, human. It deliberately avoids the dark-mode + neon + purple-gradient look of generic AI products.
Colour is **not decoration. Colour is data.** Each of the six life dimensions owns one hue. All six hues are chosen at the **same perceived lightness and chroma (OKLCH)**, so no dimension looks "more important" than another — when the orbit looks harmonious, life is balanced; when one node is thin or pale, it needs attention. Buttons and chrome stay ink-black so colour is reserved for meaning.
The only dark screen is **What If?** — the interface turns to **night** because you are looking at a possible *future*. Moving from Home to What If? is a literal shift from daylight to night, which tells the story without words.

**Daylight tokens (default):**
```css
:root {
  --paper:      #F6F3EC;  /* page background, warm off-white */
  --surface:    #FFFFFF;  /* cards */
  --surface-2:  #EFEBE2;  /* inset areas, hover */
  --line:       rgba(21,23,28,0.10);
  --ink:        #15171C;  /* primary text, primary buttons, YOU node */
  --ink-2:      #5B606B;  /* secondary text (≥ 4.5:1 on paper and surface) */
  --focus-ring: #15171C;  /* 3px ring + 2px paper offset */

  /* Dimension colours — each has a FILL (large areas, nodes, charts) and a DEEP (text/icons on light) */
  --study-fill:  #BFD0FF;  --study-deep:  #2A3FA8;  /* cobalt */
  --focus-fill:  #FFD98A;  --focus-deep:  #8A5A00;  /* amber */
  --health-fill: #B9E6B0;  --health-deep: #1F6B2E;  /* green */
  --sleep-fill:  #CFC4F5;  --sleep-deep:  #4B3A9A;  /* dusk indigo */
  --money-fill:  #A9E3DC;  --money-deep:  #0F6B63;  /* teal */
  --goals-fill:  #FFC1B0;  --goals-deep:  #A33A20;  /* coral */

  /* Meaning colours (always paired with an arrow/icon + sign) */
  --up:   #1F6B2E;  /* improvement */
  --down: #A33A20;  /* decline / trade-off */
}
```

**Night tokens (only on the What If? view, set via `data-theme="night"`):**
```css
[data-theme="night"] {
  --paper:     #14161C;
  --surface:   #1D2028;
  --surface-2: #262A34;
  --line:      rgba(246,243,236,0.12);
  --ink:       #F6F3EC;
  --ink-2:     #A9AEBA;
  --focus-ring:#F6F3EC;
  --up:        #B9E6B0;
  --down:      #FFC1B0;
  /* Dimension FILL colours are reused as glowing strokes/numbers; "deep" tones are not used on night. */
}
```

**Usage rules**
- Primary buttons: `--ink` background, `--paper` text (inverted on night). No coloured primary buttons.
- Dimension colours appear only where a dimension is being represented: orbit nodes, chart lines, dimension headers, chips tied to a dimension, the Balance Ring.
- Use `*-fill` for backgrounds/shapes (text on a fill must be `--ink`); use `*-deep` for text and icons on light surfaces.
- **Never convey status by colour alone.** Always pair with an icon, arrow (↑ ↓), sign (+/−) or word.
- Verify contrast with a tool: ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI components, in both daylight and night. If any token fails, darken the *deep* tone — do not change the concept.
- Backgrounds: flat `--paper`, optionally a very faint warm radial light behind the orbit (white at ~60% → transparent) and a barely-visible paper grain (≤ 3% opacity). No gradients across the page, no glows, no neon.
- **Day → Night transition:** when entering What If?, the page background/ink tokens cross-fade from daylight to night over 0.7s, expanding as a circular reveal from the "What If?" nav button. On leaving, reverse. Reduced motion: instant swap, no reveal.

### 4.2 Typography
- Display + H1 (landing headline, "What if…", dimension names): **Instrument Serif**, regular, tight tracking (−0.01em). This gives the editorial, human feel.
- UI headings (H2/H3), labels and all numbers: **Geist**, tight tracking (−0.02em), weights 500/600.
- Body: **Inter**, 400/500.
- Wordmark "LIFEOS": Geist 600, wide tracking (+0.18em), uppercase.
- Scale (desktop): Display 64/68 · H1 40/46 · H2 28/34 · H3 20/28 · Body 16/26 · Small 14/22 · Micro 12/16 (min 12px, avoid below).
- Numbers: `font-variant-numeric: tabular-nums` always, so counting animations don't jitter.
- Respect user text-size setting (§9).

### 4.3 Spacing, shape, elevation
- 4px base grid. Spacing steps: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Radius: cards 20px, buttons 12px, chips 999px, inputs 14px.
- Elevation via **border + very soft shadow**, never heavy drop shadows.
  `card: background var(--surface); border:1px solid var(--line); box-shadow: 0 1px 0 rgba(21,23,28,0.04), 0 10px 30px rgba(21,23,28,0.06)` (on night: no shadow, use border + --surface only)
- Container max-width: 1200px, side padding 24px (desktop), 16px (mobile).

### 4.4 Motion tokens
```
duration.fast   = 0.15s   (hover, press)
duration.base   = 0.30s   (UI state changes)
duration.slow   = 0.70s   (screen transitions)
duration.hero   = 1.20s   (landing / simulation)
ease.out        = [0.22, 1, 0.36, 1]   (default, decisive)
ease.inOut      = [0.65, 0, 0.35, 1]   (morphs)
spring.soft     = { type:"spring", stiffness:140, damping:20 }
```
Animate **only** `transform` and `opacity` (plus SVG `stroke-dashoffset`). Never animate width/height/top/left.

### 4.5 Core components & states
Every interactive component needs: default, hover, focus-visible, active/pressed, disabled.
- **Button** — primary (`--ink` bg, `--paper` text), secondary (`--surface` + border), ghost.
- **Chip** — selectable option (onboarding, what-if presets). Selected = 2px `--ink` border + check icon (dimension chips also tint with that dimension's `-fill`).
- **Card** — base surface with optional hover lift (translateY −2px, border brightens, inner light shifts).
- **AnimatedNumber** — counts/morphs between values (0.6s), `aria-live="polite"` on final value only.
- **ProgressBar** — animates from previous value; shows numeric label.
- **DeltaTag** — `↑ +14%` / `↓ −8%` with icon + sign + colour (never colour only).
- **InsightCard** — icon, one-sentence insight, optional action.

---

## 5. Global layout & navigation

### 5.1 App shell (`/app`)
- **Desktop:** top bar — left: `LIFEOS` wordmark; centre: segmented nav `Home · What If?`; right: `Demo data` badge, Settings (gear) button.
- **Mobile:** top bar with wordmark + settings; **bottom tab bar** with `Home · What If?` (large touch targets ≥ 48px).
- Dimensions are reached from the orbit/list on Home, with a back button + breadcrumb (`Home / Sleep`).
- **No full page reloads.** `/app` is one client-side view; `?view=` updates via `history.pushState` / router `shallow` so the browser Back button works.
- Skip link "Skip to main content" as first focusable element.

### 5.2 Settings panel (slide-over, focus-trapped, `Esc` closes)
- **Reduced motion:** Auto (follows OS) / On / Off. Default: follows `prefers-reduced-motion`.
- **Text size:** Default / Large (+12%) / Extra large (+25%).
- **Orbit view:** Visual / List.
- Footer: short note — "Demo data. Simulations are estimates, not advice."
- Preferences persist in `localStorage` (wrap in try/catch).

---

## 6. Screen specifications

### SCREEN 1 — Landing (`/`)
**Purpose:** 5-second emotional hook + one clear action via a Scroll Story.

**SCROLL STORY SECTIONS**
0. **HERO (100vh):** headline "Your life, in one clear view.", subtext, "Enter LIFEOS" button (visible without scrolling), "Skip setup" link, a small "Scroll" hint with a gentle bounce. Orbit behind it, clearly visible (6 dimension-coloured nodes with icons, visible rings, centre YOU node, slow drift, mouse parallax on desktop).
1. **SCATTERED:** heading "Your life is scattered." Six floating cards (Study notes, Sleep tracker, Bank balance, Gym log, Calendar, Goals notebook) in different positions and slight rotations, each tinted with its dimension colour. They fade/slide in as the section enters (staggered), then drift subtly.
2. **ONE VIEW (pinned):** a section 300vh tall with a sticky 100vh stage. Heading "LIFEOS brings it into one view." Scroll progress (useScroll on the section) drives the six scattered cards to move, shrink, and morph into the six orbit nodes in their orbit positions, while rings draw in and the YOU node appears. This is the signature moment: make it smooth and clearly scroll-linked (use useTransform on x, y, scale, rotate, opacity; no per-frame React state).
3. **CONNECTED (pinned, 300vh, can share the same sticky orbit):** three beats driven by scroll progress, each swapping the caption and highlighting links between related nodes: (a) "Sleep shapes your focus." (b) "Focus shapes your study." (c) "Everything feeds your goals." Captions crossfade.
4. **WHAT IF (night):** a dark rounded panel (data-theme="night" scoped to this section only) scales up from a rounded card to fill the viewport as you scroll in (transform only). Inside: "What if…" in Instrument Serif, a typing animation of "I sleep 1 hour earlier", then the results appear one by one with count-up numbers: Sleep +14, Focus +9, Energy +11, Stress -8 (DeltaTag style, arrow + sign, not colour only). Add a small line "Estimates based on demo data."
5. **MADE FOR EVERYONE:** three cards (Keyboard friendly, Reduced motion, List view for screen readers) revealed with stagger via whileInView (once: true).
6. **FINAL CTA:** large headline "Understand. Simulate. Decide. Act." with the "Enter LIFEOS" button, then a minimal footer.

**GENERAL RULES**
- Sticky top bar with the LIFEOS wordmark and an "Enter LIFEOS" button that appears after the hero scrolls away.
- Scroll reveals: opacity + translateY (24px to 0, 0.7s, ease.out), staggered, using whileInView with viewport={{ once: true, amount: 0.3 }}. Content below the fold must NOT be visible before it animates in.
- Only animate transform and opacity. Use motion values (useTransform/useSpring), never setState on scroll.
- Reduced motion (OS or in-app): no scroll-linked movement, no pinning. Show every section in its final static layout with a simple 0.2s fade. All content must remain in the DOM in logical order and be readable by screen readers.
- Keep proper heading order (one h1 in the hero, h2 per section), visible focus rings, contrast >= 4.5:1.
- Mobile (390x844): same story but simplified: smaller orbit, pinned sections shorter (200vh), cards stacked 2 columns, no mouse parallax.
- Performance target: no dropped frames on a normal laptop; lazy mount heavy sections if needed.

---

### SCREEN 2 — Onboarding (`/onboarding`)
**Purpose:** Feel like a cinematic setup, but short — **3 steps, ~20 seconds**.

**Shell:** centred column (max 640px). Top: step indicator "1 / 3" (text + thin progress line). Back link on steps 2–3. `Skip` link always visible (→ `/app` with defaults).

**Step 1 — "What matters most right now?"**
Single-select chips (large cards with icon + label): Study · Health · Money · Career · Balance.

**Step 2 — "What's your biggest challenge?"**
Single-select list:
- I can't stay consistent
- I'm always short on time
- I don't sleep enough
- I can't see the big picture
- I overspend

**Step 3 — "Building your view…"** (≈2.5s, auto)
Sequence of 3 lines that fade in/out with a small orbit assembling beside them:
1. "Reading your priorities"
2. "Connecting your dimensions"
3. "Preparing your day"
Then a **Continue** button appears (don't auto-redirect — gives screen-reader users control) → `/app`.

**Logic:** choices are stored in state and used to (a) highlight the matching dimension on the orbit with a ring in that dimension's colour, and (b) set the first insight text on Home (see §7.4).

**Accessibility:** radiogroup semantics, arrow-key navigation, `Enter` selects and advances, progress text announced via `aria-live`.

**Transition between steps:** outgoing content slides −24px + fades (0.25s), incoming slides from +24px (0.35s). Reduced motion: crossfade only.

---

### SCREEN 3 — Home (`/app`)

**Purpose:** "Understand your life in one look."

**Layout (desktop ≥1280):** 12-col grid.
```
┌────────────────────────────────────────────────────────────┐
│ Greeting: "Good evening, Alex."                             │
│ Sub: "Here's your life today."                              │
├───────────────────────────────┬────────────────────────────┤
│                               │  BALANCE                    │
│        LIFE ORBIT             │  74  (AnimatedNumber)       │
│     (cols 1–7, ~560px)        │  "Your focus is strong, but │
│                               │   recovery is falling       │
│                               │   behind."                  │
│                               │  [ Try a What If → ]        │
├───────────────────────────────┴────────────────────────────┤
│ TODAY (4 stat cards)                                        │
│ 2 priorities · 6h 42m sleep · 4,820 steps · 72% weekly goal │
├────────────────────────────────────────────────────────────┤
│ LIFE RHYTHM (flowing chart)   │  INSIGHTS (2–3 cards)       │
└────────────────────────────────────────────────────────────┘
```
Greeting changes by time of day (morning/afternoon/evening).

**Balance score**
- Formula: `balance = round(mean(dimensions) − 0.05 × (mean − min))` → with demo data = **74**.
- Always paired with a one-line plain-language explanation (never a bare number).
- Label "BALANCE" in micro caps, number in Display size.
- **Balance Ring:** the number sits inside a ring made of six equal arcs, one per dimension in its own `-fill` colour. Arc *thickness* maps to that dimension's score (thin = lagging), so imbalance is visible at a glance. Thickness animates in on load and on any change.

**Today cards (4):** each has icon, big number, label, tiny context line (e.g. "Goal 7h 30m", "Goal 8,000"). Hover: lift + light shift. Clickable cards go to the relevant dimension.

**Life Rhythm chart:** a smooth 24h area/line chart, three layered curves — Focus (`--focus-deep`), Energy (`--health-deep`), Recovery (`--sleep-deep`). Hover/focus scrubs a vertical line and shows a tooltip card: time + three values + one-line context ("Peak focus window"). Must be keyboard-scrubbable (←/→) and have a text summary below for screen readers. Draw-in animation on first view (stroke-dashoffset, 1.2s).

**Insights (3 cards, max):**
1. "Recovery is lagging" — Sleep 61 vs Study 82. → `Open Sleep`.
2. "Best focus window: 9–11am" — protect it. → `Open Study`.
3. "You have an exam in 3 days" — → `Plan it in What If?`.

---

### THE LIFE ORBIT (centrepiece component)

**Implementation:** hand-built **SVG** inside a responsive container (`viewBox="0 0 600 600"`). No Three.js.

**Anatomy**
- Centre: `YOU` node — filled `--ink` circle with soft pulse (scale 1→1.04, 4s loop; paused for reduced motion).
- 3 faint concentric rings.
- **6 dimension nodes**, evenly spaced (60° apart), in this order clockwise from top: **Study, Focus, Health, Sleep, Money, Goals**.
- Each node: circle (size 28–44px mapped to score), icon inside, label outside.
- **Score → distance & fill:** higher score = node sits closer to centre and ring fill is fuller (a thin arc around the node shows score 0–100). Low scores drift outward — "needs attention".
- Lines connect each node to the centre with low opacity; lines to *related* nodes brighten on hover (e.g. hovering Sleep brightens Focus and Health links).

**Interaction**
- **Hover/focus a node:** node scales 1.12, label shows `Sleep · 61`, related links highlight, a small tooltip card shows one-line status ("Falling behind ↓").
- **Mouse move over orbit:** whole orbit tilts/parallaxes ≤ 6px (desktop only, off in reduced motion).
- **Click/Enter on a node:** triggers the **shared-element transition** (§8.1) into that dimension's screen.
- **Idle:** nodes drift on their orbit very slowly (±3° over 20s). Pause when tab hidden, off in reduced motion.
- Onboarding-chosen dimension has a 2px `--ink` ring and the label "Your focus".

**Accessibility**
- SVG has `role="group"` + `aria-label="Life Orbit: six life dimensions"`.
- Each node is a real `<button>` (via `foreignObject` or absolutely-positioned HTML over the SVG) with `aria-label="Sleep, score 61 of 100, falling behind. Open details."`.
- Tab order: Study → Focus → Health → Sleep → Money → Goals. Arrow keys also move between nodes.
- **List view alternative** (Settings or toggle button "View as list"): same six dimensions as a vertical list of cards with score bar + status + open button. This is the screen-reader/low-motion/mobile-friendly equivalent, and is the **default on viewports < 640px** if the orbit would be < 300px.

**Performance:** ≤ 40 DOM/SVG nodes total, transforms only, no per-frame React re-render (use CSS animation or motion values).

---

### SCREEN 4 — Dimension detail (`/app?view=<id>`)

One reusable template, six dimensions. Data comes from `demo-data.ts`.

**Layout (desktop):**
```
← Home / Sleep                             [ Try a What If → ]
─────────────────────────────────────────────────────────────
SLEEP                          (H1, with dimension icon)
61  /100        ↓ −4 this week  (AnimatedNumber + DeltaTag)
"You're averaging 6h 42m. Your focus drops after short nights."
─────────────────────────────────────────────────────────────
[ 7-day trend chart ]            │  THIS WEEK     +14% / −4%
                                 │  CONNECTED TO  Focus · Health
─────────────────────────────────────────────────────────────
NEXT ACTION  (highlighted card, 2px `--ink` border)
"Wind down by 11:00pm — phone away at 10:45"   [ Add to today ]
─────────────────────────────────────────────────────────────
RELATED DIMENSIONS (2 small cards → switch dimension)
```

**Per-dimension content** (use exact demo values in §10):
- **Study (82):** next action "Marketing — Segmentation, 45 min"; sub-metrics: hours this week, topics covered 4/9, exam countdown 3 days.
- **Focus (84):** best window 9–11am; distractions/hour; deep-work minutes.
- **Health (68):** steps, active minutes, hydration cups.
- **Sleep (61):** avg duration, bedtime consistency, wake time.
- **Money (74):** spent vs budget this month, biggest category, days until payday.
- **Goals (79):** 3 goals with progress bars, nearest milestone ETA.

**"Add to today":** toggles the action into the Today priorities (updates "2 priorities" → "3" with number animation) and shows a toast "Added to today" (`role="status"`).

**Switching dimension from here** (via related cards): content crossfades with a 24px slide, header number morphs.

---

### SCREEN 5 — What If? (`/app?view=whatif`) — the climax

**Purpose:** Let the user ask "what if I changed X?" and *see* the consequence across all dimensions.

**Theme:** this view (and only this view) uses `data-theme="night"` — see §4.1 for tokens and the Day → Night transition. Orbit nodes glow in their dimension `-fill` colours against the night background.

**Phase A — Ask**
- Full-screen calm state. Large prompt: **"What if…"** with an input underneath: placeholder `I sleep 1 hour earlier`.
- Below: 4 suggested **preset chips**:
  1. I sleep 1 hour earlier
  2. I study 2 hours every day
  3. I walk 30 minutes daily
  4. I cut food delivery in half
- Typing free text is allowed: parse with simple keyword matching (see §7.3). If unmatched → friendly message "I can simulate sleep, study, exercise, screen time and spending. Try one of these." (no dead ends).
- Primary button: **Simulate**. `Enter` also submits.

**Phase B — Simulating (≈1.8s)**
- Input collapses to a pill at the top with the user's sentence.
- The Life Orbit appears centred; nodes pulse in the order they're affected (ripple outward from the changed dimension).
- Status text cycles: "Adjusting your week…" → "Checking what it affects…" → "Building your future day".
- Reduced motion: skip ripple; show 0.5s "Calculating…" then results.

**Phase C — Result: NOW vs SIMULATED**
Two-column comparison (stacked on mobile):
```
        NOW                      SIMULATED
   [orbit, current]        [orbit, simulated version]
   Sleep   61              Sleep   75   ↑ +14
   Focus   84              Focus   93   ↑ +9
   ...
```
- Left orbit static; right orbit animates from current → simulated positions (nodes slide inward/outward, 1s, ease.inOut). Optional **drag/keyboard slider "Now ↔ Simulated"** that scrubs the right orbit between states (a11y: `role="slider"`, arrow keys).
- Below: **Impact list** — rows with DeltaTag + label + tiny bar (e.g. `SLEEP ↑ +14%`, `FOCUS ↑ +9%`, `ENERGY ↑ +11%`, `STRESS ↓ −8%`). Trade-offs use `--down` with a ↓ icon (e.g. "Free time ↓ −8%").
- **"Your future day"** card: a short timeline of what tomorrow would look like (3–4 entries, e.g. "10:00pm lights out → 6:30am wake → 9:00am deep study window").
- **Verdict line** (one sentence): "Worth it: big gain in focus and energy for 1 hour of lost evening time."
- Actions: **Apply to my plan** (adds actions to Today, toast + returns to Home with the Balance number morphing 74 → new value), **Try another**, and a note "Estimates based on demo data, not medical advice."

**The Balance score on Home persists the applied change** for the session, so the demo has a visible payoff.

---

## 7. Logic (no backend)

### 7.1 State model
```ts
type DimensionId = 'study'|'focus'|'health'|'sleep'|'money'|'goals';
interface Dimension { id:DimensionId; score:number; weekDelta:number; status:'strong'|'steady'|'attention'|'behind'; }
interface Profile { name:string; priority:'study'|'health'|'money'|'career'|'balance'; challenge:string; }
interface Settings { reducedMotion:'auto'|'on'|'off'; textSize:'default'|'large'|'xl'; orbitView:'visual'|'list'; }
interface Simulation { id:string; label:string; deltas:Partial<Record<DimensionId,number>>; extras:{key:string;label:string;delta:number;unit:'%'|'pts'|'days';good:boolean}[]; verdict:string; futureDay:{time:string;text:string}[]; }
```
Global store: `profile`, `dimensions`, `todayActions`, `settings`, `lastSimulation`.

### 7.2 Status thresholds
`≥80 strong · 65–79 steady · 50–64 attention · <50 behind`. Display each as **icon + word**.

### 7.3 Simulation engine (`lib/simulation`)
Deterministic, explainable. Presets are the source of truth; free text maps to a lever.

**Levers & coefficients (per 1 unit of change):**
| Lever | Unit | Study | Focus | Health | Sleep | Money | Goals | Energy | Stress | Free time |
|-------|------|-------|-------|--------|-------|-------|-------|--------|--------|-----------|
| sleepHours | +1 h | +6 | +9 | +4 | +14 | 0 | +2 | +11 | −8 | −4 |
| studyHours | +1 h/day | +10 | +2 | −1 | −2 | 0 | +6 | −2 | +2 | −4 |
| walkMinutes | +30 min | +1 | +3 | +12 | +4 | 0 | +2 | +7 | −6 | −2 |
| screenHours | −1 h | +4 | +5 | +1 | +6 | 0 | +1 | +4 | −3 | +1 |
| spendCut | −50% of category | 0 | 0 | 0 | 0 | +9 | +3 | 0 | −2 | 0 |

Rules:
- Result delta = coefficient × amount, with **diminishing returns**: `× (1 − currentScore/150)` for positive changes, clamped to 0–100.
- **Presets (exact outputs for the demo):**
  1. *Sleep 1h earlier* → Sleep +14, Focus +9, Energy +11, Stress −8, Study +6.
  2. *Study 2h every day* → Academic progress +21%, Free time −8%, Stress +4, Goal ETA 17 days.
  3. *Walk 30 min daily* → Health +12, Energy +7, Stress −6, Sleep +4, Focus +3.
  4. *Cut food delivery in half* → Money +9, Goals +3, Stress −2.
- Free text parsing: lowercase, regex for lever keywords (`sleep|bed|earlier`, `study|revise`, `walk|run|gym|exercise`, `phone|screen|scroll`, `spend|food|delivery|save`) and numbers (`(\d+)\s*(hour|hr|h|min)`). Unknown → helpful fallback message.
- Every result displays an "Estimate" label.

### 7.4 Dynamic copy
- First Home insight depends on onboarding priority (e.g. priority = Study → "Your study score is strong, but recovery is falling behind.").
- Challenge "I can't stay consistent" → add a "Consistency" insight about bedtime variance.
- Keep generated sentences short, plain, non-judgmental.

---

## 8. Motion choreography

### 8.1 Orbit → Dimension (signature transition)
1. User activates a node. Other nodes + lines fade to 0 and scale 0.9 (0.3s).
2. The chosen node moves to the centre and scales up (shared-element via `layoutId`, ease.inOut, 0.7s) until it fills the viewport as a circular reveal of the dimension screen background.
3. Dimension content fades up in stagger: title → number (count-up) → insight → chart (draw-in) → next-action card (80ms stagger each).
4. **Back:** reverse — content fades, node shrinks back to its position on the orbit.
Rule: the transition must always *begin at the clicked node* and *end at its place on return*. Never a plain fade between pages.

### 8.2 Numbers
`AnimatedNumber` tweens over 0.6s with ease.out on any change; tabular-nums; final value announced once.

### 8.3 Progress & charts
Bars/lines animate from 0 (or previous value) the first time they enter viewport (`IntersectionObserver`), then only on value change.

### 8.4 Hover & press
Cards: translateY −2px, border to `rgba(255,255,255,0.16)`, inner highlight shifts, 0.15s. Buttons: press scale 0.98.

### 8.5 Simulation ripple
Affected nodes pulse in sequence outward from the changed dimension (120ms stagger, scale 1→1.15→1, soft ring in the changed dimension's `-fill` colour fades).

### 8.6 Reduced motion (hard requirement)
When on (OS or in-app): remove parallax, drift, pulse, ripple, shared-element morph, count-up. Replace with 0.2s opacity crossfades and immediate values. App must remain fully usable and look intentional, not broken.

### 8.7 Performance rules
- Transform/opacity only. Max ~40 animated elements at once.
- No animation work while tab hidden (`document.hidden`).
- Dynamic-import any chart library; avoid heavy deps on landing.
- Target: smooth 60fps feel, Lighthouse Performance ≥ 90 and Accessibility ≥ 95 on `/` and `/app`.

---

## 9. Accessibility (judge-visible — do all of this)

- Semantic landmarks: `header`, `nav`, `main`, `section` with headings in logical order (one `h1` per view).
- **Keyboard:** everything reachable and operable; logical tab order; arrow keys inside the orbit, chip groups and sliders; `Esc` closes panels.
- **Focus-visible:** 3px `--focus-ring` + 2px offset on every interactive element; never remove outlines.
- Skip link; focus is moved to the new view's `h1` after each route/view change (and announced).
- `aria-live="polite"` region for toasts, simulation status, and result summary ("Simulation complete: sleep up 14%, focus up 9%…").
- Charts: text summary + keyboard scrubbing; data also available as a visually-hidden table.
- **Contrast** ≥ 4.5:1 (body), ≥ 3:1 (large text, UI). No info by colour alone.
- Touch targets ≥ 44×44px. Body text ≥ 16px (never < 12px anywhere).
- **Reduced motion** + **text size** + **list view** as described in §5.2 and §8.6.
- Support 200% zoom without horizontal scroll; layouts reflow.
- Proper `alt`/`aria-label` on icons; decorative SVGs `aria-hidden`.
- `lang="en"`, meaningful `<title>` per view.

---

## 10. Demo data (`data/demo-data.ts`)

```ts
user:   { name: "Alex", age: 20, course: "Business (Marketing)" }
dimensions: {
  study: 82 (week +14), focus: 84 (+3), health: 68 (+2),
  sleep: 61 (−4), money: 74 (+1), goals: 79 (+5)
}
balance: 74
today: { priorities: 2, sleep: "6h 42m", steps: 4820, weeklyGoal: 72 }
exam:  { subject: "Marketing", daysLeft: 3 }
nextActions: {
  study:  "Marketing — Segmentation · 45 min",
  sleep:  "Wind down by 11:00pm · phone away 10:45",
  health: "20-minute walk after lunch",
  money:  "Skip one delivery order this week (save ~$12)",
  goals:  "Finish 4Ps summary notes",
  focus:  "Protect 9–11am for deep work"
}
rhythm (24h, 3 curves): focus peaks ~10am and dips ~3pm; energy peaks ~11am, dip ~4pm; recovery rises after 9pm.
```
Seed 7-day trend arrays for each dimension (realistic small fluctuations). Adaptive plan example for today:
`45m Marketing Segmentation · 20m Active recall · 30m 4Ps · 10m Review`.

---

## 11. Responsive behaviour

Must be designed (not just squished) for: **1440×900, 1280×800, 1024×768, 390×844**.

- **≥1280:** two-column Home (orbit + balance), 4 Today cards in a row.
- **1024:** orbit above Balance card; Today cards 2×2.
- **<768 (mobile):** single column; **bottom tab bar**; orbit shown at ≤ 320px with list-view toggle prominent (list default if too small); Today cards horizontally snap-scroll or 2×2; What If? results stack NOW above SIMULATED with the scrubber slider between.
- No horizontal page scroll at any width. Safe-area padding for notched phones.

---

## 12. Project structure

```
src/
├── app/
│   ├── layout.tsx              (fonts, metadata, providers)
│   ├── page.tsx                (Landing)
│   ├── onboarding/page.tsx
│   └── app/page.tsx            (shell: Home | Dimension | WhatIf by ?view=)
├── components/
│   ├── LifeOrbit/              (Orbit, OrbitNode, OrbitListView)
│   ├── BalanceScore/
│   ├── DimensionView/
│   ├── Simulation/             (Ask, Simulating, Result, Scrubber)
│   ├── Rhythm/                 (chart)
│   ├── InsightCard/
│   ├── TodayCards/
│   ├── AnimatedNumber/
│   ├── Navigation/             (TopBar, TabBar, SkipLink)
│   ├── SettingsPanel/
│   └── ui/                     (Button, Chip, Card, ProgressBar, DeltaTag, Toast)
├── lib/
│   ├── simulation/            (engine, presets, parser)
│   ├── calculations/          (balance, status)
│   └── utils/
├── data/demo-data.ts
├── store/                      (life store)
└── styles/
    ├── globals.css             (tokens as CSS variables)
    └── tokens.ts
```

---

## 13. Copywriting rules
- Calm, clear, human. Short sentences. No hype, no jargon, no emoji in UI.
- Never shame ("You failed"). Prefer "falling behind", "needs attention", "room to grow".
- Every number has a plain-language line next to it.
- Buttons are verbs: *Enter LIFEOS, Simulate, Apply to my plan, Add to today.*
- Error/empty states are friendly and always offer a next step.

---

## 14. Build plan for the agent (do in order, one at a time)

**Step 0 — Plan (no code):** read this file; output component tree, state model, and file list for approval.

**Step 1 — Foundation:** Next.js + TS + Tailwind scaffold, tokens (§4), fonts, base UI components (Button, Chip, Card, DeltaTag, ProgressBar, AnimatedNumber), demo data, store. Commit.

**Step 2 — Landing + Onboarding.** Commit. Test keyboard + mobile.

**Step 3 — App shell + Home** (greeting, Balance, Today cards, Insights, static Orbit). Commit.

**Step 4 — Life Orbit interactions** + List view + shared-element transition to Dimension. Commit.

**Step 5 — Dimension template** for all six + charts. Commit.

**Step 6 — What If?** engine, presets, 3 phases, NOW vs SIMULATED, apply-to-plan. Commit.

**Step 7 — Settings** (reduced motion, text size, orbit view) and full reduced-motion pass. Commit.

**Step 8 — QA (browser agent):** test at 1440×900, 1280×800, 1024×768, 390×844; keyboard-only run through the full flow; check console errors; verify reduced motion; run Lighthouse; fix issues. Capture screenshots.

**Step 9 — Production check:** run `next build` and `next start`, fix all warnings/errors, and verify the full journey on the production build. (Deployment is done by the human, not the agent.)

### Definition of done
- Whole journey works from live URL with no errors: Landing → Onboarding → Home → Sleep → What If (preset 1) → Apply → Home (Balance changed).
- Keyboard-only users can complete it.
- Reduced motion mode looks intentional.
- No layout breaks at the four target sizes.
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95.
- No placeholder text, no lorem ipsum, no dead buttons.

---

## 15. Hard "never" list
- Never ship a screen that's only a fade-out → fade-in between orbit and dimension.
- Never use colour alone to show status.
- Never put real-looking personal/medical claims in the UI.
- Never add a library "just in case".
- Never leave a console error or a broken link.
- Never let animation block interaction or hide content from keyboard/screen-reader users.
