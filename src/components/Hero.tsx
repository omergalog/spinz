import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DARK       = '#1C1C1C';
const LIGHT      = '#F5F2EC';
const GOLD       = '#C9A870';
const TEXT_LIGHT = '#EDEBE6';

const bikes = [
  { src: '/assets/bike-black.png', label: 'Matte Black' },
  { src: '/assets/bike-rust.png',  label: 'Rust' },
  { src: '/assets/bike-green.png', label: 'Olive Green' },
  { src: '/assets/bike-gray.png',  label: 'Urban Gray' },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % bikes.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative flex h-[68vh] md:min-h-screen flex-col overflow-hidden"
      style={{ backgroundColor: DARK }}
      dir="rtl"
    >
      {/* Navbar spacer */}
      <div className="h-16 md:h-20 flex-shrink-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col md:flex-row items-center px-6 md:px-16 lg:px-24 pb-6 gap-8">

        {/* Text — right side (RTL = first) */}
        <div className="flex flex-col items-start justify-center flex-1 min-w-0">

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{
              color: GOLD,
              fontFamily: "'Heebo', sans-serif",
              fontSize: '11px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Single Speed Urban Bikes
          </motion.p>

          <div style={{ overflow: 'hidden', marginBottom: '0' }}>
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.25 }}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                color: TEXT_LIGHT,
                fontSize: 'clamp(72px, 14vw, 160px)',
                lineHeight: 0.9,
                margin: 0,
              }}
            >
              SPIN<span style={{ color: GOLD }}>Z</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.95 }}
            style={{
              color: '#FFFFFF',
              fontFamily: "'Heebo', sans-serif",
              fontSize: 'clamp(13px, 1.5vw, 18px)',
              fontWeight: 300,
              marginTop: '20px',
              maxWidth: '380px',
              lineHeight: 1.6,
            }}
          >
            משלמים על האופניים, לא על החנות ברוטשילד
          </motion.p>

          {/* Color dots indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.1 }}
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
                  backgroundColor: i === current ? GOLD : `${TEXT_LIGHT}30`,
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
              color: `${TEXT_LIGHT}50`,
              marginRight: '8px',
              letterSpacing: '0.1em',
            }}>
              {bikes[current].label}
            </span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.3 }}
            style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '32px', flexWrap: 'wrap' }}
          >
            <a
              href="#models"
              onClick={e => { e.preventDefault(); document.getElementById('models')?.scrollIntoView({ behavior: 'smooth' }); }}
              style={{
                backgroundColor: GOLD,
                color: DARK,
                padding: '12px 28px',
                fontFamily: "'Heebo', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                borderRadius: '4px',
                textDecoration: 'none',
                transition: 'background-color 0.25s, transform 0.25s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.backgroundColor = '#B8933A'; el.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.backgroundColor = GOLD; el.style.transform = 'translateY(0)'; }}
            >
              לכל הדגמים
            </a>

            <a
              href="#lead-form"
              onClick={e => { e.preventDefault(); document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' }); }}
              style={{
                border: `1px solid ${TEXT_LIGHT}40`,
                color: TEXT_LIGHT,
                padding: '12px 28px',
                fontFamily: "'Heebo', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                borderRadius: '4px',
                textDecoration: 'none',
                transition: 'border-color 0.25s, color 0.25s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = `${TEXT_LIGHT}90`; el.style.color = LIGHT; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = `${TEXT_LIGHT}40`; el.style.color = TEXT_LIGHT; }}
            >
              צור קשר
            </a>
          </motion.div>
        </div>

        {/* Bike image — left side (RTL = second), hidden on small mobile */}
        <div
          className="hidden md:flex flex-1 items-center justify-center"
          style={{ position: 'relative', minHeight: '420px' }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={bikes[current].src}
              alt={bikes[current].label}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '100%',
                maxWidth: '560px',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.5))',
              }}
            />
          </AnimatePresence>
        </div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <div style={{ width: '1px', height: '48px', backgroundColor: `${TEXT_LIGHT}25`, position: 'relative', overflow: 'hidden' }}>
          <motion.div
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 1.6, ease: 'linear', repeat: Infinity }}
            style={{ width: '100%', height: '40%', backgroundColor: GOLD, position: 'absolute', top: 0 }}
          />
        </div>
        <span style={{ color: `${TEXT_LIGHT}50`, fontSize: '9px', letterSpacing: '0.4em', fontFamily: "'Heebo', sans-serif", textTransform: 'uppercase' }}>
          גלול
        </span>
      </motion.div>
    </section>
  );
}
