import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import models from '../data/models';
import { useCart } from '../context/CartContext';

const DARK        = '#1C1C1C';
const BEIGE       = '#F5F2EC';
const GOLD        = '#C9A870';
const BORDER      = '#E2DED8';

function formatPrice(n: number) {
  return `₪${n.toLocaleString('he-IL')}`;
}

function ModelCard({ model, index }: { model: typeof models[number]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(model);
    setAdded(true);
    setHovered(true);
    setTimeout(() => setAdded(false), 2000);
    setTimeout(() => setHovered(false), 2000);
  };

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
        className="aspect-[4/3] md:aspect-[3/2]"
        style={{
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
          className="w-[88%] h-[88%] md:w-[88%] md:h-[88%] max-md:w-full max-md:h-full"
          style={{ objectFit: 'contain' }}
          loading="lazy"
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
        <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-[14px]">
          <div className="hidden md:block" style={{ width: '1px', height: '30px', backgroundColor: '#2A2A2A' }} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
            <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '18px', fontWeight: 700, color: GOLD }}>
              {formatPrice(model.price)}
            </span>
            <span className="md:hidden" style={{ fontFamily: "'Heebo', sans-serif", fontSize: '8px', color: '#FFFFFF', letterSpacing: '0.1em' }}>
              מחיר
            </span>
            <p className="hidden md:block" style={{ fontFamily: "'Heebo'", fontSize: '9px', color: '#FFFFFF', margin: '2px 0 0', letterSpacing: '0.1em' }}>
              מחיר
            </p>
          </div>
          <div className="hidden md:block" style={{ width: '1px', height: '30px', backgroundColor: '#2A2A2A' }} />
          <div style={{ position: 'relative' }}>
            {/* Burst particles */}
            <AnimatePresence>
              {added && [0,1,2,3,4].map(i => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  animate={{
                    opacity: 0,
                    x: (i - 2) * 18,
                    y: -28 - i * 4,
                    scale: 0.4,
                  }}
                  transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.04 }}
                  style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: '6px', height: '6px',
                    borderRadius: '50%',
                    backgroundColor: GOLD,
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                />
              ))}
            </AnimatePresence>
            <motion.button
              onClick={handleAddToCart}
              animate={added ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: added ? '#2A5A2A' : GOLD,
                color: added ? '#7FD97F' : DARK,
                border: 'none', borderRadius: '4px',
                padding: '8px 14px',
                fontFamily: "'Heebo', sans-serif",
                fontSize: '12px', fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background-color 0.3s, color 0.3s',
              }}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span key="check" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} /> נוסף!
                  </motion.span>
                ) : (
                  <motion.span key="cart" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShoppingCart size={14} /> הוסף לעגלה
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Models() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true, margin: '-60px' });
  const mobileHeaderRef = useRef<HTMLDivElement>(null);
  const mobileInView = useInView(mobileHeaderRef, { once: true, margin: '-20px' });

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
          {/* Mobile header — sticky below navbar */}
          <div ref={mobileHeaderRef} className="md:hidden" style={{ paddingBottom: '20px', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: '64px', backgroundColor: BEIGE, zIndex: 10 }}>
            <motion.h5
              initial={{ opacity: 0 }}
              animate={mobileInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD, marginBottom: '10px' }}
            >
              המודלים שלנו
            </motion.h5>
            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                initial={{ y: '105%' }}
                animate={mobileInView ? { y: '0%' } : {}}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
                style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '40px', color: DARK, letterSpacing: '-0.01em', margin: 0 }}
              >
                בחר את האופניים שלך
              </motion.h2>
            </div>
          </div>

          {models.map((model, i) => (
            <ModelCard key={model.id} model={model} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
