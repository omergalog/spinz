import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DARK   = '#1C1C1C';
const LIGHT  = '#F5F2EC';
const GOLD   = '#C9A870';
const MUTED  = '#6A6862';
const BORDER = '#E0DCD4';

const values = [
  { num: '01', title: 'תופס עיניים', body: 'כל מוצר שאנחנו מוציאים חייב לגרום לאנשים להסתכל עליך. אם זה לא מסובב ראשים ברחוב – זה לא Spinz.' },
  { num: '02', title: 'נגיש באמת',   body: 'סטייל לא אמור לעלות ביוקר. מחיר שסטודנט יכול להרשות לעצמו — בלי שתצטרך להתפשר.' },
  { num: '03', title: 'פשוט וטהור',  body: 'סינגל ספיד זו פילוסופיה. פחות מנגנונים, יותר חופש. כך רוכבים בעיר.' },
  { num: '04', title: 'ישראלי בנשמה', body: 'Spinz לא מנסה להיות אירופאי. אנחנו מדברים עברית ומכירים את הרחוב הישראלי.' },
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

const imageCard = {
  borderRadius: '16px',
  overflow: 'hidden' as const,
  aspectRatio: '3/4',
  position: 'relative' as const,
};

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
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />

      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

          {/* Content column — padding here so image can be full-height sticky */}
          <div className="flex-1 min-w-0 flex flex-col gap-10 py-20 lg:py-28">

            {/* Header */}
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6 }}
                style={{ display: 'block', marginBottom: '12px', fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#888' }}
              >
                Why Spinz
              </motion.span>

              <RevealText delay={0.08}>
                <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 5vw, 64px)', color: DARK, letterSpacing: '-0.01em', lineHeight: 1, margin: '0 0 16px' }}>
                  אנחנו לא מוכרים אופניים.
                </h2>
              </RevealText>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.18 }}
                style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(14px, 1.6vw, 18px)', fontWeight: 500, color: DARK, lineHeight: 1.55, margin: 0 }}
              >
                אנחנו מוכרים את הרגע שמישהו עוצר אותך ברחוב ושואל — וואו, מאיפה הם?
              </motion.p>
            </div>

            {/* Mobile image — visible only below lg */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="block lg:hidden"
              style={{ ...imageCard, maxWidth: '320px', alignSelf: 'center', width: '100%' }}
            >
              <img
                src="/assets/brand-bike.jpg"
                alt="Spinz Urban bike"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', left: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>SPINZ Urban</span>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '10px', letterSpacing: '0.2em', color: GOLD, fontWeight: 700 }}>2026</span>
              </div>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
            </motion.div>

            {/* Story + button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.22 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ borderRight: `3px solid ${GOLD}`, paddingRight: '20px' }}>
                <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(13px, 1.3vw, 16px)', color: '#555', lineHeight: 1.85, margin: 0 }}>
                  Spinz נולד מתוך שלושה חברים שגדלו בין הפרדסים של עמק חפר — ועברו לתל אביב עם אופניים שלא הרגישו "זה". ניסינו הכל. ושום דבר לא ענה על מה שרצינו: משהו פשוט, יפה, ומחיר שאפשר להרשות לעצמנו.
                </p>
              </div>
              <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(13px, 1.3vw, 16px)', color: '#555', lineHeight: 1.85, margin: 0 }}>
                ככה נולד Spinz — סינגל-ספיד שנראה מעולה, נוסע חלק, ומגיע ישירות מהיצרן אלייך.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/story')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', backgroundColor: 'transparent', color: GOLD, padding: '8px 0', fontFamily: "'Heebo', sans-serif", fontSize: '15px', fontWeight: 700, letterSpacing: '0.08em', border: 'none', borderBottom: `2px solid ${GOLD}`, cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                הסיפור המלא ←
              </motion.button>
            </motion.div>

            {/* Values */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {values.map(({ num, title, body }, i) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '2px', height: '16px', backgroundColor: GOLD, flexShrink: 0 }} />
                    <h4 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: 'clamp(12px, 1.2vw, 14px)', color: DARK, margin: 0 }}>{title}</h4>
                  </div>
                  <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(11px, 0.95vw, 13px)', color: MUTED, lineHeight: 1.6, margin: 0, paddingRight: '10px' }}>{body}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="grid grid-cols-3"
              style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}
            >
              {[
                { label: 'צבעים לבחירה',    target: 4,   suffix: '',  duration: 1400 },
                { label: 'ימי עסקים למשלוח', target: 5,   suffix: '',  duration: 1800 },
                { label: 'ישירות מהיצרן',    target: 100, suffix: '%', duration: 3200 },
              ].map(({ label, target, suffix, duration }, i) => (
                <div key={label} className="py-5 px-2 md:py-6" style={{ textAlign: 'center', borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
                  <p className="text-[26px] md:text-[36px]" style={{ fontFamily: "'Heebo', sans-serif", color: GOLD, letterSpacing: '0.02em', margin: 0, lineHeight: 1 }}>
                    <CountUp target={target} suffix={suffix} duration={duration} />
                  </p>
                  <p className="text-[9px] md:text-[10px]" style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, margin: '6px 0 0' }}>
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Desktop image — sticky, fills full viewport height below navbar */}
          <div
            className="hidden lg:block w-[42%] flex-shrink-0"
            style={{ position: 'sticky', top: '88px', height: 'calc(100vh - 88px)', alignSelf: 'flex-start', padding: '24px 0' }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              style={{ height: '100%', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 8px 48px rgba(0,0,0,0.18)' }}
            >
              <img
                src="/assets/brand-bike.jpg"
                alt="Spinz Urban bike"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />
              <div style={{ position: 'absolute', bottom: '20px', right: '20px', left: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>SPINZ Urban</span>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '10px', letterSpacing: '0.2em', color: GOLD, fontWeight: 700 }}>2026</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />
    </section>
  );
}
