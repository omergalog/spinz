import { useRef, useState, useEffect } from 'react';

const GOLD  = '#C9A870';
const CREAM = '#EDEBE6';
const DARK  = '#111111';

// ─── ערוך כאן: תוכן + תמונות לכל שלב ───────────────────────────────────────
const steps = [
  {
    num: '01',
    title: 'תופס עיניים',
    body: 'כל מוצר שאנחנו מוציאים חייב לגרום לאנשים להסתכל עליך. עיצוב שמדבר לפני שאתה אומר מילה.',
    image: '/assets/photo-beige-bike.jpg',
  },
  {
    num: '02',
    title: 'נגיש באמת',
    body: 'סטייל לא אמור לעלות ביוקר. מחיר שסטודנט יכול להרשות לעצמו — בלי פשרות על האיכות.',
    image: '/assets/photo-olive-lifestyle.jpg',
  },
  {
    num: '03',
    title: 'פשוט וטהור',
    body: 'סינגל ספיד זו פילוסופיה. פחות מנגנונים, פחות תקלות, יותר חופש. רק אתה והאספלט.',
    image: '/assets/black1.jpg',
  },
  {
    num: '04',
    title: 'ישראלי בנשמה',
    body: 'Spinz נולד פה, מדבר עברית ומכיר את הרחוב הישראלי. לא מוצר מיובא — חברה שגדלה איתך.',
    image: '/assets/for-hero.jpg',
  },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function ScrollyFeatures() {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIndex(i); },
        { threshold: 0.55 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <section style={{ backgroundColor: DARK, direction: 'rtl' }}>
      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── Image column (sticky) ── */}
        <div style={{
          width: '58%',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          {steps.map((step, i) => (
            <img
              key={i}
              src={step.image}
              alt={step.title}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                opacity: activeIndex === i ? 1 : 0,
                transition: 'opacity 0.7s ease',
              }}
            />
          ))}
          {/* dark gradient over image */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to left, rgba(17,17,17,0.35) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* ── Text column (scrolls) ── */}
        <div style={{ width: '42%', paddingRight: '48px', paddingLeft: '24px' }}>
          {steps.map((step, i) => (
            <div
              key={i}
              ref={el => { itemRefs.current[i] = el; }}
              style={{
                minHeight: '100vh',          // ← כאן שולטים על מהירות הגלילה: הגדל ל-130vh לאיטי יותר, הקטן ל-80vh למהיר
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '48px 0',
                opacity: activeIndex === i ? 1 : 0.22,
                transform: activeIndex === i ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
              }}
            >
              <span style={{
                fontFamily: "'Heebo', sans-serif",
                fontSize: '11px',
                letterSpacing: '0.35em',
                color: GOLD,
                display: 'block',
                marginBottom: '20px',
              }}>
                {step.num}
              </span>

              <h3 style={{
                fontFamily: "'Heebo', sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(28px, 3.5vw, 48px)',
                color: CREAM,
                margin: '0 0 20px',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}>
                {step.title}
              </h3>

              <p style={{
                fontFamily: "'Heebo', sans-serif",
                fontSize: 'clamp(15px, 1.4vw, 18px)',
                color: CREAM,
                lineHeight: 1.75,
                margin: 0,
                maxWidth: '380px',
                opacity: 0.75,
              }}>
                {step.body}
              </p>

              {/* progress indicator */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '40px' }}>
                {steps.map((_, j) => (
                  <div key={j} style={{
                    width: j === i ? '28px' : '8px',
                    height: '3px',
                    borderRadius: '2px',
                    backgroundColor: j === i ? GOLD : 'rgba(201,168,112,0.25)',
                    transition: 'width 0.4s ease, background-color 0.4s ease',
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
