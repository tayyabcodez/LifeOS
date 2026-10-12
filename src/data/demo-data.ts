export type DimensionId = 'study' | 'focus' | 'health' | 'sleep' | 'money' | 'goals';

export interface DimensionData {
  id: DimensionId;
  score: number;
  weekDelta: number;
  status: 'strong' | 'steady' | 'attention' | 'behind';
}

export const demoUser = {
  name: "Alex",
  age: 20,
  course: "Business (Marketing)",
};

export const demoDimensions: Record<DimensionId, DimensionData> = {
  study: { id: 'study', score: 82, weekDelta: 14, status: 'strong' },
  focus: { id: 'focus', score: 84, weekDelta: 3, status: 'strong' },
  health: { id: 'health', score: 68, weekDelta: 2, status: 'steady' },
  sleep: { id: 'sleep', score: 61, weekDelta: -4, status: 'attention' },
  money: { id: 'money', score: 74, weekDelta: 1, status: 'steady' },
  goals: { id: 'goals', score: 79, weekDelta: 5, status: 'steady' },
};

export const demoBalance = 74;

export const demoToday = {
  priorities: 2,
  sleep: "6h 42m",
  steps: 4820,
  weeklyGoal: 72,
};

export const demoExam = {
  subject: "Marketing",
  daysLeft: 3,
};

export const demoNextActions: Record<DimensionId, string> = {
  study: "Marketing — Segmentation · 45 min",
  sleep: "Wind down by 11:00pm · phone away 10:45",
  health: "20-minute walk after lunch",
  money: "Skip one delivery order this week (save ~$12)",
  goals: "Finish 4Ps summary notes",
  focus: "Protect 9–11am for deep work",
};

export const demoRhythm = {
  focus: [
    { time: '6am', value: 20 },
    { time: '10am', value: 90 },
    { time: '3pm', value: 30 },
    { time: '7pm', value: 60 },
  ],
  energy: [
    { time: '6am', value: 40 },
    { time: '11am', value: 85 },
    { time: '4pm', value: 35 },
    { time: '8pm', value: 50 },
  ],
  recovery: [
    { time: '6am', value: 100 },
    { time: '10am', value: 80 },
    { time: '3pm', value: 60 },
    { time: '9pm', value: 85 },
  ],
};

export const HERO_SERIES: number[][] = [
  [76, 78, 79, 80, 81, 82, 82], // Study
  [80, 82, 81, 83, 85, 84, 84], // Focus
  [64, 66, 65, 67, 66, 67, 68], // Health
  [72, 70, 68, 66, 64, 63, 61], // Sleep
  [70, 72, 71, 73, 72, 74, 74], // Money
  [74, 75, 76, 77, 78, 79, 79], // Goals
];

export const HERO_ADVICE: Array<[string, 'good' | 'warn' | 'neutral', string]> = [
  ['On track', 'good', 'On track for your exam in 3 days. Two focused hours today keeps it there.'],
  ['Strong', 'good', 'Your best hours are before noon. Protect them for the hardest topics.'],
  ['Below target', 'warn', 'Under your target of 80. A 30-minute daily walk lifts it by about 12 points.'],
  ['Needs attention', 'warn', 'Your lowest area. Short nights are pulling your Focus down.'],
  ['Steady', 'neutral', 'Holding steady. Food delivery is your biggest leak this week.'],
  ['On track', 'good', 'Moving well. Study and Focus are both feeding this goal.'],
];

export const HERO_ACTIONS: string[] = [
  'Block 2 focused hours before noon',
  'Hardest topic first, before noon',
  'Walk 30 minutes today',
  'Be in bed by 11:00 pm',
  'Cap delivery at 2 orders',
  'Review your goals on Sunday',
];

