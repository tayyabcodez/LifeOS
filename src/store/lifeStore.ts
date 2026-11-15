import { create } from 'zustand';
import { demoBalance, demoDimensions, demoToday, DimensionData, DimensionId } from '@/data/demo-data';

export interface OnboardingPlanArea {
  now: number;
  plan: number;
  gain: number;
}

export interface OnboardingData {
  priorities: string[];
  challengeId: string | null;
  plan: {
    now: number;
    plan: number;
    areas: Record<string, OnboardingPlanArea>;
  };
  completed: boolean;
}

interface Profile {
  name: string;
  priority: 'study' | 'health' | 'money' | 'career' | 'balance' | null;
  challenge: string | null;
  selectedDimensions?: DimensionId[];
  onboardingChallenge?: string | null;
  onboardingCompleted?: boolean;
}

interface Settings {
  reducedMotion: 'auto' | 'on' | 'off';
  textSize: 'default' | 'large' | 'xl';
  orbitView: 'visual' | 'list' | 'auto';
}

export interface PhoneHabits {
  socialHoursPerDay: number;      // 0–12, step 0.5
  noPhoneAfterMidnight: boolean;
  midnightFrequency?: 'never' | 'sometimes' | 'often';
}

interface LifeState {
  profile: Profile;
  dimensions: Record<DimensionId, DimensionData>;
  balance: number;
  todayActions: string[];
  todayStats: typeof demoToday;
  settings: Settings;
  onboarding?: OnboardingData;
  phoneHabits: PhoneHabits;
  setPhoneHabits: (habits: Partial<PhoneHabits>) => void;
  setOnboarding: (data: {
    priorities: string[];
    challenge: string | null;
    plan: {
      now: number;
      plan: number;
      areas: Record<string, OnboardingPlanArea>;
    };
  }) => void;
  
  setProfileField: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  addTodayAction: (action: string) => void;
  updateDimensionScore: (id: DimensionId, newScore: number) => void;
  setBalance: (newBalance: number) => void;
  resetToDefaults: () => void;
}

export const useLifeStore = create<LifeState>((set) => ({
  profile: {
    name: 'Alex',
    priority: null,
    challenge: null,
    selectedDimensions: [],
    onboardingChallenge: null,
    onboardingCompleted: false,
  },
  dimensions: demoDimensions,
  balance: demoBalance,
  todayActions: [],
  todayStats: demoToday,
  settings: {
    reducedMotion: 'auto',
    textSize: 'default',
    orbitView: 'auto',
  },
  onboarding: {
    priorities: [],
    challengeId: null,
    plan: {
      now: demoBalance,
      plan: demoBalance,
      areas: {},
    },
    completed: false,
  },
  phoneHabits: (() => {
    try {
      const saved = localStorage.getItem('lifeos-phone-habits');
      if (saved) return JSON.parse(saved) as PhoneHabits;
    } catch {}
    return { socialHoursPerDay: 3, noPhoneAfterMidnight: false, midnightFrequency: 'never' };
  })(),
  setPhoneHabits: (habits) =>
    set((state) => {
      const next = { ...state.phoneHabits, ...habits };
      try { localStorage.setItem('lifeos-phone-habits', JSON.stringify(next)); } catch {}
      return { phoneHabits: next };
    }),

  setOnboarding: (data) =>
    set((state) => {
      const firstPriority = data.priorities[0];
      const validPriority =
        firstPriority &&
        ['study', 'health', 'money', 'career', 'balance'].includes(firstPriority)
          ? (firstPriority as Profile['priority'])
          : null;
      return {
        profile: {
          ...state.profile,
          priority: validPriority ?? state.profile.priority,
          challenge: data.challenge ?? state.profile.challenge,
          selectedDimensions: data.priorities as DimensionId[],
          onboardingChallenge: data.challenge,
          onboardingCompleted: true,
        },
        onboarding: {
          priorities: data.priorities,
          challengeId: data.challenge,
          plan: data.plan,
          completed: true,
        },
      };
    }),

  setProfileField: (key, value) => set((state) => ({
    profile: { ...state.profile, [key]: value }
  })),

  updateSetting: (key, value) => {
    set((state) => {
      const newSettings = { ...state.settings, [key]: value };
      try {
        localStorage.setItem('lifeos-settings', JSON.stringify(newSettings));
      } catch {
        console.warn('Failed to save settings to localStorage');
      }
      return { settings: newSettings };
    });
  },

  addTodayAction: (action) => set((state) => {
    if (state.todayActions.includes(action)) return state;
    return {
      todayActions: [...state.todayActions, action],
      todayStats: {
        ...state.todayStats,
        priorities: state.todayStats.priorities + 1
      }
    };
  }),

  updateDimensionScore: (id, newScore) => set((state) => ({
    dimensions: {
      ...state.dimensions,
      [id]: {
        ...state.dimensions[id],
        score: newScore
      }
    }
  })),
  
  setBalance: (newBalance) => set({ balance: newBalance }),
  
  resetToDefaults: () => set({
    dimensions: demoDimensions,
    balance: demoBalance,
    todayActions: [],
    todayStats: demoToday
  })
}));
