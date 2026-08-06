import { useT, useLang, localizePath, useDir } from '../i18n/LanguageContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Instagram, Bike, Coffee, MapPin, Handshake, ArrowLeft } from 'lucide-react';
import PageShell from '../components/PageShell';
import { COMPANY } from '../config/company';

const GOLD = '#C9A870';
const DARK = '#1C1C1C';
const CREAM = '#EDEBE6';
const MUTED = '#6A6862';

const INSTAGRAM_URL = 'https://instagram.com/spinz.bikes';

// Real photos from the launch shoot (Tel Aviv streets) — not fabricated UGC
const streetPhotos = [
  '/assets/gallery/g-59.jpg',
  '/assets/gallery/g-07.jpg',
  '/assets/gallery/g-17.jpg',
  '/assets/gallery/g-26.jpg',
  '/assets/gallery/g-51.jpg',
  '/assets/gallery/g-01.jpg',
];

export default function Community() {
  const dir = useDir();
  const t = useT();
  const lang = useLang();
  const c = t.pages.community;
  return (
    <PageShell
      eyebrow="The Spinz Community"
      title={c.title}
      subtitle={c.sub}
      heroImage="/assets/gallery/g-59.jpg"
      heroPosition="center 35%"
    >
      {/* ── Manifesto: split image + text ───────────────────────────── */}
      <section style={{ backgroundColor: '#F5F2EC', padding: 'clamp(56px, 9vw, 110px) clamp(20px, 6vw, 64px)' }} dir={dir}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 'clamp(28px, 5vw, 60px)', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            style={{ flex: '1 1 340px', minWidth: '300px' }}
          >
            <span style={{ display: 'block', marginBottom: '16px', fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#A79A82' }}>
              The Spinz Community
            </span>
            <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 4.5vw, 50px)', color: DARK, lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
              {c.buildingNow}<br /><span style={{ color: GOLD }}>{c.withYou}</span>
            </h2>
            <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(15px, 1.7vw, 17px)', color: MUTED, lineHeight: 1.9, margin: '0 0 16px' }}>
              {c.p1}
            </p>
            <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(15px, 1.7vw, 17px)', color: MUTED, lineHeight: 1.9, margin: 0 }}>
              {c.p2}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: '1 1 380px', minWidth: '300px', aspectRatio: '4 / 5', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#EDEAE4' }}
          >
            <img src="/assets/gallery/g-51.jpg" alt={c.heroAlt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>
        </div>
      </section>

      {/* ── Announcement: first community ride (coming soon) ─────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', backgroundColor: DARK, padding: 'clamp(64px, 10vw, 130px) clamp(20px, 6vw, 64px)' }} dir={dir}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '70%', background: 'radial-gradient(circle, rgba(201,168,112,0.16) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-25%', left: '-10%', width: '55%', height: '65%', background: 'radial-gradient(circle, rgba(201,168,112,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: '920px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px', flexWrap: 'wrap' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: DARK, backgroundColor: GOLD, borderRadius: '100px', padding: '5px 14px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: DARK, animation: 'spinzPulse 1.6s ease-in-out infinite' }} />
              {c.soon}
            </span>
            <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.32em', color: GOLD, fontWeight: 600 }}>
              FIRST COMMUNITY RIDE
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.05 }}
            style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 900, fontSize: 'clamp(30px, 6vw, 62px)', color: CREAM, lineHeight: 1.08, letterSpacing: '-0.02em', margin: '0 0 18px' }}
          >
            {c.prepPre} <span style={{ color: GOLD }}>{c.prepHighlight}</span>{c.prepPost}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
            style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'rgba(237,235,230,0.72)', lineHeight: 1.8, margin: '0 0 36px', maxWidth: '660px' }}
          >
            {c.prepBody}
          </motion.p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '40px' }}>
            {[Bike, Coffee, MapPin].map((Icon, i) => {
              const pillar = c.pillars[i];
              return (
                <motion.div
                  key={pillar.t}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,112,0.22)', borderRadius: '16px', padding: '22px' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '11px', backgroundColor: 'rgba(201,168,112,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, marginBottom: '14px' }}>
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '17px', color: CREAM, margin: '0 0 6px' }}>{pillar.t}</h3>
                  <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13.5px', color: 'rgba(237,235,230,0.62)', lineHeight: 1.65, margin: 0 }}>{pillar.s}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', justifyContent: 'space-between', borderTop: '1px solid rgba(201,168,112,0.2)', paddingTop: '28px' }}
          >
            <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: CREAM, margin: 0, fontWeight: 600 }}>
              {c.followFirst} <span aria-hidden>🚲</span>
            </p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: DARK, fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '14px', padding: '12px 24px', borderRadius: '100px', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              <Instagram size={17} /> {c.followCta}
            </a>
          </motion.div>
        </div>

        <style>{`@keyframes spinzPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.7); } }`}</style>
      </section>

      {/* ── On the streets (real photos) ────────────────────────────── */}
      <section style={{ backgroundColor: '#F5F2EC', padding: 'clamp(56px, 8vw, 96px) clamp(20px, 6vw, 64px)' }} dir={dir}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <span style={{ display: 'block', marginBottom: '10px', fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#A79A82' }}>
                On The Streets
              </span>
              <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 42px)', color: DARK, margin: 0, lineHeight: 1.1 }}>
                {c.fromStreets}
              </h2>
            </div>
            <Link to={localizePath("/gallery", lang)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, color: GOLD, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {c.toGallery} <ArrowLeft size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {streetPhotos.map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.5, delay: i * 0.05 }}
                style={{ aspectRatio: '1/1', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#EDEAE4' }}
              >
                <img src={src} alt={c.streetsAlt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </motion.div>
            ))}
          </div>

          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14.5px', color: MUTED, margin: '26px 0 0', textAlign: 'center', lineHeight: 1.8 }}>
            {c.tagUs1}{' '}
            <strong style={{ color: GOLD, direction: 'ltr', display: 'inline-block' }}>#SpinzBikes</strong>{' '}{c.tagUs2}
          </p>
        </div>
      </section>

      {/* ── Partnership invitation (honest, no fabricated partners) ──── */}
      <section style={{ backgroundColor: '#F0EDE6', padding: 'clamp(48px, 7vw, 84px) clamp(20px, 6vw, 64px)' }} dir={dir}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '13px', backgroundColor: '#FFFFFF', border: `1px solid ${GOLD}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, margin: '0 auto 18px' }}>
            <Handshake size={22} strokeWidth={1.8} />
          </div>
          <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 3.5vw, 36px)', color: DARK, margin: '0 0 14px', lineHeight: 1.2 }}>
            {c.partnerTitle}
          </h2>
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(15px, 1.6vw, 17px)', color: MUTED, lineHeight: 1.85, margin: '0 0 24px' }}>
            {c.partnerBody}
          </p>
          <a href={`mailto:${COMPANY.email}`} style={{ display: 'inline-block', backgroundColor: DARK, color: CREAM, fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '14px', padding: '13px 30px', borderRadius: '8px', textDecoration: 'none' }}>
            {c.partnerCta}
          </a>
        </div>
      </section>

      {/* ── Instagram CTA ───────────────────────────────────────────── */}
      <section style={{ backgroundColor: DARK, padding: 'clamp(48px, 7vw, 80px) clamp(20px, 6vw, 64px)', textAlign: 'center' }} dir={dir}>
        <Instagram size={36} color={GOLD} style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(22px, 3.5vw, 34px)', color: CREAM, margin: '0 0 12px' }}>
          {c.joinTitle}
        </h2>
        <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: 'rgba(237,235,230,0.6)', margin: '0 0 28px' }}>
          {c.joinBody}
        </p>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: GOLD, color: DARK, fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '15px', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none' }}
        >
          <Instagram size={18} /> @spinz.bikes
        </a>
      </section>
    </PageShell>
  );
}
