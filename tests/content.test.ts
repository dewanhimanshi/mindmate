import { describe, expect, it } from 'vitest';
import { activities, activityById } from '../src/data/activities';
import { needs, notSureFeelings, notSureHelpful, notSureSuggestion } from '../src/data/needs';
import { difficulties, calmTools } from '../src/data/support';

describe('content integrity', () => {
  it('activity ids are unique', () => {
    const ids = activities.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every need (except not-sure) has 3 existing activities', () => {
    for (const need of needs.filter((n) => n.id !== 'not-sure')) {
      expect(need.activityIds, need.id).toHaveLength(3);
      for (const id of need.activityIds) expect(activityById(id), `${need.id} → ${id}`).toBeDefined();
    }
  });

  it('every not-sure combination resolves to an activity', () => {
    for (const f of notSureFeelings)
      for (const h of notSureHelpful)
        expect(activityById(notSureSuggestion(f.id, h.id)), `${f.id}/${h.id}`).toBeDefined();
  });

  it('difficulty and calm-tool links point at real activities', () => {
    for (const d of difficulties)
      for (const r of d.related) {
        expect(r.activityId || r.href, d.id).toBeTruthy();
        if (r.activityId) expect(activityById(r.activityId), `${d.id} → ${r.activityId}`).toBeDefined();
      }
    for (const t of calmTools) expect(activityById(t.activityId)).toBeDefined();
  });

  it('sentence steps contain blanks', () => {
    for (const a of activities)
      for (const s of a.steps) if (s.type === 'sentence') expect(s.template, a.id).toContain('___');
  });
});
