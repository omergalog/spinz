import { useRef, useState, useEffect } from 'react';

const GOLD  = '#C9A870';
const CREAM = '#EDEBE6';
const DARK  = '#111111';

// ─── ערוך כאן: תוכן + תמונות לכל שלב ───────────────────────────────────────
const steps = [
  {
    num: '01',
    title: 'תופס עיניים',
    body: 'עיצוב שגונב את ההצגה, עוד לפני שהתחלת לרכוב.',
    image: '/assets/photo-beige-bike.jpg',
    objectPosition: 'center',
  },
  {
    num: '02',
    title: 'נגיש באמת',
    body: 'סטייל לא אמור לעלות ביוקר. מחיר שסטודנט יכול להרשות לעצמו — בלי פשרות על האיכות.',
    image: '/assets/photo-olive-lifestyle.jpg',
    objectPosition: 'center',
  },
  {
    num: '03',
    title: 'פשוט וטהור',
    body: 'סינגל ספיד זו פילוסופיה. פחות מנגנונים, פחות תקלות, יותר חופש. רק אתה והאספלט.',
    image: '/assets/black1.jpg',
    objectPosition: 'center',
  },
  {
    num: '04',
    title: 'ישראלי בנשמה',
    body: 'Spinz נולד פה, מדבר עברית ומכיר את הרחוב הישראלי. לא מוצר מיובא — חברה שגדלה איתך.',
    image: '/assets/for-hero.jpg',
    objectPosition: '30% center',
  },
];
// ─────────────────────────────────────────────────────────────────────────────

/* ── Mobile: snap-scroll fullscreen cards ── */
function MobileScrolly() {
  return (
    <div style={{
      height: '100vh',
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      WebkitOverflowScrolling: 'touch',
      direction: 'rtl',
    }}>
      {steps.map(step => (
        <div
          key={step.num}
          style={{
            height: '100vh',
            scrollSnapAlign: 'start',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: DARK,
          }}
        >
          {/* Full-screen image */}
          <img
            src={step.image}
            alt={step.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: step.objectPosition }}
          />

          {/* Dark gradient from bottom */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.45) 45%, transparent 75%)' }} />

          {/* Text anchored to bottom */}
          <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, padding: '0 28px 48px' }}>
            <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.3em', color: GOLD, display: 'block', marginBottom: '12px' }}>
              {step.num}
            </span>
            <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 900, fontSize: '30px', color: CREAM, margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              {step.title}
            </h3>
            <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: CREAM, lineHeight: 1.7, margin: 0, opacity: 0.82 }}>
              {step.body}
            </p>

            {/* Dots */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '24px' }}>
              {steps.map((s, j) => (
                <div key={j} style={{
                  width: s.num === step.num ? '24px' : '6px',
                  height: '3px',
                  borderRadius: '2px',
                  backgroundColor: s.num === step.num ? GOLD : 'rgba(201,168,112,0.3)',
                  transition: 'width 0.3s ease',
                }} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ScrollyFeatures() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
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
  }, [isMobile]);

  /* ── Mobile: snap-scroll ── */
  if (isMobile) {
    return <MobileScrolly />;
  }

  /* ── Desktop: sticky scrollytelling ── */
  return (
    <section style={{ backgroundColor: DARK, direction: 'rtl' }}>
      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Image column (sticky) */}
        <div style={{ width: '58%', position: 'sticky', top: 0, height: '100vh', flexShrink: 0, overflow: 'hidden' }}>
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
                objectPosition: steps[i].objectPosition,
                opacity: activeIndex === i ? 1 : 0,
                transform: activeIndex === i ? 'scale(1)' : 'scale(1.04)',
                transition: 'opacity 2.2s cubic-bezier(0.4, 0, 0.2, 1), transform 2.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ))}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(17,17,17,0.35) 0%, transparent 60%)', pointerEvents: 'none' }} />
        </div>

        {/* Text column */}
        <div style={{ width: '42%', paddingRight: '48px', paddingLeft: '24px' }}>
          {steps.map((step, i) => (
            <div
              key={i}
              ref={el => { itemRefs.current[i] = el; }}
              style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '48px 0',
                opacity: activeIndex === i ? 1 : 0.22,
                transform: activeIndex === i ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
              }}
            >
              <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.35em', color: GOLD, display: 'block', marginBottom: '20px' }}>
                {step.num}
              </span>
              <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 3.5vw, 48px)', color: CREAM, margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                {step.title}
              </h3>
              <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(15px, 1.4vw, 18px)', color: CREAM, lineHeight: 1.75, margin: 0, maxWidth: '380px', opacity: 0.75 }}>
                {step.body}
              </p>
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
