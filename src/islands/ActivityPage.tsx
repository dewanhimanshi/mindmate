import { ArrowLeft, House } from 'lucide-react';
import { useState } from 'react';
import { ActivityPlayer, DoneScreen, Reflection } from '../components/activity/ActivityPlayer';
import { Shell } from '../components/shell/Shell';
import { saveCheckin } from '../components/wellbeing';
import { activityById } from '../data/activities';
import { needs } from '../data/needs';
import type { StepAnswers } from '../lib/model';

/** Standalone activity (from the hub, support pages or calm tools). */
export default function ActivityPage({ id, back }: { id: string; back?: string }) {
  return (
    <Shell section="wellbeing">
      <Play id={id} back={back} />
    </Shell>
  );
}

function Play({ id, back }: { id: string; back?: string }) {
  const activity = activityById(id)!;
  const need = needs.find((n) => n.activityIds.includes(id));
  const [stage, setStage] = useState<'play' | 'reflect' | 'done'>('play');
  const [answers, setAnswers] = useState<StepAnswers>({});
  const [saving, setSaving] = useState(false);
  const from = new URLSearchParams(window.location.search).get('from') ?? back ?? '/wellbeing';

  return (
    <>
      {stage === 'play' && (
        <ActivityPlayer
          activity={activity}
          onBack={() => window.location.assign(from)}
          onFinish={(a) => {
            setAnswers(a);
            setStage('reflect');
          }}
        />
      )}
      {stage === 'reflect' && (
        <Reflection
          saving={saving}
          onSave={async (r) => {
            setSaving(true);
            const ok = await saveCheckin({ source: 'activity', needs: need ? [need.id] : [], activityId: id, answers, ...r });
            setSaving(false);
            if (ok) setStage('done');
          }}
        />
      )}
      {stage === 'done' && (
        <DoneScreen
          message={`You finished “${activity.title}”. Every small step counts.`}
          actions={[
            { label: 'Back', href: from, icon: ArrowLeft },
            { label: 'Back to home', href: '/home', icon: House },
          ]}
        />
      )}
    </>
  );
}
