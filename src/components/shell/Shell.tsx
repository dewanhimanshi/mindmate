import { useStore } from '@nanostores/react';
import { Accessibility, CircleAlert, CircleCheck, Hand, Heart, House, Lock, LogOut, MessageCircle, Settings, Square, Star, Users, Volume2, type LucideIcon } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { $toasts } from '../../lib/feedback';
import {
  $child,
  $childId,
  $exhibition,
  $session,
  applySettings,
  go,
  repoFor,
  settingsOf,
  signOutEverywhere,
  startSession,
} from '../../lib/session';
import { configureSpeech, readableElements, readElements, speechSupported, stopSpeaking, $speaking } from '../../lib/speech';
import { LocalRepo } from '../../lib/repo/local';
import { Sheet, Spinner } from '../ui/core';
import { cx, type Section } from '../ui/tone';

const NAV: { section: Section; href: string; label: string; icon: LucideIcon }[] = [
  { section: 'home', href: '/home', label: 'Home', icon: House },
  { section: 'wellbeing', href: '/wellbeing', label: 'Feelings', icon: Heart },
  { section: 'support', href: '/support', label: 'Support', icon: Accessibility },
  { section: 'talk', href: '/talk', label: 'Talk', icon: MessageCircle },
  { section: 'progress', href: '/progress', label: 'Progress', icon: Star },
];

interface ShellProps {
  section: Section;
  children: ReactNode;
  /** Profiles page doesn't need an active child. */
  requireChild?: boolean;
  wide?: boolean;
}

/** Wraps every signed-in page: auth guard, active child, settings, nav, read-aloud. */
export function Shell({ section, children, requireChild = true, wide }: ShellProps) {
  const session = useStore($session);
  const child = useStore($child);
  const childId = useStore($childId);
  const [ready, setReady] = useState(false);

  useEffect(() => startSession(), []);

  useEffect(() => {
    if (session.status === 'loading') return;
    if (session.status === 'signed-out') {
      go('/');
      return;
    }
    if (!requireChild) {
      setReady(true);
      return;
    }
    if (!childId) {
      go('/profiles');
      return;
    }
    if (child?.id === childId) {
      setReady(true);
      return;
    }
    let cancelled = false;
    void repoFor(session)
      .then((repo) => repo.getChild(childId))
      .then((c) => {
        if (cancelled) return;
        if (!c) {
          $childId.set('');
          go('/profiles');
          return;
        }
        $child.set(c);
        setReady(true);
      })
      .catch(() => !cancelled && go('/profiles'));
    return () => {
      cancelled = true;
    };
  }, [session, childId, requireChild, child?.id]);

  const settings = settingsOf(child);
  useEffect(() => {
    if (!child) return;
    applySettings(settings);
    configureSpeech({ rate: settings.rate, voiceURI: settings.voiceURI });
  }, [child?.id, JSON.stringify(settings)]);

  useEffect(() => () => stopSpeaking(), []);

  return (
    <MotionConfig reducedMotion={settings.calmMode ? 'always' : 'user'}>
      <div className="min-h-dvh pb-28 md:pb-10">
        <TopBar section={section} showNav={requireChild} />
        <main id="main" className={cx('mx-auto px-4 pt-4 sm:pt-8', wide ? 'max-w-6xl' : 'max-w-4xl')}>
          {ready ? children : <Spinner />}
        </main>
        <p className="mx-auto mt-12 max-w-4xl px-4 text-center text-sm text-ink-soft">
          If you ever feel unsafe, tell a trusted adult straight away.
        </p>
        {requireChild && <BottomNav section={section} />}
        <Toaster />
        <ExhibitionGuard />
      </div>
    </MotionConfig>
  );
}

function TopBar({ section, showNav }: { section: Section; showNav: boolean }) {
  const child = useStore($child);
  const session = useStore($session);
  const [menu, setMenu] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/80 backdrop-blur-lg">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded-xl focus:bg-surface focus:p-3">
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <a href={showNav ? '/home' : '/profiles'} className="flex items-center gap-2 rounded-xl font-display text-xl font-bold">
          <img src="/favicon.svg" alt="" className="size-9" />
          <span className="hidden sm:inline">MindMate</span>
        </a>
        {showNav && (
          <nav aria-label="Main" className="ml-4 hidden flex-1 items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a
                key={n.section}
                href={n.href}
                aria-current={section === n.section ? 'page' : undefined}
                className={cx(
                  'flex min-h-11 items-center gap-1.5 rounded-xl px-3 font-semibold transition',
                  section === n.section ? 'bg-violet-soft text-violet-ink' : 'text-ink-soft hover:bg-bg-2 hover:text-ink',
                )}
              >
                <n.icon aria-hidden="true" className="size-4.5" strokeWidth={2.25} />
                {n.label}
              </a>
            ))}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2">
          <ReadScreenButton />
          {child && showNav && (
            <button
              type="button"
              onClick={() => setMenu(true)}
              className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 shadow-sm"
              aria-label={`${child.name}'s menu`}
            >
              <span className="grid size-9 place-items-center rounded-full bg-violet-soft text-2xl" aria-hidden="true">
                {child.avatar}
              </span>
              <span className="max-w-24 truncate font-semibold">{child.name}</span>
            </button>
          )}
        </div>
      </div>
      <Sheet open={menu} onClose={() => setMenu(false)} title={child ? `Hi, ${child.name}!` : 'Menu'}>
        <div className="grid gap-2">
          {[
            { href: '/settings', icon: Settings, label: 'My settings', hint: 'Read aloud, text size, calm mode' },
            { href: '/profiles', icon: Users, label: 'Switch profile', hint: 'Choose who is using MindMate' },
            { href: '/grown-ups', icon: Lock, label: 'Grown-ups', hint: 'Profiles, account and data' },
          ].map((i) => (
            <a key={i.href} href={i.href} className="flex min-h-16 items-center gap-4 rounded-2xl bg-bg-2 p-3 hover:bg-violet-soft">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface text-violet" aria-hidden="true">
                <i.icon className="size-5" strokeWidth={2.25} />
              </span>
              <span>
                <span className="block font-semibold">{i.label}</span>
                <span className="block text-sm text-ink-soft">{i.hint}</span>
              </span>
            </a>
          ))}
          <button
            type="button"
            onClick={() => void signOutEverywhere().then(() => go('/'))}
            className="mt-2 flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-line font-semibold"
          >
            <LogOut aria-hidden="true" className="size-5" />
            {session.status === 'guest' ? 'Leave guest mode' : 'Sign out'}
          </button>
        </div>
      </Sheet>
    </header>
  );
}

function BottomNav({ section }: { section: Section }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-3 bottom-3 z-30 rounded-3xl border border-line bg-surface/95 shadow-pop backdrop-blur-lg md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {NAV.map((n) => {
          const active = section === n.section;
          return (
            <li key={n.section}>
              <a
                href={n.href}
                aria-current={active ? 'page' : undefined}
                className={cx('relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-bold', active ? 'text-violet-ink' : 'text-ink-soft')}
              >
                {active && (
                  <motion.span layoutId="nav-pill" className="absolute inset-1.5 rounded-2xl bg-violet-soft" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <n.icon aria-hidden="true" className={cx('relative size-6 transition-transform', active && 'scale-110')} strokeWidth={active ? 2.5 : 2} />
                <span className="relative">{n.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Reads everything on the page in order, highlighting each part as it goes. */
function ReadScreenButton() {
  const speaking = useStore($speaking) === 'screen';
  const child = useStore($child);
  if (!speechSupported() || !settingsOf(child).tts) return null;

  const read = () => {
    if (speaking) return stopSpeaking();
    const main = document.getElementById('main');
    if (main) void readElements(readableElements(main), 'screen');
  };

  return (
    <button
      type="button"
      onClick={read}
      aria-pressed={speaking}
      className={cx(
        'flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold shadow-sm transition',
        speaking ? 'bg-violet text-white' : 'border border-line bg-surface',
      )}
    >
      {speaking ? <Square aria-hidden="true" className="size-4 fill-current" /> : <Volume2 aria-hidden="true" className="size-5 text-violet" strokeWidth={2.25} />}
      <span className="hidden sm:inline">{speaking ? 'Stop' : 'Read page'}</span>
      <span className="sr-only sm:hidden">{speaking ? 'Stop reading' : 'Read this page aloud'}</span>
    </button>
  );
}

function Toaster() {
  const toasts = useStore($toasts);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className={cx(
              'pointer-events-auto flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold shadow-pop',
              t.tone === 'error' ? 'bg-coral text-white' : 'bg-ink text-bg',
            )}
          >
            {t.tone === 'error' ? <CircleAlert aria-hidden="true" className="size-5" /> : <CircleCheck aria-hidden="true" className="size-5" />}
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

const IDLE_MS = 120_000;
const COUNTDOWN = 15;

/** In exhibition mode, a guest session resets itself after 2 minutes idle. */
function ExhibitionGuard() {
  const session = useStore($session);
  const exhibition = useStore($exhibition) === '1';
  const active = exhibition && session.status === 'guest';
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let idleTimer: number;
    const reset = () => {
      if (left !== null) return;
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => setLeft(COUNTDOWN), IDLE_MS);
    };
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      window.clearTimeout(idleTimer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [active, left]);

  useEffect(() => {
    if (left === null) return;
    if (left <= 0) {
      void LocalRepo.clearAll().then(() => {
        $childId.set('');
        go('/profiles');
      });
      return;
    }
    const t = window.setTimeout(() => setLeft(left - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);

  if (left === null) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" role="alertdialog" aria-label="Are you still there?">
      <div className="card max-w-sm p-8 text-center">
        <Hand aria-hidden="true" className="mx-auto size-14 text-violet" strokeWidth={1.75} />
        <h2 className="mt-3 text-2xl font-bold">Are you still there?</h2>
        <p className="mt-2 text-ink-soft">MindMate will start fresh for the next visitor in {left} seconds.</p>
        <button type="button" onClick={() => setLeft(null)} className="btn mt-6 min-h-14 w-full rounded-2xl bg-violet font-display text-lg font-semibold text-white">
          I’m still here!
        </button>
      </div>
    </div>
  );
}
