'use client';

import React, { useState, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEntityStore } from '@/stores/useEntityStore';
import { ENTITY_COLORS } from '@/lib/constants';
import { EntityType, TriggerSymbol } from '@/lib/types';

interface AssetBadgeProps {
  id: string;
  label: string;
  entityType: EntityType;
  trigger?: TriggerSymbol;
  className?: string;
}

export default function AssetBadge({ id, label, entityType, trigger, className }: AssetBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const tagRef = useRef<HTMLSpanElement>(null);
  
  const getEntity = useEntityStore((state) => state.getById);
  const setEditingEntityId = useEntityStore((state) => state.setEditingEntityId);
  const entity = getEntity(id);

  useLayoutEffect(() => {
    if (isHovered && tagRef.current) {
      const rect = tagRef.current.getBoundingClientRect();
      const newCoords = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
      };
      setCoords(newCoords);
      console.log('AssetBadge Hovered:', { id, label, newCoords });
    }
  }, [isHovered, id, label]);
  
  const colors = ENTITY_COLORS[entityType as keyof typeof ENTITY_COLORS] || ENTITY_COLORS.character;

  return (
    <span 
      className={`asset-badge-wrapper ${className || ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: 'inline-block', position: 'relative' }}
    >
      <span
        ref={tagRef}
        onDoubleClick={() => setEditingEntityId(id)}
        className={`mention-tag mention-${entityType}`}
        data-asset-id={id}
        style={{
          cursor: 'pointer',
          display: 'inline-block',
          userSelect: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontWeight: '600',
          padding: '2px 6px',
          borderRadius: '4px',
          backgroundColor: isHovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
          color: colors.primary,
          border: `1px solid ${isHovered ? colors.primary : 'rgba(255,255,255,0.1)'}`,
          backdropFilter: 'blur(10px)',
          boxShadow: isHovered ? `0 0 15px ${colors.primary}33` : 'none',
          fontSize: '13px',
        }}
      >
        {label}
      </span>

      <AnimatePresence>
        {isHovered && entity && typeof document !== 'undefined' && createPortal(
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left + (coords.width / 2)}px`,
              transform: 'translate(-50%, -100%)',
              marginTop: '-12px',
              zIndex: 999999,
              pointerEvents: 'none',
            }}
          >
            <div className="asset-hover-card" style={{
              width: '240px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: `0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 30px ${colors.primary}22`,
              backdropFilter: 'blur(40px)',
              pointerEvents: 'auto',
            }}>
              {/* Asset Image */}
              <div style={{
                height: '160px',
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderBottom: '1px solid var(--border-glass)',
                position: 'relative',
              }}>
                {entity.imageUrl ? (
                  <img 
                    src={entity.imageUrl} 
                    alt={entity.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                    onError={(e) => {
                      (e.target as any).style.display = 'none';
                      const placeholder = (e.target as any).nextSibling;
                      if (placeholder) (placeholder as any).style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="image-placeholder"
                  style={{ 
                    display: entity.imageUrl ? 'none' : 'flex',
                    fontSize: '64px', 
                    fontWeight: 'bold',
                    opacity: 0.15,
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${colors.bg}, transparent)`,
                    color: colors.primary,
                  }}
                >
                  {entity.trigger || trigger || '@'}
                </div>
              </div>

              {/* Asset Info */}
              <div style={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                   <span style={{ 
                        fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', 
                        color: colors.primary, background: `rgba(${colors.primary === 'var(--accent-cyan)' ? '6, 182, 212' : colors.primary === 'var(--accent-amber)' ? '245, 158, 11' : '16, 185, 129'}, 0.1)`, 
                        padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.1em',
                        border: `1px solid rgba(${colors.primary === 'var(--accent-cyan)' ? '6, 182, 212' : colors.primary === 'var(--accent-amber)' ? '245, 158, 11' : '16, 185, 129'}, 0.2)`
                    }}>
                    {entityType}
                   </span>
                </div>
                <div style={{ fontWeight: '700', fontSize: '18px', color: '#fff', letterSpacing: '-0.02em' }}>
                  {entity.name}
                </div>
                {entityType === 'character' && (entity as any).role && (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                    {(entity as any).role}
                  </div>
                )}
              </div>
            </div>
            
            {/* Arrow */}
            <div style={{
              width: '0',
              height: '0',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `8px solid var(--bg-card)`,
              margin: '0 auto',
            }} />
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </span>
  );
}
