import { useLang, useDir } from '../i18n/LanguageContext';
import { getPrivacySections, PRIVACY_UPDATED } from '../data/privacy';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const DARK   = '#1C1C1C';
const GOLD   = '#C9A870';
const BORDER = '#2A2A2A';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: Props) {
  const lang = useLang();
  const dir = useDir();
  // אותו תוכן שבעמוד /terms, מ-src/data/privacy.ts. היו כאן גם "תנאי
  // שימוש" ישנים, שסתרו את התקנון (ביטול רק לפני הרכבה, 5 ימי עסקים).
  const en = lang === 'en';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 998, backgroundColor: 'rgba(0,0,0,0.7)' }}
          />

          <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{
                pointerEvents: 'all',
                backgroundColor: DARK,
                width: '90%', maxWidth: '680px',
                maxHeight: '85vh',
                borderRadius: '12px',
                border: `1px solid ${BORDER}`,
                display: 'flex', flexDirection: 'column',
              }}
              dir={dir}
            >
              {/* Header */}
              <div style={{ padding: '24px 28px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <img src="/assets/logo.png" alt="SPINZ" style={{ height: '28px', width: 'auto', objectFit: 'contain', filter: 'invert(1) brightness(2)', opacity: 0.9 }} />
                <button onClick={onClose} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div
                style={{ overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
                onWheel={e => e.stopPropagation()}
              >
                {getPrivacySections(lang).map(({ title, text }, i) => (
                  <div key={i}>
                    {title && (
                      <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '14px', color: GOLD, margin: '0 0 6px', letterSpacing: '0.05em' }}>
                        {title}
                      </h3>
                    )}
                    <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: '#CCCCCC', lineHeight: 1.75, margin: 0 }}>
                      {text}
                    </p>
                  </div>
                ))}

                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '16px', marginTop: '4px' }}>
                  <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', color: '#666', margin: 0 }}>
                    {en ? `Last updated: ${PRIVACY_UPDATED.en}. Terms of use are in the ` : `תאריך עדכון אחרון: ${PRIVACY_UPDATED.he}. תנאי השימוש נמצאים ב`}<a href={en ? '/en/regulations' : '/regulations'} style={{ color: GOLD }}>{en ? 'Terms & Conditions' : 'תקנון'}</a>.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
