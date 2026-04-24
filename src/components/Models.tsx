import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import { colorVariants, sizeVariants } from '../data/models';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

const DARK   = '#1C1C1C';
const BEIGE  = '#F5F2EC';
const GOLD   = '#C9A870';
const BORDER = '#E2DED8';
const MUTED  = '#6A6862';

const BASE_PRICE = 2290;

export default function Models() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-40px' });

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [added, setAdded] = useState(false);
  const [outOfStock, setOutOfStock] = useState(false);
  const [price, setPrice] = useState(BASE_PRICE);
  const [salePrice, setSalePrice] = useState<number | null>(null);

  const { addItem } = useCart();
  const color = colorVariants[selectedColor];
  const size  = sizeVariants[selectedSize];

  useEffect(() => {
    const slug = `spinz-${color.id}-${size.id}`;
    supabase.from('products').select('stock, price, sale_price').eq('slug', slug).single().then(({ data }) => {
      if (!data) return;
      setOutOfStock(data.stock === 0);
      if (data.price) setPrice(data.price);
      setSalePrice(data.sale_price ?? null);
    });
  }, [selectedColor, selectedSize]);

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem({
      id: `spinz-${size.id}-${color.id}`,
      name: `SPINZ ${size.id} — ${color.label}`,
      tagline: size.range,
      image: color.image,
      price: salePrice ?? price,
      accentColor: color.hex,
      features: [],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const displayPrice = salePrice ?? price;

  return (
    <section
      ref={ref}
      id="models"
      dir="rtl"
      style={{ backgroundColor: BEIGE, position: 'relative' }}
      className="py-20 lg:py-0"
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row min-h-[80vh]">

          {/* RIGHT — image */}
          <div className="lg:flex-1 flex items-center justify-center bg-[#F0EDE7] p-8 lg:p-16 order-1 lg:order-2 min-h-[50vw] lg:min-h-0" style={{ position: 'relative' }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={color.id}
                src={color.image}
                alt={color.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: outOfStock ? 0.35 : 1, y: 0, filter: outOfStock ? 'grayscale(1)' : 'grayscale(0)' }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', maxWidth: '520px', height: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }}
              />
            </AnimatePresence>
            <AnimatePresence>
              {outOfStock && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute', top: '50%', left: 0, right: 0,
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    color: '#FFFFFF',
                    fontFamily: "'Heebo', sans-serif",
                    fontSize: '13px', fontWeight: 600,
                    letterSpacing: '2.5px', textTransform: 'uppercase',
                    padding: '10px 0',
                    textAlign: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                    borderBottom: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  Out of Stock
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LEFT — selector */}
          <div className="lg:w-[480px] flex flex-col justify-center p-8 lg:p-16 order-2 lg:order-1" style={{ borderLeft: `1px solid ${BORDER}` }}>

            {/* Label */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7 }}
              style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: MUTED, display: 'block', marginBottom: '12px' }}
            >
              הדגם שלנו
            </motion.span>

            {/* Heading */}
            <div ref={headingRef} style={{ overflow: 'hidden', marginBottom: '8px' }}>
              <motion.h2
                initial={{ y: '105%' }}
                animate={headingInView ? { y: '0%' } : {}}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
                style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(32px, 5vw, 56px)', color: DARK, letterSpacing: '-0.02em', lineHeight: 1, margin: 0 }}
              >
                SPINZ Urban
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: MUTED, lineHeight: 1.6, margin: '0 0 32px' }}
            >
              סינגל ספיד אורבני. שלדת אלומיניום, עיצוב שאי אפשר להתעלם ממנו.
            </motion.p>

            <div style={{ height: '1px', backgroundColor: BORDER, marginBottom: '28px' }} />

            {/* Color selector */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.25 }}
              style={{ marginBottom: '28px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: DARK, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  צבע
                </span>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: GOLD, fontWeight: 600 }}>
                  {color.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {colorVariants.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(i)}
                    title={c.label}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: selectedColor === i ? `3px solid ${GOLD}` : '3px solid transparent',
                      outline: selectedColor === i ? `1px solid ${GOLD}` : '1px solid transparent',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.2s',
                      boxShadow: selectedColor === i ? `0 0 0 2px ${BEIGE}, 0 0 0 4px ${GOLD}` : 'none',
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Size selector */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.32 }}
              style={{ marginBottom: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: DARK, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  מידה
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {sizeVariants.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(i)}
                    style={{
                      width: '60px',
                      height: '44px',
                      borderRadius: '8px',
                      backgroundColor: selectedSize === i ? DARK : 'transparent',
                      color: selectedSize === i ? '#EDEBE6' : DARK,
                      border: `1px solid ${selectedSize === i ? DARK : BORDER}`,
                      fontFamily: "'Heebo', sans-serif",
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Quick specs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.36 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}
            >
              {[
                { icon: '⬡', label: 'שלדת אלומיניום', sub: 'גיאומטריה עירונית' },
                { icon: '◎', label: 'Kenda 700×32c', sub: 'עמידים לפנצ\'ר' },
                { icon: '⚙', label: 'סינגל-ספיד 46T/16T', sub: 'מכויל לעיר' },
                { icon: '◈', label: 'גלגלי 700c', sub: 'פרופיל גבוה 30 מ"מ' },
              ].map(({ icon, label, sub }) => (
                <div key={label} style={{
                  backgroundColor: '#EAE7E1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                }}>
                  <span style={{ fontSize: '14px', color: '#C9A870', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: DARK, lineHeight: 1.3 }}>{label}</div>
                    <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: MUTED, lineHeight: 1.3 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Price */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.38 }}
              style={{ marginBottom: '24px', display: 'flex', alignItems: 'baseline', gap: '12px' }}
            >
              <span style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 4vw, 40px)', color: DARK }}>
                ₪{displayPrice.toLocaleString('he-IL')}
              </span>
              {salePrice && (
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '16px', color: '#999', textDecoration: 'line-through', textDecorationColor: '#FF4444' }}>
                  ₪{price.toLocaleString('he-IL')}
                </span>
              )}
            </motion.div>

            {/* Add to cart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.44 }}
            >
              {outOfStock ? (
                <div style={{
                  padding: '14px 28px',
                  backgroundColor: '#F0EDE7',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '8px',
                  fontFamily: "'Heebo', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#999',
                  textAlign: 'center',
                }}>
                  אזל המלאי
                </div>
              ) : (
                <motion.button
                  onClick={handleAddToCart}
                  animate={added ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: '100%',
                    padding: '15px 28px',
                    backgroundColor: added ? '#2A5A2A' : DARK,
                    color: added ? '#7FD97F' : '#EDEBE6',
                    border: 'none',
                    borderRadius: '8px',
                    fontFamily: "'Heebo', sans-serif",
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'background-color 0.3s, color 0.3s',
                  }}
                >
                  <AnimatePresence mode="wait">
                    {added ? (
                      <motion.span key="check" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check size={16} /> נוסף לעגלה!
                      </motion.span>
                    ) : (
                      <motion.span key="cart" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShoppingCart size={16} /> הוסף לעגלה
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
            </motion.div>

            {/* Shipping note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', color: MUTED, marginTop: '14px', textAlign: 'center' }}
            >
              משלוח עד 5 ימי עסקים · עד 13 תשלומים
            </motion.p>

          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />
    </section>
  );
}
