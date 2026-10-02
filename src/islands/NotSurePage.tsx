import { CircleHelp } from 'lucide-react';
import { useState } from 'react';
import { ActivityPlayer, DoneScreen, Reflection } from '../components/activity/ActivityPlayer';
import { NotSureFlow } from '../components/NotSureFlow';
import { Shell } from '../components/shell/Shell';
import { PageHeader } from '../components/ui/core';
import { saveCheckin } from '../components/wellbeing';
import { activityById } from '../data/activities';
import type { StepAnswers } from '../lib/model';

/** The not-sure flow's simple feelings, mapped onto the main feeling list for My Progress. */
const toMainFeeling: Record<string, string> = {
  good: 'happy',
  okay: 'okay',
  worried: 'worried',
  low: 'sad',
  angry: 'angry',
  overwhelmed: 'overwhelmed',
  tired: 'tired',
  unsure: 'not-sure',
};

export default function NotSurePage() {
  return (
    <Shell section="wellbeing">
      <NotSure />
    </Shell>
  );
}

function NotSure() {
  const [stage, setStage] = useState<'flow' | 'play' | 'reflect' | 'done'>('flow');
  const [choice, setChoice] = useState<{ activityId: string; needId: string; feeling: string }>();
  const [answers, setAnswers] = useState<StepAnswers>({});
  const [saving, setSaving] = useState(false);

  return (
    <>
      {stage === 'flow' && (
        <>
          <PageHeader icon={CircleHelp} title="I’m not sure what I need" subtitle="That’s okay. Let’s figure it out." section="wellbeing" back={{ href: '/wellbeing', label: 'Health & Well-being' }} />
          <NotSureFlow
            onChoose={(activityId, needId, feeling) => {
              setChoice({ activityId, needId, feeling });
              setStage('play');
            }}
          />
        </>
      )}
      {stage === 'play' && choice && (
        <ActivityPlayer
          activity={activityById(choice.activityId)!}
          onBack={() => setStage('flow')}
          onFinish={(a) => {
            setAnswers(a);
            setStage('reflect');
          }}
        />
      )}
      {stage === 'reflect' && choice && (
        <Reflection
          saving={saving}
          onSave={async (r) => {
            setSaving(true);
            const ok = await saveCheckin({
              source: 'not-sure',
              feeling: toMainFeeling[choice.feeling],
              needs: ['not-sure', choice.needId],
              activityId: choice.activityId,
              answers,
              ...r,
            });
            setSaving(false);
            if (ok) setStage('done');
          }}
        />
      )}
      {stage === 'done' && <DoneScreen message="You figured out something that helps. That’s a great skill!" />}
    </>
  );
}
