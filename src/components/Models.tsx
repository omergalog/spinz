import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colorVariants, sizeVariants } from '../data/models';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { usePresale } from '../config/presale';

const DARK   = '#1C1C1C';
const BEIGE  = '#FFFFFF';
const BORDER = '#E2DED8';
const MUTED  = '#6A6862';

const BASE_PRICE = 2290;

export default function Models() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-40px' });
  // Second heading ref for the desktop copy that sits above the bike image
  const headingRefLeft = useRef<HTMLDivElement>(null);
  const headingInViewLeft = useInView(headingRefLeft, { once: true, margin: '-40px' });

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
    withDivider = false,
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

      {/* Presale callout – prominent launch-price banner */}
      {presale && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.24 }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #1C1C1C 0%, #2A2620 100%)',
            borderRadius: '12px',
            padding: '16px 18px',
            marginBottom: withDivider ? '28px' : 0,
            border: '1px solid rgba(201,168,112,0.35)',
          }}
        >
          <div aria-hidden style={{
            position: 'absolute', top: 0, insetInlineEnd: 0, width: '120px', height: '100%',
            background: 'radial-gradient(circle at 100% 0%, rgba(201,168,112,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em',
              color: '#1C1C1C', backgroundColor: '#C9A870',
              padding: '4px 10px', borderRadius: '5px', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              PRE-SALE
            </span>
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', fontWeight: 800, color: '#EDEBE6' }}>
                מהדורת השקה מוגבלת
              </div>
              <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12.5px', color: 'rgba(237,235,230,0.7)' }}>
                ל-{presaleCfg.presaleUnits} הרוכבים הראשונים בלבד
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {withDivider && <div style={{ height: '1px', backgroundColor: BORDER, margin: '28px 0' }} />}
    </>
  );

  // Colour + size pickers (+ presale quota line). Like the header, rendered in
  // one spot per breakpoint: on desktop it joins the header in the left column
  // above the image; on mobile it stays in the selector column.
  const renderPicker = () => (
    <>
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

        {/* Presale quota for this exact variant */}
        {presaleCfg.active && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '14px' }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
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
    </>
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
        <div className="flex flex-col lg:flex-row min-h-[80vh]">

          {/* LEFT on desktop – header (desktop only) + image */}
          <div className="lg:flex-1 flex flex-col bg-white p-4 lg:p-8 order-1 lg:order-2 min-h-[50vw] lg:min-h-0">
            {/* Header + pickers moved here on desktop to balance the layout and keep
                the choosing experience together (mobile keeps them in the selector column) */}
            <div className="hidden lg:block" style={{ marginBottom: '20px' }}>
              {renderHeader(headingRefLeft, headingInViewLeft, true)}
              {renderPicker()}
            </div>
            {/* Image area */}
            <div className="flex-1 flex items-center justify-center" style={{ position: 'relative', minHeight: 0 }}>
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
          </div>

          {/* RIGHT on desktop – selector */}
          <div className="lg:w-[480px] flex flex-col justify-center p-5 pt-3 lg:p-16 order-2 lg:order-1" style={{ borderLeft: `1px solid ${BORDER}` }}>

            {/* Header — mobile only; on desktop it lives above the image (left column) */}
            <div className="lg:hidden">
              {renderHeader(headingRef, headingInView, true)}
            </div>

            {/* Pickers — mobile only; on desktop they live above the image (left column) */}
            <div className="lg:hidden">
              {renderPicker()}
            </div>

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
              style={{ marginBottom: '24px' }}
            >
              {presale && (
                <span style={{
                  display: 'inline-block', marginBottom: '8px',
                  fontFamily: "'Heebo', sans-serif", fontSize: '10.5px', fontWeight: 800,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: '#1C1C1C', backgroundColor: '#C9A870',
                  padding: '4px 12px', borderRadius: '6px',
                }}>
                  מחיר השקה
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(30px, 4.5vw, 44px)', color: DARK }}>
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
                <div style={{
                  display: 'inline-flex', alignItems: 'baseline', gap: '7px',
                  marginTop: '12px', padding: '8px 14px',
                  backgroundColor: '#F3EDE1', border: '1px solid #E3D8C2',
                  borderRadius: '8px',
                }}>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: MUTED }}>
                    או
                  </span>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '22px', fontWeight: 800, color: DARK, letterSpacing: '-0.01em' }}>
                    ₪{monthly.toLocaleString('he-IL')}
                  </span>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 600, color: DARK }}>
                    לחודש
                  </span>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: MUTED }}>
                    ב-13 תשלומים
                  </span>
                </div>
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
                      <motion.span key="check" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check size={16} /> נוסף לעגלה!
                      </motion.span>
                    ) : (
                      <motion.span key="cart" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShoppingCart size={16} /> {presale ? 'הבטיחו את שלכם' : 'הוסף לעגלה'}
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
                  marginTop: '12px', padding: '11px 14px',
                  backgroundColor: '#F3EDE1', border: `1px solid #E3D8C2`,
                  borderRadius: '8px',
                  fontFamily: "'Heebo', sans-serif", fontSize: '12px',
                  color: '#5A5750', lineHeight: 1.6, textAlign: 'center',
                }}
              >
                הזמנה מוקדמת – המוצר טרם במלאי. מועד אספקה משוער:{' '}
                <b style={{ color: DARK }}>{presaleCfg.arrivalLabel}</b>.
                ניתן לבטל ולקבל החזר מלא בכל שלב לפני המסירה.{' '}
                <Link to="/presale-terms" style={{ color: '#8A6D3B', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                  תנאי מכירה מוקדמת
                </Link>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: BORDER }} />
    </section>
  );
}
