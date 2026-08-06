import { useDir } from '../i18n/LanguageContext';
import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const GOLD  = '#C9A870';
const CREAM = '#EDEBE6';
const MUTED = '#EDEBE6';


function CountUp({ target, suffix = '', duration = 2800, delay = 0 }: { target: number; suffix?: string; duration?: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timeout = setTimeout(() => {
      let start = 0;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setValue(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [inView, target, duration, delay]);

  return <span ref={ref}>{value}{suffix}</span>;
}

export default function SpinzVibe() {
  const dir = useDir();
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
          backgroundImage: 'url(/assets/recolored-bicycle.png)',
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
        dir={dir}
        className="mx-auto max-w-7xl px-6 lg:px-16"
        style={{ position: 'relative', zIndex: 1, paddingTop: 'clamp(48px, 8vw, 112px)', paddingBottom: 'clamp(48px, 8vw, 112px)' }}
      >
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* Right column – header + story */}
          <div className="flex flex-col gap-8 lg:w-1/2">

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
                  style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 4.5vw, 58px)', color: CREAM, letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}
                >
                  לא בשביל הדרך,<br />
                  <span style={{ color: GOLD }}>בשביל הרגעים.</span>
                </motion.h2>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 }}
                style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(14px, 1.5vw, 17px)', fontWeight: 400, color: CREAM, lineHeight: 1.7, margin: 0, opacity: 0.85 }}
              >
                אופניים שפשוט עושים את העבודה, כדי שתוכל להתרכז במה שבאמת קורה סביבך.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.28 }}
              style={{ borderRight: `3px solid ${GOLD}`, paddingRight: '20px' }}
            >
              <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(13px, 1.2vw, 15px)', color: MUTED, lineHeight: 1.85, margin: 0 }}>
                הכל התחיל משלושה חברים שגדלו בין הפרדסים של עמק חפר. עברנו לתל אביב, וכל האופניים שניסינו פשוט לא הרגישו נכון. חיפשנו משהו פשוט ויפה שלא עולה הון, ובסוף בנינו אותו בעצמנו.
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

        </div>
      </div>

      {/* Stats bar – full width */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="grid grid-cols-3 md:grid-cols-3"
        style={{
          position: 'relative', zIndex: 1,
          borderTop: `1px solid rgba(201,168,112,0.25)`,
          backgroundColor: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {[
          { label: 'צבעים לבחירה',     target: 3,   suffix: '',  duration: 1400, delay: 0    },
          { label: 'ימי עסקים למשלוח', target: 5,   suffix: '',  duration: 2300, delay: 400  },
          { label: 'ישירות מהיצרן',    target: 100, suffix: '%', duration: 3200, delay: 900  },
        ].map(({ label, target, suffix, duration, delay }, i) => (
          <div key={label} className="py-4 px-1 md:py-7" style={{ textAlign: 'center', borderLeft: i > 0 ? `1px solid rgba(201,168,112,0.25)` : 'none' }}>
            <p className="text-[26px] md:text-[42px]" style={{ fontFamily: "'Heebo', sans-serif", color: GOLD, margin: 0, lineHeight: 1 }}>
              <CountUp target={target} suffix={suffix} duration={duration} delay={delay} />
            </p>
            <p className="text-[9px] md:text-[11px]" style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, margin: '6px 0 0', lineHeight: 1.4 }}>
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
