import type { HelpedType, Option } from './types';

export const strengths: Option[] = [
  { label: 'Kind', emoji: '💛' },
  { label: 'Brave', emoji: '🦁' },
  { label: 'Creative', emoji: '🎨' },
  { label: 'Helpful', emoji: '🤲' },
  { label: 'Funny', emoji: '😄' },
  { label: 'Patient', emoji: '🐢' },
  { label: 'Hard-working', emoji: '💪' },
  { label: 'Good listener', emoji: '👂' },
  { label: 'Curious', emoji: '🔍' },
  { label: 'Honest', emoji: '🌟' },
  { label: 'Caring friend', emoji: '🫶' },
  { label: 'Determined', emoji: '🧗' },
];

/** Tap-to-add examples from the doc's "My Small Wins". */
export const winExamples: string[] = [
  'I asked for help.',
  'I took a break when I needed one.',
  'I tried something new.',
  'I talked about how I was feeling.',
  'I handled a difficult moment.',
  'I completed something I was finding difficult.',
  'I was kind to myself.',
  'I tried again.',
];

export const winCategories: Option[] = [
  { label: 'School', emoji: '🏫' },
  { label: 'Friends', emoji: '🤝' },
  { label: 'Feelings', emoji: '❤️' },
  { label: 'Home', emoji: '🏠' },
  { label: 'Health', emoji: '🍎' },
  { label: 'Other', emoji: '✨' },
];

export const helpedTypes: Record<HelpedType, { label: string; emoji: string }> = {
  breathing: { label: 'Breathing', emoji: '🫁' },
  creative: { label: 'Creative activity', emoji: '🎨' },
  movement: { label: 'Movement break', emoji: '🚶' },
  writing: { label: 'Writing thoughts down', emoji: '📝' },
  focus: { label: 'Focus activity', emoji: '🎯' },
  quiet: { label: 'Quiet time', emoji: '🌿' },
  talking: { label: 'Talking to someone', emoji: '💬' },
};

export const avatars: string[] = ['🦁', '🐼', '🦊', '🐨', '🐯', '🐸', '🐵', '🦄', '🐙', '🐢', '🐰', '🐧'];

export const profileColors = ['violet', 'coral', 'teal', 'sun', 'rose', 'sky', 'lime', 'peach'] as const;
