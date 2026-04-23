import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { supabase } from '../lib/supabase';

const DARK   = '#1C1C1C';
const GOLD   = '#C9A870';
const MUTED  = '#6A6862';
const BG     = '#F5F2EC';
const BORDER = '#E0DCD4';

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24"
            fill={(hovered || value) >= n ? GOLD : 'none'}
            stroke={GOLD} strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function Reviews() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-40px' });

  const [form, setForm] = useState({ name: '', city: '', quote: '', stars: 5 });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.quote.trim()) return;
    setStatus('sending');
    const { error } = await supabase.from('reviews').insert([{
      name: form.name.trim(),
      city: form.city.trim(),
      quote: form.quote.trim(),
      stars: form.stars,
    }]);
    if (error) {
      setStatus('error');
    } else {
      setStatus('done');
      setForm({ name: '', city: '', quote: '', stars: 5 });
    }
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "'Heebo', sans-serif",
    fontSize: '14px',
    color: DARK,
    backgroundColor: '#FFFFFF',
    border: `1px solid ${BORDER}`,
    borderRadius: '10px',
    padding: '12px 14px',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <section
      ref={ref}
      id="reviews"
      dir="rtl"
      style={{ backgroundColor: BG, position: 'relative' }}
      className="py-20 lg:py-28"
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />

      <div className="mx-auto max-w-7xl px-6 lg:px-16">

        {/* Header */}
        <div className="mb-12 lg:mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7 }}
            style={{
              display: 'block',
              marginBottom: '12px',
              fontFamily: "'Heebo', sans-serif",
              fontSize: '11px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: MUTED,
            }}
          >
            לקוחות מרוצים
          </motion.span>

          <div ref={headingRef} style={{ overflow: 'hidden' }}>
            <motion.h2
              initial={{ y: '105%' }}
              animate={headingInView ? { y: '0%' } : {}}
              transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
              style={{
                fontFamily: "'Heebo', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(28px, 5.5vw, 64px)',
                color: DARK,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                margin: 0,
              }}
            >
              מה אומרים עלינו.
            </motion.h2>
          </div>
        </div>

        {/* Review submission form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            backgroundColor: '#FFFFFF',
            border: `1px solid ${BORDER}`,
            borderRadius: '20px',
            padding: 'clamp(24px, 4vw, 40px)',
            maxWidth: '600px',
          }}
        >
          <h3 style={{
            fontFamily: "'Heebo', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(17px, 2vw, 22px)',
            color: DARK,
            margin: '0 0 6px',
          }}>
            שתפו אותנו בחוויה שלכם
          </h3>
          <p style={{
            fontFamily: "'Heebo', sans-serif",
            fontSize: '13px',
            color: MUTED,
            margin: '0 0 24px',
          }}>
            קניתם? נשמח לשמוע.
          </p>

          {status === 'done' ? (
            <div style={{
              textAlign: 'center',
              padding: '32px 0',
              fontFamily: "'Heebo', sans-serif",
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🙏</div>
              <p style={{ fontWeight: 700, fontSize: '17px', color: DARK, margin: '0 0 6px' }}>תודה על הביקורת!</p>
              <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>אנחנו מעריכים את זה.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Stars */}
              <div>
                <label style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: MUTED, display: 'block', marginBottom: '8px' }}>
                  דירוג
                </label>
                <StarPicker value={form.stars} onChange={stars => setForm(f => ({ ...f, stars }))} />
              </div>

              {/* Quote */}
              <div>
                <label style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: MUTED, display: 'block', marginBottom: '6px' }}>
                  הביקורת שלך *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.quote}
                  onChange={e => setForm(f => ({ ...f, quote: e.target.value }))}
                  placeholder="ספרו על החוויה שלכם..."
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>

              {/* Name + City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: MUTED, display: 'block', marginBottom: '6px' }}>
                    שם *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="ישראל ישראלי"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: MUTED, display: 'block', marginBottom: '6px' }}>
                    עיר
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="תל אביב"
                    style={inputStyle}
                  />
                </div>
              </div>

              {status === 'error' && (
                <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#c0392b', margin: 0 }}>
                  משהו השתבש. נסו שוב.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                style={{
                  fontFamily: "'Heebo', sans-serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#1C1C1C',
                  backgroundColor: GOLD,
                  border: 'none',
                  borderRadius: '10px',
                  padding: '13px 28px',
                  cursor: status === 'sending' ? 'wait' : 'pointer',
                  alignSelf: 'flex-start',
                  opacity: status === 'sending' ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {status === 'sending' ? 'שולח...' : 'שלח ביקורת'}
              </button>
            </form>
          )}
        </motion.div>

      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />
    </section>
  );
}
