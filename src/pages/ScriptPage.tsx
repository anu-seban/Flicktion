import { useParams, useSearchParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useScriptStore } from '@/stores/useScriptStore';
import { useEntityStore } from '@/stores/useEntityStore';
import { useStoryStore } from '@/stores/useStoryStore';
import { createMentionExtensions } from '@/lib/mentions';
import { ScriptSegment } from '@/lib/types';
import { Reorder, useDragControls } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

function ScriptBox({ 
  segment, 
  projectId, 
  index,
  onUpdate, 
  onRemove, 
  availableBeats,
  isHighlighted,
  isDragging,
  onDragStart,
  onDragEnd,
}: { 
  segment: ScriptSegment; 
  projectId: string; 
  index: number;
  onUpdate: (updates: Partial<ScriptSegment>) => void;
  onRemove: () => void;
  availableBeats: { id: string, title: string }[];
  isHighlighted?: boolean;
  isDragging?: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const { searchByTrigger } = useEntityStore();
  const dragControls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const locations = useEntityStore(state => state.getByType(projectId, 'location'));
  
  const editor = useEditor({
    extensions: [StarterKit, ...createMentionExtensions(projectId, searchByTrigger)],
    content: segment.content,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-box',
        style: 'min-height: 100px; outline: none; padding: 12px; font-size: 14px; line-height: 1.6;',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate({ content: editor.getJSON() });
    },
  });

  useEffect(() => {
    if (isHighlighted && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  return (
    <Reorder.Item 
      value={segment} 
      dragListener={false}
      dragControls={dragControls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      id={`script-box-${segment.id}`}
      layout
      className="script-box-item"
      style={{
        background: isHighlighted ? 'rgba(74, 218, 123, 0.05)' : 'var(--bg-secondary)',
        border: `1px solid ${isHighlighted ? '#4ada7b' : 'var(--border-glass)'}`,
        borderRadius: 'var(--radius-md)',
        marginBottom: isDragging ? '8px' : '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isHighlighted ? '0 0 20px rgba(74, 218, 123, 0.15)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: isDragging ? '40px' : 'auto',
        zIndex: isDragging ? 50 : 1,
      }}
    >
      <div ref={containerRef} style={{
        padding: '8px 12px',
        borderBottom: isDragging ? 'none' : `1px solid ${isHighlighted ? 'rgba(74, 218, 123, 0.3)' : 'var(--border-glass)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: isHighlighted ? 'rgba(74, 218, 123, 0.1)' : 'rgba(255,255,255,0.03)',
        gap: '12px',
        height: '40px',
        userSelect: 'none',
        opacity: isDragging ? 0.9 : 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <div 
            onPointerDown={(e) => {
              e.preventDefault();
              dragControls.start(e);
              onDragStart(); 
            }}
            data-drag-handle="true"
            style={{ 
              cursor: 'grab', color: 'var(--text-muted)', fontSize: '14px', 
              padding: '4px', display: 'flex', alignItems: 'center', gap: '8px' 
            }}
            title="Drag to reorder"
          >
            <span style={{ fontSize: '16px' }}>⠿</span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', minWidth: '24px' }}>#{index}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, opacity: isDragging ? 0.5 : 1 }}>
            {/* INT/EXT */}
            <select 
              className="input-glass"
              style={{ padding: '2px 6px', fontSize: '11px', width: '56px', height: '24px', fontWeight: 'bold' }}
              value={segment.intExt || ''}
              onChange={(e) => onUpdate({ intExt: e.target.value as any })}
              disabled={isDragging}
            >
              <option value="">-</option>
              <option value="INT">INT.</option>
              <option value="EXT">EXT.</option>
            </select>

            {/* Location Select */}
            <select 
              className="input-glass"
              style={{ padding: '2px 6px', fontSize: '11px', flex: 1, minWidth: '100px', height: '24px' }}
              value={segment.locationId || ''}
              onChange={(e) => onUpdate({ locationId: e.target.value })}
              disabled={isDragging}
            >
              <option value="">Select Location...</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>

            {/* Time Select/Input */}
            <input 
              list={`times-${segment.id}`}
              placeholder="Time..."
              className="input-glass"
              style={{ padding: '2px 8px', fontSize: '11px', width: '80px', height: '24px' }}
              value={segment.timeOfDay || ''}
              onChange={(e) => onUpdate({ timeOfDay: e.target.value })}
              disabled={isDragging}
            />
            <datalist id={`times-${segment.id}`}>
              <option value="MORNING" />
              <option value="DAY" />
              <option value="EVENING" />
              <option value="NIGHT" />
            </datalist>

            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>|</span>

            {/* Story Beat Select */}
            <select 
              className="input-glass"
              style={{ padding: '2px 6px', fontSize: '11px', width: '160px', height: '24px', opacity: 0.8 }}
              value={segment.beatId || ''}
              onChange={(e) => onUpdate({ beatId: e.target.value })}
              disabled={isDragging}
            >
              <option value="">Link Story Beat...</option>
              {availableBeats.map(beat => (
                <option key={beat.id} value={beat.id} style={{ background: 'var(--bg-primary)' }}>
                  {beat.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!isDragging && (
          <button 
            className="btn-ghost" 
            onClick={onRemove}
            style={{ padding: '4px 8px', color: 'rgba(248, 113, 111, 0.7)', fontSize: '11px' }}
          >Remove</button>
        )}
      </div>
      <div 
        className="script-box-body" 
        style={{ 
          background: 'var(--bg-primary)', 
          display: isDragging ? 'none' : 'block' 
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </Reorder.Item>
  );
}

export default function ScriptPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const focusedBeatId = searchParams.get('beatId');
  const pid = projectId!;
  
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  
  const segments = useScriptStore(state => state.segments[pid] || []);
  const { addSegment, updateSegment, removeSegment, reorderSegments } = useScriptStore();
  const beats = useStoryStore(state => state.beats[pid] || []);
  
  const [localItems, setLocalItems] = useState<ScriptSegment[]>(segments);

  useEffect(() => {
    if (!isDraggingGlobal) {
      setLocalItems(segments);
    }
  }, [segments, isDraggingGlobal]);

  const availableBeats = beats.map(b => ({ id: b.id, title: b.title }));

  const handleReorder = (newOrder: ScriptSegment[]) => {
    setLocalItems(newOrder); 
  };

  const finalizeReorder = () => {
    setIsDraggingGlobal(false);
    reorderSegments(pid, localItems); 
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
       <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px',
        borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Script Writer</span>
        </div>
        <button className="btn-primary" onClick={() => addSegment(pid)} style={{ fontSize: '12px', padding: '6px 12px' }}>
          + Add Script Box
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          {segments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', 
              border: '2px dashed var(--border-glass)', borderRadius: 'var(--radius-lg)' 
            }}>
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>No script segments yet.</p>
              <button className="btn-primary" onClick={() => addSegment(pid)}>Start Writing</button>
            </div>
          ) : (
            <Reorder.Group 
              axis="y" 
              values={localItems} 
              onReorder={handleReorder} 
              className="script-writer-container"
              style={{ listStyle: 'none', padding: 0 }}
            >
              {localItems.map((segment, index) => (
                <ScriptBox 
                   key={segment.id}
                   segment={segment}
                   index={index + 1}
                   projectId={pid}
                   availableBeats={availableBeats}
                   onUpdate={(updates) => updateSegment(pid, segment.id, updates)}
                   onRemove={() => removeSegment(pid, segment.id)}
                   isHighlighted={focusedBeatId === segment.beatId}
                   isDragging={isDraggingGlobal}
                   onDragStart={() => setIsDraggingGlobal(true)}
                   onDragEnd={finalizeReorder}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>
    </div>
  );
}
