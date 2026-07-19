import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const DARK = '#1C1C1C';
const MUTED = '#6A6862';
const GOLD = '#C9A870';

const cards = [
  {
    to: '/guides',
    kicker: 'Know-How',
    title: 'מדריכים',
    text: 'תחזוקה, התאמת מידה ורכיבה בטוחה בעיר',
    image: '/assets/lifestyle-hero.jpg',
    position: 'center',
  },
  {
    to: '/gallery',
    kicker: 'The Streets',
    title: 'גלריה',
    text: 'האופניים בשטח, מהרחובות של תל אביב',
    image: '/assets/photo-black-detail.jpg',
    position: 'center',
  },
  {
    to: '/community',
    kicker: 'Ride Together',
    title: 'קהילה',
    text: 'רכיבות משותפות ואנשים שחיים את העיר',
    image: '/assets/photo-olive-lifestyle.jpg',
    position: 'center',
  },
];

export default function ExploreStrip() {
  return (
    <section dir="rtl" style={{ backgroundColor: '#F5F2EC' }} className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">

        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            gap: '16px', marginBottom: '32px',
          }}
        >
          <div>
            <span style={{
              fontFamily: "'Heebo', sans-serif", fontSize: '11px',
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: MUTED, display: 'block', marginBottom: '10px',
            }}>
              עוד ב-Spinz
            </span>
            <h2 style={{
              fontFamily: "'Heebo', sans-serif", fontWeight: 800,
              fontSize: 'clamp(24px, 3.5vw, 38px)', color: DARK,
              letterSpacing: '-0.02em', margin: 0,
            }}>
              לא רק אופניים
            </h2>
          </div>
          <div aria-hidden style={{ flex: 1, height: '1px', backgroundColor: '#DDD8D0', marginBottom: '10px' }} className="hidden md:block" />
        </motion.div>

        {/* Image cards — swipeable carousel on mobile, 3-col grid on desktop */}
        <motion.div
          className="explore-scroll flex md:grid md:grid-cols-3 gap-4 lg:gap-5 overflow-x-auto md:overflow-visible snap-x snap-proximity overscroll-x-contain -mx-6 px-6 md:mx-0 md:px-0"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <style>{`.explore-scroll::-webkit-scrollbar { display: none; }`}</style>
          {cards.map(({ to, kicker, title, text, image, position }) => (
            <div
              key={to}
              className="snap-start shrink-0 w-[82%] sm:w-[70%] md:w-auto md:shrink"
            >
              <Link
                to={to}
                className="explore-card group"
                style={{
                  position: 'relative',
                  display: 'block',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  aspectRatio: '4 / 5',
                  backgroundColor: DARK,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                {/* Photo */}
                <img
                  src={image}
                  alt={title}
                  loading="lazy"
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: position,
                    transition: 'transform 1.1s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  className="group-hover:scale-[1.06]"
                />

                {/* Gradient scrim */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(15,14,12,0.82) 0%, rgba(15,14,12,0.28) 45%, rgba(15,14,12,0.05) 70%, rgba(15,14,12,0.18) 100%)',
                    transition: 'opacity 0.4s',
                  }}
                />

                {/* Kicker — top */}
                <span style={{
                  position: 'absolute', top: '20px', right: '22px',
                  fontFamily: "'Heebo', sans-serif", fontSize: '11px', fontWeight: 600,
                  letterSpacing: '0.35em', textTransform: 'uppercase',
                  color: 'rgba(237,235,230,0.85)',
                }}>
                  {kicker}
                </span>

                {/* Text — bottom */}
                <div style={{
                  position: 'absolute', right: '22px', left: '22px', bottom: '22px',
                }}>
                  <h3 style={{
                    fontFamily: "'Heebo', sans-serif", fontWeight: 800,
                    fontSize: 'clamp(24px, 2.4vw, 32px)', color: '#EDEBE6',
                    letterSpacing: '-0.01em', margin: '0 0 6px', lineHeight: 1.1,
                  }}>
                    {title}
                  </h3>
                  <p style={{
                    fontFamily: "'Heebo', sans-serif", fontSize: '13.5px',
                    color: 'rgba(237,235,230,0.75)', lineHeight: 1.55, margin: '0 0 14px',
                    maxWidth: '260px',
                  }}>
                    {text}
                  </p>
                  <span
                    className="explore-cta"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '7px',
                      fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: GOLD,
                    }}
                  >
                    גלו עוד
                    <ArrowLeft size={14} style={{ transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }} className="group-hover:-translate-x-1" />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
