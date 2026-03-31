import { useParams, useNavigate } from 'react-router-dom';
import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Controls, MiniMap, Background,
  useNodesState, useEdgesState, addEdge,
  Connection, Node, ReactFlowInstance, BackgroundVariant,
  Handle, Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStoryStore } from '@/stores/useStoryStore';
import { useEntityStore } from '@/stores/useEntityStore';
import { useScriptStore } from '@/stores/useScriptStore';
import { StoryBeat, StoryConnection } from '@/lib/types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { createMentionExtensions } from '@/lib/mentions';

function BeatNode({ data, selected }: { data: any; selected: boolean }) {
  const { updateBeat } = useStoryStore();
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scripts = useScriptStore(state => state.getSegments(projectId!));
  
  const isLinked = scripts.some(s => s.beatId === data.id);
  
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const assetData = e.dataTransfer.getData('application/cineflow-asset');
    if (assetData) {
      const { name, trigger } = JSON.parse(assetData);
      const mentionHtml = `<span class="mention-${trigger === '@' ? 'character' : trigger === '#' ? 'prop' : 'location'}" data-type="mention" data-id="${name}" data-label="${name}">${trigger}${name}</span>`;
      const newDescription = data.description + (data.description ? ' ' : '') + mentionHtml;
      updateBeat(data.projectId, data.id, { description: newDescription });
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/project/${projectId}/script?beatId=${data.id}`);
  };

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      style={{
        padding: '12px 16px', borderRadius: 'var(--radius-md)',
        background: selected ? 'var(--bg-secondary)' : 'var(--bg-card)',
        border: `1.5px solid ${selected ? 'var(--accent-violet)' : 'var(--border-glass)'}`,
        minWidth: '200px', maxWidth: '280px',
        transition: 'all 0.15s',
        boxShadow: selected ? '0 0 0 2px var(--bg-primary), 0 0 0 4px var(--accent-violet)44' : '0 1px 3px rgba(0,0,0,0.05)',
        position: 'relative',
      }}
    >
      {/* Script Link Indicator */}
      {isLinked && (
        <div 
          onClick={handleLinkClick}
          style={{
            position: 'absolute', top: '-6px', right: '-6px',
            width: '12px', height: '12px', background: '#4ada7b',
            borderRadius: '50%', border: '2px solid var(--bg-primary)',
            boxShadow: '0 0 8px rgba(74, 218, 123, 0.5)',
            cursor: 'pointer', zIndex: 10,
            animation: 'pulse-green 2s infinite',
          }}
          title="Linked to script box. Click to view."
        />
      )}

      {/* Effect Handle (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="effect"
        style={{
          width: '8px', height: '8px', background: 'var(--accent-cyan)',
          border: '1px solid var(--bg-primary)', left: '-4px',
        }}
      />

      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>{data.title}</div>
      {data.description && (
        <div 
          style={{
            fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4',
            maxHeight: '100px', overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
          }}
          dangerouslySetInnerHTML={{ __html: data.description }}
        />
      )}

      <div style={{ display: 'flex', gap: '4px', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-glass)' }}>
        <button 
          className="btn-ghost" 
          style={{ flex: 1, fontSize: '10px', padding: '4px 2px', height: '24px', opacity: 0.8 }}
          onClick={(e) => { e.stopPropagation(); data.onNavigate('cause'); }}
        >← Cause</button>
        <button 
          className="btn-ghost" 
          style={{ flex: 1, fontSize: '10px', padding: '4px 2px', height: '24px', opacity: 0.8 }}
          onClick={(e) => { e.stopPropagation(); data.onNavigate('effect'); }}
        >Effect →</button>
      </div>

      {/* Cause Handle (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="cause"
        style={{
          width: '8px', height: '8px', background: 'var(--accent-violet)',
          border: '1px solid var(--bg-primary)', right: '-4px',
        }}
      />
    </div>
  );
}

const nodeTypes = { beatNode: BeatNode };

function BeatModal({ isOpen, mode, beat, onClose, onSave, onDelete, projectId }: {
  isOpen: boolean; mode: 'create' | 'edit'; beat: Partial<StoryBeat> | null;
  onClose: () => void; onSave: (data: { title: string; description: string }) => void;
  onDelete?: () => void; projectId: string;
}) {
  const [title, setTitle] = useState(beat?.title || '');
  const { searchByTrigger } = useEntityStore();
  
  const editor = useEditor({
    extensions: [StarterKit, ...createMentionExtensions(projectId, searchByTrigger)],
    content: beat?.description || '',
    editorProps: {
      attributes: {
        class: 'input-glass',
        style: 'min-height: 120px; outline: none; padding: 12px;',
      },
    },
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ title, description: editor?.getHTML() || '' });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div className="glass-panel" style={{
        padding: '24px', width: '480px', maxWidth: '90vw', background: 'var(--bg-primary)',
      }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
          {mode === 'create' ? 'Create New Beat' : 'Edit Story Beat'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Title</label>
            <input className="input-glass" placeholder="Context or title of the beat..." value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Story Beat</label>
            <div className="tiptap-modal-editor" style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <EditorContent editor={editor} />
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Use @ for characters, # for props, $ for locations.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {mode === 'edit' && onDelete && (
              <button className="btn-ghost" onClick={onDelete} style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)' }}>Delete</button>
            )}
            <div style={{ flex: 1 }} />
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoryPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const pid = projectId!;
  const { addBeat, updateBeat, removeBeat, addConnection, removeConnection, getNodes, getEdges, syncFromFlow } = useStoryStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const handleNavigateRef = useRef<((beatId: string, direction: 'cause' | 'effect') => void) | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(getNodes(pid).map(n => ({
    ...n,
    data: { ...n.data, onNavigate: (dir: 'cause' | 'effect') => handleNavigateRef.current?.(n.id, dir) }
  })));
  const [edges, setEdges, onEdgesChange] = useEdgesState(getEdges(pid));
  const [selectedBeat, setSelectedBeat] = useState<StoryBeat | null>(null);
  const [modalState, setModalState] = useState<{ isOpen: boolean; mode: 'create' | 'edit' }>({ isOpen: false, mode: 'create' });

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      const conn = addConnection(pid, {
        source: connection.source, target: connection.target,
        connectionType: 'transition',
      });
      setEdges((eds) => addEdge({
        ...connection, id: conn.id,
        style: { stroke: 'var(--accent-violet)', strokeWidth: 2 },
      }, eds));
    }
  }, [pid, addConnection, setEdges]);

  const onEdgesDelete = useCallback((deletedEdges: any[]) => {
    deletedEdges.forEach((edge) => {
      removeConnection(pid, edge.id);
    });
  }, [pid, removeConnection]);

  const handleNavigate = useCallback((beatId: string, direction: 'cause' | 'effect') => {
    if (!reactFlowInstance) return;

    const currentEdges = reactFlowInstance.getEdges();
    const currentNodes = reactFlowInstance.getNodes();
    
    const connectedEdges = currentEdges.filter(e => direction === 'cause' ? e.target === beatId : e.source === beatId);
    
    if (connectedEdges.length > 0) {
      const targetId = direction === 'cause' ? connectedEdges[0].source : connectedEdges[0].target;
      const targetNode = currentNodes.find(n => n.id === targetId);
      if (targetNode) {
        reactFlowInstance.setCenter(targetNode.position.x + 100, targetNode.position.y + 50, { zoom: 1.2, duration: 800 });
        setNodes(nds => nds.map(n => ({ ...n, selected: n.id === targetId })));
      }
    } else {
      const parentNode = currentNodes.find(n => n.id === beatId);
      if (!parentNode) return;

      const newPosition = {
        x: direction === 'cause' ? parentNode.position.x - 300 : parentNode.position.x + 300,
        y: parentNode.position.y,
      };

      const newBeat = addBeat(pid, {
        title: direction === 'cause' ? `Cause of ${parentNode.data.title}` : `Effect of ${parentNode.data.title}`,
        position: newPosition,
      });

      const newNode: Node = {
        id: newBeat.id,
        type: 'beatNode',
        position: newPosition,
        data: { 
          ...newBeat, 
          onNavigate: (dir: 'cause' | 'effect') => handleNavigateRef.current?.(newBeat.id, dir) 
        },
      };

      const newEdge = addConnection(pid, {
        source: direction === 'cause' ? newBeat.id : beatId,
        target: direction === 'cause' ? beatId : newBeat.id,
      });

      setNodes(nds => [...nds, newNode]);
      setEdges(eds => [...eds, {
        id: newEdge.id,
        source: newEdge.source,
        target: newEdge.target,
        style: { stroke: 'var(--accent-violet)', strokeWidth: 2 },
      }]);

      reactFlowInstance.setCenter(newPosition.x + 100, newPosition.y + 50, { zoom: 1.2, duration: 800 });
    }
  }, [pid, reactFlowInstance, addBeat, addConnection, setNodes, setEdges]);
  
  handleNavigateRef.current = handleNavigate;

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedBeat(node.data as StoryBeat);
  }, []);

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedBeat(node.data as StoryBeat);
    setModalState({ isOpen: true, mode: 'edit' });
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedBeat(null);
    setModalState({ isOpen: true, mode: 'create' });
  };

  const handleSaveModal = (data: { title: string; description: string }) => {
    if (modalState.mode === 'create') {
      const position = reactFlowInstance
        ? reactFlowInstance.project({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50 })
        : { x: Math.random() * 500, y: Math.random() * 400 };
      const beat = addBeat(pid, { ...data, position } as any);
      setNodes((nds) => [...nds, { 
        id: beat.id, 
        type: 'beatNode', 
        position: beat.position, 
        data: { ...beat, onNavigate: (dir: 'cause' | 'effect') => handleNavigate(beat.id, dir) } 
      }]);
    } else if (selectedBeat) {
      updateBeat(pid, selectedBeat.id, data);
      const updatedBeat = { ...selectedBeat, ...data };
      setNodes((nds) => nds.map((n) => (n.id === selectedBeat.id ? { 
        ...n, 
        data: { ...updatedBeat, onNavigate: (dir: 'cause' | 'effect') => handleNavigate(updatedBeat.id, dir) } 
      } : n)));
    }
    setModalState({ isOpen: false, mode: 'create' });
  };

  const handleDeleteBeat = () => {
    if (!selectedBeat) return;
    removeBeat(pid, selectedBeat.id);
    setNodes((nds) => nds.filter((n) => n.id !== selectedBeat.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedBeat.id && e.target !== selectedBeat.id));
    setModalState({ isOpen: false, mode: 'create' });
    setSelectedBeat(null);
  };

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 5 }}>
        <button className="btn-primary" onClick={handleOpenCreateModal} id="add-beat-btn">+ Add Beat</button>
      </div>

      <div ref={reactFlowWrapper} style={{ height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeDragStop={(_, node) => syncFromFlow(pid, nodes, edges)}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={[20, 20]}
          fitView
          style={{ background: 'var(--bg-primary)' }}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Controls />
          <MiniMap nodeColor={() => '#4f4f4f'} />
          <Background 
            variant={BackgroundVariant.Lines} 
            gap={40} 
            size={1} 
            color="rgba(128,128,128,0.08)" 
          />
          <Background 
            variant={BackgroundVariant.Lines} 
            gap={8} 
            size={0.5} 
            color="rgba(128,128,128,0.04)" 
          />
        </ReactFlow>
      </div>

      {modalState.isOpen && (
        <BeatModal
          isOpen={modalState.isOpen}
          mode={modalState.mode}
          beat={selectedBeat}
          projectId={pid}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onSave={handleSaveModal}
          onDelete={handleDeleteBeat}
        />
      )}
    </div>
  );
}
