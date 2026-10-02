import type { Option, TalkPerson } from './types';

/** "I Want to Talk": doc content, with Lovable's "how" tips and Trusted Adult. */
export const talkPeople: TalkPerson[] = [
  {
    id: 'counsellor',
    name: 'School Counsellor',
    emoji: '🧑‍🏫',
    tone: 'violet',
    when: [
      'You are worried about something.',
      'You are finding it difficult to manage your feelings.',
      'You are having problems with friends or school.',
      'Something has happened that you don’t know how to handle.',
      'You simply want someone to listen.',
    ],
    how: [
      'Ask your teacher when the counsellor is free.',
      'Go to their room and knock. It’s okay to be nervous.',
      'You can bring a written note if talking is hard.',
    ],
    starters: [
      'Can I talk to you about something?',
      'There is something bothering me and I need some help.',
      'I don’t know how to explain it, but I would like to talk.',
    ],
  },
  {
    id: 'teacher',
    name: 'Teacher',
    emoji: '👩‍🏫',
    tone: 'sky',
    when: [
      'Something at school is bothering you.',
      'You are having difficulty with a class or schoolwork.',
      'You are having a problem with another student.',
      'You need help finding the right person to talk to.',
    ],
    how: [
      'Wait until the end of class or a quiet moment.',
      'Say you would like to talk privately.',
      'Show them a note or your Show It card.',
    ],
    starters: [
      'Ma’am/Sir, can I talk to you privately?',
      'I need some help with something.',
      'Something happened and I don’t know what to do.',
    ],
  },
  {
    id: 'parent',
    name: 'Parent / Caregiver',
    emoji: '👪',
    tone: 'peach',
    when: [
      'You are feeling upset, worried or overwhelmed.',
      'Something is bothering you at home, school or online.',
      'You need advice or support.',
      'You simply want someone to listen.',
    ],
    how: [
      'Pick a calm time, like a walk, a car ride or bedtime.',
      'Start small: “Can I tell you something?”',
      'It’s okay to say you don’t know how to explain it.',
    ],
    starters: [
      'Can we talk? Something has been on my mind.',
      'I need your help with something.',
      'I don’t need a solution right now. I just want you to listen.',
    ],
  },
  {
    id: 'trusted',
    name: 'Trusted Adult',
    emoji: '🤝',
    tone: 'mint',
    when: [
      'You don’t feel ready to talk to parents or teachers.',
      'You need someone safe to listen.',
      'Something online or outside school is worrying you.',
    ],
    how: [
      'Think of an adult who makes you feel safe, like a relative, coach or neighbour.',
      'Ask if they have a few minutes.',
      'You don’t have to explain everything at once.',
    ],
    starters: ['Do you have a few minutes to talk?', 'Something is bothering me.', 'I need help.'],
  },
];

export const talkPersonById = (id: string) => talkPeople.find((p) => p.id === id);

export const starters: string[] = [
  'Can I talk to you privately?',
  'I need help.',
  'Something is bothering me.',
  'Can I tell you how I’m feeling?',
  'I need advice.',
  'I need someone to listen.',
  'I need help solving something.',
  'I don’t know how to explain it, but I’m not okay.',
];

export const talkTopics: Option[] = [
  { label: 'my feelings', emoji: '❤️' },
  { label: 'something at school', emoji: '🏫' },
  { label: 'my friends', emoji: '🤝' },
  { label: 'something at home', emoji: '🏠' },
  { label: 'something online', emoji: '📱' },
  { label: 'something worrying me', emoji: '😟' },
  { label: 'something that happened', emoji: '💭' },
  { label: 'something I can’t explain', emoji: '🔶' },
];

export const askWays: { id: string; title: string; emoji: string; text: string }[] = [
  { id: 'say', title: 'Say it', emoji: '🗣️', text: 'Use one of the suggested sentences to start a conversation.' },
  { id: 'write', title: 'Write it', emoji: '✍️', text: 'Write down what you want to say and show it to the person.' },
  { id: 'show', title: 'Show it', emoji: '🪪', text: 'Choose a feeling and a topic if finding the words feels hard.' },
  { id: 'private', title: 'Ask for privacy', emoji: '🚪', text: 'You can say: “Can I talk to you privately?”' },
];
