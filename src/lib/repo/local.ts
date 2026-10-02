import { createStore, del, get, keys, set } from 'idb-keyval';
import type { ActivityLog, Checkin, Child, New, NewChild, Repo, VoiceNote, Win } from '../model';

/**
 * Guest / exhibition storage. Everything stays in this browser:
 * JSON records in localStorage, voice-note audio in IndexedDB.
 */
const PREFIX = 'mm:guest:';
const voiceStore = typeof indexedDB !== 'undefined' ? createStore('mindmate-guest', 'voice') : undefined;

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + key) || '[]') as T[];
  } catch {
    return [];
  }
}
function write<T>(key: string, value: T[]) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

type Meta = Omit<VoiceNote, 'audio'>;

export class LocalRepo implements Repo {
  readonly kind = 'local' as const;

  private add<T extends { id: string; createdAt: number }>(key: string, data: New<T>): T {
    const record = { ...data, id: uid(), createdAt: data.createdAt ?? Date.now() } as T;
    write(key, [record, ...read<T>(key)]);
    return record;
  }
  private list<T extends { createdAt: number }>(key: string, sinceMs?: number): T[] {
    return read<T>(key)
      .filter((r) => !sinceMs || r.createdAt >= sinceMs)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async listChildren() {
    return read<Child>('children').sort((a, b) => a.createdAt - b.createdAt);
  }
  async getChild(id: string) {
    return read<Child>('children').find((c) => c.id === id);
  }
  async createChild(data: NewChild) {
    const child: Child = { ...data, id: uid(), createdAt: Date.now() };
    write('children', [...read<Child>('children'), child]);
    return child;
  }
  async updateChild(id: string, patch: Partial<Omit<Child, 'id'>>) {
    write(
      'children',
      read<Child>('children').map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }
  async deleteChild(id: string) {
    write(
      'children',
      read<Child>('children').filter((c) => c.id !== id),
    );
    for (const name of ['checkins', 'logs', 'wins', 'voice']) localStorage.removeItem(`${PREFIX}${name}:${id}`);
    if (voiceStore) for (const k of await keys(voiceStore)) if (String(k).startsWith(`${id}:`)) await del(k, voiceStore);
  }

  async addCheckin(childId: string, data: New<Checkin>) {
    return this.add<Checkin>(`checkins:${childId}`, data);
  }
  async listCheckins(childId: string, sinceMs?: number) {
    return this.list<Checkin>(`checkins:${childId}`, sinceMs);
  }
  async addActivityLog(childId: string, data: New<ActivityLog>) {
    return this.add<ActivityLog>(`logs:${childId}`, data);
  }
  async listActivityLogs(childId: string, sinceMs?: number) {
    return this.list<ActivityLog>(`logs:${childId}`, sinceMs);
  }
  async addWin(childId: string, data: New<Win>) {
    return this.add<Win>(`wins:${childId}`, data);
  }
  async listWins(childId: string) {
    return this.list<Win>(`wins:${childId}`);
  }
  async deleteWin(childId: string, id: string) {
    write(
      `wins:${childId}`,
      read<Win>(`wins:${childId}`).filter((w) => w.id !== id),
    );
  }

  async addVoiceNote(childId: string, data: New<VoiceNote>) {
    const { audio, ...meta } = data;
    const record = this.add<Meta>(`voice:${childId}`, meta);
    if (voiceStore) await set(`${childId}:${record.id}`, audio, voiceStore);
    return { ...record, audio };
  }
  async listVoiceNotes(childId: string) {
    const metas = this.list<Meta>(`voice:${childId}`);
    const notes: VoiceNote[] = [];
    for (const m of metas) {
      const audio = voiceStore ? await get<Blob>(`${childId}:${m.id}`, voiceStore) : undefined;
      if (audio) notes.push({ ...m, audio });
    }
    return notes;
  }
  async deleteVoiceNote(childId: string, id: string) {
    write(
      `voice:${childId}`,
      read<Meta>(`voice:${childId}`).filter((v) => v.id !== id),
    );
    if (voiceStore) await del(`${childId}:${id}`, voiceStore);
  }

  /** Wipe all guest data (exhibition reset). */
  static async clearAll() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    if (voiceStore) for (const k of await keys(voiceStore)) await del(k, voiceStore);
  }
}
