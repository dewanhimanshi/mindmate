import { useStore } from '@nanostores/react';
import { ArrowLeft, ArrowRight, Check, House, Save, Star, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { feelingAfter, helpfulness } from '../../data/feelings';
import type { Activity, Step } from '../../data/types';
import { celebrate } from '../../lib/feedback';
import type { StepAnswers } from '../../lib/model';
import { $child, settingsOf, updateChild } from '../../lib/session';
import { speak } from '../../lib/speech';
import { withChild } from '../../lib/hooks';
import { Mindy } from '../Mindy';
import { Button, ChoiceCard, ProgressDots, TextArea } from '../ui/core';
import { SpeakButton } from '../ui/SpeakButton';
import {
  BreathingStep,
  ChecklistStep,
  ChooseStep,
  ExpressStep,
  GroundingStep,
  InfoStep,
  ListStep,
  PromptStep,
  SentenceStep,
  SoundStep,
  stepPrompt,
  TimerStep,
  VoiceStep,
  type Answer,
} from './steps';

function renderStep(step: Step, value: Answer, onChange: (v: Answer) => void, onDone: () => void) {
  const p = { value, onChange, onDone };
  switch (step.type) {
    case 'info':
      return <InfoStep step={step} {...p} />;
    case 'breathing':
      return <BreathingStep step={step} {...p} />;
    case 'grounding':
      return <GroundingStep step={step} {...p} />;
    case 'timer':
      return <TimerStep step={step} {...p} />;
    case 'choose':
      return <ChooseStep step={step} {...p} />;
    case 'prompt':
      return <PromptStep step={step} {...p} />;
    case 'sentence':
      return <SentenceStep step={step} {...p} />;
    case 'list':
      return <ListStep step={step} {...p} />;
    case 'checklist':
      return <ChecklistStep step={step} {...p} />;
    case 'express':
      return <ExpressStep step={step} {...p} />;
    case 'voice':
      return <VoiceStep step={step} {...p} />;
    case 'sound':
      return <SoundStep step={step} {...p} />;
  }
}

/** Plays an activity screen by screen. Calls `onFinish` with the child's answers. */
export function ActivityPlayer({ activity, onFinish, onBack }: { activity: Activity; onFinish: (answers: StepAnswers) => void; onBack?: () => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<StepAnswers>({});
  const [direction, setDirection] = useState(1);
  const child = useStore($child);
  const step = activity.steps[index];
  const last = index === activity.steps.length - 1;

  useEffect(() => {
    if (settingsOf(child).autoRead) void speak(stepPrompt(step));
  }, [index]);

  const go = (delta: number) => {
    setDirection(delta);
    if (delta > 0 && last) {
      const clean: StepAnswers = {};
      for (const [k, v] of Object.entries(answers)) {
        if (Array.isArray(v) ? v.some((x) => x.trim()) : v?.trim()) clean[k] = Array.isArray(v) ? v.filter((x) => x.trim()) : v;
      }
      onFinish(clean);
      return;
    }
    if (delta < 0 && index === 0) return onBack?.();
    setIndex(index + delta);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="grid size-14 place-items-center rounded-2xl bg-violet-soft text-3xl" aria-hidden="true">
          {activity.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">Activity · about {activity.minutes} min</p>
          <h1 className="text-2xl font-bold sm:text-3xl">{activity.title}</h1>
        </div>
        {activity.steps.length > 1 && <ProgressDots step={index} total={activity.steps.length} />}
      </div>

      <div className="card min-h-96 overflow-hidden p-5 sm:p-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25 }}
          >
            {renderStep(step, answers[index], (v) => setAnswers((a) => ({ ...a, [index]: v as string | string[] })), () => undefined)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="sticky bottom-24 z-10 mt-5 flex gap-3 md:bottom-4">
        {(index > 0 || onBack) && (
          <Button variant="outline" size="lg" onClick={() => go(-1)} icon={ArrowLeft}>
            Back
          </Button>
        )}
        <Button variant="gradient" size="lg" className="flex-1" onClick={() => go(1)} icon={last ? Check : undefined}>
          {last ? 'I’m done' : 'Next'}
          {!last && <ArrowRight aria-hidden="true" className="size-5" />}
        </Button>
      </div>
    </div>
  );
}

/** "How do you feel now?" + "Did it help?" after an activity. */
export function Reflection({ onSave, saving }: { onSave: (r: { feelingAfter?: number; helpfulness?: number; note?: string }) => void; saving: boolean }) {
  const [after, setAfter] = useState<number>();
  const [helped, setHelped] = useState<number>();
  const [note, setNote] = useState('');
  return (
    <div className="grid gap-8">
      <section>
        <div className="mb-4 flex items-start gap-3">
          <h2 className="flex-1 text-2xl font-bold sm:text-3xl">How do you feel now?</h2>
          <SpeakButton text="How do you feel now?" scope />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {feelingAfter.map((o, i) => (
            <ChoiceCard key={o.label} emoji={o.emoji} label={o.label} index={i} tone="sky" role="radio" selected={after === i} onClick={() => setAfter(i)} />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-start gap-3">
          <h2 className="flex-1 text-2xl font-bold sm:text-3xl">Did it help?</h2>
          <SpeakButton text="Did it help?" scope />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {helpfulness.map((o, i) => (
            <ChoiceCard key={o.label} emoji={o.emoji} label={o.label} index={i} tone="mint" layout="row" role="radio" selected={helped === i} onClick={() => setHelped(i)} />
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-soft">There’s no wrong answer. This helps you learn what works for you.</p>
      </section>
      <section>
        <h2 className="mb-3 text-xl font-bold">Anything else? (optional)</h2>
        <TextArea label="Anything else" rows={3} value={note} onChange={setNote} placeholder="You can write a note for yourself." maxLength={500} />
      </section>
      <Button variant="gradient" size="lg" block disabled={saving} onClick={() => onSave({ feelingAfter: after, helpfulness: helped, note: note.trim() || undefined })} icon={Save}>
        {saving ? 'Saving…' : 'Save my check-in'}
      </Button>
    </div>
  );
}

export function DoneScreen({ message, actions }: { message: string; actions?: { label: string; href?: string; onClick?: () => void; icon: LucideIcon }[] }) {
  useEffect(() => {
    void celebrate();
  }, []);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8 text-center">
      <Mindy size={160} mood="cheer" />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">You did it!</h1>
      <div className="mt-2 flex max-w-lg items-start gap-2">
        <p className="flex-1 text-xl text-ink-soft">{message}</p>
        <SpeakButton text={`You did it! ${message}`} size="sm" />
      </div>
      <div className="mt-8 grid w-full max-w-md gap-3">
        {(actions ?? [
          { label: 'Back to home', href: '/home', icon: House },
          { label: 'See my progress', href: '/progress', icon: Star },
        ]).map((a, i) => (
          <Button key={a.label} variant={i === 0 ? 'gradient' : 'outline'} size="lg" block href={a.href} onClick={a.onClick} icon={a.icon}>
            {a.label}
          </Button>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Some activities feed other parts of the app:
 * "My Small Win" adds a win; "Strength Reminder" adds to My Strengths.
 */
export async function applyActivitySideEffects(activityId: string | undefined, answers: StepAnswers) {
  if (activityId === 'my-small-win' && typeof answers[0] === 'string') {
    await withChild((repo, id) => repo.addWin(id, { text: answers[0] as string, category: 'Feelings' }));
  }
  if (activityId === 'strength-reminder' && Array.isArray(answers[0])) {
    const map: Record<string, string> = { 'Hard-working': 'Hard-working', Caring: 'Caring friend' };
    const current = $child.get()?.strengths ?? [];
    const added = (answers[0] as string[]).map((s) => map[s] ?? s);
    await updateChild({ strengths: [...new Set([...current, ...added])] });
  }
}
