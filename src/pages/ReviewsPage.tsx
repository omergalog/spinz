import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Plus } from 'lucide-react';
import PageShell from '../components/PageShell';
import { supabase } from '../lib/supabase';

const GOLD = '#C9A870';
const DARK = '#1C1C1C';
const MUTED = '#6A6862';
const BORDER = '#E0DCD4';
const CARD = '#FFFFFF';

type Review = { id?: string; name: string; city?: string; quote: string; stars: number };

// Fallback reviews shown if none exist yet in the DB
const SEED: Review[] = [
  { name: 'דניאל כ.', city: 'תל אביב', quote: 'האופניים הכי יפים שראיתי בעיר. כולם שואלים מאיפה. הרכבה לקחה 15 דקות וזהו.', stars: 5 },
  { name: 'נועה ל.', city: 'רמת גן', quote: 'חיכיתי הרבה זמן למשהו פשוט ואיכותי במחיר הגיוני. Spinz בדיוק זה.', stars: 5 },
  { name: 'איתי מ.', city: 'גבעתיים', quote: 'סינגל ספיד = אפס כאב ראש. נוסע חלק, נראה מטורף, ולא מתקלקל.', stars: 5 },
];

function Stars({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} fill={i <= n ? GOLD : 'none'} stroke={GOLD} strokeWidth={1.5} />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Star size={26} fill={(hovered || value) >= n ? GOLD : 'none'} stroke={GOLD} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

function ReviewModal({ onClose, onDone }: { onClose: () => void; onDone: (r: Review) => void }) {
  const [form, setForm] = useState({ name: '', city: '', quote: '', stars: 5 });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const inputStyle: React.CSSProperties = {
    fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: DARK, backgroundColor: '#FFFFFF',
    border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '12px 14px', width: '100%', outline: 'none', boxSizing: 'border-box',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.quote.trim()) return;
    setStatus('sending');
    const review = { name: form.name.trim(), city: form.city.trim(), quote: form.quote.trim(), stars: form.stars };
    const { error } = await supabase.from('reviews').insert([review]);
    if (error) { setStatus('error'); }
    else {
      setStatus('done');
      onDone(review);
      setTimeout(onClose, 1400);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.22 }}
        dir="rtl"
        style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: 'clamp(24px, 4vw, 40px)', width: '100%', maxWidth: '520px', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '18px', left: '18px', background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}>
          <X size={20} />
        </button>

        {status === 'done' ? (
          <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: "'Heebo', sans-serif" }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🙏</div>
            <p style={{ fontWeight: 700, fontSize: '17px', color: DARK, margin: '0 0 6px' }}>תודה על ההמלצה!</p>
            <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>אנחנו מעריכים את זה.</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(18px, 2.4vw, 24px)', color: DARK, margin: '0 0 6px' }}>
              שתפו אותנו בחוויה שלכם
            </h3>
            <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: MUTED, margin: '0 0 24px' }}>
              קניתם Spinz? נשמח לשמוע מה דעתכם.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: MUTED, display: 'block', marginBottom: '8px' }}>דירוג</label>
                <StarPicker value={form.stars} onChange={stars => setForm(f => ({ ...f, stars }))} />
              </div>
              <div>
                <label style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: MUTED, display: 'block', marginBottom: '6px' }}>ההמלצה שלך *</label>
                <textarea required rows={3} value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} placeholder="ספרו על החוויה שלכם..." style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: MUTED, display: 'block', marginBottom: '6px' }}>שם *</label>
                  <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="שם מלא" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: MUTED, display: 'block', marginBottom: '6px' }}>עיר</label>
                  <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="תל אביב" style={inputStyle} />
                </div>
              </div>
              {status === 'error' && <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#c0392b', margin: 0 }}>משהו השתבש. נסו שוב.</p>}
              <button type="submit" disabled={status === 'sending'}
                style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '14px', color: DARK, backgroundColor: GOLD, border: 'none', borderRadius: '10px', padding: '13px 28px', cursor: status === 'sending' ? 'wait' : 'pointer', opacity: status === 'sending' ? 0.7 : 1 }}>
                {status === 'sending' ? 'שולח...' : 'שלח המלצה'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(SEED);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    supabase.from('reviews').select('id, name, city, quote, stars').order('created_at', { ascending: false }).then(({ data }) => {
      if (data && data.length) setReviews(data as Review[]);
    });
  }, []);

  return (
    <PageShell
      eyebrow="Reviews"
      title="מה אומרים עלינו."
      subtitle="לקוחות אמיתיים, חוויות אמיתיות. רוצים להוסיף את שלכם?"
    >
      <section style={{ backgroundColor: '#F5F2EC', padding: 'clamp(56px, 8vw, 96px) clamp(20px, 6vw, 64px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* CTA bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Stars n={5} size={20} />
              <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', fontWeight: 600, color: DARK }}>
                {reviews.length} המלצות מלקוחות
              </span>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: GOLD, color: DARK, fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '14px', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              <Plus size={18} /> השאירו המלצה
            </button>
          </div>

          {/* Reviews grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {reviews.map((r, i) => (
              <motion.div
                key={r.id || i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <Stars n={r.stars} />
                <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: '#2A2A2A', lineHeight: 1.7, margin: 0, flex: 1 }}>"{r.quote}"</p>
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '14px' }}>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, color: DARK }}>{r.name}</span>
                  {r.city && <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: MUTED }}> · {r.city}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {modalOpen && (
          <ReviewModal
            onClose={() => setModalOpen(false)}
            onDone={r => setReviews(prev => [r, ...prev])}
          />
        )}
      </AnimatePresence>
    </PageShell>
  );
}
