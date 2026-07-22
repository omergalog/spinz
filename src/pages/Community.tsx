import { motion } from 'framer-motion';
import { Instagram, Calendar, Handshake, Camera, Coffee, Bike, MapPin } from 'lucide-react';
import PageShell from '../components/PageShell';
import { COMPANY } from '../config/company';

const GOLD = '#C9A870';
const DARK = '#1C1C1C';
const MUTED = '#6A6862';
const BORDER = '#E0DCD4';
const CARD = '#FFFFFF';

const INSTAGRAM_URL = 'https://instagram.com/spinz.bikes';

// Placeholder UGC images – replace with real customer photos
const ugc = [
  '/assets/gallery-1.jpg',
  '/assets/gallery-2.jpg',
  '/assets/gallery-3.jpg',
  '/assets/gallery-4.jpg',
  '/assets/gallery-5.jpg',
  '/assets/gallery-6.jpg',
];

const partners = [
  { name: 'קפה רוטשילד', desc: 'נקודת מפגש לרוכבים בלב העיר – הנחה לבעלי Spinz.' },
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
      subtitle="Spinz זה לא רק אופניים – זו קהילה של אנשים שאוהבים את העיר ואת הרכיבה בה."
      heroImage="/assets/photo-olive-lifestyle.jpg"
      heroPosition="center 45%"
    >
      {/* Big announcement – first community ride event */}
      <section style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#1C1C1C', padding: 'clamp(64px, 10vw, 130px) clamp(20px, 6vw, 64px)' }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '70%', background: 'radial-gradient(circle, rgba(201,168,112,0.16) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-25%', left: '-10%', width: '55%', height: '65%', background: 'radial-gradient(circle, rgba(201,168,112,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: '920px', margin: '0 auto' }}>
          {/* Kicker */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px', flexWrap: 'wrap' }}
          >
            <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.32em', color: GOLD, fontWeight: 600 }}>
              THE SPINZ COMMUNITY
            </span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: GOLD, opacity: 0.5 }} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: DARK, backgroundColor: GOLD, borderRadius: '100px', padding: '5px 14px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: DARK, animation: 'spinzPulse 1.6s ease-in-out infinite' }} />
              יש למה לחכות!
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.05 }}
            style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 900, fontSize: 'clamp(30px, 6vw, 64px)', color: '#EDEBE6', lineHeight: 1.08, letterSpacing: '-0.02em', margin: '0 0 10px' }}
          >
            מכינים לכם <span style={{ color: GOLD }}>משהו גדול</span>.<br />
            אירוע רכיבה קהילתי ראשון מסוגו.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(15px, 1.8vw, 19px)', color: 'rgba(237,235,230,0.82)', lineHeight: 1.75, margin: '0 0 14px', maxWidth: '660px' }}
          >
            קהילת SPINZ היקרה – הגיע הזמן לקחת את האהבה המשותפת שלנו לעיר ולרכיבה צעד אחד קדימה.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.22 }}
            style={{ fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(14px, 1.5vw, 16px)', color: 'rgba(237,235,230,0.6)', lineHeight: 1.85, margin: '0 0 36px', maxWidth: '660px' }}
          >
            זה לא הולך להיות עוד סתם מסלול. אנחנו מתכננים שילוב מושלם של תנועה, סטייל ואווירה עירונית כמו שרק אנחנו יודעים לייצר – ובסוף, כמו שאתם כבר יודעים, SPINZ זה לא רק אופניים. זו קהילה של אנשים שאוהבים את הדופק של העיר, את החופש שברכיבה ואת החיבורים שנוצרים על הדרך.
          </motion.p>

          {/* Three concept pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '40px' }}>
            {[
              { icon: Bike, title: 'רכיבה משותפת', body: 'יוצאים יחד לרחובות העיר – בקצב שלנו, בסטייל שלנו.' },
              { icon: Coffee, title: 'עוצרים ליהנות', body: 'מתחילים ומסיימים במפגשים פתוחים בבתי הקפה והברים הכי שווים בעיר.' },
              { icon: MapPin, title: 'מתחברים על הדרך', body: 'המקומות שבהם אפשר להוריד קצב, לשתות משהו טוב ופשוט לדבר.' },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,112,0.22)', borderRadius: '16px', padding: '22px' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '11px', backgroundColor: 'rgba(201,168,112,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, marginBottom: '14px' }}>
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '17px', color: '#EDEBE6', margin: '0 0 6px' }}>{c.title}</h3>
                  <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13.5px', color: 'rgba(237,235,230,0.62)', lineHeight: 1.65, margin: 0 }}>{c.body}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Coming soon footer line */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', justifyContent: 'space-between', borderTop: '1px solid rgba(201,168,112,0.2)', paddingTop: '28px' }}
          >
            <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: '#EDEBE6', margin: 0, fontWeight: 600 }}>
              הפרטים המלאים, המיקומים והתאריכים – ייחשפו ממש בקרוב <span aria-hidden>🚲✨</span>
            </p>
            <a
              href="https://instagram.com/spinz.bikes"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: DARK, fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '14px', padding: '12px 24px', borderRadius: '100px', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              <Instagram size={17} /> עקבו כדי לא לפספס
            </a>
          </motion.div>

          {/* Hashtag reminder */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.38 }}
            style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: 'rgba(237,235,230,0.55)', lineHeight: 1.7, margin: '24px 0 0' }}
          >
            בינתיים – אל תשכחו להמשיך לתייג אותנו ברכיבות שלכם <strong style={{ color: GOLD, direction: 'ltr', display: 'inline-block' }}>#SpinzBikes</strong> כדי להופיע אצלנו באתר. נתראה ברחובות!
          </motion.p>
        </div>

        <style>{`@keyframes spinzPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.7); } }`}</style>
      </section>

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
            רוצים להיות שותפים? כתבו לנו ב-<a href={`mailto:${COMPANY.email}`} style={{ color: GOLD, display: 'inline-block', padding: '10px 0' }}>{COMPANY.email}</a>
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
