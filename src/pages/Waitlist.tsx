import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import CustomCursor from '../components/CustomCursor';

const GOLD   = '#C9A870';
const DARK   = '#1C1C1C';
const CREAM  = '#EDEBE6';
const MUTED  = '#888888';
const BORDER = '#2A2A2A';
const BEIGE  = '#F2EDE4';
const BEIGE_DARK = '#1C1812';

const COLORS = [
  { name: 'שחור מאט', nameEn: 'Matte Black', hex: '#2A2A2A', border: '#555',    bike: '/assets/צבעים עומר/שקופים/שחור מט שקוף.webp', blend: false },
  { name: 'ירוק זית',  nameEn: 'Olive Green',  hex: '#5C6A3E', border: '#7A8A52', bike: '/assets/צבעים עומר/שקופים/ירוק זית שקוף.webp', blend: false },
  { name: "בז'",       nameEn: 'Beige',         hex: '#C8B99A', border: '#A89070', bike: '/assets/צבעים עומר/שקופים/בז שקוף.webp',        blend: false },
];

const SPECS = [
  {
    num: '01', title: 'קלילות עירונית', sub: 'שלדת אלומיניום',
    body: 'שלדת אלומיניום המעניקה תחושת קלילות יוצאת דופן. זינוק זריז בכל רמזור ונוחה לנשיאה אל תוך הדירה.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L8 8H4l4 4-2 6 6-3 6 3-2-6 4-4h-4L12 2z"/></svg>,
  },
  {
    num: '02', title: "צמיגים עמידים לפנצ'ר", sub: 'Kenda 32 מ"מ',
    body: 'אחיזה בטוחה וראש שקט. צמיגים אורבניים רחבים שבולעים את מהמורות העיר ופסי הרכבת הקלה.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>,
  },
  {
    num: '03', title: 'יחס העברה חכם לעיר', sub: 'גלגל שיניים 46T',
    body: 'האיזון המושלם בין מהירות לשיוט קל. מכויל בדיוק לעליות המתונות ולמישורים של הרחובות.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>,
  },
  {
    num: '04', title: 'הנדסת חומרים חכמה', sub: 'אלומיניום + פלדה',
    body: 'מזלג פלדה קדמי שסופג את הזעזועים של הכביש. השילוב המושלם לשלדת האלומיניום — חלק, שקט, ובלי להרגיש כל בור.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><line x1="2" y1="15.5" x2="22" y2="15.5"/></svg>,
  },
  {
    num: '05', title: 'חישוקים מחוזקים', sub: 'פרופיל גבוה 30 מ"מ',
    body: 'גלגלים בעלי פרופיל גבוה — מראה אורבני מוקפד ועמידות גבוהה מול בורות ושפות מדרכה.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg>,
  },
  {
    num: '06', title: 'התאמה בשנייה', sub: 'Quick Release',
    body: 'כיוון מהיר ללא כלים. נוח להתאמה מיידית — או סתם אם חבר רוצה לעשות סיבוב.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  },
  {
    num: '07', title: 'בטיחות ללא פשרות', sub: 'תקנים בינלאומיים',
    body: 'תוכנן ונבנה בהתאם לתקני בטיחות בינלאומיים מחמירים. כי על בטיחות לא מתפשרים.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  },
  {
    num: '08', title: 'פדלים רחבים משודרגים', sub: 'יציבות מלאה',
    body: 'פדלים רחבים מפלסטיק קשיח — שטח פנים גדול לאחיזה בטוחה ודיווש נוח בכל נעל.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="10" width="20" height="5" rx="2"/><line x1="7" y1="10" x2="7" y2="15"/><line x1="12" y1="10" x2="12" y2="15"/><line x1="17" y1="10" x2="17" y2="15"/></svg>,
  },
];

const SIZES = [
  { size: '54', desc: '170–178 ס"מ' },
  { size: '57', desc: '178–185 ס"מ' },
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
  const [phone, setPhone]     = useState('');
  const [email, setEmail]     = useState('');
  const [color, setColor]     = useState('');
  const [size, setSize]       = useState('');
  const [agreed, setAgreed]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    COLORS.forEach(c => { const img = new Image(); img.src = c.bike; });
  }, []);

  const submit = async () => {
    if (!name.trim()) { setError('יש למלא שם מלא'); return; }
    let phoneClean = phone.trim().replace(/[-\s]/g, '');
    if (!phoneClean) { setError('יש למלא מספר טלפון'); return; }
    if (phoneClean.startsWith('+972')) phoneClean = '0' + phoneClean.slice(4);
    else if (phoneClean.startsWith('00972')) phoneClean = '0' + phoneClean.slice(5);
    else if (phoneClean.startsWith('972') && phoneClean.length === 12) phoneClean = '0' + phoneClean.slice(3);
    if (!/^0(5[0-9]|[2-9])\d{7}$/.test(phoneClean)) { setError('מספר טלפון לא תקין — יש להזין מספר ישראלי תקני'); return; }
    if (!agreed) { setError('יש לאשר את תנאי השימוש ומדיניות הפרטיות'); return; }
    setLoading(true);
    setError('');
    const message = `[Waitlist]${color ? ` · צבע: ${color}` : ''}${size ? ` · מידה: ${size}` : ''}`;
    const { error: err } = await supabase.from('leads').insert([{
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
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
          .wl-form-section { padding: 56px 20px 72px !important; }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 30px #FBF7F2 inset !important;
          -webkit-text-fill-color: #1C1812 !important;
          caret-color: #1C1812;
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', height: '100svh', minHeight: '580px', overflow: 'hidden' }}>
        <img
          src="/assets/story-hero.jpg"
          alt="Spinz"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center top',
            animation: 'kenburns 8s ease-out forwards',
            transformOrigin: 'center center',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(28,28,28,0.45) 0%, rgba(28,28,28,0.08) 35%, rgba(28,28,28,0.88) 100%)',
        }} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ position: 'absolute', top: '24px', right: '24px' }}
        >
          <img src="/assets/logo.png" alt="SPINZ" style={{ height: '32px', filter: 'invert(1) brightness(2)', opacity: 0.95 }} />
        </motion.div>

        <div
          className="wl-hero-text"
          style={{ position: 'absolute', bottom: '8%', right: 0, left: 0, padding: '0 32px', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ display: 'inline-block', marginBottom: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.45em', textTransform: 'uppercase', color: CREAM, backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '100px', padding: '6px 16px' }}
          >
            SPINZ · COMING SOON
          </motion.span>

          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.5 }}
              style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(40px, 9vw, 80px)', color: CREAM, letterSpacing: '-0.02em', lineHeight: 1.0, margin: '0 0 20px', textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}
            >
              כולם ישאלו אותך<br />מאיפה.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.0 }}
            style={{ fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 300, color: CREAM, margin: '0 0 32px', opacity: 0.85, textShadow: '0 1px 12px rgba(0,0,0,0.7)', lineHeight: 1.8 }}
          >
            אופניים שמסובבים ראשים.<br />מחיר שסטודנטים יכולים להרשות לעצמם.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.3 }}
          >
            <button
              onClick={() => document.getElementById('wl-form')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '14px 32px',
                borderRadius: '6px',
                backgroundColor: GOLD,
                border: 'none',
                color: DARK,
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Heebo', sans-serif",
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                transition: 'transform 0.2s, background-color 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
            >
              שמרו לי זוג ↓
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── COLORS + SIZES ── */}
      <section className="wl-section" style={{ padding: 'clamp(56px, 8vw, 96px) 32px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <FadeSection>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: MUTED, marginBottom: '10px' }}>צבעים ומידות · COLORS & SIZES</span>
            <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 44px)', color: CREAM, margin: '0 0 36px', letterSpacing: '-0.02em' }}>הצבע שלך, העיר שלך.</h2>
          </FadeSection>

          {/* Bike image */}
          <FadeSection delay={0.1}>
            <div style={{ position: 'relative', height: '320px', marginBottom: '32px', overflow: 'hidden' }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={color || 'שחור מאט'}
                  src={(COLORS.find(c => c.name === color) ?? COLORS[0]).bike}
                  alt={color || 'שחור מאט'}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom center' }}
                />
              </AnimatePresence>
            </div>
          </FadeSection>

          {/* Colors */}
          <div className="wl-colors-row" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {COLORS.map((c, i) => (
              <FadeSection key={c.name} delay={i * 0.1}>
                <button
                  onClick={() => setColor(color === c.name ? '' : c.name)}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 180px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'right' }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: c.hex, border: `2px solid ${color === c.name ? GOLD : c.border}`, boxShadow: color === c.name ? `0 0 0 3px ${GOLD}55` : '0 4px 12px rgba(0,0,0,0.5)', flexShrink: 0, transition: 'border-color 0.2s, box-shadow 0.2s' }} />
                  <div>
                    <p style={{ color: color === c.name ? GOLD : CREAM, fontWeight: 700, fontSize: '14px', margin: 0, transition: 'color 0.2s' }}>{c.name}</p>
                    <p style={{ color: MUTED, fontSize: '11px', margin: 0, letterSpacing: '0.06em' }}>{c.nameEn}</p>
                  </div>
                </button>
              </FadeSection>
            ))}
          </div>

          {/* Sizes */}
          <FadeSection delay={0.15}>
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '28px' }}>
              <p style={{ color: MUTED, fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px' }}>מידות שלדה · SIZES</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {SIZES.map(s => (
                  <div key={s.size} style={{
                    display: 'flex', alignItems: 'center', gap: '20px',
                    border: `1px solid ${BORDER}`,
                    borderRadius: '10px',
                    padding: '14px 20px',
                    backgroundColor: '#1F1F1F',
                  }}>
                    <p style={{ color: GOLD, fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', flexShrink: 0, minWidth: '36px' }}>{s.size}</p>
                    <div>
                      <p style={{ color: MUTED, fontSize: '11px', margin: '0 0 2px' }}>מיועד ל</p>
                      <p style={{ color: CREAM, fontSize: '13px', fontWeight: 500, margin: 0 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── SPECS ── */}
      <section className="wl-section" style={{ padding: 'clamp(56px, 8vw, 96px) 32px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <FadeSection>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: MUTED, marginBottom: '10px' }}>מפרט · SPECS</span>
            <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 44px)', color: CREAM, margin: '0 0 8px', letterSpacing: '-0.02em' }}>מפרט ללא פשרות.</h2>
            <p style={{ color: MUTED, fontSize: 'clamp(13px, 1.4vw, 15px)', fontWeight: 300, margin: '0 0 48px', lineHeight: 1.6 }}>
              כל פרט תוכנן בקפידה לחוויית רכיבה חלקה, בטוחה ונטולת מאמץ ברחובות העיר.
            </p>
          </FadeSection>

          <div className="wl-specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '24px' }}>
            {SPECS.map((spec, i) => (
              <FadeSection key={spec.num} delay={(i % 2) * 0.08}>
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ color: GOLD }}>{spec.icon}</div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: BORDER, letterSpacing: '0.2em' }}>{spec.num}</span>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(14px, 1.8vw, 17px)', color: CREAM, margin: '0 0 3px', lineHeight: 1.2 }}>{spec.title}</h3>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: GOLD, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{spec.sub}</span>
                  </div>
                  <p style={{ fontSize: 'clamp(12px, 1.2vw, 13.5px)', color: MUTED, lineHeight: 1.65, margin: 0 }}>{spec.body}</p>
                </div>
              </FadeSection>
            ))}
          </div>

        </div>
      </section>

      {/* ── FORM — BEIGE ── */}
      <section
        id="wl-form"
        className="wl-form-section"
        style={{ padding: 'clamp(56px, 8vw, 96px) 32px 96px', backgroundColor: BEIGE }}
      >
        <div style={{ maxWidth: '460px', margin: '0 auto' }}>
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', padding: '48px 0' }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: `2px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: GOLD, fontSize: '22px' }}>✓</div>
              <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 36px)', color: BEIGE_DARK, margin: '0 0 12px', letterSpacing: '-0.02em' }}>You're in.</h2>
              <p style={{ color: '#6B5E4A', fontSize: '15px', fontWeight: 300, margin: '0 0 6px' }}>נחזור אליך ברגע שהאופניים מגיעים.</p>
              <p style={{ color: '#9A8C7A', fontSize: '12px', letterSpacing: '0.05em' }}>We'll reach out the moment the bikes arrive.</p>
            </motion.div>
          ) : (
            <FadeSection>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#9A8C7A', marginBottom: '10px' }}>JOIN</span>
              <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: BEIGE_DARK, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Be first.</h2>
              <p style={{ color: '#6B5E4A', fontSize: '15px', fontWeight: 300, margin: '0 0 32px', lineHeight: 1.6 }}>
                כמה פרטים ונחזור אליך ברגע שהאופניים נוחתים בארץ.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="שם מלא *"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  autoComplete="name"
                  style={inputStyle}
                />
                <input
                  type="tel"
                  placeholder="טלפון *"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setError(''); }}
                  autoComplete="tel"
                  dir="rtl"
                  style={inputStyle}
                />
                <input
                  type="email"
                  placeholder="אימייל (אופציונלי)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  style={inputStyle}
                />

                <div style={{ paddingTop: '4px' }}>
                  <p style={{ color: '#9A8C7A', fontSize: '11px', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    צבע מועדף (אופציונלי) · PREFERRED COLOR
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
                    {color && <span style={{ color: '#6B5E4A', fontSize: '13px' }}>{color}</span>}
                  </div>
                </div>

                {/* Size preference */}
                <div style={{ paddingTop: '4px' }}>
                  <p style={{ color: '#9A8C7A', fontSize: '11px', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    מידה מועדפת (אופציונלי) · SIZE
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {SIZES.map(s => (
                      <button
                        key={s.size}
                        onClick={() => setSize(size === s.size ? '' : s.size)}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: `1.5px solid ${size === s.size ? GOLD : '#C8BFB0'}`,
                          backgroundColor: size === s.size ? `${GOLD}18` : '#FBF7F2',
                          cursor: 'pointer',
                          fontFamily: "'Heebo', sans-serif",
                          textAlign: 'center',
                          transition: 'border-color 0.2s, background-color 0.2s',
                        }}
                      >
                        <p style={{ color: size === s.size ? '#8A6830' : BEIGE_DARK, fontWeight: 800, fontSize: '18px', margin: 0, letterSpacing: '-0.02em' }}>{s.size}</p>
                        <p style={{ color: '#9A8C7A', fontSize: '11px', margin: 0 }}>{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consent checkbox */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', paddingTop: '4px' }}>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => { setAgreed(e.target.checked); setError(''); }}
                    style={{ marginTop: '3px', accentColor: GOLD, flexShrink: 0, width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#6B5E4A', fontSize: '12px', lineHeight: 1.6 }}>
                    קראתי ואני מסכים/ה ל
                    <a href="/terms" style={{ color: '#8A6830', textDecoration: 'underline', textUnderlineOffset: '2px' }}>תנאי השימוש ומדיניות הפרטיות</a>
                    , ולקבל עדכון מ-SPINZ כשהאופניים מגיעים.
                  </span>
                </label>

                {error && <p style={{ color: '#CC3333', fontSize: '13px', margin: 0 }}>{error}</p>}

                <button
                  onClick={submit}
                  disabled={loading}
                  style={{
                    padding: '15px',
                    borderRadius: '10px',
                    backgroundColor: agreed ? GOLD : '#C8BFB0',
                    border: 'none',
                    color: agreed ? DARK : '#8A8078',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: loading ? 'wait' : agreed ? 'pointer' : 'not-allowed',
                    fontFamily: "'Heebo', sans-serif",
                    opacity: loading ? 0.7 : 1,
                    marginTop: '8px',
                    letterSpacing: '0.02em',
                    transition: 'background-color 0.25s, color 0.25s, transform 0.15s',
                  }}
                  onMouseEnter={e => { if (!loading && agreed) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                >
                  {loading ? '...' : 'Join the waitlist'}
                </button>

              </div>
            </FadeSection>
          )}
        </div>
      </section>

      {/* Footer */}
      <div style={{ backgroundColor: BEIGE, borderTop: `1px solid #D8D0C0`, padding: '20px 32px', textAlign: 'center' }}>
        <p style={{ color: '#9A8C7A', fontSize: '11px', fontWeight: 400, letterSpacing: '0.05em', margin: 0, lineHeight: 1.9 }}>
          <span dir="ltr" style={{ display: 'block' }}>© 2026 SPINZ. All Rights Reserved.</span>
          <a href="/terms" style={{ color: '#8A7A6A', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
            תנאים ופרטיות
          </a>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid #C8BFB0',
  backgroundColor: '#FBF7F2',
  color: '#1C1812',
  fontSize: '15px',
  fontWeight: 400,
  outline: 'none',
  fontFamily: "'Heebo', sans-serif",
  boxSizing: 'border-box',
};
