import {
  addDoc,
  Bytes,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { firestore } from '../firebase';
import type { ActivityLog, Checkin, Child, New, NewChild, Repo, VoiceNote, Win } from '../model';

const CHILD_COLLECTIONS = ['checkins', 'activityLogs', 'wins', 'journal', 'voiceNotes'] as const;

/** Firestore rejects `undefined` field values; drop them before writing. */
function clean<T extends object>(data: T): DocumentData {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
}

export class FirestoreRepo implements Repo {
  readonly kind = 'firestore' as const;
  constructor(private uid: string) {}

  private children() {
    return collection(firestore(), 'users', this.uid, 'children');
  }
  private sub(childId: string, name: (typeof CHILD_COLLECTIONS)[number]) {
    return collection(firestore(), 'users', this.uid, 'children', childId, name);
  }

  private async list<T>(childId: string, name: (typeof CHILD_COLLECTIONS)[number], sinceMs?: number): Promise<T[]> {
    const constraints: QueryConstraint[] = [];
    if (sinceMs) constraints.push(where('createdAt', '>=', sinceMs));
    constraints.push(orderBy('createdAt', 'desc'));
    const snap = await getDocs(query(this.sub(childId, name), ...constraints));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
  }

  private async add<T extends { id: string; createdAt: number }>(
    childId: string,
    name: (typeof CHILD_COLLECTIONS)[number],
    data: New<T>,
  ): Promise<T> {
    const record = { ...data, createdAt: data.createdAt ?? Date.now() };
    const ref = await addDoc(this.sub(childId, name), clean(record));
    return { ...record, id: ref.id } as T;
  }

  async listChildren(): Promise<Child[]> {
    const snap = await getDocs(query(this.children(), orderBy('createdAt', 'asc')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Child);
  }

  async getChild(id: string): Promise<Child | undefined> {
    const snap = await getDoc(doc(this.children(), id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Child) : undefined;
  }

  async createChild(data: NewChild): Promise<Child> {
    const record = { ...data, createdAt: Date.now() };
    const ref = await addDoc(this.children(), clean(record));
    return { ...record, id: ref.id };
  }

  async updateChild(id: string, patch: Partial<Omit<Child, 'id'>>): Promise<void> {
    await updateDoc(doc(this.children(), id), clean(patch));
  }

  async deleteChild(id: string): Promise<void> {
    // Client SDK can't delete recursively: remove each subcollection first.
    for (const name of CHILD_COLLECTIONS) {
      const snap = await getDocs(this.sub(id, name));
      for (let i = 0; i < snap.docs.length; i += 400) {
        const batch = writeBatch(firestore());
        snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    }
    await deleteDoc(doc(this.children(), id));
  }

  addCheckin(childId: string, data: New<Checkin>) {
    return this.add<Checkin>(childId, 'checkins', data);
  }
  listCheckins(childId: string, sinceMs?: number) {
    return this.list<Checkin>(childId, 'checkins', sinceMs);
  }

  addActivityLog(childId: string, data: New<ActivityLog>) {
    return this.add<ActivityLog>(childId, 'activityLogs', data);
  }
  listActivityLogs(childId: string, sinceMs?: number) {
    return this.list<ActivityLog>(childId, 'activityLogs', sinceMs);
  }

  addWin(childId: string, data: New<Win>) {
    return this.add<Win>(childId, 'wins', data);
  }
  listWins(childId: string) {
    return this.list<Win>(childId, 'wins');
  }
  async deleteWin(childId: string, id: string) {
    await deleteDoc(doc(this.sub(childId, 'wins'), id));
  }

  async addVoiceNote(childId: string, data: New<VoiceNote>): Promise<VoiceNote> {
    const createdAt = data.createdAt ?? Date.now();
    const bytes = Bytes.fromUint8Array(new Uint8Array(await data.audio.arrayBuffer()));
    const ref = await addDoc(this.sub(childId, 'voiceNotes'), {
      createdAt,
      durationSec: data.durationSec,
      mimeType: data.mimeType,
      audio: bytes,
    });
    return { ...data, createdAt, id: ref.id };
  }

  async listVoiceNotes(childId: string): Promise<VoiceNote[]> {
    const snap = await getDocs(query(this.sub(childId, 'voiceNotes'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => {
      const v = d.data();
      const audio = new Blob([(v.audio as Bytes).toUint8Array() as BlobPart], { type: v.mimeType });
      return { id: d.id, createdAt: v.createdAt, durationSec: v.durationSec, mimeType: v.mimeType, audio };
    });
  }

  async deleteVoiceNote(childId: string, id: string) {
    await deleteDoc(doc(this.sub(childId, 'voiceNotes'), id));
  }
}
