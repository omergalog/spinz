import { motion } from 'framer-motion';
import { Instagram, MessageCircle } from 'lucide-react';

const TEXT = '#EDEBE6';
const TEXT_MUTED = '#FFFFFF';
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

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-2 py-6 md:flex-row" style={{ borderTop: `1px solid ${BORDER}` }}>
            <p className="text-xs" style={{ color: '#FFFFFF', fontFamily: "'Heebo', sans-serif" }}>
              © 2025 Spinz. כל הזכויות שמורות.
            </p>
            <p className="text-xs" style={{ color: '#FFFFFF', fontFamily: "'Heebo', sans-serif" }}>
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
