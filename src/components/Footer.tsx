import { motion } from 'framer-motion';
import { Instagram, MessageCircle } from 'lucide-react';

const TEXT = '#EDEBE6';
const TEXT_MUTED = '#888';
const BG = '#1C1C1C';
const BORDER = '#2A2A2A';
const GOLD = '#C9A870';
const WHATSAPP_NUMBER = '+972500000000';

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

const navLinks = [
  { label: 'בית', href: '#' },
  { label: 'מודלים', href: '#models' },
  { label: 'חנות', href: '#shop' },
  { label: 'צור קשר', href: '#lead-form' },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/spinz', icon: <Instagram size={15} /> },
  { label: 'TikTok', href: 'https://tiktok.com/@spinz', icon: <TikTokIcon size={15} /> },
];

export default function Footer() {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent('היי, אני מתעניין באופני Spinz')}`;

  return (
    <>
      <footer className="relative overflow-hidden" style={{ backgroundColor: BG }} dir="rtl">

        <div className="mx-auto max-w-7xl px-6 lg:px-16">

          {/* Main row */}
          <div className="flex flex-col gap-12 py-16 md:flex-row md:items-start md:justify-between">

            {/* Brand */}
            <div className="flex flex-col gap-5">
              <img src="/assets/logo.png" alt="SPINZ" style={{ height: '44px', width: 'auto', maxWidth: '200px', objectFit: 'contain', filter: 'invert(1) brightness(2)' }} />
              <p className="max-w-[200px] text-sm leading-relaxed" style={{ fontFamily: "'Heebo', sans-serif", color: TEXT_MUTED }}>
                אופני עיר סינגל ספיד. בנויים לרחובות, מעוצבים לבלוט.
              </p>

              <div className="flex items-center gap-2 pt-1">
                {socialLinks.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-8 w-8 items-center justify-center transition-all duration-300"
                    style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.borderColor = GOLD;
                      el.style.color = GOLD;
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.borderColor = BORDER;
                      el.style.color = TEXT_MUTED;
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider transition-all duration-300"
                  style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED, fontFamily: "'Heebo', sans-serif" }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = '#25D36640';
                    el.style.color = '#25D366';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = BORDER;
                    el.style.color = TEXT_MUTED;
                  }}
                >
                  <MessageCircle size={13} />
                  WA
                </a>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-2">
              <span className="mb-2 text-[10px] uppercase tracking-[0.35em]" style={{ color: '#444', fontFamily: "'Heebo', sans-serif" }}>
                ניווט
              </span>
              {navLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="w-fit text-sm transition-colors duration-200"
                  style={{ color: TEXT_MUTED, fontFamily: "'Heebo', sans-serif" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = TEXT)}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = TEXT_MUTED)}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Contact */}
            <div className="flex flex-col gap-2">
              <span className="mb-2 text-[10px] uppercase tracking-[0.35em]" style={{ color: '#444', fontFamily: "'Heebo', sans-serif" }}>
                צור קשר
              </span>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit text-sm transition-colors duration-200"
                style={{ color: TEXT_MUTED, fontFamily: "'Heebo', sans-serif" }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#25D366')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = TEXT_MUTED)}
              >
                WhatsApp
              </a>
              <a
                href="https://instagram.com/spinz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit text-sm transition-colors duration-200"
                style={{ color: TEXT_MUTED, fontFamily: "'Heebo', sans-serif" }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = GOLD)}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = TEXT_MUTED)}
              >
                @spinz
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-2 py-6 md:flex-row" style={{ borderTop: `1px solid ${BORDER}` }}>
            <p className="text-xs" style={{ color: '#444', fontFamily: "'Heebo', sans-serif" }}>
              © 2025 Spinz. כל הזכויות שמורות.
            </p>
            <p className="text-xs" style={{ color: '#333', fontFamily: "'Heebo', sans-serif" }}>
              Built in Tel Aviv
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <motion.a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="פנה אלינו ב-WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 1.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center shadow-xl md:hidden"
        style={{ backgroundColor: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,0.3)' }}
      >
        <MessageCircle size={22} color="#fff" fill="#fff" />
      </motion.a>
    </>
  );
}
