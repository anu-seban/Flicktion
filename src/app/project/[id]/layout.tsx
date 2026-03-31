'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/useProjectStore';
import AssetBrowser from '@/components/vault/AssetBrowser';
import CommandPalette from '@/components/ui/CommandPalette';
import AssetEditModal from '@/components/vault/AssetEditModal';
import { useState, useEffect } from 'react';

const TABS = [
  { key: 'story', label: '🗺️ Story Maker', path: 'story' },
  { key: 'script', label: '📝 Script Writer', path: 'script' },
  { key: 'breakdown', label: '📋 Shot Breakdown', path: 'breakdown' },
];

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const projectId = params.id as string;
  const { productions } = useProjectStore();
  const production = productions.find((p) => p.id === projectId);
  const [showVault, setShowVault] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTab = TABS.find((t) => pathname.includes(t.path))?.key || 'story';

  if (!mounted) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    );
  }

  if (!production) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <p style={{ color: 'var(--text-muted)' }}>Production not found.</p>
        <button className="btn-ghost" onClick={() => router.push('/')}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      {/* Top Navigation Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-glass)',
        background: 'rgba(6, 6, 10, 0.8)',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            className="btn-ghost"
            style={{ padding: '6px 10px', fontSize: '13px' }}
            onClick={() => router.push('/')}
          >
            ← Home
          </button>
          <div>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              {production.title}
            </h2>
            <span style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {production.genre}
            </span>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="tab-container">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => router.push(`/project/${projectId}/${tab.path}`)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          className="btn-ghost"
          style={{
            padding: '6px 14px',
            fontSize: '13px',
            borderColor: showVault ? 'var(--accent-violet)' : undefined,
            color: showVault ? 'var(--accent-violet)' : undefined,
          }}
          onClick={() => setShowVault(!showVault)}
        >
          🏛️ Entity Vault
        </button>
      </header>

      {/* Content + Vault Sidebar */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>

        {showVault && (
          <div
            style={{
              width: '360px',
              borderLeft: '1px solid var(--border-glass)',
              overflow: 'auto',
              background: 'rgba(6, 6, 10, 0.5)',
            }}
          >
            <AssetBrowser projectId={projectId} />
          </div>
        )}
      </div>

      <CommandPalette projectId={projectId} />
      <AssetEditModal />
    </div>
  );
}
