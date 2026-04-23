import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import AboutModal from './AboutModal';

function CountUp({ target, suffix = '', duration = 2800 }: { target: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return <span ref={ref}>{value}{suffix}</span>;
}

const DARK = '#1C1C1C';
const GOLD = '#C9A870';
const CREAM = '#EDEBE6';

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

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <section
      ref={ref}
      id="about"
      style={{ backgroundColor: DARK }}
      className="px-5 py-10 md:p-9"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl">
      <div style={{ borderTop: '1px solid #2A2A2A' }} className="pt-8 md:pt-16">

        {/* Top: label + headline */}
        <div
          style={{
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '36px',
          }}
          className="block md:grid mb-6 md:mb-10"
        >
          <div style={{ gridColumn: 'span 3' }}>
            <motion.h5
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              style={{
                fontFamily: "'Heebo', sans-serif",
                fontSize: '11px',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: GOLD,
                margin: '0 0 16px',
              }}
            >
              אודות
            </motion.h5>
            <RevealText delay={0.08}>
              <h2
                style={{
                  fontFamily: "'Heebo', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  color: CREAM,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.05,
                  margin: 0,
                }}
              >
                אנחנו לא מוכרים אופניים.
              </h2>
            </RevealText>
          </div>
        </div>

        {/* Body: 2-col */}
        <div
          style={{
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'start',
          }}
          className="flex flex-col gap-10 md:grid md:gap-0"
        >

          {/* Left: logo + tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div
              style={{
                borderRight: `4px solid ${GOLD}`,
                paddingRight: '24px',
              }}
            >
              <p
                style={{
                  fontFamily: "'Heebo', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(20px, 3vw, 30px)',
                  color: CREAM,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                אנחנו מוכרים את הרגע שמישהו עוצר אותך ברחוב ושואל — וואו, מאיפה הם?
              </p>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{
                height: '1px',
                backgroundColor: '#2A2A2A',
                transformOrigin: 'right',
              }}
            />

            {[
              { num: '01', label: 'ישירות מהיצרן אלייך' },
              { num: '02', label: 'בלי מתווכים מיותרים' },
              { num: '03', label: 'עיצוב ללא פשרות' },
            ].map(({ num, label }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, x: -16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
              >
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: GOLD, letterSpacing: '0.2em' }}>
                  {num}
                </span>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: CREAM }}>
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: story text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {[
              {
                delay: 0.25,
                text: 'Spinz נולד מתוך פער פשוט ברחובות: אין מותג ישראלי אמיתי לאופניים שנראים טוב.',
                big: true,
              },
              {
                delay: 0.35,
                text: 'שאלנו את עצמנו — מה אם אפשר להביא לתל אביב אופניים מעוצבים, כאלה שיסובבו ראשים ברחוב, ועדיין יהיו במחיר שסטודנט יכול להרשות לעצמו?',
                big: false,
              },
              {
                delay: 0.45,
                text: 'ובעידן שבו כולם רוכבים על חשמלי — יש קהל שרוצה לחזור למשהו פשוט. להרגיש את הרחוב. לא להטעין סוללה. לרכוב כמו פעם — רק עם design שמדבר 2026.',
                big: false,
              },
              {
                delay: 0.55,
                text: 'משלמים על האופניים, לא על החנות ברוטשילד.',
                big: false,
              },
            ].map(({ delay, text, big }, i) => (
              <motion.p
                key={i}
                className={i === 1 || i === 2 ? 'hidden md:block' : ''}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay }}
                style={{
                  fontFamily: "'Heebo', sans-serif",
                  fontSize: big ? '18px' : '15px',
                  fontWeight: big ? 500 : 400,
                  color: big ? CREAM : '#D0CEC9',
                  lineHeight: 1.8,
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                {text}
              </motion.p>
            ))}

            <motion.button
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setAboutOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '12px',
                backgroundColor: 'transparent',
                color: GOLD,
                padding: '12px 0',
                fontFamily: "'Heebo', sans-serif",
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                border: 'none',
                borderBottom: `2px solid ${GOLD}`,
                alignSelf: 'center',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              הסיפור שלנו
              <span style={{ fontSize: '18px', lineHeight: 1 }}>←</span>
            </motion.button>
            <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
          </div>
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.8 }}
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            backgroundColor: '#2A2A2A',
            marginTop: '64px',
            borderTop: '1px solid #2A2A2A',
          }}
          className="grid"
        >
          {[
            { label: 'דגמי קולקציה', target: 3, suffix: '' , duration: 1800 },
            { label: 'ימי עסקים למשלוח', target: 5, suffix: '', duration: 1800 },
            { label: 'ישירות מהיצרן',   target: 100, suffix: '%', duration: 3800 },
          ].map(({ label, target, suffix, duration }) => (
            <div
              key={label}
              className="py-4 px-2 md:p-8"
              style={{ backgroundColor: DARK, textAlign: 'center' }}
            >
              <p className="text-[28px] md:text-[48px]" style={{ fontFamily: "'Heebo', sans-serif", color: GOLD, letterSpacing: '0.04em', margin: 0, lineHeight: 1 }}>
                <CountUp target={target} suffix={suffix} duration={duration} />
              </p>
              <p className="text-[9px] md:text-[11px]" style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: '0.2em', textTransform: 'uppercase', color: CREAM, margin: '6px 0 0' }}>
                {label}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
      </div>
    </section>
  );
}
