import { useState } from 'react';
import { Link } from 'react-router-dom';

const DARK   = '#1C1C1C';
const GOLD   = '#C9A870';
const CREAM  = '#EDEBE6';
const BORDER = '#2A2A2A';
const MUTED  = '#6A6862';

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
    title: 'מפרט טכני',
    text: 'שלדה: אלומיניום, גיאומטריה עירונית | מזלג: פלדה | גלגלים: 700c דופן כפולה, עומק 30 מ"מ | צמיגים: Kenda 700×32c עמידים לפנצ\'ר, רצועה פנימית 5 מ"מ | מנגנון: סינגל-ספיד 46T/16T | בלמים: Dual-Pivot קדמי ואחורי | משקל: כ-9.5 ק"ג | מידות שלדה: 54 (גובה 160–175 ס"מ), 57 (גובה 175–190 ס"מ)',
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

export default function Terms() {
  const [tab, setTab] = useState<'terms' | 'privacy'>('terms');
  const sections = tab === 'privacy' ? privacySections : termsSections;

  return (
    <div style={{ backgroundColor: DARK, minHeight: '100vh' }} dir="rtl">

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
          {tab === 'terms' ? 'תנאי שימוש.' : 'מדיניות פרטיות.'}
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { id: 'terms',   label: 'תנאי שימוש' },
            { id: 'privacy', label: 'מדיניות פרטיות' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as 'terms' | 'privacy')}
              style={{
                padding: '12px 24px',
                background: 'none', border: 'none',
                borderBottom: tab === t.id ? `2px solid ${GOLD}` : '2px solid transparent',
                color: tab === t.id ? GOLD : MUTED,
                fontFamily: "'Heebo', sans-serif",
                fontSize: '14px', fontWeight: 700,
                cursor: 'pointer',
                transition: 'color 0.2s',
                letterSpacing: '0.03em',
              }}
            >
              {t.label}
            </button>
          ))}
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
    </div>
  );
}
