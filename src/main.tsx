import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import './styles/globals.css';
import Index from './pages/Index';
import Story from './pages/Story';
import Terms from './pages/Terms';
import Accessibility from './pages/Accessibility';
import AccessibilityWidget from './components/AccessibilityWidget';

function Root() {
  const [pauseMotion, setPauseMotion] = useState(() => {
    try {
      const saved = localStorage.getItem('a11y_settings');
      return saved ? !!JSON.parse(saved).pauseAnimations : false;
    } catch { return false; }
  });

  useEffect(() => {
    const handler = (e: Event) => setPauseMotion((e as CustomEvent<boolean>).detail);
    window.addEventListener('a11y-pause-motion', handler);
    return () => window.removeEventListener('a11y-pause-motion', handler);
  }, []);

  return (
    <MotionConfig reducedMotion={pauseMotion ? 'always' : 'never'}>
      <BrowserRouter>
        {/* Skip to main content — מקלדת */}
        <a
          href="#main-content"
          style={{
            position: 'absolute', top: '-100px', right: 0, zIndex: 99999,
            padding: '12px 20px', backgroundColor: '#C9A870', color: '#1C1C1C',
            fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '14px',
            textDecoration: 'none', borderRadius: '0 0 8px 8px',
            transition: 'top 0.2s',
          }}
          onFocus={e => { e.currentTarget.style.top = '0'; }}
          onBlur={e => { e.currentTarget.style.top = '-100px'; }}
        >
          דלג לתוכן הראשי
        </a>

        <main id="main-content">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/story" element={<Story />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/accessibility" element={<Accessibility />} />
          </Routes>
        </main>

        <AccessibilityWidget />
      </BrowserRouter>
    </MotionConfig>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
