import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronDown, Search } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AnnouncementBar from './AnnouncementBar';
import SearchModal from './SearchModal';
import { scrollToTop } from '../lib/scrollTop';
import LangSwitch from './LangSwitch';
import { useLang, useT, useDir, localizePath } from '../i18n/LanguageContext';
import type { Dict } from '../i18n/dict';
import { usePresale } from '../config/presale';

const DARK  = '#1C1C1C';
const LIGHT = '#F5F2EC';
const GOLD  = '#C9A870';

type MenuItem = { label: string; to: string };
type Menu = { label: string; items: MenuItem[] };

const buildMenus = (t: Dict): Menu[] => [
  {
    label: t.nav.groups.bikes,
    items: [
      { label: t.nav.links.models, to: '/bikes' },
      { label: t.nav.links.specs, to: '/specs' },
      { label: t.nav.links.sizes, to: '/sizes' },
    ],
  },
  {
    label: t.nav.groups.info,
    items: [
      { label: t.nav.links.faq, to: '/faq' },
      { label: t.nav.links.guides, to: '/guides' },
    ],
  },
  {
    label: t.nav.groups.brand,
    items: [
      { label: t.nav.links.story, to: '/story' },
      { label: t.nav.links.gallery, to: '/gallery' },
      { label: t.nav.links.community, to: '/community' },
      { label: t.nav.links.reviews, to: '/reviews' },
    ],
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalCount, openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const presale = usePresale();
  const lang = useLang();
  const dir = useDir();
  const t = useT();
  const menus = buildMenus(t);
  /** Keeps every nav link inside the current language. */
  const L = (to: string) => localizePath(to, lang);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // ⌘K / Ctrl+K opens search, and "/" does too unless the user is typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing = el instanceof HTMLElement &&
        (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(v => !v);
      } else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
    setMobileExpanded(null);
  }, [location.pathname]);

  // The logo and the "בית" links must always land on the video at the very top —
  // both when coming from another page (React Router keeps the old scroll
  // offset) and when already on the home page (no navigation happens at all).
  const goHome = () => {
    setMenuOpen(false);
    scrollToTop();
    requestAnimationFrame(scrollToTop);
  };

  const goContact = () => {
    if (location.pathname === L('/')) {
      document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(L('/') + '#lead-form');
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: LIGHT,
          borderBottom: `1px solid ${DARK}`,
          boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.1)' : 'none',
          transition: 'box-shadow 0.3s',
          // iOS Safari: force own compositing layer so the fixed bar
          // repaints instantly when the URL bar collapses/expands
          transform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          paddingTop: 'env(safe-area-inset-top)',
        }}
        dir={dir}
      >
        <AnnouncementBar />
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-9">
          {/* Logo */}
          <Link to={L("/")} onClick={goHome} aria-label={t.nav.logoAria} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0, padding: '10px 0' }}>
            <img src="/assets/logo.png" alt="SPINZ" className="h-6 md:h-[48px]" style={{ width: 'auto' }} />
          </Link>

          {/* Desktop nav with dropdowns */}
          <nav className="hidden md:flex items-center gap-7">
            {/* Home link */}
            <Link
              to={L("/")}
              onClick={goHome}
              style={{
                fontFamily: "'Heebo', sans-serif", color: '#555',
                fontWeight: 500, fontSize: '15px', textDecoration: 'none',
                padding: '4px 0', whiteSpace: 'nowrap', transition: 'color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = DARK; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#555'; }}
            >
              {t.nav.home}
            </Link>

            {menus.map(menu => (
              <div
                key={menu.label}
                style={{ position: 'relative' }}
                onMouseEnter={() => setOpenDropdown(menu.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    fontFamily: "'Heebo', sans-serif",
                    color: openDropdown === menu.label ? DARK : '#555',
                    fontWeight: 500, fontSize: '15px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 0', whiteSpace: 'nowrap',
                    transition: 'color 0.2s',
                  }}
                >
                  {menu.label}
                  <ChevronDown size={15} style={{ transform: openDropdown === menu.label ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                <AnimatePresence>
                  {openDropdown === menu.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        position: 'absolute', top: '100%', insetInlineStart: 0,
                        marginTop: '8px', minWidth: '190px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E0DCD4',
                        borderRadius: '12px',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                        padding: '8px', overflow: 'hidden',
                      }}
                    >
                      {menu.items.map(item => (
                        <Link
                          key={item.to}
                          to={L(item.to)}
                          style={{
                            display: 'block', padding: '10px 14px',
                            fontFamily: "'Heebo', sans-serif", fontSize: '14px',
                            color: '#3A3A3A', textDecoration: 'none',
                            borderRadius: '8px', transition: 'all 0.15s',
                            fontWeight: 500,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F5F2EC'; e.currentTarget.style.color = GOLD; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#3A3A3A'; }}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Direct contact link */}
            <button
              onClick={goContact}
              style={{
                fontFamily: "'Heebo', sans-serif", color: '#555',
                fontWeight: 500, fontSize: '15px',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 0', whiteSpace: 'nowrap', transition: 'color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = DARK; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#555'; }}
            >
              {t.nav.contact}
            </button>
          </nav>

          {/* CTA + search + cart + hamburger */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={goContact}
              className="hidden md:inline-block font-bold uppercase tracking-widest text-xs py-[6px] px-[10px]"
              style={{
                backgroundColor: GOLD, color: DARK,
                fontFamily: "'Heebo', sans-serif", borderRadius: '4px',
                border: 'none', cursor: 'pointer',
                transition: 'background-color 0.25s, transform 0.25s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#B8933A'; e.currentTarget.style.transform = 'translateY(2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {t.nav.cta}
            </button>

            <div className="hidden md:block"><LangSwitch /></div>

            {/* Search – icon only, identical box to the cart button */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label={t.nav.search}
              title={`${t.nav.search} (⌘K)`}
              className="flex items-center justify-center"
              style={{
                border: `1px solid ${DARK}`, borderRadius: '4px',
                color: DARK, padding: '13px 13px', cursor: 'pointer', flexShrink: 0,
                backgroundColor: 'transparent', transition: 'background-color 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Search size={16} />
            </button>

            {/* Cart */}
            <button
              onClick={openCart}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', backgroundColor: 'transparent',
                border: `1px solid ${DARK}`, borderRadius: '4px',
                color: DARK, padding: '13px 13px', cursor: 'pointer',
                transition: 'background-color 0.25s', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
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

            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col justify-center items-center gap-[5px]"
              onClick={() => setMenuOpen(v => !v)}
              aria-label={t.nav.menu}
              style={{ width: '44px', height: '44px', backgroundColor: 'transparent', border: `1px solid ${DARK}`, borderRadius: '4px', cursor: 'pointer', flexShrink: 0 }}
            >
              <span style={{ display: 'block', width: '16px', height: '1.5px', backgroundColor: DARK, transition: 'transform 0.3s, opacity 0.3s', transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' }} />
              <span style={{ display: 'block', width: '16px', height: '1.5px', backgroundColor: DARK, transition: 'opacity 0.3s', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: 'block', width: '16px', height: '1.5px', backgroundColor: DARK, transition: 'transform 0.3s, opacity 0.3s', transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none' }} />
            </button>
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
            className="fixed inset-0 z-40 flex flex-col md:hidden overflow-y-auto"
            style={{ backgroundColor: DARK, paddingTop: presale.active ? '112px' : '72px' }}
            dir={dir}
          >
            <nav className="flex flex-col">
              {/* Search */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                style={{ padding: '0 36px 4px' }}
              >
                <button
                  onClick={() => { setMenuOpen(false); setTimeout(() => setSearchOpen(true), 260); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    backgroundColor: '#252525', border: '1px solid #333333',
                    borderRadius: '8px', padding: '14px 16px', cursor: 'pointer',
                    color: '#9A9690', fontFamily: "'Heebo', sans-serif", fontSize: '16px',
                    textAlign: 'start',
                  }}
                >
                  <Search size={18} color={GOLD} />
                  {t.nav.search}
                </button>
              </motion.div>

              {/* Home link */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 }}
                style={{ borderBottom: '1px solid #2A2A2A' }}
              >
                <Link
                  to={L("/")}
                  onClick={goHome}
                  style={{
                    display: 'block', width: '100%', color: LIGHT, fontFamily: "'Heebo', sans-serif",
                    fontSize: '24px', fontWeight: 600, padding: '18px 36px',
                    textDecoration: 'none', textAlign: 'start',
                  }}
                >
                  {t.nav.home}
                </Link>
              </motion.div>

              {menus.map((menu, i) => (
                <div key={menu.label} style={{ borderBottom: '1px solid #2A2A2A' }}>
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    onClick={() => setMobileExpanded(e => e === menu.label ? null : menu.label)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: LIGHT, fontFamily: "'Heebo', sans-serif", fontSize: '24px', fontWeight: 600,
                      padding: '18px 36px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'start',
                    }}
                  >
                    {menu.label}
                    <ChevronDown size={22} color={GOLD} style={{ transform: mobileExpanded === menu.label ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
                  </motion.button>
                  <AnimatePresence>
                    {mobileExpanded === menu.label && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden', backgroundColor: '#161514' }}
                      >
                        {menu.items.map(item => (
                          <Link
                            key={item.to}
                            to={L(item.to)}
                            onClick={() => setMenuOpen(false)}
                            style={{
                              display: 'block', color: '#C9C5BD', fontFamily: "'Heebo', sans-serif",
                              fontSize: '17px', fontWeight: 400, padding: '14px 48px', textDecoration: 'none',
                            }}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Contact direct */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + menus.length * 0.06 }}
                onClick={() => { setMenuOpen(false); setTimeout(goContact, 350); }}
                style={{
                  width: '100%', color: GOLD, fontFamily: "'Heebo', sans-serif",
                  fontSize: '24px', fontWeight: 600, padding: '18px 36px',
                  borderBottom: '1px solid #2A2A2A', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'start',
                }}
              >
                {t.nav.contact}
              </motion.button>
            </nav>

            <div style={{ padding: '0 36px 12px', display: 'flex', justifyContent: 'flex-start' }}>
              <LangSwitch variant="dark" />
            </div>

            <div style={{ padding: '0 36px 36px' }}>
              <button
                onClick={() => { setMenuOpen(false); setTimeout(goContact, 350); }}
                style={{
                  display: 'block', width: '100%', backgroundColor: GOLD, color: DARK,
                  textAlign: 'center', padding: '16px', fontFamily: "'Heebo', sans-serif",
                  fontWeight: 700, fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase',
                  borderRadius: '4px', border: 'none', cursor: 'pointer',
                }}
              >
                {t.nav.cta}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
