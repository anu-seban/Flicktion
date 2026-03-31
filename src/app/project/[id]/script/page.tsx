'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { useScriptStore } from '@/stores/useScriptStore';
import { useEntityStore } from '@/stores/useEntityStore';
import { Entity, TriggerSymbol, TRIGGER_MAP } from '@/lib/types';
import { ENTITY_COLORS } from '@/lib/constants';
import { ReactRenderer } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MentionNodeView from '@/components/editor/MentionNodeView';

// === Mention List Component ===
interface MentionListProps {
  items: Entity[];
  command: (item: { id: string; label: string; entityType: string }) => void;
  triggerChar: string;
}

function MentionListComponent({
  items,
  command,
  triggerChar,
}: MentionListProps & { ref?: React.Ref<any> }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          command({
            id: items[selectedIndex].id,
            label: items[selectedIndex].name,
            entityType: items[selectedIndex].type,
          });
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, command]);

  if (items.length === 0) {
    return (
      <div className="suggestion-dropdown">
        <div className="suggestion-item" style={{ color: 'var(--text-muted)' }}>
          No results found
        </div>
      </div>
    );
  }

  const entityType = items[0]?.type || 'character';
  const colors = ENTITY_COLORS[entityType];

  return (
    <div className="suggestion-dropdown">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`suggestion-item ${index === selectedIndex ? 'is-selected' : ''}`}
          onClick={() =>
            command({
              id: item.id,
              label: item.name,
              entityType: item.type,
            })
          }
        >
          <div
            className="trigger-badge"
            style={{
              background: colors.bg,
              color: colors.primary,
              border: `1px solid ${colors.border}`,
            }}
          >
            {item.trigger}
          </div>
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
}

// === Create Mention Suggestion ===
function createSuggestion(triggerChar: string, entityType: string) {
  return {
    char: triggerChar,
    items: ({ query }: { query: string }) => {
      // This will be overridden by the component
      return [];
    },
    render: () => {
      let component: any = null;
      let popup: HTMLDivElement | null = null;

      return {
        onStart: (props: any) => {
          popup = document.createElement('div');
          popup.style.position = 'absolute';
          popup.style.zIndex = '1000';
          document.body.appendChild(popup);

          const rect = props.clientRect?.();
          if (rect && popup) {
            popup.style.left = `${rect.left}px`;
            popup.style.top = `${rect.bottom + 4}px`;
          }

          // We'll render the list through React
          component = { props, popup };
          updatePopup(component);
        },
        onUpdate: (props: any) => {
          if (component) {
            component.props = props;
            const rect = props.clientRect?.();
            if (rect && popup) {
              popup.style.left = `${rect.left}px`;
              popup.style.top = `${rect.bottom + 4}px`;
            }
            updatePopup(component);
          }
        },
        onKeyDown: (props: any) => {
          if (props.event.key === 'Escape') {
            if (popup) {
              popup.remove();
              popup = null;
            }
            return true;
          }
          return false;
        },
        onExit: () => {
          if (popup) {
            popup.remove();
            popup = null;
          }
        },
      };
    },
  };
}

function updatePopup(component: any) {
  // Simple DOM-based popup rendering
  if (!component.popup) return;

  const { items, command } = component.props;
  const popup = component.popup;

  // Clear
  popup.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'suggestion-dropdown';

  if (items.length === 0) {
    const emptyItem = document.createElement('div');
    emptyItem.className = 'suggestion-item';
    emptyItem.style.color = 'var(--text-muted)';
    emptyItem.textContent = 'No results';
    container.appendChild(emptyItem);
  } else {
    items.forEach((item: any) => {
      const el = document.createElement('div');
      el.className = 'suggestion-item';
      el.innerHTML = `
        <span class="trigger-badge" style="background:${item.bgColor || 'rgba(255,255,255,0.1)'};color:${item.textColor || '#fff'};border:1px solid ${item.borderColor || 'rgba(255,255,255,0.2)'}">
          ${item.trigger || '@'}
        </span>
        <span>${item.name || item.label || ''}</span>
      `;
      el.addEventListener('click', () => {
        command({ id: item.id, label: (item.trigger || '') + (item.name || item.label), entityType: item.type || item.entityType });
      });
      container.appendChild(el);
    });
  }

  popup.appendChild(container);
}

// === Script Editor Component ===
export default function ScriptPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getSegments, updateSegment, addSegment } = useScriptStore();
  const { searchByTrigger, getByProject } = useEntityStore();

  const segments = getSegments(projectId);
  // For now, we use the first segment if it exists, or create one
  const activeSegment = segments[0];
  const savedContent = activeSegment?.content;

  // Build mention configs for each trigger
  const characterMention = Mention.configure({
    HTMLAttributes: {
      class: 'mention-character',
    },
    suggestion: {
      char: '@',
      items: ({ query }: { query: string }) => {
        const results = searchByTrigger(projectId, '@', query);
        return results.map((e) => ({
          id: e.id,
          label: e.name,
          name: e.name,
          type: e.type,
          trigger: e.trigger,
          bgColor: ENTITY_COLORS.character.bg,
          textColor: ENTITY_COLORS.character.primary,
          borderColor: ENTITY_COLORS.character.border,
        }));
      },
      render: createSuggestion('@', 'character').render,
    },
    renderLabel({ node }) {
      return `@${node.attrs.label ?? node.attrs.id}`;
    },
  }).extend({
    name: 'characterMention',
    addAttributes() {
      return {
        ...this.parent?.(),
        entityType: {
          default: 'character',
          parseHTML: element => element.getAttribute('data-entity-type'),
          renderHTML: attributes => ({
            'data-entity-type': attributes.entityType,
          }),
        },
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer(MentionNodeView);
    },
  });

  const propMention = Mention.configure({
    HTMLAttributes: {
      class: 'mention-prop',
    },
    suggestion: {
      char: '#',
      items: ({ query }: { query: string }) => {
        const results = searchByTrigger(projectId, '#', query);
        return results.map((e) => ({
          id: e.id,
          label: e.name,
          name: e.name,
          type: e.type,
          trigger: e.trigger,
          bgColor: ENTITY_COLORS.prop.bg,
          textColor: ENTITY_COLORS.prop.primary,
          borderColor: ENTITY_COLORS.prop.border,
        }));
      },
      render: createSuggestion('#', 'prop').render,
    },
    renderLabel({ node }) {
      return `#${node.attrs.label ?? node.attrs.id}`;
    },
  }).extend({
    name: 'propMention',
    addAttributes() {
      return {
        ...this.parent?.(),
        entityType: {
          default: 'prop',
          parseHTML: element => element.getAttribute('data-entity-type'),
          renderHTML: attributes => ({
            'data-entity-type': attributes.entityType,
          }),
        },
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer(MentionNodeView);
    },
  });

  const locationMention = Mention.configure({
    HTMLAttributes: {
      class: 'mention-location',
    },
    suggestion: {
      char: '$',
      items: ({ query }: { query: string }) => {
        const results = searchByTrigger(projectId, '$', query);
        return results.map((e) => ({
          id: e.id,
          label: e.name,
          name: e.name,
          type: e.type,
          trigger: e.trigger,
          bgColor: ENTITY_COLORS.location.bg,
          textColor: ENTITY_COLORS.location.primary,
          borderColor: ENTITY_COLORS.location.border,
        }));
      },
      render: createSuggestion('$', 'location').render,
    },
    renderLabel({ node }) {
      return `$${node.attrs.label ?? node.attrs.id}`;
    },
  }).extend({
    name: 'locationMention',
    addAttributes() {
      return {
        ...this.parent?.(),
        entityType: {
          default: 'location',
          parseHTML: element => element.getAttribute('data-entity-type'),
          renderHTML: attributes => ({
            'data-entity-type': attributes.entityType,
          }),
        },
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer(MentionNodeView);
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      characterMention,
      propMention,
      locationMention,
    ],
    content: savedContent || {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '',
            },
          ],
        },
      ],
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        'data-placeholder': 'Start writing your script... Use @ for characters, # for props, $ for locations.',
      },
    },
    onUpdate: ({ editor }) => {
      if (activeSegment) {
        updateSegment(projectId, activeSegment.id, { content: editor.getJSON() });
      } else {
        // This is a bit tricky since addSegment is async-ish in state, 
        // but for a single editor setup we should ideally have a segment ready.
      }
    },
  });

  // Ensure there's a segment if none exist
  useEffect(() => {
    if (segments.length === 0) {
      addSegment(projectId);
    }
  }, [projectId, segments.length, addSegment]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-glass)',
        background: 'rgba(6, 6, 10, 0.5)',
      }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Script Writer
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>·</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: ENTITY_COLORS.character.primary }}>
            @ Characters
          </span>
          <span style={{ fontSize: '12px', color: ENTITY_COLORS.prop.primary }}>
            # Props
          </span>
          <span style={{ fontSize: '12px', color: ENTITY_COLORS.location.primary }}>
            $ Locations
          </span>
        </div>
      </div>

      {/* Editor */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
        padding: '24px',
      }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
