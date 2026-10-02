import { Leaf, MessageCircle, Sun, Waves } from 'lucide-react';
import { motion } from 'motion/react';
import { Shell } from '../components/shell/Shell';
import { TriedButton, useRecentLogs } from '../components/support';
import { ChoiceCard, Note, PageHeader, SectionTitle } from '../components/ui/core';
import { cx, tones } from '../components/ui/tone';
import { activityById } from '../data/activities';
import { calmTools, sensoryBreaks } from '../data/support';

export default function CalmPage() {
  return (
    <Shell section="support">
      <Calm />
    </Shell>
  );
}

function Calm() {
  const logs = useRecentLogs();
  return (
    <div className="grid gap-10">
      <PageHeader icon={Leaf} title="Calm & Sensory" subtitle="Tools to help your body and mind feel calm and just right." section="support" back={{ href: '/support', label: 'Everyday Support' }} />

      <section>
        <SectionTitle title="Calming tools" subtitle="Guided activities you can do anywhere." />
        <div className="grid gap-3 sm:grid-cols-2">
          {calmTools.map((t, i) => {
            const a = activityById(t.activityId)!;
            return <ChoiceCard key={t.activityId} layout="row" tone="sky" emoji={t.emoji} label={t.label} hint={`${a.summary} · ${a.minutes} min`} index={i} href={`/activity/${t.activityId}?from=/support/calm`} />;
          })}
        </div>
      </section>

      <section>
        <SectionTitle title="Sensory breaks" subtitle="How does your body feel? Pick an idea and try it." />
        <div className="grid gap-6 lg:grid-cols-2">
          {sensoryBreaks.map((group) => (
            <div key={group.id} className={cx('rounded-[2rem] p-5', tones[group.tone].soft)}>
              <h3 className={cx('mb-4 flex items-center gap-2 font-display text-xl font-bold', tones[group.tone].ink)}>
                {group.id === 'too-much' ? <Waves aria-hidden="true" className="size-7" /> : <Sun aria-hidden="true" className="size-7" />}
                {group.title}
              </h3>
              <ul className="grid gap-2">
                {group.ideas.map((idea, i) => (
                  <motion.li
                    key={idea.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm"
                  >
                    <span className="text-2xl" aria-hidden="true">{idea.emoji}</span>
                    <span className="flex-1 font-semibold">{idea.label}</span>
                    <TriedButton data={{ kind: 'calm', refId: `${group.id}:${i}`, label: idea.label, emoji: idea.emoji }} count={logs.count('calm', `${group.id}:${i}`)} onLogged={logs.reload} />
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <Note icon={MessageCircle}>It’s always okay to say: “I need a break.”</Note>
    </div>
  );
}
