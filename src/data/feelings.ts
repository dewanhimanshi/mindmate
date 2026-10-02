import type { Feeling, FeelingGroup, Option } from './types';

export const feelings: Feeling[] = [
  { id: 'happy', label: 'Happy', emoji: '😊', group: 'positive' },
  { id: 'calm', label: 'Calm', emoji: '😌', group: 'positive' },
  { id: 'excited', label: 'Excited', emoji: '🤩', group: 'positive' },
  { id: 'proud', label: 'Proud', emoji: '😁', group: 'positive' },
  { id: 'confident', label: 'Confident', emoji: '😎', group: 'positive' },
  { id: 'hopeful', label: 'Hopeful', emoji: '🌈', group: 'positive' },
  { id: 'relaxed', label: 'Relaxed', emoji: '🛋️', group: 'positive' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡', group: 'positive' },

  { id: 'okay', label: 'Okay', emoji: '🙂', group: 'neutral' },
  { id: 'tired', label: 'Tired', emoji: '😴', group: 'neutral' },
  { id: 'bored', label: 'Bored', emoji: '😑', group: 'neutral' },
  { id: 'confused', label: 'Confused', emoji: '😕', group: 'neutral' },
  { id: 'unmotivated', label: 'Unmotivated', emoji: '🫠', group: 'neutral' },
  { id: 'lonely', label: 'Lonely', emoji: '🥺', group: 'neutral' },

  { id: 'sad', label: 'Sad', emoji: '😢', group: 'difficult' },
  { id: 'worried', label: 'Worried', emoji: '😟', group: 'difficult' },
  { id: 'nervous', label: 'Nervous', emoji: '😬', group: 'difficult' },
  { id: 'angry', label: 'Angry', emoji: '😠', group: 'difficult' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😤', group: 'difficult' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😵‍💫', group: 'difficult' },
  { id: 'embarrassed', label: 'Embarrassed', emoji: '😳', group: 'difficult' },
  { id: 'left-out', label: 'Left out', emoji: '🫥', group: 'difficult' },
  { id: 'upset', label: 'Upset', emoji: '😣', group: 'difficult' },
  { id: 'scared', label: 'Scared', emoji: '😨', group: 'difficult' },
];

export const notSureFeeling: Feeling = {
  id: 'not-sure',
  label: "I don't know how I feel",
  emoji: '🤔',
  group: 'neutral',
};

export const feelingGroups: { id: FeelingGroup; title: string; tone: 'mint' | 'sky' | 'peach' }[] = [
  { id: 'positive', title: 'Good feelings', tone: 'mint' },
  { id: 'neutral', title: 'In-between feelings', tone: 'sky' },
  { id: 'difficult', title: 'Hard feelings', tone: 'peach' },
];

const all = [...feelings, notSureFeeling];
export const feelingById = (id: string): Feeling | undefined => all.find((f) => f.id === id);

/** "What's this about?": optional context after choosing needs. */
export const aboutOptions: Option[] = [
  { label: 'Something at school', emoji: '🏫' },
  { label: 'My friends', emoji: '🤝' },
  { label: 'Something at home', emoji: '🏠' },
  { label: 'Something online', emoji: '📱' },
  { label: 'Something that happened', emoji: '💭' },
  { label: "I don't know", emoji: '🤷' },
  { label: 'Something else', emoji: '📝' },
];

/** After an activity: "How do you feel now?" */
export const feelingAfter: Option[] = [
  { label: 'Much better', emoji: '😊' },
  { label: 'A bit better', emoji: '🙂' },
  { label: 'The same', emoji: '😐' },
  { label: 'Not better yet', emoji: '😟' },
];

/** "Did it help?": the doc's three-point scale. */
export const helpfulness: Option[] = [
  { label: 'Helped a lot', emoji: '😊' },
  { label: 'Helped a little', emoji: '🙂' },
  { label: "Didn't help this time", emoji: '😐' },
];
