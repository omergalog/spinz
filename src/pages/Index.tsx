import { useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import SpinzVibe from '../components/SpinzVibe';
import Models from '../components/Models';
import Lifestyle from '../components/Lifestyle';
import Gallery from '../components/Gallery';
import Reviews from '../components/Reviews';
import Specs from '../components/Specs';
import FAQ from '../components/FAQ';
import LeadForm from '../components/LeadForm';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import CustomCursor from '../components/CustomCursor';
import CartDrawer from '../components/CartDrawer';
import CookieBanner from '../components/CookieBanner';
import { CartProvider } from '../context/CartContext';
import { useLenis } from '../hooks/useLenis';

const alreadyLoaded =
  typeof window !== 'undefined' && sessionStorage.getItem('spinz-loaded') === '1';

const Index = () => {
  const [showLoader, setShowLoader] = useState(!alreadyLoaded);
  const [loaderDone, setLoaderDone] = useState(alreadyLoaded);
  useLenis();

  const handleLoaderDone = useCallback(() => {
    sessionStorage.setItem('spinz-loaded', '1');
    setShowLoader(false);
    setLoaderDone(true);
  }, []);

  return (
    <CartProvider>
      <CustomCursor />
      {showLoader && <Loader onDone={handleLoaderDone} />}
      <CartDrawer />
      <CookieBanner loaderDone={loaderDone} />
      <main style={{ backgroundColor: '#F5F2EC', minHeight: '100vh' }}>
        <Navbar />
        <Hero />
        <SpinzVibe />
        <Models />
        <Lifestyle />
        <Gallery />
        <Reviews />
        <Specs />
        <FAQ />
        <LeadForm />
        <Footer />
      </main>
    </CartProvider>
  );
};

export default Index;
