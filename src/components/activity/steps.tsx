import { Check, Ear, Eye, Flower2, Hand, Heart, AudioWaveform, CircleCheck, CloudRain, Eraser, Mic, Moon, Palette, PenLine, Play, Pause, RotateCcw, Save, Square, Timer, VolumeX, Waves, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Step } from '../../data/types';
import { celebrate, tapSound, toast } from '../../lib/feedback';
import { withChild } from '../../lib/hooks';
import { Button, ChoiceCard, TextArea } from '../ui/core';
import { SpeakButton } from '../ui/SpeakButton';
import { cx } from '../ui/tone';
import { AmbientPlayer, type Ambient } from './ambient';

export type Answer = string | string[] | undefined;

export interface StepProps<T extends Step['type']> {
  step: Extract<Step, { type: T }>;
  value: Answer;
  onChange: (v: Answer) => void;
  onDone: () => void;
}

/** Text the auto-read setting speaks when a step appears. */
export function stepPrompt(step: Step): string {
  switch (step.type) {
    case 'info':
      return step.speak ?? step.text;
    case 'breathing':
      return 'Let’s breathe slowly together. Press start when you are ready.';
    case 'grounding':
      return 'Let’s notice things around you, one sense at a time.';
    case 'timer':
      return step.label;
    case 'sound':
    case 'choose':
    case 'prompt':
    case 'sentence':
    case 'list':
    case 'checklist':
    case 'express':
    case 'voice':
      return step.prompt;
  }
}

function Prompt({ text }: { text: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <h2 className="flex-1 text-2xl font-bold sm:text-3xl">{text}</h2>
      <SpeakButton text={text} scope />
    </div>
  );
}

/* ---------- info ---------- */

export function InfoStep({ step }: StepProps<'info'>) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      {step.emoji && (
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="text-8xl" aria-hidden="true">
          {step.emoji}
        </motion.div>
      )}
      <div className="mt-6 flex max-w-xl items-start gap-3">
        <p className="flex-1 font-display text-2xl font-semibold leading-snug sm:text-3xl">{step.text}</p>
        <SpeakButton text={step.speak ?? step.text} />
      </div>
    </div>
  );
}

/* ---------- breathing ---------- */

export function BreathingStep({ step, onDone }: StepProps<'breathing'>) {
  const phases = [
    { label: 'Breathe in', secs: step.inhale, scale: 1.55 },
    { label: 'Hold', secs: step.hold, scale: 1.55 },
    { label: 'Breathe out', secs: step.exhale, scale: 1 },
  ].filter((p) => p.secs > 0);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(phases[0].secs);
  const finished = round >= step.rounds;

  useEffect(() => {
    if (!running || finished) return;
    const t = window.setTimeout(() => {
      if (count > 1) return setCount(count - 1);
      const next = phase + 1;
      if (next < phases.length) {
        setPhase(next);
        setCount(phases[next].secs);
      } else {
        const r = round + 1;
        setRound(r);
        setPhase(0);
        setCount(phases[0].secs);
        if (r >= step.rounds) {
          setRunning(false);
          onDone();
        }
      }
    }, 1000);
    return () => window.clearTimeout(t);
  }, [running, count, phase, round, finished]);

  const current = phases[phase];
  return (
    <div className="keep-motion flex flex-col items-center py-4 text-center">
      <Prompt text={finished ? 'Well done. Notice how your body feels.' : 'Breathe slowly with the bubble'} />
      <div className="relative grid size-72 place-items-center">
        <motion.div
          className="absolute size-40 rounded-full opacity-90"
          style={{ background: 'var(--grad-wellbeing)', boxShadow: '0 0 80px -10px var(--violet)' }}
          animate={{ scale: running ? current.scale : 1 }}
          transition={{ duration: running ? current.secs : 0.6, ease: 'easeInOut' }}
        />
        <div className="relative text-white">
          <div className="font-display text-2xl font-bold drop-shadow" aria-live="polite">
            {finished ? 'Well done' : running ? current.label : 'Ready?'}
          </div>
          {running && <div className="font-display text-5xl font-bold drop-shadow">{count}</div>}
        </div>
      </div>
      <p className="mt-2 font-semibold text-ink-soft">
        Breath {Math.min(round + 1, step.rounds)} of {step.rounds}
      </p>
      {!finished && (
        <Button className="mt-4" size="lg" tone="violet" onClick={() => setRunning(!running)} icon={running ? Pause : Play}>
          {running ? 'Pause' : round > 0 || phase > 0 ? 'Keep going' : 'Start'}
        </Button>
      )}
    </div>
  );
}

/* ---------- 5-4-3-2-1 grounding ---------- */

const senses = [
  { n: 5, icon: Eye, prompt: 'Look around. Find 5 things you can see.' },
  { n: 4, icon: Hand, prompt: 'Find 4 things you can touch.' },
  { n: 3, icon: Ear, prompt: 'Listen. Find 3 things you can hear.' },
  { n: 2, icon: Flower2, prompt: 'Find 2 things you can smell.' },
  { n: 1, icon: Heart, prompt: 'Think of 1 thing you like.' },
];

export function GroundingStep({ onDone }: StepProps<'grounding'>) {
  const [sense, setSense] = useState(0);
  const [found, setFound] = useState(0);
  const done = sense >= senses.length;
  const s = senses[Math.min(sense, senses.length - 1)];

  const tap = () => {
    tapSound();
    const next = found + 1;
    setFound(next);
    if (next === s.n)
      window.setTimeout(() => {
        setSense(sense + 1);
        setFound(0);
        if (sense + 1 >= senses.length) onDone();
      }, 450);
  };

  if (done)
    return (
      <div className="py-10 text-center">
        <CircleCheck aria-hidden="true" className="mx-auto mb-4 size-20 text-mint" strokeWidth={1.75} />
        <Prompt text="You did it! You noticed the world around you." />
      </div>
    );
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-2 flex gap-1" aria-hidden="true">
        {senses.map((x, i) => (
          <span key={x.n} className={cx('h-2 w-8 rounded-full', i < sense ? 'bg-mint' : i === sense ? 'bg-violet' : 'bg-line')} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sense} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="w-full">
          <s.icon aria-hidden="true" className="mx-auto my-4 size-16 text-violet" strokeWidth={1.75} />
          <Prompt text={s.prompt} />
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: s.n }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={tap}
                disabled={i !== found}
                aria-label={i < found ? `Found ${i + 1}` : `Tap when you find number ${i + 1}`}
                className={cx(
                  'grid size-18 place-items-center rounded-full border-4 font-display text-2xl font-bold transition',
                  i < found ? 'scale-95 border-mint bg-mint text-white' : i === found ? 'animate-pulse border-violet bg-violet-soft text-violet-ink' : 'border-line text-ink-soft',
                )}
              >
                {i < found ? <Check aria-hidden="true" className="size-7" strokeWidth={3} /> : i + 1}
              </button>
            ))}
          </div>
          <p className="mt-4 text-ink-soft">Tap a circle each time you find one.</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------- timer (also used by sound & express) ---------- */

function useCountdown(seconds: number, onFinish?: () => void) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      setRunning(false);
      onFinish?.();
      return;
    }
    const t = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => window.clearTimeout(t);
  }, [running, left]);
  return { left, running, start: () => setRunning(true), pause: () => setRunning(false), reset: () => (setRunning(false), setLeft(seconds)) };
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function Ring({ fraction, children, size = 240 }: { fraction: number; children: React.ReactNode; size?: number }) {
  const r = 100;
  const c = 2 * Math.PI * r;
  return (
    <div className="keep-motion relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 220 220" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a855f7" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle cx="110" cy="110" r={r} fill="none" stroke="var(--line)" strokeWidth="14" />
        <circle
          cx="110"
          cy="110"
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - fraction)}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="relative text-center">{children}</div>
    </div>
  );
}

export function TimerStep({ step, onDone }: StepProps<'timer'>) {
  const t = useCountdown(step.seconds, () => {
    onDone();
    void celebrate();
  });
  const finished = t.left <= 0;
  return (
    <div className="flex flex-col items-center text-center">
      <Prompt text={step.label} />
      <Ring fraction={(step.seconds - t.left) / step.seconds}>
        {finished ? <CircleCheck aria-hidden="true" className="mx-auto size-10 text-mint" /> : <Timer aria-hidden="true" className="mx-auto size-10 text-violet" />}
        <div className="font-display text-5xl font-bold tabular-nums" role="timer" aria-live="off">
          {fmt(t.left)}
        </div>
      </Ring>
      {finished ? (
        <p className="mt-4 font-display text-xl font-semibold text-mint-ink">Time’s up. Great job!</p>
      ) : (
        <div className="mt-6 flex gap-3">
          <Button size="lg" onClick={t.running ? t.pause : t.start} icon={t.running ? Pause : Play}>
            {t.running ? 'Pause' : t.left < step.seconds ? 'Continue' : 'Start'}
          </Button>
          {t.left < step.seconds && (
            <Button size="lg" variant="ghost" onClick={t.reset} icon={RotateCcw}>
              Restart
            </Button>
          )}
        </div>
      )}
      {step.optional && !finished && <p className="mt-3 text-sm text-ink-soft">The timer is optional. You can tap Next any time.</p>}
    </div>
  );
}

/* ---------- choose ---------- */

export function ChooseStep({ step, value, onChange }: StepProps<'choose'>) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const toggle = (label: string) => {
    tapSound();
    if (!step.multi) return onChange(label);
    if (selected.includes(label)) onChange(selected.filter((s) => s !== label));
    else if (!step.max || selected.length < step.max) onChange([...selected, label]);
    else toast(`You can choose up to ${step.max}.`);
  };
  return (
    <div>
      <Prompt text={step.prompt} />
      {step.multi && step.max && <p className="-mt-3 mb-4 text-ink-soft">Choose up to {step.max}.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {step.options.map((o, i) => (
          <ChoiceCard key={o.label} emoji={o.emoji} label={o.label} index={i} selected={selected.includes(o.label)} onClick={() => toggle(o.label)} role={step.multi ? 'checkbox' : 'radio'} />
        ))}
      </div>
    </div>
  );
}

/* ---------- prompt ---------- */

export function PromptStep({ step, value, onChange }: StepProps<'prompt'>) {
  return (
    <div>
      <Prompt text={step.prompt} />
      <TextArea label={step.prompt} value={(value as string) ?? ''} onChange={onChange} placeholder={step.placeholder ?? 'Type here… or skip if you prefer.'} />
      <p className="mt-2 text-sm text-ink-soft">Spelling doesn’t matter. Only your family account can see this.</p>
    </div>
  );
}

/* ---------- sentence (fill the blanks) ---------- */

export function SentenceStep({ step, value, onChange }: StepProps<'sentence'>) {
  const parts = step.template.split('___');
  const blanks = Array.isArray(value) ? value : Array(parts.length - 1).fill('');
  const full = parts.map((p, i) => p + (i < blanks.length ? blanks[i] || '…' : '')).join('');
  return (
    <div>
      <Prompt text={step.prompt} />
      <div className="card p-5 font-display text-2xl font-semibold leading-relaxed sm:text-3xl">
        {parts.map((p, i) => (
          <span key={i}>
            {p}
            {i < parts.length - 1 && (
              <input
                aria-label={`Blank ${i + 1}`}
                value={blanks[i] ?? ''}
                onChange={(e) => {
                  const next = [...blanks];
                  next[i] = e.target.value;
                  onChange(next);
                }}
                className="mx-1 my-1 inline-block w-48 max-w-full rounded-xl border-b-4 border-violet bg-violet-soft px-3 py-1 text-violet-ink outline-none focus:bg-surface"
                placeholder="…"
                maxLength={120}
              />
            )}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SpeakButton text={full} label="Say my sentence aloud" force size="lg" />
        <span className="font-semibold text-ink-soft">Tap to hear your sentence. You can practise saying it too!</span>
      </div>
    </div>
  );
}

/* ---------- list ---------- */

export function ListStep({ step, value, onChange }: StepProps<'list'>) {
  const items = Array.isArray(value) ? value : Array(step.count).fill('');
  return (
    <div>
      <Prompt text={step.prompt} />
      <ol className="grid gap-3">
        {Array.from({ length: step.count }, (_, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold text-white" style={{ background: 'var(--grad-wellbeing)' }}>
              {i + 1}
            </span>
            <input
              aria-label={`${step.placeholder ?? 'Item'} ${i + 1}`}
              value={items[i] ?? ''}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              placeholder={step.placeholder ? `${step.placeholder}${step.placeholder.startsWith('e.g.') ? '' : ` ${i + 1}`}` : ''}
              maxLength={120}
              className="min-h-14 w-full rounded-2xl border-2 border-line bg-surface px-4 text-lg outline-none focus:border-violet"
            />
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- checklist ---------- */

export function ChecklistStep({ step, value, onChange }: StepProps<'checklist'>) {
  const checked = Array.isArray(value) ? value : [];
  return (
    <div>
      <Prompt text={step.prompt} />
      <div className="grid gap-3">
        {step.items.map((item, i) => (
          <ChoiceCard
            key={item.label}
            layout="row"
            emoji={item.emoji}
            label={item.label}
            index={i}
            role="checkbox"
            tone="teal"
            selected={checked.includes(item.label)}
            onClick={() => onChange(checked.includes(item.label) ? checked.filter((c) => c !== item.label) : [...checked, item.label])}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- express: write or draw ---------- */

export function ExpressStep({ step, value, onChange }: StepProps<'express'>) {
  const [mode, setMode] = useState<'write' | 'draw'>('write');
  const t = useCountdown(step.seconds ?? 0);
  return (
    <div>
      <Prompt text={step.prompt} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Write or draw" className="flex rounded-2xl bg-bg-2 p-1">
          {(['write', 'draw'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cx('min-h-11 rounded-xl px-5 font-semibold transition', mode === m ? 'bg-surface shadow-sm' : 'text-ink-soft')}
            >
              <span className="flex items-center gap-2">
                {m === 'write' ? <PenLine aria-hidden="true" className="size-4.5" /> : <Palette aria-hidden="true" className="size-4.5" />}
                {m === 'write' ? 'Write' : 'Draw'}
              </span>
            </button>
          ))}
        </div>
        {step.seconds && (
          <button type="button" onClick={t.running ? t.pause : t.start} className="ml-auto flex min-h-11 items-center gap-2 rounded-2xl bg-violet-soft px-4 font-semibold text-violet-ink">
            <Timer aria-hidden="true" className="size-4.5" />
            <span className="tabular-nums">{t.left > 0 ? fmt(t.left) : 'Done!'}</span>
            {t.left > 0 && (t.running ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />)}
          </button>
        )}
      </div>
      {mode === 'write' ? (
        <TextArea label="Write freely" rows={7} value={(value as string) ?? ''} onChange={onChange} placeholder="Let it all out. Nobody is marking this." maxLength={3000} />
      ) : (
        <DrawPad />
      )}
    </div>
  );
}

const PEN_COLORS = ['#7c3aed', '#ec4899', '#f97316', '#eab308', '#10b981', '#0ea5e9', '#1f2937'];

function DrawPad() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(PEN_COLORS[0]);
  const [size, setSize] = useState(6);

  useEffect(() => {
    const c = canvas.current!;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.clientWidth * ratio;
    c.height = c.clientHeight * ratio;
    const ctx = c.getContext('2d')!;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };

  return (
    <div>
      <canvas
        ref={canvas}
        aria-label="Drawing area"
        className="h-80 w-full touch-none rounded-3xl border-2 border-line bg-white"
        onPointerDown={(e) => {
          drawing.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          const ctx = e.currentTarget.getContext('2d')!;
          const [x, y] = point(e);
          ctx.strokeStyle = color;
          ctx.lineWidth = size;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 0.1, y + 0.1);
          ctx.stroke();
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = e.currentTarget.getContext('2d')!;
          const [x, y] = point(e);
          ctx.lineTo(x, y);
          ctx.stroke();
        }}
        onPointerUp={() => (drawing.current = false)}
        onPointerCancel={() => (drawing.current = false)}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {PEN_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Pen colour ${c}`}
            aria-pressed={color === c}
            className={cx('size-10 rounded-full border-2 border-white shadow transition', color === c && 'scale-125 ring-2 ring-ink')}
            style={{ background: c }}
          />
        ))}
        <div className="ml-2 flex gap-1">
          {[4, 8, 16].map((s) => (
            <button key={s} type="button" onClick={() => setSize(s)} aria-label={`Brush size ${s}`} aria-pressed={size === s} className={cx('grid size-10 place-items-center rounded-xl', size === s ? 'bg-violet-soft' : 'bg-bg-2')}>
              <span className="rounded-full bg-ink" style={{ width: s, height: s }} />
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          className="ml-auto"
          icon={Eraser}
          onClick={() => {
            const c = canvas.current!;
            c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
          }}
        >
          Clear
        </Button>
      </div>
      <p className="mt-2 text-sm text-ink-soft">Drawings are not saved. They’re just for you, right now.</p>
    </div>
  );
}

/* ---------- voice note ---------- */

function pickMime() {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const m of ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']) if (MediaRecorder.isTypeSupported(m)) return m;
  return '';
}

export function VoiceStep({ step, onChange, onDone }: StepProps<'voice'>) {
  const [state, setState] = useState<'idle' | 'recording' | 'recorded' | 'saved' | 'denied' | 'unsupported'>(
    typeof navigator !== 'undefined' && navigator.mediaDevices && typeof MediaRecorder !== 'undefined' ? 'idle' : 'unsupported',
  );
  const [secs, setSecs] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : ''), [blob]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  useEffect(() => () => recorder.current?.stream.getTracks().forEach((t) => t.stop()), []);
  useEffect(() => {
    if (state !== 'recording') return;
    if (secs >= step.maxSeconds) {
      recorder.current?.stop();
      return;
    }
    const t = window.setTimeout(() => setSecs((s) => s + 1), 1000);
    return () => window.clearTimeout(t);
  }, [state, secs]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMime();
      const rec = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 24000 });
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setBlob(new Blob(chunks.current, { type: rec.mimeType || 'audio/webm' }));
        setState('recorded');
      };
      recorder.current = rec;
      rec.start();
      setSecs(0);
      setState('recording');
    } catch {
      setState('denied');
    }
  };

  const save = async () => {
    if (!blob) return;
    setSaving(true);
    try {
      await withChild((repo, id) => repo.addVoiceNote(id, { audio: blob, durationSec: Math.max(1, secs), mimeType: blob.type }));
      setState('saved');
      onChange('saved');
      onDone();
      toast('Voice note saved');
    } catch (e) {
      console.error(e);
      toast('Could not save the voice note', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <Prompt text={step.prompt} />
      {state === 'unsupported' && <p className="rounded-2xl bg-sun-soft p-4 text-sun-ink">Voice recording isn’t available on this device. You could try “Get It Out” and write instead.</p>}
      {state === 'denied' && <p className="rounded-2xl bg-sun-soft p-4 text-sun-ink">MindMate needs permission to use the microphone. Ask a grown-up to allow it, then try again.</p>}
      {(state === 'idle' || state === 'recording' || state === 'denied') && (
        <button
          type="button"
          onClick={state === 'recording' ? () => recorder.current?.stop() : start}
          aria-label={state === 'recording' ? 'Stop recording' : 'Start recording'}
          className={cx(
            'mt-4 grid size-36 place-items-center rounded-full text-white shadow-pop transition active:scale-95',
            state === 'recording' ? 'animate-pulse bg-coral' : '',
          )}
          style={state === 'recording' ? undefined : { background: 'var(--grad-talk)' }}
        >
          {state === 'recording' ? <Square aria-hidden="true" className="size-12 fill-current" /> : <Mic aria-hidden="true" className="size-14" strokeWidth={2} />}
        </button>
      )}
      {state === 'recording' && (
        <p className="mt-4 font-display text-2xl font-bold tabular-nums" aria-live="polite">
          Recording… {fmt(secs)} / {fmt(step.maxSeconds)}
        </p>
      )}
      {(state === 'recorded' || state === 'saved') && (
        <div className="mt-2 w-full max-w-md">
          <audio controls src={url} className="w-full" />
          {state === 'recorded' ? (
            <div className="mt-4 flex justify-center gap-3">
              <Button onClick={save} disabled={saving} icon={Save} size="lg">
                {saving ? 'Saving…' : 'Keep it'}
              </Button>
              <Button variant="ghost" onClick={() => (setBlob(null), setState('idle'))} icon={RotateCcw} size="lg">
                Record again
              </Button>
            </div>
          ) : (
            <p className="mt-4 flex items-center justify-center gap-2 font-semibold text-mint-ink"><CircleCheck aria-hidden="true" className="size-5" /> Saved. You can listen to it in My Progress.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- sound (calm corner) ---------- */

export function SoundStep({ step, onDone }: StepProps<'sound'>) {
  const [kind, setKind] = useState<Ambient | 'silence'>('silence');
  const player = useRef<AmbientPlayer | null>(null);
  const t = useCountdown(step.seconds, () => {
    player.current?.stop();
    onDone();
  });
  useEffect(() => () => player.current?.stop(), []);
  useEffect(() => {
    player.current ??= new AmbientPlayer();
    if (kind === 'silence' || !t.running) player.current.stop();
    else player.current.play(kind);
  }, [kind, t.running]);

  const sounds: { id: Ambient | 'silence'; label: string; icon: LucideIcon }[] = [
    { id: 'rain', label: 'Rain', icon: CloudRain },
    { id: 'waves', label: 'Waves', icon: Waves },
    { id: 'hum', label: 'Soft hum', icon: AudioWaveform },
    { id: 'silence', label: 'Silence', icon: VolumeX },
  ];
  return (
    <div className="flex flex-col items-center text-center">
      <Prompt text={step.prompt} />
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {sounds.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={kind === s.id}
            onClick={() => setKind(s.id)}
            className={cx('flex min-h-12 items-center gap-2 rounded-full border-2 px-4 font-semibold transition', kind === s.id ? 'border-transparent bg-sky text-white' : 'border-line bg-surface')}
          >
            <s.icon aria-hidden="true" className="size-5" />
            {s.label}
          </button>
        ))}
      </div>
      <Ring fraction={(step.seconds - t.left) / step.seconds}>
        {t.left <= 0 ? <CircleCheck aria-hidden="true" className="mx-auto size-10 text-mint" /> : <Moon aria-hidden="true" className="mx-auto size-10 text-sky" />}
        <div className="font-display text-5xl font-bold tabular-nums">{fmt(t.left)}</div>
      </Ring>
      {t.left > 0 && (
        <Button className="mt-6" size="lg" tone="sky" onClick={t.running ? t.pause : t.start} icon={t.running ? Pause : Play}>
          {t.running ? 'Pause' : 'Start quiet time'}
        </Button>
      )}
    </div>
  );
}
