import { Check, ChevronRight, CircleCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { celebrate, toast } from '../lib/feedback';
import { useChildQuery, withChild } from '../lib/hooks';
import { DAY } from '../lib/insights';
import type { ActivityLog, ActivityLogKind, New } from '../lib/model';
import { SpeakButton } from './ui/SpeakButton';
import { cx } from './ui/tone';

/** Recent everyday-support logs, for "tried N times" badges. */
export function useRecentLogs() {
  const q = useChildQuery((repo, id) => repo.listActivityLogs(id, Date.now() - 30 * DAY));
  const counts = new Map<string, number>();
  for (const l of q.data ?? []) counts.set(`${l.kind}:${l.refId}`, (counts.get(`${l.kind}:${l.refId}`) ?? 0) + 1);
  return { ...q, count: (kind: ActivityLogKind, refId: string) => counts.get(`${kind}:${refId}`) ?? 0 };
}

export async function logActivity(data: New<ActivityLog>) {
  try {
    await withChild((repo, id) => repo.addActivityLog(id, data));
    toast('Added to My Progress');
    void celebrate();
    return true;
  } catch (e) {
    console.error(e);
    toast('Could not save. Please check your connection.', 'error');
    return false;
  }
}

/** "I tried this" button that logs to My Progress and shows how often it was tried. */
export function TriedButton({ data, count, onLogged, label = 'I tried this' }: { data: New<ActivityLog>; count: number; onLogged: () => void; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [justDone, setJustDone] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async (e) => {
        e.stopPropagation();
        setBusy(true);
        if (await logActivity(data)) {
          setJustDone(true);
          onLogged();
          window.setTimeout(() => setJustDone(false), 1800);
        }
        setBusy(false);
      }}
      className={cx(
        'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition active:scale-95',
        justDone ? 'bg-mint text-white' : 'bg-mint-soft text-mint-ink hover:bg-mint hover:text-white',
      )}
    >
      {justDone ? <CircleCheck aria-hidden="true" className="size-4.5" /> : <Check aria-hidden="true" className="size-4.5" strokeWidth={3} />}
      {justDone ? 'Great job!' : label}
      {count > 0 && !justDone && <span className="rounded-full bg-surface/70 px-2 py-0.5 text-xs">{count}×</span>}
    </button>
  );
}

/** Difficulty → Strategy → Activity → Progress chain shown on support pages. */
export function ChainSteps({ active }: { active: 0 | 1 | 2 | 3 }) {
  const steps = ['Difficulty', 'Strategy', 'Activity', 'Progress'];
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-1 text-sm font-bold" aria-label="Steps">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-1">
          <span className={cx('rounded-full px-3 py-1', i === active ? 'bg-teal text-white' : i < active ? 'bg-teal-soft text-teal-ink' : 'bg-bg-2 text-ink-soft')} aria-current={i === active ? 'step' : undefined}>
            {s}
          </span>
          {i < steps.length - 1 && <ChevronRight aria-hidden="true" className="size-4 text-ink-soft" />}
        </li>
      ))}
    </ol>
  );
}

export function NumberedSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="grid gap-2">
      {steps.map((s, i) => (
        <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full font-display font-bold text-white" style={{ background: 'var(--grad-support)' }}>
            {i + 1}
          </span>
          <span className="flex-1 text-lg">{s}</span>
        </motion.li>
      ))}
      <li className="pt-1">
        <SpeakButton text={steps.map((s, i) => `Step ${i + 1}. ${s}.`).join(' ')} size="sm" label="Read this activity aloud" scope />
      </li>
    </ol>
  );
}
