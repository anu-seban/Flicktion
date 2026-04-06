import { useParams, useNavigate } from 'react-router-dom';
import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Controls, MiniMap, Background,
  useNodesState, useEdgesState, addEdge,
  Connection, Node, ReactFlowInstance, BackgroundVariant,
  Handle, Position, SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStoryStore } from '@/stores/useStoryStore';
import { useEntityStore } from '@/stores/useEntityStore';
import { useScriptStore } from '@/stores/useScriptStore';
import { StoryBeat, StoryConnection } from '@/lib/types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { createMentionExtensions } from '@/lib/mentions';
import { Node as FlowNode } from 'reactflow';

const TAG_COLORS = [
  '#60a5fa', // Blue
  '#fbbf24', // Amber
  '#8b5cf6', // Violet
  '#f87171', // Red
  '#34d399', // Emerald
  '#f97316', // Orange
  '#ec4899', // Pink
  '#06b6d4', // Cyan
];

function BeatContextMenu({ menuTop, menuLeft, affectedBeats, allProjectTags, onAddTag, onRemoveTag, onClose }: any) {
  const [newTagLabel, setNewTagLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  const handleAdd = () => {
    if (newTagLabel.trim()) {
      onAddTag({ label: newTagLabel.trim(), color: selectedColor });
      setNewTagLabel('');
    }
  };

  const isBulk = affectedBeats.length > 1;

  // Filter project tags to only show ones not already on ALL affected beats
  const availableTags = allProjectTags.filter(
    (pt: any) => !affectedBeats.every((beat: any) => beat.tags?.some((bt: any) => bt.label === pt.label))
  );

  return (
    <div 
      className="glass-panel"
      style={{
        position: 'fixed',
        zIndex: 5000,
        padding: '16px',
        minWidth: '240px',
        background: 'rgba(18, 18, 18, 0.98)',
        border: '1px solid var(--border-glass)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'blur(32px)',
        top: `${menuTop - 12}px`,
        left: `${menuLeft}px`,
        transform: 'translate(-50%, -100%)',
        animation: 'scaleIn 0.2s ease-out'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
          {isBulk ? `Tag ${affectedBeats.length} Beats` : 'Beat Tags'}
        </div>
        {isBulk && <span style={{ fontSize: '9px', background: 'var(--accent-violet)22', color: 'var(--accent-violet)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>Bulk Mode</span>}
      </div>
      
      {/* Existing Tags (Only show for single-node to avoid confusion) */}
      {!isBulk && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {affectedBeats[0].tags && affectedBeats[0].tags.length > 0 ? (
            affectedBeats[0].tags.map((tag: any, i: number) => (
              <div key={i} style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', 
                background: tag.color + '15', color: tag.color, 
                padding: '4px 8px', borderRadius: '6px', fontSize: '10px', 
                fontWeight: '700', border: `1px solid ${tag.color}44` 
              }}>
                {tag.label}
                <button 
                  onClick={() => onRemoveTag(i)} 
                  style={{ border: 'none', background: 'none', color: tag.color, cursor: 'pointer', padding: '0 2px', opacity: 0.7, fontSize: '12px' }}
                >✕</button>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>No tags yet</div>
          )}
        </div>
      )}

      {availableTags.length > 0 && (
        <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }}>Project Tag Library</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {availableTags.map((tag: any, i: number) => (
              <button
                key={i}
                onClick={() => onAddTag(tag)}
                style={{
                  fontSize: '9px', padding: '4px 8px', borderRadius: '4px',
                  background: tag.color + '10', color: tag.color,
                  border: `1px solid ${tag.color}22`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = tag.color + '22'}
                onMouseLeave={(e) => e.currentTarget.style.background = tag.color + '10'}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tag.color }} />
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add New Tag Section */}
      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Add Custom Tag</label>
          <input 
            className="input-glass" 
            placeholder="Tag name..." 
            value={newTagLabel} 
            onChange={(e) => setNewTagLabel(e.target.value)}
            style={{ width: '100%', fontSize: '11px', marginBottom: '8px', padding: '8px 12px' }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {TAG_COLORS.map(color => (
              <button 
                key={color} 
                onClick={() => setSelectedColor(color)}
                style={{ 
                  width: '18px', height: '18px', borderRadius: '50%', 
                  background: color, border: selectedColor === color ? '2px solid white' : '2px solid transparent',
                  cursor: 'pointer', padding: 0, boxShadow: selectedColor === color ? `0 0 8px ${color}` : 'none',
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </div>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleAdd} 
          disabled={!newTagLabel.trim()}
          style={{ width: '100%', fontSize: '11px', padding: '8px', fontWeight: '700' }}
        >
          + Add Tag
        </button>
      </div>
    </div>
  );
}

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
        border: selected ? '1.5px solid var(--accent-violet)' : '1.5px solid var(--border-glass)',
        minWidth: '200px', maxWidth: '280px',
        transition: 'all 0.15s',
        boxShadow: selected ? '0 0 0 2px var(--bg-primary), 0 0 0 4px var(--accent-violet)44' : '0 1px 3px rgba(0,0,0,0.05)',
        position: 'relative',
      }}
    >
      {/* Tags Container */}
      <div style={{
        position: 'absolute', top: '-14px', left: '8px',
        display: 'flex', gap: '4px', zIndex: -1
      }}>
        {data.tags?.map((tag: any, i: number) => (
          <div key={i} style={{
            fontSize: '8px', fontWeight: '900', color: 'white',
            background: tag.color,
            padding: '2px 8px', borderRadius: '4px 4px 0 0',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            boxShadow: `0 -2px 10px ${tag.color}33`,
          }}>
            {tag.label}
          </div>
        ))}
      </div>
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
  const [menu, setMenu] = useState<{ id: string; affectedBeats: StoryBeat[]; top: number; left: number } | null>(null);

  const allProjectTags = Array.from(
    nodes.reduce((acc, node) => {
      const beatTags = (node.data as StoryBeat).tags || [];
      beatTags.forEach((tag: any) => {
        if (!acc.has(tag.label)) {
          acc.set(tag.label, tag.color);
        }
      });
      return acc;
    }, new Map<string, string>())
  ).map(([label, color]) => ({ label, color }));

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: FlowNode) => {
      event.preventDefault();
      const pane = reactFlowWrapper.current?.getBoundingClientRect();
      if (!pane) return;

      // Use .closest() for precise anchoring to the node DOM element
      const nodeElement = (event.target as HTMLElement).closest('.react-flow__node');
      const nodeRect = nodeElement?.getBoundingClientRect();
      
      if (!nodeRect) return;

      const selectedNodesCount = nodes.filter(n => n.selected).length;
      const isPartOfBulk = selectedNodesCount > 1 && nodes.find(n => n.id === node.id)?.selected;
      
      const affectedBeats = isPartOfBulk
        ? nodes.filter(n => n.selected).map(sn => sn.data as StoryBeat)
        : [node.data as StoryBeat];

      setMenu({ 
        id: node.id, 
        affectedBeats, 
        top: nodeRect.top,
        left: nodeRect.left + nodeRect.width / 2 
      });
    },
    [setMenu, nodes]
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const handleAddTag = useCallback((tag: { label: string; color: string }) => {
    if (!menu) return;
    
    const newBeats = menu.affectedBeats.map(beat => {
      const currentTags = beat.tags || [];
      if (currentTags.some(t => t.label === tag.label)) return beat;
      return { ...beat, tags: [...currentTags, tag] };
    });
    
    newBeats.forEach(beat => updateBeat(pid, beat.id, { tags: beat.tags }));
    
    setNodes((nds) => nds.map((n) => {
      const ub = newBeats.find(beat => beat.id === n.id);
      return ub ? { ...n, data: { ...n.data, tags: ub.tags } } : n;
    }));
    
    setMenu(null);
  }, [menu, pid, updateBeat, setNodes]);

  const handleRemoveTag = useCallback((index: number) => {
    if (!menu) return;
    
    // Only support removal for single selection or just the right-clicked beat
    const targetBeat = menu.affectedBeats[0];
    const newTags = (targetBeat.tags || []).filter((_, i) => i !== index);
    
    updateBeat(pid, targetBeat.id, { tags: newTags });
    setNodes((nds) => nds.map((n) => (n.id === targetBeat.id ? { 
      ...n, 
      data: { ...n.data, tags: newTags } 
    } : n)));
    
    setMenu(null);
  }, [menu, pid, updateBeat, setNodes]);

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
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={[20, 20]}
          selectionOnDrag={true}
          selectionMode={SelectionMode.Partial}
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

      {menu && (
        <BeatContextMenu
          affectedBeats={menu.affectedBeats}
          allProjectTags={allProjectTags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onClose={() => setMenu(null)}
          menuTop={menu.top}
          menuLeft={menu.left}
        />
      )}
    </div>
  );
}
