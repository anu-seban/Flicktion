'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Production } from '@/lib/types';

interface ProjectStore {
  productions: Production[];
  activeProjectId: string | null;

  // Actions
  createProduction: (title: string, logline: string, genre: string) => Production;
  updateProduction: (id: string, updates: Partial<Production>) => void;
  deleteProduction: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  getActiveProduction: () => Production | undefined;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      productions: [],
      activeProjectId: null,

      createProduction: (title, logline, genre) => {
        const now = new Date().toISOString();
        const production: Production = {
          id: uuidv4(),
          title,
          logline,
          genre,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          productions: [...state.productions, production],
          activeProjectId: production.id,
        }));
        return production;
      },

      updateProduction: (id, updates) => {
        set((state) => ({
          productions: state.productions.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deleteProduction: (id) => {
        set((state) => ({
          productions: state.productions.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        }));
      },

      setActiveProject: (id) => set({ activeProjectId: id }),

      getActiveProduction: () => {
        const state = get();
        return state.productions.find((p) => p.id === state.activeProjectId);
      },
    }),
    { name: 'cineflow-projects' }
  )
);
