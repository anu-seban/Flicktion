'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { ScriptSegment } from '@/lib/types';

interface ScriptStore {
  // Per-project script segments
  segments: Record<string, ScriptSegment[]>;

  addSegment: (projectId: string, beatId?: string) => void;
  insertSegment: (projectId: string, index: number) => void;
  updateSegment: (projectId: string, segmentId: string, updates: Partial<ScriptSegment>) => void;
  removeSegment: (projectId: string, segmentId: string) => void;
  reorderSegments: (projectId: string, segments: ScriptSegment[]) => void;
  getSegments: (projectId: string) => ScriptSegment[];
  importScriptData: (projectId: string, segments: ScriptSegment[]) => void;
}

export const useScriptStore = create<ScriptStore>()(
  persist(
    (set, get) => ({
      segments: {},

      importScriptData: (projectId, segments) => {
        set((state) => ({
          segments: {
            ...state.segments,
            [projectId]: segments
          }
        }));
      },

      addSegment: (projectId, beatId) => {
        const newSegment: ScriptSegment = {
          id: uuidv4(),
          projectId,
          beatId,
          content: { type: 'doc', content: [{ type: 'paragraph' }] },
        };
        set((state) => ({
          segments: {
            ...state.segments,
            [projectId]: [...(state.segments[projectId] || []), newSegment],
          },
        }));
      },

      insertSegment: (projectId, index) => {
        const newSegment: ScriptSegment = {
          id: uuidv4(),
          projectId,
          content: { type: 'doc', content: [{ type: 'paragraph' }] },
        };
        set((state) => {
          const currentSegments = state.segments[projectId] || [];
          const newSegments = [...currentSegments];
          newSegments.splice(index + 1, 0, newSegment);
          return {
            segments: {
              ...state.segments,
              [projectId]: newSegments,
            },
          };
        });
      },

      updateSegment: (projectId, segmentId, updates) => {
        set((state) => ({
          segments: {
            ...state.segments,
            [projectId]: (state.segments[projectId] || []).map((s) =>
              s.id === segmentId ? { ...s, ...updates } : s
            ),
          },
        }));
      },

      removeSegment: (projectId, segmentId) => {
        set((state) => ({
          segments: {
            ...state.segments,
            [projectId]: (state.segments[projectId] || []).filter((s) => s.id !== segmentId),
          },
        }));
      },

      reorderSegments: (projectId, segments) => {
        set((state) => ({
          segments: {
            ...state.segments,
            [projectId]: segments,
          },
        }));
      },

      getSegments: (projectId) => get().segments[projectId] || [],
    }),
    { name: 'cineflow-scripts-v6' } // Version bump for schema change
  )
);
