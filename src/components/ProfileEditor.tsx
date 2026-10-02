import { useState, type FormEvent } from 'react';
import { avatars, profileColors } from '../data/progress';
import type { Tone } from '../data/types';
import { defaultSettings, type Child } from '../lib/model';
import { currentRepo } from '../lib/session';
import { Button, Field } from './ui/core';
import { cx, tones } from './ui/tone';

/** Create or edit a child profile. Only a first name/nickname, avatar and colour are stored. */
export function ProfileEditor({ child, onSaved }: { child?: Child; onSaved: (c: Child) => void }) {
  const [name, setName] = useState(child?.name ?? '');
  const [avatar, setAvatar] = useState(child?.avatar ?? avatars[0]);
  const [color, setColor] = useState<string>(child?.color ?? profileColors[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please type a name or nickname.');
      return;
    }
    setBusy(true);
    try {
      const repo = await currentRepo();
      if (child) {
        await repo.updateChild(child.id, { name: name.trim(), avatar, color });
        onSaved({ ...child, name: name.trim(), avatar, color });
      } else {
        onSaved(await repo.createChild({ name: name.trim(), avatar, color, settings: defaultSettings }));
      }
    } catch (err) {
      console.error(err);
      setError('Could not save. Please check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="flex justify-center">
        <span className={cx('grid size-24 place-items-center rounded-full text-6xl shadow-card', tones[color as Tone]?.soft)} aria-hidden="true">
          {avatar}
        </span>
      </div>
      <Field label="Name or nickname" value={name} maxLength={20} autoComplete="off" onChange={(e) => setName(e.target.value)} hint="First name only is perfect." />
      <fieldset>
        <legend className="mb-2 font-semibold">Pick a buddy</legend>
        <div className="grid grid-cols-6 gap-2">
          {avatars.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              aria-pressed={avatar === a}
              aria-label={`Avatar ${a}`}
              className={cx('grid aspect-square place-items-center rounded-2xl text-3xl transition', avatar === a ? 'scale-110 bg-violet-soft ring-3 ring-violet' : 'bg-bg-2 hover:scale-105')}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 font-semibold">Favourite colour</legend>
        <div className="flex flex-wrap gap-3">
          {profileColors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-pressed={color === c}
              aria-label={c}
              className={cx('size-11 rounded-full transition', tones[c].solid, color === c ? 'scale-110 ring-4 ring-offset-2 ring-offset-surface ' + tones[c].ring : '')}
            />
          ))}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="rounded-2xl bg-coral-soft p-3 font-semibold text-coral-ink">
          {error}
        </p>
      )}
      <Button type="submit" variant="gradient" size="lg" block disabled={busy}>
        {busy ? 'Saving…' : child ? 'Save changes' : 'Create profile'}
      </Button>
    </form>
  );
}
