import { ArrowLeft, BookOpen, Puzzle, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Shell } from '../components/shell/Shell';
import { ChainSteps, TriedButton, useRecentLogs } from '../components/support';
import { ChoiceCard, PageHeader, SectionTitle } from '../components/ui/core';
import { SpeakButton } from '../components/ui/SpeakButton';
import { cx, tones } from '../components/ui/tone';
import { activityById } from '../data/activities';
import { difficulties, difficultyById } from '../data/support';

/** "What is difficult for me?" grid. With `academic`, only learning difficulties. */
export function DifficultyListPage({ academic }: { academic?: boolean }) {
  const list = academic ? difficulties.filter((d) => d.academic) : difficulties;
  return (
    <Shell section="support">
      <PageHeader
        icon={academic ? BookOpen : Puzzle}
        title={academic ? 'Academics' : 'What is difficult for me?'}
        subtitle={academic ? 'Learning and classroom strategies. Tap what is hard for you.' : 'Tap one to see strategies that can help.'}
        section="support"
        back={{ href: '/support', label: 'Everyday Support' }}
      />
      <ChainSteps active={0} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((d, i) => (
          <ChoiceCard key={d.id} emoji={d.emoji} label={d.label} tone={d.tone} index={i} href={`/support/difficulty/${d.id}${academic ? '?from=academics' : ''}`} />
        ))}
      </div>
    </Shell>
  );
}

export function DifficultyPage({ id }: { id: string }) {
  return (
    <Shell section="support">
      <Difficulty id={id} />
    </Shell>
  );
}

function Difficulty({ id }: { id: string }) {
  const d = difficultyById(id)!;
  const logs = useRecentLogs();
  const fromAcademics = new URLSearchParams(window.location.search).get('from') === 'academics';
  const t = tones[d.tone];

  return (
    <div className="grid gap-8">
      <div>
        <a href={fromAcademics ? '/support/academics' : '/support/difficulty'} className="mb-3 inline-flex min-h-11 items-center gap-1 font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft aria-hidden="true" className="size-5" /> {fromAcademics ? 'Academics' : 'All difficulties'}
        </a>
        <ChainSteps active={1} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cx('flex items-center gap-4 rounded-[2rem] p-6', t.soft)}>
          <span className="grid size-20 shrink-0 place-items-center rounded-3xl bg-surface text-5xl shadow-card" aria-hidden="true">
            {d.emoji}
          </span>
          <div className="flex-1">
            <p className={cx('text-sm font-bold uppercase tracking-wide', t.ink)}>{d.label}</p>
            <h1 className={cx('text-3xl font-bold sm:text-4xl', t.ink)}>{d.statement}</h1>
          </div>
          <SpeakButton text={d.statement} />
        </motion.div>
      </div>

      <section>
        <SectionTitle title="Try these strategies" subtitle="Tap “I tried this” when you use one. It goes into My Progress." />
        <ul className="grid gap-3 lg:grid-cols-2">
          {d.strategies.map((s, i) => (
            <motion.li
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card flex flex-wrap items-center gap-3 p-4"
            >
              <span className={cx('grid size-12 shrink-0 place-items-center rounded-2xl text-2xl', t.soft)} aria-hidden="true">
                {s.emoji}
              </span>
              <p className="min-w-0 flex-1 basis-40 text-lg font-semibold">{s.label}</p>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <SpeakButton text={s.label} size="sm" />
                <TriedButton
                  data={{ kind: 'strategy', refId: `${d.id}:${i}`, label: s.label, emoji: s.emoji, difficultyId: d.id }}
                  count={logs.count('strategy', `${d.id}:${i}`)}
                  onLogged={logs.reload}
                />
              </div>
            </motion.li>
          ))}
        </ul>
      </section>

      {d.related.length > 0 && (
        <section>
          <SectionTitle title="Try an activity" />
          <div className="grid gap-3 sm:grid-cols-2">
            {d.related.map((r, i) => {
              const a = r.activityId ? activityById(r.activityId) : undefined;
              return (
                <ChoiceCard
                  key={r.label}
                  layout="row"
                  tone={d.tone}
                  emoji={r.emoji}
                  label={r.label}
                  hint={a ? `${a.summary} · ${a.minutes} min` : undefined}
                  index={i}
                  href={r.activityId ? `/activity/${r.activityId}?from=/support/difficulty/${d.id}` : r.href}
                />
              );
            })}
          </div>
        </section>
      )}

      <a href="/progress#support" data-read className="card flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-pop">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sun-soft text-sun-ink" aria-hidden="true">
          <Star className="size-7" />
        </span>
        <span>
          <span className="block font-display text-lg font-semibold">See my progress</span>
          <span className="block text-ink-soft">All the strategies and activities you have tried.</span>
        </span>
      </a>
    </div>
  );
}
