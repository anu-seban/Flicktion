'use client';

import { useState, useEffect } from 'react';
import { useEntityStore } from '@/stores/useEntityStore';
import { Entity, Character, Prop, Location } from '@/lib/types';
import { ROLES, ASSET_COLOR_PRESETS } from '@/lib/constants';

export default function AssetEditModal() {
  const { editingEntityId, setEditingEntityId, getById, updateEntity, entities } = useEntityStore();
  const asset = editingEntityId ? getById(editingEntityId) : null;
  
  const [formData, setFormData] = useState<Partial<Entity> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      setFormData(asset);
      setError(null);
    } else {
      setFormData(null);
    }
  }, [asset]);

  if (!editingEntityId || !asset || !formData) return null;

  const onClose = () => setEditingEntityId(null);

  // Get colors already used by OTHER assets in this project
  const usedColors = entities
    .filter(e => e.id !== asset.id && e.projectId === asset.projectId)
    .map(e => e.color?.toLowerCase())
    .filter(Boolean) as string[];

  const handleUpdate = (field: string, value: any) => {
    if (field === 'color') {
      const normalizedColor = (value as string).toLowerCase();
      if (usedColors.includes(normalizedColor)) {
        setError('This color is already assigned to another asset.');
      } else {
        setError(null);
      }
      setFormData(prev => ({ ...prev!, [field]: normalizedColor }));
    } else {
      setFormData(prev => ({ ...prev!, [field]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdate('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSave = () => {
    if (error) return;
    updateEntity(asset.id, formData);
    onClose();
  };

  const renderSpecificFields = () => {
    if (asset.type === 'character') {
      const char = formData as Partial<Character>;
      return (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Role</label>
              <select className="input-glass" value={char.role} onChange={(e) => handleUpdate('role', e.target.value)}>
                {ROLES.map(r => <option key={r} value={r} style={{ background: 'var(--bg-primary)' }}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Age</label>
              <input className="input-glass" value={char.age} onChange={(e) => handleUpdate('age', e.target.value)} placeholder="e.g. 28" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Job / Life Position</label>
            <input className="input-glass" value={char.job} onChange={(e) => handleUpdate('job', e.target.value)} placeholder="e.g. Architect" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Archetypes</label>
            <input className="input-glass" value={char.archetypes} onChange={(e) => handleUpdate('archetypes', e.target.value)} placeholder="e.g. The Hero, The Mentor" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Habit & Mannerisms</label>
            <textarea 
              className="input-glass" 
              value={char.habits} 
              onChange={(e) => handleUpdate('habits', e.target.value)} 
              placeholder="e.g. Scratches beard when thinking..."
              style={{ minHeight: '60px', resize: 'vertical' }}
            />
          </div>
        </>
      );
    }
    if (asset.type === 'prop') {
      const prop = formData as Partial<Prop>;
      return (
        <div>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Art / VFX</label>
          <input className="input-glass" value={prop.artVfx} onChange={(e) => handleUpdate('artVfx', e.target.value)} placeholder="e.g. Glowing Sword Effect" />
        </div>
      );
    }
    if (asset.type === 'location') {
      const loc = formData as Partial<Location>;
      return (
        <div>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Details / Description</label>
          <textarea 
            className="input-glass" 
            value={loc.details} 
            onChange={(e) => handleUpdate('details', e.target.value)} 
            placeholder="e.g. A dusty old library with high ceilings..."
            style={{ minHeight: '80px', resize: 'vertical' }}
          />
        </div>
      );
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
    }} onClick={onClose}>
      <div className="glass-panel" style={{
        width: '450px', padding: '24px', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '20px',
        maxHeight: '90vh', overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600' }}>Edit Asset</h4>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px' }}>{asset.type}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>{asset.type} Image</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {formData.imageUrl && (
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-glass)' }} 
                  />
                )}
                <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                  <input 
                    className="input-glass" 
                    value={formData.imageUrl || ''} 
                    onChange={(e) => handleUpdate('imageUrl', e.target.value)} 
                    placeholder="Paste image link..." 
                    style={{ fontSize: '12px' }}
                  />
                  <label className="btn-ghost" style={{ cursor: 'pointer', padding: '8px 12px', display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                    <span>Upload</span>
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Name</label>
            <input className="input-glass" value={formData.name || ''} onChange={(e) => handleUpdate('name', e.target.value)} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Label Color</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ASSET_COLOR_PRESETS.map(c => {
                const isTaken = usedColors.includes(c.toLowerCase());
                return (
                  <button
                    key={c}
                    onClick={() => handleUpdate('color', c)}
                    disabled={isTaken}
                    title={isTaken ? 'This color is already assigned to another asset' : ''}
                    style={{
                      width: '24px', height: '24px', borderRadius: '50%', background: c, 
                      border: formData.color === c ? '2px solid white' : '2px solid transparent',
                      cursor: isTaken ? 'not-allowed' : 'pointer', 
                      opacity: isTaken ? 0.2 : 1,
                      outline: formData.color === c ? `1px solid ${c}` : 'none', transition: 'all 0.2s', padding: 0,
                    }}
                  />
                );
              })}
            </div>
            {error && <p style={{ fontSize: '10px', color: '#ff4d4d', marginTop: '4px' }}>{error}</p>}
          </div>

          {renderSpecificFields()}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button 
            className="btn-primary" 
            onClick={onSave} 
            style={{ flex: 1, opacity: error ? 0.5 : 1, cursor: error ? 'not-allowed' : 'pointer' }}
            disabled={!!error}
          >Save</button>
        </div>
      </div>
    </div>
  );
}
