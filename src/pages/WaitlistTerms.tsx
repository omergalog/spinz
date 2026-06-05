import { useNavigate } from 'react-router-dom';

const GOLD  = '#C9A870';
const DARK  = '#1C1C1C';
const CREAM = '#EDEBE6';
const MUTED = '#888888';

export default function WaitlistTerms() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: DARK, minHeight: '100vh', fontFamily: "'Heebo', sans-serif", cursor: 'none' }} dir="rtl">

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid #2A2A2A', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: '1px solid #2A2A2A', borderRadius: '8px',
            color: CREAM, cursor: 'pointer', padding: '8px 16px',
            fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          חזרה
        </button>
        <img src="/assets/logo.png" alt="SPINZ" style={{ height: '28px', filter: 'invert(1) brightness(2)', opacity: 0.8 }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) 32px' }}>

        <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: MUTED, marginBottom: '12px' }}>
          תנאי שימוש ופרטיות · TERMS & PRIVACY
        </span>
        <h1 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 5vw, 48px)', color: CREAM, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          תנאי שימוש ומדיניות פרטיות
        </h1>
        <p style={{ color: MUTED, fontSize: '13px', margin: '0 0 48px' }}>עדכון אחרון: מאי 2026</p>

        {/* תנאי שימוש */}
        <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(20px, 3vw, 28px)', color: CREAM, margin: '0 0 28px', letterSpacing: '-0.01em', borderBottom: '1px solid #2A2A2A', paddingBottom: '16px' }}>
          תנאי שימוש
        </h2>

        {[
          {
            title: 'א. פרטי החברה',
            body: 'האתר waitlist.spinzbikes.com מופעל על ידי SPINZ BIKES LTD, ח.פ. 517343661 (להלן: "החברה"). לפניות: info@spinzbikes.com.',
          },
          {
            title: 'ב. מהות השירות',
            body: 'אתר זה הוא רשימת המתנה בלבד — לא חנות מקוונת ולא ביצוע עסקה. ההרשמה אינה מהווה הזמנה, רכישה, או התחייבות כלשהי מצד החברה לאספקת מוצר.',
          },
          {
            title: 'ג. אחריות לתמונות ומפרט',
            body: 'התמונות והמפרט הטכני המוצגים באתר מיועדים להמחשה בלבד ומציגים אב-טיפוס. ייתכנו שינויים במוצר הסופי. החברה אינה אחראית לסתירה בין המוצג באתר לבין המוצר הסופי.',
          },
          {
            title: 'ד. ביטול ה-launch',
            body: 'במקרה של ביטול השקת המוצר, תשלח הודעה לכל הנרשמים לכתובת הטלפון ו/או הדוא"ל שמסרו, ופרטיהם האישיים יימחקו תוך 30 יום מיום ההודעה.',
          },
          {
            title: 'ה. שינויים בתנאים',
            body: 'החברה רשאית לעדכן תנאים אלה בכל עת. שימוש מתמשך באתר לאחר פרסום עדכון מהווה הסכמה לתנאים המעודכנים.',
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

        {/* מדיניות פרטיות */}
        <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(20px, 3vw, 28px)', color: CREAM, margin: '48px 0 28px', letterSpacing: '-0.01em', borderBottom: '1px solid #2A2A2A', paddingBottom: '16px' }}>
          מדיניות פרטיות
        </h2>

        {[
          {
            title: '1. מי אוסף את המידע',
            body: 'SPINZ BIKES LTD (ח.פ. 517343661) אוספת את המידע שאתם מזינים בטופס רשימת ההמתנה באתר waitlist.spinzbikes.com. כתובת הדוא"ל לפניות: info@spinzbikes.com.',
          },
          {
            title: '2. איזה מידע נאסף',
            body: 'שם מלא, מספר טלפון, וכתובת דוא"ל (אופציונלי). בנוסף, העדפת צבע ומידה שתמסרו במידה ובחרתם למלא אותן.',
          },
          {
            title: '3. מטרת האיסוף',
            body: 'המידע נאסף לצורך עדכון על השקת אופני SPINZ ועל זמינות המלאי. לא נשלח שיווק ספאם ולא נשתמש במידע לכל מטרה אחרת ללא הסכמתכם המפורשת.',
          },
          {
            title: '4. הסכמה לקבלת דברי פרסומת ועדכונים שיווקיים',
            body: 'ככל שסומנה על ידי המשתמש תיבת ההסכמה הייעודית לקבלת עדכונים ושיווק בטופס הרישום, הדבר מהווה הסכמה מפורשת לקבלת דברי פרסומת, מבצעים ועדכונים מהחברה באמצעי התקשורת שנמסרו (לרבות דוא"ל ומסרונים), בהתאם לחוק התקשורת (בזק ושידורים), התשמ"ב-1982. משתמש שלא סימן תיבה זו, יקבל עדכונים תפעוליים בלבד הנוגעים ישירות לסטטוס רשימת ההמתנה והשקת המוצר, כפי שפורט בסעיף 3 לעיל.',
          },
          {
            title: '5. שיתוף מידע עם צדדים שלישיים',
            body: 'החברה לא מוכרת, מעבירה או חולקת את פרטיכם האישיים עם כל צד שלישי, למעט ספקי תשתית טכנית (כגון Supabase לאחסון הנתונים) המחויבים בסודיות.',
          },
          {
            title: '6. שימוש בעוגיות (Cookies)',
            body: 'האתר עשוי להשתמש בעוגיות (Cookies) וכלי מעקב של צדדים שלישיים לצורך תפעולו השוטף, שיפור חוויית המשתמש ואיסוף נתונים סטטיסטיים.',
          },
          {
            title: '7. הגבלת גיל',
            body: 'ההרשמה לרשימת ההמתנה והשימוש באתר מיועדים למשתמשים מעל גיל 18.',
          },
          {
            title: '8. אבטחת מידע',
            body: 'המידע מאוחסן בשרתים מאובטחים עם הצפנה. אנו נוקטים אמצעי אבטחה סבירים להגנה על פרטיכם.',
          },
          {
            title: '9. זכויותיכם',
            body: 'בהתאם לחוק הגנת הפרטיות הישראלי, יש לכם הזכות לעיין במידע שנשמר אודותיכם, לתקן אותו, או לדרוש את מחיקתו. לבקשות כאמור, פנו אלינו בכתובת: info@spinzbikes.com.',
          },
          {
            title: '10. שמירת מידע',
            body: 'המידע יישמר עד להשקת המוצר ולמשלוח העדכון המובטח. לאחר מכן ניצור קשר ונשאל האם ברצונכם להישאר ברשימת התפוצה.',
          },
          {
            title: '11. יצירת קשר',
            body: 'לכל שאלה בנושא הפרטיות, ניתן לפנות אלינו בדוא"ל: info@spinzbikes.com.',
          },
          {
            title: '12. סמכות שיפוט',
            body: 'על מדיניות זו יחולו דיני מדינת ישראל בלבד, וסמכות השיפוט הבלעדית בכל עניין הנוגע לה תהיה נתונה לבתי המשפט המוסמכים בתל אביב.',
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
            חזרה לרשימת ההמתנה
          </button>
        </div>
      </div>
    </div>
  );
}
