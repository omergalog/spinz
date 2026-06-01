import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const GOLD  = '#C9A870';
const CREAM = '#EDEBE6';
const MUTED = '#EDEBE6';

const values = [
  { num: '01', title: 'תופס עיניים',   body: 'כל מוצר שאנחנו מוציאים חייב לגרום לאנשים להסתכל עליך.' },
  { num: '02', title: 'נגיש באמת',     body: 'סטייל לא אמור לעלות ביוקר. מחיר שסטודנט יכול להרשות לעצמו.' },
  { num: '03', title: 'פשוט וטהור',    body: 'סינגל ספיד זו פילוסופיה. פחות מנגנונים, יותר חופש.' },
  { num: '04', title: 'ישראלי בנשמה', body: 'Spinz מדבר עברית ומכיר את הרחוב הישראלי.' },
];

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

export default function SpinzVibe() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(contentRef, { once: true, margin: '-80px' });
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section
      ref={sectionRef}
      id="why-spinz"
      style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#1C1C1C' }}
    >
      {/* Parallax background */}
      <motion.div
        style={{
          y: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : y,
          position: 'absolute',
          inset: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : '-12% 0',
          backgroundImage: 'url(/assets/photo-beige-bike.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      />

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(28,28,28,0.97) 0%, rgba(28,28,28,0.82) 50%, rgba(28,28,28,0.70) 100%)',
      }} />

      {/* Gold top line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(to right, ${GOLD}66, transparent)` }} />

      {/* Content */}
      <div
        ref={contentRef}
        dir="rtl"
        className="mx-auto max-w-7xl px-6 lg:px-16"
        style={{ position: 'relative', zIndex: 1, paddingTop: 'clamp(48px, 8vw, 112px)', paddingBottom: 'clamp(48px, 8vw, 112px)' }}
      >
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* Right column — header + story */}
          <div className="flex-1 flex flex-col gap-8">

            <div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6 }}
                style={{ display: 'block', marginBottom: '14px', fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD }}
              >
                Why Spinz
              </motion.span>

              <div style={{ overflow: 'hidden', marginBottom: '20px' }}>
                <motion.h2
                  initial={{ y: '105%' }}
                  animate={isInView ? { y: '0%' } : {}}
                  transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
                  style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 900, fontSize: 'clamp(32px, 5vw, 68px)', color: CREAM, letterSpacing: '-0.02em', lineHeight: 1.05, margin: 0 }}
                >
                  אנחנו לא מוכרים<br />
                  <span style={{ color: GOLD }}>אופניים.</span>
                </motion.h2>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 }}
                style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(14px, 1.5vw, 18px)', fontWeight: 500, color: CREAM, lineHeight: 1.6, margin: 0 }}
              >
                אנחנו מוכרים את הרגע שמישהו עוצר אותך ברחוב ושואל — וואו, מאיפה הם?
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.28 }}
              style={{ borderRight: `3px solid ${GOLD}`, paddingRight: '20px' }}
            >
              <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(13px, 1.2vw, 15px)', color: MUTED, lineHeight: 1.85, margin: 0 }}>
                Spinz נולד מתוך שלושה חברים שגדלו בין הפרדסים של עמק חפר — ועברו לתל אביב עם אופניים שלא הרגישו "זה". ניסינו הכל. ושום דבר לא ענה על מה שרצינו: משהו פשוט, יפה, ומחיר שאפשר להרשות לעצמנו.
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.38 }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/story')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', backgroundColor: 'transparent', color: GOLD, padding: '8px 0', fontFamily: "'Heebo', sans-serif", fontSize: '15px', fontWeight: 700, letterSpacing: '0.08em', border: 'none', borderBottom: `2px solid ${GOLD}`, cursor: 'pointer' }}
            >
              הסיפור המלא ←
            </motion.button>

          </div>

          {/* Left column — values */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 content-start" style={{ paddingTop: 'clamp(0px, 2vw, 40px)' }}>
            {values.map(({ num, title, body }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                style={{ padding: '24px', border: `1px solid rgba(201,168,112,0.18)`, borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(4px)' }}
              >
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '10px', color: GOLD, letterSpacing: '0.25em', display: 'block', marginBottom: '10px' }}>{num}</span>
                <h4 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: 'clamp(14px, 1.3vw, 16px)', color: CREAM, margin: '0 0 8px' }}>{title}</h4>
                <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(12px, 1vw, 13px)', color: MUTED, lineHeight: 1.7, margin: 0 }}>{body}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      {/* Stats bar — full width */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="grid grid-cols-3"
        style={{
          position: 'relative', zIndex: 1,
          borderTop: `1px solid rgba(201,168,112,0.25)`,
          backgroundColor: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {[
          { label: 'צבעים לבחירה',     target: 3,   suffix: '',  duration: 1400 },
          { label: 'ימי עסקים למשלוח', target: 5,   suffix: '',  duration: 2300 },
          { label: 'ישירות מהיצרן',    target: 100, suffix: '%', duration: 3200 },
        ].map(({ label, target, suffix, duration }, i) => (
          <div key={label} className="py-5 px-2 md:py-7" style={{ textAlign: 'center', borderLeft: i > 0 ? `1px solid rgba(201,168,112,0.25)` : 'none' }}>
            <p className="text-[28px] md:text-[42px]" style={{ fontFamily: "'Heebo', sans-serif", color: GOLD, margin: 0, lineHeight: 1 }}>
              <CountUp target={target} suffix={suffix} duration={duration} />
            </p>
            <p className="text-[9px] md:text-[11px]" style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, margin: '8px 0 0' }}>
              {label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Gold bottom line */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(to right, ${GOLD}66, transparent)` }} />
    </section>
  );
}
