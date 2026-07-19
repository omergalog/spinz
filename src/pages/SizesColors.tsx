import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const GOLD = '#C9A870';
const DARK = '#1C1C1C';
const MUTED = '#6A6862';
const BORDER = '#E0DCD4';
const CARD = '#FFFFFF';

const sizes = [
  {
    id: '54',
    name: 'SPINZ 54',
    label: 'מידה S',
    height: '160–175 ס"מ',
    body: 'שלדה קומפקטית וזריזה, מושלמת לרכיבה עירונית קצרה ולמי שמחפש תחושת שליטה מלאה. קלה לתמרון בין מכוניות ובשבילים צרים.',
  },
  {
    id: '57',
    name: 'SPINZ 57',
    label: 'מידה L',
    height: '175–190 ס"מ',
    body: 'שלדה מרווחת יותר לתנוחת רכיבה נוחה וזקופה. מתאימה למרחקים ארוכים יותר ולרוכבים גבוהים שמחפשים יציבות ושיוט חלק.',
  },
];

const colors = [
  { id: 'mat',   label: 'שחור מט',   hex: '#1A1A1A', img: '/assets/bike-mat-new.png',   desc: 'הקלאסיקה. שחור עמוק ומאט שמשתלב עם הכל, ולא מפסיק להיראות נקי גם אחרי שנים על האספלט.' },
  { id: 'beige', label: "בז'",       hex: '#C4A882', img: '/assets/bike-beige-new.png', desc: 'גוון חול חמים ורגוע. בולט בעדינות, משדר יוקרה שקטה ומושך מבטים בלי לצעוק.' },
  { id: 'olive', label: 'ירוק זית',  hex: '#7D9168', img: '/assets/bike-olive-new.png', desc: 'אופי ושקט. ירוק אדמתי שמרגיש טבעי בעיר, לאלו שרוצים משהו קצת אחר מהרגיל.' },
];

export default function SizesColors() {
  return (
    <PageShell
      eyebrow="Fit & Finish"
      title="מידות וצבעים."
      subtitle="שני גדלים, שלושה צבעים — ההתאמה המושלמת לגובה שלך ולסטייל שלך."
      heroImage="/assets/photo-black-detail.jpg"
      heroPosition="center 40%"
    >
      {/* Sizes */}
      <section style={{ backgroundColor: '#F5F2EC', padding: 'clamp(56px, 8vw, 96px) clamp(20px, 6vw, 64px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 4vw, 40px)', color: DARK, margin: '0 0 8px' }}>
            איזו מידה מתאימה לי?
          </h2>
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: MUTED, margin: '0 0 40px' }}>
            הגובה שלך הוא הדרך הכי פשוטה לבחור. במקרה של ספק — עדיף לבחור מידה קטנה יותר.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {sizes.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '18px', padding: '32px' }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '26px', color: DARK, margin: 0 }}>{s.name}</h3>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700, color: GOLD, letterSpacing: '0.1em' }}>{s.label}</span>
                </div>
                <div style={{ display: 'inline-block', backgroundColor: '#F5F2EC', borderRadius: '8px', padding: '8px 16px', marginBottom: '18px' }}>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 600, color: DARK }}>גובה רוכב: {s.height}</span>
                </div>
                <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: MUTED, lineHeight: 1.75, margin: 0 }}>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Colors */}
      <section style={{ backgroundColor: '#1C1C1C', padding: 'clamp(56px, 8vw, 96px) clamp(20px, 6vw, 64px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 4vw, 40px)', color: '#EDEBE6', margin: '0 0 8px' }}>
            שלושה צבעים. אופי משלך.
          </h2>
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: 'rgba(237,235,230,0.6)', margin: '0 0 48px' }}>
            כל צבע זמין בשתי המידות. בחרו את זה שמדבר אליכם.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {colors.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                style={{
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(20px, 4vw, 48px)',
                  backgroundColor: '#242424', border: '1px solid #2F2F2F', borderRadius: '18px',
                  padding: 'clamp(20px, 3vw, 32px)', overflow: 'hidden',
                }}
              >
                <div style={{ flex: '1 1 240px', minWidth: '200px', textAlign: 'center' }}>
                  <img src={c.img} alt={c.label} style={{ width: '100%', maxWidth: '320px', height: 'auto', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: '2 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: c.hex, border: '2px solid #3A3A3A', flexShrink: 0 }} />
                    <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '24px', color: '#EDEBE6', margin: 0 }}>{c.label}</h3>
                  </div>
                  <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: 'rgba(237,235,230,0.7)', lineHeight: 1.75, margin: 0 }}>{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <Link
              to="/bikes"
              style={{
                display: 'inline-block', backgroundColor: GOLD, color: DARK,
                fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '15px',
                padding: '14px 36px', borderRadius: '8px', textDecoration: 'none', letterSpacing: '0.05em',
              }}
            >
              בחרו את שלכם ←
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
