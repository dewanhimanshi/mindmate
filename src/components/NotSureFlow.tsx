import { ArrowLeft, Play, Shuffle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { activityById } from '../data/activities';
import { needById, notSureFeelings, notSureHelpful, notSureSuggestion } from '../data/needs';
import { Mindy } from './Mindy';
import { Button, ChoiceCard } from './ui/core';
import { StepHeading } from './wellbeing';

/** "What sounds most helpful?" → the need whose activities we fall back to. */
export const helpfulToNeed: Record<string, string> = {
  calm: 'calm',
  express: 'listen',
  focus: 'focus',
  connect: 'talk',
  break: 'break',
  encouraged: 'encouragement',
};

/** Doc flow: How do you feel? → What sounds most helpful? → one small suggestion. */
export function NotSureFlow({
  onChoose,
  onBack,
  initialFeeling,
}: {
  onChoose: (activityId: string, needId: string, feelingId: string) => void;
  onBack?: () => void;
  initialFeeling?: string;
}) {
  const [stage, setStage] = useState<'feel' | 'helpful' | 'suggest'>(initialFeeling ? 'helpful' : 'feel');
  const [feeling, setFeeling] = useState(initialFeeling ?? '');
  const [helpful, setHelpful] = useState('');
  const [offset, setOffset] = useState(0);

  const needId = helpfulToNeed[helpful] ?? 'calm';
  const first = helpful ? notSureSuggestion(feeling, helpful) : '';
  const alternatives = [first, ...(needById(needId)?.activityIds ?? []).filter((id) => id !== first)];
  const suggestion = activityById(alternatives[offset % alternatives.length]);

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div key={stage} data-speak-scope initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}>
          {stage === 'feel' && (
            <>
              <Mindy size={90} mood="think" say="That’s okay. Let’s figure it out together." className="mb-6" />
              <StepHeading title="How do you feel right now?" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {notSureFeelings.map((f, i) => (
                  <ChoiceCard
                    key={f.id}
                    emoji={f.emoji}
                    label={f.label}
                    index={i}
                    tone="lilac"
                    role="radio"
                    selected={feeling === f.id}
                    onClick={() => {
                      setFeeling(f.id);
                      window.setTimeout(() => setStage('helpful'), 450);
                    }}
                  />
                ))}
              </div>
              {onBack && (
                <Button variant="ghost" className="mt-6" onClick={onBack} icon={ArrowLeft}>
                  Back
                </Button>
              )}
            </>
          )}

          {stage === 'helpful' && (
            <>
              <StepHeading title="What sounds most helpful?" subtitle="Pick the one that feels right." />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {notSureHelpful.map((h, i) => (
                  <ChoiceCard
                    key={h.id}
                    emoji={h.emoji}
                    label={h.label}
                    index={i}
                    tone="sky"
                    role="radio"
                    selected={helpful === h.id}
                    onClick={() => {
                      setHelpful(h.id);
                      setOffset(0);
                      window.setTimeout(() => setStage('suggest'), 450);
                    }}
                  />
                ))}
              </div>
              <Button variant="ghost" className="mt-6" onClick={() => (initialFeeling ? onBack?.() : setStage('feel'))} icon={ArrowLeft}>
                Back
              </Button>
            </>
          )}

          {stage === 'suggest' && suggestion && (
            <div className="flex flex-col items-center text-center">
              <Mindy size={100} mood="happy" />
              <StepHeading title="Here’s one small thing to try" />
              <motion.div key={suggestion.id} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }} className="card w-full max-w-md p-8" data-read>
                <div className="text-7xl" aria-hidden="true">{suggestion.emoji}</div>
                <h3 className="mt-3 text-2xl font-bold">{suggestion.title}</h3>
                <p className="mt-2 text-lg text-ink-soft">{suggestion.summary}</p>
                <p className="mt-2 text-sm font-semibold text-ink-soft">About {suggestion.minutes} min</p>
              </motion.div>
              <div className="mt-6 grid w-full max-w-md gap-3">
                <Button variant="gradient" size="lg" block onClick={() => onChoose(suggestion.id, needId, feeling)} icon={Play}>
                  Let’s try it
                </Button>
                <Button variant="outline" size="lg" block onClick={() => setOffset(offset + 1)} icon={Shuffle}>
                  Show me something else
                </Button>
                <Button variant="ghost" onClick={() => setStage('helpful')} icon={ArrowLeft}>
                  Back
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
