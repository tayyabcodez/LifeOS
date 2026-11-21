import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // ISO string e.g. "2026-11-25"
  completed: boolean;
}

interface AssignmentState {
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id' | 'completed'> & { completed?: boolean }) => void;
  toggleComplete: (id: string) => void;
  deleteAssignment: (id: string) => void;
  editAssignment: (id: string, updates: Partial<Omit<Assignment, 'id'>>) => void;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `asn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useAssignmentStore = create<AssignmentState>()(
  persist(
    (set) => ({
      assignments: [],
      addAssignment: (assignmentData) =>
        set((state) => ({
          assignments: [
            ...state.assignments,
            {
              id: generateId(),
              title: assignmentData.title.trim(),
              subject: assignmentData.subject.trim(),
              dueDate: assignmentData.dueDate,
              completed: assignmentData.completed ?? false,
            },
          ],
        })),
      toggleComplete: (id) =>
        set((state) => ({
          assignments: state.assignments.map((asn) =>
            asn.id === id ? { ...asn, completed: !asn.completed } : asn
          ),
        })),
      deleteAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((asn) => asn.id !== id),
        })),
      editAssignment: (id, updates) =>
        set((state) => ({
          assignments: state.assignments.map((asn) =>
            asn.id === id ? { ...asn, ...updates } : asn
          ),
        })),
    }),
    {
      name: 'lifeos.assignmentStore',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
