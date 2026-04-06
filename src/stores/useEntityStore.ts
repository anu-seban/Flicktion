'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Entity, Character, Prop, Location, EntityType, TriggerSymbol, TRIGGER_MAP } from '@/lib/types';
import { ASSET_COLOR_PRESETS } from '@/lib/constants';
import { generateUniqueRandomColor } from '@/lib/utils';

interface EntityStore {
  entities: Entity[];

  // CRUD
  addCharacter: (projectId: string, name: string, partial?: Partial<Character>) => Character;
  addProp: (projectId: string, name: string, partial?: Partial<Prop>) => Prop;
  addLocation: (projectId: string, name: string, partial?: Partial<Location>) => Location;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  removeEntity: (id: string) => void;

  // Queries
  getByProject: (projectId: string) => Entity[];
  getByType: (projectId: string, type: EntityType) => Entity[];
  getById: (id: string) => Entity | undefined;
  searchByTrigger: (projectId: string, trigger: TriggerSymbol, query: string) => Entity[];

  // Modal State
  editingEntityId: string | null;
  setEditingEntityId: (id: string | null) => void;
  importEntities: (projectId: string, entities: Entity[]) => void;
}

export const useEntityStore = create<EntityStore>()(
  persist(
    (set, get) => ({
      entities: [],
      editingEntityId: null,

      importEntities: (projectId, newEntities) => {
        set((state) => {
          // Remove old entities for this project and add new ones
          const otherProjectEntities = state.entities.filter(e => e.projectId !== projectId);
          return {
            entities: [...otherProjectEntities, ...newEntities]
          };
        });
      },

      addCharacter: (projectId, name, partial = {}) => {
        const now = new Date().toISOString();
        // Get all colors currently used in this project
        const usedColors = get().entities
          .filter(e => e.projectId === projectId)
          .map(e => e.color)
          .filter(Boolean) as string[];

        const nextColor = generateUniqueRandomColor(usedColors);

        const character: Character = {
          id: uuidv4(),
          projectId,
          type: 'character',
          trigger: '@',
          name,
          role: 'supporting',
          archetype: '',
          internalArc: '',
          actorNotes: '',
          imageUrl: '',
          age: '',
          job: '',
          archetypes: '',
          habits: '',
          color: partial.color || nextColor,
          createdAt: now,
          updatedAt: now,
          ...partial,
        };
        set((state) => ({ entities: [...state.entities, character] }));
        return character;
      },

      addProp: (projectId, name, partial = {}) => {
        const now = new Date().toISOString();
        // Get all colors currently used in this project
        const usedColors = get().entities
          .filter(e => e.projectId === projectId)
          .map(e => e.color)
          .filter(Boolean) as string[];

        const nextColor = generateUniqueRandomColor(usedColors);

        const prop: Prop = {
          id: uuidv4(),
          projectId,
          type: 'prop',
          trigger: '#',
          name,
          imageUrl: '',
          artVfx: '',
          sceneNotes: '',
          safetyRequirements: '',
          color: partial.color || nextColor,
          createdAt: now,
          updatedAt: now,
          ...partial,
        };
        set((state) => ({ entities: [...state.entities, prop] }));
        return prop;
      },

      addLocation: (projectId, name, partial = {}) => {
        const now = new Date().toISOString();
        // Get all colors currently used in this project
        const usedColors = get().entities
          .filter(e => e.projectId === projectId)
          .map(e => e.color)
          .filter(Boolean) as string[];

        const nextColor = generateUniqueRandomColor(usedColors);

        const location: Location = {
          id: uuidv4(),
          projectId,
          type: 'location',
          trigger: '$',
          name,
          address: '',
          coordinates: '',
          imageUrl: '',
          details: '',
          color: partial.color || nextColor,
          createdAt: now,
          updatedAt: now,
          ...partial,
        };
        set((state) => ({ entities: [...state.entities, location] }));
        return location;
      },

      updateEntity: (id, updates) => {
        set((state) => ({
          entities: state.entities.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } as Entity : e
          ),
        }));
      },

      removeEntity: (id) => {
        set((state) => ({
          entities: state.entities.filter((e) => e.id !== id),
        }));
      },

      getByProject: (projectId) => get().entities.filter((e) => e.projectId === projectId),

      getByType: (projectId, type) =>
        get().entities.filter((e) => e.projectId === projectId && e.type === type),

      getById: (id) => get().entities.find((e) => e.id === id),

      searchByTrigger: (projectId, trigger, query) => {
        const targetType = TRIGGER_MAP[trigger];
        return get().entities.filter(
          (e) =>
            e.projectId === projectId &&
            e.type === targetType &&
            e.name.toLowerCase().includes(query.toLowerCase())
        );
      },

      setEditingEntityId: (id) => set({ editingEntityId: id }),
    }),
    { name: 'cineflow-entities' }
  )
);
