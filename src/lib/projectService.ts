import { useProjectStore } from '@/stores/useProjectStore';
import { useEntityStore } from '@/stores/useEntityStore';
import { useStoryStore } from '@/stores/useStoryStore';
import { useScriptStore } from '@/stores/useScriptStore';
import { useShotStore } from '@/stores/useShotStore';
import { Production, Entity, StoryBeat, StoryConnection, ScriptSegment, Shot } from './types';

export interface ProjectBundle {
  version: string;
  project: Production;
  entities: Entity[];
  beats: StoryBeat[];
  connections: StoryConnection[];
  segments: ScriptSegment[];
  shots: Shot[];
}

export const exportProject = (projectId: string) => {
  const project = useProjectStore.getState().productions.find(p => p.id === projectId);
  if (!project) {
    console.error('Project not found for export');
    return;
  }

  const bundle: ProjectBundle = {
    version: '1.0.0',
    project,
    entities: useEntityStore.getState().entities.filter(e => e.projectId === projectId),
    beats: useStoryStore.getState().beats[projectId] || [],
    connections: useStoryStore.getState().connections[projectId] || [],
    segments: useScriptStore.getState().segments[projectId] || [],
    shots: useShotStore.getState().shots[projectId] || [],
  };

  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.title.replace(/\s+/g, '_')}_project.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importProjectFromFile = async (file: File): Promise<string> => {
  try {
    const text = await file.text();
    const bundle: ProjectBundle = JSON.parse(text);

    if (!bundle.project || !bundle.project.id) {
      throw new Error('Invalid project file');
    }

    const { project, entities, beats, connections, segments, shots } = bundle;

    // Import into all stores
    useProjectStore.getState().importProject(project);
    useEntityStore.getState().importEntities(project.id, entities || []);
    useStoryStore.getState().importStoryData(project.id, beats || [], connections || []);
    useScriptStore.getState().importScriptData(project.id, segments || []);
    useShotStore.getState().importShotData(project.id, shots || []);

    return project.id;
  } catch (error) {
    console.error('Failed to import project:', error);
    throw error;
  }
};
