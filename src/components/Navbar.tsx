import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const DARK  = '#1C1C1C';
const LIGHT = '#F5F2EC';
const GOLD  = '#C9A870';

const navLinks = [
  { label: 'עלינו',  href: '#why-spinz' },
  { label: 'מודלים', href: '#models'    },
  { label: 'גלריה',  href: '#gallery'   },
];

function scrollTo(href: string) {
  if (href === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { totalCount, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = ['why-spinz', 'models', 'gallery', 'lead-form'];
    const observers: IntersectionObserver[] = [];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActiveSection(`#${id}`); },
        { threshold: 0.3 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: LIGHT, borderBottom: `1px solid ${DARK}`, boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.1)' : 'none', transition: 'box-shadow 0.3s' }}
        dir="rtl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-9">
          {/* Logo */}
          <a
            href="#"
            onClick={e => { e.preventDefault(); scrollTo('#'); }}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          >
            <img src="/assets/logo.png" alt="SPINZ" className="h-6 md:h-[48px]" style={{ width: 'auto' }} />
          </a>

          {/* Nav — all screens */}
          <nav className="flex items-center gap-2 md:gap-9">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={e => { e.preventDefault(); scrollTo(link.href); }}
                style={{
                  fontFamily: "'Heebo', sans-serif",
                  color: activeSection === link.href ? DARK : '#888',
                  fontWeight: activeSection === link.href ? 600 : 400,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                  whiteSpace: 'nowrap',
                }}
                className="text-[13px] md:text-[15px]"
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.5'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-3">
            {/* CTA desktop */}
            <a
              href="#lead-form"
              onClick={e => { e.preventDefault(); scrollTo('#lead-form'); }}
              className="inline-block font-bold uppercase tracking-widest text-[9px] md:text-xs py-1 px-2 md:py-[6px] md:px-[10px]"
              style={{
                backgroundColor: GOLD,
                color: DARK,
                fontFamily: "'Heebo', sans-serif",
                borderRadius: '4px',
                textDecoration: 'none',
                transition: 'background-color 0.25s, transform 0.25s',
                whiteSpace: 'nowrap',
                animation: 'btnSlide 1.2s ease-in-out infinite',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = '#B8933A';
                el.style.transform = 'translateY(2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = GOLD;
                el.style.transform = 'translateY(0)';
              }}
            >
              בואו נדבר
            </a>

            {/* Cart button */}
            <button
              onClick={openCart}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                backgroundColor: 'transparent',
                border: `1px solid ${DARK}`,
                borderRadius: '4px',
                color: DARK,
                padding: '6px 8px',
                cursor: 'pointer',
                transition: 'background-color 0.25s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
            >
              <ShoppingCart size={16} />
              {totalCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', left: '-6px',
                  backgroundColor: GOLD, color: DARK,
                  fontFamily: "'Heebo', sans-serif", fontSize: '10px', fontWeight: 700,
                  borderRadius: '50%', width: '18px', height: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {totalCount}
                </span>
              )}
            </button>

            {/* Hamburger — hidden (nav always visible) */}
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col md:hidden"
            style={{ backgroundColor: DARK, paddingTop: '64px' }}
            dir="rtl"
          >
            <nav className="flex flex-col">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  onClick={e => {
                    e.preventDefault();
                    setMenuOpen(false);
                    setTimeout(() => scrollTo(link.href), 350);
                  }}
                  style={{
                    color: LIGHT,
                    fontFamily: "'Heebo', sans-serif",
                    fontSize: '26px',
                    fontWeight: 600,
                    padding: '18px 36px',
                    borderBottom: '1px solid #2A2A2A',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
            <div style={{ padding: '36px' }}>
              <a
                href="#lead-form"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  backgroundColor: GOLD,
                  color: DARK,
                  textAlign: 'center',
                  padding: '16px',
                  fontFamily: "'Heebo', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  textDecoration: 'none',
                }}
              >
                בואו נדבר
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
