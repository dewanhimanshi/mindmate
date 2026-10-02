import { ArrowLeft, Check, Sprout, X, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import type { Tone } from '../../data/types';
import { SpeakButton } from './SpeakButton';
import { cx, sectionGradient, tones, type Section } from './tone';

/* ---------- Button ---------- */

type ButtonProps = {
  tone?: Tone;
  variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'gradient';
  size?: 'md' | 'lg';
  href?: string;
  icon?: LucideIcon;
  block?: boolean;
  gradient?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  tone = 'violet',
  variant = 'solid',
  size = 'md',
  href,
  icon: Icon,
  block,
  gradient,
  className,
  children,
  ...rest
}: ButtonProps) {
  const t = tones[tone];
  const base = cx(
    'btn inline-flex items-center justify-center gap-2 rounded-2xl font-display font-semibold transition select-none',
    'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    size === 'lg' ? 'min-h-14 px-6 text-lg' : 'min-h-12 px-5 text-base',
    block && 'w-full',
    variant === 'solid' && cx(t.solid, 'text-white shadow-card'),
    variant === 'gradient' && 'text-white shadow-card',
    variant === 'soft' && cx(t.soft, t.ink),
    variant === 'outline' && cx('border-2 bg-surface', t.border, t.ink),
    variant === 'ghost' && 'text-ink-soft hover:bg-bg-2',
    className,
  );
  const style = variant === 'gradient' ? { background: gradient ?? 'var(--grad-wellbeing)' } : undefined;
  const content = (
    <>
      {Icon && <Icon aria-hidden="true" className={size === 'lg' ? 'size-5.5' : 'size-5'} strokeWidth={2.25} />}
      {children}
    </>
  );
  if (href)
    return (
      <a href={href} className={base} style={style}>
        {content}
      </a>
    );
  return (
    <button type="button" className={base} style={style} {...rest}>
      {content}
    </button>
  );
}

/* ---------- ChoiceCard: big emoji tile used across all flows ---------- */

interface ChoiceProps {
  emoji?: string;
  label: string;
  hint?: string;
  selected?: boolean;
  tone?: Tone;
  layout?: 'tile' | 'row';
  onClick?: () => void;
  href?: string;
  index?: number;
  badge?: string;
  role?: 'checkbox' | 'radio';
}

export function ChoiceCard({ emoji, label, hint, selected, tone = 'violet', layout = 'tile', onClick, href, index = 0, badge, role }: ChoiceProps) {
  const t = tones[tone];
  const cls = cx(
    'card group relative flex w-full text-left transition-all',
    'hover:-translate-y-1 hover:shadow-pop active:scale-[0.97]',
    layout === 'tile' ? 'min-h-32 flex-col items-center justify-center gap-2 p-4 text-center' : 'min-h-18 items-center gap-4 p-4',
    selected ? cx('border-2', t.border, t.soft) : '',
  );
  const inner = (
    <>
      {emoji && (
        <span
          aria-hidden="true"
          className={cx(
            'grid shrink-0 place-items-center rounded-2xl leading-none transition-transform group-hover:scale-110',
            layout === 'tile' ? 'size-16 text-5xl' : cx('size-14 text-3xl', t.soft),
            selected && 'animate-wiggle',
          )}
        >
          {emoji}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className={cx('block font-display font-semibold', layout === 'tile' ? 'text-base' : 'text-lg')}>{label}</span>
        {hint && <span className="mt-0.5 block text-sm text-ink-soft">{hint}</span>}
      </span>
      {badge && (
        <span className="absolute -top-2 right-3 rounded-full bg-sun px-2.5 py-0.5 text-xs font-bold text-sun-ink shadow-sm">{badge}</span>
      )}
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cx('absolute right-2 top-2 grid size-7 place-items-center rounded-full text-white', t.solid)}
          aria-hidden="true"
        >
          <Check className="size-4" strokeWidth={3} />
        </motion.span>
      )}
    </>
  );
  const motionProps = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: Math.min(index * 0.035, 0.5), type: 'spring' as const, stiffness: 260, damping: 22 },
  };
  if (href)
    return (
      <motion.a href={href} className={cls} data-read {...motionProps}>
        {inner}
      </motion.a>
    );
  return (
    <motion.button
      type="button"
      role={role}
      aria-checked={role ? !!selected : undefined}
      aria-pressed={role ? undefined : selected}
      onClick={onClick}
      className={cls}
      data-read
      {...motionProps}
    >
      {inner}
    </motion.button>
  );
}

/* ---------- Chip ---------- */

export function Chip({
  label,
  selected,
  onClick,
  tone = 'violet',
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  tone?: Tone;
}) {
  const t = tones[tone];
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx(
        'chip inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 py-2 font-semibold transition active:scale-95',
        selected ? cx(t.solid, 'border-transparent text-white shadow-card') : 'border-line bg-surface hover:border-ink-soft',
      )}
    >
      {selected && <Check aria-hidden="true" className="size-4" strokeWidth={3} />}
      {label}
    </button>
  );
}

/* ---------- Page header with section gradient ---------- */

function ArrowLeftIcon() {
  return <ArrowLeft aria-hidden="true" className="size-5" />;
}

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  section = 'wellbeing',
  back,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  section?: Section;
  back?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <header className="relative mb-6">
      {back && (
        <a href={back.href} className="mb-3 inline-flex min-h-11 items-center gap-1 rounded-xl pr-3 font-semibold text-ink-soft hover:text-ink">
          <ArrowLeftIcon /> {back.label}
        </a>
      )}
      <div className="flex items-start gap-4">
        <motion.span
          initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          className="grid size-16 shrink-0 place-items-center rounded-3xl text-white shadow-card sm:size-20"
          style={{ background: sectionGradient[section] }}
          aria-hidden="true"
        >
          <Icon className="size-8 sm:size-10" strokeWidth={2} />
        </motion.span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h1 className="flex-1 text-3xl font-bold sm:text-4xl">{title}</h1>
            <SpeakButton text={subtitle ? `${title}. ${subtitle}` : title} />
          </div>
          {subtitle && <p className="mt-1 text-lg text-ink-soft">{subtitle}</p>}
        </div>
      </div>
      {children}
    </header>
  );
}

/* ---------- Section title (h2 + read aloud) ---------- */

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex-1">
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="mt-1 text-ink-soft">{subtitle}</p>}
      </div>
      <SpeakButton text={subtitle ? `${title}. ${subtitle}` : title} size="sm" scope />
    </div>
  );
}

/* ---------- Sheet (modal dialog) ---------- */

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className="m-auto mb-0 w-full max-w-lg rounded-t-[2rem] bg-surface p-0 text-ink shadow-pop backdrop:bg-black/40 backdrop:backdrop-blur-sm sm:mb-auto sm:rounded-[2rem]"
    >
      {open && (
        <div className="max-h-[85dvh] overflow-y-auto p-6 text-left">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="flex-1 text-2xl font-bold">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="grid size-11 place-items-center rounded-full bg-bg-2">
              <X className="size-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

/* ---------- Progress dots ---------- */

export function ProgressDots({ step, total, tone = 'violet' }: { step: number; total: number; tone?: Tone }) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step + 1} aria-label={`Step ${step + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cx('h-2.5 rounded-full transition-all duration-300', i <= step ? tones[tone].solid : 'bg-line', i === step ? 'w-8' : 'w-2.5')}
        />
      ))}
      <span className="ml-1 text-sm font-semibold text-ink-soft">
        {step + 1} of {total}
      </span>
    </div>
  );
}

/* ---------- Form field ---------- */

export function Field({ label, hint, ...props }: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-semibold">{label}</span>
      <input
        {...props}
        className="min-h-13 w-full rounded-2xl border-2 border-line bg-surface px-4 text-lg outline-none transition focus:border-violet"
      />
      {hint && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
    </label>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  label,
  maxLength = 1000,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  label: string;
  maxLength?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      aria-label={label}
      className="w-full resize-none rounded-2xl border-2 border-line bg-surface p-4 text-lg outline-none transition focus:border-violet"
    />
  );
}

/* ---------- Misc ---------- */

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="grid place-items-center gap-3 py-16 text-ink-soft" role="status">
      <Sprout className="size-12 animate-float text-mint" aria-hidden="true" />
      <span className="font-semibold">{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, text, action }: { icon: LucideIcon; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-line p-6 text-center">
      <Icon className="mx-auto size-9 text-ink-soft" aria-hidden="true" strokeWidth={1.75} />
      <p className="mt-2 text-ink-soft">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Small info box with an icon, for safety and help notes. */
export function Note({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <p className="flex items-start gap-3 rounded-2xl bg-bg-2 p-4 text-ink-soft">
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
