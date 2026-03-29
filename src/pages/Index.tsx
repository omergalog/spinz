import { useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import BrandStatement from '../components/BrandStatement';
import Models from '../components/Models';
import Gallery from '../components/Gallery';
import About from '../components/About';
import LeadForm from '../components/LeadForm';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import CustomCursor from '../components/CustomCursor';
import { useLenis } from '../hooks/useLenis';

const alreadyLoaded =
  typeof window !== 'undefined' && sessionStorage.getItem('spinz-loaded') === '1';

const Index = () => {
  const [showLoader, setShowLoader] = useState(!alreadyLoaded);
  useLenis();

  const handleLoaderDone = useCallback(() => {
    sessionStorage.setItem('spinz-loaded', '1');
    setShowLoader(false);
  }, []);

  return (
    <>
      <CustomCursor />
      {showLoader && <Loader onDone={handleLoaderDone} />}
      <main style={{ backgroundColor: '#F5F2EC', minHeight: '100vh' }}>
        <Navbar />
        <Hero />
        <BrandStatement />
        <About />
        <Models />
        <Gallery />
        <LeadForm />
        <Footer />
      </main>
    </>
  );
};

export default Index;
