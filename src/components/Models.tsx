import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import models from '../data/models';

const DARK        = '#1C1C1C';
const BEIGE       = '#F5F2EC';
const GOLD        = '#C9A870';
const BORDER      = '#E2DED8';

function formatPrice(n: number) {
  return `₪${n.toLocaleString('he-IL')}`;
}

function ModelCard({ model, index }: { model: typeof models[number]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ overflow: 'hidden', cursor: 'pointer', border: `1px solid ${BORDER}` }}
    >
      {/* Image area */}
      <div
        style={{
          aspectRatio: '3/2',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.img
          src={model.image.replace('.png', '.jpg')}
          alt={model.name}
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '88%', height: '88%', objectFit: 'contain' }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(28,28,28,0.08)' }}
        />
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
          transition={{ duration: 0.35 }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: DARK,
              fontFamily: "'Heebo', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              borderBottom: `1px solid ${GOLD}`,
              paddingBottom: '4px',
            }}
          >
            צפייה במודל
          </span>
        </motion.div>
      </div>

      {/* Info bar */}
      <div
        style={{
          backgroundColor: DARK,
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "'Heebo', sans-serif",
              fontWeight: 800,
              fontSize: '26px',
              color: '#EDEBE6',
              letterSpacing: '0',
              margin: 0,
              lineHeight: 1,
            }}
          >
            {model.name}
          </h3>
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', color: '#FFFFFF', margin: '4px 0 0' }}>
            {model.tagline}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '1px', height: '30px', backgroundColor: '#2A2A2A' }} />
          <div>
            <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '18px', fontWeight: 700, color: GOLD }}>
              {formatPrice(model.price)}
            </span>
            <p style={{ fontFamily: "'Heebo'", fontSize: '9px', color: '#FFFFFF', margin: '2px 0 0', letterSpacing: '0.1em' }}>
              מחיר
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Models() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true, margin: '-60px' });

  return (
    <section id="models" style={{ backgroundColor: BEIGE }} dir="rtl">
      <div
        style={{ gridTemplateColumns: '1fr 1.3fr' }}
        className="block md:grid"
      >
        {/* LEFT sticky panel */}
        <div
          className="hidden md:block"
          style={{ borderLeft: `1px solid ${BORDER}`, minHeight: '100%' }}
        >
          <div
            ref={headerRef}
            style={{ position: 'sticky', top: '64px', padding: '60px 36px' }}
          >
            <motion.h5
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7 }}
              style={{
                fontFamily: "'Heebo', sans-serif",
                fontSize: '11px',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: GOLD,
                margin: '0 0 16px',
              }}
            >
              המודלים שלנו
            </motion.h5>

            <div style={{ overflow: 'hidden' }}>
              <motion.h1
                initial={{ y: '105%' }}
                animate={isInView ? { y: '0%' } : {}}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
                style={{
                  fontFamily: "'Heebo', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(38px, 4.5vw, 60px)',
                  color: DARK,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.05,
                  margin: 0,
                }}
              >
                בחר את האופניים שלך
              </motion.h1>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                height: '1px',
                backgroundColor: BORDER,
                margin: '28px 0',
                transformOrigin: 'right',
              }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: '#666', lineHeight: 1.7, margin: 0 }}
            >
              אנחנו מתמחים באופניי עיר סינגל ספיד, מבוצעים בתהליך שקוף, מדויק ומושלם.
              התוצאה: אופניים שנראים כמו פסל ורוכבים כמו חלום.
            </motion.p>
          </div>
        </div>

        {/* RIGHT scrollable cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            borderRight: `1px solid ${BORDER}`,
          }}
          className="p-5 md:p-9"
        >
          {/* Mobile header */}
          <div className="md:hidden" style={{ paddingBottom: '20px', borderBottom: `1px solid ${BORDER}` }}>
            <h5
              style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD, marginBottom: '10px' }}
            >
              המודלים שלנו
            </h5>
            <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '40px', color: DARK, letterSpacing: '-0.01em', margin: 0 }}>
              בחר את האופניים שלך
            </h2>
          </div>

          {models.map((model, i) => (
            <ModelCard key={model.id} model={model} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
