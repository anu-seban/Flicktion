'use client';

import React from 'react';
import { Shot } from '@/lib/types';
import { useShotStore } from '@/stores/useShotStore';

interface ShotRowProps {
  shot: Shot;
  projectId: string;
}

const SHOT_TYPES = ['CU', 'MCU', 'MS', 'WS', 'ECU', 'OTS', 'POV', 'BCU'];
const ANGLES = ['Eye Level', 'High Angle', 'Low Angle', 'Dutch Angle', 'Bird\'s Eye', 'Worm\'s Eye'];
const MOVEMENTS = ['Static', 'Pan', 'Tilt', 'Dolly', 'Zoom', 'Crane', 'Handheld', 'Track'];

export default function ShotRow({ shot, projectId }: ShotRowProps) {
  const { updateShot, removeShot } = useShotStore();

  const handleUpdate = (field: keyof Shot, value: string) => {
    updateShot(projectId, shot.id, { [field]: value });
  };

  return (
    <div className="shot-row" style={{
      display: 'grid',
      gridTemplateColumns: '50px 1.5fr 80px 100px 100px 1fr 1fr 40px',
      gap: '12px',
      padding: '12px 16px',
      alignItems: 'center',
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(255,255,255,0.02)',
      fontSize: '13px',
      transition: 'background 0.2s ease',
    }}>
      {/* Shot Number */}
      <input
        value={shot.shotNumber}
        onChange={(e) => handleUpdate('shotNumber', e.target.value)}
        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--accent-violet)', fontWeight: '700', textAlign: 'center' }}
      />

      {/* Description */}
      <input
        value={shot.description}
        placeholder="Shot description..."
        onChange={(e) => handleUpdate('description', e.target.value)}
        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)' }}
      />

      {/* Shot Type */}
      <select
        value={shot.shotType}
        onChange={(e) => handleUpdate('shotType', e.target.value)}
        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '4px', padding: '2px 4px', fontSize: '11px' }}
      >
        {SHOT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Angle */}
      <select
        value={shot.cameraAngle}
        onChange={(e) => handleUpdate('cameraAngle', e.target.value)}
        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '4px', padding: '2px 4px', fontSize: '11px' }}
      >
        {ANGLES.map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      {/* Move */}
      <select
        value={shot.cameraMove}
        onChange={(e) => handleUpdate('cameraMove', e.target.value)}
        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '4px', padding: '2px 4px', fontSize: '11px' }}
      >
        {MOVEMENTS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      {/* Audio */}
      <input
        value={shot.audio}
        placeholder="Audio notes..."
        onChange={(e) => handleUpdate('audio', e.target.value)}
        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '12px' }}
      />

      {/* Subjects */}
      <input
        value={shot.subjects.join(', ')}
        placeholder="Subjects..."
        onChange={(e) => updateShot(projectId, shot.id, { subjects: e.target.value.split(',').map(s => s.trim()) })}
        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '12px' }}
      />

      {/* Actions */}
      <button 
        onClick={() => removeShot(projectId, shot.id)}
        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s' }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseOut={(e) => (e.currentTarget.style.opacity = '0.5')}
      >
        ✕
      </button>
    </div>
  );
}
