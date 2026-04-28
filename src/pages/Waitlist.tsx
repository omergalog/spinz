import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { supabase } from '../lib/supabase';
import CustomCursor from '../components/CustomCursor';

const GOLD   = '#C9A870';
const DARK   = '#1C1C1C';
const CREAM  = '#EDEBE6';
const MUTED  = '#888888';
const BORDER = '#2A2A2A';

const COLORS = [
  { name: 'שחור מאט', nameEn: 'Matte Black', hex: '#2A2A2A', border: '#555' },
  { name: 'ירוק זית',  nameEn: 'Olive Green',  hex: '#5C6A3E', border: '#7A8A52' },
  { name: "בז'",       nameEn: 'Beige',         hex: '#C8B99A', border: '#A89070' },
];

const HIGHLIGHTS = [
  { label: 'שלדה',        labelEn: 'Frame',     value: 'אלומיניום',    valueEn: 'Aluminium' },
  { label: 'מזלג',        labelEn: 'Fork',      value: 'פלדה',         valueEn: 'Steel' },
  { label: 'צמיגים',      labelEn: 'Tires',     value: 'Kenda 32mm',   valueEn: 'Kenda 32mm' },
  { label: 'גלגל שיניים', labelEn: 'Chainring', value: '46T',          valueEn: '46T' },
  { label: 'חישוקים',     labelEn: 'Rims',      value: 'פרופיל 30mm',  valueEn: '30mm profile' },
  { label: 'מושב',        labelEn: 'Saddle',    value: 'Quick Release', valueEn: 'Quick Release' },
];

const SIZES = [
  { size: '54"', desc: '160–175 ס"מ', descEn: 'Fits 160–175 cm' },
  { size: '57"', desc: '175–190 ס"מ', descEn: 'Fits 175–190 cm' },
];

function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export default function Waitlist() {
  const [name, setName]       = useState('');
  const [contact, setContact] = useState('');
  const [color, setColor]     = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  const submit = async () => {
    if (!name.trim() || !contact.trim()) { setError('יש למלא שם ואמצעי קשר'); return; }
    setLoading(true);
    setError('');
    const isEmail = contact.includes('@');
    const message = `[Waitlist]${color ? ` · צבע: ${color}` : ''}`;
    const { error: err } = await supabase.from('leads').insert([{
      name: name.trim(),
      email: isEmail ? contact.trim() : null,
      phone: !isEmail ? contact.trim() : null,
      message,
      status: 'new',
    }]);
    setLoading(false);
    if (err) { setError('שגיאה בשליחה, נסה שוב'); return; }
    setDone(true);
  };

  return (
    <div style={{ backgroundColor: DARK, minHeight: '100vh', fontFamily: "'Heebo', sans-serif", cursor: 'none' }} dir="rtl">
      <CustomCursor />

      <style>{`
        @keyframes kenburns {
          from { transform: scale(1.08); }
          to   { transform: scale(1.0); }
        }
        @media (max-width: 600px) {
          .wl-specs-grid { grid-template-columns: 1fr !important; }
          .wl-sizes-grid { flex-direction: column !important; }
          .wl-colors-row { flex-direction: column !important; gap: 16px !important; }
          .wl-hero-text  { padding: 0 20px !important; bottom: 10% !important; }
          .wl-section    { padding: 48px 20px !important; }
          .wl-form       { padding: 48px 20px 72px !important; }
          .wl-spec-item  { padding-left: 0 !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', height: '100svh', minHeight: '580px', overflow: 'hidden' }}>

        {/* Ken Burns image */}
        <img
          src="/assets/lifestyle-hero.jpg"
          alt="Spinz"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center top',
            animation: 'kenburns 8s ease-out forwards',
            transformOrigin: 'center center',
          }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(28,28,28,0.45) 0%, rgba(28,28,28,0.08) 35%, rgba(28,28,28,0.88) 100%)',
        }} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ position: 'absolute', top: '24px', right: '24px' }}
        >
          <img src="/assets/logo.png" alt="SPINZ" style={{ height: '32px', filter: 'invert(1) brightness(2)', opacity: 0.95 }} />
        </motion.div>

        {/* Hero text */}
        <div
          className="wl-hero-text"
          style={{
            position: 'absolute', bottom: '8%', right: 0, left: 0,
            padding: '0 32px',
            maxWidth: '720px', margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              display: 'block', marginBottom: '16px',
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em',
              textTransform: 'uppercase', color: GOLD,
            }}
          >
            COMING SOON · בקרוב
          </motion.span>

          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.5 }}
              style={{
                fontFamily: "'Heebo', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(40px, 9vw, 80px)',
                color: CREAM,
                letterSpacing: '-0.02em',
                lineHeight: 1.0,
                margin: '0 0 20px',
              }}
            >
              כולם ישאלו אותך<br />מאיפה.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.0 }}
            style={{ fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 300, color: CREAM, margin: '0 0 6px', opacity: 0.85 }}
          >
            אופניים שמסובבים ראשים. מחיר שסטודנט יכול להרשות לעצמו.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.2 }}
            style={{ fontSize: '12px', fontWeight: 400, color: MUTED, letterSpacing: '0.06em' }}
          >
            The bike everyone stops to ask about.
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginTop: '40px' }}
          >
            <div style={{ width: '1px', height: '48px', backgroundColor: `${CREAM}25`, position: 'relative', overflow: 'hidden' }}>
              <motion.div
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 1.6, ease: 'linear', repeat: Infinity }}
                style={{ width: '100%', height: '40%', backgroundColor: GOLD, position: 'absolute', top: 0 }}
              />
            </div>
            <span style={{ color: `${CREAM}50`, fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase' }}>
              גלול
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── COLORS ── */}
      <section className="wl-section" style={{ padding: 'clamp(56px, 8vw, 96px) 32px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <FadeSection>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: MUTED, marginBottom: '10px' }}>
              COLORS · צבעים
            </span>
            <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 44px)', color: CREAM, margin: '0 0 36px', letterSpacing: '-0.02em' }}>
              3 צבעים. תבחר צד.
            </h2>
          </FadeSection>

          <div className="wl-colors-row" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {COLORS.map((c, i) => (
              <FadeSection key={c.name} delay={i * 0.1}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 200px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: `2px solid ${c.border}`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                    flexShrink: 0,
                  }} />
                  <div>
                    <p style={{ color: CREAM, fontWeight: 700, fontSize: '16px', margin: 0 }}>{c.name}</p>
                    <p style={{ color: MUTED, fontSize: '12px', margin: 0, letterSpacing: '0.06em' }}>{c.nameEn}</p>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECS ── */}
      <section className="wl-section" style={{ padding: 'clamp(56px, 8vw, 96px) 32px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <FadeSection>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: MUTED, marginBottom: '10px' }}>
              SPECS · מפרט
            </span>
            <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 44px)', color: CREAM, margin: '0 0 36px', letterSpacing: '-0.02em' }}>
              מפרט ללא פשרות.
            </h2>
          </FadeSection>

          <div className="wl-specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {HIGHLIGHTS.map((h, i) => (
              <FadeSection key={i} delay={(i % 2) * 0.1}>
                <div
                  className="wl-spec-item"
                  style={{
                    borderTop: `1px solid ${BORDER}`,
                    padding: '20px 0',
                    paddingLeft: i % 2 !== 0 ? '32px' : '0',
                  }}
                >
                  <p style={{ color: GOLD, fontSize: '11px', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                    {h.label} · {h.labelEn}
                  </p>
                  <p style={{ color: CREAM, fontSize: '17px', fontWeight: 700, margin: '0 0 2px' }}>{h.value}</p>
                  <p style={{ color: MUTED, fontSize: '12px', margin: 0 }}>{h.valueEn}</p>
                </div>
              </FadeSection>
            ))}
          </div>

          {/* Sizes */}
          <FadeSection delay={0.1}>
            <div style={{ marginTop: '48px' }}>
              <p style={{ color: MUTED, fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '20px' }}>
                SIZES · מידות שלדה
              </p>
              <div className="wl-sizes-grid" style={{ display: 'flex', gap: '16px' }}>
                {SIZES.map(s => (
                  <div key={s.size} style={{
                    flex: '1 1 180px',
                    border: `1px solid ${BORDER}`,
                    borderRadius: '12px',
                    padding: '24px',
                    backgroundColor: '#242424',
                  }}>
                    <p style={{ color: GOLD, fontSize: '32px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{s.size}</p>
                    <p style={{ color: CREAM, fontSize: '15px', fontWeight: 400, margin: '0 0 2px' }}>{s.desc}</p>
                    <p style={{ color: MUTED, fontSize: '12px', margin: 0 }}>{s.descEn}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeSection>

          {/* Price teaser */}
          <FadeSection delay={0.15}>
            <div style={{
              marginTop: '40px',
              padding: '24px 28px',
              borderRight: `3px solid ${GOLD}`,
              backgroundColor: '#1F1F1F',
            }}>
              <p style={{ color: CREAM, fontWeight: 700, fontSize: '16px', margin: '0 0 6px' }}>
                מחיר שסטודנט יכול להרשות לעצמו.
              </p>
              <p style={{ color: MUTED, fontSize: '13px', fontWeight: 400, margin: 0, letterSpacing: '0.04em' }}>
                Priced for students. Designed to turn heads.
              </p>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── FORM ── */}
      <section className="wl-form" style={{ padding: 'clamp(56px, 8vw, 96px) 32px 96px' }}>
        <div style={{ maxWidth: '460px', margin: '0 auto' }}>
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', padding: '48px 0' }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                border: `2px solid ${GOLD}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                color: GOLD, fontSize: '22px',
              }}>✓</div>
              <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 36px)', color: CREAM, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                אתה ברשימה.
              </h2>
              <p style={{ color: MUTED, fontSize: '15px', fontWeight: 300, margin: '0 0 6px' }}>
                נחזור אליך ראשון ברגע שהאופניים מגיעות.
              </p>
              <p style={{ color: MUTED, fontSize: '12px', letterSpacing: '0.05em' }}>
                We'll reach out the moment bikes arrive.
              </p>
            </motion.div>
          ) : (
            <FadeSection>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: MUTED, marginBottom: '10px' }}>
                JOIN · הצטרף
              </span>
              <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: CREAM, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                תהיה ראשון.
              </h2>
              <p style={{ color: MUTED, fontSize: '15px', fontWeight: 300, margin: '0 0 32px', lineHeight: 1.6 }}>
                השאר פרטים. נחזור אליך ברגע שהאופניים נוחתות בארץ.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="שם מלא"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="טלפון או מייל"
                  value={contact}
                  onChange={e => { setContact(e.target.value); setError(''); }}
                  dir="ltr"
                  style={{ ...inputStyle, textAlign: 'left' }}
                />

                {/* Color preference */}
                <div style={{ paddingTop: '4px' }}>
                  <p style={{ color: MUTED, fontSize: '11px', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    PREFERRED COLOR · צבע מועדף (אופציונלי)
                  </p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {COLORS.map(c => (
                      <button
                        key={c.name}
                        onClick={() => setColor(color === c.name ? '' : c.name)}
                        title={c.name}
                        style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          backgroundColor: c.hex,
                          border: `2px solid ${color === c.name ? GOLD : c.border}`,
                          cursor: 'pointer',
                          boxShadow: color === c.name ? `0 0 0 3px ${GOLD}55` : 'none',
                          flexShrink: 0,
                          transition: 'box-shadow 0.2s, border-color 0.2s',
                        }}
                      />
                    ))}
                    {color && (
                      <span style={{ color: MUTED, fontSize: '13px', fontWeight: 400 }}>{color}</span>
                    )}
                  </div>
                </div>

                {error && (
                  <p style={{ color: '#FF6B6B', fontSize: '13px', margin: 0 }}>{error}</p>
                )}

                <button
                  onClick={submit}
                  disabled={loading}
                  style={{
                    padding: '15px',
                    borderRadius: '10px',
                    backgroundColor: GOLD,
                    border: 'none',
                    color: DARK,
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: loading ? 'wait' : 'pointer',
                    fontFamily: "'Heebo', sans-serif",
                    opacity: loading ? 0.7 : 1,
                    marginTop: '8px',
                    letterSpacing: '0.02em',
                    transition: 'opacity 0.2s, transform 0.15s',
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                >
                  {loading ? '...' : 'אני רוצה להיות ראשון ←'}
                </button>
              </div>
            </FadeSection>
          )}
        </div>
      </section>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '20px 32px', textAlign: 'center' }}>
        <p style={{ color: '#444', fontSize: '11px', fontWeight: 400, letterSpacing: '0.1em', margin: 0 }}>
          © 2026 SPINZ. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid #2A2A2A',
  backgroundColor: '#242424',
  color: '#EDEBE6',
  fontSize: '15px',
  fontWeight: 400,
  outline: 'none',
  fontFamily: "'Heebo', sans-serif",
  boxSizing: 'border-box',
};
