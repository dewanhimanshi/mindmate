import { atom } from 'nanostores';
import { $child, settingsOf } from './session';

/* ---------- Toasts ---------- */

export interface Toast {
  id: number;
  text: string;
  tone: 'ok' | 'error';
}

export const $toasts = atom<Toast[]>([]);
let nextId = 1;

export function toast(text: string, tone: Toast['tone'] = 'ok') {
  const t = { id: nextId++, text, tone };
  $toasts.set([...$toasts.get(), t]);
  setTimeout(() => $toasts.set($toasts.get().filter((x) => x.id !== t.id)), 3500);
}

/* ---------- Celebrate (confetti + chime), respecting calm mode ---------- */

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function isCalm() {
  return settingsOf($child.get()).calmMode || reducedMotion();
}

export async function celebrate() {
  const s = settingsOf($child.get());
  if (s.sounds) chime();
  if (s.calmMode || reducedMotion()) return;
  const confetti = (await import('canvas-confetti')).default;
  const colors = ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#38bdf8'];
  confetti({ particleCount: 90, spread: 75, origin: { y: 0.7 }, colors, scalar: 1.1, disableForReducedMotion: true });
}

let audio: AudioContext | undefined;

/** A soft two-note chime, synthesised so there are no audio files to load. */
export function chime() {
  try {
    audio ??= new AudioContext();
    const now = audio.currentTime;
    [523.25, 783.99].forEach((freq, i) => {
      const osc = audio!.createOscillator();
      const gain = audio!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.6);
      osc.connect(gain).connect(audio!.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.65);
    });
  } catch {
    /* audio unavailable */
  }
}

export function tapSound() {
  if (settingsOf($child.get()).sounds) chime();
}
