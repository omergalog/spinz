import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const GOLD  = '#C9A870';
const CREAM = '#EDEBE6';
const DARK  = '#1C1C1C';

const bikes = [
  { src: '/assets/bike-black.png', label: 'Matte Black' },
  { src: '/assets/bike-rust.png',  label: 'Rust' },
  { src: '/assets/bike-green.png', label: 'Olive Green' },
  { src: '/assets/bike-gray.png',  label: 'Urban Gray' },
];

export default function Lifestyle() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % bikes.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      ref={ref}
      id="lifestyle"
      dir="rtl"
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: DARK,
        height: 'clamp(380px, 55vw, 680px)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Gold top line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`,
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(24px, 6vw, 80px) clamp(24px, 8vw, 120px)',
        gap: 'clamp(24px, 5vw, 80px)',
      }}>

        {/* Text — right (RTL first) */}
        <div style={{ flex: '0 0 auto', maxWidth: '480px' }}>
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
              maxWidth: '380px',
            }}
          >
            סינגל ספיד נקי, עיצוב שאי אפשר להתעלם ממנו, ורכיבה שגורמת לך לחייך בכל פעם מחדש.
          </motion.p>

          {/* Color dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            style={{ display: 'flex', gap: '8px', marginTop: '28px', alignItems: 'center' }}
          >
            {bikes.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: i === current ? GOLD : 'rgba(237,235,230,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.4s ease',
                }}
              />
            ))}
            <span style={{
              fontFamily: "'Heebo', sans-serif",
              fontSize: '11px',
              color: 'rgba(237,235,230,0.4)',
              marginRight: '8px',
              letterSpacing: '0.1em',
            }}>
              {bikes[current].label}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
              marginTop: '28px',
              width: 'clamp(40px, 6vw, 64px)',
              height: '2px',
              backgroundColor: GOLD,
              transformOrigin: 'right',
            }}
          />
        </div>

        {/* Bike image — left */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={bikes[current].src}
              alt={bikes[current].label}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '100%',
                maxWidth: 'clamp(280px, 40vw, 560px)',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.6))',
              }}
            />
          </AnimatePresence>
        </div>

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
