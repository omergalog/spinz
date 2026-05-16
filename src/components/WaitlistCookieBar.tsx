import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GOLD = '#C9A870';
const DARK = '#1C1C1C';
const MUTED = '#888888';

export default function WaitlistCookieBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem('spinz-cookies') === '1') return; } catch {}
    const t = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const accept = () => {
    try { localStorage.setItem('spinz-cookies', '1'); } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: DARK,
            borderTop: '1px solid #2A2A2A',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
          dir="rtl"
        >
          <p style={{
            fontFamily: "'Heebo', sans-serif",
            fontSize: '12px',
            color: MUTED,
            margin: 0,
            lineHeight: 1.6,
            flex: 1,
            minWidth: '220px',
          }}>
            אנחנו משתמשים בעוגיות לשיפור חוויית הגלישה ולניתוח תנועה באתר.{' '}
            <a
              href="/terms"
              style={{ color: GOLD, textDecoration: 'underline', textUnderlineOffset: '2px' }}
            >
              מדיניות פרטיות
            </a>
          </p>

          <button
            onClick={accept}
            style={{
              backgroundColor: GOLD,
              color: DARK,
              border: 'none',
              borderRadius: '6px',
              padding: '8px 20px',
              fontFamily: "'Heebo', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            מסכים
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
