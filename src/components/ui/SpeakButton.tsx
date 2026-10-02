import { useStore } from '@nanostores/react';
import { Volume2 } from 'lucide-react';
import { useId } from 'react';
import { $child, settingsOf } from '../../lib/session';
import { $speaking, readableElements, readElements, speak, SPEAK_SCOPE, speechSupported, stopSpeaking } from '../../lib/speech';
import { cx } from './tone';

interface Props {
  text: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Show even if the child turned read-aloud buttons off (e.g. "Say it for me"). */
  force?: boolean;
  /**
   * Read the whole block this button sits in (its section, card or [data-speak-scope]),
   * not just `text`. `text` is the fallback if no block is found.
   */
  scope?: boolean;
}

export function SpeakButton({ text, label, size = 'md', className, force, scope }: Props) {
  const id = useId();
  const speaking = useStore($speaking) === id;
  const child = useStore($child);
  if (!speechSupported() || (!force && !settingsOf(child).tts)) return null;

  const dims = size === 'sm' ? 'size-9' : size === 'lg' ? 'size-14' : 'size-11';
  const icon = size === 'sm' ? 'size-4' : size === 'lg' ? 'size-6' : 'size-5';
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (speaking) return stopSpeaking();
        const root = scope ? e.currentTarget.closest<HTMLElement>(SPEAK_SCOPE) : null;
        const parts = root ? readableElements(root) : [];
        if (parts.length) void readElements(parts, id);
        else void speak(text, id);
      }}
      aria-label={speaking ? 'Stop reading' : (label ?? (scope ? `Read this section aloud: ${text}` : `Read aloud: ${text}`))}
      aria-pressed={speaking}
      className={cx(
        'relative inline-grid shrink-0 place-items-center rounded-full border border-line bg-surface shadow-sm transition hover:scale-105 active:scale-95',
        speaking && 'border-violet bg-violet-soft',
        dims,
        className,
      )}
    >
      {speaking ? <SoundWaves /> : <Volume2 aria-hidden="true" className={cx(icon, 'text-violet')} strokeWidth={2.25} />}
    </button>
  );
}

function SoundWaves() {
  return (
    <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-violet"
          style={{ height: '100%', animation: `pulse-bar 0.8s ${i * 0.15}s ease-in-out infinite alternate` }}
        />
      ))}
      <style>{`@keyframes pulse-bar{from{transform:scaleY(.3)}to{transform:scaleY(1)}}`}</style>
    </span>
  );
}
