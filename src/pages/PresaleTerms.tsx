import PageShell from '../components/PageShell';
import { usePresale } from '../config/presale';

const DARK = '#1C1C1C';
const MUTED = '#4A4845';
const GOLD = '#C9A870';
const BORDER = '#E0DCD4';

const COMPANY = {
  name: 'אופני סיבוב בע"מ (SPINZ BIKES LTD)',
  companyId: 'ח.פ. 517343661',
  address: 'תל אביב, ישראל', // ← להשלים לכתובת הרשומה המלאה (רחוב, מספר, עיר, מיקוד)
  email: 'spinz.bikes@gmail.com',
  phone: '052-7565262',
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

export default function PresaleTerms() {
  const presale = usePresale();

  return (
    <PageShell
      eyebrow="Pre-Sale"
      title="תנאי מכירה מוקדמת"
      subtitle="מה חשוב לדעת לפני שמזמינים במחיר השקה — מועדי אספקה, זכות ביטול והחזרים."
      heroImage="/assets/photo-black-detail.jpg"
      heroPosition="center 55%"
    >
      <div style={{ backgroundColor: '#F5F2EC', padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }} dir="rtl">
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          {/* Highlight box */}
          <div style={{
            backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`,
            borderRadius: '14px', padding: '20px 22px', marginBottom: '34px',
          }}>
            <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: DARK, fontWeight: 700, margin: '0 0 8px' }}>
              בקצרה
            </p>
            <ul style={{ margin: 0, paddingInlineStart: '18px', fontFamily: "'Heebo', sans-serif", fontSize: '14.5px', color: MUTED, lineHeight: 1.9 }}>
              <li>האופניים בהזמנה מוקדמת — הם <b>טרם הגיעו למלאי</b>.</li>
              <li>מועד אספקה משוער: <b>{presale.arrivalLabel}</b>.</li>
              <li>ניתן לבטל ולקבל <b>החזר מלא</b> בכל שלב לפני המסירה.</li>
              <li>אם נתעכב מעבר למועד המשוער — נעדכן מראש ותוכלו לבטל ללא עלות.</li>
            </ul>
          </div>

          <Section title="1. מהי הזמנה מוקדמת (Pre-Sale)">
            <p style={{ margin: 0 }}>
              במסגרת מבצע ההשקה ניתן להזמין אופני SPINZ Urban במחיר מוזל, לפני שהמשלוח הגיע לארץ.
              המשמעות: <b>המוצר אינו נמצא במלאי במועד ההזמנה</b>, והאספקה תתבצע לאחר קליטת הסחורה במחסנינו.
              גילוי זה מוצג לפני שלב ההזמנה בהתאם לדרישות חוק הגנת הצרכן, התשמ״א־1981.
            </p>
          </Section>

          <Section title="2. מועד אספקה">
            <p style={{ margin: '0 0 8px' }}>
              מועד האספקה המשוער הוא <b>{presale.arrivalLabel}</b>. המועד מבוסס על לוחות זמנים של ייצור ושילוח ימי,
              ועשוי להשתנות בשל גורמים שאינם בשליטתנו (עיכובי ייצור, שילוח, מכס או כוח עליון).
            </p>
            <p style={{ margin: 0 }}>
              במקרה של שינוי מהותי במועד — נודיע לכם מראש, ותוכלו לבחור להמתין או <b>לבטל ולקבל החזר כספי מלא, ללא דמי ביטול</b>.
            </p>
          </Section>

          <Section title="3. מחיר ההשקה">
            <p style={{ margin: 0 }}>
              מחיר ההשקה ({presale.presalePrice.toLocaleString('he-IL')} ₪ במקום {presale.regularPrice.toLocaleString('he-IL')} ₪)
              תקף למספר מוגבל של יחידות בכל צבע ומידה, כמוצג באתר בזמן אמת. עם מיצוי המכסה של דגם מסוים,
              אותו דגם יימכר במחירו הרגיל. המחיר הקובע הוא המחיר שהוצג בעת אישור ההזמנה וחיוב האמצעי התשלום.
            </p>
          </Section>

          <Section title="4. זכות ביטול">
            <p style={{ margin: '0 0 8px' }}>
              בהתאם לחוק הגנת הצרכן, בעסקת מכר מרחוק ניתן לבטל את העסקה:
            </p>
            <ul style={{ margin: '0 0 8px', paddingInlineStart: '18px' }}>
              <li><b>לפני קבלת המוצר</b> — בכל שלב, בהחזר כספי מלא.</li>
              <li><b>לאחר קבלת המוצר</b> — בתוך 14 ימים ממועד קבלתו או ממועד קבלת מסמך פרטי העסקה, לפי המאוחר.</li>
              <li>
                לאנשים עם מוגבלות, אזרחים ותיקים ועולים חדשים — תקופת הביטול מוארכת ל־<b>4 חודשים</b>,
                ובלבד שההתקשרות כללה שיחה בין הצדדים.
              </li>
            </ul>
            <p style={{ margin: 0 }}>
              ביטול לאחר קבלת המוצר מותנה בהחזרתו כשהוא שלם, ללא נזק וללא שימוש שפגם בערכו.
              ההחזרה באחריות הלקוח ועל חשבונו.
            </p>
          </Section>

          <Section title="5. דמי ביטול">
            <p style={{ margin: 0 }}>
              בביטול לאחר קבלת המוצר רשאים אנו לגבות דמי ביטול בשיעור של <b>5% מסכום העסקה או 100 ₪ — לפי הנמוך מביניהם</b>.
              בביטול לפני מסירת המוצר, וכן בביטול עקב עיכוב באספקה או פגם במוצר — <b>לא ייגבו דמי ביטול</b>, וההחזר יהיה מלא.
            </p>
          </Section>

          <Section title="6. אופן הביטול וההחזר">
            <p style={{ margin: 0 }}>
              ניתן להודיע על ביטול בדוא״ל <a href={`mailto:${COMPANY.email}`} style={{ color: GOLD }}>{COMPANY.email}</a>,
              בטלפון <a href={`tel:${COMPANY.phone}`} style={{ color: GOLD }}>{COMPANY.phone}</a> או בוואטסאפ.
              ההחזר יבוצע לאמצעי התשלום שבו בוצעה העסקה, בתוך 14 ימים ממועד קבלת הודעת הביטול.
            </p>
          </Section>

          <Section title="7. אחריות">
            <p style={{ margin: 0 }}>
              על שלדת האלומיניום ניתנת אחריות ל־5 שנים מיום המסירה. האחריות אינה חלה על חלקים מתכלים
              (צמיגים, פנימיות, שרשרת, רפידות בלמים, גריפים), על בלאי סביר, ועל נזק שנגרם משימוש לא נכון,
              תאונה, הרכבה עצמית שגויה או שינויים שבוצעו במוצר.
            </p>
          </Section>

          <Section title="8. פרטי העוסק">
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
            בכל סתירה בין מסמך זה להוראות הדין — הוראות הדין גוברות.
            תנאים אלה משלימים את <a href="/terms" style={{ color: GOLD }}>תנאי השימוש ומדיניות הפרטיות</a> של האתר.
          </p>

        </div>
      </div>
    </PageShell>
  );
}
