import { motion } from 'motion/react';
import { activityById } from '../data/activities';
import { feelingGroups, feelings, notSureFeeling } from '../data/feelings';
import { toast } from '../lib/feedback';
import { withChild } from '../lib/hooks';
import type { Checkin, New } from '../lib/model';
import { applyActivitySideEffects } from './activity/ActivityPlayer';
import { ChoiceCard } from './ui/core';
import { SpeakButton } from './ui/SpeakButton';

/** Feeling grid in three groups, plus "I don't know how I feel". */
export function FeelingPicker({ value, onPick }: { value?: string; onPick: (id: string) => void }) {
  let i = 0;
  return (
    <div className="grid gap-6">
      {feelingGroups.map((g) => (
        <section key={g.id} aria-labelledby={`fg-${g.id}`}>
          <h3 id={`fg-${g.id}`} className="mb-3 font-display text-lg font-semibold text-ink-soft">
            {g.title}
          </h3>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {feelings
              .filter((f) => f.group === g.id)
              .map((f) => (
                <ChoiceCard key={f.id} emoji={f.emoji} label={f.label} tone={g.tone} index={i++} role="radio" selected={value === f.id} onClick={() => onPick(f.id)} />
              ))}
          </div>
        </section>
      ))}
      <ChoiceCard
        layout="row"
        emoji={notSureFeeling.emoji}
        label={notSureFeeling.label}
        hint="That’s okay. Feelings can be hard to name."
        tone="lilac"
        index={i}
        role="radio"
        selected={value === notSureFeeling.id}
        onClick={() => onPick(notSureFeeling.id)}
      />
    </div>
  );
}

/** Suggested activity card with minutes and "helped you before" badge. */
export function ActivityCard({ id, helpedBefore, onPick, index = 0, href }: { id: string; helpedBefore?: boolean; onPick?: () => void; index?: number; href?: string }) {
  const a = activityById(id);
  if (!a) return null;
  return (
    <ChoiceCard
      layout="row"
      emoji={a.emoji}
      label={a.title}
      hint={`${a.summary} · ${a.minutes} min`}
      badge={helpedBefore ? 'Helped you before' : undefined}
      index={index}
      onClick={onPick}
      href={href}
    />
  );
}

export function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start gap-3">
      <div className="flex-1">
        <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-1 text-lg text-ink-soft">{subtitle}</p>}
      </div>
      <SpeakButton text={subtitle ? `${title}. ${subtitle}` : title} scope />
    </motion.div>
  );
}

/** Save a check-in and run activity side effects. Returns false on failure. */
export async function saveCheckin(data: New<Checkin>): Promise<boolean> {
  try {
    await withChild((repo, id) => repo.addCheckin(id, data));
    if (data.activityId && data.answers) await applyActivitySideEffects(data.activityId, data.answers);
    return true;
  } catch (e) {
    console.error(e);
    toast('Could not save. Please check your connection.', 'error');
    return false;
  }
}
