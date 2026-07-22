import PageShell from '../components/PageShell';
import { COMPANY, COMPANY_LINE } from '../config/company';

const DARK = '#1C1C1C';
const MUTED = '#4A4845';
const GOLD = '#C9A870';
const BORDER = '#E0DCD4';

const sections = [
  {
    title: null,
    text: `${COMPANY_LINE} מחויבת לנגישות דיגיטלית ולהבטחת חוויית שימוש שוויונית לכלל המשתמשים, לרבות אנשים עם מוגבלויות. אנו פועלים בהתאם לתקן ישראלי 5568 ולהנחיות WCAG 2.1 ברמה AA.`,
  },
  {
    title: 'מה אנחנו עושים',
    text: 'האתר תוכנן עם תמיכה בניווט מקלדת, ניגודיות צבעים מתאימה, תיאורי טקסט לתמונות (alt text) ומבנה סמנטי ברור התומך בתוכנות קריאת מסך.',
  },
  {
    title: 'רמת הנגישות',
    text: 'אנו שואפים לעמוד בדרישות תקן WCAG 2.1 ברמה AA. אם נתקלת בחסם נגישות כלשהו – נשמח לשמוע ולתקן.',
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
    text: `דוא"ל: ${COMPANY.email}\nטלפון: ${COMPANY.phone}\nניתן לפנות אלינו גם דרך WhatsApp.`,
  },
  {
    title: 'רכז נגישות',
    text: `רכז הנגישות של ${COMPANY.legalNameHe} אחראי לנושא ונותן מענה לפניות הציבור בכל הקשור לנגישות האתר. לפניות: ${COMPANY.email}`,
  },
];

function Section({ title, children }: { title: string | null; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '30px' }}>
      {title && (
        <h2 style={{
          fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(17px, 2.2vw, 21px)',
          color: DARK, margin: '0 0 10px', paddingInlineStart: '11px',
          borderInlineStart: `3px solid ${GOLD}`,
        }}>
          {title}
        </h2>
      )}
      <div style={{
        fontFamily: "'Heebo', sans-serif", fontSize: '14.5px', color: MUTED,
        lineHeight: 1.85, whiteSpace: 'pre-line',
      }}>
        {children}
      </div>
    </section>
  );
}

export default function Accessibility() {
  return (
    <PageShell
      eyebrow="Accessibility"
      title="הצהרת נגישות"
      subtitle="אנחנו מחויבים לחוויית שימוש שוויונית לכולם – בהתאם לתקן ישראלי 5568 ולתקן WCAG 2.1 ברמה AA."
      heroImage="/assets/photo-beige-bike.jpg"
      heroPosition="center 55%"
    >
      <div style={{ backgroundColor: '#F5F2EC', padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }} dir="rtl">
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          <div style={{ marginBottom: '30px' }}>
            <span style={{
              display: 'inline-block', padding: '7px 16px', borderRadius: '20px',
              border: `1px solid ${GOLD}55`, backgroundColor: `${GOLD}18`,
              fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', fontWeight: 700,
              color: '#8A6D2F', letterSpacing: '0.04em',
            }}>
              תקן ישראלי 5568 · WCAG 2.1 AA
            </span>
          </div>

          {sections.map((s, i) => (
            <Section key={i} title={s.title}>{s.text}</Section>
          ))}

          <p style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: '#9A9690',
            lineHeight: 1.7, marginTop: '14px', paddingTop: '18px', borderTop: `1px solid ${BORDER}`,
          }}>
            הצהרת הנגישות עודכנה לאחרונה ביולי 2026.
          </p>

        </div>
      </div>
    </PageShell>
  );
}
