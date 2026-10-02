import { Apple, Info, Target, Zap } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Shell } from '../components/shell/Shell';
import { TriedButton, useRecentLogs } from '../components/support';
import { Note, PageHeader, SectionTitle } from '../components/ui/core';
import { SpeakButton } from '../components/ui/SpeakButton';
import { cx, tones } from '../components/ui/tone';
import { foodNeeds, textures } from '../data/support';
import { toast } from '../lib/feedback';
import { $child, updateChild } from '../lib/session';

export default function FoodPage() {
  return (
    <Shell section="support">
      <Food />
    </Shell>
  );
}

function Food() {
  const child = useStore($child)!;
  const [needId, setNeedId] = useState(foodNeeds[0].id);
  const [textureId, setTextureId] = useState(child.texture ?? 'soft');
  const logs = useRecentLogs();
  const need = foodNeeds.find((n) => n.id === needId)!;
  const texture = textures.find((t) => t.id === textureId)!;
  const t = tones[need.tone];

  return (
    <div className="grid gap-10">
      <PageHeader icon={Apple} title="Food Support" subtitle="Food ideas based on my need. Always check allergies and ask a grown-up." section="support" back={{ href: '/support', label: 'Everyday Support' }} />

      <section>
        <SectionTitle title="What do I need help with?" />
        <div role="tablist" aria-label="Food needs" className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
          {foodNeeds.map((n) => (
            <button
              key={n.id}
              type="button"
              role="tab"
              aria-selected={needId === n.id}
              onClick={() => setNeedId(n.id)}
              className={cx(
                'flex min-h-12 shrink-0 items-center gap-2 rounded-full border-2 px-4 font-semibold transition',
                needId === n.id ? cx(tones[n.tone].solid, 'border-transparent text-white shadow-card') : 'border-line bg-surface',
              )}
            >
              {n.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={need.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 grid gap-4" role="tabpanel">
            <div className={cx('flex items-center gap-3 rounded-3xl p-5', t.soft)}>
              <Target aria-hidden="true" className={cx('size-8 shrink-0', t.ink)} />
              <p className={cx('flex-1 font-display text-xl font-semibold', t.ink)}>Goal: {need.goal}</p>
              <SpeakButton text={`Goal: ${need.goal}. Good foods are: ${need.foods.map((f) => f.label).join(', ')}.`} />
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {need.foods.map((f, i) => (
                <motion.li
                  key={f.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 260, damping: 18 }}
                  className="card flex flex-col items-center gap-2 p-4 text-center"
                >
                  <span className="text-5xl" aria-hidden="true">{f.emoji}</span>
                  <span className="font-semibold">{f.label}</span>
                </motion.li>
              ))}
            </ul>
            <div className="card p-5">
              <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
                <Zap aria-hidden="true" className="size-5 text-sun-ink" /> Quick choice
              </h3>
              <ul className="flex flex-wrap gap-3">
                {need.quick.map((q) => (
                  <li key={q} className="flex items-center gap-2 rounded-2xl bg-bg-2 py-2 pl-4 pr-2">
                    <span className="font-semibold">{q}</span>
                    <TriedButton data={{ kind: 'food', refId: `${need.id}:${q}`, label: q }} count={logs.count('food', `${need.id}:${q}`)} onLogged={logs.reload} label="I had this" />
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      <section>
        <SectionTitle title="My preferred texture" subtitle="Some foods feel better than others. Choose a texture that feels comfortable." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {textures.map((tx) => (
            <button
              key={tx.id}
              type="button"
              aria-pressed={textureId === tx.id}
              onClick={() => {
                setTextureId(tx.id);
                void updateChild({ texture: tx.id }).then(() => toast(`Saved: you like ${tx.label.toLowerCase()} food`));
              }}
              className={cx(
                'flex min-h-24 flex-col items-center justify-center gap-1 rounded-3xl border-2 font-display text-lg font-semibold transition hover:-translate-y-1',
                textureId === tx.id ? 'border-transparent bg-peach text-white shadow-pop' : 'border-line bg-surface',
              )}
            >
              <span className="text-4xl" aria-hidden="true">{tx.emoji}</span>
              {tx.label}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.ul key={texture.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex flex-wrap gap-2">
            {texture.foods.map((f) => (
              <li key={f} className="rounded-full bg-peach-soft px-4 py-2 font-semibold text-peach-ink">
                {f}
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </section>
      <Note icon={Info}>“Where appropriate” means: only if there are no allergies and a grown-up says it’s okay.</Note>
    </div>
  );
}
