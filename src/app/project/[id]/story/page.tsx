'use client';

import { useParams } from 'next/navigation';
import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  ReactFlowInstance,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStoryStore } from '@/stores/useStoryStore';
import { ACT_COLORS, BEAT_TYPE_ICONS, CONNECTION_STYLES } from '@/lib/constants';
import { StoryBeat, StoryConnection } from '@/lib/types';

// === Custom Beat Node ===
function BeatNode({ data, selected }: { data: StoryBeat; selected: boolean }) {
  const actColor = ACT_COLORS[data.act];
  const icon = BEAT_TYPE_ICONS[data.beatType] || '📝';

  return (
    <div style={{
      padding: '16px 20px',
      borderRadius: '14px',
      background: selected
        ? `linear-gradient(135deg, ${actColor.bg}33, ${actColor.bg}15)`
        : 'rgba(255, 255, 255, 0.04)',
      border: `1.5px solid ${selected ? actColor.bg + '88' : 'rgba(255, 255, 255, 0.08)'}`,
      backdropFilter: 'blur(16px)',
      minWidth: '180px',
      maxWidth: '240px',
      transition: 'all 0.2s',
      boxShadow: selected ? `0 0 24px ${actColor.bg}20` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span style={{
          fontSize: '10px', fontWeight: '600', textTransform: 'uppercase',
          letterSpacing: '0.05em', padding: '2px 8px', borderRadius: '4px',
          background: actColor.bg + '22', color: actColor.bg,
        }}>
          {actColor.label}
        </span>
      </div>
      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
        {data.title}
      </div>
      {data.description && (
        <div style={{
          fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {data.description}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { beatNode: BeatNode };

export default function StoryPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { addBeat, updateBeat, removeBeat, addConnection, getNodes, getEdges, syncFromFlow } = useStoryStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const initialNodes = mounted ? getNodes(projectId) : [];
  const initialEdges = mounted ? getEdges(projectId) : [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedBeat, setSelectedBeat] = useState<StoryBeat | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [connType, setConnType] = useState<StoryConnection['connectionType']>('transition');

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const conn = addConnection(projectId, {
          source: connection.source,
          target: connection.target,
          connectionType: connType,
          label: CONNECTION_STYLES[connType].label,
        });
        setEdges((eds) =>
          addEdge({
            ...connection,
            id: conn.id,
            animated: connType === 'b-story',
            label: CONNECTION_STYLES[connType].label,
            style: {
              stroke: CONNECTION_STYLES[connType].stroke,
              strokeDasharray: CONNECTION_STYLES[connType].strokeDasharray === 'none' ? undefined : CONNECTION_STYLES[connType].strokeDasharray,
              strokeWidth: 2,
            },
          }, eds)
        );
      }
    },
    [projectId, connType, addConnection, setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedBeat(node.data as StoryBeat);
    setShowPanel(true);
  }, []);

  const handleAddBeat = () => {
    const position = reactFlowInstance
      ? reactFlowInstance.project({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50 })
      : { x: Math.random() * 500, y: Math.random() * 400 };

    const beat = addBeat(projectId, { title: 'New Beat', description: '', act: 1, beatType: 'rising', position });
    setNodes((nds) => [...nds, { id: beat.id, type: 'beatNode', position: beat.position, data: beat }]);
  };

  const handleUpdateBeat = (updates: Partial<StoryBeat>) => {
    if (!selectedBeat) return;
    updateBeat(projectId, selectedBeat.id, updates);
    const updatedBeat = { ...selectedBeat, ...updates };
    setSelectedBeat(updatedBeat);
    setNodes((nds) => nds.map((n) => (n.id === selectedBeat.id ? { ...n, data: updatedBeat } : n)));
  };

  const handleDeleteBeat = () => {
    if (!selectedBeat) return;
    removeBeat(projectId, selectedBeat.id);
    setNodes((nds) => nds.filter((n) => n.id !== selectedBeat.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedBeat.id && e.target !== selectedBeat.id));
    setShowPanel(false);
    setSelectedBeat(null);
  };

  const onNodeDragStop = useCallback(() => {
    syncFromFlow(projectId, nodes, edges);
  }, [projectId, nodes, edges, syncFromFlow]);

  if (!mounted) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Story Maker...</div>;
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {/* Toolbar */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 5, display: 'flex', gap: '8px' }}>
        <button className="btn-primary" onClick={handleAddBeat} id="add-beat-btn">+ Add Beat</button>
        <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          {(Object.keys(CONNECTION_STYLES) as Array<StoryConnection['connectionType']>).map((type) => (
            <button key={type} onClick={() => setConnType(type)} style={{
              padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: '500',
              cursor: 'pointer', fontFamily: 'var(--font-ui)',
              background: connType === type ? CONNECTION_STYLES[type].stroke + '22' : 'transparent',
              color: connType === type ? CONNECTION_STYLES[type].stroke : 'var(--text-muted)', transition: 'all 0.15s',
            }}>
              {CONNECTION_STYLES[type].label}
            </button>
          ))}
        </div>
      </div>

      {/* React Flow Canvas */}
      <div ref={reactFlowWrapper} style={{ height: '100%' }}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop} onInit={setReactFlowInstance}
          nodeTypes={nodeTypes} fitView
          style={{ background: 'var(--bg-primary)' }}
        >
          <Controls />
          <MiniMap nodeColor={(node) => { const beat = node.data as StoryBeat; return ACT_COLORS[beat.act]?.bg || '#666'; }} />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.03)" />
        </ReactFlow>
      </div>

      {/* Beat Edit Panel */}
      {showPanel && selectedBeat && (
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '320px', height: '100%',
          background: 'rgba(6, 6, 10, 0.9)', backdropFilter: 'blur(24px)',
          borderLeft: '1px solid var(--border-glass)', padding: '24px', zIndex: 10, overflow: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Edit Beat</h3>
            <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setShowPanel(false)}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</label>
              <input className="input-glass" value={selectedBeat.title} onChange={(e) => handleUpdateBeat({ title: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
              <textarea className="input-glass" value={selectedBeat.description} onChange={(e) => handleUpdateBeat({ description: e.target.value })} rows={4} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Act</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {([1, 2, 3] as const).map((act) => (
                  <button key={act} onClick={() => handleUpdateBeat({ act })} style={{
                    flex: 1, padding: '8px', borderRadius: '8px',
                    border: `1px solid ${selectedBeat.act === act ? ACT_COLORS[act].bg + '44' : 'var(--border-glass)'}`,
                    background: selectedBeat.act === act ? ACT_COLORS[act].bg + '15' : 'transparent',
                    color: selectedBeat.act === act ? ACT_COLORS[act].bg : 'var(--text-muted)',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-ui)', transition: 'all 0.15s',
                  }}>Act {act}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Beat Type</label>
              <select className="input-glass" value={selectedBeat.beatType}
                onChange={(e) => handleUpdateBeat({ beatType: e.target.value as StoryBeat['beatType'] })}>
                {Object.entries(BEAT_TYPE_ICONS).map(([type, icon]) => (
                  <option key={type} value={type} style={{ background: '#0d0d14' }}>{icon} {type}</option>
                ))}
              </select>
            </div>
            <button className="btn-ghost" style={{ marginTop: '16px', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }} onClick={handleDeleteBeat}>
              🗑️ Delete Beat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
