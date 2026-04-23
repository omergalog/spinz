import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const DARK   = '#1C1C1C';
const GOLD   = '#C9A870';
const BORDER = '#2A2A2A';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const privacySections = [
  {
    title: null,
    text: 'אנו, מפעילי Spinz, מחויבים להגן על פרטיותך ולשמור על שקיפות מלאה בשימוש במידע האישי שלך.',
  },
  {
    title: 'מידע שאנו אוספים',
    text: 'כאשר אתה משתמש באתר, ממלא טופס או מבצע רכישה, אנו עשויים לאסוף מידע אישי כגון שם, מספר טלפון, כתובת דוא"ל וכתובת למשלוח.',
  },
  {
    title: 'מטרות השימוש במידע',
    text: 'המידע נאסף לצורך עיבוד הזמנות, מתן שירות לקוחות, שיפור חוויית המשתמש ושליחת עדכונים רלוונטיים — הכל בהתאם להסכמתך.',
  },
  {
    title: 'שיתוף עם צדדים שלישיים',
    text: 'אנו מעבירים מידע לצדדים שלישיים רק לצורך תפעול השירות (כגון חברת שליחויות), כאשר הם מחויבים לשמור על אבטחת המידע.',
  },
  {
    title: 'שמירת מידע',
    text: 'המידע נשמר למשך הזמן הנדרש לצורך המטרה שלשמה נאסף, או כפי שמחייב החוק.',
  },
  {
    title: 'זכויותיך',
    text: 'הזכות לעיין במידע, לתקנו, למחוק אותו, להגביל את עיבודו או להתנגד לו — בכל עת, בפנייה אלינו.',
  },
  {
    title: 'יצירת קשר',
    text: 'למימוש זכויותיך או לשאלות בנוגע לפרטיות: spinz.bikes@gmail.com',
  },
  {
    title: 'Cookies',
    text: 'אנו משתמשים בקובצי Cookies בהתאם להסכמתך. תוכל לנהל את ההעדפות שלך בכל עת דרך הגדרות הדפדפן.',
  },
  {
    title: 'פרטי החברה',
    text: 'האתר מנוהל על ידי Spinz ומחויב לעמוד בדרישות חוק הגנת הפרטיות, תיקון 13.',
  },
];

const termsSections = [
  {
    title: 'כללי',
    text: 'Spinz היא חברה מסחרית העוסקת במכירת אופניים. השימוש באתר ובשירותיו מהווה הסכמה לתנאים אלו.',
  },
  {
    title: 'המוצרים',
    text: 'Spinz מוכרת אופניים סינגל-ספיד אורבניים. האופניים מעוצבים בתל אביב ומיוצרים בחו"ל. המחירים המוצגים באתר כוללים מע"מ.',
  },
  {
    title: 'מה מגיע בקופסה',
    text: 'האופניים מגיעים כ-85% מורכבים. הרכבה סופית כוללת: חיבור ההגה, הרכבת הפדלים והתאמת גובה המושב. מצורפים כלי הרכבה וסרטון הדרכה.',
  },
  {
    title: 'משלוח',
    text: 'המשלוח מתבצע עד 5 ימי עסקים מרגע אישור ההזמנה לכל רחבי הארץ. ניתן לאסוף את האופניים ממחסן החברה בתיאום מראש.',
  },
  {
    title: 'אחריות',
    text: 'האופניים מגיעים עם אחריות של 5 שנים על שלדת האלומיניום. האחריות אינה כוללת חלפים מתכלים כגון צמיגים, שרשרת, פדלים ובלמים, ואינה חלה על נזקים הנובעים משימוש לא תקין או תאונה.',
  },
  {
    title: 'ביטול עסקה והחזרות',
    text: 'בהתאם לחוק הגנת הצרכן, ניתן לבטל עסקה תוך 14 יום ממועד קבלת המוצר, בתנאי שהאופניים לא הורכבו. במקרה של ביטול — ישא הצרכן בעלות המשלוח חזרה. לאחר הרכבה, ניתן לבטל רק בהסכמת החברה.',
  },
  {
    title: 'אחריות מוגבלת',
    text: 'Spinz לא תישא באחריות לנזקים עקיפים, אובדן הכנסה או כל נזק תוצאתי הנובע מהשימוש במוצרים.',
  },
  {
    title: 'שינויים בתנאים',
    text: 'Spinz שומרת לעצמה את הזכות לעדכן תנאים אלו בכל עת. המשך השימוש באתר לאחר עדכון מהווה הסכמה לתנאים החדשים.',
  },
  {
    title: 'יצירת קשר',
    text: 'לכל שאלה: spinz.bikes@gmail.com',
  },
];

export default function PrivacyModal({ isOpen, onClose }: Props) {
  const [tab, setTab] = useState<'privacy' | 'terms'>('terms');

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
              dir="rtl"
            >
              {/* Header */}
              <div style={{ padding: '24px 28px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <img src="/assets/logo.png" alt="SPINZ" style={{ height: '28px', width: 'auto', objectFit: 'contain', filter: 'invert(1) brightness(2)', opacity: 0.9 }} />
                <button onClick={onClose} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
                {[
                  { id: 'terms', label: 'תנאי שימוש' },
                  { id: 'privacy', label: 'מדיניות פרטיות' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id as 'privacy' | 'terms')}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'none',
                      border: 'none',
                      borderBottom: tab === t.id ? `2px solid ${GOLD}` : '2px solid transparent',
                      color: tab === t.id ? GOLD : '#666',
                      fontFamily: "'Heebo', sans-serif",
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div
                style={{ overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
                onWheel={e => e.stopPropagation()}
              >
                {(tab === 'privacy' ? privacySections : termsSections).map(({ title, text }, i) => (
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
                    תאריך עדכון אחרון: אפריל 2026
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
