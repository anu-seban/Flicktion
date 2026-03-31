import Mention from '@tiptap/extension-mention';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MentionNodeView from '@/components/editor/MentionNodeView';
import { ENTITY_COLORS } from './constants';
import { TriggerSymbol, MentionData } from './types';

export function createSuggestionRenderer() {
  return () => {
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
        renderPopup(popup, props);
      },
      onUpdate: (props: any) => {
        if (popup) {
          const rect = props.clientRect?.();
          if (rect) {
            popup.style.left = `${rect.left}px`;
            popup.style.top = `${rect.bottom + 4}px`;
          }
          renderPopup(popup, props);
        }
      },
      onKeyDown: (props: any) => {
        if (props.event.key === 'Escape') {
          popup?.remove();
          popup = null;
          return true;
        }
        return false;
      },
      onExit: () => {
        popup?.remove();
        popup = null;
      },
    };
  };
}

function renderPopup(popup: HTMLDivElement, props: any) {
  popup.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'suggestion-dropdown';
  if (props.items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'suggestion-item';
    empty.style.color = 'var(--text-muted)';
    empty.textContent = 'No results';
    container.appendChild(empty);
  } else {
    props.items.forEach((item: any) => {
      const el = document.createElement('div');
      el.className = 'suggestion-item';
      el.innerHTML = `<span class="trigger-badge" style="background:${item.bgColor};color:${item.textColor};border:1px solid ${item.borderColor}">${item.trigger}</span><span>${item.name}</span>`;
      el.addEventListener('click', () => props.command({ id: item.id, label: item.trigger + item.name, entityType: item.type }));
      container.appendChild(el);
    });
  }
  popup.appendChild(container);
}

export function createMentionExtensions(projectId: string, searchByTrigger: (pid: string, trigger: TriggerSymbol, query: string) => any[]) {
  const characterMention = Mention.configure({
    HTMLAttributes: { class: 'mention-character' },
    suggestion: {
      char: '@',
      items: ({ query }: { query: string }) => searchByTrigger(projectId, '@', query).map((e) => ({
        id: e.id, label: e.name, name: e.name, type: e.type, trigger: e.trigger,
        bgColor: ENTITY_COLORS.character.bg, textColor: ENTITY_COLORS.character.primary, borderColor: ENTITY_COLORS.character.border,
      })),
      render: createSuggestionRenderer(),
    },
    renderLabel: ({ node }) => `@${node.attrs.label ?? node.attrs.id}`,
  }).extend({
    name: 'characterMention',
    addAttributes() {
      return {
        ...this.parent?.(),
        entityType: {
          default: 'character',
          parseHTML: element => element.getAttribute('data-entity-type'),
          renderHTML: attributes => ({ 'data-entity-type': attributes.entityType }),
        },
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer(MentionNodeView);
    },
  });

  const propMention = Mention.configure({
    HTMLAttributes: { class: 'mention-prop' },
    suggestion: {
      char: '#',
      items: ({ query }: { query: string }) => searchByTrigger(projectId, '#', query).map((e) => ({
        id: e.id, label: e.name, name: e.name, type: e.type, trigger: e.trigger,
        bgColor: ENTITY_COLORS.prop.bg, textColor: ENTITY_COLORS.prop.primary, borderColor: ENTITY_COLORS.prop.border,
      })),
      render: createSuggestionRenderer(),
    },
    renderLabel: ({ node }) => `#${node.attrs.label ?? node.attrs.id}`,
  }).extend({
    name: 'propMention',
    addAttributes() {
      return {
        ...this.parent?.(),
        entityType: {
          default: 'prop',
          parseHTML: element => element.getAttribute('data-entity-type'),
          renderHTML: attributes => ({ 'data-entity-type': attributes.entityType }),
        },
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer(MentionNodeView);
    },
  });

  const locationMention = Mention.configure({
    HTMLAttributes: { class: 'mention-location' },
    suggestion: {
      char: '$',
      items: ({ query }: { query: string }) => searchByTrigger(projectId, '$', query).map((e) => ({
        id: e.id, label: e.name, name: e.name, type: e.type, trigger: e.trigger,
        bgColor: ENTITY_COLORS.location.bg, textColor: ENTITY_COLORS.location.primary, borderColor: ENTITY_COLORS.location.border,
      })),
      render: createSuggestionRenderer(),
    },
    renderLabel: ({ node }) => `$${node.attrs.label ?? node.attrs.id}`,
  }).extend({
    name: 'locationMention',
    addAttributes() {
      return {
        ...this.parent?.(),
        entityType: {
          default: 'location',
          parseHTML: element => element.getAttribute('data-entity-type'),
          renderHTML: attributes => ({ 'data-entity-type': attributes.entityType }),
        },
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer(MentionNodeView);
    },
  });

  return [characterMention, propMention, locationMention];
}

/**
 * Extracts all entity mentions from a TipTap JSON content node tree.
 */
export function extractMentions(content: any): MentionData[] {
  const mentions: MentionData[] = [];
  if (!content) return mentions;

  function walk(node: any) {
    if ((node.type === 'characterMention' || node.type === 'propMention' || node.type === 'locationMention') && node.attrs) {
      const trigger = node.attrs.label?.startsWith('#') ? '#' : (node.attrs.label?.startsWith('$') ? '$' : '@');
      mentions.push({
        id: node.attrs.id,
        name: node.attrs.label?.replace(/^[@#$]/, '') || node.attrs.id,
        type: node.attrs.entityType || 'character',
        trigger: trigger as any
      });
    }
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(walk);
    }
  }

  if (Array.isArray(content)) {
    content.forEach(walk);
  } else if (content.content && Array.isArray(content.content)) {
    content.content.forEach(walk);
  } else {
    walk(content);
  }

  // Deduplicate by ID
  return Array.from(new Map(mentions.map(m => [m.id, m])).values());
}
