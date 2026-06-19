import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import { CartProvider } from '../context/CartContext';

type Props = {
  children: React.ReactNode;
  /** Optional hero band shown under the navbar */
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export default function PageShell({ children, eyebrow, title, subtitle }: Props) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <CartProvider>
      <CartDrawer />
      <div style={{ backgroundColor: '#F5F2EC', minHeight: '100vh' }} dir="rtl">
        <Navbar />

        {/* Spacer for fixed navbar */}
        <div style={{ height: '64px' }} />

        {/* Page hero band */}
        {(title || eyebrow) && (
          <header
            style={{
              backgroundColor: '#1C1C1C',
              padding: 'clamp(48px, 8vw, 96px) clamp(20px, 6vw, 64px)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: '3px', height: '64px', backgroundColor: '#C9A870', opacity: 0.7 }} />
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
              {eyebrow && (
                <span style={{
                  display: 'block', marginBottom: '14px',
                  fontFamily: "'Heebo', sans-serif", fontSize: '11px',
                  letterSpacing: '0.4em', textTransform: 'uppercase', color: '#C9A870',
                }}>
                  {eyebrow}
                </span>
              )}
              {title && (
                <h1 style={{
                  fontFamily: "'Heebo', sans-serif", fontWeight: 800,
                  fontSize: 'clamp(32px, 6vw, 68px)', color: '#EDEBE6',
                  letterSpacing: '-0.02em', lineHeight: 1.05, margin: 0,
                }}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p style={{
                  fontFamily: "'Heebo', sans-serif", fontSize: 'clamp(14px, 1.6vw, 18px)',
                  color: 'rgba(237,235,230,0.65)', lineHeight: 1.6, margin: '18px 0 0', maxWidth: '620px',
                }}>
                  {subtitle}
                </p>
              )}
            </div>
          </header>
        )}

        {/* Content */}
        <main>{children}</main>

        <Footer />
      </div>
    </CartProvider>
  );
}
