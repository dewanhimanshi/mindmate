import EasySpeech from 'easy-speech';
import { atom } from 'nanostores';

/** Id of whatever is being read aloud right now (null when silent). */
export const $speaking = atom<string | null>(null);

let ready: Promise<boolean> | null = null;
let options: { rate: number; voiceURI?: string } = { rate: 0.95 };
let token = 0;

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function init() {
  ready ??= EasySpeech.init({ maxTimeout: 5000, interval: 250, quiet: true }).catch(() => false);
  return ready;
}

export function configureSpeech(o: { rate?: number; voiceURI?: string }) {
  options = { ...options, ...o };
}

export async function listVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!speechSupported()) return [];
  await init();
  try {
    return EasySpeech.voices().filter((v) => v.lang.toLowerCase().startsWith('en'));
  } catch {
    return [];
  }
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  let voices: SpeechSynthesisVoice[] = [];
  try {
    voices = EasySpeech.voices();
  } catch {
    return undefined;
  }
  if (options.voiceURI) {
    const chosen = voices.find((v) => v.voiceURI === options.voiceURI);
    if (chosen) return chosen;
  }
  const byLang = (lang: string) => voices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith(lang));
  return byLang('en-in') ?? byLang('en-gb') ?? byLang('en-us') ?? byLang('en');
}

/** Emoji would be read out by name ("smiling face"), so strip them. */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}|\u200d|\ufe0f|\u20e3/gu, '')
    // A line break between a label and its hint should sound like a pause, not run on.
    .replace(/([^\s.!?…:,;])[ \t]*\n+\s*/g, '$1. ')
    .replace(/_{2,}/g, ' blank ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Chrome cuts off long utterances, so speak sentence by sentence. */
export function splitSentences(text: string): string[] {
  return cleanForSpeech(text)
    .split(/(?<=[.!?…:])\s+/)
    .flatMap((s) => (s.length > 220 ? s.split(/(?<=[,;])\s+/) : [s]))
    .map((s) => s.trim())
    .filter(Boolean);
}

export function stopSpeaking() {
  token++;
  try {
    EasySpeech.cancel();
  } catch {
    if (speechSupported()) window.speechSynthesis.cancel();
  }
  $speaking.set(null);
}

/**
 * Read a list of segments in order. `onSegment` fires as each one starts
 * (used to highlight the element being read). Resolves when done or stopped.
 */
export async function speakSegments(segments: string[], id: string, onSegment?: (index: number) => void): Promise<void> {
  if (!speechSupported()) return;
  stopSpeaking();
  const mine = ++token;
  $speaking.set(id);
  await init();
  const voice = pickVoice();
  for (let i = 0; i < segments.length; i++) {
    for (const sentence of splitSentences(segments[i])) {
      if (token !== mine) return;
      onSegment?.(i);
      try {
        await EasySpeech.speak({ text: sentence, voice, rate: options.rate, pitch: 1.05, volume: 1 });
      } catch {
        // Interrupted by stopSpeaking() or an engine error: stop quietly.
        if (token !== mine) return;
      }
    }
  }
  if (token === mine) {
    onSegment?.(-1);
    $speaking.set(null);
  }
}

export function speak(text: string, id: string = text) {
  return speakSegments([text], id);
}

/* ---------- Reading parts of the page ---------- */

const READABLE = 'h1, h2, h3, h4, p, li, label, dt, dd, [data-read]';

/** Visible readable elements inside `root`, outermost only, in document order. */
export function readableElements(root: HTMLElement): HTMLElement[] {
  const candidates = [...root.querySelectorAll<HTMLElement>(READABLE)].filter(
    (el) => el.offsetParent !== null && !el.closest('[data-noread]') && el.innerText.trim(),
  );
  return candidates.filter((el) => !candidates.some((other) => other !== el && other.contains(el)));
}

/** Read elements aloud in order, highlighting (and scrolling to) each one as it is spoken. */
export function readElements(elements: HTMLElement[], id: string, scroll = true): Promise<void> {
  let current: HTMLElement | undefined;
  return speakSegments(
    elements.map((el) => el.innerText),
    id,
    (i) => {
      current?.classList.remove('tts-active');
      current = elements[i];
      if (current) {
        current.classList.add('tts-active');
        if (scroll) current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    },
  ).finally(() => current?.classList.remove('tts-active'));
}

/** The block a section-level speak button belongs to. */
export const SPEAK_SCOPE = '[data-speak-scope], section, article, .card';
