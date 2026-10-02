import { describe, expect, it } from 'vitest';
import { DAY, feelingCounts, insights, lastSevenDays, rankActivities, startOfDay } from '../src/lib/insights';
import type { Checkin } from '../src/lib/model';

const now = new Date('2026-10-03T12:00:00').getTime();
let n = 0;
const c = (p: Partial<Checkin>): Checkin => ({ id: String(n++), createdAt: now, source: 'checkin', needs: [], ...p });

describe('insights', () => {
  it('finds what usually helps for a need', () => {
    const data = [
      c({ needs: ['calm'], activityId: 'calm-corner', helpfulness: 0 }), // quiet
      c({ needs: ['calm'], activityId: 'reset-54321', helpfulness: 0 }), // quiet
      c({ needs: ['calm'], activityId: 'slow-breathing', helpfulness: 2 }),
    ];
    expect(insights(data)).toContain('Quiet time usually helps you calm down.');
  });

  it('needs at least two rated tries', () => {
    expect(insights([c({ needs: ['calm'], activityId: 'calm-corner', helpfulness: 0 })])).toEqual([]);
  });

  it('does not claim something helps when it mostly did not', () => {
    const data = [
      c({ needs: ['focus'], activityId: 'one-thing', helpfulness: 2 }),
      c({ needs: ['focus'], activityId: 'focus-pause', helpfulness: 1 }),
    ];
    expect(insights(data)).toEqual([]);
  });
});

describe('progress helpers', () => {
  it('builds 7 days ending today with the latest feeling', () => {
    const days = lastSevenDays(
      [c({ feeling: 'worried', createdAt: now - 2 * DAY }), c({ feeling: 'calm', createdAt: now - 2 * DAY + 1000 })],
      now,
    );
    expect(days).toHaveLength(7);
    expect(days[6].isToday).toBe(true);
    expect(days[6].start).toBe(startOfDay(now));
    expect(days[4].feeling).toBe('calm');
  });

  it('counts feelings', () => {
    const counts = feelingCounts([c({ feeling: 'happy' }), c({ feeling: 'happy' }), c({ feeling: 'sad' })]);
    expect(counts[0]).toMatchObject({ id: 'happy', count: 2, label: 'Happy' });
  });

  it('puts activities that helped before first', () => {
    const ranked = rankActivities(['a', 'b', 'c'], [c({ activityId: 'c', helpfulness: 0 })]);
    expect(ranked.map((r) => r.id)).toEqual(['c', 'a', 'b']);
    expect(ranked[0].helpedBefore).toBe(true);
  });
});

describe('speech text', () => {
  it('turns line breaks into pauses and strips emoji', async () => {
    const { cleanForSpeech, splitSentences } = await import('../src/lib/speech');
    expect(cleanForSpeech('😊\nI don’t know how I feel\nThat’s okay.')).toBe('I don’t know how I feel. That’s okay.');
    expect(splitSentences('Happy\nCalm')).toEqual(['Happy.', 'Calm']);
    expect(cleanForSpeech('I felt ___ when')).toBe('I felt blank when');
  });
});
