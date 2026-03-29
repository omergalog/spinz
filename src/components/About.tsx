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
      <div style={{ borderTop: '1px solid #2A2A2A' }} className="pt-8 md:pt-16">

        {/* Top: label + headline */}
        <div
          style={{
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '36px',
          }}
          className="block md:grid mb-8 md:mb-16"
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
                  color: '#EDEBE6',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.05,
                  margin: 0,
                }}
              >
                אופניים שנולדו מהצורך האמיתי
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
            <img
              src="/assets/logo.png"
              alt="SPINZ"
              style={{
                height: '48px',
                width: 'auto',
                maxWidth: '240px',
                objectFit: 'contain',
                filter: 'invert(1) brightness(2)',
                opacity: 0.9,
              }}
            />

            <div
              style={{
                borderRight: `3px solid ${GOLD}`,
                paddingRight: '24px',
              }}
            >
              <p
                style={{
                  fontFamily: "'Heebo', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(22px, 3vw, 32px)',
                  color: '#EDEBE6',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                ב-SPINZ אתם משלמים על האופניים,
                לא על החנות ברוטשילד
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
              { num: '01', label: 'ישיר מהמפעל' },
              { num: '02', label: 'ללא פערי תיווך' },
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
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: '#EDEBE6' }}>
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
                text: 'היי, אנחנו SPINZ – מותג אופניים שנולד מהצורך של סטודנטים בסטייל ובמחיר שפוי.',
                big: true,
              },
              {
                delay: 0.35,
                text: 'אנחנו שלושה חברים שהיו צריכים דרך להגיע מההרצאה הביתה בלי לחסל את המשכורת, וסירבנו להתפשר על אופניים שנראים רע.',
                big: false,
              },
              {
                delay: 0.45,
                text: 'ב-SPINZ אנחנו חותכים את כל פערי התיווך ומביאים לכם את האופניים ישר מהמפעל לבית. התוצאה? עיצוב שאתם אוהבים, איכות ללא פשרות ומחיר שלא שובר את הכיס.',
                big: false,
              },
              {
                delay: 0.55,
                text: 'בואו תצטרפו למסע שלנו לתחבורה ירוקה, זולה וסקסית יותר. כי מגיע לכם לרכוב בסטייל.',
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
                  color: big ? '#EDEBE6' : '#FFFFFF',
                  lineHeight: 1.75,
                  margin: 0,
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
                alignSelf: 'flex-start',
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
            { num: '3', label: 'דגמים בקולקציה', target: 3, suffix: '', duration: 1800 },
            { num: '72H', label: 'אצלך בבית', target: 72, suffix: 'H', duration: 2800 },
            { num: '100%', label: 'ישיר מהמפעל', target: 100, suffix: '%', duration: 3800 },
          ].map(({ label, target, suffix, duration }) => (
            <div
              key={label}
              className="py-4 px-2 md:p-8"
              style={{ backgroundColor: DARK, textAlign: 'center' }}
            >
              <p className="text-[28px] md:text-[48px]" style={{ fontFamily: "'Heebo', sans-serif", color: GOLD, letterSpacing: '0.04em', margin: 0, lineHeight: 1 }}>
                <CountUp target={target} suffix={suffix} duration={duration} />
              </p>
              <p className="text-[9px] md:text-[11px]" style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: '0.2em', textTransform: 'uppercase', color: '#FFFFFF', margin: '6px 0 0' }}>
                {label}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
