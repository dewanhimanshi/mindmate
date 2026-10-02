import { Dumbbell, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Shell } from '../components/shell/Shell';
import { NumberedSteps, TriedButton, useRecentLogs } from '../components/support';
import { Note, PageHeader, SectionTitle } from '../components/ui/core';
import { cx, tones } from '../components/ui/tone';
import { exerciseGoals } from '../data/support';

export default function ExercisePage() {
  return (
    <Shell section="support">
      <Exercise />
    </Shell>
  );
}

function Exercise() {
  const [goalId, setGoalId] = useState(() => {
    const hash = window.location.hash.slice(1);
    return exerciseGoals.some((g) => g.id === hash) ? hash : exerciseGoals[0].id;
  });
  const logs = useRecentLogs();
  const goal = exerciseGoals.find((g) => g.id === goalId)!;

  useEffect(() => {
    history.replaceState(null, '', `#${goalId}`);
  }, [goalId]);

  return (
    <>
      <PageHeader icon={Dumbbell} title="Exercise & Movement" subtitle="I want to improve… Pick one and try a fun activity." section="support" back={{ href: '/support', label: 'Everyday Support' }} />
      <section aria-label="I want to improve">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {exerciseGoals.map((g, i) => (
            <motion.button
              key={g.id}
              type="button"
              aria-pressed={goalId === g.id}
              onClick={() => setGoalId(g.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              data-read
              className={cx(
                'flex min-h-28 flex-col items-center justify-center gap-1 rounded-3xl border-2 p-3 text-center font-display font-semibold transition hover:-translate-y-1',
                goalId === g.id ? cx(tones[g.tone].solid, 'border-transparent text-white shadow-pop') : 'border-line bg-surface',
              )}
            >
              <span className={cx('text-4xl', goalId === g.id && 'animate-wiggle')} aria-hidden="true">
                {g.emoji}
              </span>
              {g.label}
            </motion.button>
          ))}
        </div>
      </section>

      <AnimatePresence mode="wait">
        <motion.section key={goal.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-10">
          <SectionTitle title={`${goal.label}: suggested activities`} />
          <div className="grid gap-4 md:grid-cols-2">
            {goal.activities.map((a, i) => (
              <motion.article
                key={a.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card flex flex-col gap-4 p-5"
              >
                <div className="flex items-center gap-3">
                  <span className={cx('grid size-14 place-items-center rounded-2xl text-3xl', tones[goal.tone].soft)} aria-hidden="true">
                    {a.emoji}
                  </span>
                  <h3 className="flex-1 text-xl font-bold">{a.name}</h3>
                </div>
                <NumberedSteps steps={a.steps} />
                <div className="mt-auto">
                  <TriedButton data={{ kind: 'exercise', refId: a.id, label: a.name, emoji: a.emoji }} count={logs.count('exercise', a.id)} onLogged={logs.reload} label="I did it!" />
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-6"><Note icon={ShieldCheck}>Always exercise with a grown-up nearby. Stop if anything hurts, and take rest breaks.</Note></div>
        </motion.section>
      </AnimatePresence>
    </>
  );
}
