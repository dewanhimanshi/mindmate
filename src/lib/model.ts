/** Persisted data shapes shared by the Firestore and local (guest) repositories. */

export type TextSize = 's' | 'm' | 'l' | 'xl';
export type ThemePref = 'system' | 'light' | 'dark';

export interface Settings {
  /** Show 🔊 read-aloud buttons. */
  tts: boolean;
  /** Read each new question aloud automatically. */
  autoRead: boolean;
  rate: number;
  voiceURI?: string;
  textSize: TextSize;
  contrast: 'normal' | 'high';
  theme: ThemePref;
  calmMode: boolean;
  sounds: boolean;
}

export const defaultSettings: Settings = {
  tts: true,
  autoRead: false,
  rate: 0.95,
  textSize: 'm',
  contrast: 'normal',
  theme: 'system',
  calmMode: false,
  sounds: false,
};

export interface Child {
  id: string;
  name: string;
  avatar: string;
  color: string;
  createdAt: number;
  settings: Settings;
  texture?: string;
  strengths?: string[];
  proudOf?: string;
}

export type CheckinSource = 'checkin' | 'activity' | 'not-sure' | 'understand';

/** Answers a child gave inside an activity, keyed by step index. */
export type StepAnswers = Record<string, string | string[]>;

export interface Checkin {
  id: string;
  createdAt: number;
  source: CheckinSource;
  feeling?: string;
  needs: string[];
  about?: string;
  activityId?: string;
  answers?: StepAnswers;
  /** Index into `feelingAfter`. */
  feelingAfter?: number;
  /** Index into `helpfulness`: 0 = a lot, 1 = a little, 2 = didn't help. */
  helpfulness?: number;
  note?: string;
}

export type ActivityLogKind = 'strategy' | 'exercise' | 'calm' | 'food';

export interface ActivityLog {
  id: string;
  createdAt: number;
  kind: ActivityLogKind;
  refId: string;
  label: string;
  emoji?: string;
  difficultyId?: string;
}

export interface Win {
  id: string;
  createdAt: number;
  text: string;
  category?: string;
}

export interface VoiceNote {
  id: string;
  createdAt: number;
  durationSec: number;
  mimeType: string;
  audio: Blob;
}

export type NewChild = Omit<Child, 'id' | 'createdAt'>;
export type New<T extends { id: string; createdAt: number }> = Omit<T, 'id' | 'createdAt'> & { createdAt?: number };

export interface Repo {
  readonly kind: 'firestore' | 'local';
  listChildren(): Promise<Child[]>;
  getChild(id: string): Promise<Child | undefined>;
  createChild(data: NewChild): Promise<Child>;
  updateChild(id: string, patch: Partial<Omit<Child, 'id'>>): Promise<void>;
  deleteChild(id: string): Promise<void>;

  addCheckin(childId: string, data: New<Checkin>): Promise<Checkin>;
  listCheckins(childId: string, sinceMs?: number): Promise<Checkin[]>;

  addActivityLog(childId: string, data: New<ActivityLog>): Promise<ActivityLog>;
  listActivityLogs(childId: string, sinceMs?: number): Promise<ActivityLog[]>;

  addWin(childId: string, data: New<Win>): Promise<Win>;
  listWins(childId: string): Promise<Win[]>;
  deleteWin(childId: string, id: string): Promise<void>;

  addVoiceNote(childId: string, data: New<VoiceNote>): Promise<VoiceNote>;
  listVoiceNotes(childId: string): Promise<VoiceNote[]>;
  deleteVoiceNote(childId: string, id: string): Promise<void>;
}
