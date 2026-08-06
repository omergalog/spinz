import { useDir } from '../i18n/LanguageContext';
import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

const GOLD  = '#C9A870';
const DARK  = '#1C1C1C';
const CREAM = '#EDEBE6';

function ParallaxBg({ src, yRange }: { src: string; yRange: [string, string] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const y = useTransform(scrollYProgress, [0, 1], isMobile ? ['0%', '0%'] : yRange);
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
      <motion.div style={{ y, position: 'absolute', inset: isMobile ? 0 : '-12% 0', backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center center' }} />
    </div>
  );
}

export function AtmosphereOne() {
  const dir = useDir();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section style={{ position: 'relative', height: 'clamp(380px, 55vw, 680px)', overflow: 'hidden', backgroundColor: DARK }}>
      <ParallaxBg src="/assets/photo-black-detail.jpg" yRange={['-10%', '10%']} />

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(28,28,28,0.88) 0%, rgba(28,28,28,0.45) 55%, rgba(28,28,28,0.1) 100%)' }} />

      <div
        ref={ref}
        dir={dir}
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(24px, 8vw, 120px)' }}
      >
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ color: GOLD, fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(10px, 1.2vw, 11px)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '20px', display: 'block' }}
        >
          Urban Lifestyle
        </motion.span>

        <div style={{ overflow: 'hidden', marginBottom: '12px' }}>
          <motion.h2
            initial={{ y: '110%' }}
            animate={inView ? { y: '0%' } : {}}
            transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
            style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 900, color: CREAM, fontSize: 'clamp(36px, 6vw, 90px)', lineHeight: 1, margin: 0, letterSpacing: '-0.02em' }}
          >
            רוכבים<br /><span style={{ color: GOLD }}>בסטייל.</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
          style={{ width: '56px', height: '2px', backgroundColor: GOLD, transformOrigin: 'right', marginTop: '16px' }}
        />
      </div>
    </section>
  );
}

export function AtmosphereTwo() {
  const dir = useDir();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section style={{ position: 'relative', height: 'clamp(380px, 55vw, 680px)', overflow: 'hidden', backgroundColor: DARK }}>
      <ParallaxBg src="/assets/photo-black-detail.jpg" yRange={['10%', '-10%']} />

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(28,28,28,0.88) 0%, rgba(28,28,28,0.45) 55%, rgba(28,28,28,0.1) 100%)' }} />

      <div
        ref={ref}
        dir={dir}
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', padding: 'clamp(24px, 8vw, 120px)' }}
      >
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ color: GOLD, fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(10px, 1.2vw, 11px)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '20px', display: 'block', textAlign: 'start' }}
        >
          Single Speed
        </motion.span>

        <div style={{ overflow: 'hidden', marginBottom: '12px' }}>
          <motion.h2
            initial={{ y: '110%' }}
            animate={inView ? { y: '0%' } : {}}
            transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
            style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 900, color: CREAM, fontSize: 'clamp(36px, 6vw, 90px)', lineHeight: 1, margin: 0, letterSpacing: '-0.02em', textAlign: 'start' }}
          >
            העיר<br /><span style={{ color: GOLD }}>שלך.</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
          style={{ width: '56px', height: '2px', backgroundColor: GOLD, transformOrigin: 'left', marginTop: '16px' }}
        />
      </div>
    </section>
  );
}

export default function AtmosphereSection() {
  return <><AtmosphereOne /><AtmosphereTwo /></>;
}
