import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const DARK = '#1C1C1C';
const CREAM = '#EDEBE6';
const GOLD = '#C9A870';

export default function StoryBand() {
  return (
    <section
      dir="rtl"
      style={{ position: 'relative', backgroundColor: DARK, overflow: 'hidden' }}
      className="min-h-[70vh] lg:min-h-[82vh] flex items-center"
    >
      {/* Background photo */}
      <img
        src="/assets/for-hero.jpg"
        alt=""
        aria-hidden
        loading="lazy"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 60%',
        }}
      />
      {/* Scrim — darker on the right where the text sits (RTL) */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to left, rgba(15,14,12,0.78) 0%, rgba(15,14,12,0.55) 38%, rgba(15,14,12,0.15) 68%, rgba(15,14,12,0.05) 100%)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(15,14,12,0.45) 0%, transparent 30%)',
        }}
      />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl w-full px-6 lg:px-16 py-24 lg:py-32">
        <div style={{ maxWidth: '480px' }}>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            style={{
              fontFamily: "'Heebo', sans-serif", fontSize: '11px',
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: GOLD, display: 'block', marginBottom: '18px',
            }}
          >
            The Spinz Story
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Heebo', sans-serif", fontWeight: 800,
              fontSize: 'clamp(30px, 4.2vw, 52px)', color: CREAM,
              letterSpacing: '-0.02em', lineHeight: 1.12, margin: '0 0 20px',
            }}
          >
            שלושה חברים.
            <br />
            עיר אחת.
            <br />
            מטרה פשוטה — לרכוב.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.22 }}
            style={{
              fontFamily: "'Heebo', sans-serif", fontSize: '15.5px',
              color: 'rgba(237,235,230,0.78)', lineHeight: 1.8,
              margin: '0 0 34px',
            }}
          >
            Spinz נולדה מהרחובות של תל אביב — מתוך אמונה שאופניים טובים לא צריכים להיות מסובכים או יקרים. הם צריכים להיות יפים, אמינים, ופשוט כיף לרכוב עליהם.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.32 }}
          >
            <Link
              to="/story"
              style={{
                display: 'inline-block',
                fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: DARK, textDecoration: 'none',
                backgroundColor: CREAM,
                borderRadius: '8px',
                padding: '14px 36px',
                cursor: 'pointer',
                transition: 'background-color 0.25s, color 0.25s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.backgroundColor = GOLD; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.backgroundColor = CREAM; }}
            >
              לסיפור המלא
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
