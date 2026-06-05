import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DARK = '#1C1C1C';
const GOLD = '#C9A870';
const TEXT_LIGHT = '#EDEBE6';

export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const textRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const video = videoRef.current;
    const text  = textRef.current;
    if (!video || !text) return;
    let raf: number;

    const isMobile = window.innerWidth < 768;
    const fadeStart = isMobile ? 6.3 : 11;
    const fadeEnd   = isMobile ? 8.3 : 15;

    const tick = () => {
      const t = video.currentTime;
      let opacity: number;
      let translateY: number;
      let blur: number;

      if (t < fadeStart) {
        opacity = 1; translateY = 0; blur = 0;
      } else if (t >= fadeEnd) {
        opacity = 0; translateY = -32; blur = 8;
      } else {
        const p = (t - fadeStart) / (fadeEnd - fadeStart);
        const ease = p * p * p;
        opacity    = 1 - ease;
        translateY = ease * -32;
        blur       = ease * 8;
      }

      text.style.opacity   = String(opacity);
      text.style.transform = `translateY(${translateY}px)`;
      text.style.filter    = `blur(${blur}px)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(m => !m);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="h-screen"
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: DARK,
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          opacity: 0.85,
        }}
      >
        <source media="(max-width: 767px)" src="/assets/spinz-mobile.mp4" type="video/mp4" />
        <source src="/assets/spinz-video-compressed.mp4" type="video/mp4" />
      </video>

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
        ref={textRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 24px',
          willChange: 'opacity, transform, filter',
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{
            color: GOLD,
            fontFamily: "'Heebo', sans-serif",
            fontSize: 'clamp(10px, 1.5vw, 11px)',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            marginBottom: '16px',
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
              fontSize: 'clamp(36px, 10vw, 120px)',
              lineHeight: 1,
              margin: 0,
              letterSpacing: '0.04em',
            }}
          >
            BUILT FOR THE CITY
          </motion.h2>
        </div>

      </div>

      {/* Mute/Unmute button */}
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(8px)',
          border: `1px solid rgba(255,255,255,0.2)`,
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: TEXT_LIGHT,
          transition: 'background 0.2s',
        }}
        title={muted ? 'הפעל סאונד' : 'השתק'}
      >
        {muted ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        )}
      </button>
    </section>
  );
}
