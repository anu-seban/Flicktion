// ============================================================
// CineFlow — Design Tokens & Constants
// ============================================================

export const ENTITY_COLORS = {
  character: {
    primary: 'var(--accent-cyan)',
    bg: 'var(--bg-secondary)',
    border: 'var(--border-glass)',
  },
  prop: {
    primary: 'var(--accent-amber)',
    bg: 'var(--bg-secondary)',
    border: 'var(--border-glass)',
  },
  location: {
    primary: 'var(--accent-emerald)',
    bg: 'var(--bg-secondary)',
    border: 'var(--border-glass)',
  },
} as const;

export const ACT_COLORS = {
  1: { bg: '#4f46e5', label: 'Act I' },
  2: { bg: '#9333ea', label: 'Act II' },
  3: { bg: '#dc2626', label: 'Act III' },
} as const;

export const BEAT_TYPE_ICONS: Record<string, string> = {
  inciting: '⚡',
  rising: '📈',
  climax: '🔥',
  falling: '📉',
  resolution: '🎬',
};



export const GENRES = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi',
  'Thriller', 'Romance', 'Documentary', 'Animation', 'Fantasy',
  'Mystery', 'Western', 'Musical', 'Crime', 'War',
] as const;

export const ROLES = ['protagonist', 'antagonist', 'supporting', 'extra'] as const;
export const ASSET_COLOR_PRESETS = [
  '#7b61ff', // Violet
  '#00bcd4', // Cyan
  '#34d399', // Emerald
  '#fbbf24', // Amber
  '#f87171', // Rose
  '#ec4899', // Pink
  '#a78bfa', // Purple
  '#94a3b8', // Slate
] as const;
