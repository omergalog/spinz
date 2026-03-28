import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const DARK  = '#1C1C1C';
const LIGHT = '#F5F2EC';
const GOLD  = '#C9A870';

const services = [
  {
    num: '01',
    title: 'בנוי לסבול',
    body: 'פריים חזק מפלדה / כרום-מולי, רכיבים שנבחרו ליומיום אמיתי. עומד בכל מה שהרחוב מביא.',
  },
  {
    num: '02',
    title: 'עיצוב שמדבר',
    body: 'כל מודל עם אישיות משלו — צבעים, גיאומטריה, ופרטים שגורמים לך לעצור ולהסתכל שוב.',
  },
  {
    num: '03',
    title: 'סינגל ספיד = חופש',
    body: 'פחות חלקים, פחות תקלות, יותר רכיבה. קל, מהיר, ישיר. רק אתה והאספלט.',
  },
  {
    num: '04',
    title: 'מסירה מושלמת',
    body: 'כל אופניים עוברים בדיקה לפני המשלוח. מגיעים מוכנים לרכיבה, מאוגדים, מושלמים.',
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
      {/* Single 2-col grid: text RIGHT, image LEFT — image spans full height */}
      <div className="max-md:grid max-md:grid-cols-[1fr_42%] md:grid md:grid-cols-2 gap-3 md:gap-9 max-md:items-start">

        {/* RIGHT (first DOM in RTL): heading + intro + services */}
        <div className="min-w-0">
          {/* Label */}
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

          {/* Main heading */}
          <RevealText delay={0.08}>
            <h2
              style={{
                fontFamily: "'Heebo', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(26px, 6vw, 72px)',
                color: DARK,
                letterSpacing: '-0.01em',
                lineHeight: 1,
                margin: '0 0 28px',
              }}
            >
              SPINZ. האופניים שעיצבו מחדש את הרחוב.
            </h2>
          </RevealText>

          {/* Intro */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{
              fontFamily: "'Heebo', sans-serif",
              fontSize: 'clamp(15px, 1.5vw, 20px)',
              fontWeight: 400,
              color: DARK,
              lineHeight: 1.7,
              margin: '0 0 32px',
            }}
          >
            אנחנו מאמינים שאופניים טובים הם תהליך רגוע, מדויק ונטול פשרות. כך אנחנו מבטיחים את זה:
          </motion.p>

          {/* Service items — 2-col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {services.map(({ num, title, body }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.25 + i * 0.1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '2px', height: '20px', backgroundColor: GOLD, flexShrink: 0 }} />
                  <h4
                    style={{
                      fontFamily: "'Heebo', sans-serif",
                      fontSize: '15px',
                      fontWeight: 700,
                      color: DARK,
                      margin: 0,
                    }}
                  >
                    {title}
                  </h4>
                </div>
                <p
                  style={{
                    fontFamily: "'Heebo', sans-serif",
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: 1.65,
                    margin: 0,
                    paddingRight: '14px',
                  }}
                >
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* LEFT (second DOM in RTL): bike image — starts from top */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex min-w-0 items-start justify-center"
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
