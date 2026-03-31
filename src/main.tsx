import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './app/globals.css';

import HomePage from './pages/HomePage';
import ProjectLayout from './pages/ProjectLayout';
import StoryPage from './pages/StoryPage';
import ScriptPage from './pages/ScriptPage';
import BreakdownPage from './pages/BreakdownPage';
import { useThemeStore } from './stores/useThemeStore';
import { useEffect } from 'react';

function ThemeApp() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="ambient-glow" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/project/:id" element={<ProjectLayout />}>
          <Route index element={<Navigate to="story" replace />} />
          <Route path="story" element={<StoryPage />} />
          <Route path="script" element={<ScriptPage />} />
          <Route path="breakdown" element={<BreakdownPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeApp />
  </React.StrictMode>
);
