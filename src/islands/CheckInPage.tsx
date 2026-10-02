import { useStore } from '@nanostores/react';
import { ArrowLeft, ArrowRight, CircleHelp, House, MessageCircle, Save, Star, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { ActivityPlayer, DoneScreen, Reflection } from '../components/activity/ActivityPlayer';
import { NotSureFlow } from '../components/NotSureFlow';
import { Shell } from '../components/shell/Shell';
import { Button, ChoiceCard, ProgressDots } from '../components/ui/core';
import { ActivityCard, FeelingPicker, StepHeading, saveCheckin } from '../components/wellbeing';
import { activityById } from '../data/activities';
import { aboutOptions, feelingById } from '../data/feelings';
import { needById, needs } from '../data/needs';
import { useChildQuery } from '../lib/hooks';
import { DAY, rankActivities } from '../lib/insights';
import type { StepAnswers } from '../lib/model';
import { $child, settingsOf } from '../lib/session';
import { speak } from '../lib/speech';

type Stage = 'feeling' | 'needs' | 'about' | 'pick' | 'not-sure' | 'play' | 'reflect' | 'done';
const WIZARD: Stage[] = ['feeling', 'needs', 'about', 'pick'];

export default function CheckInPage() {
  return (
    <Shell section="wellbeing">
      <CheckIn />
    </Shell>
  );
}

function CheckIn() {
  const initialFeeling = useMemo(() => {
    const f = new URLSearchParams(window.location.search).get('feeling');
    return f && feelingById(f) ? f : undefined;
  }, []);
  const [stage, setStage] = useState<Stage>(initialFeeling ? 'needs' : 'feeling');
  const [feeling, setFeeling] = useState<string | undefined>(initialFeeling);
  const [selectedNeeds, setNeeds] = useState<string[]>([]);
  const [about, setAbout] = useState<string>();
  const [activityId, setActivityId] = useState<string>();
  const [answers, setAnswers] = useState<StepAnswers>({});
  const [saving, setSaving] = useState(false);
  const child = useStore($child);
  const { data: history } = useChildQuery((repo, id) => repo.listCheckins(id, Date.now() - 60 * DAY));

  const f = feeling ? feelingById(feeling) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!settingsOf(child).autoRead) return;
    const prompts: Partial<Record<Stage, string>> = {
      feeling: 'How am I feeling today? Pick the card that feels closest.',
      needs: 'What do you need right now? Choose as many as you like.',
      about: 'What is this about? This is optional.',
      pick: 'Here are some things you can try. Pick one.',
    };
    if (prompts[stage]) void speak(prompts[stage]!);
  }, [stage]);

  const pickFeeling = (id: string) => {
    setFeeling(id);
    window.setTimeout(() => setStage('needs'), 550);
  };

  const toggleNeed = (id: string) => setNeeds((n) => (n.includes(id) ? n.filter((x) => x !== id) : [...n, id]));

  const afterNeeds = () => {
    if (selectedNeeds.length === 1 && selectedNeeds[0] === 'not-sure') setStage('not-sure');
    else setStage('about');
  };

  const save = async (r: { feelingAfter?: number; helpfulness?: number; note?: string }) => {
    setSaving(true);
    const ok = await saveCheckin({ source: 'checkin', feeling, needs: selectedNeeds, about, activityId, answers, ...r });
    setSaving(false);
    if (ok) setStage('done');
  };

  const saveWithoutActivity = async () => {
    setSaving(true);
    const ok = await saveCheckin({ source: 'checkin', feeling, needs: selectedNeeds, about });
    setSaving(false);
    if (ok) setStage('done');
  };

  const wizardIndex = WIZARD.indexOf(stage);
  const back = () => {
    if (stage === 'not-sure') return setStage('needs');
    if (wizardIndex > 0) setStage(WIZARD[wizardIndex - 1]);
  };

  return (
    <div>
      {wizardIndex >= 0 && (
        <div className="mb-6 flex items-center justify-between gap-3">
          {wizardIndex > 0 ? (
            <Button variant="ghost" onClick={back} icon={ArrowLeft}>
              Back
            </Button>
          ) : (
            <Button variant="ghost" href="/wellbeing" icon={X}>
              Exit
            </Button>
          )}
          <ProgressDots step={wizardIndex} total={WIZARD.length} />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={stage} data-speak-scope initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}>
          {stage === 'feeling' && (
            <>
              <StepHeading title="How am I feeling today?" subtitle="Pick the card that feels closest. Any feeling is okay." />
              <FeelingPicker value={feeling} onPick={pickFeeling} />
            </>
          )}

          {stage === 'needs' && (
            <>
              {f && (
                <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-soft px-4 py-2 font-semibold text-violet-ink">
                  <span aria-hidden="true">{f.emoji}</span>
                  {f.id === 'not-sure' ? 'Thanks for being honest. Not knowing is okay.' : `Thank you for noticing. You’re feeling ${f.label.toLowerCase()}.`}
                </motion.p>
              )}
              <StepHeading title="What do you need right now?" subtitle="Choose as many as you like." />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {needs.map((n, i) => (
                  <ChoiceCard key={n.id} emoji={n.emoji} label={n.label} tone={n.tone} index={i} role="checkbox" selected={selectedNeeds.includes(n.id)} onClick={() => toggleNeed(n.id)} />
                ))}
              </div>
              {selectedNeeds.length ? (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="sticky bottom-24 z-10 mt-6 md:bottom-4">
                  <Button variant="gradient" size="lg" block onClick={afterNeeds}>
                    Next ({selectedNeeds.length} chosen)
                    <ArrowRight aria-hidden="true" className="size-5" />
                  </Button>
                </motion.div>
              ) : (
                <p className="mt-6 text-center font-semibold text-ink-soft">Tap one or more cards to continue.</p>
              )}
            </>
          )}

          {stage === 'about' && (
            <>
              <StepHeading title="What’s this about?" subtitle="This is optional. You can skip it." />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {aboutOptions.map((o, i) => (
                  <ChoiceCard
                    key={o.label}
                    emoji={o.emoji}
                    label={o.label}
                    index={i}
                    tone="peach"
                    role="radio"
                    selected={about === o.label}
                    onClick={() => {
                      setAbout(about === o.label ? undefined : o.label);
                      if (about !== o.label) window.setTimeout(() => setStage('pick'), 450);
                    }}
                  />
                ))}
              </div>
              <Button variant="outline" size="lg" block className="mt-6" onClick={() => setStage('pick')}>
                Skip
                <ArrowRight aria-hidden="true" className="size-5" />
              </Button>
            </>
          )}

          {stage === 'pick' && (
            <>
              <StepHeading title="Help me feel better" subtitle="Here are some short things to try. Pick one. You can stop any time." />
              <div className="grid gap-8">
                {selectedNeeds
                  .filter((id) => id !== 'not-sure')
                  .map((id) => {
                    const need = needById(id)!;
                    return (
                      <section key={id}>
                        <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
                          <span aria-hidden="true">{need.emoji}</span> {need.label}
                        </h3>
                        <div className="grid gap-3">
                          {rankActivities(need.activityIds, history ?? []).map((a, i) => (
                            <ActivityCard
                              key={a.id}
                              id={a.id}
                              helpedBefore={a.helpedBefore}
                              index={i}
                              onPick={() => {
                                setActivityId(a.id);
                                setStage('play');
                              }}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                {selectedNeeds.includes('not-sure') && (
                  <Button variant="soft" tone="lilac" size="lg" onClick={() => setStage('not-sure')} icon={CircleHelp}>
                    Help me figure out what I need
                  </Button>
                )}
              </div>
              <div className="mt-8 rounded-3xl bg-bg-2 p-5 text-center">
                <p className="text-ink-soft">Don’t want to try anything right now? That’s okay too.</p>
                <Button variant="outline" className="mt-3" onClick={saveWithoutActivity} disabled={saving} icon={Save}>
                  Just save my check-in
                </Button>
              </div>
            </>
          )}

          {stage === 'not-sure' && (
            <NotSureFlow
              initialFeeling={undefined}
              onBack={() => setStage('needs')}
              onChoose={(id, needId) => {
                // The main feeling was already picked in step 1, so the not-sure feeling isn't needed here.
                setActivityId(id);
                setNeeds((n) => [...new Set([...n.filter((x) => x !== 'not-sure'), 'not-sure', needId])]);
                setStage('play');
              }}
            />
          )}

          {stage === 'play' && activityId && activityById(activityId) && (
            <ActivityPlayer
              activity={activityById(activityId)!}
              onBack={() => setStage('pick')}
              onFinish={(a) => {
                setAnswers(a);
                setStage('reflect');
              }}
            />
          )}

          {stage === 'reflect' && <Reflection onSave={save} saving={saving} />}

          {stage === 'done' && (
            <DoneScreen
              message="Your check-in is saved. Noticing your feelings is a brave thing to do."
              actions={[
                { label: 'Back to home', href: '/home', icon: House },
                { label: 'See my progress', href: '/progress', icon: Star },
                { label: 'I want to talk to someone', href: '/talk', icon: MessageCircle },
              ]}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
