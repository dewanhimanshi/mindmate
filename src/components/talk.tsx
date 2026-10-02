import { Copy, Quote } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId } from 'react';
import { toast } from '../lib/feedback';
import { speak } from '../lib/speech';
import { SpeakButton } from './ui/SpeakButton';

/** A conversation starter: tap to have the device say it, or copy it. */
export function StarterCard({ text, index = 0 }: { text: string; index?: number }) {
  const id = useId();
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="card flex items-center gap-3 p-4"
    >
      <Quote aria-hidden="true" className="size-6 shrink-0 text-coral" />
      <p className="flex-1 font-display text-lg font-semibold">“{text}”</p>
      <SpeakButton text={text} force label={`Say it for me: ${text}`} />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            toast('Copied!');
          } catch {
            void speak(text, id);
          }
        }}
        aria-label={`Copy: ${text}`}
        className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface"
      >
        <Copy aria-hidden="true" className="size-5 text-ink-soft" />
      </button>
    </motion.li>
  );
}

/** Full-screen card a child can turn round and show to an adult. */
export function ShowFullScreen({ open, onClose, emoji, text }: { open: boolean; onClose: () => void; emoji?: string; text: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Show this to a trusted adult"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-6 p-8 text-center text-white"
          style={{ background: 'var(--grad-talk)' }}
          onClick={onClose}
        >
          {emoji && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="text-[8rem] leading-none" aria-hidden="true">
              {emoji}
            </motion.div>
          )}
          <p className="max-w-3xl font-display text-4xl font-bold leading-tight drop-shadow sm:text-6xl">{text}</p>
          <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
            <SpeakButton text={text} force size="lg" label="Say it for me" />
            <button type="button" onClick={onClose} className="min-h-14 rounded-2xl bg-white/25 px-6 font-display text-lg font-bold backdrop-blur">
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
