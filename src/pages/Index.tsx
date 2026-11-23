import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import VideoSection from '../components/VideoSection';
import Models from '../components/Models';
import TrustBar from '../components/TrustBar';
import StoryBand from '../components/StoryBand';
import ExploreStrip from '../components/ExploreStrip';
import LeadForm from '../components/LeadForm';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { LOADER_DONE_EVENT } from '../lib/consent';
import { CartProvider } from '../context/CartContext';
import { useLenis } from '../hooks/useLenis';
import { useT } from '../i18n/LanguageContext';

// Read fresh on every mount (lazy initializer) — NOT once at module load.
// Otherwise navigating back to the homepage replays the intro loader, because
// the module-level value was captured before sessionStorage was ever set.
// אחסון חסום (הגדרות פרטיות): הקריאה זורקת. הזיכרון מחליף את האחסון,
// כך שמסך הפתיחה יחזור רק אחרי רענון מלא — והאתר לא נשבר.
let loadedInMemory = false;
const hasLoaded = () => {
  if (typeof window === 'undefined') return false;
  try { return sessionStorage.getItem('spinz-loaded') === '1'; } catch { return loadedInMemory; }
};

const Index = () => {
  const t = useT();
  // דף הבית אינו עובר דרך PageShell, ולכן כותרתו נקבעת כאן.
  useEffect(() => { document.title = t.meta.homeTitle; }, [t]);

  // מסך הפתיחה הוסר (23.11.2026): כמעט 3 שניות המתנה בכל כניסה מאינסטגרם,
  // כשמבקר שלא קונה נשאר בחציון 11 שניות. רכיב Loader נשאר בקוד אם נרצה אותו בחזרה.
  // באנר העוגיות מחכה ל"סוף מסך הפתיחה" (spinz-loaded / LOADER_DONE_EVENT), ולכן
  // מסמנים אותו כבר ברינדור הראשון — לפני שהבאנר קורא את הסימון — ושולחים את האירוע.
  const [showLoader] = useState(() => {
    if (!hasLoaded()) {
      loadedInMemory = true;
      try { sessionStorage.setItem('spinz-loaded', '1'); } catch { /* אחסון חסום */ }
    }
    return false;
  });
  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event(LOADER_DONE_EVENT)), 0);
    return () => clearTimeout(t);
  }, []);
  useLenis();

  // Scroll to hash target when arriving from another page (e.g. /#lead-form, /#models)
  useEffect(() => {
    if (showLoader) return;
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const t = setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
      return () => clearTimeout(t);
    }
  }, [showLoader]);

  return (
    <CartProvider>
      <CartDrawer />
      <main style={{ backgroundColor: '#F5F2EC', minHeight: '100vh' }}>
        <Navbar />
        <VideoSection />
        <Models />
        <TrustBar />
        <StoryBand />
        <ExploreStrip />
        <LeadForm />
        <Footer />
      </main>
    </CartProvider>
  );
};

export default Index;
