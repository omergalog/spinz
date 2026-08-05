import { useT, useLang, localizePath } from '../i18n/LanguageContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const GOLD = '#C9A870';
const DARK = '#1C1C1C';
const MUTED = '#6A6862';
const BORDER = '#E0DCD4';
const CARD = '#FFFFFF';

const sizeMeta = [
  {
    id: '54',
    name: 'SPINZ 54',
  },
  {
    id: '57',
    name: 'SPINZ 57',
  },
];

const colorMeta = [
  { id: 'mat',   hex: '#1A1A1A', img: '/assets/bike-mat-new.png' },
  { id: 'beige',       hex: '#C4A882', img: '/assets/bike-beige-new.png' },
  { id: 'olive',  hex: '#7D9168', img: '/assets/bike-olive-new.png' },
];

export default function SizesColors() {
  const t = useT();
  const lang = useLang();
  const sz = t.pages.sizes;
  const sizes = sizeMeta.map((m, i) => ({ ...m, ...sz.items[i] }));
  const colors = colorMeta.map(c => ({
    ...c,
    label: t.product.colors[c.id as keyof typeof t.product.colors],
    desc: sz.colorDesc[c.id as keyof typeof sz.colorDesc],
  }));
  return (
    <PageShell
      eyebrow="Fit & Finish"
      title={sz.title}
      subtitle={sz.sub}
      heroImage="/assets/photo-black-detail.jpg"
      heroPosition="center 40%"
    >
      {/* Sizes */}
      <section style={{ backgroundColor: '#F5F2EC', padding: 'clamp(56px, 8vw, 96px) clamp(20px, 6vw, 64px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 4vw, 40px)', color: DARK, margin: '0 0 8px' }}>
            {sz.sizesTitle}
          </h2>
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: MUTED, margin: '0 0 40px' }}>
            {sz.sizesIntro}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {sizes.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '18px', padding: '32px' }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '26px', color: DARK, margin: 0 }}>{s.name}</h3>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700, color: GOLD, letterSpacing: '0.1em' }}>{s.label}</span>
                </div>
                <div style={{ display: 'inline-block', backgroundColor: '#F5F2EC', borderRadius: '8px', padding: '8px 16px', marginBottom: '18px' }}>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 600, color: DARK }}>{sz.riderHeight} {s.height}</span>
                </div>
                <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: MUTED, lineHeight: 1.75, margin: 0 }}>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Colors */}
      <section style={{ backgroundColor: '#F5F2EC', padding: 'clamp(56px, 8vw, 96px) clamp(20px, 6vw, 64px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 4vw, 40px)', color: DARK, margin: '0 0 8px' }}>
            {sz.colorsTitle}
          </h2>
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: MUTED, margin: '0 0 48px' }}>
            {sz.colorsIntro}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {colors.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                style={{
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(20px, 4vw, 48px)',
                  backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '18px',
                  padding: 'clamp(20px, 3vw, 32px)', overflow: 'hidden',
                }}
              >
                <div style={{ flex: '1 1 240px', minWidth: '200px', textAlign: 'center' }}>
                  <img src={c.img} alt={c.label} style={{ width: '100%', maxWidth: '320px', height: 'auto', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: '2 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: c.hex, border: `2px solid ${BORDER}`, flexShrink: 0 }} />
                    <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '24px', color: DARK, margin: 0 }}>{c.label}</h3>
                  </div>
                  <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: MUTED, lineHeight: 1.75, margin: 0 }}>{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <Link
              to={localizePath("/bikes", lang)}
              style={{
                display: 'inline-block', backgroundColor: GOLD, color: DARK,
                fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '15px',
                padding: '14px 36px', borderRadius: '8px', textDecoration: 'none', letterSpacing: '0.05em',
              }}
            >
              {sz.cta}
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
