import type { Repo } from './model';
import { DAY } from './insights';

/**
 * Fill a profile with ~3 weeks of realistic data so My Progress has
 * something to show at the exhibition. Patterns are chosen so insights appear
 * (e.g. quiet time helps calm down, breaks help focus).
 */
const plan: { daysAgo: number; hour: number; feeling: string; needs: string[]; about?: string; activityId?: string; after?: number; help?: number; source?: 'checkin' | 'activity' }[] = [
  { daysAgo: 20, hour: 16, feeling: 'worried', needs: ['calm'], about: 'Something at school', activityId: 'calm-corner', after: 1, help: 0 },
  { daysAgo: 19, hour: 17, feeling: 'tired', needs: ['break'], activityId: 'stretch-reset', after: 1, help: 1 },
  { daysAgo: 17, hour: 15, feeling: 'frustrated', needs: ['focus'], about: 'Something at school', activityId: 'focus-pause', after: 0, help: 0 },
  { daysAgo: 16, hour: 18, feeling: 'happy', needs: ['feel-better'], activityId: 'gratitude', after: 0, help: 0 },
  { daysAgo: 14, hour: 16, feeling: 'nervous', needs: ['calm'], about: 'Something at school', activityId: 'reset-54321', after: 1, help: 0 },
  { daysAgo: 13, hour: 19, feeling: 'lonely', needs: ['friendship', 'talk'], about: 'My friends', activityId: 'kind-words', after: 1, help: 1 },
  { daysAgo: 11, hour: 16, feeling: 'calm', needs: ['encouragement'], activityId: 'my-small-win', after: 0, help: 0 },
  { daysAgo: 10, hour: 17, feeling: 'overwhelmed', needs: ['calm'], about: 'Something at home', activityId: 'slow-breathing', after: 2, help: 2 },
  { daysAgo: 9, hour: 15, feeling: 'unmotivated', needs: ['motivation'], about: 'Something at school', activityId: 'start-2-minutes', after: 1, help: 0 },
  { daysAgo: 6, hour: 16, feeling: 'worried', needs: ['calm'], about: 'Something at school', activityId: 'calm-corner', after: 0, help: 0 },
  { daysAgo: 5, hour: 18, feeling: 'happy', needs: ['feel-better'], activityId: 'mood-booster', after: 0, help: 0 },
  { daysAgo: 4, hour: 15, feeling: 'confused', needs: ['focus'], about: 'Something at school', activityId: 'one-thing', after: 1, help: 0 },
  { daysAgo: 3, hour: 17, feeling: 'angry', needs: ['calm', 'listen'], about: 'Something that happened', activityId: 'get-it-out', after: 1, help: 1 },
  { daysAgo: 2, hour: 16, feeling: 'tired', needs: ['break'], activityId: 'quiet-minute', after: 0, help: 0 },
  { daysAgo: 1, hour: 18, feeling: 'proud', needs: ['encouragement'], activityId: 'strength-reminder', after: 0, help: 0 },
  { daysAgo: 0, hour: 9, feeling: 'calm', needs: ['focus'], activityId: 'clear-space', after: 0, help: 0 },
];

const logs = [
  { daysAgo: 15, kind: 'strategy' as const, refId: 'attention:3', label: 'Take a movement break', emoji: '🏃', difficultyId: 'attention' },
  { daysAgo: 12, kind: 'exercise' as const, refId: 'balloon-tapping', label: 'Balloon tapping', emoji: '🎈' },
  { daysAgo: 8, kind: 'strategy' as const, refId: 'writing:3', label: 'Take short writing breaks', emoji: '🖐️', difficultyId: 'writing' },
  { daysAgo: 7, kind: 'calm' as const, refId: 'too-much:1', label: 'Wear headphones', emoji: '🎧' },
  { daysAgo: 4, kind: 'exercise' as const, refId: 'flamingo', label: 'Flamingo stand', emoji: '🦩' },
  { daysAgo: 3, kind: 'strategy' as const, refId: 'attention:3', label: 'Take a movement break', emoji: '🏃', difficultyId: 'attention' },
  { daysAgo: 1, kind: 'food' as const, refId: 'attention:🥣 Oats + 🥛 Milk + 🍌 Banana', label: '🥣 Oats + 🥛 Milk + 🍌 Banana' },
];

const wins = [
  { daysAgo: 13, text: 'I asked for help in maths class.', category: 'School' },
  { daysAgo: 9, text: 'I took a break when I needed one.', category: 'Feelings' },
  { daysAgo: 5, text: 'I tried a new food at lunch.', category: 'Health' },
  { daysAgo: 1, text: 'I helped my friend tidy up.', category: 'Friends' },
];

function at(daysAgo: number, hour: number) {
  const d = new Date(Date.now() - daysAgo * DAY);
  d.setHours(hour, Math.floor(Math.random() * 50), 0, 0);
  return Math.min(d.getTime(), Date.now() - 60_000);
}

export async function seedDemoData(repo: Repo, childId: string) {
  for (const p of plan) {
    await repo.addCheckin(childId, {
      createdAt: at(p.daysAgo, p.hour),
      source: 'checkin',
      feeling: p.feeling,
      needs: p.needs,
      about: p.about,
      activityId: p.activityId,
      feelingAfter: p.after,
      helpfulness: p.help,
    });
  }
  for (const l of logs) await repo.addActivityLog(childId, { ...l, createdAt: at(l.daysAgo, 15) });
  for (const w of wins) await repo.addWin(childId, { text: w.text, category: w.category, createdAt: at(w.daysAgo, 19) });
  await repo.updateChild(childId, { strengths: ['Kind', 'Creative', 'Determined'], proudOf: 'I kept trying even when maths was hard.' });
}
