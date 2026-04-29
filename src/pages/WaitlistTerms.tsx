import { useNavigate } from 'react-router-dom';
import CustomCursor from '../components/CustomCursor';

const GOLD  = '#C9A870';
const DARK  = '#1C1C1C';
const CREAM = '#EDEBE6';
const MUTED = '#888888';

export default function WaitlistTerms() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: DARK, minHeight: '100vh', fontFamily: "'Heebo', sans-serif", cursor: 'none' }} dir="rtl">
      <CustomCursor />

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid #2A2A2A', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: '1px solid #2A2A2A', borderRadius: '8px',
            color: CREAM, cursor: 'pointer', padding: '8px 16px',
            fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          ← חזרה
        </button>
        <img src="/assets/logo.png" alt="SPINZ" style={{ height: '28px', filter: 'invert(1) brightness(2)', opacity: 0.8 }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) 32px' }}>

        <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: MUTED, marginBottom: '12px' }}>
          תנאי שימוש ופרטיות · TERMS & PRIVACY
        </span>
        <h1 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 5vw, 48px)', color: CREAM, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          מדיניות פרטיות
        </h1>
        <p style={{ color: MUTED, fontSize: '13px', margin: '0 0 48px' }}>עדכון אחרון: אפריל 2026</p>

        {[
          {
            title: '1. מי אוסף את המידע',
            body: 'SPINZ (להלן: "החברה") אוספת את המידע שאתם מזינים בטופס רשימת ההמתנה באתר waitlist.spinzbikes.com. כתובת הדוא"ל לפניות: info@spinzbikes.com.',
          },
          {
            title: '2. איזה מידע נאסף',
            body: 'שם מלא, מספר טלפון, וכתובת דוא"ל (אופציונלי). בנוסף, העדפת צבע ומידה שתמסרו במידה ובחרתם למלא אותן.',
          },
          {
            title: '3. מטרת האיסוף',
            body: 'המידע נאסף לצורך עדכון חד-פעמי על השקת אופני SPINZ ועל זמינות המלאי. לא נשלח שיווק ספאם ולא נשתמש במידע לכל מטרה אחרת ללא הסכמתכם המפורשת.',
          },
          {
            title: '4. שיתוף מידע עם צדדים שלישיים',
            body: 'החברה לא מוכרת, מעבירה או חולקת את פרטיכם האישיים עם כל צד שלישי, למעט ספקי תשתית טכנית (כגון Supabase לאחסון הנתונים) המחויבים בסודיות.',
          },
          {
            title: '5. אבטחת מידע',
            body: 'המידע מאוחסן בשרתים מאובטחים עם הצפנה. אנו נוקטים אמצעי אבטחה סבירים להגנה על פרטיכם.',
          },
          {
            title: '6. זכויותיכם',
            body: 'בהתאם לחוק הגנת הפרטיות הישראלי, יש לכם הזכות לעיין במידע שנשמר אודותיכם, לתקן אותו, או לדרוש את מחיקתו. לבקשות כאמור, פנו אלינו בכתובת: info@spinzbikes.com.',
          },
          {
            title: '7. שמירת מידע',
            body: 'המידע יישמר עד להשקת המוצר ולמשלוח העדכון המובטח. לאחר מכן ניצור קשר ונשאל האם ברצונכם להישאר ברשימת התפוצה.',
          },
          {
            title: '8. יצירת קשר',
            body: 'לכל שאלה בנושא הפרטיות, ניתן לפנות אלינו בדוא"ל: info@spinzbikes.com.',
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '17px', color: CREAM, margin: '0 0 10px' }}>
              {section.title}
            </h2>
            <p style={{ color: MUTED, fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
              {section.body}
            </p>
          </div>
        ))}

        <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '32px', marginTop: '16px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '13px 28px',
              borderRadius: '8px',
              backgroundColor: GOLD,
              border: 'none',
              color: DARK,
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: "'Heebo', sans-serif",
            }}
          >
            ← חזרה לרשימת ההמתנה
          </button>
        </div>
      </div>
    </div>
  );
}
