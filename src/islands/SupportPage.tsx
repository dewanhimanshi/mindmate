import { Accessibility, Apple, ArrowRight, BookOpen, Dumbbell, Leaf, Puzzle, Star, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Shell } from '../components/shell/Shell';
import { PageHeader } from '../components/ui/core';
import { cx, tones } from '../components/ui/tone';
import type { Tone } from '../data/types';

const tiles: { href: string; icon: LucideIcon; title: string; text: string; tone: Tone }[] = [
  { href: '/support/academics', icon: BookOpen, title: 'Academics', text: 'Learning and classroom strategies', tone: 'violet' },
  { href: '/support/difficulty', icon: Puzzle, title: 'My Difficulty', text: 'Choose a difficulty and get ideas', tone: 'teal' },
  { href: '/support/exercise', icon: Dumbbell, title: 'Exercise', text: 'Simple movement and fitness activities', tone: 'coral' },
  { href: '/support/food', icon: Apple, title: 'Food', text: 'Healthy meal and snack ideas', tone: 'lime' },
  { href: '/support/calm', icon: Leaf, title: 'Calm & Sensory', text: 'Calming tools and sensory breaks', tone: 'sky' },
  { href: '/progress#support', icon: Star, title: 'My Progress', text: 'Things I tried and achieved', tone: 'sun' },
];

export default function SupportPage() {
  return (
    <Shell section="support">
      <PageHeader icon={Accessibility} title="Everyday Support" subtitle="What support do you need today? Pick one thing at a time." section="support" />

      <motion.a
        href="/support/difficulty"
        data-read
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="group mb-8 flex flex-col items-center gap-4 overflow-hidden rounded-[2rem] p-6 text-center text-white shadow-pop transition hover:-translate-y-1 sm:flex-row sm:p-8 sm:text-left"
        style={{ background: 'var(--grad-support)' }}
      >
        <span className="grid size-24 shrink-0 place-items-center rounded-3xl bg-white/25 transition group-hover:rotate-6 group-hover:scale-110" aria-hidden="true">
          <Puzzle className="size-12" strokeWidth={1.75} />
        </span>
        <span className="flex-1">
          <span className="block font-display text-3xl font-bold">What is difficult for me?</span>
          <span className="mt-1 block text-lg font-semibold text-white/90">Tell me your difficulty → get strategies → try an activity → see your progress.</span>
        </span>
        <span className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-display text-lg font-bold text-[#0b4f4f] shadow-card">
          Start <ArrowRight aria-hidden="true" className="size-5" />
        </span>
      </motion.a>

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {tiles.map((t, i) => (
          <motion.li key={t.href} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 220, damping: 18 }}>
            <a href={t.href} data-read className="card group flex h-full flex-col items-center gap-3 p-5 text-center transition hover:-translate-y-1 hover:shadow-pop">
              <span className={cx('grid size-20 place-items-center rounded-3xl transition group-hover:scale-110 group-hover:-rotate-6', tones[t.tone].soft, tones[t.tone].ink)} aria-hidden="true">
                <t.icon className="size-10" strokeWidth={1.75} />
              </span>
              <span className="font-display text-xl font-bold">{t.title}</span>
              <span className="text-sm text-ink-soft">{t.text}</span>
            </a>
          </motion.li>
        ))}
      </ul>
    </Shell>
  );
}
