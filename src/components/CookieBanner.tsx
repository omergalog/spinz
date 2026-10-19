import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PrivacyModal from './PrivacyModal';
import { useLocation } from 'react-router-dom';
import { useT, useDir, stripLangPrefix } from '../i18n/LanguageContext';
import { PIXEL_ENABLED } from '../lib/pixel';
import { COOKIE_SETTINGS_EVENT, LOADER_DONE_EVENT, getConsent, setConsent } from '../lib/consent';

const DARK = '#1C1C1C';
const GOLD = '#C9A870';
const LIGHT = '#F5F2EC';

export default function CookieBanner() {
  const { pathname } = useLocation();
  // בדף הבית מחכים לסוף מסך הפתיחה, כדי שהבאנר לא יופיע מעליו.
  const [loaderDone, setLoaderDone] = useState(() =>
    stripLangPrefix(pathname) !== '/' || sessionStorage.getItem('spinz-loaded') === '1');
  useEffect(() => {
    const done = () => setLoaderDone(true);
    window.addEventListener(LOADER_DONE_EVENT, done);
    return () => window.removeEventListener(LOADER_DONE_EVENT, done);
  }, []);
  const [visible, setVisible] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const t = useT();
  const dir = useDir();

  // On narrow screens the banner spans the full width and would sit underneath
  // the two floating buttons. Publish its height so they can lift above it.
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) { root.style.removeProperty('--fab-lift'); return; }
    const measure = () => {
      const h = barRef.current?.offsetHeight;
      if (h) root.style.setProperty('--fab-lift', `${h + 12}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (barRef.current) ro.observe(barRef.current);
    return () => { ro.disconnect(); root.style.removeProperty('--fab-lift'); };
  }, [visible]);

  useEffect(() => {
    if (!loaderDone) return;
    if (getConsent() !== null) return;
    const t = setTimeout(() => { setVisible(true); }, 2600);
    return () => clearTimeout(t);
  }, [loaderDone]);

  // "הגדרות עוגיות" בפוטר פותח את הבאנר שוב, גם למי שכבר בחר.
  useEffect(() => {
    const open = () => setVisible(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, open);
  }, []);
  const accept = () => { setConsent('granted'); setVisible(false); };
  const decline = () => { setConsent('denied'); setVisible(false); };

  return (
    <>
    <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={barRef}
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ y: 80, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
          style={{
            position: 'fixed',
            // כשהעגלה פתוחה הבאנר מוסתר (המשתנה נקבע ב-CartDrawer). במובייל
            // הוא כיסה את טופס הקופה עד שסגרו אותו. ההחלטה לא נרשמת, והבאנר
            // חוזר כשהעגלה נסגרת.
            visibility: 'var(--fab-vis, visible)' as never,
            bottom: '24px',
            left: '16px',
            right: '16px',
            zIndex: 9998,
            maxWidth: '620px',
            margin: '0 auto',
            backgroundColor: DARK,
            borderRadius: '12px',
            border: `1px solid #2A2A2A`,
            boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
          dir={dir}
        >
          {/* Top row: icon + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px', lineHeight: 1 }}>🚴‍♂️</span>
            <h4
              style={{
                fontFamily: "'Heebo', sans-serif",
                fontWeight: 800,
                fontSize: '16px',
                color: LIGHT,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {t.cookies.title}
            </h4>
            {/* Gold accent line */}
            <div style={{ flex: 1, height: '1px', backgroundColor: '#2A2A2A', marginRight: '4px' }} />
            <div
              style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                backgroundColor: GOLD,
                flexShrink: 0,
              }}
            />
          </div>

          {/* Body text */}
          <p
            style={{
              fontFamily: "'Heebo', sans-serif",
              fontSize: '13px',
              color: '#B0ADA8',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {t.cookies.body1}<span style={{ color: GOLD, fontWeight: 600 }}>{t.cookies.body2}</span>{t.cookies.body3(PIXEL_ENABLED)}
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={accept}
              style={{
                flex: 1,
                backgroundColor: GOLD,
                color: DARK,
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontFamily: "'Heebo', sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t.cookies.accept}
            </motion.button>
            {/* דחייה באותו משקל כמו אישור: לחיצה אחת, בלי להסתתר מאחורי
                "הגדרות". אחרי דחייה לא נטענים Analytics והפיקסל. */}
            <motion.button
              whileHover={{ opacity: 0.85 }}
              whileTap={{ scale: 0.97 }}
              onClick={decline}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                color: LIGHT,
                border: `1px solid #6A6862`,
                borderRadius: '6px',
                padding: '10px 20px',
                fontFamily: "'Heebo', sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t.cookies.decline}
            </motion.button>

            <motion.button
              whileHover={{ opacity: 0.7 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPrivacyOpen(true)}
              style={{
                backgroundColor: 'transparent',
                color: '#888',
                border: '1px solid #2A2A2A',
                borderRadius: '6px',
                padding: '10px 16px',
                fontFamily: "'Heebo', sans-serif",
                fontWeight: 400,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t.cookies.privacy}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
