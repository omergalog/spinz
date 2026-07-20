import { motion } from 'framer-motion';
import { MessageCircle, Mail, Instagram, MapPin } from 'lucide-react';
import PageShell from '../components/PageShell';
import { COMPANY } from '../config/company';
import LeadForm from '../components/LeadForm';

const GOLD = '#C9A870';
const DARK = '#1C1C1C';
const MUTED = '#6A6862';
const BORDER = '#E0DCD4';
const CARD = '#FFFFFF';

const WHATSAPP = '+972527565262';
const whatsappHref = `https://wa.me/${WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent('היי, אני מתעניין באופני Spinz')}`;

const channels = [
  { icon: MessageCircle, label: 'WhatsApp', value: 'שלחו לנו הודעה', href: whatsappHref },
  { icon: Mail, label: 'אימייל', value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  { icon: Instagram, label: 'אינסטגרם', value: '@spinz.bikes', href: 'https://instagram.com/spinz.bikes' },
];

export default function Contact() {
  return (
    <PageShell
      eyebrow="Get in Touch"
      title="צור קשר."
      subtitle="יש שאלה? רוצים להתייעץ לפני שמזמינים? אנחנו כאן."
      heroImage="/assets/for-hero.jpg"
      heroPosition="center 70%"
    >
      <section style={{ backgroundColor: '#F5F2EC', padding: 'clamp(56px, 8vw, 96px) clamp(20px, 6vw, 64px)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Channels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {channels.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '18px', padding: '28px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#F5F2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD }}>
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '17px', color: DARK, margin: '0 0 2px' }}>{c.label}</h3>
                    <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: MUTED, margin: 0 }}>{c.value}</p>
                  </div>
                </motion.a>
              );
            })}
          </div>

          {/* Location note */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: MUTED }}>
            <MapPin size={16} color={GOLD} />
            <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px' }}>Designed in Tel Aviv · משלוחים לכל הארץ</span>
          </div>
        </div>
      </section>

      {/* Lead form (dark) */}
      <LeadForm />
    </PageShell>
  );
}
