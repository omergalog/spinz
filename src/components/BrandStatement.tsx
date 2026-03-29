import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const DARK  = '#1C1C1C';
const LIGHT = '#F5F2EC';
const GOLD  = '#C9A870';

const services = [
  {
    num: '01',
    title: 'חותכים את המתווכים, לא את האיכות',
    body: 'אנחנו מדלגים על אולמות התצוגה והעלויות המיותרות ומביאים לכם אופניים ישירות מהמפעל.',
  },
  {
    num: '02',
    title: 'סטייל נגיש לכולם',
    body: 'אסתטיקה גבוהה במחיר הוגן שמאפשר לכל אחד לרכוב בסטייל מינימליסטי מבלי לקרוע את הכיס.',
  },
  {
    num: '03',
    title: 'מחזירים את הגלגל לאחור',
    body: 'נסיעות קצרות לא חייבות לזהם. אנחנו חוזרים לבסיס: תחבורה ירוקה, נקייה ושקטה בעיר.',
  },
  {
    num: '04',
    title: 'בטיחות מעל הכל',
    body: 'עמידה בתקן אירופאי מחמיר. הגיע הזמן לעבור מכלי תחבורה לא יציבים לאופניים אמינים ב-100%.',
  },
];

function RevealText({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      <motion.div
        initial={{ y: '105%' }}
        animate={inView ? { y: '0%' } : {}}
        transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1], delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function BrandStatement() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      id="why-spinz"
      style={{ backgroundColor: LIGHT, overflow: 'hidden' }}
      className="px-5 py-10 md:p-9"
      dir="rtl"
    >
      {/* Desktop: 2-col grid | Mobile: single column */}
      <div className="md:grid md:grid-cols-2 md:gap-9">

        {/* RIGHT (first DOM in RTL): heading + intro + services */}
        <div className="min-w-0">

          {/* Mobile: label/heading/intro + image side by side | Desktop: label/heading/intro only */}
          <div className="flex items-start gap-3 md:block">

            {/* Label + heading + intro */}
            <div className="flex-1 min-w-0">
              <motion.h5
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6 }}
                style={{
                  fontFamily: "'Heebo', sans-serif",
                  fontSize: '11px',
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  color: '#888',
                  margin: '0 0 8px',
                }}
              >
                Why Spinz
              </motion.h5>

              <RevealText delay={0.08}>
                <h2
                  style={{
                    fontFamily: "'Heebo', sans-serif",
                    fontWeight: 800,
                    fontSize: 'clamp(26px, 6vw, 72px)',
                    color: DARK,
                    letterSpacing: '-0.01em',
                    lineHeight: 1,
                    margin: '0 0 16px',
                  }}
                >
                  SPINZ. האופניים שעיצבו מחדש את הרחוב.
                </h2>
              </RevealText>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.15 }}
                style={{
                  fontFamily: "'Heebo', sans-serif",
                  fontSize: 'clamp(13px, 1.5vw, 20px)',
                  fontWeight: 400,
                  color: DARK,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                אנחנו מאמינים שאופניים טובים הם תהליך רגוע, מדויק ונטול פשרות. כך אנחנו מבטיחים את זה:
              </motion.p>
            </div>

            {/* Bike image — mobile only, alongside heading */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.2 }}
              className="md:hidden flex-shrink-0 w-[58%] overflow-hidden"
              style={{ backgroundColor: '#F5F2EC' }}
            >
              <img
                src="/assets/brand-bike.jpg"
                alt="Spinz bike"
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </motion.div>

          </div>

          {/* Service items — 2-col on both mobile and desktop */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 mt-5 md:mt-8">
            {services.map(({ num, title, body }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.25 + i * 0.1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '2px', height: '18px', backgroundColor: GOLD, flexShrink: 0 }} />
                  <h4
                    className="text-[12px] md:text-[15px]"
                    style={{
                      fontFamily: "'Heebo', sans-serif",
                      fontWeight: 700,
                      color: DARK,
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </h4>
                </div>
                <p
                  className="text-[11px] md:text-[14px]"
                  style={{
                    fontFamily: "'Heebo', sans-serif",
                    color: '#666',
                    lineHeight: 1.55,
                    margin: 0,
                    paddingRight: '12px',
                  }}
                >
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* LEFT (second DOM in RTL): bike image — desktop only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden md:flex min-w-0 items-start justify-center"
          style={{ overflow: 'hidden', backgroundColor: '#F5F2EC' }}
        >
          <img
            src="/assets/brand-bike.jpg"
            alt="Spinz bike"
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </motion.div>

      </div>
    </section>
  );
}
