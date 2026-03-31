'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useScriptStore } from '@/stores/useScriptStore';
import { parseScriptToBreakdown } from '@/lib/parser';
import { ENTITY_COLORS } from '@/lib/constants';

export default function BreakdownPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getScript } = useScriptStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  }

  const script = getScript(projectId);
  const rows = parseScriptToBreakdown(script);

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Shot Breakdown
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Auto-generated from your script. Scenes with entity mentions (@, #, $) will appear here.
          </p>
        </div>

        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>📋</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
              No scenes detected yet.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Write scene headings like{' '}
              <code style={{ color: 'var(--accent-emerald)', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                INT. LOCATION - DAY
              </code>{' '}
              in the Script tab.
            </p>
          </div>
        ) : (
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Scene</th>
                  <th style={{ width: '80px' }}>Setting</th>
                  <th>Location</th>
                  <th style={{ width: '80px' }}>Time</th>
                  <th>Characters</th>
                  <th>Props</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', color: 'var(--accent-violet)', fontSize: '15px' }}>
                      {row.sceneNumber}
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                        background: row.setting.includes('INT') && row.setting.includes('EXT')
                          ? 'rgba(245,158,11,0.15)' : row.setting === 'INT' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)',
                        color: row.setting.includes('INT') && row.setting.includes('EXT')
                          ? '#f59e0b' : row.setting === 'INT' ? '#818cf8' : '#34d399',
                      }}>
                        {row.setting}
                      </span>
                    </td>
                    <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{row.location}</td>
                    <td>
                      <span style={{
                        fontSize: '12px',
                        color: row.timeOfDay === 'NIGHT' ? '#a78bfa' : row.timeOfDay === 'DAWN' ? '#fb923c' : row.timeOfDay === 'DUSK' ? '#f472b6' : '#fbbf24',
                      }}>
                        {row.timeOfDay}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {row.characters.map((char) => (
                          <span key={char} className="entity-badge" style={{
                            background: ENTITY_COLORS.character.bg, color: ENTITY_COLORS.character.primary,
                            border: `1px solid ${ENTITY_COLORS.character.border}`,
                          }}>@{char}</span>
                        ))}
                        {row.characters.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {row.props.map((prop) => (
                          <span key={prop} className="entity-badge" style={{
                            background: ENTITY_COLORS.prop.bg, color: ENTITY_COLORS.prop.primary,
                            border: `1px solid ${ENTITY_COLORS.prop.border}`,
                          }}>#{prop}</span>
                        ))}
                        {row.props.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '16px 20px',
              borderTop: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)', fontSize: '13px',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>{rows.length} scene{rows.length !== 1 ? 's' : ''}</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {new Set(rows.flatMap((r) => r.characters)).size} characters · {new Set(rows.flatMap((r) => r.props)).size} props · {new Set(rows.map((r) => r.location)).size} locations
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
