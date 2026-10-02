import { ArrowLeft, CircleCheck, DoorClosed, GraduationCap, HeartHandshake, House, Maximize2, School, Users, MessageCircle, MessagesSquare, PenLine, Presentation, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Mindy } from '../components/Mindy';
import { Shell } from '../components/shell/Shell';
import { ShowFullScreen, StarterCard } from '../components/talk';
import { Button, Chip, PageHeader, SectionTitle, TextArea } from '../components/ui/core';
import { SpeakButton } from '../components/ui/SpeakButton';
import { cx, tones } from '../components/ui/tone';
import { feelings } from '../data/feelings';
import { askWays, starters, talkPeople, talkPersonById, talkTopics } from '../data/talk';

const personIcons: Record<string, LucideIcon> = { counsellor: GraduationCap, teacher: School, parent: House, trusted: HeartHandshake };

const askIcons: Record<string, LucideIcon> = { say: MessagesSquare, write: PenLine, show: Presentation, private: DoorClosed };

/* ---------- /talk ---------- */

export function TalkPage() {
  return (
    <Shell section="talk">
      <div className="grid gap-10">
        <PageHeader icon={MessageCircle} title="I Want to Talk" subtitle="You don’t have to handle everything on your own. Talking to a trusted person can help." section="talk" />

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4 rounded-[2rem] bg-coral-soft p-6 text-center sm:flex-row sm:text-left">
          <Mindy size={90} mood="calm" />
          <div className="flex-1 text-coral-ink">
            <h2 className="text-2xl font-bold">Need help right now?</h2>
            <p className="mt-1 text-lg">Breathe in for 4… hold for 4… out for 4. Then find the nearest adult you trust and say:</p>
            <p className="mt-2 font-display text-2xl font-bold">“I need help.”</p>
          </div>
          <SpeakButton text="I need help." force size="lg" label="Say “I need help” for me" />
        </motion.div>

        <section>
          <SectionTitle title="Who can I talk to?" subtitle="Tap a person to see when and how to talk to them." />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {talkPeople.map((p, i) => (
              <motion.a
                key={p.id}
                href={`/talk/${p.id}`}
                data-read
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 220, damping: 18 }}
                className="card group flex flex-col items-center gap-3 p-5 text-center transition hover:-translate-y-1 hover:shadow-pop"
              >
                <span className={cx('grid size-20 place-items-center rounded-full transition group-hover:scale-110', tones[p.tone].soft, tones[p.tone].ink)} aria-hidden="true">
                  {(() => {
                    const Icon = personIcons[p.id] ?? Users;
                    return <Icon className="size-10" strokeWidth={1.75} />;
                  })()}
                </span>
                <span className="font-display text-lg font-bold">{p.name}</span>
              </motion.a>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle title="How can I ask for help?" />
          <div className="grid gap-3 sm:grid-cols-2">
            {askWays.map((w, i) => (
              <motion.a
                key={w.id}
                href={w.id === 'private' ? '#starters' : `/talk/say-it?mode=${w.id}`}
                data-read
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-pop"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl text-white" style={{ background: 'var(--grad-talk)' }} aria-hidden="true">
                  {(() => {
                    const Icon = askIcons[w.id] ?? MessageCircle;
                    return <Icon className="size-7" strokeWidth={2} />;
                  })()}
                </span>
                <span>
                  <span className="block font-display text-lg font-bold">{w.title}</span>
                  <span className="block text-ink-soft">{w.text}</span>
                </span>
              </motion.a>
            ))}
          </div>
        </section>

        <section id="starters">
          <SectionTitle title="Conversation starters" subtitle="Tap the speaker button and the device will say it for you. You can also read it out or show your screen." />
          <ul className="grid gap-3">
            {starters.map((s, i) => (
              <StarterCard key={s} text={s} index={i} />
            ))}
          </ul>
        </section>

        <section className="rounded-[2rem] p-6 text-center" style={{ background: 'var(--grad-hero)' }}>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-bold">If it feels difficult to start</h2>
            <SpeakButton text="If it feels difficult to start" size="sm" scope />
          </div>
          <p className="mt-2 text-lg text-ink-soft">You don’t have to explain everything at once. You can start with:</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {['I need help.', 'Something is bothering me.'].map((s) => (
              <span key={s} className="flex items-center gap-2 rounded-full bg-surface py-2 pl-5 pr-2 font-display text-xl font-bold shadow-card">
                “{s}” <SpeakButton text={s} force size="sm" />
              </span>
            ))}
          </div>
          <p className="mt-4 text-ink-soft">The trusted adult can then help you take the next step.</p>
        </section>
      </div>
    </Shell>
  );
}

/* ---------- /talk/[person] ---------- */

export function TalkPersonPage({ id }: { id: string }) {
  const p = talkPersonById(id)!;
  const t = tones[p.tone];
  return (
    <Shell section="talk">
      <div className="grid gap-8">
        <a href="/talk" className="inline-flex min-h-11 items-center gap-1 font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft aria-hidden="true" className="size-5" /> I Want to Talk
        </a>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cx('flex items-center gap-4 rounded-[2rem] p-6', t.soft)}>
          <span className={cx('grid size-24 shrink-0 place-items-center rounded-full bg-surface shadow-card', t.ink)} aria-hidden="true">
            {(() => {
              const Icon = personIcons[p.id] ?? Users;
              return <Icon className="size-12" strokeWidth={1.75} />;
            })()}
          </span>
          <h1 className={cx('flex-1 text-3xl font-bold sm:text-4xl', t.ink)}>{p.name}</h1>
          <SpeakButton text={p.name} />
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="card p-6">
            <SectionTitle title="You can talk to them when…" />
            <ul className="grid gap-3">
              {p.when.map((w) => (
                <li key={w} className="flex gap-3 text-lg">
                  <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-mint-ink" />
                  {w}
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-6">
            <SectionTitle title="Tips for starting" />
            <ol className="grid gap-3">
              {p.how.map((h, i) => (
                <li key={h} className="flex gap-3 text-lg">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full font-bold text-white" style={{ background: 'var(--grad-talk)' }}>
                    {i + 1}
                  </span>
                  {h}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section>
          <SectionTitle title="How can I start?" subtitle="Tap the speaker button to hear it, or practise saying it yourself." />
          <ul className="grid gap-3">
            {p.starters.map((s, i) => (
              <StarterCard key={s} text={s} index={i} />
            ))}
          </ul>
        </section>
        <Button href="/talk/say-it" variant="gradient" gradient="var(--grad-talk)" size="lg" icon={MessagesSquare}>
          Help me say it
        </Button>
      </div>
    </Shell>
  );
}

/* ---------- /talk/say-it ---------- */

type Mode = 'say' | 'write' | 'show';

export function SayItPage() {
  return (
    <Shell section="talk">
      <SayIt />
    </Shell>
  );
}

function SayIt() {
  const initial = new URLSearchParams(window.location.search).get('mode') as Mode | null;
  const [mode, setMode] = useState<Mode>(initial && ['say', 'write', 'show'].includes(initial) ? initial : 'say');
  const [feeling, setFeeling] = useState<string>('Worried');
  const [topic, setTopic] = useState<string>(talkTopics[0].label);
  const [written, setWritten] = useState('');
  const [showing, setShowing] = useState<{ emoji?: string; text: string } | null>(null);

  const feelingObj = feelings.find((f) => f.label === feeling);
  const sentence = `Can I talk to you? I’m feeling ${feeling.toLowerCase()} about ${topic}.`;

  return (
    <div className="grid gap-8">
      <PageHeader icon={MessagesSquare} title="Help me say it" subtitle="Choose how you want to share." section="talk" back={{ href: '/talk', label: 'I Want to Talk' }} />

      <div role="tablist" aria-label="How to share" className="grid grid-cols-3 gap-2 rounded-3xl bg-bg-2 p-1.5">
        {(
          [
            ['say', MessagesSquare, 'Say it'],
            ['write', PenLine, 'Write it'],
            ['show', Presentation, 'Show it'],
          ] as const
        ).map(([m, Icon, label]) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cx('flex min-h-14 items-center justify-center gap-2 rounded-2xl font-display text-lg font-semibold transition', mode === m ? 'bg-surface shadow-card' : 'text-ink-soft')}
          >
            <Icon aria-hidden="true" className="size-5" />
            {label}
          </button>
        ))}
      </div>

      {(mode === 'say' || mode === 'show') && (
        <>
          <section>
            <SectionTitle title="I am feeling…" />
            <div className="flex flex-wrap gap-2">
              {feelings.map((f) => (
                <Chip key={f.id} label={f.label} tone="coral" selected={feeling === f.label} onClick={() => setFeeling(f.label)} />
              ))}
            </div>
          </section>
          <section>
            <SectionTitle title="It’s about…" />
            <div className="flex flex-wrap gap-2">
              {talkTopics.map((t) => (
                <Chip key={t.label} label={t.label} tone="peach" selected={topic === t.label} onClick={() => setTopic(t.label)} />
              ))}
            </div>
          </section>
        </>
      )}

      {mode === 'say' && (
        <motion.section key={sentence} initial={{ scale: 0.97, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} className="rounded-[2rem] p-6 text-center text-white shadow-pop" style={{ background: 'var(--grad-talk)' }}>
          <p className="text-sm font-bold uppercase tracking-widest text-white/80">Practise saying</p>
          <p className="mt-2 font-display text-3xl font-bold leading-snug" data-read>
            “{sentence}”
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <SpeakButton text={sentence} force size="lg" label="Say it for me" />
            <span className="font-semibold text-white/90">Tap to hear it. Take a breath first. It’s okay if your voice shakes.</span>
          </div>
        </motion.section>
      )}

      {mode === 'write' && (
        <section>
          <SectionTitle title="Write what you want to say" subtitle="Then tap “Show it big” and turn your screen to the trusted person." />
          <TextArea label="What I want to say" rows={6} value={written} onChange={setWritten} placeholder="I want to tell you that…" />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="gradient" gradient="var(--grad-talk)" size="lg" disabled={!written.trim()} onClick={() => setShowing({ text: written.trim() })} icon={Maximize2}>
              Show it big
            </Button>
            <SpeakButton text={written || 'Type something first.'} force size="lg" label="Read my words aloud" />
          </div>
        </section>
      )}

      {mode === 'show' && (
        <section className="flex flex-col items-center gap-4 text-center">
          <div className="card w-full max-w-lg p-8" data-read>
            <div className="text-8xl" aria-hidden="true">{feelingObj?.emoji}</div>
            <p className="mt-3 font-display text-3xl font-bold">I feel {feeling.toLowerCase()}</p>
            <p className="mt-1 text-xl text-ink-soft">about {topic}</p>
          </div>
          <Button variant="gradient" gradient="var(--grad-talk)" size="lg" onClick={() => setShowing({ emoji: feelingObj?.emoji, text: `I feel ${feeling.toLowerCase()} about ${topic}.` })} icon={Maximize2}>
            Show it big
          </Button>
        </section>
      )}

      <ShowFullScreen open={!!showing} onClose={() => setShowing(null)} emoji={showing?.emoji} text={showing?.text ?? ''} />
    </div>
  );
}
