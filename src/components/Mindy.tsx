import { motion } from 'motion/react';
import { SpeakButton } from './ui/SpeakButton';
import { cx } from './ui/tone';

type Mood = 'happy' | 'cheer' | 'calm' | 'think';

/**
 * Mindy, the MindMate sprout. Pure SVG + CSS so it's tiny;
 * all motion stops in Calm Mode via the global rules.
 */
export function Mindy({ mood = 'happy', size = 120, say, className }: { mood?: Mood; size?: number; say?: string; className?: string }) {
  return (
    <div className={cx('flex items-center gap-3', className)}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        aria-hidden="true"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={mood === 'cheer' ? { scale: [1, 1.12, 1], rotate: [0, -6, 6, 0], opacity: 1 } : { scale: 1, opacity: 1 }}
        transition={mood === 'cheer' ? { duration: 0.9, repeat: 1 } : { type: 'spring', stiffness: 200, damping: 14 }}
        className="shrink-0 overflow-visible"
      >
        <style>{`
          .mindy-body{animation:mindy-bob 3.2s ease-in-out infinite;transform-origin:60px 100px}
          .mindy-leaf-l{animation:mindy-sway 2.6s ease-in-out infinite;transform-origin:60px 44px}
          .mindy-leaf-r{animation:mindy-sway 2.6s ease-in-out -1.3s infinite;transform-origin:60px 44px}
          .mindy-eye{animation:mindy-blink 4.5s infinite;transform-origin:center;transform-box:fill-box}
          @keyframes mindy-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
          @keyframes mindy-sway{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
          @keyframes mindy-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
        `}</style>
        <defs>
          <linearGradient id="mindy-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c4f1a5" />
            <stop offset="1" stopColor="#6fcf7f" />
          </linearGradient>
          <linearGradient id="mindy-pot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f9a8d4" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="112" rx="30" ry="5" fill="currentColor" opacity="0.08" />
        <path d="M32 86h56l-6 24H38z" fill="url(#mindy-pot)" />
        <rect x="28" y="80" width="64" height="10" rx="5" fill="#e879f9" />
        <g className="mindy-body">
          <path d="M60 46v16" stroke="#4ade80" strokeWidth="5" strokeLinecap="round" />
          <path className="mindy-leaf-l" d="M60 46c-4-14-18-20-30-16 2 13 16 20 30 16z" fill="#86efac" />
          <path className="mindy-leaf-r" d="M60 46c4-14 18-20 30-16-2 13-16 20-30 16z" fill="#4ade80" />
          <ellipse cx="60" cy="68" rx="24" ry="20" fill="url(#mindy-body)" />
          {mood === 'calm' ? (
            <>
              <path d="M48 66q3 3 6 0M66 66q3 3 6 0" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse className="mindy-eye" cx="51" cy="65" rx="3.2" ry={mood === 'cheer' ? 2.5 : 4} fill="#1f2937" />
              <ellipse className="mindy-eye" cx="69" cy="65" rx="3.2" ry={mood === 'cheer' ? 2.5 : 4} fill="#1f2937" />
            </>
          )}
          <circle cx="45" cy="73" r="3.5" fill="#fb7185" opacity="0.45" />
          <circle cx="75" cy="73" r="3.5" fill="#fb7185" opacity="0.45" />
          {mood === 'think' ? (
            <path d="M54 76h12" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
          ) : (
            <path
              d={mood === 'cheer' ? 'M51 74q9 10 18 0z' : 'M53 75q7 6 14 0'}
              stroke="#1f2937"
              strokeWidth="2.5"
              fill={mood === 'cheer' ? '#1f2937' : 'none'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>
      </motion.svg>
      {say && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative flex items-start gap-2 rounded-3xl rounded-bl-md bg-surface p-4 shadow-card"
        >
          <p className="font-display text-lg font-medium">{say}</p>
          <SpeakButton text={say} size="sm" />
        </motion.div>
      )}
    </div>
  );
}
