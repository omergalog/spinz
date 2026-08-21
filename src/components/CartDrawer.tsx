import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { OutOfStockError, checkCoupon, loadApplePay, openCheckout, submitToIframe }
  from '../lib/payment';
import { useT, useDir, useLang } from '../i18n/LanguageContext';

const DARK    = '#1C1C1C';   // text on gold buttons
const GOLD    = '#C9A870';
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
  const total = items.reduce((sum, i) => sum + i.model.price * i.quantity, 0);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [step, setStep] = useState<'cart' | 'details' | 'payment'>('cart');
  const [payFrameReady, setPayFrameReady] = useState(false);
  const [coupon, setCoupon] = useState(savedCoupon);
  const [couponState, setCouponState] = useState<'idle' | 'checking' | 'ok' | 'bad'>('idle');
  const [discount, setDiscount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
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
    checkCoupon(savedCoupon, total).then(r => {
      if (!alive) return;
      setCoupon(savedCoupon);
      setDiscount(r.valid ? r.discount : 0);
      setCouponState(r.valid ? 'ok' : 'bad');
    });
    return () => { alive = false; };
  }, [isOpen, savedCoupon, total]);

  // סגירת המגירה מאפסת את התהליך. בלי זה, פתיחה חוזרת הייתה מציגה
  // מסגרת תשלום ישנה ששייכת לסל שכבר פג.
  useEffect(() => {
    if (isOpen) return;
    setStep('cart');
    setPayFrameReady(false);
    setOrderError(null);
    setCouponState('idle');
  }, [isOpen]);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponState('checking');
    // ההנחה מחושבת בשרת. כאן רק מציגים את התוצאה, כדי שהסכום שמוצג
    // יהיה בדיוק זה שייגבה.
    const r = await checkCoupon(coupon.trim(), total);
    setDiscount(r.valid ? r.discount : 0);
    setCouponState(r.valid ? 'ok' : 'bad');
    saveCoupon(r.valid ? coupon.trim() : '');
  };

  const validateAndCheckout = () => {
    const errors: Record<string, boolean> = {};
    if (!form.name.trim()) errors.name = true;
    if (!form.phone.trim()) errors.phone = true;
    if (!form.address.trim()) errors.address = true;
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
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
        })),
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        address: form.address,
        // הקוד נשלח תמיד, גם אם לא נלחץ "החל". השרת מאמת אותו בכל
        // מקרה, ולכן אין מה להרוויח מלסנן כאן — ויש מה להפסיד:
        // לקוח שהקליד קוד ולא לחץ היה מחויב במחיר המלא.
        coupon: (coupon.trim() || savedCoupon || '') || undefined,
        lang,
      });

      setPayFrameReady(false);
      setStep('payment');
      loadApplePay();
      // ה-iframe נוצר ברינדור הבא, ולכן ההגשה מחכה לו.
      requestAnimationFrame(() => submitToIframe(session, TRANZILA_FRAME));
    } catch (e) {
      if (e instanceof OutOfStockError) {
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
                <button onClick={closeCart} style={{ color: TEXT, background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
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
                          alt={item.model.name}
                          onError={e => { (e.currentTarget as HTMLImageElement).src = item.model.image; }}
                          style={{ width: '80px', height: '60px', objectFit: 'contain', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '16px', color: TEXT, margin: '0 0 4px' }}>
                            {item.model.name}
                          </h3>
                          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '16px', fontWeight: 700, color: GOLD }}>
                            {formatPrice(item.model.price * item.quantity)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <button
                            onClick={() => updateQuantity(item.model.id, item.quantity + 1)}
                            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '4px', color: TEXT, cursor: 'pointer' }}
                          >
                            <Plus size={14} />
                          </button>
                          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, color: TEXT, minWidth: '20px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.model.id, item.quantity - 1)}
                            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '4px', color: item.quantity === 1 ? '#CC4400' : TEXT, cursor: 'pointer' }}
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
                      style={{ background: 'none', border: 'none', color: "#6A6862", cursor: 'pointer', padding: '10px', margin: '-10px', fontSize: '20px', lineHeight: 1 }}
                    >
                      →
                    </button>
                    <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '17px', color: TEXT, margin: 0 }}>{t.cart.shippingDetails}</h3>
                  </div>

                  {/* Form */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
                    {[
                      { key: 'name', label: t.cart.nameLabel, placeholder: t.cart.namePlaceholder, type: 'text' },
                      { key: 'phone', label: t.cart.phoneLabel, placeholder: '050-0000000', type: 'tel' },
                      { key: 'email', label: t.cart.emailLabel, placeholder: 'israel@example.com', type: 'email' },
                      { key: 'address', label: t.cart.addressLabel, placeholder: t.cart.addressPlaceholder, type: 'text' },
                    ].map(({ key, label, placeholder, type }) => (
                      <div key={key}>
                        <label style={{ display: 'block', fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: formErrors[key] ? '#FF6B6B' : "#6A6862", letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>
                          {label}
                        </label>
                        <input
                          type={type}
                          // Email/phone hold Latin characters – force LTR so the
                          // caret and separators don't jump inside an RTL form
                          dir={type === 'email' || type === 'tel' ? 'ltr' : 'rtl'}
                          placeholder={placeholder}
                          value={form[key as keyof typeof form]}
                          onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setFormErrors(f => ({ ...f, [key]: false })); }}
                          style={{
                            width: '100%', padding: '11px 14px',
                            backgroundColor: SUBTLE,
                            border: `1px solid ${formErrors[key] ? '#FF6B6B' : BORDER}`,
                            borderRadius: '8px', color: TEXT,
                            fontFamily: "'Heebo', sans-serif", fontSize: '14px',
                            outline: 'none', direction: key === 'email' || key === 'phone' ? 'ltr' : 'rtl',
                            boxSizing: 'border-box',
                          }}
                        />
                        {formErrors[key] && <p style={{ color: '#FF6B6B', fontSize: '11px', margin: '4px 0 0', fontFamily: "'Heebo', sans-serif" }}>{t.cart.required}</p>}
                      </div>
                    ))}

                    {/* Coupon */}
                    <div>
                      <label style={{ display: 'block', fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: '#6A6862', letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>
                        {t.cart.couponHint}
                      </label>
                      <div style={{
                        display: 'flex', alignItems: 'stretch', backgroundColor: SUBTLE,
                        border: `1px solid ${couponState === 'bad' ? '#FF6B6B'
                                  : couponState === 'ok' ? '#3B6B33' : BORDER}`,
                        borderRadius: '8px', overflow: 'hidden',
                      }}>
                        <input
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
                        <p style={{ color: '#FF6B6B', fontSize: '11px', margin: '4px 0 0', fontFamily: "'Heebo', sans-serif" }}>{t.cart.couponBad}</p>
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
                        <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', fontWeight: 700, color: GOLD }}>{formatPrice(total - discount)}</span>
                      </div>
                      <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '11px', color: "#9A9690", margin: 0 }}>{t.cart.inclVat}</p>
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
                      <a href="/presale-terms" target="_blank" rel="noopener noreferrer" style={{ color: '#8A6D3B', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                        {t.cart.agreePresale}
                      </a>{' '}
                      {t.cart.agreeAnd}{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#8A6D3B', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
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
                      style={{ background: 'none', border: 'none', color: '#6A6862', cursor: 'pointer', padding: '10px', margin: '-10px', fontSize: '20px', lineHeight: 1 }}
                    >
                      →
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
                    {discount > 0 && (
                      <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: '#9A9690', textDecoration: 'line-through' }}>
                        {formatPrice(total)}
                      </span>
                    )}
                    <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '22px', fontWeight: 800, color: GOLD }}>
                      {formatPrice(total - discount)}
                    </span>
                  </span>
                </div>
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
