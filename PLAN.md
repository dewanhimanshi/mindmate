# MindMate: Build Plan

A mobile-first, accessible well-being and everyday-support web app for school students, including students with special needs. Parents can sign in and keep a profile for each child. Built with **Astro + React islands**, with data in **Firebase** (Auth + Firestore) and hosting on **Firebase Hosting**.

Sources: the requirements doc (*Mindmate: Website version*) and a full walkthrough of the Lovable prototype at `support-hub-website.lovable.app`, including its public JS bundles, content data and design tokens.

---

## 1. Findings from the Lovable prototype

**Its stack:** TanStack Start (React) + Supabase. It has no accounts: an anonymous `wellbeing-session-id` sits in localStorage and check-ins are saved against it. The fonts are **Atkinson Hyperlegible** (body) and **Lexend** (headings). The palette is pastel (mint, sky, peach, lilac, butter, rose on a cream background) with a teal primary. It has a high-contrast mode and respects reduced motion.

### Worth carrying over
| Area | What exists |
|---|---|
| Feelings | 24 feelings in 3 groups (positive / neutral-low / difficult) plus "I don't know how I feel" |
| Needs | 15 multi-select needs, plus an optional "What's this about?" (school / friends / home / online / happened / don't know / else) |
| Tools | **5-4-3-2-1 grounding** (tap circles per sense, auto-advance) · **Breathing 4-4-4** (animated ring) · **Calm Corner** (ambient rain / waves / hum generated with WebAudio) · **Focus & Pause timer** (1/2/5 min) · **Get It Out** (write *or* draw on a canvas) |
| Check-in record | `{ feeling, needs[], trigger_reason, activity_tried, helpfulness_rating, notes }` |
| Accessibility content | Strategies for all **10 difficulties**, not just the 5 in the doc. Lovable wrote the missing ones (Communication, Social, Movement, Staying Calm, Food) |
| Exercise | Step-by-step activities for all **7 goals**. The doc only gave Coordination |
| Food | 5 need-based food groups with "quick choices" + 4 textures (Soft / Crunchy / Smooth / Mixed) |
| Talk | 4 trusted people (Counsellor, Teacher, Parent, Trusted Adult), each with *when* and *how*; 8 conversation starters (tap to copy); Say / Write / Show It builder ("I'm feeling __ about __") |
| Progress | Week at a glance, What helped me, Small wins (with categories), My strengths (12 badges + "proud of…"), Check-in history |

### Gaps and things to improve
1. **Activities aren't matched to the need.** The same 5 tools appear whatever the student picks. The doc defines **3 activities for each of 13 needs**, plus a guided "I'm not sure" flow. This is the biggest functional gap.
2. **"I'm not sure what I need"** (feel → what sounds helpful → one suggestion) and **"Understand my feelings"** (feeling → trigger → need) aren't built as guided flows.
3. **The check-in has no "how do you feel now?" question**, but the doc's history needs *felt → needed → tried → felt afterwards*.
4. **The accessibility chain stops at strategies.** Difficulty → Strategy → *Activity → Progress* isn't connected.
5. **Calm & Sensory** (from the doc's section table) has no section of its own.
6. **"Voice It"** voice notes are missing.
7. **There's no text-to-speech**, no accounts and no profiles.
8. **Everything sits on long scrolling pages.** On mobile it should be one question per screen with clear progress.
9. **The look is calm but muted.** The new brief asks for colourful, modern and animated.
10. **Naming doesn't match.** The doc says "MindMate"; the prototype says "Support Hub". We'll use **MindMate**.

**Content source of truth:** the doc wins where it's specific; Lovable's content fills the doc's gaps. Everything is gathered into typed JSON (see §5) so the school can review it in one place.

---

## 2. Product shape

### Who uses it
- **Parent (account holder):** signs up with email + password, creates child profiles and manages settings. Reaches a PIN-gated "Grown-ups" area.
- **Child (profile):** picks their avatar on a "Who's using MindMate?" screen, then uses the app. No email or password for kids.
- **Guest / exhibition visitor:** "Try without an account". Data stays on the device only, and there's a one-tap **Reset**.

### Information architecture
```
Welcome ─┬─ Log in / Sign up / Forgot password
         └─ Try as guest
Who's using? (profiles) ── Add profile (name/nickname + avatar + colour)

Child Home
 ├─ 🧠 Health & Well-being
 │    Check-in wizard: Feeling → Need(s) → (What's it about?) → Suggested activities
 │    → Activity player → "How do you feel now?" + "Did it help?" → 🎉 saved
 │    ├─ I'm not sure what I need (guided mini-flow)
 │    └─ Understand my feelings (Feeling → Trigger → Need mini-flow)
 ├─ ♿ Everyday Support
 │    ├─ ✍️ What is difficult for me?  → Strategies → Try an activity → log progress
 │    ├─ 📚 Academics (Writing, Reading, Maths, Listening, Attention)
 │    ├─ 🏃 Exercise   → goal → activity with steps (+ timer)
 │    ├─ 🍎 Food       → need → foods + quick choices; ❤️ my preferred texture
 │    └─ 🧘 Calm & Sensory (breathing, grounding, calm corner sounds, sensory break ideas)
 ├─ 💬 I Want to Talk (always one tap away: floating button + home tile)
 │    Who can I talk to? → When / How → Conversation starters
 │    Say It (app speaks it aloud) · Write It (full-screen note to show) · Show It (big feeling card)
 └─ ⭐ My Progress
      Week at a glance · What did I need · What helped me (+ insights) · Small wins
      · My strengths · Check-in history (tap a day → felt / needed / tried / felt after)

⚙️ My Settings (child): read-aloud, voice speed, text size, calm mode, contrast, sounds
🔒 Grown-ups (PIN): manage profiles, account, data export/delete, exhibition mode
```

### Navigation
- **Mobile:** bottom tab bar (Home · Feel · Support · Talk · Progress), big tap targets of at least 56px, plus a sticky **🔊 Read aloud** button.
- **Desktop:** top nav, with content centred at max width ~1100px and two-column layouts where that helps (e.g. difficulty list + strategies side by side).

---

## 3. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro 5**, `output: 'static'` | Fast static pages; content collections; deploys to Firebase Hosting as plain files (no Functions or Blaze plan needed) |
| Interactivity | **React 19 islands** (`client:load` / `client:only`) | Wizards, timers, auth-aware UI |
| Page transitions | **Astro View Transitions** (`<ClientRouter />`) with `transition:persist` on the app shell | Smooth, app-like navigation |
| Styling | **Tailwind CSS v4** + CSS custom-property design tokens | Theming (contrast, text size, calm mode) through tokens |
| Animation | **motion** (Framer Motion) + CSS keyframes; **canvas-confetti** for celebrations | Lively but controllable; all gated by Calm Mode / reduced motion |
| Shared state | **nanostores** + `@nanostores/react` + `@nanostores/persistent` | State shared across Astro islands (user, active child, settings) |
| Auth | **Firebase Auth** (email/password, password reset) | As specified |
| Database | **Cloud Firestore** (modular SDK v11) with offline persistence | Per-child data; syncs; works offline |
| Content | **Astro content collections** (JSON + Zod schemas) | Typed, versioned, bundled; no database reads for static content |
| Text-to-speech | **Web Speech API** (`speechSynthesis`), wrapped with the **easy-speech** library (MIT) | Free, built into browsers, no API key, works offline on most devices |
| Emoji / illustrations | **Noto Animated Emoji** (Google, CC BY 4.0) for feeling cards; Lucide icons | Emoji look the same on Windows, Android and iOS (the exhibition PC may be Windows), and they move |
| PWA | **@vite-pwa/astro** | Installable; works offline at the venue |
| Testing | **Vitest** (logic), **Playwright** + **@axe-core/playwright** (flows + accessibility) | |
| Deploy | **firebase-tools** (`hosting`, `firestore:rules`, `firestore:indexes`) | |

### Decision: Firestore is the backend ✅ (confirmed)
All app data lives in **Cloud Firestore**, on the **free Spark plan** (1 GiB storage, 50k reads and 20k writes per day). The app talks to Firestore through the official SDK, which gives offline cache and live updates, and **security rules** enforce "each parent can only see their own family's data". We write no server code, so we don't need Cloud Functions or the paid Blaze plan.
The SDK sits behind a typed `services/` layer (`checkins.create()`, `progress.week()` …), so the UI calls an API-like interface. Firestore also has a REST API if we ever need it.

---

## 4. Accessibility & child-friendly design (must-haves)

**Text-to-speech**
- 🔊 button on every card, question, strategy, activity step and conversation starter.
- "Read the whole screen" button in the app bar.
- Optional **auto-read** of each new question in the wizard.
- Highlights the sentence being read, plus words where the browser supports `boundary` events.
- Settings: voice (prefer `en-IN`), speed (0.7× / 1× / 1.2×), on/off.
- **"Say it for me"** in Talk: the device speaks the conversation starter to the adult, which works like a basic AAC aid.
- Handles known quirks: voices load asynchronously; Chrome stops long speech, so text is read in sentence chunks; iOS needs a tap before it will speak.

**Visual / cognitive**
- One question per screen, with a step indicator ("2 of 4"), a big **Back** button and **Skip** wherever it makes sense.
- Every option is **emoji or illustration + short label**. Simple language, short sentences.
- Fonts: Lexend (headings) + Atkinson Hyperlegible (body); an option to switch to OpenDyslexic.
- Text size: S / M / L / XL (a root `font-size` token).
- **High contrast** theme and dark theme.
- **Calm Mode**: turns off confetti, bouncing and ambient motion and softens colours. On automatically if the OS has reduced motion set. This matters because "full of animations" can overwhelm some autistic children.
- Sound effects (gentle chimes) are optional and off by default.

**Motor / input**
- Tap targets ≥ 48px (most are 56px+), no drag-only interactions, no time pressure.
- Full keyboard support, visible focus rings, `aria-live` announcements for step changes, semantic headings and labels.

**Target:** WCAG 2.2 AA, checked automatically with axe in CI and by hand with VoiceOver/TalkBack.

**Tone (from the doc):** no scores, points or competition. Celebrations stay gentle ("You did it! 🌱"), with no badges for usage.

---

## 5. Content model (all content as typed JSON)

```
src/content/
  feelings.json        # groups → { id, label, emoji, animatedEmoji, tone }
  needs.json           # 14 needs → { id, label, emoji, color, activityIds[3] }
  activities.json      # ~40 activities → { id, title, emoji, needId, minutes, steps: Step[] }
  notSure.json         # feeling × "what sounds helpful" → activityId mapping
  difficulties.json    # 10 → { id, label, emoji, statement, strategies[], activityIds[] }
  exercise.json        # 7 goals → activities with steps
  food.json            # 5 need groups (goal, foods, quick) + 4 textures
  calmSensory.json     # sensory-break ideas + tools
  talk.json            # people (when/how/starters), starters, topics
  progress.json        # strengths, win examples, win categories, "what helped" types
```

**The activity engine** plays activities from data, not hand-written pages. Step types:

| Step type | Used by (doc examples) |
|---|---|
| `info` | Text + illustration + 🔊 |
| `breathing` | Slow Breathing, Quiet Minute |
| `grounding` | 5-4-3-2-1 Reset |
| `timer` | Focus-Pause-Focus, Start for 2 Minutes, Calm Corner, Stretch & Reset |
| `choose` (single / multi) | Who can I talk to?, What happened?, Strength Reminder, THINK check, Mood Booster |
| `prompt` (fill in the blank) | "I felt ___ when ___", "I wish someone understood that…", "I may not have got it right yet, but I can…" |
| `list` (n items) | Break It Down (3 steps), Gratitude Moment (3 things), Clear My Space |
| `draw` | Get It Out |
| `voice` | Voice It (recorded on the device only; see §9) |
| `sound` | Calm Corner ambient (rain / waves / hum) |

New content is added by editing JSON, with no code changes. That makes it easy to hand to the school for review.

**Suggestion logic:** selected needs → their activities. Any activity this child rated "Helped a lot" for the same need is shown first, with a **"This helped you before ⭐"** tag.

---

## 6. Data model (Firestore)

```
users/{uid}
  email, displayName, createdAt, parentPinHash
  children/{childId}
    name (first name / nickname only), avatar, color, createdAt
    settings: { tts, autoRead, voiceURI, rate, textSize, calmMode, contrast, font, sounds }
    preferences: { texture }
    strengths: string[], proudOf: string
    checkins/{id}
      createdAt, source: 'wellbeing' | 'notSure' | 'understand'
      feeling, needs[], about, activityId, feelingAfter, helpfulness, note
    activityLogs/{id}                 # Everyday-support side
      createdAt, kind: 'strategy' | 'exercise' | 'calm' | 'food'
      refId, difficultyId?, helpfulness?
    wins/{id}       createdAt, text, category
    journal/{id}    createdAt, promptId, text   # fill-in prompts, optional to save
    voiceNotes/{id} createdAt, durationSec, mimeType, audio: Bytes   # ≤ 60 s, see below
```

**Voice notes in Firestore (no extra service).** Notes are recorded with `MediaRecorder` as Opus/WebM at ~24 kbps (Safari: AAC/MP4). A 60-second note is about 180 KB, comfortably under Firestore's 1 MiB document limit, and is stored as the native `Bytes` type (no base64). Notes live in their own subcollection, so loading lists never downloads audio. Recording is capped at 60 s. Guest mode keeps notes in IndexedDB on the device. The parent can delete any note.

- **Security rules:** read/write only when `request.auth.uid == uid`, with schema and size validation on writes.
- **Repository layer:** one interface with two adapters, `FirestoreRepo` (signed in) and `LocalRepo` (guest/exhibition, localStorage). The UI never knows which one it's using.
- **Progress insights** are computed on the client from the last 7 or 30 days of check-ins: feeling counts, need counts, and for each activity the helped-a-lot rate by need. That powers lines like *"Quiet time usually helps you calm down."* An insight only appears after ≥ 2 data points.

---

## 7. Visual design direction

- **Look:** bright, friendly and rounded. Soft gradients, chunky cards with gentle shadows, lots of white space so it never feels cluttered.
- **A colour for each section** so kids learn where they are: Well-being = violet → pink · Everyday Support = teal → green · Talk = orange → coral · Progress = sunny yellow → amber. Feeling groups keep mint / sky / peach.
- **Mascot (optional, recommended):** a simple SVG sprout character, "Mindy", that greets the child, nods on selection and cheers on completion. CSS/motion only, no heavy assets.
- **Motion vocabulary:** cards pop in staggered; selected options bounce and get a check mark; step transitions slide; a breathing ring; confetti on save or a small win; a page-level view transition. All of it is switched off by Calm Mode.
- **Avatars:** a set of 12 friendly animal or emoji avatars for child profiles.
- Light, dark and high-contrast themes, all built from the same tokens.

---

## 8. Project structure

```
well-being-app/
  astro.config.mjs  firebase.json  firestore.rules  firestore.indexes.json  .firebaserc
  .env.example                     # PUBLIC_FIREBASE_* config
  public/                          # icons, avatars, animated emoji, manifest assets
  src/
    content/                       # JSON collections (§5) + config.ts (Zod schemas)
    layouts/AppLayout.astro        # shell: nav, TTS bar, settings, view transitions
    pages/
      index.astro  login.astro  signup.astro  forgot.astro
      profiles/index.astro  profiles/new.astro
      home.astro
      wellbeing/index.astro  wellbeing/check-in.astro  wellbeing/not-sure.astro
      wellbeing/understand.astro  wellbeing/activity/[id].astro
      support/index.astro  support/difficulty/[id].astro  support/exercise/[[goal]].astro
      support/food.astro  support/calm.astro
      talk/index.astro  talk/[person].astro  talk/say-it.astro
      progress.astro  settings.astro  grown-ups.astro
    components/
      ui/            # Button, ChoiceCard, Chip, StepWizard, Sheet, Toast, ProgressDots
      speech/        # SpeakButton, ReadScreen, useSpeech
      activity/      # ActivityPlayer + one component per step type
      mascot/  progress/  talk/  auth/
    lib/
      firebase.ts  repo/{types,firestore,local}.ts  services/*.ts
      stores/{session,child,settings}.ts  insights.ts  suggest.ts
    styles/tokens.css  global.css
  tests/  e2e/
```

---

## 9. Risks & decisions to confirm

| # | Topic | Recommendation |
|---|---|---|
| 1 | Backend | ✅ Firestore SDK + security rules on the free Spark plan |
| 2 | **Voice notes** ("Voice It") | ✅ Short notes (≤ 60 s) stored as `Bytes` in Firestore; no Firebase Storage or Blaze needed |
| 3 | Children's data privacy (India's DPDP Act needs parental consent for children's data) | The parent-account model handles consent. Store a nickname only (no DOB, school or photo). Consent checkbox at signup. "Delete all data" in Grown-ups |
| 4 | Safeguarding: the app is not a crisis service | Persistent "If you feel unsafe, tell a trusted adult now" line. **School counsellor reviews all content.** School confirms whether to show a helpline (e.g. Tele-MANAS 14416) |
| 5 | "Full of animations" vs sensory overload | Calm Mode toggle, on automatically with OS reduced-motion |
| 6 | TTS voices differ by device | Test on the actual exhibition computer early; fall back to the default voice. Hindi voice possible later |
| 7 | Exhibition network | PWA offline cache + guest mode works fully offline. **Exhibition mode:** auto-reset to Welcome after 2 min idle, plus a Reset button |
| 8 | Showing Progress at the exhibition (empty for new users) | A **demo account** seeded with 2-3 weeks of realistic data via a script |
| 9 | Content beyond the doc (written by Lovable) | Export a single content review sheet for the school to approve |

---

## 10. Delivery plan: 5-day sprint

The exhibition is **about a week away, date not fixed yet**, so the work is ordered so that **a complete, presentable app exists from Day 3**. Days 4-5 add depth and polish. Every day ends with a deploy to Firebase Hosting.

### Priority tiers
**P0, must have for the exhibition**
- Accounts (sign up / log in / reset), child profiles, guest mode
- Health & Well-being: check-in wizard → need-matched activities → activity player → "feel now / did it help" → save
- Everyday Support: difficulty → strategies; Exercise; Food (+ texture)
- I Want to Talk: people, starters, Say it for me / Write It / Show It
- My Progress: week at a glance, what helped, small wins, history
- Text-to-speech on every screen, text size, high contrast, Calm Mode
- Colourful theme + core animations, mobile + desktop layouts
- Demo account with seeded data; exhibition reset button

**P1, should have (Days 4-5 if on track)**
- "I'm not sure" and "Understand my feelings" mini-flows
- Calm & Sensory section with ambient sounds
- Voice notes (Firestore `Bytes`)
- Insights ("Quiet time usually helps you calm down"), strengths
- PWA / offline, idle auto-reset
- Animated Noto emoji, mascot

**P2, after the exhibition**
- OpenDyslexic font option, word-level highlighting while reading
- Grown-ups PIN, data export
- Playwright / axe automated test suite (manual a11y checks still happen before the exhibition)

### Day by day
| Day | Goal | Output |
|---|---|---|
| **0 (today)** | You set up Firebase (see §11) · I scaffold the project, design tokens and the content JSON | Repo running locally |
| **1** | Design system + app shell + TTS + settings · Auth + profiles + guest mode · rules deployed | Live URL: sign in, pick a profile, navigate a styled shell that reads aloud |
| **2** | Health & Well-being end to end (wizard, activity engine, all step types, save check-in) | Full check-in flow saves to Firestore |
| **3** | Everyday Support + I Want to Talk + My Progress (P0 parts) | **Feature-complete P0 app, presentable** |
| **4** | P1 features · demo-data seed · exhibition mode | Richer app with demo account |
| **5** | Polish: animations, device testing (Android, iPhone, Windows PC), a11y pass, Lighthouse, content proof-read · final deploy + QR code + "how to present" note | **Exhibition build** |

If the date moves earlier, we ship the Day 3 build as is; it's complete, just less polished.

---

## 11. Inputs needed

| Item | Status |
|---|---|
| Firestore as backend | ✅ Confirmed |
| Voice notes approach | ✅ Firestore `Bytes`, ≤ 60 s |
| Parent account → child profiles + guest mode | ✅ Confirmed |
| Language | ✅ English only |
| Exhibition date | ⏳ About a week, TBC |
| **Firebase project + web config** | ⏳ You (steps in chat) |
| School name/logo, helpline to show (optional) | ⏳ School |
| Content review by counsellor / special educator | ⏳ School (sheet arrives Day 1) |
