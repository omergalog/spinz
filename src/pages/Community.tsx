import { motion } from 'framer-motion';
import { Instagram, Calendar, Handshake, Camera } from 'lucide-react';
import PageShell from '../components/PageShell';

const GOLD = '#C9A870';
const DARK = '#1C1C1C';
const MUTED = '#6A6862';
const BORDER = '#E0DCD4';
const CARD = '#FFFFFF';

const INSTAGRAM_URL = 'https://instagram.com/spinz.bikes';

// Placeholder UGC images — replace with real customer photos
const ugc = [
  '/assets/gallery-1.jpg',
  '/assets/gallery-2.jpg',
  '/assets/gallery-3.jpg',
  '/assets/gallery-4.jpg',
  '/assets/gallery-5.jpg',
  '/assets/gallery-6.jpg',
];

const partners = [
  { name: 'קפה רוטשילד', desc: 'נקודת מפגש לרוכבים בלב העיר — הנחה לבעלי Spinz.' },
  { name: 'סדנת אופניים תל אביב', desc: 'שירות ותחזוקה מקצועי לכל דגמי Spinz.' },
  { name: 'Urban Ride Club', desc: 'קהילת רוכבים עירונית עם רכיבות שבועיות.' },
];

const events = [
  { date: 'כל שישי', title: 'רכיבת בוקר קבוצתית', place: 'נמל תל אביב, 07:30' },
  { date: 'אחת לחודש', title: 'Spinz Sunset Ride', place: 'טיילת תל אביב–יפו' },
  { date: 'בקרוב', title: 'אירוע השקת קולקציית 2026', place: 'פרטים בקרוב' },
];

export default function Community() {
  return (
    <PageShell
      eyebrow="The Spinz Community"
      title="קהילה."
      subtitle="Spinz זה לא רק אופניים — זו קהילה של אנשים שאוהבים את העיר ואת הרכיבה בה."
    >
      {/* UGC */}
      <section style={{ backgroundColor: '#F5F2EC', padding: 'clamp(56px, 8vw, 96px) clamp(20px, 6vw, 64px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Camera size={22} color={GOLD} />
            <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 4vw, 38px)', color: DARK, margin: 0 }}>הרוכבים שלנו</h2>
          </div>
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: MUTED, margin: '0 0 36px' }}>
            תייגו אותנו <strong style={{ color: GOLD }}>#SpinzBikes</strong> ותופיעו כאן.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {ugc.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                style={{ aspectRatio: '1/1', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#EDEAE4' }}
              >
                <img src={src} alt="Spinz rider" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section style={{ backgroundColor: '#1C1C1C', padding: 'clamp(56px, 8vw, 96px) clamp(20px, 6vw, 64px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
            <Calendar size={22} color={GOLD} />
            <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 4vw, 38px)', color: '#EDEBE6', margin: 0 }}>אירועים ורכיבות</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {events.map((ev, i) => (
              <motion.div
                key={ev.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', backgroundColor: '#242424', border: '1px solid #2F2F2F', borderRadius: '14px', padding: '20px 24px' }}
              >
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700, color: DARK, backgroundColor: GOLD, borderRadius: '6px', padding: '6px 14px', minWidth: '90px', textAlign: 'center' }}>{ev.date}</span>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '18px', color: '#EDEBE6', margin: '0 0 2px' }}>{ev.title}</h3>
                  <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: 'rgba(237,235,230,0.6)', margin: 0 }}>{ev.place}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section style={{ backgroundColor: '#F5F2EC', padding: 'clamp(56px, 8vw, 96px) clamp(20px, 6vw, 64px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
            <Handshake size={22} color={GOLD} />
            <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 4vw, 38px)', color: DARK, margin: 0 }}>השותפים שלנו</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {partners.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '28px' }}
              >
                <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '18px', color: DARK, margin: '0 0 8px' }}>{p.name}</h3>
                <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: MUTED, lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: MUTED, margin: '28px 0 0', textAlign: 'center' }}>
            רוצים להיות שותפים? כתבו לנו ב-<a href="mailto:spinz.bikes@gmail.com" style={{ color: GOLD }}>spinz.bikes@gmail.com</a>
          </p>
        </div>
      </section>

      {/* Instagram CTA */}
      <section style={{ backgroundColor: '#1C1C1C', padding: 'clamp(48px, 7vw, 80px) clamp(20px, 6vw, 64px)', textAlign: 'center' }}>
        <Instagram size={36} color={GOLD} style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(22px, 3.5vw, 34px)', color: '#EDEBE6', margin: '0 0 12px' }}>
          עקבו אחרינו
        </h2>
        <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: 'rgba(237,235,230,0.6)', margin: '0 0 28px' }}>
          תמונות, רכיבות וכל מה שקורה בקהילת Spinz.
        </p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: GOLD, color: DARK, fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '15px', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none' }}
        >
          <Instagram size={18} /> @spinz.bikes
        </a>
      </section>
    </PageShell>
  );
}
