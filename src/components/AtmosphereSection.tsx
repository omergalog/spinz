import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

const GOLD  = '#C9A870';
const DARK  = '#1C1C1C';
const CREAM = '#EDEBE6';

function ParallaxImage({ src, yRange }: { src: string; yRange: [string, string] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], yRange);

  return (
    <div ref={ref} style={{ position: 'absolute', inset: '-12% 0', overflow: 'hidden' }}>
      <motion.div
        style={{
          y,
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </div>
  );
}

export default function AtmosphereSection() {
  const textRef1 = useRef<HTMLDivElement>(null);
  const textRef2 = useRef<HTMLDivElement>(null);
  const inView1 = useInView(textRef1, { once: true, margin: '-100px' });
  const inView2 = useInView(textRef2, { once: true, margin: '-100px' });

  return (
    <section style={{ backgroundColor: DARK }}>

      {/* תמונה 1 — טקסט משמאל */}
      <div style={{ position: 'relative', height: 'clamp(420px, 60vw, 720px)', overflow: 'hidden' }}>
        <ParallaxImage src="/assets/atmosphere-1.png" yRange={['-10%', '10%']} />

        {/* Gradient overlay — כהה מימין */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(28,28,28,0.85) 0%, rgba(28,28,28,0.4) 50%, rgba(28,28,28,0.1) 100%)',
        }} />

        {/* Content */}
        <div
          ref={textRef1}
          dir="rtl"
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center',
            padding: 'clamp(24px, 6vw, 100px)',
          }}
        >
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={inView1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            style={{ color: GOLD, fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '20px', display: 'block' }}
          >
            Urban Lifestyle
          </motion.span>

          <div style={{ overflow: 'hidden', marginBottom: '16px' }}>
            <motion.h2
              initial={{ y: '110%' }}
              animate={inView1 ? { y: '0%' } : {}}
              transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                color: CREAM,
                fontSize: 'clamp(48px, 7vw, 100px)',
                lineHeight: 0.95,
                margin: 0,
                letterSpacing: '0.02em',
              }}
            >
              רוכבים<br />
              <span style={{ color: GOLD }}>בסטייל</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView1 ? { scaleX: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
            style={{ width: '56px', height: '2px', backgroundColor: GOLD, transformOrigin: 'right', marginTop: '8px' }}
          />
        </div>

        {/* Gold bottom line */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(to right, ${GOLD}88, transparent)` }} />
      </div>

      {/* תמונה 2 — טקסט מימין */}
      <div style={{ position: 'relative', height: 'clamp(420px, 60vw, 720px)', overflow: 'hidden' }}>
        <ParallaxImage src="/assets/atmosphere-2.png" yRange={['10%', '-10%']} />

        {/* Gradient overlay — כהה משמאל */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to left, rgba(28,28,28,0.85) 0%, rgba(28,28,28,0.4) 50%, rgba(28,28,28,0.1) 100%)',
        }} />

        {/* Content */}
        <div
          ref={textRef2}
          dir="rtl"
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end',
            padding: 'clamp(24px, 6vw, 100px)',
          }}
        >
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={inView2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            style={{ color: GOLD, fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '20px', display: 'block', textAlign: 'left' }}
          >
            Single Speed
          </motion.span>

          <div style={{ overflow: 'hidden', marginBottom: '16px' }}>
            <motion.h2
              initial={{ y: '110%' }}
              animate={inView2 ? { y: '0%' } : {}}
              transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                color: CREAM,
                fontSize: 'clamp(48px, 7vw, 100px)',
                lineHeight: 0.95,
                margin: 0,
                letterSpacing: '0.02em',
                textAlign: 'left',
              }}
            >
              THE CITY<br />
              <span style={{ color: GOLD }}>IS YOURS</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView2 ? { scaleX: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
            style={{ width: '56px', height: '2px', backgroundColor: GOLD, transformOrigin: 'left', marginTop: '8px' }}
          />
        </div>
      </div>

    </section>
  );
}
