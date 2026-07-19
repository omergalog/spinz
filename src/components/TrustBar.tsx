import { motion } from 'framer-motion';
import { ShieldCheck, Truck, CreditCard, MapPin } from 'lucide-react';

const DARK = '#1C1C1C';
const MUTED = '#6A6862';
const GOLD = '#C9A870';
const BORDER = '#E2DED8';

const items = [
  { icon: ShieldCheck, title: 'אחריות 5 שנים', sub: 'על שלדת האלומיניום' },
  { icon: Truck, title: 'משלוח מהיר', sub: 'עד 5 ימי עסקים לכל הארץ' },
  { icon: CreditCard, title: 'עד 13 תשלומים', sub: 'אשראי, ביט, Apple Pay' },
  { icon: MapPin, title: 'איסוף עצמי חינם', sub: 'מתל אביב, בתיאום מראש' },
];

export default function TrustBar() {
  return (
    <section dir="rtl" style={{ backgroundColor: '#EAE7E1', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-16 py-5 lg:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-7">
          {items.map(({ icon: Icon, title, sub }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
            >
              <Icon size={22} color={GOLD} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '14px', color: DARK, lineHeight: 1.3, marginBottom: '3px' }}>
                  {title}
                </div>
                <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: MUTED, lineHeight: 1.45 }}>
                  {sub}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
