// ============================================================
// CineFlow — Unified Entity Schema
// ============================================================

export type EntityType = 'character' | 'prop' | 'location';
export type TriggerSymbol = '@' | '#' | '$';

export interface MentionData {
  type: EntityType;
  name: string;
  id: string;
  trigger: TriggerSymbol;
}

// === Base Entity ===
export interface BaseEntity {
  id: string;
  projectId: string;
  type: EntityType;
  trigger: TriggerSymbol;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// === Character (@) ===
export interface Character extends BaseEntity {
  type: 'character';
  trigger: '@';
  role: 'protagonist' | 'antagonist' | 'supporting' | 'extra';
  archetype: string;
  internalArc: string;
  actorNotes: string;
  // New fields
  imageUrl?: string;
  age?: string;
  job?: string;
  archetypes?: string;
  habits?: string;
}

// === Prop (#) ===
export interface Prop extends BaseEntity {
  type: 'prop';
  trigger: '#';
  imageUrl?: string;
  artVfx?: string;
  sceneNotes: string;
  safetyRequirements: string;
}

// === Location ($) ===
export interface Location extends BaseEntity {
  type: 'location';
  trigger: '$';
  address: string;
  coordinates: string;
  imageUrl?: string;
  details?: string;
}

export type Entity = Character | Prop | Location;

export interface BeatTag {
  label: string;
  color: string;
}

// === Story Beat Node ===
export interface StoryBeat {
  id: string;
  projectId: string;
  title: string;
  description: string;
  act: 1 | 2 | 3;
  beatType: 'inciting' | 'rising' | 'climax' | 'falling' | 'resolution';
  entityRefs: string[];
  position: { x: number; y: number };
  tags?: BeatTag[];
}

// === Story Connection (Edge) ===
export interface StoryConnection {
  id: string;
  source: string;
  target: string;
  connectionType: 'transition' | 'b-story' | 'flashback' | 'parallel';
  label: string;
}

// === Production (Project) ===
export interface Production {
  id: string;
  title: string;
  logline: string;
  genre: string;
  createdAt: string;
  updatedAt: string;
}

// === Shot Breakdown Row ===
export interface ScriptLine {
  text: string;
  mentions: MentionData[];
}

export interface BreakdownRow {
  sceneNumber: number;
  heading: string;
  location: string;
  setting: string;
  timeOfDay: string;
  characters: MentionData[];
  props: MentionData[];
  lines: ScriptLine[]; // New field for scene context
}

// === Manual Shot Entry ===
export interface Shot {
  id: string,
  projectId: string,
  segmentId: string,
  shotNumber: string,
  description: string,
  shotType: string,
  cameraAngle: string,
  cameraMove: string,
  audio: string,
  subjects: string[], // List of entity names/IDs
}

export interface ScriptColumn {
  id: string;
  name: string;
  content: any; // TipTap JSON
}

// === Script Segment (Dynamic Multi-Column Row) ===
export interface ScriptSegment {
  id: string;
  projectId: string;
  beatId?: string;
  content: any; // TipTap JSON
  // Heading fields
  intExt?: 'INT' | 'EXT';
  locationId?: string;
  timeOfDay?: string;
}

// === Trigger → Entity Type mapping ===
export const TRIGGER_MAP: Record<TriggerSymbol, EntityType> = {
  '@': 'character',
  '#': 'prop',
  '$': 'location',
};

export const ENTITY_TRIGGER_MAP: Record<EntityType, TriggerSymbol> = {
  character: '@',
  prop: '#',
  location: '$',
};
