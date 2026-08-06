import { useState } from 'react';
import PageShell from '../components/PageShell';
import TermsEn from './TermsEn';
import { useLang } from '../i18n/LanguageContext';
import { COMPANY, COMPANY_LINE } from '../config/company';

const DARK = '#1C1C1C';
const MUTED = '#4A4845';
const GOLD = '#C9A870';
const BORDER = '#E0DCD4';

const privacySections = [
  {
    title: null,
    text: `${COMPANY_LINE} מחויבת להגן על פרטיותך ולשמור על שקיפות מלאה בשימוש במידע האישי שלך.`,
  },
  {
    title: 'מידע שאנו אוספים',
    text: 'כאשר אתה משתמש באתר, ממלא טופס או מבצע רכישה, אנו עשויים לאסוף מידע אישי כגון שם, מספר טלפון, כתובת דוא"ל וכתובת למשלוח.',
  },
  {
    title: 'מטרות השימוש במידע',
    text: 'המידע נאסף לצורך עיבוד הזמנות, מתן שירות לקוחות, שיפור חוויית המשתמש ושליחת עדכונים רלוונטיים – הכל בהתאם להסכמתך.',
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
    text: 'הזכות לעיין במידע, לתקנו, למחוק אותו, להגביל את עיבודו או להתנגד לו – בכל עת, בפנייה אלינו.',
  },
  {
    title: 'יצירת קשר',
    text: `למימוש זכויותיך או לשאלות בנוגע לפרטיות: ${COMPANY.email}`,
  },
  {
    title: 'Cookies',
    text: 'אנו משתמשים בקובצי Cookies בהתאם להסכמתך. תוכל לנהל את ההעדפות שלך בכל עת דרך הגדרות הדפדפן.',
  },
  {
    title: 'פרטי החברה',
    text: `האתר מופעל על ידי ${COMPANY_LINE}. דוא"ל: ${COMPANY.email} · טלפון: ${COMPANY.phone}. החברה מחויבת לעמוד בדרישות חוק הגנת הפרטיות, תיקון 13.`,
  },
];

const termsSections = [
  {
    title: 'כללי',
    text: `האתר מופעל על ידי ${COMPANY_LINE}, העוסקת במכירת אופניים. השימוש באתר ובשירותיו מהווה הסכמה לתנאים אלו.`,
  },
  {
    title: 'המוצרים',
    text: `${COMPANY.legalNameHe} מוכרת אופניים סינגל-ספיד אורבניים. האופניים מעוצבים בתל אביב ומיוצרים בחו"ל. המחירים המוצגים באתר כוללים מע"מ.`,
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
    text: 'בהתאם לחוק הגנת הצרכן, ניתן לבטל עסקה תוך 14 יום ממועד קבלת המוצר. פירוט מלא של מדיניות הביטול, ההחזרים ודמי הביטול (שאנחנו לא גובים) מופיע בתקנון ותנאי השימוש ובתנאי המכירה המוקדמת.',
  },
  {
    title: 'אחריות מוגבלת',
    text: `${COMPANY.legalNameHe} לא תישא באחריות לנזקים עקיפים, אובדן הכנסה או כל נזק תוצאתי הנובע מהשימוש במוצרים.`,
  },
  {
    title: 'שינויים בתנאים',
    text: `${COMPANY.legalNameHe} שומרת לעצמה את הזכות לעדכן תנאים אלו בכל עת. המשך השימוש באתר לאחר עדכון מהווה הסכמה לתנאים החדשים.`,
  },
  {
    title: 'יצירת קשר',
    text: `לכל שאלה: ${COMPANY.email} · ${COMPANY.phone}`,
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
      <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14.5px', color: MUTED, lineHeight: 1.85 }}>
        {children}
      </div>
    </section>
  );
}

export default function Terms() {
  // הנוסח העברי הוא המחייב — נשאר כפי שהוא, בלי שכבת תרגום.
  if (useLang() === 'en') return <TermsEn />;
  const [tab, setTab] = useState<'terms' | 'privacy'>('terms');
  const sections = tab === 'privacy' ? privacySections : termsSections;

  return (
    <PageShell
      eyebrow="Legal"
      title="תנאי שימוש ומדיניות פרטיות"
      subtitle="הכללים לשימוש באתר, פרטי המוצרים, ואיך אנחנו שומרים על המידע האישי שלך."
      heroImage="/assets/lifestyle-hero.jpg"
      heroPosition="center 45%"
    >
      <div style={{ backgroundColor: '#F5F2EC', padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }} dir="rtl">
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${BORDER}`, marginBottom: '34px' }}>
            {[
              { id: 'terms', label: 'תנאי שימוש' },
              { id: 'privacy', label: 'מדיניות פרטיות' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as 'terms' | 'privacy')}
                style={{
                  padding: '12px 22px', background: 'none', border: 'none',
                  borderBottom: tab === t.id ? `2px solid ${GOLD}` : '2px solid transparent',
                  marginBottom: '-1px',
                  color: tab === t.id ? DARK : '#9A9690',
                  fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', transition: 'color 0.2s', letterSpacing: '0.03em',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {sections.map((s, i) => (
            <Section key={`${tab}-${i}`} title={s.title}>{s.text}</Section>
          ))}

          <p style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: '#9A9690',
            lineHeight: 1.7, marginTop: '14px', paddingTop: '18px', borderTop: `1px solid ${BORDER}`,
          }}>
            תאריך עדכון אחרון: יולי 2026. מסמך זה משלים את
            <a href="/regulations" style={{ color: GOLD }}> התקנון ותנאי השימוש</a> ואת
            <a href="/presale-terms" style={{ color: GOLD }}> תנאי המכירה המוקדמת</a>.
          </p>

        </div>
      </div>
    </PageShell>
  );
}
