import { ArrowLeft, Brain, House, MessageCircle, Save } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { DoneScreen } from '../components/activity/ActivityPlayer';
import { Shell } from '../components/shell/Shell';
import { Button, ChoiceCard, PageHeader, ProgressDots } from '../components/ui/core';
import { SpeakButton } from '../components/ui/SpeakButton';
import { ActivityCard, FeelingPicker, StepHeading, saveCheckin } from '../components/wellbeing';
import { activityById } from '../data/activities';
import { feelingById } from '../data/feelings';
import { needById } from '../data/needs';
import type { Step } from '../data/types';

const optionsOf = (activityId: string) => (activityById(activityId)!.steps[0] as Extract<Step, { type: 'choose' }>).options;
const triggers = optionsOf('what-triggered');
const wants = optionsOf('what-do-i-need');

/** "What do I need?" answer → need whose activities we suggest next. */
const wantToNeed: Record<string, string> = {
  Rest: 'break',
  Support: 'talk',
  Space: 'calm',
  Understanding: 'listen',
  Encouragement: 'encouragement',
  'A solution': 'motivation',
};

export default function UnderstandPage() {
  return (
    <Shell section="wellbeing">
      <Understand />
    </Shell>
  );
}

function Understand() {
  const [step, setStep] = useState(0);
  const [feeling, setFeeling] = useState<string>();
  const [trigger, setTrigger] = useState<string>();
  const [want, setWant] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const f = feeling ? feelingById(feeling) : undefined;
  const needId = want ? wantToNeed[want] : undefined;
  const sentence = f
    ? `I feel ${f.id === 'not-sure' ? 'something I can’t name yet' : f.label.toLowerCase()}${trigger ? ` because of ${trigger === "I don't know" ? 'something I’m not sure about' : trigger.toLowerCase()}` : ''}. ${want ? `I need ${want === 'A solution' ? 'a solution' : want.toLowerCase()}.` : ''}`
    : '';

  const next = (fn: () => void) => {
    fn();
    window.setTimeout(() => setStep((s) => s + 1), 450);
  };

  if (saved)
    return (
      <>
        <DoneScreen
          message="You understood your feelings a little better today. That’s a superpower!"
          actions={[
            { label: 'Back to home', href: '/home', icon: House },
            { label: 'Talk to someone', href: '/talk', icon: MessageCircle },
          ]}
        />
        {needId && (
          <section className="mx-auto mt-4 max-w-xl">
            <h2 className="mb-3 text-xl font-bold">Something that might help</h2>
            <div className="grid gap-3">
              {needById(needId)!.activityIds.map((id, i) => (
                <ActivityCard key={id} id={id} index={i} href={`/activity/${id}`} />
              ))}
            </div>
          </section>
        )}
      </>
    );

  return (
    <>
      <PageHeader icon={Brain} title="Understand my feelings" subtitle="Feeling → What caused it? → What do I need?" section="wellbeing" back={{ href: '/wellbeing', label: 'Health & Well-being' }} />
      <div className="mb-6 flex items-center justify-between">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)} icon={ArrowLeft}>
            Back
          </Button>
        ) : (
          <span />
        )}
        <ProgressDots step={step} total={4} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} data-speak-scope initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}>
          {step === 0 && (
            <>
              <StepHeading title="Name it" subtitle="Choose the feeling that fits best." />
              <FeelingPicker value={feeling} onPick={(id) => next(() => setFeeling(id))} />
            </>
          )}
          {step === 1 && (
            <>
              <StepHeading title="What triggered it?" subtitle="What made you feel this way?" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {triggers.map((o, i) => (
                  <ChoiceCard key={o.label} emoji={o.emoji} label={o.label} index={i} tone="peach" role="radio" selected={trigger === o.label} onClick={() => next(() => setTrigger(o.label))} />
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <StepHeading title="What do I need?" subtitle="Choose what would help most." />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {wants.map((o, i) => (
                  <ChoiceCard key={o.label} emoji={o.emoji} label={o.label} index={i} tone="mint" role="radio" selected={want === o.label} onClick={() => next(() => setWant(o.label))} />
                ))}
              </div>
            </>
          )}
          {step === 3 && (
            <div className="flex flex-col items-center text-center">
              <StepHeading title="Here’s what you found out" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card w-full max-w-xl p-8">
                <div className="text-6xl" aria-hidden="true">{f?.emoji}</div>
                <p className="mt-4 font-display text-2xl font-semibold leading-snug sm:text-3xl" data-read>
                  {sentence}
                </p>
                <div className="mt-4 flex justify-center">
                  <SpeakButton text={sentence} force size="lg" label="Say it for me" />
                </div>
                <p className="mt-4 text-ink-soft">You can show this to a trusted adult if you want to talk about it.</p>
              </motion.div>
              <Button
                variant="gradient"
                size="lg"
                className="mt-6 w-full max-w-xl"
                disabled={saving}
                icon={Save}
                onClick={async () => {
                  setSaving(true);
                  const ok = await saveCheckin({
                    source: 'understand',
                    feeling,
                    about: trigger,
                    needs: ['understand', ...(needId ? [needId] : [])],
                    answers: { want: want ?? '' },
                  });
                  setSaving(false);
                  if (ok) setSaved(true);
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
