'use client';

import React, { useState } from 'react';
import { ScriptSegment } from '@/lib/types';
import { useShotStore } from '@/stores/useShotStore';
import { useEntityStore } from '@/stores/useEntityStore';
import { useStoryStore } from '@/stores/useStoryStore';
import { extractMentions } from '@/lib/mentions';
import ShotRow from './ShotRow';
import AssetBadge from '@/components/ui/AssetBadge';

interface ShotBreakdownBoxProps {
  segment: ScriptSegment;
  sceneNumber: number;
  projectId: string;
}

export default function ShotBreakdownBox({ segment, sceneNumber, projectId }: ShotBreakdownBoxProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showScript, setShowScript] = useState(false);
  const { addShot, getShotsBySegment } = useShotStore();
  const getById = useEntityStore(state => state.getById);
  const beats = useStoryStore(state => state.beats[projectId] || []);
  
  const shots = getShotsBySegment(projectId, segment.id);
  const location = segment.locationId ? getById(segment.locationId) : null;
  const beat = segment.beatId ? beats.find(b => b.id === segment.beatId) : null;
  const mentions = extractMentions(segment.content);
  
  const characters = mentions.filter(m => m.type === 'character');
  const props = mentions.filter(m => m.type === 'prop');

  const headingText = `${segment.intExt || '-'} ${location?.name || '---'} — ${segment.timeOfDay || '-'}`;

  return (
    <div className="shot-breakdown-box glass-panel" style={{
      marginBottom: '24px',
      overflow: 'hidden',
      borderRadius: '16px',
      border: '1px solid var(--border-glass)',
      background: 'rgba(255,255,255,0.01)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Box Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid var(--border-glass)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ 
            fontSize: '18px', 
            fontWeight: '800', 
            color: 'var(--accent-violet)',
            minWidth: '32px'
          }}>
            {sceneNumber}
          </span>
          <div>
            {beat && (
              <div style={{ 
                color: 'var(--accent-violet)', 
                fontSize: '10px', 
                fontWeight: '800', 
                marginBottom: '4px', 
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                opacity: 0.8
              }}>
                • {beat.title}
              </div>
            )}
            <h3 style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.01em', marginBottom: '2px', textTransform: 'uppercase' }}>
              {headingText}
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {characters.map(c => (
                <AssetBadge key={c.id} id={c.id} label={c.name} entityType="character" trigger="@" />
              ))}
              {props.map(p => (
                <AssetBadge key={p.id} id={p.id} label={p.name} entityType="prop" trigger="#" />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => setShowScript(!showScript)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              background: showScript ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              color: showScript ? 'var(--accent-violet)' : 'var(--text-muted)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            {showScript ? 'Hide Script' : 'View Script'}
          </button>
          
          <button 
            onClick={() => addShot(projectId, segment.id, {})}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            + Add Shot
          </button>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Script Context View */}
      {showScript && (
        <div style={{
          padding: '20px',
          background: 'rgba(0,0,0,0.2)',
          borderBottom: '1px solid var(--border-glass)',
          maxHeight: '300px',
          overflowY: 'auto',
          lineHeight: '1.6',
        }}>
           {(!segment.content || (Array.isArray(segment.content.content) && segment.content.content.length === 0)) ? (
             <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
               Empty Script Box — Start writing in the Script Writer to see text here.
             </div>
           ) : (
             <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-script)' }}>
               {/* Simplified TipTap to Text rendering for context */}
               {segment.content.content?.map((block: any, i: number) => (
                 <p key={i} style={{ marginBottom: '8px' }}>
                   {block.content?.map((node: any, ni: number) => {
                     if (node.type === 'text') return node.text;
                     if (node.type === 'characterMention' || node.type === 'propMention' || node.type === 'locationMention') {
                        return <span key={ni} style={{ color: 'var(--accent-violet)', fontWeight: '600' }}>
                          {(node.attrs.label || node.attrs.id)}
                        </span>;
                     }
                     return null;
                   })}
                 </p>
               ))}
             </div>
           )}
        </div>
      )}

      {/* Shot List Content */}
      {isExpanded && (
        <div className="shot-list">
          {/* List Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '50px 1.5fr 80px 100px 100px 1fr 1fr 40px',
            gap: '12px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid var(--border-glass)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '700',
            color: 'var(--text-muted)',
          }}>
            <div style={{ textAlign: 'center' }}>Shot #</div>
            <div>Description</div>
            <div>Type</div>
            <div>Angle</div>
            <div>Movement</div>
            <div>Audio</div>
            <div>Subjects</div>
            <div></div>
          </div>

          {shots.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No shots added yet. Click "+ Add Shot" to begin.
            </div>
          ) : (
            shots.map(shot => (
              <ShotRow key={shot.id} shot={shot} projectId={projectId} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
