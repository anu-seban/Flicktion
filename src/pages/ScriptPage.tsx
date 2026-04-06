import { useParams, useSearchParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useScriptStore } from '@/stores/useScriptStore';
import { useEntityStore } from '@/stores/useEntityStore';
import { useStoryStore } from '@/stores/useStoryStore';
import { createMentionExtensions } from '@/lib/mentions';
import { ScriptSegment } from '@/lib/types';
import { Reorder, useDragControls } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';

// === Column Editor Component ===
function ScriptColumnEditor({ 
  content, 
  projectId, 
  placeholder,
  onUpdate 
}: { 
  content: any; 
  projectId: string; 
  placeholder?: string;
  onUpdate: (content: any) => void;
}) {
  const { searchByTrigger } = useEntityStore();
  
  const extensions = useMemo(() => [
    StarterKit,
    ...createMentionExtensions(projectId, searchByTrigger)
  ], [projectId, searchByTrigger]);

  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-box',
        style: 'min-height: 80px; outline: none; padding: 12px; font-size: 13px; line-height: 1.6;',
        'data-placeholder': placeholder || '',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON());
    },
  });

  return <EditorContent editor={editor} />;
}

function ScriptBox({ 
  segment, 
  projectId, 
  index,
  onUpdate,
  onAddRow,
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
  onAddRow: () => void;
  onRemove: () => void;
  availableBeats: { id: string, title: string }[];
  isHighlighted?: boolean;
  isDragging?: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const dragControls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const locations = useEntityStore(state => state.getByType(projectId, 'location'));

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
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', minWidth: '24px' }}>#{index + 1}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, opacity: isDragging ? 0.5 : 1 }}>
            {/* INT/EXT */}
            <select 
              className="select-glass"
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
              className="select-glass"
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
              className="input-glass text-[11px]"
              style={{ padding: '2px 8px', width: '80px', height: '24px' }}
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
              className="select-glass"
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
      
      {/* Single Column Layout */}
      <div 
        className="script-box-body" 
        style={{ 
          background: 'var(--bg-primary)', 
          display: isDragging ? 'none' : 'block',
          minHeight: '80px'
        }}
      >
        <div style={{ padding: '0px' }}>
          <ScriptColumnEditor 
            content={segment.content} 
            projectId={projectId} 
            placeholder="Start writing script..."
            onUpdate={(content) => onUpdate({ content })} 
          />
        </div>
      </div>

      {/* Row Insertion Handle (The fixed version of the "+" button) */}
      {!isDragging && (
        <div style={{ 
          background: 'transparent', 
          height: '4px',
          display: 'flex', 
          justifyContent: 'center',
          position: 'absolute',
          bottom: '-2px',
          left: '50px',
          right: '50px',
          opacity: 0,
          transition: 'all 0.2s',
          zIndex: 10,
          cursor: 'pointer'
        }} className="hover-insertion-handle"
        onClick={onAddRow}
        >
          <div style={{ 
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'var(--color-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            transform: 'translateY(-10px)'
          }}>
            +
          </div>
        </div>
      )}
      
      <style jsx>{`
        .script-box-item {
          position: relative;
        }
        .script-box-item:hover .hover-insertion-handle {
          opacity: 1;
        }
        .hover-insertion-handle:hover div {
          transform: translateY(-10px) scale(1.2);
          background: #55f08d;
        }
      `}</style>
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
  const { addSegment, insertSegment, updateSegment, removeSegment, reorderSegments } = useScriptStore();
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
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Script Writer</span>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => addSegment(pid)} 
          style={{ fontSize: '11px', padding: '6px 16px', fontWeight: 800, letterSpacing: '0.05em' }}
        >
          + ADD SCRIPT ROW
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
          {segments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)', 
              background: 'rgba(255,255,255,0.01)',
              border: '1px dashed var(--border-glass)', borderRadius: 'var(--radius-lg)' 
            }}>
              <p style={{ fontSize: '13px', marginBottom: '16px', letterSpacing: '0.05em' }}>EMPTY SCRIPT CANVAS</p>
              <button className="btn-primary" onClick={() => addSegment(pid)}>START SCRIPTING</button>
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
                   index={index}
                   projectId={pid}
                   availableBeats={availableBeats}
                   onUpdate={(updates) => updateSegment(pid, segment.id, updates)}
                   onAddRow={() => insertSegment(pid, index)}
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
