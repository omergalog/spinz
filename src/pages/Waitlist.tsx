import { useState } from 'react';
import { supabase } from '../lib/supabase';

const GOLD  = '#C9A870';
const DARK  = '#1C1C1C';
const CREAM = '#EDEBE6';
const MUTED = '#6A6862';

const COLORS = [
  { name: 'שחור מאט', nameEn: 'Matte Black', hex: '#2A2A2A', border: '#444' },
  { name: 'ירוק זית',  nameEn: 'Olive Green',  hex: '#5C6A3E', border: '#7A8A52' },
  { name: 'בז\'',      nameEn: 'Beige',         hex: '#C8B99A', border: '#A89070' },
];

const HIGHLIGHTS = [
  { label: 'שלדה',     labelEn: 'Frame',    value: 'אלומיניום', valueEn: 'Aluminium' },
  { label: 'מזלג',     labelEn: 'Fork',     value: 'פלדה',      valueEn: 'Steel' },
  { label: 'צמיגים',   labelEn: 'Tires',    value: 'Kenda 32mm', valueEn: 'Kenda 32mm' },
  { label: 'גלגל שיניים', labelEn: 'Chainring', value: '46T',   valueEn: '46T' },
  { label: 'חישוקים',  labelEn: 'Rims',     value: 'פרופיל 30mm', valueEn: '30mm profile' },
  { label: 'מושב',     labelEn: 'Saddle',   value: 'Quick Release', valueEn: 'Quick Release' },
];

const SIZES = [
  { size: '54"', desc: 'מתאים לגובה 160–175', descEn: 'Fits height 160–175 cm' },
  { size: '57"', desc: 'מתאים לגובה 175–190', descEn: 'Fits height 175–190 cm' },
];

export default function Waitlist() {
  const [name, setName]     = useState('');
  const [contact, setContact] = useState('');
  const [color, setColor]   = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [error, setError]   = useState('');

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

      {/* ── HERO ── */}
      <div style={{ position: 'relative', height: '100svh', minHeight: '600px', overflow: 'hidden' }}>
        <img
          src="/assets/lifestyle-hero.jpg"
          alt="Spinz bike"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        {/* gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(28,28,28,0.55) 0%, rgba(28,28,28,0.15) 40%, rgba(28,28,28,0.75) 100%)',
        }} />

        {/* Logo */}
        <div style={{ position: 'absolute', top: '28px', right: '28px' }}>
          <img src="/assets/logo.png" alt="SPINZ" style={{ height: '36px', filter: 'invert(1) brightness(2)', opacity: 0.95 }} />
        </div>

        {/* Hero text */}
        <div style={{
          position: 'absolute', bottom: '10%', right: 0, left: 0,
          padding: '0 28px',
          maxWidth: '720px', margin: '0 auto',
          textAlign: 'center',
        }}>
          <span style={{
            display: 'block', marginBottom: '14px',
            fontSize: '11px', letterSpacing: '0.4em',
            textTransform: 'uppercase', color: GOLD,
          }}>
            COMING SOON
          </span>
          <h1 style={{
            fontSize: 'clamp(32px, 7vw, 72px)',
            fontWeight: 900, color: CREAM,
            letterSpacing: '-0.02em', lineHeight: 1.05,
            margin: '0 0 16px',
          }}>
            האופניים שישנו<br />את הרחוב.
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#BBBBBB', lineHeight: 1.6, margin: '0 0 8px' }}>
            עיצוב אורבני. מחיר שסטודנט יכול להרשות לעצמו.
          </p>
          <p style={{ fontSize: '13px', color: MUTED, letterSpacing: '0.05em' }}>
            Urban design. A price students can actually afford.
          </p>
        </div>
      </div>

      {/* ── COLORS ── */}
      <section style={{ padding: 'clamp(56px, 8vw, 96px) 28px', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <span style={{ display: 'block', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: MUTED, marginBottom: '12px' }}>
            COLORS · צבעים
          </span>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, color: CREAM, margin: '0 0 40px', letterSpacing: '-0.02em' }}>
            3 דגמים. 3 אופציות.
          </h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 200px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  backgroundColor: c.hex,
                  border: `2px solid ${c.border}`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                  flexShrink: 0,
                }} />
                <div>
                  <p style={{ color: CREAM, fontWeight: 700, fontSize: '15px', margin: 0 }}>{c.name}</p>
                  <p style={{ color: MUTED, fontSize: '12px', margin: 0, letterSpacing: '0.05em' }}>{c.nameEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECS ── */}
      <section style={{ padding: 'clamp(56px, 8vw, 96px) 28px', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <span style={{ display: 'block', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: MUTED, marginBottom: '12px' }}>
            SPECS · מפרט
          </span>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, color: CREAM, margin: '0 0 40px', letterSpacing: '-0.02em' }}>
            מפרט ללא פשרות.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0' }}>
            {HIGHLIGHTS.map((h, i) => (
              <div key={i} style={{ borderTop: '1px solid #2A2A2A', padding: '18px 0', paddingLeft: i % 2 === 0 ? '0' : '24px' }}>
                <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                  {h.label} · {h.labelEn}
                </p>
                <p style={{ color: CREAM, fontSize: '16px', fontWeight: 700, margin: 0 }}>{h.value}</p>
                <p style={{ color: MUTED, fontSize: '12px', margin: 0 }}>{h.valueEn}</p>
              </div>
            ))}
          </div>

          {/* Sizes */}
          <div style={{ marginTop: '48px' }}>
            <p style={{ color: MUTED, fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '20px' }}>
              SIZES · מידות שלדה
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {SIZES.map(s => (
                <div key={s.size} style={{
                  flex: '1 1 200px',
                  border: '1px solid #2A2A2A',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  backgroundColor: '#242424',
                }}>
                  <p style={{ color: GOLD, fontSize: '28px', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{s.size}</p>
                  <p style={{ color: CREAM, fontSize: '13px', margin: '0 0 2px' }}>{s.desc}</p>
                  <p style={{ color: MUTED, fontSize: '12px', margin: 0 }}>{s.descEn}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price teaser */}
          <div style={{
            marginTop: '40px',
            padding: '24px 28px',
            borderRadius: '14px',
            border: `1px solid ${GOLD}44`,
            backgroundColor: `${GOLD}0D`,
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <span style={{ fontSize: '28px' }}>💡</span>
            <div>
              <p style={{ color: CREAM, fontWeight: 700, fontSize: '15px', margin: '0 0 4px' }}>
                מחיר שסטודנט יכול להרשות לעצמו — ועיצוב שיגרום לכולם להסתכל.
              </p>
              <p style={{ color: MUTED, fontSize: '13px', margin: 0 }}>
                Priced for students. Designed to turn heads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORM ── */}
      <section style={{ padding: 'clamp(56px, 8vw, 96px) 28px 80px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚲</div>
              <h2 style={{ color: CREAM, fontWeight: 800, fontSize: '26px', margin: '0 0 12px' }}>תודה! אתה/את ברשימה.</h2>
              <p style={{ color: MUTED, fontSize: '15px', margin: 0 }}>נחזור אליך ראשון/ה ברגע שהאופניים מגיעות.</p>
              <p style={{ color: MUTED, fontSize: '13px', marginTop: '8px', letterSpacing: '0.05em' }}>You're on the list. We'll reach out first.</p>
            </div>
          ) : (
            <>
              <span style={{ display: 'block', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: MUTED, marginBottom: '12px' }}>
                JOIN · הצטרף/י
              </span>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: CREAM, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                רוצה להיות ראשון לדעת?
              </h2>
              <p style={{ color: MUTED, fontSize: '14px', margin: '0 0 36px', lineHeight: 1.6 }}>
                השאר פרטים ונחזור אליך ברגע שהאופניים מגיעות לישראל.<br />
                <span style={{ fontSize: '12px' }}>Leave your details and we'll reach out the moment bikes arrive.</span>
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input
                  type="text"
                  placeholder="שם מלא / Full name"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="טלפון או מייל / Phone or email"
                  value={contact}
                  onChange={e => { setContact(e.target.value); setError(''); }}
                  dir="ltr"
                  style={{ ...inputStyle, textAlign: 'left' }}
                />

                {/* Color preference */}
                <div>
                  <p style={{ color: MUTED, fontSize: '12px', marginBottom: '10px', letterSpacing: '0.05em' }}>
                    צבע מועדף (אופציונלי) · Preferred color
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {COLORS.map(c => (
                      <button
                        key={c.name}
                        onClick={() => setColor(color === c.name ? '' : c.name)}
                        title={c.name}
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          backgroundColor: c.hex,
                          border: `2px solid ${color === c.name ? GOLD : c.border}`,
                          cursor: 'pointer',
                          boxShadow: color === c.name ? `0 0 0 3px ${GOLD}44` : 'none',
                          transition: 'box-shadow 0.2s',
                        }}
                      />
                    ))}
                    {color && (
                      <span style={{ color: MUTED, fontSize: '13px', alignSelf: 'center' }}>{color}</span>
                    )}
                  </div>
                </div>

                {error && <p style={{ color: '#FF6B6B', fontSize: '13px', margin: 0 }}>{error}</p>}

                <button
                  onClick={submit}
                  disabled={loading}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: GOLD,
                    border: 'none',
                    color: DARK,
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: loading ? 'wait' : 'pointer',
                    fontFamily: "'Heebo', sans-serif",
                    opacity: loading ? 0.7 : 1,
                    marginTop: '4px',
                  }}
                >
                  {loading ? '...' : 'אני רוצה להיות ראשון לדעת →'}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #2A2A2A', padding: '24px 28px', textAlign: 'center' }}>
        <p style={{ color: '#444', fontSize: '12px', margin: 0 }}>© 2026 Spinz. All rights reserved.</p>
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
  color: CREAM,
  fontSize: '14px',
  outline: 'none',
  fontFamily: "'Heebo', sans-serif",
  boxSizing: 'border-box',
};
