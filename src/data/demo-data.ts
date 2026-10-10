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
