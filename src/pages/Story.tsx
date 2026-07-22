import PageShell from '../components/PageShell';
import { Link } from 'react-router-dom';

const DARK = '#1C1C1C';
const MUTED = '#4A4845';
const GOLD = '#C9A870';
const BORDER = '#E0DCD4';

const sections = [
  {
    title: 'החופש של פעם',
    text: 'הכל התחיל משלושה חברים שגדלו בין הפרדסים של עמק חפר. שם, האופניים היו הכל בשבילנו – הדרך לים, לבית ספר, ובעיקר הדרך להרגיש חופשיים.',
  },
  {
    title: 'ואז הגענו לתל אביב',
    text: 'כשהחלטנו לארוז את החיים ולעבור לתל אביב, גילינו מהר מאוד שהעיר הזאת היא עולם אחר לגמרי. הפקקים, הלחץ, והמרדף אחרי חניה פשוט הוציאו לנו את החשק לזוז. ניסינו הכל – קורקינטים, אוטובוסים, אופניים עם 21 הילוכים וכבלים שנתקעים בכל חור... ושום דבר לא הרגיש "זה".\nאז החלטנו לחזור לבסיס.',
  },
  {
    title: 'פשוט לרכוב',
    text: 'נזכרנו באופניים של פעם – אלו שפשוט עולים עליהם ונוסעים. בלי שטויות, בלי הילוכים מיותרים שמתקלקלים בדיוק כשממהרים לעבודה, ובלי משקל כבד שצריך לסחוב לקומה שלישית בלי מעלית. ככה נולד המותג Spinz.',
  },
  {
    title: 'ככה נולד המותג Spinz',
    text: 'לקחנו את הפשטות של הסינגל-ספיד (Single Speed) ונתנו לה את הסטייל והדיוק של העיר הגדולה. רצינו לבנות אופניים שנראים מעולה, נוסעים חלק, ובעיקר – לא עושים כאב ראש. אופניים שאפשר לסמוך עליהם מהקפה של הבוקר ועד הבירה של הלילה.',
  },
  {
    title: 'למה אנחנו לא ברוטשילד? (ולמה זה טוב לכם)',
    text: 'חשבנו על זה הרבה. יכולנו לפתוח חנות נוצצת ברוטשילד או בדיזנגוף, אבל אז היינו צריכים לגלגל את השכירות המטורפת הזאת עליכם – וזה בדיוק מה שלא רצינו.\n\nהחלטנו לעשות את זה אחרת: בלי חנויות יוקרה במרכז תל אביב ובלי מתווכים שגוזרים קופון בדרך. בחרנו להשקיע את כל הכסף במוצר עצמו – בשלדות הכי חזקות, בצבעים הכי עמידים ובחלקים שיחזיקו לכם שנים על האספלט. התוצאה? אתם מקבלים אופני פרימיום במחיר הגיוני לגמרי, בלי לקרוע את הכיס.',
  },
  {
    title: 'בשורה התחתונה',
    text: 'Spinz זה השקט שלנו בתוך כל הרעש של תל אביב. זה המותג שלנו, מהילדות בעמק ועד לאספלט של רוטשילד (שאנחנו רוכבים עליו, אבל לא משלמים עליו שכירות), ואנחנו הכי גאים בעולם לחלוק אותו אתכם.',
  },
];

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
      <div style={{
        fontFamily: "'Heebo', sans-serif", fontSize: '14.5px', color: MUTED,
        lineHeight: 1.85, whiteSpace: 'pre-line',
      }}>
        {children}
      </div>
    </section>
  );
}

export default function Story() {
  return (
    <PageShell
      eyebrow="Our Story"
      title="נעים להכיר, אנחנו Spinz."
      subtitle="שלושה חברים מעמק חפר, עיר אחת גדולה, והרצון לחזור לרכיבה פשוטה. ככה נולד המותג."
      heroImage="/assets/story-hero.jpg"
      heroPosition="center 40%"
    >
      <div style={{ backgroundColor: '#F5F2EC', padding: 'clamp(32px, 6vw, 72px) clamp(20px, 6vw, 64px)' }} dir="rtl">
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          {sections.map((s, i) => (
            <Section key={i} title={s.title}>{s.text}</Section>
          ))}

          <div style={{ marginTop: '10px', paddingTop: '30px', borderTop: `1px solid ${BORDER}` }}>
            <Link
              to="/#models"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: DARK, color: '#EDEBE6',
                fontFamily: "'Heebo', sans-serif", fontSize: '15px', fontWeight: 700,
                letterSpacing: '0.05em', textDecoration: 'none',
                padding: '14px 32px', borderRadius: '8px',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
            >
              בואו להכיר את הדגמים ←
            </Link>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
