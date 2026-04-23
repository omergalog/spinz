import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const GOLD   = '#C9A870';
const CREAM  = '#EDEBE6';
const MUTED  = '#6A6862';
const BG     = '#1C1C1C';
const BORDER = '#2A2A2A';

const faqs = [
  {
    q: 'כמה זמן לוקח המשלוח?',
    a: 'אנחנו שולחים עד 5 ימי עסקים מרגע ההזמנה. תקבלו SMS עם מספר מעקב ברגע שהחבילה יוצאת אלינו.',
  },
  {
    q: 'האופניים מגיעים מורכבים?',
    a: 'כן, כ-85% מורכבים. מה שנשאר הוא חיבור ההגה, פדלים והתאמת המושב — פחות מ-20 דקות עם הסרטון שמגיע בקופסה.',
  },
  {
    q: 'יש אפשרות לאיסוף עצמי?',
    a: 'כן, ניתן לאסוף מתל אביב ללא עלות משלוח. תיאום מועד האיסוף מתבצע לאחר ההזמנה.',
  },
  {
    q: 'אפשר לשלם בתשלומים?',
    a: 'בהחלט. ניתן לפרוס לעד 13 תשלומים החל מ-₪100 בחודש. מקבלים אשראי, ביט, Apple Pay ו-Google Pay.',
  },
  {
    q: 'לאיזה גובה מתאים כל דגם?',
    a: 'שלדה 54 מתאימה לגובה 160–175 ס"מ. שלדה 57 מתאימה לגובה 175–190 ס"מ. במקרי ספק — עדיף שלדה קטנה יותר.',
  },
  {
    q: 'כל הצבעים זמינים בכל המידות?',
    a: 'כן, כל צבעי הקולקציה זמינים בשתי מידות השלדה ללא הגבלה.',
  },
  {
    q: 'מה כוללת האחריות?',
    a: 'האופניים מגיעים עם אחריות של 5 שנים על שלדת האלומיניום. חלפים מתכלים כגון צמיגים, שרשרת ופדלים אינם כלולים באחריות.',
  },
  {
    q: 'איפה אפשר לתקן את האופניים?',
    a: 'האופניים בנויים על רכיבים סטנדרטיים שניתן למצוא בכל חנות אופניים בישראל. אין צורך בטכנאי מורשה.',
  },
  {
    q: 'האופניים מתאימים לגברים ולנשים?',
    a: 'כן. שתי מידות השלדה מתאימות לכולם — הגיאומטריה של האופניים אוניברסלית וניתן להתאים את גובה המושב וההגה.',
  },
];

function FAQItem({ item, index }: { item: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      style={{ borderBottom: `1px solid ${BORDER}` }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '20px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'right',
        }}
      >
        <span style={{
          fontFamily: "'Heebo', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(14px, 1.5vw, 17px)',
          color: open ? GOLD : CREAM,
          lineHeight: 1.3,
          transition: 'color 0.25s',
          flex: 1,
        }}>
          {item.q}
        </span>

        {/* Plus / Minus icon */}
        <span style={{
          flexShrink: 0,
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: `1px solid ${open ? GOLD : BORDER}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.25s',
        }}>
          <motion.svg
            width="12" height="12" viewBox="0 0 12 12"
            fill="none" stroke={open ? GOLD : MUTED}
            strokeWidth="1.8" strokeLinecap="round"
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <line x1="6" y1="0" x2="6" y2="12"/>
            <line x1="0" y1="6" x2="12" y2="6"/>
          </motion.svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              fontFamily: "'Heebo', sans-serif",
              fontSize: 'clamp(13px, 1.3vw, 15px)',
              color: MUTED,
              lineHeight: 1.75,
              margin: '0 0 20px',
              paddingLeft: '44px',
            }}>
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-40px' });

  const half = Math.ceil(faqs.length / 2);
  const left  = faqs.slice(0, half);
  const right = faqs.slice(half);

  return (
    <section
      ref={ref}
      id="faq"
      dir="rtl"
      style={{ backgroundColor: BG, position: 'relative' }}
      className="py-20 lg:py-28"
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />

      <div className="mx-auto max-w-7xl px-6 lg:px-16">

        {/* Header */}
        <div className="mb-12 lg:mb-16">
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
            שאלות נפוצות
          </motion.span>

          <div ref={headingRef} style={{ overflow: 'hidden' }}>
            <motion.h2
              initial={{ y: '105%' }}
              animate={headingInView ? { y: '0%' } : {}}
              transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
              style={{
                fontFamily: "'Heebo', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(28px, 5.5vw, 64px)',
                color: CREAM,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                margin: 0,
              }}
            >
              כל מה שרצית לדעת.
            </motion.h2>
          </div>
        </div>

        {/* Two-column accordion on desktop, single column on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-16">
          <div style={{ borderTop: `1px solid ${BORDER}` }}>
            {left.map((item, i) => (
              <FAQItem key={i} item={item} index={i} />
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}` }} className="mt-0 lg:mt-0">
            {right.map((item, i) => (
              <FAQItem key={i} item={item} index={i + half} />
            ))}
          </div>
        </div>

      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />
    </section>
  );
}
