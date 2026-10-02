import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type { Child, Repo, Settings } from './model';
import { defaultSettings } from './model';
import { LocalRepo } from './repo/local';

export type Session =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'guest' }
  | { status: 'user'; uid: string; email: string; name: string };

export const $session = atom<Session>({ status: 'loading' });

/** The child profile currently using the app (id persisted per browser). */
export const $childId = persistentAtom<string>('mm:child', '');
export const $child = atom<Child | null>(null);

/** Exhibition mode: guest data auto-resets after inactivity. */
export const $exhibition = persistentAtom<'0' | '1'>('mm:exhibition', '0');

let started = false;

export function startSession() {
  if (started || typeof window === 'undefined') return;
  started = true;
  if (localStorage.getItem('mm:guest') === '1') {
    $session.set({ status: 'guest' });
    return;
  }
  void import('./firebase').then(async ({ firebaseAuth }) => {
    const { onAuthStateChanged } = await import('firebase/auth');
    onAuthStateChanged(firebaseAuth(), (u) => {
      if (localStorage.getItem('mm:guest') === '1') return;
      $session.set(
        u
          ? { status: 'user', uid: u.uid, email: u.email ?? '', name: u.displayName ?? '' }
          : { status: 'signed-out' },
      );
    });
  });
}

export function startGuest() {
  localStorage.setItem('mm:guest', '1');
  $session.set({ status: 'guest' });
}

export async function signOutEverywhere() {
  $childId.set('');
  $child.set(null);
  if (localStorage.getItem('mm:guest') === '1') {
    localStorage.removeItem('mm:guest');
  } else {
    const [{ firebaseAuth }, { signOut }] = await Promise.all([import('./firebase'), import('firebase/auth')]);
    await signOut(firebaseAuth());
  }
  $session.set({ status: 'signed-out' });
}

const repos = new Map<string, Repo>();

export async function repoFor(session: Session): Promise<Repo> {
  if (session.status === 'guest') {
    if (!repos.has('guest')) repos.set('guest', new LocalRepo());
    return repos.get('guest')!;
  }
  if (session.status !== 'user') throw new Error('Not signed in');
  if (!repos.has(session.uid)) {
    const { FirestoreRepo } = await import('./repo/firestore');
    repos.set(session.uid, new FirestoreRepo(session.uid));
  }
  return repos.get(session.uid)!;
}

/** Current repo; throws if there is no session yet. */
export function currentRepo(): Promise<Repo> {
  return repoFor($session.get());
}

/* ---------- Accessibility settings ---------- */

export function settingsOf(child: Child | null): Settings {
  return { ...defaultSettings, ...(child?.settings ?? {}) };
}

/** Apply settings to <html> and remember them for the pre-paint script in BaseLayout. */
export function applySettings(s: Settings) {
  const d = document.documentElement;
  d.dataset.text = s.textSize;
  if (s.contrast === 'high') d.dataset.contrast = 'high';
  else delete d.dataset.contrast;
  if (s.theme === 'system') delete d.dataset.theme;
  else d.dataset.theme = s.theme;
  if (s.calmMode) d.dataset.calm = 'on';
  else delete d.dataset.calm;
  try {
    localStorage.setItem('mm:settings', JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}

export async function updateChildSettings(patch: Partial<Settings>) {
  const child = $child.get();
  if (!child) return;
  const settings = { ...settingsOf(child), ...patch };
  $child.set({ ...child, settings });
  applySettings(settings);
  const repo = await currentRepo();
  await repo.updateChild(child.id, { settings });
}

export async function updateChild(patch: Partial<Omit<Child, 'id'>>) {
  const child = $child.get();
  if (!child) return;
  $child.set({ ...child, ...patch });
  const repo = await currentRepo();
  await repo.updateChild(child.id, patch);
}

export function go(path: string) {
  window.location.assign(path);
}
