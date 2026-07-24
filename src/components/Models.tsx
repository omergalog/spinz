import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check, Star, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colorVariants, sizeVariants } from '../data/models';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { usePresale } from '../config/presale';

const DARK   = '#1C1C1C';
const BEIGE  = '#FFFFFF';
const BORDER = '#E2DED8';
const MUTED  = '#6A6862';
const GOLD   = '#C9A870';

const BASE_PRICE = 2290;

export default function Models() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  // Heading ref drives the masked slide-in of the "SPINZ Urban" title
  const headingRefLeft = useRef<HTMLDivElement>(null);
  const headingInViewLeft = useInView(headingRefLeft, { once: true, margin: '-40px' });
  // Separate ref for the mobile header copy (rendered above the image)
  const headingRefMobile = useRef<HTMLDivElement>(null);
  const headingInViewMobile = useInView(headingRefMobile, { once: true, margin: '-40px' });

  // Mobile only: a ONE-TIME gentle scroll-snap that stops a fast scroll right
  // at the colour/size options, then releases for good. The snap must be armed
  // from the start (setting it mid-fling won't catch an in-progress momentum on
  // iOS); once the scroll settles at that point we remove it entirely, so every
  // other place on the page — and all further scrolling — is completely normal.
  const buyBoxRef = useRef<HTMLDivElement>(null);
  const imageColRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia('(max-width: 1023px)').matches) return;
    const html = document.documentElement;
    let armed = true;
    let prevDelta: number | null = null;
    let lastY = window.scrollY;
    let lastT = performance.now();

    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dy = y - lastY;
      const dt = Math.max(1, now - lastT);
      lastY = y; lastT = now;
      const speed = Math.abs(dy) / dt;           // px per ms

      const bb = buyBoxRef.current;
      const img = imageColRef.current;
      if (!bb || !img) return;
      // Rest line = bottom of the bike image once it is stuck under the header.
      const stuckTop = parseFloat(getComputedStyle(img).top) || 80;
      const line = stuckTop + img.offsetHeight;
      const delta = bb.getBoundingClientRect().top - line;
      const was = prevDelta;
      prevDelta = delta;

      // Re-arm once the page is well away from the line, so the stop works
      // again on the next pass — from above or from below.
      if (Math.abs(delta) > 260) armed = true;
      if (!armed || was === null) return;

      // Only a fast fling gets grabbed; a slow, deliberate scroll passes freely.
      if (speed < 0.6) return;
      // Did this scroll step cross the line (in either direction)?
      if ((was < 0) === (delta < 0)) return;

      const target = Math.max(0, Math.round(y + delta));
      armed = false;
      // Killing overflow for one frame cancels the iOS momentum fling, so the
      // page actually comes to rest exactly on the line instead of fighting it.
      html.style.overflowY = 'hidden';
      window.scrollTo(0, target);
      requestAnimationFrame(() => {
        html.style.overflowY = '';
        window.scrollTo(0, target);
        prevDelta = null;
        lastY = window.scrollY;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); html.style.overflowY = ''; };
  }, []);


  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [added, setAdded] = useState(false);
  const [outOfStock, setOutOfStock] = useState(false);
  const [price, setPrice] = useState(BASE_PRICE);
  const [salePrice, setSalePrice] = useState<number | null>(null);
  const [reviewStats, setReviewStats] = useState<{ avg: number; count: number }>({ avg: 5, count: 0 });
  const [presaleQty, setPresaleQty] = useState<Record<string, number>>({});

  const presaleCfg = usePresale();

  useEffect(() => {
    supabase.from('reviews').select('stars').then(({ data }) => {
      if (data && data.length) {
        const avg = data.reduce((s, r) => s + (r.stars || 0), 0) / data.length;
        setReviewStats({ avg: Math.round(avg * 10) / 10, count: data.length });
      }
    });
  }, []);

  // Per-variant presale quota, set by the admin and shown to the customer
  useEffect(() => {
    supabase.from('products').select('slug, presale_qty').then(({ data }) => {
      if (!data) return;
      const map: Record<string, number> = {};
      data.forEach(row => { map[String(row.slug)] = row.presale_qty ?? 0; });
      setPresaleQty(map);
    });
  }, [added]);

  const { addItem } = useCart();
  const color = colorVariants[selectedColor];
  const size  = sizeVariants[selectedSize];

  // Preload all bike images on mount
  useEffect(() => {
    colorVariants.forEach(c => {
      const img = new Image();
      img.src = c.image;
    });
  }, []);

  useEffect(() => {
    const slug = `spinz-${color.id}-${size.id}`;
    supabase.from('products').select('stock, price, sale_price').eq('slug', slug).single().then(({ data }) => {
      if (!data) return;
      setOutOfStock(data.stock === 0);
      if (data.price) setPrice(data.price);
      setSalePrice(data.sale_price ?? null);
    });
  }, [selectedColor, selectedSize]);

  const displayPrice = salePrice ?? price;

  // Presale applies per variant, and only while that variant has quota left
  const variantSlug = `spinz-${color.id}-${size.id}`;
  const quotaLeft = presaleQty[variantSlug] ?? 0;
  const presale = presaleCfg.active && quotaLeft > 0;
  const presaleSoldOut = presaleCfg.active && quotaLeft <= 0;
  const shownPrice = presale ? presaleCfg.presalePrice : displayPrice;
  const monthly = Math.round(shownPrice / 13);

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem(
      {
        id: `spinz-${size.id}-${color.id}`,
        name: `SPINZ ${size.id} – ${color.label}`,
        tagline: size.range,
        image: color.image,
        // Must match the price shown on screen – during presale that is
        // the launch price, not the products-table price
        price: shownPrice,
        accentColor: color.hex,
        features: [],
      },
      color.id,
      color.label,
      color.skuCode,
      size.id,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // The upper block (label → heading → subtitle → rating → presale banner).
  // Rendered in two spots: on mobile it stays above the selectors; on desktop
  // it moves to the left column, above the bike image. Each copy gets its own
  // heading ref so the masked slide-in animation triggers independently.
  const renderHeader = (
    hRef: React.RefObject<HTMLDivElement>,
    hInView: boolean,
  ) => (
    <>
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
      <div ref={hRef} style={{ overflow: 'hidden', marginBottom: '8px' }}>
        <motion.h2
          initial={{ y: '105%' }}
          animate={hInView ? { y: '0%' } : {}}
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

      {/* Rating row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.22 }}
        style={{ marginTop: '-18px', marginBottom: '28px' }}
      >
        <Link
          to="/reviews"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            textDecoration: 'none', padding: '8px 0', cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                size={15}
                fill={i <= Math.round(reviewStats.avg) ? '#C9A870' : 'none'}
                stroke="#C9A870"
                strokeWidth={1.5}
              />
            ))}
          </span>
          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700, color: DARK }}>
            {reviewStats.avg.toFixed(1)}
          </span>
          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: MUTED, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            {reviewStats.count >= 5 ? `${reviewStats.count} ביקורות` : 'המלצות מרוכבים'}
          </span>
        </Link>
      </motion.div>
    </>
  );

  // Price block (badge + price + monthly). Shown in the buy box on desktop,
  // and above the image on mobile (the "sandwich" layout).
  const renderPrice = () => (
    <div style={{ margin: '4px 0 22px' }}>
      {presale && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em',
            color: '#1C1C1C', backgroundColor: GOLD, padding: '4px 10px', borderRadius: '5px',
          }}>
            PRE-SALE
          </span>
          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', fontWeight: 600, color: MUTED }}>
            מהדורת השקה · ל-{presaleCfg.presaleUnits} הראשונים בלבד
          </span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(34px, 5vw, 46px)', color: DARK, letterSpacing: '-0.01em' }}>
          ₪{shownPrice.toLocaleString('he-IL')}
        </span>
        {presale ? (
          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '18px', color: '#999', textDecoration: 'line-through', textDecorationColor: '#C17A56' }}>
            ₪{presaleCfg.regularPrice.toLocaleString('he-IL')}
          </span>
        ) : salePrice ? (
          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '16px', color: '#999', textDecoration: 'line-through', textDecorationColor: '#FF4444' }}>
            ₪{price.toLocaleString('he-IL')}
          </span>
        ) : null}
      </div>
      {presale && (
        <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13.5px', color: MUTED, margin: '10px 0 0' }}>
          או <b style={{ color: DARK }}>₪{monthly.toLocaleString('he-IL')}</b> לחודש, ב-13 תשלומים
        </p>
      )}
    </div>
  );

  return (
    <section
      ref={ref}
      id="models"
      dir="rtl"
      style={{ backgroundColor: BEIGE, position: 'relative' }}
      className="py-5 lg:py-0"
    >
      <style>{`@keyframes stockPulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }`}</style>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-start">

          {/* MOBILE header (name / tagline / rating) — scrolls away above the sticky image */}
          <div className="lg:hidden order-1" style={{ padding: '10px 20px 4px' }}>
            {renderHeader(headingRefMobile, headingInViewMobile)}
          </div>

          {/* Image – sticky; on mobile a compact fixed top band that always stays visible above the scrolling details */}
          <div ref={imageColRef} className="relative order-2 lg:order-2 lg:flex-1 flex items-center justify-center bg-white px-5 py-1 lg:p-12 h-[33vh] lg:h-auto lg:min-h-0 sticky top-[80px] lg:top-[96px] lg:self-start shadow-[0_12px_20px_-10px_rgba(0,0,0,0.15)] lg:shadow-none" style={{ zIndex: 2 }}>
            {/* 3D viewer for beige disabled for now – .glb loads too slowly; restore when optimized */}
            <AnimatePresence mode="wait">
              <motion.img
                key={color.id}
                src={color.image}
                alt={color.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: outOfStock ? 0.5 : 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', maxWidth: '820px', height: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }}
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
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '2.5px', textTransform: 'uppercase',
                    padding: '3px 0',
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

          {/* BUY BOX – scrolls; on mobile it slides up BELOW the fixed image (lower z-index) so the bike stays visible.
              scroll-snap stops a fast scroll here so users notice the colour/size options (mobile only via the html media query). */}
          <div ref={buyBoxRef} className="order-3 lg:order-1 lg:w-[440px] flex flex-col justify-start p-5 pt-6 lg:p-14 relative z-[1] bg-white lg:border-l lg:border-[#E2DED8]">

            {/* Header — desktop only (on mobile the header is above the image) */}
            <div className="hidden lg:block">
              {renderHeader(headingRefLeft, headingInViewLeft)}
              <div style={{ height: '1px', backgroundColor: BORDER, marginBottom: '24px' }} />
            </div>

            {/* Colour + size — desktop swaps the order (size first) via CSS order */}
            <div className="flex flex-col">
            {/* Color selector */}
            <motion.div
              className="lg:order-2"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.25 }}
              style={{ marginBottom: '28px' }}
            >
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: color.hex, fontWeight: 700 }}>
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
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: selectedColor === i ? `3px solid ${c.hex}` : '3px solid transparent',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.2s',
                      boxShadow: selectedColor === i ? `0 0 0 2px #FFFFFF, 0 0 0 4px ${c.hex}` : 'none',
                    }}
                  />
                ))}
              </div>

              {/* Presale quota for this exact variant */}
              {presaleCfg.active && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '14px' }}>
                  <span style={{
                    width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                    // Normal state follows the selected colour; low stock and
                    // sold out keep their warning colours so the signal survives
                    backgroundColor: presaleSoldOut ? '#9A9690' : quotaLeft <= 5 ? '#C17A56' : color.hex,
                    border: !presaleSoldOut && quotaLeft > 5 ? '1px solid rgba(0,0,0,0.15)' : 'none',
                    boxShadow: !presaleSoldOut && quotaLeft <= 5 ? '0 0 6px rgba(193,122,86,0.6)' : 'none',
                    animation: !presaleSoldOut && quotaLeft <= 5 ? 'stockPulse 1.4s ease-in-out infinite' : 'none',
                  }} />
                  <span style={{
                    fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', fontWeight: 700,
                    color: presaleSoldOut ? '#6A6862' : quotaLeft <= 5 ? '#B3543C' : color.hex,
                  }}>
                    {presaleSoldOut
                      ? `מכסת מחיר ההשקה ל${color.label} ${size.label} אזלה`
                      : quotaLeft <= 5
                        ? `נשארו רק ${quotaLeft} במחיר השקה · ${color.label} ${size.label}`
                        : `${quotaLeft} יחידות במחיר השקה · ${color.label} ${size.label}`}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Size selector */}
            <motion.div
              className="lg:order-1"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.32 }}
              style={{ marginBottom: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: DARK, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  מידה
                </span>
                <Link to="/sizes" style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', fontWeight: 600, color: GOLD, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  איזו מידה מתאימה לי?
                </Link>
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
            </div>

            {/* Pre-sale + price — placed below the size/colour selection */}
            <div>
              <div style={{ height: '1px', backgroundColor: BORDER, margin: '4px 0 22px' }} />
              {renderPrice()}
            </div>

            {/* Add to cart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.44 }}
            >
              {outOfStock ? (
                <div style={{
                  padding: '14px 28px',
                  backgroundColor: '#EAE7E1',
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
                      <motion.span key="check" dir="rtl" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        נוסף לעגלה! <Check size={16} />
                      </motion.span>
                    ) : (
                      <motion.span key="cart" dir="rtl" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        הוסיפו לעגלה <ShoppingCart size={16} />
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
              {presale
                ? 'אחריות 5 שנים על השלדה · עד 13 תשלומים'
                : 'משלוח עד 5 ימי עסקים · עד 13 תשלומים'}
            </motion.p>

            {/* Pre-sale disclosure – required before ordering in a distance sale */}
            {presale && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.55 }}
                style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${BORDER}`,
                }}
              >
                <Calendar size={15} style={{ color: GOLD, flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12px', color: MUTED, lineHeight: 1.65, margin: 0 }}>
                  הזמנה מוקדמת – המוצר טרם במלאי. מועד אספקה משוער:{' '}
                  <b style={{ color: DARK }}>{presaleCfg.arrivalLabel}</b>.
                  ניתן לבטל ולקבל החזר מלא בכל שלב לפני המסירה.{' '}
                  <Link to="/presale-terms" style={{ color: '#8A6D3B', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                    תנאי מכירה מוקדמת
                  </Link>
                </p>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />
    </section>
  );
}
