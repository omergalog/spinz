import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DARK = '#1C1C1C';
const GOLD = '#C9A870';
const TEXT_LIGHT = '#EDEBE6';

export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: DARK,
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src="/assets/תמונות אורי/סרטון לאתר.mp4"
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.75,
        }}
      />

      {/* Overlay gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(
            180deg,
            ${DARK}CC 0%,
            ${DARK}44 40%,
            ${DARK}44 60%,
            ${DARK}CC 100%
          )`,
        }}
      />

      {/* Text overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{
            color: GOLD,
            fontFamily: "'Heebo', sans-serif",
            fontSize: '11px',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          Urban · Single Speed
        </motion.p>

        <div style={{ overflow: 'hidden' }}>
          <motion.h2
            initial={{ y: '110%' }}
            animate={visible ? { y: '0%' } : {}}
            transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.25 }}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: TEXT_LIGHT,
              fontSize: 'clamp(56px, 10vw, 120px)',
              lineHeight: 1,
              margin: 0,
              letterSpacing: '0.04em',
            }}
          >
            BUILT FOR THE CITY
          </motion.h2>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={visible ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.8, ease: [0.76, 0, 0.24, 1] }}
          style={{
            width: '60px',
            height: '2px',
            backgroundColor: GOLD,
            marginTop: '28px',
            transformOrigin: 'left',
          }}
        />
      </div>
    </section>
  );
}
