import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import './styles/globals.css';
import Index from './pages/Index';
import Story from './pages/Story';
import Terms from './pages/Terms';
import Accessibility from './pages/Accessibility';
import Waitlist from './pages/Waitlist';
import WaitlistTerms from './pages/WaitlistTerms';
import Bikes from './pages/Bikes';
import SpecsPage from './pages/SpecsPage';
import SizesColors from './pages/SizesColors';
import FAQPage from './pages/FAQPage';
import Guides from './pages/Guides';
import GalleryPage from './pages/GalleryPage';
import Community from './pages/Community';
import ReviewsPage from './pages/ReviewsPage';
import Contact from './pages/Contact';
import PresaleTerms from './pages/PresaleTerms';
import CancelOrder from './pages/CancelOrder';
import Regulations from './pages/Regulations';
import AccessibilityWidget from './components/AccessibilityWidget';
import { getPauseMotion, onPauseMotionChange } from './utils/motionStore';
import PasswordGate from './components/PasswordGate';

function Root() {
  const [pauseMotion, setPauseMotionState] = useState(getPauseMotion);

  useEffect(() => onPauseMotionChange(setPauseMotionState), []);

  return (
    <>
      <PasswordGate>
        <MotionConfig
          reducedMotion={pauseMotion ? 'always' : 'never'}
          transition={pauseMotion ? { duration: 0, delay: 0 } : undefined}
        >
          <BrowserRouter>
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
              {window.location.hostname === 'waitlist.spinzbikes.com' ? (
                <Routes>
                  <Route path="/" element={<Waitlist />} />
                  <Route path="/terms" element={<WaitlistTerms />} />
                </Routes>
              ) : (
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/bikes" element={<Bikes />} />
                  <Route path="/specs" element={<SpecsPage />} />
                  <Route path="/sizes" element={<SizesColors />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/guides" element={<Guides />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/story" element={<Story />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/presale-terms" element={<PresaleTerms />} />
                  <Route path="/cancel-order" element={<CancelOrder />} />
                  <Route path="/regulations" element={<Regulations />} />
                  <Route path="/accessibility" element={<Accessibility />} />
                  <Route path="/waitlist" element={<Waitlist />} />
                  <Route path="/waitlist-terms" element={<WaitlistTerms />} />
                </Routes>
              )}
            </main>

            <AccessibilityWidget />
          </BrowserRouter>
        </MotionConfig>
      </PasswordGate>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
