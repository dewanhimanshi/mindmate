import type { Need, Option } from './types';

/** "What do you need right now?": the doc's 14 options. */
export const needs: Need[] = [
  { id: 'calm', label: 'I need to calm down', short: 'Calm down', emoji: '🧘', tone: 'sky', activityIds: ['reset-54321', 'slow-breathing', 'calm-corner'] },
  { id: 'focus', label: 'I need help focusing', short: 'Focus', emoji: '🎯', tone: 'violet', activityIds: ['one-thing', 'focus-pause', 'clear-space'] },
  { id: 'break', label: 'I need a break', short: 'A break', emoji: '😴', tone: 'lilac', activityIds: ['stretch-reset', 'look-away', 'quiet-minute'] },
  { id: 'talk', label: 'I want to talk to someone', short: 'Talk to someone', emoji: '💬', tone: 'coral', activityIds: ['who-can-i-talk-to', 'start-conversation', 'help-me-say-it'] },
  { id: 'friendship', label: 'I need help with a friendship', short: 'Friendship', emoji: '🤝', tone: 'peach', activityIds: ['what-happened', 'pause-before-respond', 'kind-words'] },
  { id: 'school', label: 'I need help with something at school', short: 'School', emoji: '🏫', tone: 'sun', activityIds: ['name-school-problem', 'make-it-smaller', 'my-next-step'] },
  { id: 'home', label: 'I need help with something at home', short: 'Home', emoji: '🏠', tone: 'mint', activityIds: ['name-home-feeling', 'write-it-down', 'find-trusted-person'] },
  { id: 'online', label: 'I need help with something online', short: 'Online', emoji: '📱', tone: 'teal', activityIds: ['pause-online', 'think-check', 'get-help-online'] },
  { id: 'encouragement', label: 'I need some encouragement', short: 'Encouragement', emoji: '❤️', tone: 'rose', activityIds: ['my-small-win', 'strength-reminder', 'try-again'] },
  { id: 'understand', label: 'I want to understand my feelings', short: 'Understand feelings', emoji: '🧠', tone: 'violet', activityIds: ['name-it', 'what-triggered', 'what-do-i-need'] },
  { id: 'listen', label: 'I need someone to listen', short: 'Someone to listen', emoji: '👂', tone: 'sky', activityIds: ['get-it-out', 'voice-it', 'what-do-i-want'] },
  { id: 'motivation', label: 'I need motivation', short: 'Motivation', emoji: '💪', tone: 'coral', activityIds: ['start-2-minutes', 'break-it-down', 'progress-not-perfect'] },
  { id: 'feel-better', label: 'I want to feel better', short: 'Feel better', emoji: '🌿', tone: 'lime', activityIds: ['mood-booster', 'gratitude', 'enjoy-10'] },
  { id: 'not-sure', label: "I'm not sure what I need", short: 'Not sure', emoji: '❓', tone: 'lilac', activityIds: [] },
];

export const needById = (id: string): Need | undefined => needs.find((n) => n.id === id);

/* ---------- "I'm not sure what I need" mini-flow ---------- */

export const notSureFeelings: (Option & { id: string })[] = [
  { id: 'good', label: 'Good', emoji: '😊' },
  { id: 'okay', label: 'Okay', emoji: '😐' },
  { id: 'worried', label: 'Worried', emoji: '😟' },
  { id: 'low', label: 'Low', emoji: '😔' },
  { id: 'angry', label: 'Angry', emoji: '😡' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😣' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'unsure', label: 'Not sure', emoji: '❓' },
];

export const notSureHelpful: (Option & { id: string })[] = [
  { id: 'calm', label: 'Calm down', emoji: '🧘' },
  { id: 'express', label: 'Express myself', emoji: '💬' },
  { id: 'focus', label: 'Focus', emoji: '🎯' },
  { id: 'connect', label: 'Connect with someone', emoji: '🤝' },
  { id: 'break', label: 'Take a break', emoji: '🌿' },
  { id: 'encouraged', label: 'Feel encouraged', emoji: '❤️' },
];

/** helpful → { feeling → activityId, default }. Returns one small activity. */
const notSureTable: Record<string, Record<string, string>> = {
  calm: { angry: 'slow-breathing', worried: 'reset-54321', overwhelmed: 'reset-54321', default: 'calm-corner' },
  express: { tired: 'voice-it', default: 'get-it-out' },
  focus: { overwhelmed: 'one-thing', tired: 'start-2-minutes', default: 'clear-space' },
  connect: { low: 'help-me-say-it', worried: 'help-me-say-it', default: 'who-can-i-talk-to' },
  break: { tired: 'quiet-minute', angry: 'stretch-reset', default: 'look-away' },
  encouraged: { low: 'my-small-win', overwhelmed: 'try-again', default: 'strength-reminder' },
};

export function notSureSuggestion(feelingId: string, helpfulId: string): string {
  const row = notSureTable[helpfulId] ?? notSureTable.calm;
  return row[feelingId] ?? row.default;
}
