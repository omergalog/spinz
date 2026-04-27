import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CustomCursor from '../components/CustomCursor';

const DARK   = '#1C1C1C';
const GOLD   = '#C9A870';
const CREAM  = '#EDEBE6';
const BORDER = '#2A2A2A';
const MUTED  = '#6A6862';

const sections = [
  {
    title: null,
    text: 'Spinz מחויבת לנגישות דיגיטלית ולהבטחת חוויית שימוש שוויונית לכלל המשתמשים, לרבות אנשים עם מוגבלויות. אנו פועלים בהתאם לתקן ישראלי 5568 ולהנחיות WCAG 2.1 ברמה AA.',
  },
  {
    title: 'מה אנחנו עושים',
    text: 'האתר תוכנן עם תמיכה בניווט מקלדת, ניגודיות צבעים מתאימה, תיאורי טקסט לתמונות (alt text) ומבנה סמנטי ברור התומך בתוכנות קריאת מסך.',
  },
  {
    title: 'רמת הנגישות',
    text: 'אנו שואפים לעמוד בדרישות תקן WCAG 2.1 ברמה AA. אם נתקלת בחסם נגישות כלשהו — נשמח לשמוע ולתקן.',
  },
  {
    title: 'תוכן חיצוני',
    text: 'חלקים מהאתר מסתמכים על תכנים של צדדים שלישיים (כגון סרטונים, מפות או ווידג\'טים חיצוניים) שאינם בשליטתנו המלאה. אנו פועלים לצמצם חסמים גם בתחומים אלו.',
  },
  {
    title: 'נתקלת בבעיה?',
    text: 'אם נתקלת בתוכן שאינו נגיש עבורך, נשמח שתיצור איתנו קשר. נשתדל לטפל בפנייה תוך 7 ימי עסקים.',
  },
  {
    title: 'יצירת קשר בנושא נגישות',
    text: 'דוא"ל: info@spinzbikes.com\nטלפון: 052-756-5262\nניתן לפנות אלינו גם דרך WhatsApp.',
  },
  {
    title: 'רכז נגישות',
    text: 'רכז הנגישות של Spinz אחראי לנושא ונותן מענה לפניות הציבור בכל הקשור לנגישות האתר.',
  },
  {
    title: 'תאריך הצהרה זו',
    text: 'הצהרת הנגישות עודכנה לאחרונה באפריל 2026.',
  },
];

export default function Accessibility() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ backgroundColor: DARK, minHeight: '100vh' }}
      dir="rtl"
    >
      <CustomCursor />

      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: DARK,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 32px',
          height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="/assets/logo.png"
              alt="SPINZ"
              style={{ height: '40px', width: 'auto', filter: 'invert(1) brightness(2)', opacity: 0.9 }}
            />
          </Link>
          <Link
            to="/"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: "'Heebo', sans-serif",
              fontSize: '13px', fontWeight: 600,
              color: MUTED,
              textDecoration: 'none',
              letterSpacing: '0.05em',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = CREAM; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = MUTED; }}
          >
            ← חזרה לאתר
          </Link>
        </div>
      </header>

      {/* Page heading */}
      <div style={{
        borderBottom: `1px solid ${BORDER}`,
        padding: 'clamp(40px, 6vw, 72px) 32px 0',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        <span style={{
          display: 'block', marginBottom: '12px',
          fontFamily: "'Heebo', sans-serif",
          fontSize: '11px', letterSpacing: '0.4em',
          textTransform: 'uppercase', color: MUTED,
        }}>
          Spinz
        </span>
        <h1 style={{
          fontFamily: "'Heebo', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(28px, 5vw, 60px)',
          color: CREAM,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          margin: '0 0 40px',
        }}>
          הצהרת נגישות.
        </h1>

        {/* Badge */}
        <div style={{ paddingBottom: '32px' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '20px',
            border: `1px solid ${GOLD}33`,
            backgroundColor: `${GOLD}11`,
            fontFamily: "'Heebo', sans-serif",
            fontSize: '12px',
            color: GOLD,
            letterSpacing: '0.06em',
          }}>
            תקן ישראלי 5568 · WCAG 2.1 AA
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(40px, 5vw, 64px) 32px 100px' }}>
        <div style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {sections.map(({ title, text }, i) => (
            <div
              key={i}
              style={{
                borderTop: `1px solid ${BORDER}`,
                padding: '28px 0',
              }}
            >
              {title && (
                <h3 style={{
                  fontFamily: "'Heebo', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  color: GOLD,
                  margin: '0 0 10px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  {title}
                </h3>
              )}
              <p style={{
                fontFamily: "'Heebo', sans-serif",
                fontSize: 'clamp(14px, 1.4vw, 16px)',
                color: '#BBBBBB',
                lineHeight: 1.85,
                margin: 0,
                whiteSpace: 'pre-line',
              }}>
                {text}
              </p>
            </div>
          ))}

          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '24px', marginTop: '8px' }}>
            <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', color: '#555', margin: 0 }}>
              תאריך עדכון אחרון: אפריל 2026
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
