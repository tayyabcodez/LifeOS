import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Exam {
  id: string;
  subject: string;
  date: string; // ISO string e.g. "2026-11-28"
  targetHoursTotal: number;
}

interface ExamState {
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id'>) => void;
  removeExam: (id: string) => void;
  updateExam: (id: string, updates: Partial<Omit<Exam, 'id'>>) => void;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `exam-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      exams: [],
      addExam: (examData) =>
        set((state) => ({
          exams: [
            ...state.exams,
            {
              ...examData,
              id: generateId(),
            },
          ],
        })),
      removeExam: (id) =>
        set((state) => ({
          exams: state.exams.filter((exam) => exam.id !== id),
        })),
      updateExam: (id, updates) =>
        set((state) => ({
          exams: state.exams.map((exam) =>
            exam.id === id ? { ...exam, ...updates } : exam
          ),
        })),
    }),
    {
      name: 'lifeos.examStore',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
