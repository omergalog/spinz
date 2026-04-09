import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import models from '../data/models';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

const DARK        = '#1C1C1C';
const BEIGE       = '#F5F2EC';
const GOLD        = '#C9A870';
const BORDER      = '#E2DED8';

function formatPrice(n: number) {
  return `₪${n.toLocaleString('he-IL')}`;
}

function ModelCard({ model, index, outOfStock, salePrice }: { model: typeof models[number]; index: number; outOfStock: boolean; salePrice?: number }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    if (outOfStock) return;
    e.stopPropagation();
    const modelToAdd = salePrice ? { ...model, price: salePrice } : model;
    addItem(modelToAdd);
    setAdded(true);
    setHovered(true);
    setTimeout(() => setAdded(false), 2000);
    setTimeout(() => setHovered(false), 2000);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      onMouseEnter={() => !outOfStock && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ overflow: 'hidden', cursor: outOfStock ? 'default' : 'pointer', border: `1px solid ${BORDER}` }}
    >
      {/* Image area */}
      <div
        className="aspect-[4/3] md:aspect-[3/2]"
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.img
          src={model.image.replace('.png', '.jpg')}
          alt={model.name}
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-[88%] h-[88%] md:w-[88%] md:h-[88%] max-md:w-full max-md:h-full"
          style={{ objectFit: 'contain' }}
          loading="lazy"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        {/* Hover overlay — only when in stock */}
        {!outOfStock && (
          <>
            <motion.div
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(28,28,28,0.08)' }}
            />
            <motion.div
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
              transition={{ duration: 0.35 }}
              style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span style={{ color: DARK, fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', borderBottom: `1px solid ${GOLD}`, paddingBottom: '4px' }}>
                צפייה במודל
              </span>
            </motion.div>
          </>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'absolute', bottom: '16px', left: '16px' }}
          >
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px',
              padding: '10px 16px',
              backgroundColor: 'rgba(28,28,28,0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(6px)',
            }}>
              <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 600, color: '#EDEBE6', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                OUT OF STOCK
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Info bar */}
      <div
        style={{
          backgroundColor: DARK,
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '26px', color: outOfStock ? '#555' : '#EDEBE6', letterSpacing: '0', margin: 0, lineHeight: 1 }}>
            {model.name}
          </h3>
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', color: outOfStock ? '#444' : '#FFFFFF', margin: '4px 0 0' }}>
            {model.tagline}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-[14px]">
          <div className="hidden md:block" style={{ width: '1px', height: '30px', backgroundColor: '#2A2A2A' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            {salePrice && !outOfStock ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', fontWeight: 600, color: '#FF6B6B', backgroundColor: '#FF6B6B22', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.05em' }}>
                    -{Math.round((1 - salePrice / model.price) * 100)}%
                  </span>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#555', textDecoration: 'line-through' }}>
                    {formatPrice(model.price)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '20px', fontWeight: 800, color: GOLD }}>
                    {formatPrice(salePrice)}
                  </span>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '9px', color: '#FFFFFF', letterSpacing: '0.1em' }}>מחיר מבצע</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '18px', fontWeight: 700, color: outOfStock ? '#555' : GOLD }}>
                  {formatPrice(model.price)}
                </span>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '9px', color: outOfStock ? '#444' : '#FFFFFF', letterSpacing: '0.1em' }}>
                  מחיר
                </span>
              </div>
            )}
          </div>
          <div className="hidden md:block" style={{ width: '1px', height: '30px', backgroundColor: '#2A2A2A' }} />
          <div style={{ position: 'relative' }}>
            {/* Burst particles */}
            <AnimatePresence>
              {added && [0,1,2,3,4].map(i => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  animate={{ opacity: 0, x: (i - 2) * 18, y: -28 - i * 4, scale: 0.4 }}
                  transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.04 }}
                  style={{ position: 'absolute', top: '50%', left: '50%', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: GOLD, pointerEvents: 'none', zIndex: 10 }}
                />
              ))}
            </AnimatePresence>
            {outOfStock ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: 'transparent',
                color: '#555',
                border: '1px solid #2A2A2A',
                borderRadius: '4px',
                padding: '8px 14px',
                fontFamily: "'Heebo', sans-serif",
                fontSize: '12px', fontWeight: 700,
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
                cursor: 'not-allowed',
              }}>
                OUT OF STOCK
              </div>
            ) : (
              <motion.button
                onClick={handleAddToCart}
                animate={added ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: added ? '#2A5A2A' : GOLD,
                  color: added ? '#7FD97F' : DARK,
                  border: 'none', borderRadius: '4px',
                  padding: '8px 14px',
                  fontFamily: "'Heebo', sans-serif",
                  fontSize: '12px', fontWeight: 700,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.3s, color 0.3s',
                }}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span key="check" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={14} /> נוסף!
                    </motion.span>
                  ) : (
                    <motion.span key="cart" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShoppingCart size={14} /> הוסף לעגלה
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Models() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true, margin: '-60px' });
  const mobileHeaderRef = useRef<HTMLDivElement>(null);
  const mobileInView = useInView(mobileHeaderRef, { once: true, margin: '-20px' });
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [salePriceMap, setSalePriceMap] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.from('products').select('name, stock, price, sale_price').then(({ data }) => {
      if (!data) return;
      const stocks: Record<string, number> = {};
      const prices: Record<string, number> = {};
      const salePrices: Record<string, number> = {};
      data.forEach((p: { name: string; stock: number; price: number; sale_price: number | null }) => {
        stocks[p.name.toUpperCase()] = p.stock;
        if (p.price) prices[p.name.toUpperCase()] = p.price;
        if (p.sale_price) salePrices[p.name.toUpperCase()] = p.sale_price;
      });
      setStockMap(stocks);
      setPriceMap(prices);
      setSalePriceMap(salePrices);
    });
  }, []);

  return (
    <section id="models" style={{ backgroundColor: BEIGE }} dir="rtl">
      <div
        style={{ gridTemplateColumns: '1fr 1.3fr' }}
        className="block md:grid"
      >
        {/* LEFT sticky panel */}
        <div className="hidden md:block" style={{ borderLeft: `1px solid ${BORDER}`, minHeight: '100%' }}>
          <div ref={headerRef} style={{ position: 'sticky', top: '64px', padding: '60px 36px' }}>
            <motion.h5
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7 }}
              style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD, margin: '0 0 16px' }}
            >
              המודלים שלנו
            </motion.h5>
            <div style={{ overflow: 'hidden' }}>
              <motion.h1
                initial={{ y: '105%' }}
                animate={isInView ? { y: '0%' } : {}}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
                style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(38px, 4.5vw, 60px)', color: DARK, letterSpacing: '-0.01em', lineHeight: 1.05, margin: 0 }}
              >
                בחר את האופניים שלך
              </motion.h1>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ height: '1px', backgroundColor: BORDER, margin: '28px 0', transformOrigin: 'right' }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: '#666', lineHeight: 1.7, margin: 0 }}
            >
              אנחנו מתמחים באופניי עיר סינגל ספיד, מבוצעים בתהליך שקוף, מדויק ומושלם.
              התוצאה: אופניים שנראים כמו פסל ורוכבים כמו חלום.
            </motion.p>
          </div>
        </div>

        {/* RIGHT scrollable cards */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderRight: `1px solid ${BORDER}` }}
          className="p-5 md:p-9"
        >
          {/* Mobile header — sticky below navbar */}
          <div ref={mobileHeaderRef} className="md:hidden" style={{ paddingBottom: '20px', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: '64px', backgroundColor: BEIGE, zIndex: 10 }}>
            <motion.h5
              initial={{ opacity: 0 }}
              animate={mobileInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD, marginBottom: '10px' }}
            >
              המודלים שלנו
            </motion.h5>
            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                initial={{ y: '105%' }}
                animate={mobileInView ? { y: '0%' } : {}}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
                style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '40px', color: DARK, letterSpacing: '-0.01em', margin: 0 }}
              >
                בחר את האופניים שלך
              </motion.h2>
            </div>
          </div>

          {models.map((model, i) => {
            const key = model.name.toUpperCase();
            const stock = stockMap[key];
            const outOfStock = stock !== undefined && stock === 0;
            const livePrice = priceMap[key];
            const liveSalePrice = salePriceMap[key];
            const modelWithPrice = { ...model, price: livePrice || model.price };
            return <ModelCard key={model.id} model={modelWithPrice} index={i} outOfStock={outOfStock} salePrice={liveSalePrice} />;
          })}
        </div>
      </div>
    </section>
  );
}
