"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Habit = {
  id: string;
  name: string;
  createdAt: number;
  log: Record<string, boolean>; // key: YYYY-MM-DD
};

type HabitStore = {
  habits: Habit[];
  addHabit: (name: string) => void;
  deleteHabit: (habitId: string) => void;
  renameHabit: (habitId: string, newName: string) => void;
  toggleHabitForDate: (habitId: string, dateKey: string) => void;
  setHabitForDate: (habitId: string, dateKey: string, value: boolean) => void;
  setAllForDate: (dateKey: string, value: boolean) => void;
  replaceHabits: (habits: Habit[]) => void;
  clearAll: () => void;
};

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],

      addHabit: (name) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
              name: name.trim(),
              createdAt: Date.now(),
              log: {},
            },
          ],
        })),

      deleteHabit: (habitId) =>
        set((state) => ({ habits: state.habits.filter((h) => h.id !== habitId) })),

      renameHabit: (habitId, newName) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === habitId ? { ...h, name: newName.trim() } : h
          ),
        })),

      toggleHabitForDate: (habitId, dateKey) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== habitId) return h;
            const current = !!h.log[dateKey];
            return { ...h, log: { ...h.log, [dateKey]: !current } };
          }),
        })),

      setHabitForDate: (habitId, dateKey, value) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === habitId ? { ...h, log: { ...h.log, [dateKey]: value } } : h
          ),
        })),

      setAllForDate: (dateKey, value) =>
        set((state) => ({
          habits: state.habits.map((h) => ({ ...h, log: { ...h.log, [dateKey]: value } })),
        })),

      replaceHabits: (habits) => set({ habits }),

      clearAll: () => set({ habits: [] }),
    }),
    {
      name: "habit-tracker-store-v1",
      version: 1,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : undefined,
      // Migrations could be added here as the app evolves
    }
  )
);

export function toDateKey(date: Date): string {
  const iso = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
    .toISOString()
    .slice(0, 10);
  return iso; // YYYY-MM-DD
}

export function getLastNDates(n: number): { key: string; date: Date }[] {
  const out: { key: string; date: Date }[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(today.getDate() - i);
    out.push({ key: toDateKey(d), date: d });
  }
  return out;
}

