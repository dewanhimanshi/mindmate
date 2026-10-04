# MindMate: Features and How They Work

MindMate is a mobile-first web app that helps school students, including children with special needs, notice how they feel, find support, and take small positive steps. Parents can create a family account with a profile for each child, and visitors can try it instantly as a guest.

**Live app:** https://mindmate-bbps.web.app
**Source code:** https://github.com/dewanhimanshi/mindmate

---

## At a glance

| Area | What it offers |
|---|---|
| Health & Well-being | Guided check-in, 24 feelings, 14 needs, 39 short interactive activities |
| Everyday Support | 10 difficulties with 63 strategies, 20 exercise activities, food ideas, calm and sensory tools |
| I Want to Talk | Who to talk to, when and how, conversation starters spoken aloud, full-screen "show it" cards |
| My Progress | Weekly feelings, needs, what helped, personal insights, small wins, strengths, voice notes, history |
| Accessibility | Read-aloud on every screen, text sizes, high contrast, dark mode, calm mode, large tap targets |
| Accounts | Email or Google sign-in, child profiles, guest mode, grown-ups area |
| Exhibition ready | Works offline, auto-reset for shared devices, one-tap sample data, rich link previews |

---

## 1. Health & Well-being

### Check-in flow
A step-by-step wizard, one question per screen with a progress indicator:

1. **How am I feeling today?** 24 feeling cards in three groups (good, in-between, hard), plus "I don't know how I feel".
2. **What do you need right now?** Choose one or more of 14 needs, such as calm down, focus, a break, friendship, school, home, online, encouragement or someone to listen.
3. **What's this about?** Optional context: school, friends, home, online, something that happened.
4. **Help me feel better:** activities matched to each chosen need, three per need.
5. **Do the activity:** played screen by screen.
6. **Reflect:** "How do you feel now?" and "Did it help?" (helped a lot, a little, or not this time), plus an optional note.
7. **Celebrate:** a friendly completion screen, then the check-in is saved.

**How it works:** the wizard is a single React component with a small state machine (`feeling → needs → about → pick → play → reflect → done`). A home-screen feeling shortcut deep-links into step 2. Activities a child previously rated "helped a lot" for the same need move to the top with a "Helped you before" tag.

### 39 interactive activities
Every activity from the requirements document is interactive, built from 12 reusable screen types:

| Screen type | Used for |
|---|---|
| Breathing | Animated bubble that grows and shrinks with in, hold and out counts |
| Grounding | 5-4-3-2-1: tap a circle for each thing you see, touch, hear, smell and like |
| Timer | Circular countdown for focus, breaks and "start for 2 minutes" |
| Sound | Calm Corner with rain, waves or a soft hum, generated live in the browser |
| Choose | Picture cards, single or multiple choice (e.g. "What happened?", "Strength reminder") |
| Sentence | Fill-in-the-blank sentences such as "I felt ___ when ___ happened", which the app can read back |
| Prompt and List | Short writing, e.g. "Break it down into 3 small steps", "3 things that made today better" |
| Checklist | THINK check before posting online: True, Helpful, Kind, Necessary, Safe |
| Express | Write freely or draw on a canvas with colours and brush sizes |
| Voice | Record a short voice note (up to 60 seconds) and keep it |
| Info | Simple guidance screens with read-aloud |

**How it works:** activities are stored as data (`src/data/activities.ts`), not as separate pages. One `ActivityPlayer` component renders any activity from its list of screens, so new activities can be added without new code. Some activities feed other parts of the app: "My Small Win" adds to My Progress wins, and "Strength Reminder" adds to My Strengths.

### "I'm not sure what I need"
A two-question helper: *How do you feel right now?* then *What sounds most helpful?* It suggests **one** small activity, with a "Show me something else" option.

**How it works:** a lookup table maps each feeling and helpful choice to the most suitable activity, falling back to the activities for that need.

### "Understand my feelings"
Feeling → what triggered it → what do I need. It ends with a sentence the child can hear aloud or show to an adult, e.g. *"I feel worried because of school. I need support."*, plus matching activities.

---

## 2. Everyday Support

### What is difficult for me?
Ten difficulties: Writing, Reading, Maths, Listening, Attention, Communication, Social Skills, Movement, Staying Calm and Food Choices. Each opens a page following the chain **Difficulty → Strategy → Activity → Progress**:
- 63 practical strategies in total (e.g. pencil grip, number line, visual timetable, sentence starters).
- An **"I tried this"** button on each strategy logs it to My Progress and shows how many times it has been tried.
- Linked activities and pages for the next step.

The **Academics** view shows only the learning-related difficulties.

### Exercise & Movement
Seven goals (balance, strength, coordination, motor skills, stamina, flexibility, social participation) with **20 step-by-step activities**, such as flamingo stand, wall push-ups, balloon tapping and bead threading. Each activity has numbered steps, a read-aloud button and an "I did it!" log.

### Food Support
Five needs (mobility, fine motor, attention and learning, low energy, bones and growing), each with a goal, 8 suggested foods and quick meal combinations using familiar Indian foods. A **preferred texture** choice (soft, crunchy, smooth, mixed) is saved to the child's profile. Allergy guidance is shown throughout.

### Calm & Sensory
Guided calming tools (breathing, grounding, Calm Corner sounds, quiet minute) and **14 sensory break ideas** in two groups: for when everything feels too much, and for when a child feels sleepy or slow.

---

## 3. I Want to Talk

- **Who can I talk to?** School counsellor, teacher, parent or caregiver, and trusted adult. Each has *when* to talk to them, tips for *how* to start, and three conversation starters.
- **Conversation starters:** 8 general phrases plus 12 person-specific ones. Each has a **"Say it for me"** button that makes the device speak it aloud (helpful for children who find speaking hard), and a copy button.
- **Help me say it:**
  - **Say it:** build "Can I talk to you? I'm feeling ___ about ___." from feeling and topic choices, then hear it.
  - **Write it:** type a message and show it full screen.
  - **Show it:** a large feeling card to turn towards a trusted adult.
- **Need help right now?** A calm banner with a breathing prompt and an "I need help" phrase the device can say.

---

## 4. My Progress

No scores, grades or competition. A gentle look back:

- **My week at a glance:** a 7-day strip showing the main feeling each day, and a chart of feelings noticed most.
- **What did I need?** A chart of the kinds of support looked for.
- **What helped me?** For each type of activity (breathing, quiet time, movement, writing, talking and so on), how often it was tried and how much it helped.
- **Personal insights:** short sentences such as *"Quiet time usually helps you calm down."* These only appear after at least two rated tries, and only when something mostly helped.
- **Everyday support I tried:** strategies, exercises, calm ideas and foods from the last 30 days.
- **My small wins:** add a win with a category, or tap an example such as "I asked for help".
- **My strengths:** 12 badges (kind, brave, creative, determined…) and "Something I am proud of".
- **Voice notes:** listen to or delete recordings.
- **Check-in history:** tap any entry to see *how I felt → what I needed → what I tried → how I felt afterwards*.

**How it works:** insights are calculated in the browser from the last 30 days of check-ins (`src/lib/insights.ts`) and covered by automated tests.

---

## 5. Accessibility and child-friendly design

| Feature | Details |
|---|---|
| Read aloud | A speaker button beside every question, card and section reads the **whole section**, highlighting each part as it is spoken |
| Read page | One button in the top bar reads the entire screen in order |
| Auto-read | Optional: each new question is read out automatically |
| Voice settings | Choice of voice (Indian English preferred when available) and speed: slow, normal, fast |
| Say it for me | The device speaks a sentence on the child's behalf |
| Text size | Four sizes, applied across the whole app |
| High contrast | Black and white with strong outlines |
| Themes | Light, dark, or follow the device |
| Calm mode | Turns off confetti and moving animations; also respects the device's "reduce motion" setting |
| Gentle sounds | Optional soft chime on completion |
| Easy reading | Lexend and Atkinson Hyperlegible fonts, short sentences, a picture next to every choice |
| Motor friendly | Large tap targets (48 to 56 px), no dragging or time pressure required |
| Assistive tech | Keyboard navigation, visible focus rings, labelled controls, screen-reader announcements |

**How read-aloud works:** it uses the browser's built-in Web Speech API through the free `easy-speech` library, so it costs nothing, needs no account and works offline on most devices. Text is cleaned before speaking (emoji removed, line breaks turned into pauses) and read sentence by sentence, avoiding a known cut-off in Chrome. Settings are saved per child and follow them to any device.

---

## 6. Accounts, profiles and privacy

- **Family account** for parents and caregivers, with **email and password** or **Sign in with Google**.
- **Parental consent** is confirmed at sign-up. First-time Google users see a short consent step before anything is stored; cancelling removes the new sign-in.
- **Child profiles:** "Who's using MindMate?" picker with a name or nickname, one of 12 animal avatars and a favourite colour. No date of birth, school or photo is stored.
- **Guest mode:** try everything without an account; data stays only on that device.
- **Grown-ups area** behind a simple times-table check: manage profiles, add sample data, delete a profile and all its data, reset guest data, and switch on exhibition mode.
- **Password reset** by email.

**How data is protected:** each family's data lives under its own account in Cloud Firestore, and server-side **security rules** allow only the signed-in parent to read or write it. Voice notes are size-limited by the same rules.

---

## 7. Exhibition-ready features

- **Works offline:** after one visit, a service worker caches every page and asset (125 files), so the app keeps working if the venue Wi-Fi drops.
- **Exhibition mode:** on a shared device in guest mode, after 2 minutes idle MindMate asks "Are you still there?", then clears guest data for the next visitor.
- **Sample data:** one tap fills a profile with three weeks of realistic check-ins, wins and strengths, so My Progress can be demonstrated straight away.
- **Installable:** can be added to a phone or tablet home screen like an app.
- **Rich link previews:** sharing the link shows a title, description and preview image in WhatsApp, iMessage, Slack and social apps.
- **Two addresses:** the same build is served on mindmate-bbps.web.app and mindmate-d7b02.web.app.

---

## 8. Safety

- A permanent reminder on every screen: *"If you ever feel unsafe, tell a trusted adult straight away."*
- Clear wording that MindMate is a self-help tool, not a medical, counselling or emergency service.
- Content uses the school's requirements document as its source; additional strategies and activities are marked for review by the school counsellor or special educator.

---

## 9. Technical overview

### Stack
| Layer | Technology |
|---|---|
| Framework | Astro 7, static site output (74 pre-built pages) |
| Interactive UI | React 19 "islands" |
| Styling | Tailwind CSS v4 with design tokens (colours, themes, text scale as CSS variables) |
| Animation | Motion (Framer Motion), CSS keyframes, canvas-confetti |
| Icons | Lucide |
| State | nanostores (shared across pages; active profile and settings persisted) |
| Authentication | Firebase Authentication (email/password and Google) |
| Database | Cloud Firestore with offline cache |
| Guest storage | Browser localStorage, with IndexedDB for voice notes |
| Read aloud | Web Speech API via easy-speech |
| Audio | Web Audio API for calm sounds and chimes (no audio files) |
| Hosting | Firebase Hosting, free Spark plan, no server code |
| Testing | Vitest (content integrity, insights logic, speech text) |

### Architecture highlights
- **Content as data:** all feelings, needs, activities, strategies, exercises, foods and talk content live in typed files under `src/data/`. Automated tests check that every link between them is valid, so content can be edited safely.
- **One data interface, two storage backends:** the same `Repo` interface is implemented for Firestore (signed in) and local storage (guest), so every screen works the same in both modes.
- **Data model:** `users/{uid}/children/{childId}` with sub-collections for `checkins`, `activityLogs`, `wins` and `voiceNotes`.
- **Voice notes without paid storage:** recordings are compressed (about 180 KB per minute) and stored directly in Firestore, staying within the free plan.
- **Offline support:** a build step generates the service worker with a precache list and a version hash, so each deploy updates cleanly.
- **Fast and light:** static pages load instantly; the Firebase database code is only downloaded for signed-in users.

### Running it locally
```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm test
pnpm run deploy   # builds and deploys to both Firebase Hosting sites
```
