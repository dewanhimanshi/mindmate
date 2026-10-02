import { Accessibility, Eye, Heart, LogIn, MessageCircle, Star, UserPlus } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { Mindy } from '../components/Mindy';
import { Button } from '../components/ui/core';
import { $childId, $session, go, startGuest, startSession } from '../lib/session';

const sections = [
  { icon: Heart, title: 'Health & Well-being', text: 'Notice how you feel and find something that helps.', grad: 'var(--grad-wellbeing)' },
  { icon: Accessibility, title: 'Everyday Support', text: 'Strategies for school, movement, food and staying calm.', grad: 'var(--grad-support)' },
  { icon: MessageCircle, title: 'I Want to Talk', text: 'Find the right person and the right words.', grad: 'var(--grad-talk)' },
  { icon: Star, title: 'My Progress', text: 'Your week, your small wins and what helps you.', grad: 'var(--grad-progress)' },
];

export default function WelcomePage() {
  const session = useStore($session);

  useEffect(() => startSession(), []);
  useEffect(() => {
    if (session.status === 'user' || session.status === 'guest') go($childId.get() ? '/home' : '/profiles');
  }, [session.status]);

  return (
    <main className="min-h-dvh overflow-hidden" style={{ background: 'var(--grad-hero)' }}>
      <Blobs />
      <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-10 sm:pt-16">
        <div className="flex flex-col items-center text-center">
          <Mindy size={140} mood="happy" />
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-4xl font-bold sm:text-6xl"
          >
            Welcome to{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--grad-wellbeing)' }}>
              MindMate
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-3 text-xl text-ink-soft sm:text-2xl">
            What support do you need today?
          </motion.p>
          <p className="mt-1 text-ink-soft">Take your time. There are no wrong choices here.</p>

          <div className="mt-8 grid w-full max-w-md gap-3">
            <Button variant="gradient" size="lg" href="/signup" icon={UserPlus} block>
              Create a family account
            </Button>
            <Button variant="outline" size="lg" href="/login" icon={LogIn} block>
              Log in
            </Button>
            <Button
              variant="soft"
              tone="teal"
              size="lg"
              icon={Eye}
              block
              onClick={() => {
                startGuest();
                go('/profiles');
              }}
            >
              Try without an account
            </Button>
            <p className="text-sm text-ink-soft">Guest mode keeps everything on this device only.</p>
          </div>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {sections.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
              className="card flex items-center gap-4 p-5"
            >
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl text-white" style={{ background: s.grad }} aria-hidden="true">
                <s.icon className="size-8" strokeWidth={2} />
              </span>
              <span>
                <span className="block font-display text-xl font-semibold">{s.title}</span>
                <span className="block text-ink-soft">{s.text}</span>
              </span>
            </motion.li>
          ))}
        </ul>
        <p className="mt-10 text-center text-sm text-ink-soft">
          MindMate is a self-help tool, not an emergency service. If you feel unsafe, tell a trusted adult straight away.
        </p>
      </div>
    </main>
  );
}

function Blobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-20 top-10 size-72 rounded-full opacity-40 blur-3xl animate-float" style={{ background: 'var(--grad-wellbeing)' }} />
      <div className="absolute -right-16 top-64 size-64 rounded-full opacity-30 blur-3xl animate-float" style={{ background: 'var(--grad-support)', animationDelay: '-2s' }} />
      <div className="absolute bottom-0 left-1/3 size-72 rounded-full opacity-30 blur-3xl animate-float" style={{ background: 'var(--grad-progress)', animationDelay: '-4s' }} />
    </div>
  );
}
