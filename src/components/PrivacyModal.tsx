import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const DARK  = '#1C1C1C';
const GOLD  = '#C9A870';
const BEIGE = '#F5F2EC';
const BORDER = '#2A2A2A';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 998, backgroundColor: 'rgba(0,0,0,0.7)' }}
          />

          {/* Modal wrapper — centers without conflicting with framer transform */}
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
            dir="rtl"
          >
            {/* Header */}
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src="/assets/logo.png" alt="SPINZ" style={{ height: '32px', width: 'auto', objectFit: 'contain', filter: 'invert(1) brightness(2)', opacity: 0.9 }} />
                <div style={{ width: '1px', height: '28px', backgroundColor: BORDER }} />
                <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '18px', color: BEIGE, margin: 0 }}>
                  מדיניות פרטיות ותנאי שימוש
                </h2>
              </div>
              <button onClick={onClose} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div
              style={{ overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
              onWheel={e => e.stopPropagation()}
            >
              {[
                {
                  title: null,
                  text: 'אנו, מפעילי Spinz, מחויבים להגן על פרטיותך ולשמור על שקיפות מלאה בשימוש במידע האישי שלך.',
                },
                {
                  title: 'מידע שאנו אוספים',
                  text: 'כאשר אתה משתמש באתר, בדף הנחיתה, ממלא טופס או משתמש באפליקציה, אנו עשויים לאסוף מידע אישי כגון שם, מספר טלפון, כתובת דוא"ל, מיקום (GPS), כתובת IP ונתוני שימוש (כולל קובצי Cookies).',
                },
                {
                  title: 'מטרות השימוש במידע',
                  text: 'מידע זה נאסף לצורך מתן שירות מיטבי, שיפור חוויית המשתמש, יצירת קשר, ניתוח שימוש, שליחת עדכונים ושיווק ממוקד – הכל בהתאם להסכמתך.',
                },
                {
                  title: 'שיתוף עם צדדים שלישיים',
                  text: 'אנו משתמשים בכלים חיצוניים (כגון Google Maps, Firebase, AdMob וכלי ניתוח) ומעבירים מידע לצדדים שלישיים רק לצורך תפעול השירות, כאשר הם מחויבים לשמור על סטנדרטים גבוהים של אבטחת מידע.',
                },
                {
                  title: 'שמירת מידע',
                  text: 'המידע נשמר למשך הזמן הנדרש לצורך המטרה שלשמה נאסף, או כפי שמחייב החוק.',
                },
                {
                  title: 'זכויותיך',
                  text: 'לך, כמשתמש, מוקנות זכויות מלאות: הזכות לעיין במידע, לתקנו, למחוק אותו ("הזכות להישכח"), להגביל את עיבודו או להתנגד לו – בכל עת.',
                },
                {
                  title: 'יצירת קשר',
                  text: 'למימוש זכויותיך או לשאלות בנוגע לפרטיות, אנא פנה אלינו בכתובת: spinz.bikes@gmail.com',
                },
                {
                  title: 'Cookies',
                  text: 'אנו משתמשים בקובצי Cookies בהתאם להסכמתך – תוכל לנהל את ההעדפות שלך בכל עת.',
                },
                {
                  title: 'פרטי החברה',
                  text: 'האתר מנוהל על ידי Spinz ומחויב לעמוד בדרישות חוק הגנת הפרטיות, תיקון 13, וחוק הנגישות.',
                },
              ].map(({ title, text }, i) => (
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
                  תאריך עדכון אחרון: מרץ 2026
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
