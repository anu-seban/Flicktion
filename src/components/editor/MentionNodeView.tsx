'use client';

import { NodeViewWrapper } from '@tiptap/react';
import AssetBadge from '@/components/ui/AssetBadge';

export default function MentionNodeView(props: any) {
  const { node } = props;
  const { id, label, entityType } = node.attrs;

  return (
    <NodeViewWrapper 
      className="mention-wrapper" 
      as="span" 
      style={{ display: 'inline', position: 'relative' }}
    >
      <AssetBadge 
        id={id} 
        label={label} 
        entityType={entityType}
      />
    </NodeViewWrapper>
  );
}
