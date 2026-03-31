'use client';

import { useState } from 'react';
import { useEntityStore } from '@/stores/useEntityStore';
import { Entity, Character, Prop, Location, EntityType } from '@/lib/types';
import { ROLES, ASSET_COLOR_PRESETS } from '@/lib/constants';

interface AssetBrowserProps {
  projectId: string;
}

type AssetTab = 'character' | 'prop' | 'location';

const TAB_CONFIG: Record<AssetTab, { label: string; trigger: string; icon: string; defaultColor: string }> = {
  character: { label: 'Characters', trigger: '@', icon: '👤', defaultColor: '#7b61ff' },
  prop: { label: 'Props', trigger: '#', icon: '🎭', defaultColor: '#fbbf24' },
  location: { label: 'Locations', trigger: '$', icon: '📍', defaultColor: '#34d399' },
};

export default function AssetBrowser({ projectId }: AssetBrowserProps) {
  const { getByType, addCharacter, addProp, addLocation, updateEntity, removeEntity, setEditingEntityId } = useEntityStore();
  const [activeTab, setActiveTab] = useState<AssetTab>('character');
  const [newName, setNewName] = useState('');

  const assets = getByType(projectId, activeTab);

  const handleAdd = () => {
    if (!newName.trim()) return;
    
    switch (activeTab) {
      case 'character':
        addCharacter(projectId, newName.trim());
        break;
      case 'prop':
        addProp(projectId, newName.trim());
        break;
      case 'location':
        addLocation(projectId, newName.trim());
        break;
    }
    setNewName('');
  };

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{
        fontSize: '14px', fontWeight: '700', marginBottom: '16px',
        textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)',
      }}>
        Asset browser
      </h3>

      {/* Tab Strip */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '16px',
        background: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)',
      }}>
        {(Object.keys(TAB_CONFIG) as AssetTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '6px 8px', borderRadius: '4px', border: 'none', fontSize: '12px', fontWeight: '500',
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-ui)',
              background: activeTab === tab ? 'var(--bg-primary)' : 'transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {TAB_CONFIG[tab].icon} {TAB_CONFIG[tab].label}
          </button>
        ))}
      </div>

      {/* Add New */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          className="input-glass"
          placeholder={`New ${activeTab}...`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          style={{ fontSize: '13px' }}
        />
        <button className="btn-primary" onClick={handleAdd} style={{ padding: '8px 14px' }}>+</button>
      </div>

      {/* Asset List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {assets.map((asset) => (
          <div
            key={asset.id}
            onDoubleClick={() => setEditingEntityId(asset.id)}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/cineflow-asset', JSON.stringify({
                id: asset.id,
                name: asset.name,
                type: asset.type,
                trigger: asset.trigger
              }));
              e.dataTransfer.effectAllowed = 'copy';
            }}
            style={{
              padding: '10px 12px', marginBottom: '6px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
              cursor: 'grab', transition: 'all 0.15s',
            }}
            className="asset-item"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '4px',
                  background: (asset.color || TAB_CONFIG[activeTab].defaultColor) + '22',
                  color: asset.color || TAB_CONFIG[activeTab].defaultColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700',
                  border: `1.5px solid ${asset.color || TAB_CONFIG[activeTab].defaultColor}44`,
                }}>
                  {asset.trigger}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {asset.name}
                </span>
              </div>
              <button
                className="btn-ghost"
                style={{ padding: '2px 6px', fontSize: '10px', opacity: 0.5 }}
                onClick={(e) => { e.stopPropagation(); removeEntity(asset.id); }}
              >✕</button>
            </div>
          </div>
        ))}

        {assets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-muted)', fontSize: '12px' }}>
            No {TAB_CONFIG[activeTab].label.toLowerCase()} yet.
          </div>
        )}
      </div>
    </div>
  );
}

