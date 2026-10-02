import type { Tone } from '../../data/types';

/** Literal class names per tone so Tailwind can see them at build time. */
export const tones: Record<Tone, { soft: string; solid: string; ink: string; text: string; border: string; ring: string }> = {
  violet: { soft: 'bg-violet-soft', solid: 'bg-violet', ink: 'text-violet-ink', text: 'text-violet', border: 'border-violet', ring: 'ring-violet' },
  coral: { soft: 'bg-coral-soft', solid: 'bg-coral', ink: 'text-coral-ink', text: 'text-coral', border: 'border-coral', ring: 'ring-coral' },
  teal: { soft: 'bg-teal-soft', solid: 'bg-teal', ink: 'text-teal-ink', text: 'text-teal', border: 'border-teal', ring: 'ring-teal' },
  sun: { soft: 'bg-sun-soft', solid: 'bg-sun', ink: 'text-sun-ink', text: 'text-sun-ink', border: 'border-sun', ring: 'ring-sun' },
  rose: { soft: 'bg-rose-soft', solid: 'bg-rose', ink: 'text-rose-ink', text: 'text-rose', border: 'border-rose', ring: 'ring-rose' },
  sky: { soft: 'bg-sky-soft', solid: 'bg-sky', ink: 'text-sky-ink', text: 'text-sky', border: 'border-sky', ring: 'ring-sky' },
  mint: { soft: 'bg-mint-soft', solid: 'bg-mint', ink: 'text-mint-ink', text: 'text-mint-ink', border: 'border-mint', ring: 'ring-mint' },
  peach: { soft: 'bg-peach-soft', solid: 'bg-peach', ink: 'text-peach-ink', text: 'text-peach-ink', border: 'border-peach', ring: 'ring-peach' },
  lilac: { soft: 'bg-lilac-soft', solid: 'bg-lilac', ink: 'text-lilac-ink', text: 'text-lilac', border: 'border-lilac', ring: 'ring-lilac' },
  lime: { soft: 'bg-lime-soft', solid: 'bg-lime', ink: 'text-lime-ink', text: 'text-lime-ink', border: 'border-lime', ring: 'ring-lime' },
};

export type Section = 'home' | 'wellbeing' | 'support' | 'talk' | 'progress' | 'settings';

export const sectionGradient: Record<Section, string> = {
  home: 'var(--grad-wellbeing)',
  wellbeing: 'var(--grad-wellbeing)',
  support: 'var(--grad-support)',
  talk: 'var(--grad-talk)',
  progress: 'var(--grad-progress)',
  settings: 'var(--grad-support)',
};

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');
