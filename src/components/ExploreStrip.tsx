import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Camera, Users, ArrowLeft } from 'lucide-react';

const DARK = '#1C1C1C';
const BORDER = '#E2DED8';
const MUTED = '#6A6862';
const GOLD = '#C9A870';

const cards = [
  {
    to: '/guides',
    icon: BookOpen,
    title: 'מדריכים',
    text: 'תחזוקה, התאמת מידה, רכיבה בטוחה בעיר — כל מה שצריך לדעת לפני ואחרי הקנייה.',
  },
  {
    to: '/gallery',
    icon: Camera,
    title: 'גלריה',
    text: 'האופניים בשטח. צילומים מהרחובות של תל אביב ומהקהילה שלנו.',
  },
  {
    to: '/community',
    icon: Users,
    title: 'קהילה',
    text: 'רכיבות משותפות, אירועים, ואנשים שחיים את העיר על שני גלגלים.',
  },
];

export default function ExploreStrip() {
  return (
    <section dir="rtl" style={{ backgroundColor: '#F5F2EC' }} className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '36px' }}
        >
          <span style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '11px',
            letterSpacing: '0.4em', textTransform: 'uppercase',
            color: MUTED, display: 'block', marginBottom: '10px',
          }}>
            עוד ב-Spinz
          </span>
          <h2 style={{
            fontFamily: "'Heebo', sans-serif", fontWeight: 800,
            fontSize: 'clamp(24px, 3.5vw, 38px)', color: DARK,
            letterSpacing: '-0.02em', margin: 0,
          }}>
            לא רק אופניים
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map(({ to, icon: Icon, title, text }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
            >
              <Link
                to={to}
                className="explore-card"
                style={{
                  display: 'block',
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '14px',
                  padding: '28px 26px',
                  textDecoration: 'none',
                  height: '100%',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.transform = 'translateY(-4px)';
                  el.style.boxShadow = '0 12px 32px rgba(28,28,28,0.09)';
                  el.style.borderColor = GOLD;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                  el.style.borderColor = BORDER;
                }}
              >
                <Icon size={26} color={GOLD} strokeWidth={1.8} style={{ marginBottom: '16px' }} />
                <h3 style={{
                  fontFamily: "'Heebo', sans-serif", fontWeight: 800,
                  fontSize: '19px', color: DARK, margin: '0 0 8px',
                }}>
                  {title}
                </h3>
                <p style={{
                  fontFamily: "'Heebo', sans-serif", fontSize: '13.5px',
                  color: MUTED, lineHeight: 1.7, margin: '0 0 18px',
                }}>
                  {text}
                </p>
                <span style={{
                  fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700,
                  color: DARK, display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}>
                  גלו עוד <ArrowLeft size={15} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
