import { ArrowLeft, Eraser, Lock, LogOut, Pencil, Plus, Trash2, Wand2 } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ProfileEditor } from '../components/ProfileEditor';
import { Shell } from '../components/shell/Shell';
import { Button, Field, PageHeader, Sheet, Spinner } from '../components/ui/core';
import { cx, tones } from '../components/ui/tone';
import type { Tone } from '../data/types';
import { seedDemoData } from '../lib/demo';
import { toast } from '../lib/feedback';
import type { Child } from '../lib/model';
import { LocalRepo } from '../lib/repo/local';
import { $child, $childId, $exhibition, $session, go, repoFor, signOutEverywhere } from '../lib/session';

export default function GrownUpsPage() {
  return (
    <Shell section="settings" requireChild={false}>
      <Gate>
        <GrownUps />
      </Gate>
    </Shell>
  );
}

/** A simple grown-up check so younger children don't wander in by accident. */
function Gate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(() => sessionStorage.getItem('mm:grownup') === '1');
  const [a, b] = useMemo(() => [6 + Math.floor(Math.random() * 7), 4 + Math.floor(Math.random() * 6)], []);
  const [answer, setAnswer] = useState('');
  const [wrong, setWrong] = useState(false);
  if (ok) return <>{children}</>;
  return (
    <div className="mx-auto max-w-md py-8 text-center">
      <Lock aria-hidden="true" className="mx-auto size-14 text-violet" strokeWidth={1.75} />
      <h1 className="mt-3 text-3xl font-bold">For grown-ups</h1>
      <p className="mt-2 text-ink-soft">Please answer to continue.</p>
      <form
        className="mt-6 grid gap-4 text-left"
        onSubmit={(e) => {
          e.preventDefault();
          if (Number(answer) === a * b) {
            sessionStorage.setItem('mm:grownup', '1');
            setOk(true);
          } else setWrong(true);
        }}
      >
        <Field label={`What is ${a} × ${b}?`} inputMode="numeric" value={answer} onChange={(e) => (setAnswer(e.target.value), setWrong(false))} autoFocus />
        {wrong && <p role="alert" className="font-semibold text-coral-ink">That’s not quite right. Try again.</p>}
        <Button type="submit" size="lg" block>
          Continue
        </Button>
        <Button variant="ghost" href="/home" block icon={ArrowLeft}>
          Go back
        </Button>
      </form>
    </div>
  );
}

function GrownUps() {
  const session = useStore($session);
  const exhibition = useStore($exhibition) === '1';
  const [children, setChildren] = useState<Child[] | null>(null);
  const [editing, setEditing] = useState<Child | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () =>
    void repoFor(session)
      .then((r) => r.listChildren())
      .then(setChildren);
  useEffect(load, [session]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      console.error(e);
      toast('Something went wrong. Please try again.', 'error');
    } finally {
      setBusy(null);
    }
  };

  if (!children) return <Spinner />;
  return (
    <div className="grid gap-6">
      <PageHeader icon={Lock} title="Grown-ups" subtitle="Manage profiles, data and exhibition settings." section="settings" back={{ href: '/home', label: 'Home' }} />

      <Card title="Account">
        {session.status === 'user' ? (
          <p className="text-lg">
            Signed in as <strong>{session.name || session.email}</strong>
            <span className="block text-ink-soft">{session.email}</span>
          </p>
        ) : (
          <p className="text-lg">
            <strong>Guest mode.</strong> <span className="text-ink-soft">Everything is stored only in this browser. Create an account to keep progress across devices.</span>
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => void signOutEverywhere().then(() => go('/'))} icon={LogOut}>
            {session.status === 'guest' ? 'Leave guest mode' : 'Sign out'}
          </Button>
          {session.status === 'guest' && (
            <Button
              variant="soft"
              tone="coral"
              icon={Eraser}
              disabled={busy === 'reset'}
              onClick={() =>
                window.confirm('Delete all guest profiles and data on this device?') &&
                void run('reset', async () => {
                  await LocalRepo.clearAll();
                  $childId.set('');
                  $child.set(null);
                  go('/profiles');
                })
              }
            >
              Reset guest data
            </Button>
          )}
        </div>
      </Card>

      <Card title="Profiles">
        <ul className="grid gap-3">
          {children.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-bg-2 p-3">
              <span className={cx('grid size-14 place-items-center rounded-full text-3xl', tones[c.color as Tone]?.soft)} aria-hidden="true">
                {c.avatar}
              </span>
              <span className="flex-1 font-display text-lg font-semibold">{c.name}</span>
              <Button variant="ghost" onClick={() => setEditing(c)} icon={Pencil}>
                Edit
              </Button>
              <Button
                variant="ghost"
                icon={Wand2}
                disabled={busy === `demo-${c.id}`}
                onClick={() =>
                  window.confirm(`Add 3 weeks of sample check-ins to ${c.name}? Useful for demos.`) &&
                  void run(`demo-${c.id}`, async () => {
                    await seedDemoData(await repoFor(session), c.id);
                    toast(`Sample data added for ${c.name}`);
                  })
                }
              >
                {busy === `demo-${c.id}` ? 'Adding…' : 'Sample data'}
              </Button>
              <Button
                variant="ghost"
                icon={Trash2}
                disabled={busy === `del-${c.id}`}
                onClick={() =>
                  window.confirm(`Delete ${c.name}'s profile and ALL their check-ins, wins and voice notes? This cannot be undone.`) &&
                  void run(`del-${c.id}`, async () => {
                    await (await repoFor(session)).deleteChild(c.id);
                    if ($childId.get() === c.id) {
                      $childId.set('');
                      $child.set(null);
                    }
                    toast('Profile deleted');
                    load();
                  })
                }
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
        <Button variant="soft" href="/profiles" icon={Plus}>
          Add or switch profile
        </Button>
      </Card>

      <Card title="Exhibition mode">
        <p className="text-ink-soft">
          For a shared device at the exhibition: use <strong>Try without an account</strong>, then turn this on. After 2 minutes with nobody using it, MindMate asks “Are you still there?” and then clears guest data for the next visitor.
        </p>
        <label className="flex items-center gap-3 text-lg font-semibold">
          <input type="checkbox" checked={exhibition} onChange={(e) => $exhibition.set(e.target.checked ? '1' : '0')} className="size-6" style={{ accentColor: 'var(--violet)' }} />
          Exhibition mode {exhibition ? 'on' : 'off'}
        </label>
        {exhibition && session.status !== 'guest' && <p className="rounded-2xl bg-sun-soft p-3 text-sun-ink">Auto-reset only runs in guest mode, so a signed-in account is never wiped.</p>}
      </Card>

      <Card title="About MindMate">
        <ul className="grid list-disc gap-2 pl-5 text-ink-soft">
          <li>MindMate is a self-help and learning tool. It is not a medical, counselling or emergency service.</li>
          <li>Children’s data is stored only in this family account (or on this device in guest mode). Only a first name or nickname is kept for each profile.</li>
          <li>Check-ins never leave the account. Deleting a profile removes all of its data.</li>
          <li>If a child is in danger or at risk, contact a trusted adult, the school, or local emergency services straight away.</li>
        </ul>
      </Card>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title="Edit profile">
        {editing && (
          <ProfileEditor
            child={editing}
            onSaved={(c) => {
              if ($child.get()?.id === c.id) $child.set(c);
              setEditing(null);
              toast('Profile saved');
              load();
            }}
          />
        )}
      </Sheet>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card grid gap-4 p-5 sm:p-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
