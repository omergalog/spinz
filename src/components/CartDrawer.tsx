import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, ArrowRight, ArrowLeft, CalendarClock } from 'lucide-react';
import { MAX_PER_LINE, useCart } from '../context/CartContext';
import { CouponRejectedError, OutOfStockError, TooManyCartsError, checkCoupon, loadApplePay, openCheckout, submitToIframe }
  from '../lib/payment';
import { useT, useDir, useLang, localizePath } from '../i18n/LanguageContext';
import { arrivalLabelIn, usePresale } from '../config/presale';
import { merchLabel } from '../data/merch';

const DARK    = '#1C1C1C';   // text on gold buttons
const GOLD    = '#C9A870';
// זהב על לבן נותן 2.25, מתחת לרף. המחירים עוברים לגוון כהה,
// הכפתורים והעיטורים נשארים בזהב המותג.
// הגוון הקודם (#8A6B32) נתן 4.96 על לבן אך 4.44 על רקע הקרם של
// המגירה — מתחת ל-4.5. הגוון הזה: 5.79 על לבן, 5.18 על קרם.
const GOLD_TEXT = '#7E6129';
// אפור המחיר המחוק והטקסט הקטן. הקודם (#9A9690) נתן 2.94 על לבן
// ו-2.63 על קרם. זה: 5.37 ו-4.81.
const MUTED_TEXT = '#6E6A64';
// אדום השגיאה. הקודם (#FF6B6B) נתן 2.78 על לבן — הודעת שגיאה
// שאי אפשר לקרוא. זה: 6.54 על לבן, 5.85 על קרם.
const ERROR_TEXT = '#B3261E';
const TEXT    = '#1C1C1C';   // main text (light cart)
const SURFACE = '#F5F2EC';   // drawer background (cream)
const SUBTLE  = '#FFFFFF';   // inputs / item tiles (white, so the white-bg
                             // bike photo blends into them seamlessly)
const BORDER  = '#E0DCD4';

// שם קבוע ל-iframe, כדי שהטופס המוגש ידע לאן לכוון
const TRANZILA_FRAME = 'spinz-tranzila-frame';

function formatPrice(n: number) {
  return `₪${n.toLocaleString('he-IL')}`;  // מספרים זהים בשתי השפות
}

export default function CartDrawer() {
  const t = useT();
  const dir = useDir();
  const lang = useLang();
  const { items, updateQuantity, clearCart, totalCount, isOpen, closeCart, coupon: savedCoupon, setCoupon: saveCoupon } = useCart();
  const navigate = useNavigate();
  const presale = usePresale();

  // חץ "חזרה" מצביע לכיוון שממנו הגיע המסך, ולכן מתהפך עם השפה.
  // קודם היה כאן התו ← קבוע: נכון בעברית, מצביע קדימה באנגלית.
  const Back = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const backBtn = {
    background: 'none', border: 'none', color: '#6A6862', cursor: 'pointer',
    width: '44px', height: '44px', margin: '-10px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  } as const;

  /**
   * סכום שורה, מפוצל בדיוק כמו בשרת.
   *
   * העגלה הכפילה את מחיר ההשקה בכל הכמות, בעוד השרת מתמחר במחיר
   * ההשקה רק את מה שנכנס למכסה שנשארה. בהזמנה של ארבע יחידות
   * כששתיים במכסה, המסך הראה 4,360 והחיוב היה 4,778.
   */
  const lineTotal = (i: typeof items[number]) => {
    const full = i.fullPrice ?? i.model.price;
    const atPresale = Math.min(i.quantity, Math.max(0, i.presaleLeft ?? i.quantity));
    if (i.kind === 'merch' || !presale.active || atPresale >= i.quantity) {
      return i.model.price * i.quantity;
    }
    return i.model.price * atPresale + full * (i.quantity - atPresale);
  };

  /**
   * חלוקת היחידות בשורה בין מחיר ההשקה למחיר המלא.
   *
   * null כשכל השורה באותו מחיר. כשהמכסה נגמרת באמצע השורה, העגלה
   * הציגה סכום והנחה בלי לומר כמה יחידות בכל מחיר.
   */
  const priceSplit = (i: typeof items[number]) => {
    const full = i.fullPrice ?? i.model.price;
    const atPresale = Math.min(i.quantity, Math.max(0, i.presaleLeft ?? i.quantity));
    if (i.kind === 'merch' || !presale.active || atPresale >= i.quantity || atPresale <= 0) return null;
    return { atPresale, atFull: i.quantity - atPresale, presaleUnit: i.model.price, fullUnit: full };
  };

  /**
   * שם הפריט בשפת העמוד.
   *
   * השם נשמר בעגלה כפי שהיה ברגע ההוספה, ולכן הוספה בעברית ומעבר
   * לאנגלית הותירו "SPINZ 54 – שחור מט" בתוך עגלה אנגלית. הוא נבנה
   * מחדש מהמזהים שהעגלה כבר שומרת — צבע, מידה ו-slug.
   */
  const displayName = (i: typeof items[number]) => {
    if (i.kind === 'merch') return (i.slug && merchLabel(i.slug, lang)) || i.model.name;
    const color = t.product.colors[i.colorId as keyof typeof t.product.colors];
    return color ? `SPINZ ${i.size} – ${color}` : i.model.name;
  };

  const total = items.reduce((sum, i) => sum + lineTotal(i), 0);
  // תקרת היחידות של הקופון נמדדת מול המספר הזה, ולא מול מספר השורות.
  const units = items.reduce((sum, i) => sum + i.quantity, 0);

  /**
   * המחיר לפני הנחת ההשקה.
   *
   * בעמוד המוצר הלקוח רואה 1,299 מחוק ליד 1,090, ובעגלה הוא ראה רק
   * 1,090 — כלומר ההנחה הגדולה מבין השתיים נעלמה בדיוק במסך ההחלטה.
   * ההשוואה למחיר המלא ולא לדגל הפרי-סייל בלבד מונעת "הנחה" שלילית
   * ביום שמחיר ההשקה יעודכן כלפי מעלה.
   */
  // מחיר המחירון של פריט, לצורך הקו החוצה ושורת "הנחת השקה".
  //
  // מחיר ההשקה שייך לאופניים בלבד. חולצה ב-₪149 היא "זולה ממחיר
  // האופניים המלא", ולכן הנוסחה הישנה סימנה אותה כאילו הוזלה מ-₪1,299
  // והמציאה הנחה של ₪1,150 שמעולם לא ניתנה.
  const listUnit = (i: { model: { price: number }; kind?: string }) =>
    i.kind !== 'merch' && presale.active && i.model.price < presale.regularPrice
      ? presale.regularPrice
      : i.model.price;

  const listTotal  = items.reduce((sum, i) => sum + listUnit(i) * i.quantity, 0);
  const presaleOff = Math.max(0, listTotal - total);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [step, setStep] = useState<'cart' | 'details' | 'payment'>('cart');
  const [payFrameReady, setPayFrameReady] = useState(false);
  const [coupon, setCoupon] = useState(savedCoupon);
  const [couponState, setCouponState] = useState<'idle' | 'checking' | 'ok' | 'bad'>('idle');
  const [discount, setDiscount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  /**
   * אופן המסירה.
   *
   * האתר מבטיח איסוף עצמי חינם מכפר ויתקין, ובטופס לא הייתה דרך
   * לבחור בו — הכתובת הייתה שדה חובה והלקוח נאלץ להמציא אחת.
   */
  const [delivery, setDelivery] = useState<'ship' | 'pickup'>('ship');
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  // עמוד התשלום חי בתוך מסגרת, ולכן סיום התשלום אינו יכול פשוט להפנות
  // את הדפדפן — האתר חוסם את עצמו מלהיטען בתוך מסגרת. במקום זאת דף
  // החזרה שולח הודעה לכאן, וכאן מנווטים.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.source !== 'spinz-tranzila') return;

      const id = String(e.data.sessionId ?? '');
      if (!/^[0-9a-f-]{36}$/i.test(id)) return;

      // העגלה מתרוקנת רק בהצלחה. בכישלון הלקוח אמור להיות מסוגל
      // לנסות שוב בלי לבנות אותה מחדש.
      if (e.data.outcome === 'success') { clearCart(); saveCoupon(''); }

      closeCart();
      setStep('cart');
      navigate(`/order/${e.data.outcome === 'failed' ? 'failed' : 'success'}?s=${id}`);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [clearCart, closeCart, navigate, saveCoupon]);

  // הקוד שהוזן בעמוד המוצר נבדק כאן מחדש מול סכום העגלה האמיתי.
  // בעמוד המוצר הוא נבדק מול מחיר יחידה אחת, ולכן הסכומים יכולים
  // להיות שונים כשיש בעגלה יותר מפריט אחד.
  useEffect(() => {
    if (!isOpen || !savedCoupon || total <= 0) return;
    let alive = true;
    checkCoupon(savedCoupon, total, units).then(r => {
      if (!alive) return;
      setCoupon(savedCoupon);
      setDiscount(r.valid ? r.discount : 0);
      setCouponState(r.valid ? 'ok' : 'bad');
    });
    return () => { alive = false; };
  }, [isOpen, savedCoupon, total, units]);

  /**
   * המגירה היא חלון מודאלי.
   *
   * Escape לא סגר אותה, לא היה לה role, ומדידה בדפדפן הראתה 41
   * אלמנטים מחוץ לה שעדיין נגישים ב-Tab — כלומר מי שמנווט במקלדת
   * יצא ממנה בלי לדעת ואיבד את ההקשר.
   */
  const panelRef = useRef<HTMLDivElement>(null);

  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    // הפקד שפתח את המגירה. בסגירה הפוקוס חזר ל-BODY, ומי שמנווט
    // במקלדת נזרק לתחילת העמוד במקום לכפתור שממנו יצא.
    openerRef.current = document.activeElement as HTMLElement | null;
    panel?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeCart(); return; }
      if (e.key !== 'Tab' || !panel) return;

      const f = [...panel.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',
      )].filter(el => el.offsetParent !== null);
      if (f.length === 0) { e.preventDefault(); return; }

      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const opener = openerRef.current;
      openerRef.current = null;
      // רק אם הפוקוס עוד בתוך המגירה — שלא לגנוב אותו ממשהו אחר.
      if (opener?.isConnected && (!document.activeElement || document.activeElement === document.body
          || panel?.contains(document.activeElement))) {
        opener.focus();
      }
    };
  }, [isOpen, closeCart]);

  // הכפתורים הצפים יושבים ב-zIndex 9999 והמגירה ב-999, ולכן כפתור
  // הנגישות כיסה את שורת אישור תנאי המכירה המוקדמת שמתחת לכפתור
  // ההזמנה. כל עוד המגירה פתוחה הם מוסתרים — הם ממילא אינם שמישים
  // מאחורי שכבת ההחשכה.
  useEffect(() => {
    document.documentElement.style.setProperty('--fab-vis', isOpen ? 'hidden' : 'visible');
    return () => { document.documentElement.style.setProperty('--fab-vis', 'visible'); };
  }, [isOpen]);

  // סגירת המגירה מאפסת את התהליך. בלי זה, פתיחה חוזרת הייתה מציגה
  // מסגרת תשלום ישנה ששייכת לסל שכבר פג.
  useEffect(() => {
    if (isOpen) return;
    setStep('cart');
    setPayFrameReady(false);
    setOrderError(null);
    setCouponState('idle');
  }, [isOpen]);

  const applyCoupon = async (): Promise<boolean> => {
    if (!coupon.trim()) { setCouponState('idle'); setDiscount(0); return false; }
    setCouponState('checking');
    // ההנחה מחושבת בשרת. כאן רק מציגים את התוצאה, כדי שהסכום שמוצג
    // יהיה בדיוק זה שייגבה.
    const r = await checkCoupon(coupon.trim(), total, units);
    setDiscount(r.valid ? r.discount : 0);
    setCouponState(r.valid ? 'ok' : 'bad');
    saveCoupon(r.valid ? coupon.trim() : '');
    return r.valid;
  };

  const validateAndCheckout = async () => {
    const errors: Record<string, boolean> = {};
    if (!form.name.trim()) errors.name = true;
    if (!form.phone.trim()) errors.phone = true;
    if (delivery === 'ship' && !form.address.trim()) errors.address = true;
    // אישור ההזמנה והחשבונית מגיעים במייל בלבד. בלי כתובת הלקוח
    // משלם ולא מקבל דבר, ואין לו אסמכתה לביטול.
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      errors.email = true;
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // קוד שהוקלד ולא הוחל: מחילים אותו כאן ומראים את התוצאה, במקום
    // להתעלם ממנו בשקט. אחרת המסך מציג קוד וההזמנה נשלחת בלעדיו.
    if (coupon.trim() && couponState !== 'ok') {
      const ok = await applyCoupon();
      if (!ok) return;          // קוד שגוי — נעצרים ומראים למה
    }

    handleCheckout();
  };

  const handleCheckout = async () => {
    setOrdering(true);
    setOrderError(null);
    try {
      // השרת מתמחר, שומר את הסל ומחזיר טופס מוכן. שום סכום לא נשלח
      // מכאן — אחרת אפשר היה לשנות אותו בכלי הפיתוח של הדפדפן.
      const session = await openCheckout({
        items: items.map(i => ({
          color: i.colorId,
          size: i.size,
          quantity: i.quantity,
          colorSkuCode: i.colorSkuCode,
          slug: i.slug,
        })),
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        address: delivery === 'pickup' ? t.cart.pickupAddress : form.address,
        // רק קוד שהוחל בפועל. מה שמופיע על המסך הוא מה שנגבה.
        coupon: couponState === 'ok' ? coupon.trim() : undefined,
        lang,
      });

      setPayFrameReady(false);
      setStep('payment');
      loadApplePay();
      // ה-iframe נוצר ברינדור הבא, ולכן ההגשה מחכה לו.
      requestAnimationFrame(() => submitToIframe(session, TRANZILA_FRAME));
    } catch (e) {
      if (e instanceof CouponRejectedError) {
        // הקוד חדל להיות תקף בין ההחלה לאישור. מנקים אותו כדי שהמסך
        // יציג את המחיר שייגבה בפועל, ולא סכום שכבר אינו קיים.
        setDiscount(0); setCouponState('bad'); saveCoupon('');
        setOrderError(t.cart.errCouponRejected);
      } else if (e instanceof TooManyCartsError) {
        setOrderError(t.cart.errTooManyCarts);
      } else if (e instanceof OutOfStockError) {
        setOrderError(e.left > 0 ? t.cart.errQty(e.left) : t.cart.errOutOfStock);
      } else {
        setOrderError(t.cart.errGeneric);
      }
    }
    setOrdering(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            style={{
              position: 'fixed', inset: 0, zIndex: 998,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />

          {/* Drawer */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.cart.title}
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%',
              // עמוד התשלום רחב יותר: כשמופעל 3DS, מסך קוד האימות של
              // חברת האשראי נטען בתוך המסגרת, והוא לא מעוצב לרוחב של
              // מגירת עגלה. בנייד ממילא מסך מלא.
              maxWidth: step === 'payment' ? '560px' : '420px',
              transition: 'max-width 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              zIndex: 999,
              backgroundColor: SURFACE,
              display: 'flex', flexDirection: 'column',
              borderLeft: `1px solid ${BORDER}`,
            }}
            dir={dir}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <img src="/assets/logo.png" alt="SPINZ" style={{ height: '36px', width: 'auto', objectFit: 'contain', opacity: 0.9 }} />
                <button onClick={closeCart} aria-label={t.cart.close}
                  style={{ color: TEXT, background: 'none', border: 'none', cursor: 'pointer',
                           width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={22} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={18} style={{ color: GOLD }} />
                <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '18px', color: TEXT, margin: 0 }}>
                  {t.cart.title}
                </h2>
                {totalCount > 0 && (
                  <span style={{
                    backgroundColor: GOLD, color: DARK,
                    fontFamily: "'Heebo', sans-serif", fontSize: '11px', fontWeight: 700,
                    borderRadius: '50%', width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {totalCount}
                  </span>
                )}
              </div>
            </div>

            {/* Items */}
            <div
              style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}
              onWheel={e => e.stopPropagation()}
              onTouchMove={e => e.stopPropagation()}
            >
              {items.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', opacity: 0.5 }}>
                  <ShoppingCart size={48} style={{ color: TEXT }} />
                  <p style={{ fontFamily: "'Heebo', sans-serif", color: TEXT, fontSize: '15px', margin: 0 }}>
                    {t.cart.empty}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <AnimatePresence>
                    {items.map(item => (
                      <motion.div
                        key={item.model.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          backgroundColor: SUBTLE,
                          border: `1px solid ${BORDER}`,
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          gap: '16px',
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src={item.model.image.replace('.png', '.jpg')}
                          alt={displayName(item)}
                          onError={e => { (e.currentTarget as HTMLImageElement).src = item.model.image; }}
                          style={{ width: '80px', height: '60px', objectFit: 'contain', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '16px', color: TEXT, margin: '0 0 4px' }}>
                            {displayName(item)}
                          </h3>
                          <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '16px', fontWeight: 700, color: GOLD_TEXT }}>
                              {formatPrice(lineTotal(item))}
                            </span>
                            {listUnit(item) * item.quantity > lineTotal(item) && (
                              <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: MUTED_TEXT, textDecoration: 'line-through' }}>
                                {formatPrice(listUnit(item) * item.quantity)}
                              </span>
                            )}
                          </span>
                          {(() => {
                            const sp = priceSplit(item);
                            if (!sp) return null;
                            return (
                              <span style={{
                                display: 'block', marginTop: '5px',
                                fontFamily: "'Heebo', sans-serif", fontSize: '11.5px',
                                color: MUTED_TEXT, lineHeight: 1.5,
                              }}>
                                {t.cart.priceSplit(sp.atPresale, formatPrice(sp.presaleUnit), sp.atFull, formatPrice(sp.fullUnit))}
                              </span>
                            );
                          })()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <button
                            onClick={() => updateQuantity(item.model.id, item.quantity + 1)}
                            aria-label={t.cart.more}
                            disabled={item.quantity >= MAX_PER_LINE}
                            style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '8px', color: TEXT, cursor: 'pointer' }}
                          >
                            <Plus size={14} />
                          </button>
                          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, color: TEXT, minWidth: '20px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.model.id, item.quantity - 1)}
                            aria-label={t.cart.less}
                            style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '8px', color: item.quantity === 1 ? '#CC4400' : TEXT, cursor: 'pointer' }}
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Details step */}
            <AnimatePresence>
              {step === 'details' && (
                <motion.div
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'absolute', inset: 0, backgroundColor: SURFACE, display: 'flex', flexDirection: 'column', zIndex: 5 }}
                  dir={dir}
                >
                  {/* Header */}
                  <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => setStep('cart')}
                      aria-label={t.cart.backToCart}
                      style={backBtn}
                    >
                      <Back size={19} />
                    </button>
                    <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '17px', color: TEXT, margin: 0 }}>{t.cart.shippingDetails}</h3>
                  </div>

                  {/* Form */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>

                    {/* אופן מסירה */}
                    <div role="radiogroup" aria-label={t.cart.deliveryLabel}>
                      <span style={{ display: 'block', fontFamily: "'Heebo', sans-serif", fontSize: '11px',
                                     color: '#6A6862', letterSpacing: '0.1em', marginBottom: '6px',
                                     textTransform: 'uppercase' }}>
                        {t.cart.deliveryLabel}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {([['ship', t.cart.deliveryShip], ['pickup', t.cart.deliveryPickup]] as const).map(([k, label]) => (
                          <button
                            key={k}
                            type="button"
                            role="radio"
                            aria-checked={delivery === k}
                            onClick={() => { setDelivery(k); setFormErrors(f => ({ ...f, address: false })); }}
                            style={{
                              flex: 1, minHeight: '48px', padding: '10px 12px', borderRadius: '8px',
                              cursor: 'pointer', fontFamily: "'Heebo', sans-serif", fontSize: '13.5px',
                              fontWeight: 700,
                              border: `1px solid ${delivery === k ? GOLD : BORDER}`,
                              backgroundColor: delivery === k ? GOLD : SUBTLE,
                              color: delivery === k ? DARK : TEXT,
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {delivery === 'pickup' && (
                        <p style={{ margin: '8px 0 0', fontFamily: "'Heebo', sans-serif", fontSize: '12px',
                                    color: '#6A6862', lineHeight: 1.6 }}>
                          {t.cart.pickupNote}
                        </p>
                      )}
                    </div>

                    {[
                      // autoComplete הוא מה שמאפשר לדפדפן להשלים את השדה.
                      // בלעדיו הוא זיהה רק את שדה המייל, לפי type, ושאר
                      // הפרטים נותרו למילוי ידני בכל הזמנה.
                      { key: 'name', label: t.cart.nameLabel, placeholder: t.cart.namePlaceholder, type: 'text', auto: 'name' },
                      { key: 'phone', label: t.cart.phoneLabel, placeholder: '050-0000000', type: 'tel', auto: 'tel' },
                      { key: 'email', label: t.cart.emailLabel, placeholder: 'israel@example.com', type: 'email', auto: 'email' },
                      ...(delivery === 'ship'
                        ? [{ key: 'address', label: t.cart.addressLabel, placeholder: t.cart.addressPlaceholder, type: 'text', auto: 'street-address' }]
                        : []),
                    ].map(({ key, label, placeholder, type, auto }) => (
                      <div key={key}>
                        {/* התווית הייתה נראית אך לא מקושרת לשדה, ולכן
                            קורא מסך לא הקריא אותה ולחיצה עליה לא מיקדה. */}
                        <label htmlFor={`cart-${key}`} style={{ display: 'block', fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: formErrors[key] ? ERROR_TEXT : "#6A6862", letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>
                          {label}
                        </label>
                        <input
                          id={`cart-${key}`}
                          type={type}
                          name={key}
                          aria-invalid={formErrors[key] || undefined}
                          autoComplete={auto}
                          // Email/phone hold Latin characters – force LTR so the
                          // caret and separators don't jump inside an RTL form
                          dir={type === 'email' || type === 'tel' ? 'ltr' : 'rtl'}
                          placeholder={placeholder}
                          value={form[key as keyof typeof form]}
                          onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setFormErrors(f => ({ ...f, [key]: false })); }}
                          style={{
                            width: '100%', padding: '11px 14px',
                            backgroundColor: SUBTLE,
                            border: `1px solid ${formErrors[key] ? ERROR_TEXT : BORDER}`,
                            borderRadius: '8px', color: TEXT,
                            fontFamily: "'Heebo', sans-serif", fontSize: '14px',
                            outline: 'none', direction: key === 'email' || key === 'phone' ? 'ltr' : 'rtl',
                            boxSizing: 'border-box',
                          }}
                        />
                        {key === 'email' && !formErrors[key] && (
                          <p style={{ color: MUTED_TEXT, fontSize: '11px', margin: '4px 0 0', fontFamily: "'Heebo', sans-serif" }}>
                            {t.cart.emailWhy}
                          </p>
                        )}
                        {formErrors[key] && <p role="alert" style={{ color: ERROR_TEXT, fontSize: '11px', margin: '4px 0 0', fontFamily: "'Heebo', sans-serif" }}>
                          {key === 'email' && form.email.trim() ? t.cart.badEmail : t.cart.required}
                        </p>}
                      </div>
                    ))}

                    {/* Coupon */}
                    <div>
                      <label htmlFor="cart-coupon" style={{ display: 'block', fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: '#6A6862', letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>
                        {t.cart.couponHint}
                      </label>
                      <div style={{
                        display: 'flex', alignItems: 'stretch', backgroundColor: SUBTLE,
                        border: `1px solid ${couponState === 'bad' ? ERROR_TEXT
                                  : couponState === 'ok' ? '#3B6B33' : BORDER}`,
                        borderRadius: '8px', overflow: 'hidden',
                      }}>
                        <input
                          id="cart-coupon"
                          type="text"
                          dir="ltr"
                          placeholder={t.cart.couponPlaceholder}
                          value={coupon}
                          onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponState('idle'); setDiscount(0); }}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }}
                          style={{
                            flex: 1, minWidth: 0, padding: '11px 14px',
                            backgroundColor: 'transparent', border: 'none', outline: 'none',
                            color: TEXT, fontFamily: "'Heebo', sans-serif", fontSize: '14px',
                            letterSpacing: '0.06em', direction: 'ltr', textAlign: 'left',
                          }}
                        />
                        <button
                          type="button"
                          onClick={applyCoupon}
                          disabled={couponState === 'checking' || !coupon.trim()}
                          style={{
                            padding: '0 18px', backgroundColor: '#EFEBE3',
                            border: 'none', borderInlineStart: `1px solid ${BORDER}`,
                            color: coupon.trim() ? TEXT : '#B5B1AA',
                            fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700,
                            cursor: coupon.trim() ? 'pointer' : 'default', whiteSpace: 'nowrap',
                          }}>
                          {couponState === 'checking' ? '…' : t.cart.couponApply}
                        </button>
                      </div>
                      {couponState === 'bad' && (
                        <p style={{ color: ERROR_TEXT, fontSize: '11px', margin: '4px 0 0', fontFamily: "'Heebo', sans-serif" }}>{t.cart.couponBad}</p>
                      )}
                      {couponState === 'ok' && (
                        <p style={{ color: '#3B6B33', fontSize: '11px', margin: '4px 0 0', fontFamily: "'Heebo', sans-serif" }}>{t.cart.couponOk}</p>
                      )}
                    </div>

                    {/* Summary */}
                    <div style={{ backgroundColor: SUBTLE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '14px 16px', marginTop: '8px' }}>
                      {discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#3B6B33' }}>{t.cart.discount}</span>
                          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700, color: '#3B6B33' }}>−{formatPrice(discount)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: "#6A6862" }}>{t.cart.orderTotal}</span>
                        <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', fontWeight: 700, color: GOLD_TEXT }}>{formatPrice(total - discount)}</span>
                      </div>
                      <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: MUTED_TEXT, margin: 0 }}>{t.cart.inclVat}</p>
                    </div>
                  </div>

                  {/* Submit */}
                  <div style={{ padding: '20px 24px', borderTop: `1px solid ${BORDER}` }}>
                    {orderError && (
                      <div style={{
                        backgroundColor: '#FBEEE9', border: '1px solid #E0B9A6',
                        borderRadius: '8px', padding: '11px 14px', marginBottom: '12px',
                        fontFamily: "'Heebo', sans-serif", fontSize: '13px',
                        color: '#A3462B', lineHeight: 1.5,
                      }}>
                        {orderError}
                      </div>
                    )}
                    <button onClick={validateAndCheckout} disabled={ordering}
                      style={{ width: '100%', backgroundColor: GOLD, color: DARK, border: 'none', borderRadius: '4px', padding: '15px', fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: ordering ? 'not-allowed' : 'pointer', opacity: ordering ? 0.7 : 1 }}>
                      {ordering ? '...' : t.cart.confirm}
                    </button>
                    <p style={{
                      fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: '#6A6862',
                      lineHeight: 1.6, margin: '10px 0 0', textAlign: 'center',
                    }}>
                      {t.cart.agree1}{' '}
                      <a href={localizePath('/presale-terms', lang)} target="_blank" rel="noopener noreferrer" style={{ color: GOLD_TEXT, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                        {t.cart.agreePresale}
                      </a>{' '}
                      {t.cart.agreeAnd}{' '}
                      <a href={localizePath('/terms', lang)} target="_blank" rel="noopener noreferrer" style={{ color: GOLD_TEXT, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                        {t.cart.agreeTerms}
                      </a>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>


            {/* Payment step — עמוד הסליקה של טרנזילה */}
            <AnimatePresence>
              {step === 'payment' && (
                <motion.div
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'absolute', inset: 0, backgroundColor: SURFACE, display: 'flex', flexDirection: 'column', zIndex: 6 }}
                  dir={dir}
                >
                  <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => setStep('details')}
                      aria-label={t.cart.backToDetails}
                      style={backBtn}
                    >
                      <Back size={19} />
                    </button>
                    <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '17px', color: TEXT, margin: 0 }}>{t.cart.payTitle}</h3>
                  </div>

                  <div style={{ flex: 1, position: 'relative', backgroundColor: SUBTLE }}>
                    {!payFrameReady && (
                      <p style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', margin: 0,
                        fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#6A6862',
                      }}>
                        {t.cart.payLoading}
                      </p>
                    )}
                    {/* allowpaymentrequest נדרש כדי ש-Google Pay יופיע בתוך המסגרת */}
                    <iframe
                      ref={iframeRef}
                      name={TRANZILA_FRAME}
                      title={t.cart.payTitle}
                      onLoad={() => setPayFrameReady(true)}
                      allow="payment"
                      // @ts-expect-error — תכונה לא סטנדרטית שטרנזילה דורשת ל-Google Pay
                      allowpaymentrequest="true"
                      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    />
                  </div>

                  <div style={{ padding: '14px 24px', borderTop: `1px solid ${BORDER}` }}>
                    <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: '#6A6862', lineHeight: 1.6, margin: 0, textAlign: 'center' }}>
                      {t.cart.payNote}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{ padding: '24px', borderTop: `1px solid ${BORDER}` }}>
                {/* ההנחה מוצגת כאן ולא רק במסך הפרטים: זו השורה שהלקוח
                    מסתכל עליה לפני שהוא מחליט להמשיך. */}
                {presaleOff > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#3B6B33' }}>
                      {items.every(i => i.model.price === presale.presalePrice && (i.presaleLeft ?? 0) >= i.quantity)
                        ? t.cart.presaleDiscount : t.cart.discount}
                    </span>
                    <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, color: '#3B6B33' }}>
                      −{formatPrice(presaleOff)}
                    </span>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#3B6B33' }}>
                      {t.cart.discount}{coupon ? ` · ${coupon.toUpperCase()}` : ''}
                    </span>
                    <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, color: '#3B6B33' }}>
                      −{formatPrice(discount)}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: "#6A6862" }}>{t.cart.total}</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    {listTotal > total - discount && (
                      <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: MUTED_TEXT, textDecoration: 'line-through' }}>
                        {formatPrice(listTotal)}
                      </span>
                    )}
                    <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '22px', fontWeight: 800, color: GOLD_TEXT }}>
                      {formatPrice(total - discount)}
                    </span>
                  </span>
                </div>
                {/* העגלה וטופס הפרטים לא אמרו שמדובר בהזמנה מוקדמת,
                    בעוד עמוד המוצר כן. הלקוח הגיע לתשלום בלי לדעת
                    שהמוצר טרם במלאי. */}
                {presale.active && items.some(i => i.kind !== 'merch') && (
                  <div style={{
                    display: 'flex', gap: '8px', alignItems: 'flex-start',
                    backgroundColor: '#F5F2EC', border: `1px solid ${BORDER}`,
                    borderRadius: '8px', padding: '11px 13px', marginBottom: '16px',
                  }}>
                    <CalendarClock size={15} style={{ color: GOLD, flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '12.5px',
                                   color: '#4A4845', lineHeight: 1.6 }}>
                      {t.cart.presaleNote(arrivalLabelIn(presale.arrivalLabel, lang))}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setStep('details')}
                  disabled={ordering}
                  style={{
                    width: '100%',
                    backgroundColor: GOLD, color: DARK,
                    border: 'none', borderRadius: '4px',
                    padding: '16px',
                    fontFamily: "'Heebo', sans-serif",
                    fontSize: '14px', fontWeight: 700,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    cursor: ordering ? 'not-allowed' : 'pointer',
                    opacity: ordering ? 0.7 : 1,
                    transition: 'background-color 0.25s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#B8933A'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = GOLD; }}
                >
                  {ordering ? '...' : t.cart.checkout}
                </button>
                <button
                  onClick={clearCart}
                  style={{
                    width: '100%', marginTop: '10px',
                    backgroundColor: 'transparent', color: "#6A6862",
                    border: 'none',
                    fontFamily: "'Heebo', sans-serif",
                    fontSize: '12px', cursor: 'pointer',
                    letterSpacing: '0.1em',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = TEXT; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#6A6862"; }}
                >
                  {t.cart.clear}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
