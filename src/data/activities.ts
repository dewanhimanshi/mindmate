import type { Activity } from './types';

/**
 * Well-being activities from the MindMate doc ("Help me feel better"),
 * three per need. Interactive tools (grounding, breathing, timers, express)
 * follow the Lovable prototype.
 */
export const activities: Activity[] = [
  // 🧘 I need to calm down
  {
    id: 'reset-54321',
    title: '5-4-3-2-1 Reset',
    emoji: '🖐️',
    summary: 'Notice things around you, one sense at a time.',
    minutes: 3,
    helped: 'quiet',
    steps: [{ type: 'grounding' }],
  },
  {
    id: 'slow-breathing',
    title: 'Slow Breathing',
    emoji: '🫧',
    summary: 'Breathe in slowly, pause, breathe out slowly. 5 times.',
    minutes: 2,
    helped: 'breathing',
    steps: [{ type: 'breathing', rounds: 5, inhale: 4, hold: 4, exhale: 4 }],
  },
  {
    id: 'calm-corner',
    title: 'Calm Corner',
    emoji: '🌙',
    summary: 'Two quiet minutes noticing your surroundings.',
    minutes: 2,
    helped: 'quiet',
    steps: [
      { type: 'info', emoji: '📵', text: 'Put your phone aside and sit somewhere comfortable.' },
      { type: 'sound', prompt: 'Pick a calm sound, or choose silence. Just notice what is around you.', seconds: 120 },
    ],
  },

  // 🎯 I need help focusing
  {
    id: 'one-thing',
    title: 'One Thing at a Time',
    emoji: '☝️',
    summary: 'Choose one small task and work only on that for 5 minutes.',
    minutes: 5,
    helped: 'focus',
    steps: [
      { type: 'prompt', prompt: 'What is one small task you can do now?', placeholder: 'e.g. Finish 3 maths questions' },
      { type: 'timer', seconds: 300, label: 'Work on just this one thing', emoji: '🎯' },
    ],
  },
  {
    id: 'focus-pause',
    title: 'Focus-Pause-Focus',
    emoji: '⏱️',
    summary: 'Focus for 3 minutes, move for 30 seconds, then focus again.',
    minutes: 7,
    helped: 'focus',
    steps: [
      { type: 'timer', seconds: 180, label: 'Focus', emoji: '🎯' },
      { type: 'timer', seconds: 30, label: 'Movement break! Stretch or wiggle.', emoji: '🤸' },
      { type: 'timer', seconds: 180, label: 'Focus again', emoji: '🎯' },
    ],
  },
  {
    id: 'clear-space',
    title: 'Clear My Space',
    emoji: '🧹',
    summary: 'Find three distracting things and move them away.',
    minutes: 2,
    helped: 'focus',
    steps: [
      { type: 'list', prompt: 'Look around. What 3 things are distracting you?', count: 3, placeholder: 'e.g. phone' },
      { type: 'info', emoji: '📦', text: 'Now move those things out of sight. Your space is ready!' },
    ],
  },

  // 😴 I need a break
  {
    id: 'stretch-reset',
    title: 'Stretch & Reset',
    emoji: '🙆',
    summary: 'Stretch your arms, shoulders and legs for a minute or two.',
    minutes: 2,
    helped: 'movement',
    steps: [
      { type: 'info', emoji: '🙌', text: 'Reach your arms up high. Then roll your shoulders slowly.' },
      { type: 'timer', seconds: 90, label: 'Stretch arms, shoulders and legs', emoji: '🙆' },
    ],
  },
  {
    id: 'look-away',
    title: 'Look Away',
    emoji: '👀',
    summary: 'Look away from your screen or work for one minute.',
    minutes: 1,
    helped: 'quiet',
    steps: [{ type: 'timer', seconds: 60, label: 'Look at something in the room, far from your work', emoji: '🪟' }],
  },
  {
    id: 'quiet-minute',
    title: 'Quiet Minute',
    emoji: '🍃',
    summary: 'A few slow breaths and one minute of doing nothing.',
    minutes: 2,
    helped: 'quiet',
    steps: [
      { type: 'breathing', rounds: 3, inhale: 4, hold: 2, exhale: 4 },
      { type: 'timer', seconds: 60, label: 'Sit quietly. You don’t have to do anything.', emoji: '🍃' },
    ],
  },

  // 💬 I want to talk to someone
  {
    id: 'who-can-i-talk-to',
    title: 'Who Can I Talk To?',
    emoji: '🤝',
    summary: 'Choose someone you trust.',
    minutes: 1,
    helped: 'talking',
    steps: [
      {
        type: 'choose',
        prompt: 'Who do you trust to talk to?',
        options: [
          { label: 'Parent', emoji: '👪' },
          { label: 'Teacher', emoji: '🧑‍🏫' },
          { label: 'School counsellor', emoji: '👩‍🏫' },
          { label: 'Sibling', emoji: '🧒' },
          { label: 'Friend', emoji: '🤝' },
          { label: 'Another trusted adult', emoji: '🫶' },
        ],
      },
      { type: 'info', emoji: '🌱', text: 'Great choice. When you are ready, find them and say: “Can I talk to you about something?”' },
    ],
  },
  {
    id: 'start-conversation',
    title: 'Start the Conversation',
    emoji: '💬',
    summary: 'Finish the sentence to get started.',
    minutes: 2,
    helped: 'talking',
    steps: [{ type: 'sentence', prompt: 'Finish this sentence. You can show it or read it out.', template: 'I want to talk about something because ___' }],
  },
  {
    id: 'help-me-say-it',
    title: 'Help Me Say It',
    emoji: '🗣️',
    summary: 'Choose what kind of help you want.',
    minutes: 1,
    helped: 'talking',
    steps: [
      {
        type: 'choose',
        prompt: 'What do you want from the conversation?',
        options: [
          { label: 'I need advice', emoji: '💡' },
          { label: 'I need someone to listen', emoji: '👂' },
          { label: 'I need help solving something', emoji: '🧩' },
        ],
      },
      { type: 'info', emoji: '💬', text: 'Say that sentence to your trusted person. It helps them know how to help you.' },
    ],
  },

  // 🤝 I need help with a friendship
  {
    id: 'what-happened',
    title: 'What Happened?',
    emoji: '❓',
    summary: 'Name what happened with your friend.',
    minutes: 1,
    helped: 'writing',
    steps: [
      {
        type: 'choose',
        prompt: 'What happened?',
        options: [
          { label: 'Misunderstanding', emoji: '😕' },
          { label: 'Argument', emoji: '😤' },
          { label: 'Feeling left out', emoji: '🫥' },
          { label: 'Hurt by something', emoji: '💔' },
          { label: 'Other', emoji: '📝' },
        ],
      },
      { type: 'info', emoji: '💛', text: 'Friendships have ups and downs. Naming what happened is a good first step.' },
    ],
  },
  {
    id: 'pause-before-respond',
    title: 'Pause Before I Respond',
    emoji: '⏸️',
    summary: 'Think before you reply.',
    minutes: 3,
    helped: 'writing',
    steps: [
      { type: 'prompt', prompt: 'What happened?' },
      { type: 'prompt', prompt: 'What am I feeling?' },
      { type: 'prompt', prompt: 'What do I want to happen next?' },
    ],
  },
  {
    id: 'kind-words',
    title: 'Kind Words Challenge',
    emoji: '💌',
    summary: 'Practise one kind sentence.',
    minutes: 2,
    helped: 'talking',
    steps: [{ type: 'sentence', prompt: 'Fill in the blanks, then practise saying it.', template: 'I felt ___ when ___ happened. Can we talk about it?' }],
  },

  // 🏫 I need help with something at school
  {
    id: 'name-school-problem',
    title: 'Name the Problem',
    emoji: '🏷️',
    summary: 'What is the problem about?',
    minutes: 1,
    helped: 'writing',
    steps: [
      {
        type: 'choose',
        prompt: 'What is it about?',
        options: [
          { label: 'Studies', emoji: '📚' },
          { label: 'Teacher', emoji: '🧑‍🏫' },
          { label: 'Friends', emoji: '🤝' },
          { label: 'Classroom', emoji: '🏫' },
          { label: 'Pressure', emoji: '😰' },
          { label: 'Something else', emoji: '📝' },
        ],
      },
    ],
  },
  {
    id: 'make-it-smaller',
    title: 'Make It Smaller',
    emoji: '🔍',
    summary: 'Find one small part you can deal with today.',
    minutes: 2,
    helped: 'writing',
    steps: [{ type: 'prompt', prompt: 'What is one small part of this problem I can deal with today?' }],
  },
  {
    id: 'my-next-step',
    title: 'My Next Step',
    emoji: '👣',
    summary: 'Choose what you will do next.',
    minutes: 1,
    helped: 'focus',
    steps: [
      {
        type: 'choose',
        prompt: 'What will you do next?',
        options: [
          { label: 'Try it myself', emoji: '💪' },
          { label: 'Ask a teacher', emoji: '🙋' },
          { label: 'Talk to a trusted adult', emoji: '🫶' },
          { label: 'Take a short break and try later', emoji: '⏸️' },
        ],
      },
    ],
  },

  // 🏠 I need help with something at home
  {
    id: 'name-home-feeling',
    title: 'Name the Feeling',
    emoji: '🏷️',
    summary: 'Choose the feeling that fits.',
    minutes: 1,
    helped: 'writing',
    steps: [
      {
        type: 'choose',
        prompt: 'How does it make you feel?',
        options: [
          { label: 'Upset', emoji: '😣' },
          { label: 'Angry', emoji: '😠' },
          { label: 'Worried', emoji: '😟' },
          { label: 'Sad', emoji: '😢' },
          { label: 'Confused', emoji: '😕' },
          { label: 'Other', emoji: '📝' },
        ],
      },
    ],
  },
  {
    id: 'write-it-down',
    title: 'Write It Down',
    emoji: '📝',
    summary: 'Finish the sentence.',
    minutes: 2,
    helped: 'writing',
    steps: [{ type: 'sentence', prompt: 'Finish the sentence in your own words.', template: 'I wish someone understood that ___' }],
  },
  {
    id: 'find-trusted-person',
    title: 'Find a Trusted Person',
    emoji: '🫶',
    summary: 'Choose a safe person and practise what to say.',
    minutes: 2,
    helped: 'talking',
    steps: [
      {
        type: 'choose',
        prompt: 'Who is a safe person you can talk to?',
        options: [
          { label: 'Parent or caregiver', emoji: '👪' },
          { label: 'Grandparent or relative', emoji: '👵' },
          { label: 'Teacher', emoji: '🧑‍🏫' },
          { label: 'School counsellor', emoji: '👩‍🏫' },
          { label: 'Another trusted adult', emoji: '🤝' },
        ],
      },
      { type: 'info', emoji: '🗣️', text: 'Practise saying: “Can I talk to you about something?”', speak: 'Can I talk to you about something?' },
    ],
  },

  // 📱 I need help with something online
  {
    id: 'pause-online',
    title: 'Pause Before Responding',
    emoji: '📵',
    summary: 'Put the phone down for one minute before replying.',
    minutes: 1,
    helped: 'quiet',
    steps: [
      { type: 'info', emoji: '📱', text: 'Put your phone down. You don’t have to reply right now.' },
      { type: 'timer', seconds: 60, label: 'Phone down. Breathe.', emoji: '🫁' },
    ],
  },
  {
    id: 'think-check',
    title: 'THINK Check',
    emoji: '🧠',
    summary: 'Is it True, Helpful, Kind, Necessary and Safe?',
    minutes: 2,
    helped: 'focus',
    steps: [
      {
        type: 'checklist',
        prompt: 'Before you post or reply, tick each one that is true:',
        items: [
          { label: 'Is it True?', emoji: '✅' },
          { label: 'Is it Helpful?', emoji: '🤲' },
          { label: 'Is it Kind?', emoji: '💛' },
          { label: 'Is it Necessary?', emoji: '❗' },
          { label: 'Is it Safe?', emoji: '🛡️' },
        ],
      },
      { type: 'info', emoji: '💡', text: 'If you could not tick them all, it might be better not to send it.' },
    ],
  },
  {
    id: 'get-help-online',
    title: 'Get Help',
    emoji: '🛟',
    summary: 'If something online feels wrong: save, don’t engage, tell.',
    minutes: 1,
    helped: 'talking',
    steps: [
      { type: 'info', emoji: '📸', text: 'Step 1: Save the information. Take a screenshot.' },
      { type: 'info', emoji: '🙅', text: 'Step 2: Don’t engage. You don’t have to reply.' },
      { type: 'info', emoji: '🧑‍🏫', text: 'Step 3: Tell a trusted adult. You are not in trouble.' },
    ],
  },

  // ❤️ I need some encouragement
  {
    id: 'my-small-win',
    title: 'My Small Win',
    emoji: '⭐',
    summary: 'Write one thing you did well today.',
    minutes: 1,
    helped: 'writing',
    steps: [{ type: 'prompt', prompt: 'What is one thing you did well today? Even something small counts!', placeholder: 'e.g. I asked for help' }],
  },
  {
    id: 'strength-reminder',
    title: 'Strength Reminder',
    emoji: '💪',
    summary: 'Choose three qualities you have.',
    minutes: 1,
    helped: 'creative',
    steps: [
      {
        type: 'choose',
        prompt: 'Choose three words that describe you:',
        multi: true,
        max: 3,
        options: [
          { label: 'Kind', emoji: '💛' },
          { label: 'Brave', emoji: '🦁' },
          { label: 'Creative', emoji: '🎨' },
          { label: 'Helpful', emoji: '🤲' },
          { label: 'Patient', emoji: '🐢' },
          { label: 'Hard-working', emoji: '💪' },
          { label: 'Curious', emoji: '🔍' },
          { label: 'Caring', emoji: '🫶' },
        ],
      },
    ],
  },
  {
    id: 'try-again',
    title: 'Try Again Message',
    emoji: '🔁',
    summary: 'Remind yourself you can keep trying.',
    minutes: 1,
    helped: 'writing',
    steps: [{ type: 'sentence', prompt: 'Finish the sentence.', template: 'I may not have got it right yet, but I can ___' }],
  },

  // 🧠 I want to understand my feelings
  {
    id: 'name-it',
    title: 'Name It',
    emoji: '🏷️',
    summary: 'Choose the feeling that fits best.',
    minutes: 1,
    helped: 'writing',
    steps: [
      {
        type: 'choose',
        prompt: 'Which feeling fits best right now?',
        options: [
          { label: 'Happy', emoji: '😊' },
          { label: 'Sad', emoji: '😢' },
          { label: 'Worried', emoji: '😟' },
          { label: 'Angry', emoji: '😠' },
          { label: 'Tired', emoji: '😴' },
          { label: 'Confused', emoji: '😕' },
          { label: 'Lonely', emoji: '🥺' },
          { label: 'Overwhelmed', emoji: '😵‍💫' },
        ],
      },
    ],
  },
  {
    id: 'what-triggered',
    title: 'What Triggered It?',
    emoji: '⚡',
    summary: 'What made you feel this way?',
    minutes: 1,
    helped: 'writing',
    steps: [
      {
        type: 'choose',
        prompt: 'What made you feel this way?',
        options: [
          { label: 'Something happened', emoji: '💭' },
          { label: 'Someone said something', emoji: '🗯️' },
          { label: 'School', emoji: '🏫' },
          { label: 'Home', emoji: '🏠' },
          { label: 'Online', emoji: '📱' },
          { label: "I don't know", emoji: '🤷' },
        ],
      },
    ],
  },
  {
    id: 'what-do-i-need',
    title: 'What Do I Need?',
    emoji: '🎁',
    summary: 'Choose what would help most.',
    minutes: 1,
    helped: 'writing',
    steps: [
      {
        type: 'choose',
        prompt: 'What do you need most?',
        options: [
          { label: 'Rest', emoji: '😴' },
          { label: 'Support', emoji: '🤗' },
          { label: 'Space', emoji: '🌌' },
          { label: 'Understanding', emoji: '💛' },
          { label: 'Encouragement', emoji: '📣' },
          { label: 'A solution', emoji: '🧩' },
        ],
      },
    ],
  },

  // 👂 I need someone to listen
  {
    id: 'get-it-out',
    title: 'Get It Out',
    emoji: '✍️',
    summary: 'Write or draw freely for 2 minutes. No spelling rules!',
    minutes: 2,
    helped: 'writing',
    steps: [{ type: 'express', prompt: 'Write or draw whatever is on your mind. Spelling doesn’t matter.', seconds: 120 }],
  },
  {
    id: 'voice-it',
    title: 'Voice It',
    emoji: '🎙️',
    summary: 'Record a short voice note about what is on your mind.',
    minutes: 1,
    helped: 'talking',
    steps: [{ type: 'voice', prompt: 'Press record and say what is on your mind. Up to 60 seconds.', maxSeconds: 60 }],
  },
  {
    id: 'what-do-i-want',
    title: 'What Do I Want?',
    emoji: '🤔',
    summary: 'Choose what you want right now.',
    minutes: 1,
    helped: 'talking',
    steps: [
      {
        type: 'choose',
        prompt: 'What do you want right now?',
        options: [
          { label: 'I want someone to listen', emoji: '👂' },
          { label: 'I want advice', emoji: '💡' },
          { label: 'I want help', emoji: '🤝' },
          { label: 'I just needed to express it', emoji: '🎈' },
        ],
      },
    ],
  },

  // 💪 I need motivation
  {
    id: 'start-2-minutes',
    title: 'Start for 2 Minutes',
    emoji: '🚀',
    summary: 'Do just the first 2 minutes of a task.',
    minutes: 2,
    helped: 'focus',
    steps: [
      { type: 'prompt', prompt: 'Which task will you start?', placeholder: 'e.g. Read one page' },
      { type: 'timer', seconds: 120, label: 'Just 2 minutes. You can do it!', emoji: '🚀' },
    ],
  },
  {
    id: 'break-it-down',
    title: 'Break It Down',
    emoji: '🪜',
    summary: 'Turn one big task into 3 small steps.',
    minutes: 3,
    helped: 'focus',
    steps: [
      { type: 'prompt', prompt: 'What is the big task?' },
      { type: 'list', prompt: 'Break it into 3 small steps:', count: 3, placeholder: 'Step' },
    ],
  },
  {
    id: 'progress-not-perfect',
    title: 'Progress, Not Perfect',
    emoji: '🌱',
    summary: 'Choose one thing to improve a little today.',
    minutes: 1,
    helped: 'writing',
    steps: [{ type: 'prompt', prompt: 'What is one thing you can improve just a little today?' }],
  },

  // 🌿 I want to feel better
  {
    id: 'mood-booster',
    title: 'Mood Booster',
    emoji: '🎈',
    summary: 'Choose one thing that lifts your mood.',
    minutes: 5,
    helped: 'creative',
    steps: [
      {
        type: 'choose',
        prompt: 'Choose one mood booster:',
        options: [
          { label: 'Music', emoji: '🎵' },
          { label: 'Draw', emoji: '🎨' },
          { label: 'Walk', emoji: '🚶' },
          { label: 'Read', emoji: '📖' },
          { label: 'Spend time outdoors', emoji: '🌱' },
        ],
      },
      { type: 'timer', seconds: 300, label: 'Enjoy your mood booster', emoji: '🎈', optional: true },
    ],
  },
  {
    id: 'gratitude',
    title: 'Gratitude Moment',
    emoji: '🙏',
    summary: 'Think of 3 small things that made today better.',
    minutes: 2,
    helped: 'writing',
    steps: [{ type: 'list', prompt: 'What are 3 small things that made today better?', count: 3, placeholder: 'e.g. My lunch' }],
  },
  {
    id: 'enjoy-10',
    title: 'Do Something You Enjoy',
    emoji: '🎮',
    summary: 'Give yourself 10 minutes for something you enjoy.',
    minutes: 10,
    helped: 'creative',
    steps: [
      { type: 'prompt', prompt: 'What small thing do you enjoy?', placeholder: 'e.g. Playing with Lego' },
      { type: 'timer', seconds: 600, label: 'Enjoy it! This time is for you.', emoji: '🎉', optional: true },
    ],
  },
];

export const activityById = (id: string): Activity | undefined => activities.find((a) => a.id === id);
