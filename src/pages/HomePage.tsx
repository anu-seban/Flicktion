import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/useProjectStore';
import { GENRES } from '@/lib/constants';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { exportProject, importProjectFromFile } from '@/lib/projectService';

export default function HomePage() {
  const navigate = useNavigate();
  const { productions, createProduction, deleteProduction } = useProjectStore();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [logline, setLogline] = useState('');
  const [genre, setGenre] = useState('Drama');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (!title.trim()) return;
    const prod = createProduction(title.trim(), logline.trim(), genre);
    setTitle('');
    setLogline('');
    setGenre('Drama');
    setShowModal(false);
    navigate(`/project/${prod.id}/story`);
  };

  const handleOpen = (id: string) => {
    navigate(`/project/${id}/story`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const projectId = await importProjectFromFile(file);
      navigate(`/project/${projectId}/story`);
    } catch (err) {
      alert('Failed to import project. Please check the file format.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleImport}
      />
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 48px', borderBottom: '1px solid var(--border-glass)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '6px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>🎬</div>
          <h1 style={{
            fontSize: '18px', fontWeight: '600',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>CineFlow</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button className="btn-ghost" onClick={() => fileInputRef.current?.click()} id="import-project-btn">
            Import Project
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)} id="new-production-header-btn">
            + New Production
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Your Productions
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
            Plan your next masterpiece from story beats to shot breakdowns.
          </p>
        </div>

        {productions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>🎥</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '24px' }}>
              No productions yet. Create your first one to get started.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button className="btn-ghost" onClick={() => fileInputRef.current?.click()}>
                Import Project
              </button>
              <button className="btn-primary" onClick={() => setShowModal(true)} id="new-production-empty-btn">
                + Create Production
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px',
          }}>
            {productions.map((prod) => (
              <div key={prod.id} className="glass-card" style={{ padding: '20px', cursor: 'pointer', position: 'relative' }} onClick={() => handleOpen(prod.id)}>
                <div style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                  background: 'var(--bg-secondary)', color: 'var(--accent-violet)',
                  border: '1px solid var(--border-glass)',
                  fontSize: '10px', fontWeight: '600', textTransform: 'uppercase',
                  letterSpacing: '0.05em', marginBottom: '12px',
                }}>
                  {prod.genre}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {prod.title}
                </h3>
                {prod.logline && (
                  <p style={{
                    fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{prod.logline}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(prod.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={(e) => { e.stopPropagation(); exportProject(prod.id); }}>
                      Export
                    </button>
                    <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--accent-red)' }}
                      onClick={(e) => { e.stopPropagation(); deleteProduction(prod.id); }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }} onClick={() => setShowModal(false)}>
          <div className="glass-panel" style={{
            padding: '24px', width: '400px', maxWidth: '90vw', background: 'var(--bg-primary)',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>New Production</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Title</label>
                <input className="input-glass" placeholder="Enter production title..." value={title} onChange={(e) => setTitle(e.target.value)} autoFocus id="production-title-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Logline</label>
                <textarea className="input-glass" placeholder="A one-sentence summary of your story..." value={logline} onChange={(e) => setLogline(e.target.value)} rows={3} style={{ resize: 'vertical' }} id="production-logline-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Genre</label>
                <select className="input-glass" value={genre} onChange={(e) => setGenre(e.target.value)} id="production-genre-select">
                  {GENRES.map((g) => (<option key={g} value={g} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{g}</option>))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" onClick={handleCreate} style={{ flex: 1 }} id="create-production-btn">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
