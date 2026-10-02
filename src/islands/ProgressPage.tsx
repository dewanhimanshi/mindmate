import { Accessibility, Brain, CalendarDays, ChevronDown, CircleCheck, Lightbulb, Mic, NotebookPen, Puzzle, Save, Sparkles, Sprout, Star, Trash2, X } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Shell } from '../components/shell/Shell';
import { Button, Chip, EmptyState, PageHeader, SectionTitle, Spinner, TextArea } from '../components/ui/core';
import { SpeakButton } from '../components/ui/SpeakButton';
import { cx } from '../components/ui/tone';
import { activityById } from '../data/activities';
import { feelingAfter, feelingById, helpfulness } from '../data/feelings';
import { needById } from '../data/needs';
import { strengths, winCategories, winExamples } from '../data/progress';
import { celebrate, toast } from '../lib/feedback';
import { useChildQuery, withChild } from '../lib/hooks';
import { DAY, feelingCounts, helpedSummary, insights, lastSevenDays, needCounts, startOfDay, type Count } from '../lib/insights';
import type { ActivityLog, Checkin, VoiceNote } from '../lib/model';
import { $child, updateChild } from '../lib/session';

export default function ProgressPage() {
  return (
    <Shell section="progress">
      <Progress />
    </Shell>
  );
}

interface Data {
  checkins: Checkin[];
  logs: ActivityLog[];
}

function Progress() {
  const { data, loading } = useChildQuery<Data>(async (repo, id) => {
    const since = Date.now() - 30 * DAY;
    const [checkins, logs] = await Promise.all([repo.listCheckins(id, since), repo.listActivityLogs(id, since)]);
    return { checkins, logs };
  });

  useEffect(() => {
    // Jump to #wins / #support after data renders.
    if (!loading && window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth' });
  }, [loading]);

  if (loading || !data) return <Spinner />;
  const week = data.checkins.filter((c) => c.createdAt >= startOfDay(Date.now()) - 6 * DAY);

  return (
    <div className="grid gap-12">
      <PageHeader icon={Star} title="My Progress" subtitle="No scores, no grades. Just a gentle look at how you’ve been looking after yourself." section="progress" />
      <WeekAtAGlance checkins={data.checkins} week={week} />
      <NeedsAndHelped week={week} month={data.checkins} />
      <SupportTried logs={data.logs} />
      <SmallWins />
      <Strengths />
      <VoiceNotes />
      <History checkins={data.checkins} />
    </div>
  );
}

/* ---------- Bars: one series, one hue, direct numeric labels ---------- */

function CountBars({ counts, label }: { counts: Count[]; label: string }) {
  const max = Math.max(...counts.map((c) => c.count), 1);
  return (
    <ul className="grid gap-3" aria-label={label}>
      {counts.slice(0, 8).map((c, i) => (
        <li key={c.id} className="grid grid-cols-[minmax(0,10.5rem)_1fr_2rem] items-center gap-3" title={`${c.label}: ${c.count}`}>
          <span className="flex items-center gap-2 font-semibold leading-tight">
            <span className="text-2xl" aria-hidden="true">{c.emoji}</span>
            {c.label}
          </span>
          <span className="h-4 rounded-full bg-bg-2" aria-hidden="true">
            <motion.span
              className="block h-full rounded-full bg-violet"
              initial={{ width: 0 }}
              animate={{ width: `${(c.count / max) * 100}%` }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 90, damping: 18 }}
            />
          </span>
          <span className="text-right font-display font-bold tabular-nums">
            {c.count}
            <span className="sr-only"> times</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- My week at a glance ---------- */

function WeekAtAGlance({ checkins, week }: { checkins: Checkin[]; week: Checkin[] }) {
  const days = lastSevenDays(checkins);
  const counts = feelingCounts(week);
  return (
    <section aria-labelledby="week">
      <div id="week">
        <SectionTitle title="My week at a glance" subtitle="How have I been feeling? Every feeling is okay." />
      </div>
      <div className="card p-5">
        <ol className="grid grid-cols-7 gap-2">
          {days.map((d, i) => {
            const f = d.feeling ? feelingById(d.feeling) : undefined;
            return (
              <motion.li
                key={d.start}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cx('flex flex-col items-center gap-1 rounded-2xl p-2 text-center', d.isToday ? 'bg-sun-soft' : 'bg-bg-2')}
              >
                <span className="text-xs font-bold uppercase text-ink-soft">{d.isToday ? 'Today' : d.label}</span>
                <span className="text-3xl" aria-hidden="true">{f?.emoji ?? '·'}</span>
                <span className="sr-only">{f ? f.label : 'No check-in'}</span>
                {d.checkins.length > 1 && <span className="text-xs font-semibold text-ink-soft">×{d.checkins.length}</span>}
              </motion.li>
            );
          })}
        </ol>
        <div className="mt-6">
          {counts.length ? (
            <>
              <h3 className="mb-3 font-display font-semibold text-ink-soft">Feelings I noticed most this week</h3>
              <CountBars counts={counts} label="Feelings this week" />
            </>
          ) : (
            <EmptyState icon={CalendarDays} text="No check-ins this week yet." action={<Button href="/wellbeing/check-in" icon={Brain}>Do a check-in</Button>} />
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- What did I need? / What helped me? ---------- */

const HELP_SHADES = ['bg-mint', 'bg-mint/55', 'bg-line'];

function NeedsAndHelped({ week, month }: { week: Checkin[]; month: Checkin[] }) {
  const needs = needCounts(week);
  const helped = helpedSummary(month);
  const notes = insights(month);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-5">
        <SectionTitle title="What did I need?" subtitle="The kinds of support I looked for this week." />
        {needs.length ? <CountBars counts={needs} label="Needs this week" /> : <EmptyState icon={Lightbulb} text="Your needs will appear here after a check-in." />}
      </section>
      <section className="card p-5">
        <SectionTitle title="What helped me?" subtitle="Things I tried this month and how much they helped." />
        {helped.length ? (
          <>
            <ul className="grid gap-4">
              {helped.map((h) => {
                const parts = [h.lot, h.little, h.none];
                const rated = parts.reduce((a, b) => a + b, 0);
                return (
                  <li key={h.type}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="font-semibold">
                        {h.label}
                      </span>
                      <span className="text-sm text-ink-soft">tried {h.tried}×</span>
                    </div>
                    {rated > 0 && (
                      <div className="flex h-4 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={`${h.lot} helped a lot, ${h.little} helped a little, ${h.none} didn’t help`}>
                        {parts.map((p, i) =>
                          p ? <span key={i} className={cx('h-full first:rounded-l-full last:rounded-r-full', HELP_SHADES[i])} style={{ flexGrow: p }} title={`${helpfulness[i].label}: ${p}`} /> : null,
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <ul className="mt-4 flex flex-wrap gap-4 text-sm text-ink-soft" aria-label="Legend">
              {helpfulness.map((o, i) => (
                <li key={o.label} className="flex items-center gap-1.5">
                  <span className={cx('size-3 rounded-full', HELP_SHADES[i])} aria-hidden="true" />
                  {o.label}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState icon={Sprout} text="Try an activity and rate it in your check-in to see what helps you." />
        )}
      </section>
      {notes.length > 0 && (
        <motion.section initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[2rem] p-6 lg:col-span-2" style={{ background: 'var(--grad-hero)' }}>
          <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Lightbulb aria-hidden="true" className="size-6 text-sun-ink" /> What you’re learning about yourself</h2>
          <ul className="mt-3 grid gap-2">
            {notes.map((n) => (
              <li key={n} className="flex items-center gap-3 rounded-2xl bg-surface p-4 font-display text-lg font-semibold shadow-sm" data-read>
                <Sparkles aria-hidden="true" className="size-5 shrink-0 text-violet" />
                <span className="flex-1">{n}</span>
                <SpeakButton text={n} size="sm" />
              </li>
            ))}
          </ul>
        </motion.section>
      )}
    </div>
  );
}

/* ---------- Everyday support tried ---------- */

const KIND_LABEL: Record<ActivityLog['kind'], string> = { strategy: 'Strategies', exercise: 'Exercise', calm: 'Calm & sensory', food: 'Food' };

function SupportTried({ logs }: { logs: ActivityLog[] }) {
  const grouped = useMemo(() => {
    const m = new Map<ActivityLog['kind'], Map<string, { label: string; emoji?: string; count: number }>>();
    for (const l of logs) {
      const kind = m.get(l.kind) ?? new Map();
      const row = kind.get(l.refId) ?? { label: l.label, emoji: l.emoji, count: 0 };
      row.count++;
      kind.set(l.refId, row);
      m.set(l.kind, kind);
    }
    return m;
  }, [logs]);
  return (
    <section id="support" className="scroll-mt-24">
      <SectionTitle title="Everyday support I tried" subtitle="Strategies, exercise and calm ideas from the last 30 days." />
      {logs.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...grouped.entries()].map(([kind, rows]) => (
            <div key={kind} className="card p-5">
              <h3 className="mb-3 font-display text-lg font-bold">{KIND_LABEL[kind]}</h3>
              <ul className="grid gap-2">
                {[...rows.values()]
                  .sort((a, b) => b.count - a.count)
                  .map((r) => (
                    <li key={r.label} className="flex items-center gap-3">
                      <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-teal" />
                      <span className="flex-1">{r.label}</span>
                      <span className="rounded-full bg-teal-soft px-2.5 py-0.5 text-sm font-bold text-teal-ink">{r.count}×</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Puzzle} text="When you tap “I tried this” on a strategy or activity, it shows up here." action={<Button href="/support" tone="teal" icon={Accessibility}>Everyday Support</Button>} />
      )}
    </section>
  );
}

/* ---------- Small wins ---------- */

function SmallWins() {
  const { data: wins, reload } = useChildQuery((repo, id) => repo.listWins(id));
  const [text, setText] = useState('');
  const [category, setCategory] = useState<string>();
  const [busy, setBusy] = useState(false);

  const add = async (t: string) => {
    if (!t.trim()) return;
    setBusy(true);
    try {
      await withChild((repo, id) => repo.addWin(id, { text: t.trim(), category }));
      setText('');
      reload();
      toast('Small win saved!');
      void celebrate();
    } catch {
      toast('Could not save. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="wins" className="scroll-mt-24">
      <SectionTitle title="My small wins" subtitle="Every small step counts. What went well today?" />
      <div className="card grid gap-4 p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void add(text);
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={200}
            aria-label="My small win today"
            placeholder="My small win today…"
            className="min-h-14 flex-1 rounded-2xl border-2 border-line bg-surface px-4 text-lg outline-none focus:border-sun"
          />
          <Button type="submit" tone="sun" size="lg" disabled={busy || !text.trim()} icon={Star}>
            Add win
          </Button>
        </form>
        <div className="flex flex-wrap gap-2" aria-label="Category">
          {winCategories.map((c) => (
            <Chip key={c.label} label={c.label} tone="sun" selected={category === c.label} onClick={() => setCategory(category === c.label ? undefined : c.label)} />
          ))}
        </div>
        <details className="rounded-2xl bg-bg-2 p-3">
          <summary className="min-h-11 cursor-pointer content-center font-semibold">Need an idea? Tap one to add it</summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {winExamples.map((w) => (
              <button key={w} type="button" onClick={() => void add(w)} className="min-h-11 rounded-full border-2 border-line bg-surface px-4 font-semibold hover:border-sun">
                {w}
              </button>
            ))}
          </div>
        </details>
        {wins && wins.length > 0 && (
          <ul className="grid gap-2">
            <AnimatePresence initial={false}>
              {wins.slice(0, 20).map((w) => (
                <motion.li
                  key={w.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: 40 }}
                  className="flex items-center gap-3 rounded-2xl bg-sun-soft p-3 text-sun-ink"
                >
                  <Star aria-hidden="true" className="size-5 shrink-0 fill-current" />
                  <span className="flex-1 font-semibold">{w.text}</span>
                  {w.category && <span className="hidden rounded-full bg-surface/70 px-2.5 py-0.5 text-xs font-bold sm:inline">{w.category}</span>}
                  <span className="text-xs">{new Date(w.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  <button
                    type="button"
                    aria-label={`Remove win: ${w.text}`}
                    onClick={async () => {
                      await withChild((repo, id) => repo.deleteWin(id, w.id));
                      reload();
                    }}
                    className="grid size-10 place-items-center rounded-full hover:bg-surface/60"
                  >
                    <X className="size-4.5" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </section>
  );
}

/* ---------- Strengths ---------- */

function Strengths() {
  const child = useStore($child)!;
  const [picked, setPicked] = useState<string[]>(child.strengths ?? []);
  const [proud, setProud] = useState(child.proudOf ?? '');
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(picked) !== JSON.stringify(child.strengths ?? []) || proud !== (child.proudOf ?? '');

  return (
    <section>
      <SectionTitle title="My strengths" subtitle="Tap the badges that describe you." />
      <div className="card grid gap-5 p-5">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {strengths.map((s, i) => {
            const on = picked.includes(s.label);
            return (
              <motion.button
                key={s.label}
                type="button"
                aria-pressed={on}
                onClick={() => setPicked(on ? picked.filter((p) => p !== s.label) : [...picked, s.label])}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className={cx(
                  'flex min-h-24 flex-col items-center justify-center gap-1 rounded-3xl border-2 p-2 text-center text-sm font-bold transition',
                  on ? 'border-transparent text-white shadow-card' : 'border-line bg-surface hover:-translate-y-0.5',
                )}
                style={on ? { background: 'var(--grad-progress)' } : undefined}
              >
                <span className={cx('text-3xl', on && 'animate-wiggle')} aria-hidden="true">
                  {s.emoji}
                </span>
                {s.label}
              </motion.button>
            );
          })}
        </div>
        <div>
          <h3 className="mb-2 font-display font-semibold">Something I am proud of…</h3>
          <TextArea label="Something I am proud of" rows={2} value={proud} onChange={setProud} maxLength={300} placeholder="I am proud that I…" />
        </div>
        <Button
          tone="sun"
          disabled={!dirty || busy}
          icon={Save}
          onClick={async () => {
            setBusy(true);
            await updateChild({ strengths: picked, proudOf: proud.trim() });
            setBusy(false);
            toast('Strengths saved');
            void celebrate();
          }}
        >
          {dirty ? 'Save my strengths' : 'Saved'}
        </Button>
      </div>
    </section>
  );
}

/* ---------- Voice notes ---------- */

function VoiceNotes() {
  const { data: notes, reload } = useChildQuery((repo, id) => repo.listVoiceNotes(id));
  if (!notes?.length) return null;
  return (
    <section>
      <SectionTitle title="My voice notes" subtitle="Things you said out loud with “Voice It”." />
      <ul className="grid gap-3">
        {notes.map((n) => (
          <VoiceNoteRow key={n.id} note={n} onDelete={reload} />
        ))}
      </ul>
    </section>
  );
}

function VoiceNoteRow({ note, onDelete }: { note: VoiceNote; onDelete: () => void }) {
  const url = useMemo(() => URL.createObjectURL(note.audio), [note.audio]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <li className="card flex flex-wrap items-center gap-3 p-4">
      <Mic aria-hidden="true" className="size-6 shrink-0 text-violet" />
      <span className="font-semibold">
        {new Date(note.createdAt).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · {note.durationSec}s
      </span>
      <audio controls src={url} className="min-w-0 flex-1" />
      <button
        type="button"
        aria-label="Delete voice note"
        onClick={async () => {
          if (!window.confirm('Delete this voice note?')) return;
          await withChild((repo, id) => repo.deleteVoiceNote(id, note.id));
          onDelete();
        }}
        className="grid size-11 place-items-center rounded-full border border-line"
      >
        <Trash2 className="size-5" />
      </button>
    </li>
  );
}

/* ---------- Check-in history ---------- */

function History({ checkins }: { checkins: Checkin[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const list = checkins.slice(0, 20);
  return (
    <section>
      <SectionTitle title="My check-in history" subtitle="Tap one to see: how I felt → what I needed → what I tried → how I felt afterwards." />
      {list.length === 0 ? (
        <EmptyState icon={Sprout} text="Your journey will appear here." action={<Button href="/wellbeing/check-in" icon={Brain}>Do a check-in</Button>} />
      ) : (
        <ol className="relative grid gap-3 border-l-4 border-violet-soft pl-5">
          {list.map((c) => {
            const f = c.feeling ? feelingById(c.feeling) : undefined;
            const a = c.activityId ? activityById(c.activityId) : undefined;
            const isOpen = open === c.id;
            const when = new Date(c.createdAt);
            const dayLabel = startOfDay(c.createdAt) === startOfDay(Date.now()) ? 'Today' : startOfDay(c.createdAt) === startOfDay(Date.now() - DAY) ? 'Yesterday' : when.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
            return (
              <li key={c.id} className="relative">
                <span className="absolute -left-[1.85rem] top-5 size-4 rounded-full border-4 border-bg bg-violet" aria-hidden="true" />
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : c.id)} className="card flex w-full items-center gap-3 p-4 text-left">
                  {f || a ? <span className="text-3xl" aria-hidden="true">{f?.emoji ?? a?.emoji}</span> : <NotebookPen aria-hidden="true" className="size-7 text-ink-soft" />}
                  <span className="flex-1">
                    <span className="block font-display font-semibold">
                      {dayLabel} → {f?.label ?? a?.title ?? 'Check-in'}
                    </span>
                    <span className="block text-sm text-ink-soft">{when.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>
                  </span>
                  <span className={cx('text-xl text-ink-soft transition-transform', isOpen && 'rotate-180')} aria-hidden="true">
                    <ChevronDown className="size-5" />
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <dl className="mt-2 grid gap-2 rounded-2xl bg-bg-2 p-4 sm:grid-cols-2">
                        <Detail label="How I felt" value={f ? f.label : 'Not recorded'} />
                        <Detail label="What I needed" value={c.needs.map((n) => needById(n)).filter(Boolean).map((n) => n!.short).join(', ') || 'Not recorded'} />
                        <Detail label="What I tried" value={a ? a.title : 'Not recorded'} />
                        <Detail
                          label="How I felt afterwards"
                          value={[c.feelingAfter !== undefined ? feelingAfter[c.feelingAfter].label : '', c.helpfulness !== undefined ? `(${helpfulness[c.helpfulness].label.toLowerCase()})` : ''].filter(Boolean).join(' ') || 'Not recorded'}
                        />
                        {c.about && <Detail label="It was about" value={c.about} />}
                        {c.note && <Detail label="My note" value={c.note} />}
                      </dl>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
