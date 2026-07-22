import PageShell from '../components/PageShell';
import { COMPANY as CO } from '../config/company';

const DARK = '#1C1C1C';
const MUTED = '#4A4845';
const GOLD = '#C9A870';
const BORDER = '#E0DCD4';

const COMPANY = {
  name: `${CO.legalNameHe} (${CO.legalNameEn})`,
  companyId: `ח.פ. ${CO.companyNumber}`,
  address: CO.address,
  email: CO.email,
  phone: CO.phone,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '30px' }}>
      <h2 style={{
        fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(17px, 2.2vw, 21px)',
        color: DARK, margin: '0 0 10px', paddingInlineStart: '11px',
        borderInlineStart: `3px solid ${GOLD}`,
      }}>
        {title}
      </h2>
      <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14.5px', color: MUTED, lineHeight: 1.85 }}>
        {children}
      </div>
    </section>
  );
}

export default function Regulations() {
  return (
    <PageShell
      eyebrow="Terms"
      title="תקנון ותנאי שימוש"
      subtitle="ההסכם המשפטי המלא בין SPINZ ללקוחותיה — הרכבה ובטיחות, אחריות, ביטול עסקה וסמכות שיפוט."
      heroImage="/assets/photo-black-detail.jpg"
      heroPosition="center 55%"
    >
      <div style={{ backgroundColor: '#F5F2EC', padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }} dir="rtl">
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          <p style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: '#9A9690',
            margin: '0 0 30px',
          }}>
            גרסה 1.0 · עודכן במאי 2026
          </p>

          <Section title="1. מבוא והגדרות">
            <p style={{ margin: 0 }}>
              תקנון זה מהווה הסכם משפטי מחייב בין {COMPANY.name} (להלן: "החברה") לבין לקוחותיה
              (להלן: "הלקוח"). האתר משמש כחנות מקוונת למכירת אופניים ואביזרים. גלישה באתר או
              רכישת מוצר מהווים הסכמה לכל תנאי התקנון.
            </p>
          </Section>

          <Section title="2. הרכבת המוצר וחבות">
            <ul style={{ margin: 0, paddingInlineStart: '18px' }}>
              <li style={{ marginBottom: '8px' }}>
                אופני SPINZ נשלחים ללקוח מורכבים ברובם (כ־85%), ומצורפות אליהם הוראות הרכבה
                וסרטון הדרכה להשלמת ההרכבה.
              </li>
              <li style={{ marginBottom: '8px' }}>
                השלמת ההרכבה, כיוון מערכות הבטיחות (בלמים והיגוי) ובדיקת תקינות הם באחריות הלקוח.
                החברה ממליצה בחום לבצע בדיקת תקינות אצל מכונאי אופניים מוסמך לפני השימוש הראשון.
              </li>
              <li style={{ marginBottom: '8px' }}>
                הלקוח מצהיר כי ידוע לו שרכיבה על אופניים שהורכבו או כווננו באופן לקוי מהווה
                סיכון בטיחותי, וכי עליו לוודא את תקינות האופניים לפני כל רכיבה.
              </li>
              <li>
                בכפוף להוראות כל דין, החברה, מנהליה או מי מטעמה לא יישאו באחריות לנזק, פציעה או
                אובדן שנגרמו כתוצאה מהרכבה לקויה, רשלנית או כזו שבוצעה בניגוד להוראות ההרכבה שסופקו.
              </li>
            </ul>
          </Section>

          <Section title="3. אחריות מוגבלת">
            <ul style={{ margin: 0, paddingInlineStart: '18px' }}>
              <li style={{ marginBottom: '8px' }}>
                <b>שלדה:</b> אחריות מוגבלת ל־5 שנים (60 חודשים) ממועד הרכישה כנגד פגמי ייצור,
                סדקים בריתוכים או כשל מבני.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <b>רכיבים:</b> על המזלג (Fork) ועל רכיבים קשיחים שאינם מתכלים (כידון, מוט מושב,
                זרועות דיווש) תינתן אחריות ל־12 חודשים.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <b>חלקים מתכלים:</b> צמיגים, פנימיות, רפידות בלם, שרשרת וגלגלי שיניים אינם מכוסים
                באחריות, למעט פגם ייצור מובהק שהתגלה בתוך 30 ימים מהמסירה וטרם נעשה בהם שימוש.
              </li>
              <li>
                האחריות מותנית בהצגת חשבונית רכישה מקורית. השלמת ההרכבה העצמית בהתאם להוראות
                המצורפות אינה פוגעת באחריות; אחריות אינה חלה על בלאי סביר או על נזק שמקורו
                בהרכבה שבוצעה בניגוד להוראות, בתאונה, בשימוש לא נכון או בשינויים שבוצעו במוצר.
              </li>
            </ul>
          </Section>

          <Section title="4. מדיניות ביטול עסקה והחזרים">
            <p style={{ margin: '0 0 8px' }}>
              ביטול עסקה ייעשה בהתאם לחוק הגנת הצרכן, התשמ״א־1981:
            </p>
            <ul style={{ margin: '0 0 8px', paddingInlineStart: '18px' }}>
              <li><b>לפני קבלת המוצר</b> — ניתן לבטל בכל שלב ולקבל החזר כספי מלא.</li>
              <li><b>לאחר קבלת המוצר</b> — בתוך 14 ימים ממועד קבלתו או ממועד קבלת מסמך פרטי העסקה, לפי המאוחר.</li>
              <li>
                לאנשים עם מוגבלות, אזרחים ותיקים ועולים חדשים — תקופת הביטול מוארכת ל־<b>4 חודשים</b>,
                ובלבד שההתקשרות כללה שיחה בין הצדדים.
              </li>
            </ul>
            <p style={{ margin: '0 0 8px' }}>
              <b>איננו גובים דמי ביטול כלל.</b> החוק מתיר לגבות עד 5% מסכום העסקה או 100 ₪
              (לפי הנמוך) — ואנו מוותרים על כך. בכל ביטול יינתן החזר כספי מלא לאמצעי התשלום שבו
              בוצעה העסקה, בתוך 14 ימים ממועד קבלת הודעת הביטול.
            </p>
            <p style={{ margin: 0 }}>
              בביטול לאחר קבלת המוצר יש להחזירו במצב המאפשר מכירה חוזרת, ככל הניתן באריזתו המקורית.
              בביטול מרצון החזרת המוצר היא באחריות הלקוח ועל חשבונו; אם המוצר הגיע פגום, לא תקין,
              או שהאספקה התעכבה מעבר למועד שנמסר — האיסוף על חשבון החברה. ביטול ניתן לבצע דרך
              <a href="/cancel-order" style={{ color: GOLD, fontWeight: 700 }}> טופס ביטול עסקה</a> שבאתר,
              בדוא״ל או בטלפון.
            </p>
          </Section>

          <Section title="5. סמכות שיפוט">
            <p style={{ margin: 0 }}>
              על תקנון זה יחולו דיני מדינת ישראל. סמכות השיפוט הבלעדית בכל עניין הנובע מהסכם זה
              תהא מסורה לבית המשפט המוסמך במחוז תל אביב־יפו בלבד.
            </p>
          </Section>

          <Section title="6. פרטי העוסק">
            <p style={{ margin: 0 }}>
              {COMPANY.name} · {COMPANY.companyId}<br />
              {COMPANY.address}<br />
              דוא״ל: <a href={`mailto:${COMPANY.email}`} style={{ color: GOLD }}>{COMPANY.email}</a> ·
              טלפון: <a href={`tel:${COMPANY.phone}`} style={{ color: GOLD }}>{COMPANY.phone}</a>
            </p>
          </Section>

          <p style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: '#9A9690',
            lineHeight: 1.7, marginTop: '34px', paddingTop: '18px', borderTop: `1px solid ${BORDER}`,
          }}>
            אין באמור כדי לגרוע מזכויות הצרכן על פי חוק הגנת הצרכן, התשמ״א־1981 והתקנות מכוחו.
            בכל סתירה בין מסמך זה להוראות הדין — הוראות הדין גוברות. תקנון זה משלים את
            <a href="/terms" style={{ color: GOLD }}> מדיניות הפרטיות ותנאי השימוש</a> ואת
            <a href="/presale-terms" style={{ color: GOLD }}> תנאי המכירה המוקדמת</a>.
          </p>

        </div>
      </div>
    </PageShell>
  );
}
