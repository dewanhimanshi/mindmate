import { Settings as SettingsIcon } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { useEffect, useState, type ReactNode } from 'react';
import { Shell } from '../components/shell/Shell';
import { PageHeader } from '../components/ui/core';
import { SpeakButton } from '../components/ui/SpeakButton';
import { cx } from '../components/ui/tone';
import type { Settings, TextSize, ThemePref } from '../lib/model';
import { $child, settingsOf, updateChildSettings } from '../lib/session';
import { configureSpeech, listVoices, speak, speechSupported } from '../lib/speech';

export default function SettingsPage() {
  return (
    <Shell section="settings">
      <SettingsView />
    </Shell>
  );
}

function SettingsView() {
  const child = useStore($child)!;
  const s = settingsOf(child);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    void listVoices().then(setVoices);
  }, []);

  const set = (patch: Partial<Settings>) => void updateChildSettings(patch);

  return (
    <div className="grid gap-6">
      <PageHeader icon={SettingsIcon} title={`${child.name}’s settings`} subtitle="Make MindMate work the way you like." section="settings" back={{ href: '/home', label: 'Home' }} />

      <Group title="Read aloud">
        {!speechSupported() && <p className="rounded-2xl bg-sun-soft p-3 text-sun-ink">This browser can’t read aloud. Try Chrome, Edge or Safari.</p>}
        <Toggle label="Show read-aloud buttons" hint="A speaker button appears next to questions and cards." checked={s.tts} onChange={(v) => set({ tts: v })} />
        <Toggle label="Read questions automatically" hint="Each new question is read out when it appears." checked={s.autoRead} onChange={(v) => set({ autoRead: v })} />
        <Row label="Voice speed">
          <Segmented
            value={String(s.rate)}
            options={[
              ['0.75', 'Slow'],
              ['0.95', 'Normal'],
              ['1.15', 'Fast'],
            ]}
            onChange={(v) => {
              set({ rate: Number(v) });
              configureSpeech({ rate: Number(v) });
              void speak('This is how fast I will talk.');
            }}
          />
        </Row>
        {voices.length > 0 && (
          <Row label="Voice">
            <select
              value={s.voiceURI ?? ''}
              onChange={(e) => {
                set({ voiceURI: e.target.value || undefined });
                configureSpeech({ voiceURI: e.target.value || undefined });
                void speak(`Hi ${child.name}! This is my voice.`);
              }}
              className="min-h-12 w-full rounded-2xl border-2 border-line bg-surface px-3 font-semibold sm:w-72"
            >
              <option value="">Automatic (Indian English if available)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </Row>
        )}
        <div className="flex items-center gap-3">
          <SpeakButton text={`Hi ${child.name}! I can read MindMate out loud for you.`} force size="lg" label="Test the voice" />
          <span className="font-semibold text-ink-soft">Test the voice</span>
        </div>
      </Group>

      <Group title="Text and colours">
        <Row label="Text size">
          <Segmented
            value={s.textSize}
            options={[
              ['s', 'A'],
              ['m', 'A+'],
              ['l', 'A++'],
              ['xl', 'A+++'],
            ]}
            onChange={(v) => set({ textSize: v as TextSize })}
          />
        </Row>
        <Row label="Theme">
          <Segmented
            value={s.theme}
            options={[
              ['system', 'Auto'],
              ['light', 'Light'],
              ['dark', 'Dark'],
            ]}
            onChange={(v) => set({ theme: v as ThemePref })}
          />
        </Row>
        <Toggle label="High contrast" hint="Black and white with strong outlines. Easier to see." checked={s.contrast === 'high'} onChange={(v) => set({ contrast: v ? 'high' : 'normal' })} />
      </Group>

      <Group title="Calm and sounds">
        <Toggle label="Calm mode" hint="Turns off confetti, bouncing and moving animations." checked={s.calmMode} onChange={(v) => set({ calmMode: v })} />
        <Toggle label="Gentle sounds" hint="A soft chime when you finish something." checked={s.sounds} onChange={(v) => set({ sounds: v })} />
      </Group>
      <p className="text-center text-sm text-ink-soft">Settings are saved for {child.name} and follow them on any device they sign in on.</p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card grid gap-5 p-5 sm:p-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-lg font-semibold">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-4">
      <span className="flex-1">
        <span className="block text-lg font-semibold">{label}</span>
        {hint && <span className="block text-ink-soft">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" aria-label={label} checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={cx(
          'relative h-9 w-16 shrink-0 rounded-full transition peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]',
          checked ? 'bg-violet' : 'bg-line',
        )}
      >
        <span className={cx('absolute top-1 size-7 rounded-full bg-white shadow transition-all', checked ? 'left-8' : 'left-1')} />
      </span>
    </label>
  );
}

function Segmented({ value, options, onChange }: { value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-1 rounded-2xl bg-bg-2 p-1">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cx('min-h-11 rounded-xl px-4 font-semibold transition', value === v ? 'bg-surface shadow-sm' : 'text-ink-soft')}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
