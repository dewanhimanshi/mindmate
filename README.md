# MindMate

A mobile-first, accessible well-being and everyday-support web app for school students, including students with special needs. Parents create a family account and add a profile for each child; visitors can also use guest mode.

**Live:** https://mindmate-bbps.web.app (also https://mindmate-d7b02.web.app)

## What's inside

| Section | Highlights |
|---|---|
| Health & Well-being | Check-in wizard (feeling → needs → what it's about → matched activities → "How do you feel now?" + "Did it help?"), 39 activities across 13 needs, "I'm not sure what I need", "Understand my feelings" |
| Everyday Support | 10 difficulties → strategies ("I tried this") → linked activities; Academics; Exercise (7 goals, step-by-step); Food (5 needs + preferred texture); Calm & Sensory |
| I Want to Talk | Trusted people (when / how / starters), "Say it for me" text-to-speech, Write it / Show it full-screen cards |
| My Progress | Week at a glance, what I needed, what helped (+ gentle insights), everyday support tried, small wins, strengths, voice notes, check-in history |
| Accessibility | Read-aloud on every screen + "Read page", auto-read questions, voice & speed, text size S-XL, high contrast, dark mode, Calm Mode (no animations), big tap targets, keyboard & screen-reader support |
| Exhibition | Works offline (service worker), guest mode, exhibition auto-reset after 2 min idle, one-tap sample data |

## Presenting at the exhibition

**On a shared computer or tablet**
1. Open the live URL in Chrome or Edge and wait a few seconds; the app is then cached for offline use.
2. Tap **Try without an account**, then create a profile (e.g. "Visitor").
3. Open the avatar menu → **Grown-ups** → turn on **Exhibition mode**. After 2 minutes idle, guest data clears for the next visitor.
4. Optional: in Grown-ups, tap **Sample data** on a profile so My Progress has a full 3 weeks to show.

**On visitors' phones:** share the live URL (or a QR code for it). Each phone keeps its own guest data.

**For a family demo:** create a family account, add a child profile, and add sample data from Grown-ups.

## Development

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm test         # content integrity + insights logic
pnpm typecheck
pnpm run deploy   # build + deploy hosting and Firestore rules
```

- Stack: Astro 7 (static) + React 19 islands, Tailwind v4, motion, nanostores, Firebase Auth + Firestore (free Spark plan), Web Speech API via easy-speech.
- **Content** lives in `src/data/*.ts`; edit it there and run `pnpm test`.
- **Data**: `users/{uid}/children/{childId}/{checkins|activityLogs|wins|voiceNotes}`; rules in `firestore.rules`. Guest mode uses `src/lib/repo/local.ts` (localStorage + IndexedDB).
- Plan and decisions: `PLAN.md`.
