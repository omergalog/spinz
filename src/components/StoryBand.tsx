import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const DARK = '#1C1C1C';
const CREAM = '#EDEBE6';
const GOLD = '#C9A870';

export default function StoryBand() {
  return (
    <section dir="rtl" style={{ backgroundColor: DARK }} className="py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '11px',
            letterSpacing: '0.4em', textTransform: 'uppercase',
            color: GOLD, display: 'block', marginBottom: '16px',
          }}
        >
          The Spinz Story
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            fontFamily: "'Heebo', sans-serif", fontWeight: 800,
            fontSize: 'clamp(26px, 4vw, 44px)', color: CREAM,
            letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 20px',
          }}
        >
          שלושה חברים. עיר אחת.<br />מטרה פשוטה — לרכוב.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '15px',
            color: '#9A9690', lineHeight: 1.8, margin: '0 auto 32px', maxWidth: '520px',
          }}
        >
          Spinz נולדה מהרחובות של תל אביב — מתוך אמונה שאופניים טובים לא צריכים להיות מסובכים או יקרים. הם צריכים להיות יפים, אמינים, ופשוט כיף לרכוב עליהם.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Link
            to="/story"
            style={{
              display: 'inline-block',
              fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: CREAM, textDecoration: 'none',
              border: `1px solid ${GOLD}`, borderRadius: '8px',
              padding: '13px 34px',
              transition: 'background-color 0.25s, color 0.25s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.backgroundColor = GOLD; el.style.color = DARK; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.backgroundColor = 'transparent'; el.style.color = CREAM; }}
          >
            לסיפור המלא
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
