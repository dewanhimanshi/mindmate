import { ArrowRight, Brain, ChevronDown, CircleHelp, Heart, MessageCircle, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Mindy } from '../components/Mindy';
import { Shell } from '../components/shell/Shell';
import { PageHeader, SectionTitle } from '../components/ui/core';
import { cx, tones } from '../components/ui/tone';
import { ActivityCard } from '../components/wellbeing';
import { needs } from '../data/needs';

export default function WellbeingPage() {
  return (
    <Shell section="wellbeing">
      <Wellbeing />
    </Shell>
  );
}

function Wellbeing() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="grid gap-10">
      <PageHeader icon={Heart} title="Health & Well-being" subtitle="Go step by step, or jump to any tool. You’re in charge here." section="wellbeing" />

      <motion.a
        href="/wellbeing/check-in"
        data-read
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative flex flex-col items-center gap-4 overflow-hidden rounded-[2rem] p-6 text-center text-white shadow-pop transition hover:-translate-y-1 sm:flex-row sm:p-8 sm:text-left"
        style={{ background: 'var(--grad-wellbeing)' }}
      >
        <Mindy size={110} mood="happy" />
        <span className="flex-1">
          <span className="block font-display text-3xl font-bold">How am I feeling?</span>
          <span className="mt-1 block text-lg font-semibold text-white/90">Check in: name your feeling, choose what you need, and try something that helps.</span>
        </span>
        <span className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-display text-lg font-bold text-[#4c1d95] shadow-card transition group-hover:scale-105">
          Start <ArrowRight aria-hidden="true" className="size-5" />
        </span>
      </motion.a>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { href: '/wellbeing/not-sure', icon: CircleHelp, title: 'I’m not sure what I need', text: 'Answer two quick questions and get one small idea.', tone: 'lilac' as const },
          { href: '/wellbeing/understand', icon: Brain, title: 'Understand my feelings', text: 'Feeling → What caused it? → What do I need?', tone: 'sky' as const },
          { href: '/talk', icon: MessageCircle, title: 'I want to talk', text: 'Find a trusted person and the words to start.', tone: 'coral' as const },
          { href: '/progress', icon: Star, title: 'My progress', text: 'See your week and what helps you.', tone: 'sun' as const },
        ].map((c, i) => (
          <motion.a
            key={c.href}
            href={c.href}
            data-read
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="card flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-pop"
          >
            <span className={cx('grid size-14 shrink-0 place-items-center rounded-2xl', tones[c.tone].soft, tones[c.tone].ink)} aria-hidden="true">
              <c.icon className="size-7" strokeWidth={2} />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold">{c.title}</span>
              <span className="block text-ink-soft">{c.text}</span>
            </span>
          </motion.a>
        ))}
      </div>

      <section>
        <SectionTitle title="Help me feel better" subtitle="All activities, grouped by what you need." />
        <ul className="grid gap-3">
          {needs
            .filter((n) => n.activityIds.length)
            .map((n) => {
              const isOpen = open === n.id;
              return (
                <li key={n.id} className="card overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : n.id)}
                    className="flex min-h-16 w-full items-center gap-4 p-4 text-left"
                  >
                    <span className={cx('grid size-12 shrink-0 place-items-center rounded-2xl text-2xl', tones[n.tone].soft)} aria-hidden="true">
                      {n.emoji}
                    </span>
                    <span className="flex-1 font-display text-lg font-semibold">{n.label}</span>
                    <span className={cx('text-2xl text-ink-soft transition-transform', isOpen && 'rotate-180')} aria-hidden="true">
                      <ChevronDown className="size-6" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="grid gap-3 border-t border-line bg-bg-2 p-4">
                      {n.activityIds.map((id, i) => (
                        <ActivityCard key={id} id={id} index={i} href={`/activity/${id}?from=/wellbeing`} />
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      </section>
    </div>
  );
}
