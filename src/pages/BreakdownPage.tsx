import { useParams } from 'react-router-dom';
import { useScriptStore } from '@/stores/useScriptStore';
import ShotBreakdownBox from '@/components/breakdown/ShotBreakdownBox';

export default function BreakdownPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const { getSegments } = useScriptStore();

  const segments = getSegments(projectId!);

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '4px', background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Shot Breakdown
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Define shots, camera moves, and technical requirements per script box.
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent-violet)', fontWeight: '700' }}>{segments.length}</span> Boxes Sync'd
          </div>
        </div>

        {segments.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 40px', 
            background: 'rgba(255,255,255,0.01)',
            border: '1px dashed var(--border-glass)',
            borderRadius: '24px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📋</div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No script boxes found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto 24px' }}>
              Add boxes in the <code style={{ color: 'var(--accent-emerald)' }}>Script Writer</code> to begin your breakdown.
            </p>
          </div>
        ) : (
          <div className="breakdown-boxes">
            {segments.map((segment, idx) => (
              <ShotBreakdownBox 
                key={segment.id} 
                segment={segment} 
                sceneNumber={idx + 1}
                projectId={projectId!} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
