import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DARK   = '#1C1C1C';
const LIGHT  = '#F5F2EC';
const GOLD   = '#C9A870';
const MUTED  = '#6A6862';
const BORDER = '#E0DCD4';

const values = [
  {
    num: '01',
    title: 'תופס עיניים',
    body: 'כל מוצר שאנחנו מוציאים חייב לגרום לאנשים להסתכל עליך. אם זה לא מסובב ראשים ברחוב – זה לא Spinz.',
  },
  {
    num: '02',
    title: 'נגיש באמת',
    body: 'סטייל לא אמור לעלות ביוקר. מחיר שסטודנט יכול להרשות לעצמו — בלי שתצטרך להתפשר.',
  },
  {
    num: '03',
    title: 'פשוט וטהור',
    body: 'סינגל ספיד זו פילוסופיה. פחות מנגנונים, יותר חופש. כך רוכבים בעיר.',
  },
  {
    num: '04',
    title: 'ישראלי בנשמה',
    body: 'Spinz לא מנסה להיות אירופאי. אנחנו מדברים עברית ומכירים את הרחוב הישראלי.',
  },
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

export default function SpinzVibe() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const navigate = useNavigate();

  return (
    <section
      ref={ref}
      id="why-spinz"
      dir="rtl"
      style={{ backgroundColor: LIGHT, position: 'relative' }}
      className="py-20 lg:py-28"
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />

      <div className="mx-auto max-w-7xl px-6 lg:px-16">

        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            style={{
              display: 'block', marginBottom: '12px',
              fontFamily: "'Heebo', sans-serif",
              fontSize: '11px', letterSpacing: '0.4em',
              textTransform: 'uppercase', color: '#888',
            }}
          >
            Why Spinz
          </motion.span>

          <RevealText delay={0.08}>
            <h2 style={{
              fontFamily: "'Heebo', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(32px, 6vw, 76px)',
              color: DARK,
              letterSpacing: '-0.01em',
              lineHeight: 1,
              margin: '0 0 20px',
            }}>
              אנחנו לא מוכרים אופניים.
            </h2>
          </RevealText>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.18 }}
            style={{
              fontFamily: "'Heebo', sans-serif",
              fontSize: 'clamp(15px, 1.8vw, 20px)',
              fontWeight: 500,
              color: DARK,
              lineHeight: 1.55,
              margin: 0,
              maxWidth: '640px',
            }}
          >
            אנחנו מוכרים את הרגע שמישהו עוצר אותך ברחוב ושואל — וואו, מאיפה הם?
          </motion.p>
        </div>

        {/* 2-col: story left, values right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16 lg:mb-20">

          {/* Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={{ borderRight: `4px solid ${GOLD}`, paddingRight: '24px' }}>
              <p style={{
                fontFamily: "'Heebo', sans-serif",
                fontSize: 'clamp(14px, 1.5vw, 17px)',
                color: '#555',
                lineHeight: 1.85,
                margin: 0,
              }}>
                Spinz נולד מתוך שלושה חברים שגדלו בין הפרדסים של עמק חפר — ועברו לתל אביב עם אופניים שלא הרגישו "זה". ניסינו הכל. ושום דבר לא ענה על מה שרצינו: משהו פשוט, יפה, ומחיר שאפשר להרשות לעצמנו.
              </p>
            </div>
            <p style={{
              fontFamily: "'Heebo', sans-serif",
              fontSize: 'clamp(14px, 1.5vw, 17px)',
              color: '#555',
              lineHeight: 1.85,
              margin: 0,
            }}>
              ככה נולד Spinz — סינגל-ספיד שנראה מעולה, נוסע חלק, ומגיע ישירות מהיצרן אלייך בלי מתווכים שגוזרים קופון בדרך.
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/story')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                alignSelf: 'flex-start',
                marginTop: '8px',
                backgroundColor: 'transparent',
                color: GOLD,
                padding: '10px 0',
                fontFamily: "'Heebo', sans-serif",
                fontSize: '16px', fontWeight: 700,
                letterSpacing: '0.1em',
                border: 'none',
                borderBottom: `2px solid ${GOLD}`,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              הסיפור המלא ←
            </motion.button>
          </motion.div>

          {/* Values grid */}
          <div className="grid grid-cols-2 gap-4">
            {values.map(({ num, title, body }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.28 + i * 0.08 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '2px', height: '18px', backgroundColor: GOLD, flexShrink: 0 }} />
                  <h4 style={{
                    fontFamily: "'Heebo', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(12px, 1.3vw, 15px)',
                    color: DARK, margin: 0, lineHeight: 1.3,
                  }}>
                    {title}
                  </h4>
                </div>
                <p style={{
                  fontFamily: "'Heebo', sans-serif",
                  fontSize: 'clamp(11px, 1vw, 13px)',
                  color: MUTED, lineHeight: 1.6,
                  margin: 0, paddingRight: '12px',
                }}>
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-3"
          style={{
            borderTop: `1px solid ${BORDER}`,
            backgroundColor: 'rgba(0,0,0,0.03)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {[
            { label: 'צבעים לבחירה',      target: 4,   suffix: '',  duration: 1400 },
            { label: 'ימי עסקים למשלוח',   target: 5,   suffix: '',  duration: 1800 },
            { label: 'ישירות מהיצרן',       target: 100, suffix: '%', duration: 3200 },
          ].map(({ label, target, suffix, duration }, i) => (
            <div
              key={label}
              className="py-6 px-4 md:py-8 md:px-8"
              style={{
                textAlign: 'center',
                borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
              }}
            >
              <p className="text-[28px] md:text-[44px]" style={{ fontFamily: "'Heebo', sans-serif", color: GOLD, letterSpacing: '0.04em', margin: 0, lineHeight: 1 }}>
                <CountUp target={target} suffix={suffix} duration={duration} />
              </p>
              <p className="text-[9px] md:text-[11px]" style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, margin: '8px 0 0' }}>
                {label}
              </p>
            </div>
          ))}
        </motion.div>

      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />
    </section>
  );
}
