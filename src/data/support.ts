import type { Difficulty, ExerciseGoal, FoodNeed, Option, Texture } from './types';

/**
 * "What is difficult for me?": Difficulty → Strategy → Activity → Progress.
 * Strategies for Writing/Reading/Maths/Listening/Attention come from the doc;
 * the rest come from the Lovable prototype and need school review.
 */
export const difficulties: Difficulty[] = [
  {
    id: 'writing',
    label: 'Writing',
    emoji: '✍️',
    tone: 'violet',
    statement: 'I have difficulty writing.',
    academic: true,
    strategies: [
      { label: 'Use a pencil grip', emoji: '✏️' },
      { label: 'Use ruled or raised-line paper', emoji: '📏' },
      { label: 'Practise one letter at a time', emoji: '🔠' },
      { label: 'Take short writing breaks', emoji: '🖐️' },
      { label: 'Use visual models', emoji: '👀' },
      { label: 'Ask for extra writing time', emoji: '⏳' },
      { label: 'Try typing when appropriate', emoji: '💻' },
      { label: 'Give oral answers when allowed', emoji: '🗣️' },
      { label: 'Copy less from the board', emoji: '📄' },
      { label: 'Notice your effort and progress', emoji: '⭐' },
    ],
    related: [
      { label: 'Fine motor activities', emoji: '🎾', href: '/support/exercise#motor' },
      { label: 'Take a short break', emoji: '🙆', activityId: 'stretch-reset' },
    ],
  },
  {
    id: 'reading',
    label: 'Reading',
    emoji: '📖',
    tone: 'sky',
    statement: 'I find reading hard.',
    academic: true,
    strategies: [
      { label: 'Use picture + word cards', emoji: '🖼️' },
      { label: 'Phonics practice', emoji: '🔤' },
      { label: 'Use large print', emoji: '🔍' },
      { label: 'Read together with someone', emoji: '👥' },
      { label: 'Repeated practice', emoji: '🔁' },
      { label: 'Use a ruler or finger to track lines', emoji: '📏' },
      { label: 'Listen to the text read aloud', emoji: '🎧' },
    ],
    related: [{ label: 'Turn on Read Aloud in settings', emoji: '🔊', href: '/settings' }],
  },
  {
    id: 'maths',
    label: 'Maths',
    emoji: '🔢',
    tone: 'sun',
    statement: 'I find maths difficult.',
    academic: true,
    strategies: [
      { label: 'Use objects like blocks or beads', emoji: '🧱' },
      { label: 'Use a number line', emoji: '📏' },
      { label: 'Look at visual examples', emoji: '🖼️' },
      { label: 'Break problems into small steps', emoji: '🪜' },
      { label: 'Get extra practice', emoji: '🔁' },
      { label: 'Use a checklist of steps', emoji: '✅' },
    ],
    related: [{ label: 'Break It Down', emoji: '🪜', activityId: 'break-it-down' }],
  },
  {
    id: 'listening',
    label: 'Listening',
    emoji: '👂',
    tone: 'teal',
    statement: 'I forget instructions.',
    academic: true,
    strategies: [
      { label: 'Get one step at a time', emoji: '1️⃣' },
      { label: 'Use visual cues', emoji: '👀' },
      { label: 'Ask to repeat important points', emoji: '🔁' },
      { label: 'Show the step back to the teacher', emoji: '🙋' },
      { label: 'Use a checklist', emoji: '✅' },
      { label: 'Sit near the teacher', emoji: '🪑' },
    ],
    related: [{ label: 'One Thing at a Time', emoji: '☝️', activityId: 'one-thing' }],
  },
  {
    id: 'attention',
    label: 'Attention',
    emoji: '🎯',
    tone: 'coral',
    statement: 'I cannot concentrate.',
    academic: true,
    strategies: [
      { label: 'Do short tasks', emoji: '⏱️' },
      { label: 'Use a visual timetable', emoji: '🗓️' },
      { label: 'Reduce distractions', emoji: '🔕' },
      { label: 'Take a movement break', emoji: '🏃' },
      { label: 'One instruction at a time', emoji: '1️⃣' },
      { label: 'Use headphones in noisy places', emoji: '🎧' },
    ],
    related: [
      { label: 'Focus-Pause-Focus', emoji: '⏱️', activityId: 'focus-pause' },
      { label: 'Clear My Space', emoji: '🧹', activityId: 'clear-space' },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    emoji: '🗣️',
    tone: 'peach',
    statement: 'It’s hard to say what I mean.',
    academic: false,
    strategies: [
      { label: 'Use picture or word cards', emoji: '🃏' },
      { label: 'Write it down first', emoji: '✍️' },
      { label: 'Ask for time to answer', emoji: '⏳' },
      { label: 'Use sentence starters: “I need…”, “I feel…”', emoji: '🗯️' },
      { label: 'Use gestures or a thumbs signal', emoji: '👍' },
      { label: 'Practise with a trusted person', emoji: '🤝' },
    ],
    related: [
      { label: 'Help me say it', emoji: '💬', href: '/talk/say-it' },
      { label: 'Voice It', emoji: '🎙️', activityId: 'voice-it' },
    ],
  },
  {
    id: 'social',
    label: 'Social Skills',
    emoji: '🤝',
    tone: 'rose',
    statement: 'Making or keeping friends is hard.',
    academic: false,
    strategies: [
      { label: 'Practise simple greetings', emoji: '👋' },
      { label: 'Join games with clear rules', emoji: '🎲' },
      { label: 'Use social stories', emoji: '📖' },
      { label: 'Ask a friend “Can I play?”', emoji: '🙋' },
      { label: 'Pause before responding', emoji: '⏸️' },
      { label: 'Use the THINK check', emoji: '💬' },
    ],
    related: [
      { label: 'Kind Words Challenge', emoji: '💌', activityId: 'kind-words' },
      { label: 'Social games', emoji: '🤝', href: '/support/exercise#social' },
    ],
  },
  {
    id: 'movement',
    label: 'Movement',
    emoji: '🏃',
    tone: 'lime',
    statement: 'Moving my body is hard sometimes.',
    academic: false,
    strategies: [
      { label: 'Start slow with simple moves', emoji: '🐢' },
      { label: 'Practise balance with support', emoji: '🧘' },
      { label: 'Play ball rolling and catching games', emoji: '🎾' },
      { label: 'Try small obstacle courses', emoji: '🪜' },
      { label: 'Rest between activities', emoji: '⏸️' },
    ],
    related: [{ label: 'Exercise & Movement', emoji: '🏃', href: '/support/exercise' }],
  },
  {
    id: 'calm',
    label: 'Staying Calm',
    emoji: '🧘',
    tone: 'mint',
    statement: 'I find it hard to stay calm.',
    academic: false,
    strategies: [
      { label: 'Slow breathing (4-4-4)', emoji: '🌬️' },
      { label: '5-4-3-2-1 grounding', emoji: '🖐️' },
      { label: 'Use a quiet space or headphones', emoji: '🎧' },
      { label: 'Sensory break with a fidget', emoji: '🧸' },
      { label: 'Say “I need a break”', emoji: '🗣️' },
      { label: 'Drink some water', emoji: '💧' },
    ],
    related: [
      { label: 'Slow Breathing', emoji: '🫧', activityId: 'slow-breathing' },
      { label: 'Calm & Sensory', emoji: '🧘', href: '/support/calm' },
    ],
  },
  {
    id: 'food',
    label: 'Food Choices',
    emoji: '🍎',
    tone: 'sun',
    statement: 'Choosing food is hard for me.',
    academic: false,
    strategies: [
      { label: 'Pick a texture that feels comfortable', emoji: '🥣' },
      { label: 'Try simple quick choices', emoji: '🍌' },
      { label: 'Small portions, one new food at a time', emoji: '🍽️' },
      { label: 'Eat at regular meal times', emoji: '⏰' },
      { label: 'Remember water', emoji: '💧' },
    ],
    related: [{ label: 'Food Support', emoji: '🍎', href: '/support/food' }],
  },
];

export const difficultyById = (id: string) => difficulties.find((d) => d.id === id);

/* ---------- 🏃 Exercise ---------- */

export const exerciseGoals: ExerciseGoal[] = [
  {
    id: 'balance',
    label: 'Balance',
    emoji: '🧍',
    tone: 'sky',
    activities: [
      { id: 'flamingo', name: 'Flamingo stand', emoji: '🦩', steps: ['Stand near a wall', 'Lift one foot a little', 'Count to 5', 'Switch feet'] },
      { id: 'line-walk', name: 'Line walk', emoji: '📏', steps: ['Put tape on the floor in a line', 'Walk heel-to-toe along it', 'Hold your arms out like wings', 'Walk back slowly'] },
      { id: 'cushion-steps', name: 'Cushion stepping', emoji: '🛋️', steps: ['Lay 4-5 cushions in a row', 'Step from one to the next', 'Go slowly', 'Try it backwards'] },
    ],
  },
  {
    id: 'strength',
    label: 'Strength',
    emoji: '💪',
    tone: 'coral',
    activities: [
      { id: 'wall-pushups', name: 'Wall push-ups', emoji: '🧱', steps: ['Stand an arm’s length from a wall', 'Put your hands flat on the wall', 'Bend your elbows and lean in', 'Push back. Repeat 5 times'] },
      { id: 'animal-walks', name: 'Animal walks', emoji: '🐻', steps: ['Bear walk on hands and feet', 'Crab walk sitting up', 'Frog jumps', 'Rest between each one'] },
      { id: 'sit-to-stand', name: 'Chair sit-to-stand', emoji: '🪑', steps: ['Sit on a sturdy chair', 'Stand up without using your hands', 'Sit down slowly', 'Repeat 5 times'] },
    ],
  },
  {
    id: 'coordination',
    label: 'Coordination',
    emoji: '🏃',
    tone: 'violet',
    activities: [
      { id: 'ball-rolling', name: 'Ball rolling', emoji: '⚽', steps: ['Sit facing a partner', 'Roll the ball to them', 'Catch it as it comes back', 'Try 10 rolls'] },
      { id: 'target-throwing', name: 'Target throwing', emoji: '🎯', steps: ['Place a bucket or hoop', 'Stand a few steps away', 'Throw a soft ball or beanbag in', 'Step back when it’s easy'] },
      { id: 'balloon-tapping', name: 'Balloon tapping', emoji: '🎈', steps: ['Blow up a balloon', 'Tap it up into the air', 'Keep it from touching the floor', 'Count your taps'] },
      { id: 'obstacle-course', name: 'Simple obstacle course', emoji: '🚧', steps: ['Set up: crawl under, step over, walk around', 'Walk through once slowly', 'Try it again', 'Add one new obstacle'] },
      { id: 'catch-throw', name: 'Catch-and-throw games', emoji: '🥎', steps: ['Stand close to a partner', 'Throw gently underarm', 'Catch with two hands', 'Take a small step back'] },
    ],
  },
  {
    id: 'motor',
    label: 'Motor skills',
    emoji: '🏸',
    tone: 'peach',
    activities: [
      { id: 'playdough', name: 'Playdough squeeze', emoji: '🟣', steps: ['Roll dough into a ball', 'Squeeze it with each hand', 'Make snakes and shapes', 'Pinch off small pieces'] },
      { id: 'pegs', name: 'Pegs and clips', emoji: '📎', steps: ['Clip clothes pegs onto the edge of a box', 'Use your thumb and finger', 'Take them off one by one', 'Try with the other hand'] },
      { id: 'beads', name: 'Bead threading', emoji: '📿', steps: ['Pick big beads and a lace', 'Thread one bead at a time', 'Make a pattern', 'Tie the ends'] },
    ],
  },
  {
    id: 'stamina',
    label: 'Stamina',
    emoji: '🫁',
    tone: 'teal',
    activities: [
      { id: 'music-march', name: 'Music march', emoji: '🎵', steps: ['Play a favourite song', 'March on the spot', 'Swing your arms', 'Keep going for the whole song'] },
      { id: 'walk-talk', name: 'Walk and talk', emoji: '🚶', steps: ['Go for a walk with an adult', 'Walk for 5 minutes', 'Add 1 minute each day', 'Notice things around you'] },
    ],
  },
  {
    id: 'flexibility',
    label: 'Flexibility',
    emoji: '🧘',
    tone: 'mint',
    activities: [
      { id: 'star-stretch', name: 'Star stretch', emoji: '⭐', steps: ['Stand with your feet apart', 'Reach your arms up and out like a star', 'Hold for 5', 'Relax'] },
      { id: 'cat-cow', name: 'Cat and cow', emoji: '🐈', steps: ['Go on your hands and knees', 'Round your back like a cat', 'Dip it like a cow', 'Repeat slowly 5 times'] },
    ],
  },
  {
    id: 'social',
    label: 'Social participation',
    emoji: '🤝',
    tone: 'rose',
    activities: [
      { id: 'pass-ball', name: 'Pass the ball circle', emoji: '🔵', steps: ['Stand in a circle', 'Say a name, then pass the ball', 'Catch it and say the next name', 'Keep it going'] },
      { id: 'parachute', name: 'Parachute or sheet game', emoji: '🪂', steps: ['Everyone holds the edge of a sheet', 'Lift it up together', 'Bounce a soft ball on it', 'Take turns calling actions'] },
    ],
  },
];

/* ---------- 🍎 Food ---------- */

export const foodNeeds: FoodNeed[] = [
  {
    id: 'mobility',
    label: 'Mobility & gross motor',
    emoji: '🏃',
    tone: 'coral',
    goal: 'Energy + muscle & bone support',
    foods: [
      { label: 'Milk / curd / paneer', emoji: '🥛' },
      { label: 'Egg', emoji: '🥚' },
      { label: 'Dal / rajma / chana', emoji: '🫘' },
      { label: 'Nuts & seeds, where appropriate', emoji: '🥜' },
      { label: 'Banana', emoji: '🍌' },
      { label: 'Green leafy vegetables', emoji: '🥬' },
      { label: 'Roti / oats / brown rice', emoji: '🌾' },
      { label: 'Water', emoji: '💧' },
    ],
    quick: ['🥛 Milk + 🍌 Banana', '🥣 Dal + 🌾 Roti', '🥛 Curd + 🍎 Fruit'],
  },
  {
    id: 'fine',
    label: 'Fine motor',
    emoji: '✋',
    tone: 'peach',
    goal: 'Balanced nutrition for growth and development',
    foods: [
      { label: 'Egg', emoji: '🥚' },
      { label: 'Milk / curd', emoji: '🥛' },
      { label: 'Paneer', emoji: '🧀' },
      { label: 'Dal / beans', emoji: '🫘' },
      { label: 'Apple / seasonal fruit', emoji: '🍎' },
      { label: 'Carrot / cucumber', emoji: '🥕' },
      { label: 'Oats / whole-grain roti', emoji: '🌾' },
      { label: 'Water', emoji: '💧' },
    ],
    quick: ['🧀 Paneer + 🌾 Roti', '🍎 Apple + 🥛 Milk'],
  },
  {
    id: 'attention',
    label: 'Attention & learning',
    emoji: '🧠',
    tone: 'violet',
    goal: 'Regular, balanced meals',
    foods: [
      { label: 'Oats / porridge', emoji: '🥣' },
      { label: 'Egg', emoji: '🥚' },
      { label: 'Milk / curd', emoji: '🥛' },
      { label: 'Banana / seasonal fruit', emoji: '🍌' },
      { label: 'Nuts, where appropriate', emoji: '🥜' },
      { label: 'Sprouts / chana', emoji: '🫘' },
      { label: 'Vegetables', emoji: '🥗' },
      { label: 'Water', emoji: '💧' },
    ],
    quick: ['🥣 Oats + 🥛 Milk + 🍌 Banana'],
  },
  {
    id: 'energy',
    label: 'Low energy / tiredness',
    emoji: '⚡',
    tone: 'sun',
    goal: 'Regular meals + nutrient-rich foods',
    foods: [
      { label: 'Egg', emoji: '🥚' },
      { label: 'Dal / rajma / chana', emoji: '🫘' },
      { label: 'Milk / curd', emoji: '🥛' },
      { label: 'Spinach / leafy vegetables', emoji: '🥬' },
      { label: 'Orange / guava / seasonal fruit', emoji: '🍊' },
      { label: 'Whole-grain roti', emoji: '🌾' },
      { label: 'Nuts, where appropriate', emoji: '🥜' },
      { label: 'Water', emoji: '💧' },
    ],
    quick: ['🫘 Rajma + 🍚 Rice', '🍊 Orange + 🥜 Nuts'],
  },
  {
    id: 'bone',
    label: 'Bones & growing',
    emoji: '🦴',
    tone: 'sky',
    goal: 'Calcium + vitamin D sources + protein',
    foods: [
      { label: 'Milk', emoji: '🥛' },
      { label: 'Curd', emoji: '🥣' },
      { label: 'Paneer', emoji: '🧀' },
      { label: 'Egg', emoji: '🥚' },
      { label: 'Dal / beans', emoji: '🫘' },
      { label: 'Green leafy vegetables', emoji: '🥬' },
      { label: 'Fish, where appropriate', emoji: '🐟' },
      { label: 'Fortified cereals / foods', emoji: '🌾' },
    ],
    quick: ['🥛 Milk + 🌾 Fortified cereal', '🧀 Paneer + 🥬 Palak'],
  },
];

export const textures: Texture[] = [
  { id: 'soft', label: 'Soft', emoji: '🥣', foods: ['Khichdi', 'Dal', 'Curd', 'Soft rice', 'Mashed vegetables'] },
  { id: 'crunchy', label: 'Crunchy', emoji: '🥕', foods: ['Cucumber', 'Carrot sticks', 'Toast', 'Roasted chana, where appropriate'] },
  { id: 'smooth', label: 'Smooth', emoji: '🍌', foods: ['Banana', 'Curd', 'Smooth porridge', 'Fruit purée'] },
  { id: 'mixed', label: 'Mixed', emoji: '🍱', foods: ['Poha with vegetables', 'Upma', 'Curd rice with cucumber', 'Fruit chaat'] },
];

/* ---------- 🧘 Calm & Sensory ---------- */

export const calmTools: { label: string; emoji: string; activityId: string }[] = [
  { label: 'Slow Breathing', emoji: '🫧', activityId: 'slow-breathing' },
  { label: '5-4-3-2-1 Reset', emoji: '🖐️', activityId: 'reset-54321' },
  { label: 'Calm Corner sounds', emoji: '🌙', activityId: 'calm-corner' },
  { label: 'Quiet Minute', emoji: '🍃', activityId: 'quiet-minute' },
];

export const sensoryBreaks: { id: string; title: string; emoji: string; tone: 'sky' | 'sun'; ideas: Option[] }[] = [
  {
    id: 'too-much',
    title: 'Everything feels too much or too loud',
    emoji: '🌊',
    tone: 'sky',
    ideas: [
      { label: 'Go to a quiet space', emoji: '🤫' },
      { label: 'Wear headphones', emoji: '🎧' },
      { label: 'Squeeze a soft ball or fidget', emoji: '🧸' },
      { label: 'Wrap up in a blanket', emoji: '🛏️' },
      { label: 'Push against a wall for 10 seconds', emoji: '🧱' },
      { label: 'Dim the lights', emoji: '🌙' },
      { label: 'Hug a soft toy', emoji: '🐻' },
    ],
  },
  {
    id: 'too-slow',
    title: 'I feel sleepy, slow or far away',
    emoji: '☀️',
    tone: 'sun',
    ideas: [
      { label: '10 jumping jacks', emoji: '🤸' },
      { label: 'Splash cool water on your face', emoji: '💧' },
      { label: 'Drink a glass of water', emoji: '🥤' },
      { label: 'Have a crunchy snack, where appropriate', emoji: '🥕' },
      { label: 'Carry some books (heavy work)', emoji: '📚' },
      { label: 'Play upbeat music', emoji: '🎵' },
      { label: 'Walk around the room', emoji: '🚶' },
    ],
  },
];
