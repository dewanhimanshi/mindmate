import { Accessibility, CircleHelp, Heart, MessageCircle, Plus, Star } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { motion } from 'motion/react';
import { Mindy } from '../components/Mindy';
import { Shell } from '../components/shell/Shell';
import { SpeakButton } from '../components/ui/SpeakButton';
import { feelingById } from '../data/feelings';
import { useChildQuery } from '../lib/hooks';
import { startOfDay } from '../lib/insights';
import { $child } from '../lib/session';

const quickFeelings = ['happy', 'calm', 'okay', 'tired', 'worried', 'sad', 'angry'];

const sections = [
  { href: '/wellbeing', icon: Heart, title: 'Health & Well-being', text: 'How am I feeling? What do I need?', grad: 'var(--grad-wellbeing)' },
  { href: '/support', icon: Accessibility, title: 'Everyday Support', text: 'What is difficult for me? Strategies, exercise, food.', grad: 'var(--grad-support)' },
  { href: '/talk', icon: MessageCircle, title: 'I Want to Talk', text: 'Who can I talk to, and what can I say?', grad: 'var(--grad-talk)' },
  { href: '/progress', icon: Star, title: 'My Progress', text: 'My week, small wins and what helps me.', grad: 'var(--grad-progress)' },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function HomePage() {
  return (
    <Shell section="home">
      <Home />
    </Shell>
  );
}

function Home() {
  const child = useStore($child)!;
  const { data: today } = useChildQuery((repo, id) => repo.listCheckins(id, startOfDay(Date.now())));
  const last = today?.find((c) => c.feeling);
  const lastFeeling = last?.feeling ? feelingById(last.feeling) : undefined;

  return (
    <div className="grid gap-8">
      <section className="relative overflow-hidden rounded-[2rem] p-6 sm:p-8" style={{ background: 'var(--grad-hero)' }}>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <Mindy size={120} mood={lastFeeling ? 'cheer' : 'happy'} />
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-3xl font-bold sm:text-4xl">
                {greeting()}, {child.name}!
              </h1>
            </div>
            <p className="mt-1 text-xl text-ink-soft">
              {lastFeeling ? `Today you felt ${lastFeeling.label.toLowerCase()}. Thanks for checking in!` : 'What support do you need today?'}
            </p>
          </div>
        </div>

        <div className="mt-6" data-speak-scope>
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h2 className="font-display text-lg font-semibold">How are you feeling right now?</h2>
            <SpeakButton text="How are you feeling right now?" size="sm" scope />
          </div>
          <ul className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            {quickFeelings.map((id, i) => {
              const f = feelingById(id)!;
              return (
                <motion.li key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <a
                    href={`/wellbeing/check-in?feeling=${id}`}
                    data-read
                    className="flex min-h-20 w-20 flex-col items-center justify-center gap-1 rounded-2xl bg-surface p-2 shadow-card transition hover:-translate-y-1 hover:shadow-pop"
                  >
                    <span className="text-3xl" aria-hidden="true">{f.emoji}</span>
                    <span className="text-xs font-bold">{f.label}</span>
                  </a>
                </motion.li>
              );
            })}
            <li>
              <a
                href="/wellbeing/check-in"
                className="flex min-h-20 w-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-ink-soft/30 p-2 text-ink-soft"
              >
                <Plus aria-hidden="true" className="size-7" />
                <span className="text-xs font-bold">More</span>
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section aria-label="Sections">
        <ul className="grid gap-4 sm:grid-cols-2">
          {sections.map((s, i) => (
            <motion.li key={s.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 220, damping: 20 }}>
              <a href={s.href} data-read className="group relative flex h-full items-center gap-4 overflow-hidden rounded-[1.75rem] p-5 text-white shadow-card transition hover:-translate-y-1 hover:shadow-pop" style={{ background: s.grad }}>
                <span className="grid size-18 shrink-0 place-items-center rounded-3xl bg-white/25 backdrop-blur transition group-hover:scale-110 group-hover:rotate-6" aria-hidden="true">
                  <s.icon className="size-9" strokeWidth={2} />
                </span>
                <span>
                  <span className="block font-display text-2xl font-bold drop-shadow-sm">{s.title}</span>
                  <span className="block font-semibold text-white/90">{s.text}</span>
                </span>
                <span className="absolute -bottom-6 -right-6 size-24 rounded-full bg-white/15" aria-hidden="true" />
              </a>
            </motion.li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <a href="/wellbeing/not-sure" data-read className="card flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-pop">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-lilac-soft text-lilac-ink" aria-hidden="true">
            <CircleHelp className="size-7" />
          </span>
          <span>
            <span className="block font-display text-lg font-semibold">I’m not sure what I need</span>
            <span className="block text-ink-soft">That’s okay. Let’s figure it out together.</span>
          </span>
        </a>
        <a href="/progress#wins" data-read className="card flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-pop">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sun-soft text-sun-ink" aria-hidden="true">
            <Star className="size-7" />
          </span>
          <span>
            <span className="block font-display text-lg font-semibold">Add a small win</span>
            <span className="block text-ink-soft">Every small step counts.</span>
          </span>
        </a>
      </section>
    </div>
  );
}
