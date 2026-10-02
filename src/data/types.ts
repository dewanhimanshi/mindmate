export type Tone =
  | 'mint'
  | 'sky'
  | 'peach'
  | 'lilac'
  | 'sun'
  | 'rose'
  | 'teal'
  | 'coral'
  | 'violet'
  | 'lime';

export type FeelingGroup = 'positive' | 'neutral' | 'difficult';

export interface Feeling {
  id: string;
  label: string;
  emoji: string;
  group: FeelingGroup;
}

export interface Option {
  label: string;
  emoji?: string;
}

/** Categories used by "What helped me?" in My Progress. */
export type HelpedType =
  | 'breathing'
  | 'creative'
  | 'movement'
  | 'writing'
  | 'focus'
  | 'quiet'
  | 'talking';

/** One screen inside an activity. The ActivityPlayer renders each type. */
export type Step =
  | { type: 'info'; text: string; emoji?: string; speak?: string }
  | { type: 'breathing'; rounds: number; inhale: number; hold: number; exhale: number }
  | { type: 'grounding' }
  | { type: 'timer'; seconds: number; label: string; emoji?: string; optional?: boolean }
  | { type: 'choose'; prompt: string; options: Option[]; multi?: boolean; max?: number }
  | { type: 'prompt'; prompt: string; placeholder?: string }
  /** Fill-in sentence; each `___` becomes an input. */
  | { type: 'sentence'; prompt: string; template: string }
  | { type: 'list'; prompt: string; count: number; placeholder?: string }
  | { type: 'checklist'; prompt: string; items: Option[] }
  | { type: 'express'; prompt: string; seconds?: number }
  | { type: 'voice'; prompt: string; maxSeconds: number }
  | { type: 'sound'; prompt: string; seconds: number };

export interface Activity {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  minutes: number;
  helped: HelpedType;
  steps: Step[];
}

export interface Need {
  id: string;
  label: string;
  short: string;
  emoji: string;
  tone: Tone;
  activityIds: string[];
}

export interface RelatedLink {
  label: string;
  emoji: string;
  /** Either an activity id (played in the ActivityPlayer) or an in-app path. */
  activityId?: string;
  href?: string;
}

export interface Difficulty {
  id: string;
  label: string;
  emoji: string;
  tone: Tone;
  statement: string;
  academic: boolean;
  strategies: Option[];
  related: RelatedLink[];
}

export interface ExerciseActivity {
  id: string;
  name: string;
  emoji: string;
  steps: string[];
}

export interface ExerciseGoal {
  id: string;
  label: string;
  emoji: string;
  tone: Tone;
  activities: ExerciseActivity[];
}

export interface FoodNeed {
  id: string;
  label: string;
  emoji: string;
  tone: Tone;
  goal: string;
  foods: Option[];
  quick: string[];
}

export interface Texture {
  id: string;
  label: string;
  emoji: string;
  foods: string[];
}

export interface TalkPerson {
  id: string;
  name: string;
  emoji: string;
  tone: Tone;
  when: string[];
  how: string[];
  starters: string[];
}
