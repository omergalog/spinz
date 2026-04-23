import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const DARK   = '#1C1C1C';
const GOLD   = '#C9A870';
const MUTED  = '#6A6862';
const BG     = '#F5F2EC';
const BORDER = '#E0DCD4';

const reviews = [
  {
    quote: 'קניתי לפני חודש ומאז אני נוסע לעבודה כל יום. האופניים פשוט מושלמים לעיר — קלים, נראים מדהים, ולא פעם אחת עצרו אותי ברחוב לשאול מאיפה.',
    name: 'יואב כ.',
    city: 'תל אביב',
    stars: 5,
  },
  {
    quote: 'הייתי סקפטית בהתחלה לגבי סינגל ספיד, אבל אחרי שבוע של רכיבה הבנתי שזה בדיוק מה שחיפשתי. פשוט, נקי, ומהנה להפליא.',
    name: 'מיכל ר.',
    city: 'תל אביב',
    stars: 5,
  },
  {
    quote: 'ההרכבה לקחה לי 20 דקות עם הסרטון. האופניים הגיעו אלינו מהר ובמצב מושלם. עיצוב יוצא מן הכלל ביחס למחיר.',
    name: 'עמית ל.',
    city: 'רמת גן',
    stars: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px', marginBottom: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={GOLD}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: typeof reviews[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      style={{
        backgroundColor: '#FFFFFF',
        border: `1px solid ${BORDER}`,
        borderRadius: '16px',
        padding: 'clamp(20px, 3vw, 32px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {/* Gold quote mark */}
      <span style={{
        fontFamily: 'Georgia, serif',
        fontSize: '56px',
        color: GOLD,
        lineHeight: 0.8,
        marginBottom: '12px',
        display: 'block',
        opacity: 0.6,
      }}>"</span>

      <Stars count={review.stars} />

      <p style={{
        fontFamily: "'Heebo', sans-serif",
        fontSize: 'clamp(13px, 1.3vw, 15px)',
        color: DARK,
        lineHeight: 1.7,
        margin: '0 0 auto',
        flexGrow: 1,
      }}>{review.quote}</p>

      <div style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: `1px solid ${BORDER}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* Avatar placeholder */}
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: GOLD + '22',
          border: `1px solid ${GOLD}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, color: GOLD }}>
            {review.name[0]}
          </span>
        </div>
        <div>
          <div style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '13px', color: DARK }}>
            {review.name}
          </div>
          <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: MUTED }}>
            {review.city}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Reviews() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-40px' });

  return (
    <section
      ref={ref}
      id="reviews"
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
            לקוחות מרוצים
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
                color: DARK,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                margin: 0,
              }}
            >
              מה אומרים עלינו.
            </motion.h2>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <ReviewCard key={i} review={review} index={i} />
          ))}
        </div>

      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />
    </section>
  );
}
