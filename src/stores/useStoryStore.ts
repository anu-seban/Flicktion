'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { StoryBeat, StoryConnection } from '@/lib/types';
import { Node, Edge } from 'reactflow';

interface StoryStore {
  // Per-project story data
  beats: Record<string, StoryBeat[]>;     // projectId -> beats
  connections: Record<string, StoryConnection[]>; // projectId -> connections

  // Beat CRUD
  addBeat: (projectId: string, beat: Partial<StoryBeat>) => StoryBeat;
  updateBeat: (projectId: string, beatId: string, updates: Partial<StoryBeat>) => void;
  removeBeat: (projectId: string, beatId: string) => void;

  // Connection CRUD
  addConnection: (projectId: string, conn: Partial<StoryConnection>) => StoryConnection;
  removeConnection: (projectId: string, connId: string) => void;

  // Converters for React Flow
  getNodes: (projectId: string) => Node[];
  getEdges: (projectId: string) => Edge[];
  syncFromFlow: (projectId: string, nodes: Node[], edges: Edge[]) => void;
  importStoryData: (projectId: string, beats: StoryBeat[], connections: StoryConnection[]) => void;
}

export const useStoryStore = create<StoryStore>()(
  persist(
    (set, get) => ({
      beats: {},
      connections: {},

      importStoryData: (projectId, beats, connections) => {
        set((state) => ({
          beats: {
            ...state.beats,
            [projectId]: beats
          },
          connections: {
            ...state.connections,
            [projectId]: connections
          }
        }));
      },

      addBeat: (projectId, partial) => {
        const beat: StoryBeat = {
          id: uuidv4(),
          projectId,
          title: partial.title || 'New Beat',
          description: partial.description || '',
          act: partial.act || 1,
          beatType: partial.beatType || 'rising',
          entityRefs: partial.entityRefs || [],
          position: partial.position || { x: Math.random() * 400, y: Math.random() * 300 },
          tags: partial.tags || [],
        };
        set((state) => ({
          beats: {
            ...state.beats,
            [projectId]: [...(state.beats[projectId] || []), beat],
          },
        }));
        return beat;
      },

      updateBeat: (projectId, beatId, updates) => {
        set((state) => ({
          beats: {
            ...state.beats,
            [projectId]: (state.beats[projectId] || []).map((b) =>
              b.id === beatId ? { ...b, ...updates } : b
            ),
          },
        }));
      },

      removeBeat: (projectId, beatId) => {
        set((state) => ({
          beats: {
            ...state.beats,
            [projectId]: (state.beats[projectId] || []).filter((b) => b.id !== beatId),
          },
          connections: {
            ...state.connections,
            [projectId]: (state.connections[projectId] || []).filter(
              (c) => c.source !== beatId && c.target !== beatId
            ),
          },
        }));
      },

      addConnection: (projectId, partial) => {
        const conn: StoryConnection = {
          id: uuidv4(),
          source: partial.source || '',
          target: partial.target || '',
          connectionType: partial.connectionType || 'transition',
          label: partial.label || '',
        };
        set((state) => ({
          connections: {
            ...state.connections,
            [projectId]: [...(state.connections[projectId] || []), conn],
          },
        }));
        return conn;
      },

      removeConnection: (projectId, connId) => {
        set((state) => ({
          connections: {
            ...state.connections,
            [projectId]: (state.connections[projectId] || []).filter((c) => c.id !== connId),
          },
        }));
      },

      getNodes: (projectId) => {
        const beats = get().beats[projectId] || [];
        return beats.map((beat) => ({
          id: beat.id,
          type: 'beatNode',
          position: beat.position,
          data: beat,
        }));
      },

      getEdges: (projectId) => {
        const conns = get().connections[projectId] || [];
        return conns.map((conn) => ({
          id: conn.id,
          source: conn.source,
          target: conn.target,
          type: 'default',
          data: conn,
          style: {
            stroke: 'var(--accent-violet)',
            strokeWidth: 2,
          },
        }));
      },

      syncFromFlow: (projectId, nodes, edges) => {
        set((state) => {
          // Update beat positions from React Flow nodes
          const existingBeats = state.beats[projectId] || [];
          const updatedBeats = existingBeats.map((beat) => {
            const node = nodes.find((n) => n.id === beat.id);
            return node ? { ...beat, position: node.position } : beat;
          });

          return {
            beats: { ...state.beats, [projectId]: updatedBeats },
          };
        });
      },
    }),
    { name: 'cineflow-story' }
  )
);
