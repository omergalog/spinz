import { motion } from 'framer-motion';

const DARK       = '#1C1C1C';
const LIGHT      = '#F5F2EC';
const GOLD       = '#C9A870';
const TEXT_LIGHT = '#EDEBE6';

export default function Hero() {
  return (
    <section
      className="relative flex h-[68vh] md:min-h-screen flex-col overflow-hidden"
      style={{ backgroundColor: DARK }}
    >
      {/* Background photo with dark overlay */}
      <div className="absolute inset-0">
        <img
          src="/assets/hero-bike.jpg"
          alt=""
          className="h-full w-full object-cover"
          style={{ opacity: 0.28 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${DARK}BB 0%, ${DARK}DD 60%, ${DARK} 100%)`,
          }}
        />
      </div>

      {/* Navbar spacer — always pushes content below navbar */}
      <div className="h-16 md:h-20 flex-shrink-0" />

      {/* Content — centered in remaining space */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6 pb-6">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="hero-label"
          style={{
            color: GOLD,
            fontFamily: "'Heebo', sans-serif",
            textTransform: 'uppercase',
          }}
        >
          Single Speed Urban Bikes
        </motion.p>

        {/* SPINZ — line reveal */}
        <div style={{ overflow: 'hidden' }}>
          <motion.h1
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.25 }}
            className="hero-spinz"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: TEXT_LIGHT,
              margin: 0,
            }}
          >
            SPIN<span style={{ color: GOLD }}>Z</span>
          </motion.h1>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.95 }}
          style={{
            color: `${TEXT_LIGHT}99`,
            fontFamily: "'Heebo', sans-serif",
            fontSize: 'clamp(15px, 1.8vw, 20px)',
            fontWeight: 300,
            marginTop: '24px',
          }}
        >
          משלמים על האופניים, לא על החנות ברוטשילד
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '40px', flexWrap: 'wrap', justifyContent: 'center' }}
          dir="rtl"
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
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = '#B8933A';
              el.style.transform = 'translateY(2px)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = GOLD;
              el.style.transform = 'translateY(0)';
            }}
          >
            גלה מודלים
          </a>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
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
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = `${TEXT_LIGHT}90`;
              el.style.color = LIGHT;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = `${TEXT_LIGHT}40`;
              el.style.color = TEXT_LIGHT;
            }}
          >
            צור קשר
          </a>
        </motion.div>
      </div>

    </section>
  );
}
