import { create } from 'zustand';
import { demoBalance, demoDimensions, demoToday, DimensionData, DimensionId } from '@/data/demo-data';

interface Profile {
  name: string;
  priority: 'study' | 'health' | 'money' | 'career' | 'balance' | null;
  challenge: string | null;
}

interface Settings {
  reducedMotion: 'auto' | 'on' | 'off';
  textSize: 'default' | 'large' | 'xl';
  orbitView: 'visual' | 'list' | 'auto';
}

interface LifeState {
  profile: Profile;
  dimensions: Record<DimensionId, DimensionData>;
  balance: number;
  todayActions: string[];
  todayStats: typeof demoToday;
  settings: Settings;
  
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

  setProfileField: (key, value) => set((state) => ({
    profile: { ...state.profile, [key]: value }
  })),

  updateSetting: (key, value) => {
    set((state) => {
      const newSettings = { ...state.settings, [key]: value };
      try {
        localStorage.setItem('lifeos-settings', JSON.stringify(newSettings));
      } catch (e) {
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
