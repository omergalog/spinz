import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const BG = '#1C1C1C';
const BORDER = '#2A2A2A';
const WHATSAPP_NUMBER = '+972527565262';

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
