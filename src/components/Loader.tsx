import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Loader({ onDone }: { onDone: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      setTimeout(onDone, 900);
    }, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ backgroundColor: '#F5F2EC' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* SPINZ line reveal */}
          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              initial={{ y: '105%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(72px, 18vw, 200px)',
                color: '#111111',
                letterSpacing: '0.12em',
                lineHeight: 0.9,
                margin: 0,
              }}
            >
              SPIN<span style={{ color: '#BEC3AE' }}>Z</span>
            </motion.h1>
          </div>

          {/* Rule reveal */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.75 }}
            style={{
              height: '1px',
              backgroundColor: '#E0DCD4',
              width: 'clamp(72px, 18vw, 200px)',
              transformOrigin: 'left',
              marginTop: '18px',
            }}
          />

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            style={{
              fontFamily: "'Heebo', sans-serif",
              color: '#8A8880',
              fontSize: '10px',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              marginTop: '14px',
            }}
          >
            Single Speed Urban Bikes
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
