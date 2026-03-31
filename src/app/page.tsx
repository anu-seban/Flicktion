'use client';

import { useState } from 'react';

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 48px', borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          }}>🎬</div>
          <h1 style={{
            fontSize: '22px', fontWeight: '700',
            background: 'linear-gradient(135deg, #f0f0f5, #8b8b9e)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>CineFlow</h1>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white',
          padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600',
          fontSize: '14px', cursor: 'pointer',
        }}>+ New Production</button>
      </header>

      <main style={{ padding: '48px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: '#f0f0f5' }}>
          Your Productions
        </h2>
        <p style={{ color: '#8b8b9e', marginBottom: '32px', fontSize: '15px' }}>
          Plan your next masterpiece from story beats to shot breakdowns.
        </p>

        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>🎥</div>
          <p style={{ color: '#8b8b9e', fontSize: '16px', marginBottom: '24px' }}>
            No productions yet. Create your first one to get started.
          </p>
          <button onClick={() => setShowModal(true)} style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white',
            padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600',
            fontSize: '14px', cursor: 'pointer',
          }}>+ Create Production</button>
        </div>
      </main>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100,
        }} onClick={() => setShowModal(false)}>
          <div style={{
            padding: '32px', width: '460px', maxWidth: '90vw',
            background: 'rgba(13,13,20,0.95)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#f0f0f5' }}>
              New Production
            </h3>
            <input
              placeholder="Enter production title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              id="production-title-input"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '10px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none',
                marginBottom: '16px',
              }}
            />
            <p style={{ color: '#8b8b9e', fontSize: '13px' }}>
              Modal works! Title: {title || '(none)'}
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, background: 'transparent', color: '#8b8b9e', padding: '8px 16px',
                borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
