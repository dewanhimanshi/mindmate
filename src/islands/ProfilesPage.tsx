import { Plus } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Mindy } from '../components/Mindy';
import { ProfileEditor } from '../components/ProfileEditor';
import { Shell } from '../components/shell/Shell';
import { Sheet, Spinner } from '../components/ui/core';
import { cx, tones } from '../components/ui/tone';
import type { Tone } from '../data/types';
import type { Child } from '../lib/model';
import { $child, $childId, $session, applySettings, go, repoFor, settingsOf } from '../lib/session';

export default function ProfilesPage() {
  return (
    <Shell section="home" requireChild={false}>
      <Profiles />
    </Shell>
  );
}

function Profiles() {
  const session = useStore($session);
  const [children, setChildren] = useState<Child[] | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    void repoFor(session)
      .then((r) => r.listChildren())
      .then((list) => {
        setChildren(list);
        if (list.length === 0) setAdding(true);
      })
      .catch(() => setChildren([]));
  }, [session]);

  const choose = (c: Child) => {
    $child.set(c);
    $childId.set(c.id);
    applySettings(settingsOf(c));
    go('/home');
  };

  if (!children) return <Spinner />;
  return (
    <div className="py-4 text-center">
      <div className="flex justify-center">
        <Mindy size={110} mood="happy" />
      </div>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Who’s using MindMate?</h1>
      <p className="mt-1 text-lg text-ink-soft">{session.status === 'guest' ? 'Guest mode: profiles stay on this device.' : 'Tap your picture to start.'}</p>

      <ul className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
        {children.map((c, i) => (
          <motion.li key={c.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06, type: 'spring' }}>
            <button
              type="button"
              onClick={() => choose(c)}
              className="card group flex w-full flex-col items-center gap-3 p-5 transition hover:-translate-y-1 hover:shadow-pop"
            >
              <span
                className={cx('grid size-24 place-items-center rounded-full text-6xl transition group-hover:scale-110 group-hover:animate-wiggle', tones[c.color as Tone]?.soft ?? 'bg-violet-soft')}
                aria-hidden="true"
              >
                {c.avatar}
              </span>
              <span className="font-display text-xl font-semibold">{c.name}</span>
            </button>
          </motion.li>
        ))}
        <motion.li initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: children.length * 0.06 }}>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex h-full min-h-44 w-full flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed border-line p-5 text-ink-soft transition hover:border-violet hover:text-violet"
          >
            <span className="grid size-16 place-items-center rounded-full bg-bg-2" aria-hidden="true">
              <Plus className="size-8" />
            </span>
            <span className="font-display text-lg font-semibold">Add profile</span>
          </button>
        </motion.li>
      </ul>

      <Sheet open={adding} onClose={() => setAdding(false)} title="New profile">
        <ProfileEditor onSaved={choose} />
      </Sheet>
    </div>
  );
}
