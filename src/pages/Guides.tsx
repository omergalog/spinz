import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Settings, Ruler, ShieldCheck, Droplets, MapPin } from 'lucide-react';
import PageShell from '../components/PageShell';

const GOLD = '#C9A870';
const DARK = '#1C1C1C';
const MUTED = '#6A6862';
const BORDER = '#E0DCD4';
const CARD = '#FFFFFF';

const guides = [
  {
    icon: Wrench,
    title: 'הרכבת האופניים בבית',
    summary: 'האופניים מגיעים כ-85% מורכבים. כל מה שנשאר זה פחות מ-20 דקות עבודה.',
    steps: [
      'הוציאו את האופניים מהקופסה והסירו את חומרי האריזה.',
      'חברו את ההגה לגזע וודאו שהוא ישר ביחס לגלגל הקדמי.',
      'הברגו את הפדלים — ימני בכיוון השעון, שמאלי נגד כיוון השעון.',
      'התאימו את גובה המושב באמצעות מנגנון השחרור המהיר.',
      'בדקו לחץ אוויר בצמיגים (מומלץ 60–80 PSI) ולחצו על הבלמים לוודא תקינות.',
    ],
  },
  {
    icon: Ruler,
    title: 'איך בוחרים מידה נכונה',
    summary: 'הגובה שלכם הוא המדריך. שתי מידות שמכסות את רוב הרוכבים.',
    steps: [
      'מידה 54 (S): מתאימה לגובה 160–175 ס"מ.',
      'מידה 57 (L): מתאימה לגובה 175–190 ס"מ.',
      'במקרה של ספק בין שתי מידות — בחרו את הקטנה יותר לשליטה טובה יותר.',
      'גובה המושב ניתן לכוונון מהיר, כך שתמיד אפשר לכוון לרכיבה אישית.',
    ],
  },
  {
    icon: Droplets,
    title: 'תחזוקה שוטפת',
    summary: 'מעט תחזוקה שומרת על האופניים חלקים ושקטים לאורך שנים.',
    steps: [
      'שמנו את השרשרת אחת לחודש בשמן ייעודי לאופניים.',
      'נגבו את השלדה במטלית לחה אחרי רכיבה בגשם.',
      'בדקו לחץ אוויר בצמיגים אחת לשבועיים.',
      'הקשיבו לבלמים — חריקה היא סימן שצריך לכוון את הרפידות.',
    ],
  },
  {
    icon: Settings,
    title: 'כוונון בלמים והילוך',
    summary: 'הסינגל-ספיד פשוט לתחזוקה — בלי מנגנוני הילוכים מסובכים.',
    steps: [
      'הבלמים צריכים לתפוס כשהידית נלחצת לכ-50% מהמהלך.',
      'אם הבלם רופף — הדקו את כבל הבלם דרך הבורג בקליפר.',
      'ודאו שהשרשרת מתוחה — לא רפויה מדי ולא הדוקה מדי.',
      'כל הרכיבים סטנדרטיים וזמינים בכל חנות אופניים בישראל.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'בטיחות ברחובות העיר',
    summary: 'רכיבה בטוחה מתחילה בהרגלים נכונים.',
    steps: [
      'תמיד חבשו קסדה — גם לנסיעות קצרות.',
      'השתמשו בתאורה קדמית ואחורית בשעות החשכה.',
      'שמרו מרחק מדלתות מכוניות חונות.',
      'אותתו ביד לפני כל פנייה והקפידו על נתיב הרכיבה.',
    ],
  },
  {
    icon: MapPin,
    title: 'המסלולים האהובים עלינו בתל אביב',
    summary: 'כמה מסלולים שווים להתחיל מהם את ההיכרות עם העיר.',
    steps: [
      'טיילת תל אביב — מנמל תל אביב ועד יפו, לאורך הים.',
      'פארק הירקון — שבילים ירוקים הרחק מהתנועה.',
      'שדרות רוטשילד — הקלאסיקה האורבנית עם שביל אופניים מרכזי.',
      'נמל יפו — לסיים עם קפה והשקפה על הים.',
    ],
  },
];

function GuideCard({ guide, index }: { guide: typeof guides[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const Icon = guide.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08 }}
      style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '18px', overflow: 'hidden' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right' }}
      >
        <div style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#F5F2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD }}>
          <Icon size={22} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '18px', color: DARK, margin: '0 0 4px' }}>{guide.title}</h3>
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: MUTED, margin: 0, lineHeight: 1.6 }}>{guide.summary}</p>
        </div>
        <span style={{ flexShrink: 0, color: GOLD, fontSize: '20px', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.25s' }}>+</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <ol style={{ margin: 0, padding: '0 84px 28px 28px', display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none' }}>
              {guide.steps.map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: '12px', fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: '#3A3A3A', lineHeight: 1.6 }}>
                  <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: GOLD, color: DARK, fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Guides() {
  return (
    <PageShell
      eyebrow="Guides & Tips"
      title="מדריכים."
      subtitle="כל מה שצריך לדעת — מהרכבה בבית ועד תחזוקה והמסלולים הכי שווים בעיר."
      heroImage="/assets/lifestyle-hero.jpg"
      heroPosition="center 35%"
    >
      <section style={{ backgroundColor: '#F5F2EC', padding: 'clamp(56px, 8vw, 96px) clamp(20px, 6vw, 64px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {guides.map((g, i) => (
            <GuideCard key={g.title} guide={g} index={i} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
