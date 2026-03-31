import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntityStore } from '@/stores/useEntityStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useStoryStore } from '@/stores/useStoryStore';
import { ENTITY_COLORS } from '@/lib/constants';

interface CommandPaletteProps {
  projectId?: string;
}

interface SearchResult {
  id: string;
  type: 'entity' | 'beat' | 'action';
  icon: string;
  label: string;
  sublabel: string;
  color: string;
  action: () => void;
}

export default function CommandPalette({ projectId }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { entities } = useEntityStore();
  const { productions } = useProjectStore();
  const { beats } = useStoryStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const results: SearchResult[] = [];

  const filteredEntities = entities.filter((e) => {
    if (projectId && e.projectId !== projectId) return false;
    if (!query) return true;
    return e.name.toLowerCase().includes(query.toLowerCase());
  });

  filteredEntities.slice(0, 8).forEach((entity) => {
    const colors = ENTITY_COLORS[entity.type];
    results.push({
      id: entity.id, type: 'entity', icon: entity.trigger,
      label: entity.name, sublabel: `${entity.type} · ${entity.trigger}${entity.name}`,
      color: colors.primary, action: () => setOpen(false),
    });
  });

  if (projectId) {
    (beats[projectId] || []).filter((b) => !query || b.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5).forEach((beat) => {
        results.push({
          id: beat.id, type: 'beat', icon: '📍',
          label: beat.title, sublabel: `Story Beat · Act ${beat.act}`,
          color: '#a78bfa', action: () => { setOpen(false); navigate(`/project/${projectId}/story`); },
        });
      });
    const navItems = [
      { path: 'story', icon: '🗺️', label: 'Go to Story Maker' },
      { path: 'script', icon: '📝', label: 'Go to Script Writer' },
      { path: 'breakdown', icon: '📋', label: 'Go to Shot Breakdown' },
    ];
    navItems.forEach((item) => {
      if (!query || item.label.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: `nav-${item.path}`, type: 'action', icon: item.icon,
          label: item.label, sublabel: 'Navigation', color: '#6366f1',
          action: () => { setOpen(false); navigate(`/project/${projectId}/${item.path}`); },
        });
      }
    });
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); results[selectedIndex]?.action(); }
  }, [results, selectedIndex]);

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '20vh', zIndex: 200 }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{ width: '520px', maxWidth: '90vw', background: 'rgba(13,13,20,0.95)', backdropFilter: 'blur(32px)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border-glass)' }}>
          <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>🔍</span>
          <input ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown} placeholder="Search entities, beats, or actions..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '15px', fontFamily: 'var(--font-ui)' }}
            id="command-palette-input" />
          <kbd style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', fontSize: '11px', color: 'var(--text-muted)' }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: '320px', overflow: 'auto', padding: '4px' }}>
          {results.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No results found</div>
          ) : results.map((result, index) => (
            <div key={result.id} onClick={result.action} onMouseEnter={() => setSelectedIndex(index)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', background: index === selectedIndex ? 'rgba(255,255,255,0.06)' : 'transparent', transition: 'all 0.1s' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', background: `${result.color}15`, color: result.color, border: `1px solid ${result.color}30` }}>
                {result.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: index === selectedIndex ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{result.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{result.sublabel}</div>
              </div>
              {index === selectedIndex && <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)' }}>↵</span>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', padding: '10px 20px', borderTop: '1px solid var(--border-glass)', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>↑↓ Navigate</span><span>↵ Select</span><span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}
