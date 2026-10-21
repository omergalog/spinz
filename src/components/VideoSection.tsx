import { useT } from '../i18n/LanguageContext';
import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DARK = '#1C1C1C';
const GOLD = '#C9A870';
const TEXT_LIGHT = '#EDEBE6';

export default function VideoSection() {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  // תמונת הפתיחה יושבת מתחת לסרטון, והסרטון שקוף ב-15% — בלי להסתיר אותה
  // היא נראתה דרכו כהשתקפות לאורך כל הנגינה. היא יורדת ברגע שהסרטון זז.
  const [playing, setPlaying] = useState(false);
  // הדפדפן חסם הפעלה אוטומטית (אייפון במצב חיסכון בסוללה). במקום הסרטון
  // מוצגת לולאה קצרה מאותו סרטון כתמונה מונפשת, שמתנגנת גם במצב הזה.
  const [blocked, setBlocked] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // נסיון הפעלה. NotAllowedError = הדפדפן לא מתיר הפעלה אוטומטית.
  const tryPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    // אייפון בודק את התכונה muted ולא רק את המאפיין. React מגדיר רק את
    // המאפיין, ולכן הסרטון עלול להיחשב "עם קול" ולא להתחיל לבד.
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted', '');
    v.play().then(() => setBlocked(false)).catch((e: DOMException) => {
      if (e?.name === 'NotAllowedError') setBlocked(true);
    });
  };

  useEffect(() => {
    // מנסים מיד בטעינה, ולא רק כשהמסגרת "נראית" — בטלפון הסרטון התחיל
    // רק אחרי גלילה.
    tryPlay();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          tryPlay();
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const text  = textRef.current;
    if (!video || !text) return;
    let raf: number;

    // Both cuts now start at 61.0s of the same master, so the headline fades
    // at the same moment of the footage on every screen size. (The mobile cut
    // used to start 6.5s later, which is why these were split.)
    const fadeStart = 11;
    const fadeEnd   = 15;

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

  // אייפון במצב חיסכון בסוללה (ו-Safari בכמה הגדרות נוספות) לא מפעיל
  // סרטון אוטומטית, גם בלי קול. נגיעה של המשתמש כן מתירה הפעלה, ולכן
  // הנגיעה הראשונה בדף מפעילה את הסרטון אם הוא עדיין עומד.
  useEffect(() => {
    const kick = () => {
      const v = videoRef.current;
      if (!v || !v.paused) { stop(); return; }
      const r = sectionRef.current?.getBoundingClientRect();
      if (r && r.bottom > 0 && r.top < window.innerHeight) {
        v.play().then(stop).catch(() => { /* ננסה בנגיעה הבאה */ });
      }
    };
    const stop = () => {
      document.removeEventListener('touchend', kick);
      document.removeEventListener('click', kick);
    };
    document.addEventListener('touchend', kick, { passive: true });
    document.addEventListener('click', kick);
    return stop;
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
      {/* כפתור הפליי שאייפון מצייר על סרטון עומד */}
      <style>{`.spinz-hero-video::-webkit-media-controls-start-playback-button{display:none!important;-webkit-appearance:none}.spinz-hero-video::-webkit-media-controls{display:none!important}`}</style>

      {/* Video */}
      <video
        className="spinz-hero-video"
        ref={videoRef}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        onPlaying={() => { setPlaying(true); setBlocked(false); }}
        onCanPlay={() => { if (!playing) tryPlay(); }}
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

      {/* תמונת פתיחה, ובחסימת הפעלה אוטומטית לולאה מונפשת. יושבת **מעל**
          הסרטון ומכסה אותו לגמרי (רקע כהה מלא) עד שהוא באמת זז: כשהיא
          הייתה מתחתיו, הסרטון העומד — שקוף ב-15% ועם כפתור הפליי של
          אייפון — נראה מעליה כהשתקפות. */}
      {!playing && (
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundColor: DARK }}>
          <picture>
            <source media="(max-width: 767px)" srcSet={blocked ? '/assets/hero-loop-mobile.webp' : '/assets/hero-poster-mobile.webp'} />
            <img
              src="/assets/hero-poster.webp"
              alt=""
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center center', opacity: 0.85,
              }}
            />
          </picture>
        </div>
      )}


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
            fontSize: '11px',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          Urban · Single Speed
        </motion.p>

        <div style={{ overflow: 'hidden' }}>
          {/* h1 ולא h2: זו הכותרת הראשית של דף הבית, והיחידה בו. */}
          <motion.h1
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
            SPINZ. MORE THAN A BIKE
          </motion.h1>
        </div>

      </div>

      {/* Mute/Unmute button */}
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute',
          // The floating WhatsApp button sits at bottom:24px/left:24px and is
          // 48px tall, so this clears it (and rides along when the cookie
          // banner lifts it) instead of hiding underneath.
          bottom: 'calc(84px + var(--fab-lift, 0px))',
          left: '24px',
          zIndex: 3,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(8px)',
          border: `1px solid rgba(255,255,255,0.2)`,
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: TEXT_LIGHT,
          transition: 'background 0.2s',
        }}
        title={muted ? t.video.unmute : t.video.mute}
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
