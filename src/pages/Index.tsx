import { useState, useCallback, useEffect } from 'react';
import Navbar from '../components/Navbar';
import VideoSection from '../components/VideoSection';
import Models from '../components/Models';
import TrustBar from '../components/TrustBar';
import StoryBand from '../components/StoryBand';
import ExploreStrip from '../components/ExploreStrip';
import LeadForm from '../components/LeadForm';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import CartDrawer from '../components/CartDrawer';
import CookieBanner from '../components/CookieBanner';
import { CartProvider } from '../context/CartContext';
import { useLenis } from '../hooks/useLenis';

// Read fresh on every mount (lazy initializer) — NOT once at module load.
// Otherwise navigating back to the homepage replays the intro loader, because
// the module-level value was captured before sessionStorage was ever set.
const hasLoaded = () =>
  typeof window !== 'undefined' && sessionStorage.getItem('spinz-loaded') === '1';

const Index = () => {
  const [showLoader, setShowLoader] = useState(() => !hasLoaded());
  const [loaderDone, setLoaderDone] = useState(hasLoaded);
  useLenis();

  const handleLoaderDone = useCallback(() => {
    sessionStorage.setItem('spinz-loaded', '1');
    setShowLoader(false);
    setLoaderDone(true);
  }, []);

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
      {showLoader && <Loader onDone={handleLoaderDone} />}
      <CartDrawer />
      <CookieBanner loaderDone={loaderDone} />
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
