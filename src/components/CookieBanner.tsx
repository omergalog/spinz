import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PrivacyModal from './PrivacyModal';

const DARK = '#1C1C1C';
const GOLD = '#C9A870';
const LIGHT = '#F5F2EC';

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem('spinz-cookies') !== '1'; } catch { return true; }
  });
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const accept = () => {
    try { localStorage.setItem('spinz-cookies', '1'); } catch {}
    setVisible(false);
  };

  return (
    <>
    <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
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
          dir="rtl"
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
              רגע לפני שממשיכים לרכוב
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
            אנחנו משתמשים בעוגיות <span style={{ color: GOLD, fontWeight: 600 }}>(Cookies)</span> כדי
            שהאתר ירוץ חלק, לשפר את חווית הגלישה שלך ולהציג תוכן רלוונטי.
            המשך הגלישה מהווה הסכמה לשימוש בהן.
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
              מסכים, יאללה נרכוב! 🚴‍♂️
            </motion.button>

            <motion.button
              whileHover={{ opacity: 0.7 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { accept(); setPrivacyOpen(true); }}
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
              מדיניות פרטיות
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
