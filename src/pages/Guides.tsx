import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { getGuides } from '../data/guides';
import { useT, useLang, localizePath } from '../i18n/LanguageContext';

const GOLD = '#C9A870';
const DARK = '#1C1C1C';
const MUTED = '#6A6862';
const BORDER = '#E0DCD4';

export default function Guides() {
  const t = useT();
  const lang = useLang();
  const guides = getGuides(lang);
  return (
    <PageShell
      eyebrow="Guides & Tips"
      title={t.pages.guides.title}
      subtitle={t.pages.guides.sub}
      heroImage="/assets/lifestyle-hero.jpg"
      heroPosition="center 35%"
    >
      <section style={{ backgroundColor: '#F5F2EC', padding: 'clamp(48px, 8vw, 88px) clamp(20px, 6vw, 64px)' }} dir="rtl">
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px' }}>
          {guides.map((g, i) => {
            const Icon = g.icon;
            return (
              <motion.div
                key={g.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
              >
                <Link
                  to={localizePath(`/guides/${g.slug}`, lang)}
                  className="guide-card"
                  style={{
                    display: 'block', backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`,
                    borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', height: '100%',
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden' }}>
                    <img
                      src={g.heroImage}
                      alt={g.title}
                      loading="lazy"
                      className="guide-card-img"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: g.heroPosition ?? 'center' }}
                    />
                    <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,14,12,0.4) 0%, transparent 55%)' }} />
                    <div style={{
                      position: 'absolute', top: '14px', insetInlineEnd: '14px',
                      width: '40px', height: '40px', borderRadius: '11px',
                      backgroundColor: 'rgba(245,242,236,0.92)', backdropFilter: 'blur(4px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD,
                    }}>
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                  </div>

                  {/* Text */}
                  <div style={{ padding: '20px 22px 24px' }}>
                    <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A79A82', marginBottom: '8px' }}>
                      {g.readTime}
                    </div>
                    <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '19px', color: DARK, margin: '0 0 8px', lineHeight: 1.3 }}>
                      {g.title}
                    </h2>
                    <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: MUTED, margin: '0 0 14px', lineHeight: 1.65 }}>
                      {g.summary}
                    </p>
                    <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13.5px', fontWeight: 700, color: GOLD }}>
                      {t.pages.guides.read}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <style>{`
        .guide-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .guide-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.10); }
        .guide-card-img { transition: transform 0.5s ease; }
        .guide-card:hover .guide-card-img { transform: scale(1.05); }
      `}</style>
    </PageShell>
  );
}
