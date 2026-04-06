'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Shot } from '@/lib/types';

interface ShotStore {
  shots: Record<string, Shot[]>; // projectId -> Shot[]

  addShot: (projectId: string, segmentId: string, data: Partial<Shot>) => void;
  updateShot: (projectId: string, shotId: string, updates: Partial<Shot>) => void;
  removeShot: (projectId: string, shotId: string) => void;
  getShotsBySegment: (projectId: string, segmentId: string) => Shot[];
  importShotData: (projectId: string, shots: Shot[]) => void;
}

export const useShotStore = create<ShotStore>()(
  persist(
    (set, get) => ({
      shots: {},

      importShotData: (projectId, shots) => {
        set((state) => ({
          shots: {
            ...state.shots,
            [projectId]: shots
          }
        }));
      },

      addShot: (projectId, segmentId, data) => {
        const currentShots = get().shots[projectId] || [];
        const segmentShots = currentShots.filter(s => s.segmentId === segmentId);
        
        const newShot: Shot = {
          id: uuidv4(),
          projectId,
          segmentId,
          shotNumber: (segmentShots.length + 1).toString(),
          description: '',
          shotType: 'MS',
          cameraAngle: 'Eye Level',
          cameraMove: 'Static',
          audio: '',
          subjects: [],
          ...data
        };

        set((state) => ({
          shots: {
            ...state.shots,
            [projectId]: [...(state.shots[projectId] || []), newShot],
          },
        }));
      },

      updateShot: (projectId, shotId, updates) => {
        set((state) => ({
          shots: {
            ...state.shots,
            [projectId]: (state.shots[projectId] || []).map((s) =>
              s.id === shotId ? { ...s, ...updates } : s
            ),
          },
        }));
      },

      removeShot: (projectId, shotId) => {
        set((state) => ({
          shots: {
            ...state.shots,
            [projectId]: (state.shots[projectId] || []).filter((s) => s.id !== shotId),
          },
        }));
      },

      getShotsBySegment: (projectId, segmentId) => {
        return (get().shots[projectId] || []).filter((s) => s.segmentId === segmentId);
      },
    }),
    { name: 'cineflow-shots' }
  )
);
