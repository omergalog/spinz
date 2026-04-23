import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

const GOLD  = '#C9A870';
const CREAM = '#EDEBE6';

export default function Lifestyle() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section
      ref={ref}
      id="lifestyle"
      style={{ position: 'relative', overflow: 'hidden', height: 'clamp(380px, 55vw, 680px)' }}
    >
      {/* Parallax image */}
      <motion.div
        style={{
          y,
          position: 'absolute',
          inset: '-15% 0',
          backgroundImage: 'url(/assets/gallery-1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to left, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.18) 100%)',
      }} />

      {/* Gold top line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`,
      }} />

      {/* Content */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(24px, 6vw, 80px) clamp(24px, 8vw, 120px)',
        }}
      >
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{
            fontFamily: "'Heebo', sans-serif",
            fontSize: '11px',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: GOLD,
            marginBottom: '16px',
            display: 'block',
          }}
        >
          Spinz — Urban Ride
        </motion.span>

        <div style={{ overflow: 'hidden', marginBottom: '20px' }}>
          <motion.h2
            initial={{ y: '105%' }}
            animate={isInView ? { y: '0%' } : {}}
            transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
            style={{
              fontFamily: "'Heebo', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(28px, 5.5vw, 76px)',
              color: CREAM,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              margin: 0,
              maxWidth: '680px',
            }}
          >
            הרחוב הוא שלך.
          </motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          style={{
            fontFamily: "'Heebo', sans-serif",
            fontSize: 'clamp(13px, 1.5vw, 18px)',
            color: 'rgba(237,235,230,0.72)',
            lineHeight: 1.65,
            margin: 0,
            maxWidth: '440px',
          }}
        >
          סינגל ספיד נקי, עיצוב שאי אפשר להתעלם ממנו, ורכיבה שגורמת לך לחייך בכל פעם מחדש.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            marginTop: '28px',
            width: 'clamp(40px, 6vw, 64px)',
            height: '2px',
            backgroundColor: GOLD,
            transformOrigin: 'right',
          }}
        />
      </div>

      {/* Gold bottom line */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`,
      }} />
    </section>
  );
}
