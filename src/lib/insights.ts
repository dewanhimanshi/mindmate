import { activityById } from '../data/activities';
import { feelingById } from '../data/feelings';
import { needById } from '../data/needs';
import { helpedTypes } from '../data/progress';
import type { HelpedType } from '../data/types';
import type { Checkin } from './model';

export const DAY = 24 * 60 * 60 * 1000;

export function startOfDay(ms: number) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export interface Count {
  id: string;
  label: string;
  emoji: string;
  count: number;
}

function tally(ids: string[], describe: (id: string) => { label: string; emoji: string } | undefined): Count[] {
  const counts = new Map<string, number>();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count, ...(describe(id) ?? { label: id, emoji: '•' }) }))
    .sort((a, b) => b.count - a.count);
}

export function feelingCounts(checkins: Checkin[]): Count[] {
  return tally(
    checkins.flatMap((c) => (c.feeling ? [c.feeling] : [])),
    (id) => feelingById(id),
  );
}

export function needCounts(checkins: Checkin[]): Count[] {
  return tally(
    checkins.flatMap((c) => c.needs.filter((n) => n !== 'not-sure')),
    (id) => {
      const n = needById(id);
      return n && { label: n.short, emoji: n.emoji };
    },
  );
}

export interface DaySummary {
  start: number;
  label: string;
  isToday: boolean;
  checkins: Checkin[];
  feeling?: string;
}

/** The last 7 days, oldest first; `feeling` is the most recent one that day. */
export function lastSevenDays(checkins: Checkin[], now = Date.now()): DaySummary[] {
  const today = startOfDay(now);
  return Array.from({ length: 7 }, (_, i) => {
    const start = today - (6 - i) * DAY;
    const dayCheckins = checkins
      .filter((c) => c.createdAt >= start && c.createdAt < start + DAY)
      .sort((a, b) => b.createdAt - a.createdAt);
    return {
      start,
      label: new Date(start).toLocaleDateString('en-IN', { weekday: 'short' }),
      isToday: start === today,
      checkins: dayCheckins,
      feeling: dayCheckins.find((c) => c.feeling)?.feeling,
    };
  });
}

export interface HelpedSummary {
  type: HelpedType;
  label: string;
  emoji: string;
  tried: number;
  lot: number;
  little: number;
  none: number;
}

const helpedOf = (c: Checkin): HelpedType | undefined => (c.activityId ? activityById(c.activityId)?.helped : undefined);

export function helpedSummary(checkins: Checkin[]): HelpedSummary[] {
  const map = new Map<HelpedType, HelpedSummary>();
  for (const c of checkins) {
    const type = helpedOf(c);
    if (!type) continue;
    const row = map.get(type) ?? { type, ...helpedTypes[type], tried: 0, lot: 0, little: 0, none: 0 };
    row.tried++;
    if (c.helpfulness === 0) row.lot++;
    else if (c.helpfulness === 1) row.little++;
    else if (c.helpfulness === 2) row.none++;
    map.set(type, row);
  }
  return [...map.values()].sort((a, b) => b.lot - a.lot || b.tried - a.tried);
}

const needPhrase: Record<string, string> = {
  calm: 'calm down',
  focus: 'focus',
  break: 'rest and reset',
  talk: 'feel ready to talk',
  friendship: 'with friendship worries',
  school: 'with school worries',
  home: 'with things at home',
  online: 'with online worries',
  encouragement: 'feel encouraged',
  understand: 'understand your feelings',
  listen: 'feel heard',
  motivation: 'get started',
  'feel-better': 'feel better',
};

/** Score: helped a lot = 2, a little = 1, didn't help = 0. */
const score = (h?: number) => (h === 0 ? 2 : h === 1 ? 1 : 0);

/**
 * Gentle pattern sentences like "Quiet time usually helps you calm down."
 * Only shown with at least 2 rated tries, and only when it mostly helped.
 */
export function insights(checkins: Checkin[]): string[] {
  const rated = checkins.filter((c) => c.helpfulness !== undefined && helpedOf(c));
  const out: string[] = [];
  const byNeedType = new Map<string, { need: string; type: HelpedType; total: number; n: number }>();
  for (const c of rated) {
    const type = helpedOf(c)!;
    for (const need of c.needs.filter((n) => needPhrase[n])) {
      const key = `${need}|${type}`;
      const row = byNeedType.get(key) ?? { need, type, total: 0, n: 0 };
      row.total += score(c.helpfulness);
      row.n++;
      byNeedType.set(key, row);
    }
  }
  const bestPerNeed = new Map<string, { type: HelpedType; avg: number; n: number }>();
  for (const row of byNeedType.values()) {
    if (row.n < 2) continue;
    const avg = row.total / row.n;
    const current = bestPerNeed.get(row.need);
    if (avg >= 1.5 && (!current || avg > current.avg || (avg === current.avg && row.n > current.n)))
      bestPerNeed.set(row.need, { type: row.type, avg, n: row.n });
  }
  for (const [need, best] of bestPerNeed) out.push(`${helpedTypes[best.type].label} usually helps you ${needPhrase[need]}.`);

  if (out.length === 0) {
    const top = helpedSummary(rated).find((h) => h.tried >= 2 && h.lot >= 1);
    if (top) out.push(`${top.label} has helped you the most so far.`);
  }
  return out.slice(0, 3);
}

/** Order a need's activities so ones that "helped a lot" before come first. */
export function rankActivities(activityIds: string[], history: Checkin[]): { id: string; helpedBefore: boolean }[] {
  const helped = new Set(history.filter((c) => c.helpfulness === 0 && c.activityId).map((c) => c.activityId!));
  return activityIds
    .map((id, i) => ({ id, helpedBefore: helped.has(id), i }))
    .sort((a, b) => Number(b.helpedBefore) - Number(a.helpedBefore) || a.i - b.i)
    .map(({ id, helpedBefore }) => ({ id, helpedBefore }));
}
