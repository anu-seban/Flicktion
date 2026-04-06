import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useProjectStore } from '@/stores/useProjectStore';
import AssetBrowser from '@/components/vault/AssetBrowser';
import CommandPalette from '@/components/ui/CommandPalette';
import ThemeToggle from '@/components/ui/ThemeToggle';
import AssetEditModal from '@/components/vault/AssetEditModal';
import { useState } from 'react';
import { exportProject } from '@/lib/projectService';

const TABS = [
  { key: 'story', label: '🗺️ Story Maker', path: 'story' },
  { key: 'script', label: '📝 Script Writer', path: 'script' },
  { key: 'breakdown', label: '📋 Shot Breakdown', path: 'breakdown' },
];

export default function ProjectLayout() {
  const { id: projectId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { productions } = useProjectStore();
  const production = productions.find((p) => p.id === projectId);
  const [showVault, setShowVault] = useState(false);

  const activeTab = TABS.find((t) => location.pathname.includes(t.path))?.key || 'story';

  if (!production || !projectId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Production not found.</p>
        <button className="btn-ghost" onClick={() => navigate('/')}>← Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid var(--border-glass)',
        background: 'var(--bg-primary)',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: '13px' }} onClick={() => navigate('/')}>← Home</button>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{production.title}</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{production.genre}</span>
          </div>
        </div>
        <div className="tab-container">
          {TABS.map((tab) => (
            <button key={tab.key} className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => navigate(`/project/${projectId}/${tab.path}`)}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '13px' }}
            onClick={() => exportProject(projectId)}>
            📤 Export
          </button>
          <button className="btn-ghost" style={{
            padding: '6px 14px', fontSize: '13px',
            borderColor: showVault ? 'var(--accent-violet)' : undefined,
            color: showVault ? 'var(--accent-violet)' : undefined,
          }} onClick={() => setShowVault(!showVault)}>
            📁 Asset browser
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </div>
        {showVault && (
          <div style={{ width: '360px', borderLeft: '1px solid var(--border-glass)', overflow: 'auto', background: 'var(--bg-secondary)' }}>
            <AssetBrowser projectId={projectId} />
          </div>
        )}
      </div>

      <CommandPalette projectId={projectId} />
      <AssetEditModal />
    </div>
  );
}
