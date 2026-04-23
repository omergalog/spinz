import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const DARK  = '#1C1C1C';
const GOLD  = '#C9A870';
const CREAM = '#EDEBE6';
const MUTED = '#6A6862';
const BORDER = '#2A2A2A';

const specs = [
  {
    num: '01',
    title: 'קלילות עירונית',
    sub: 'שלדת אלומיניום',
    body: 'שלדת אלומיניום המעניקה תחושת קלילות יוצאת דופן. מאפשרת זינוק זריז בכל רמזור ונוחה לנשיאה אל תוך הדירה או המשרד באפס מאמץ.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L8 8H4l4 4-2 6 6-3 6 3-2-6 4-4h-4L12 2z"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'צמיגים עמידים לפנצ\'ר',
    sub: 'Kenda 32 מ"מ',
    body: 'אחיזה בטוחה וראש שקט. צמיגים אורבניים רחבים שבולעים את מהמורות העיר, פסי הרכבת הקלה והאספלט, בלי לעכב אותך.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
        <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'יחס העברה חכם לעיר',
    sub: 'גלגל שיניים 46T',
    body: 'האיזון המושלם בין מהירות לשיוט קל. מנגנון הסינגל-ספיד מכויל בדיוק לעליות המתונות ולמישורים של הרחובות, כדי שתגיע מהר ובלי להזיע.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>
      </svg>
    ),
  },
  {
    num: '04',
    title: 'הנדסת חומרים חכמה',
    sub: 'אלומיניום + פלדה',
    body: 'שילוב מדויק של שלדת אלומיניום קלה עם מזלג פלדה קדמי, שסופג את הרעידות מהכביש ומעניק חוויית רכיבה חלקה ונוחה יותר.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
        <line x1="12" y1="2" x2="12" y2="22"/>
        <line x1="2" y1="8.5" x2="22" y2="8.5"/>
        <line x1="2" y1="15.5" x2="22" y2="15.5"/>
      </svg>
    ),
  },
  {
    num: '05',
    title: 'חישוקים מחוזקים',
    sub: 'פרופיל גבוה 30 מ"מ',
    body: 'גלגלים בעלי פרופיל גבוה — לא רק למראה אורבני מוקפד, אלא גם להבטחת עמידות מקסימלית מול בורות, שפות מדרכה ובלאי עירוני.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/>
      </svg>
    ),
  },
  {
    num: '06',
    title: 'התאמה בשנייה',
    sub: 'Quick Release',
    body: 'מנגנון שחרור מהיר למושב המאפשר כוונון גובה מיידי ללא צורך בכלים — מושלם לאופניים משפחתיים או לכמה רוכבים.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    num: '07',
    title: 'בטיחות ללא פשרות',
    sub: 'תקני בטיחות בינלאומיים',
    body: 'האופניים תוכננו ונבנו בהתאם לתקני בטיחות בינלאומיים מחמירים. כי על בטיחות לא מתפשרים.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
  {
    num: '08',
    title: 'פדלים רחבים משודרגים',
    sub: 'יציבות מלאה',
    body: 'פדלים רחבים מפלסטיק קשיח בעיצוב נקי, המעניקים שטח פנים גדול יותר לאחיזה בטוחה, מניעת החלקות ודיווש נוח בכל נעל.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="10" width="20" height="5" rx="2"/>
        <line x1="7" y1="10" x2="7" y2="15"/>
        <line x1="12" y1="10" x2="12" y2="15"/>
        <line x1="17" y1="10" x2="17" y2="15"/>
      </svg>
    ),
  },
];

function SpecCard({ spec, index }: { spec: typeof specs[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.08 }}
      style={{
        borderTop: `1px solid ${BORDER}`,
        paddingTop: '20px',
        paddingBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Top row: icon + number */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: GOLD }}>{spec.icon}</div>
        <span style={{
          fontFamily: "'Heebo', sans-serif",
          fontSize: '11px',
          fontWeight: 700,
          color: BORDER,
          letterSpacing: '0.2em',
        }}>{spec.num}</span>
      </div>

      {/* Title + sub */}
      <div>
        <h3 style={{
          fontFamily: "'Heebo', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(14px, 1.8vw, 17px)',
          color: CREAM,
          margin: '0 0 3px',
          lineHeight: 1.2,
        }}>{spec.title}</h3>
        <span style={{
          fontFamily: "'Heebo', sans-serif",
          fontSize: '11px',
          fontWeight: 600,
          color: GOLD,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>{spec.sub}</span>
      </div>

      {/* Body */}
      <p style={{
        fontFamily: "'Heebo', sans-serif",
        fontSize: 'clamp(12px, 1.2vw, 13.5px)',
        color: MUTED,
        lineHeight: 1.65,
        margin: 0,
      }}>{spec.body}</p>
    </motion.div>
  );
}

export default function Specs() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-40px' });

  return (
    <section
      ref={ref}
      id="specs"
      dir="rtl"
      style={{ backgroundColor: DARK, position: 'relative' }}
      className="py-20 lg:py-28"
    >
      {/* Top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />

      <div className="mx-auto max-w-7xl px-6 lg:px-16">

        {/* Header */}
        <div className="mb-14 lg:mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7 }}
            style={{
              display: 'block',
              marginBottom: '12px',
              fontFamily: "'Heebo', sans-serif",
              fontSize: '11px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: MUTED,
            }}
          >
            מפרט טכני
          </motion.span>

          <div ref={headingRef} style={{ overflow: 'hidden' }}>
            <motion.h2
              initial={{ y: '105%' }}
              animate={headingInView ? { y: '0%' } : {}}
              transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
              style={{
                fontFamily: "'Heebo', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(30px, 6vw, 72px)',
                color: CREAM,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                margin: 0,
              }}
            >
              מפרט ללא פשרות.
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontFamily: "'Heebo', sans-serif",
              fontSize: 'clamp(13px, 1.4vw, 17px)',
              color: MUTED,
              lineHeight: 1.6,
              margin: '16px 0 0',
              maxWidth: '540px',
            }}
          >
            כל פרט באופני SPINZ תוכנן בקפידה כדי להעניק לך חוויית רכיבה חלקה, בטוחה ונטולת מאמץ ברחובות העיר.
          </motion.p>
        </div>

        {/* Grid: 4 col desktop, 2 col mobile */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{ columnGap: '24px' }}
        >
          {specs.map((spec, i) => (
            <SpecCard key={spec.num} spec={spec} index={i} />
          ))}
        </div>

      </div>

      {/* Bottom border */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />
    </section>
  );
}
