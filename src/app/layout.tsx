import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CineFlow — Pre-Production Planner',
  description: 'A powerful web-based movie pre-production planner with story mapping, script writing, and automated shot breakdowns.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        {/* Ambient background glows */}
        <div className="ambient-glow ambient-glow-1" />
        <div className="ambient-glow ambient-glow-2" />
        {children}
      </body>
    </html>
  );
}
