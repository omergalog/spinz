import { useState } from 'react';
import { supabase } from '../lib/supabase';

const GOLD  = '#C9A870';
const DARK  = '#1C1C1C';
const CREAM = '#EDEBE6';
const MUTED = '#888888';
const BORDER = '#2A2A2A';

const COLORS = [
  { name: 'שחור מאט', nameEn: 'Matte Black', hex: '#2A2A2A', border: '#555' },
  { name: 'ירוק זית',  nameEn: 'Olive Green',  hex: '#5C6A3E', border: '#7A8A52' },
  { name: "בז'",       nameEn: 'Beige',         hex: '#C8B99A', border: '#A89070' },
];

const HIGHLIGHTS = [
  { label: 'שלדה',        labelEn: 'Frame',     value: 'אלומיניום',   valueEn: 'Aluminium' },
  { label: 'מזלג',        labelEn: 'Fork',      value: 'פלדה',        valueEn: 'Steel' },
  { label: 'צמיגים',      labelEn: 'Tires',     value: 'Kenda 32mm',  valueEn: 'Kenda 32mm' },
  { label: 'גלגל שיניים', labelEn: 'Chainring', value: '46T',         valueEn: '46T' },
  { label: 'חישוקים',     labelEn: 'Rims',      value: 'פרופיל 30mm', valueEn: '30mm profile' },
  { label: 'מושב',        labelEn: 'Saddle',    value: 'Quick Release',valueEn: 'Quick Release' },
];

const SIZES = [
  { size: '54"', desc: '160–175 ס"מ', descEn: 'Fits 160–175 cm' },
  { size: '57"', desc: '175–190 ס"מ', descEn: 'Fits 175–190 cm' },
];

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
    <div style={{ backgroundColor: DARK, minHeight: '100vh', fontFamily: "'Heebo', sans-serif" }} dir="rtl">
      <style>{`
        @media (max-width: 600px) {
          .wl-specs-grid { grid-template-columns: 1fr !important; }
          .wl-sizes-grid { flex-direction: column !important; }
          .wl-colors-row { flex-direction: column !important; gap: 16px !important; }
          .wl-hero-text  { padding: 0 20px !important; }
          .wl-section    { padding: 48px 20px !important; }
          .wl-form       { padding: 48px 20px 72px !important; }
          .wl-spec-item  { padding-left: 0 !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', height: '100svh', minHeight: '580px', overflow: 'hidden' }}>
        <img
          src="/assets/lifestyle-hero.jpg"
          alt="Spinz"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(28,28,28,0.5) 0%, rgba(28,28,28,0.1) 35%, rgba(28,28,28,0.82) 100%)',
        }} />

        {/* Logo */}
        <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
          <img src="/assets/logo.png" alt="SPINZ" style={{ height: '32px', filter: 'invert(1) brightness(2)', opacity: 0.95 }} />
        </div>

        {/* Hero text */}
        <div
          className="wl-hero-text"
          style={{
            position: 'absolute', bottom: '8%', right: 0, left: 0,
            padding: '0 32px',
            maxWidth: '680px', margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <span style={{
            display: 'block', marginBottom: '16px',
            fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em',
            textTransform: 'uppercase', color: GOLD,
          }}>
            COMING SOON · בקרוב
          </span>

          <h1 style={{
            fontFamily: "'Heebo', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(38px, 8vw, 72px)',
            color: CREAM,
            letterSpacing: '-0.02em',
            lineHeight: 1.0,
            margin: '0 0 20px',
          }}>
            כולם ישאלו אותך<br />מאיפה.
          </h1>

          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 300, color: CREAM, margin: '0 0 6px', opacity: 0.85 }}>
            אופניים שמסובבים ראשים. מחיר שסטודנט יכול להרשות לעצמו.
          </p>
          <p style={{ fontSize: '12px', fontWeight: 400, color: MUTED, letterSpacing: '0.06em' }}>
            The bike everyone stops to ask about.
          </p>
        </div>
      </div>

      {/* ── COLORS ── */}
      <section className="wl-section" style={{ padding: 'clamp(56px, 8vw, 96px) 32px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: MUTED, marginBottom: '10px' }}>
            COLORS · צבעים
          </span>
          <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 44px)', color: CREAM, margin: '0 0 36px', letterSpacing: '-0.02em' }}>
            3 צבעים. תבחר צד.
          </h2>

          <div className="wl-colors-row" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 200px' }}>
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
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECS ── */}
      <section className="wl-section" style={{ padding: 'clamp(56px, 8vw, 96px) 32px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: MUTED, marginBottom: '10px' }}>
            SPECS · מפרט
          </span>
          <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 44px)', color: CREAM, margin: '0 0 36px', letterSpacing: '-0.02em' }}>
            מפרט ללא פשרות.
          </h2>

          <div
            className="wl-specs-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}
          >
            {HIGHLIGHTS.map((h, i) => (
              <div
                key={i}
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
            ))}
          </div>

          {/* Sizes */}
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

          {/* Price teaser */}
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
        </div>
      </section>

      {/* ── FORM ── */}
      <section className="wl-form" style={{ padding: 'clamp(56px, 8vw, 96px) 32px 96px' }}>
        <div style={{ maxWidth: '460px', margin: '0 auto' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
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
            </div>
          ) : (
            <>
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
                  }}
                >
                  {loading ? '...' : 'אני רוצה להיות ראשון ←'}
                </button>
              </div>
            </>
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
