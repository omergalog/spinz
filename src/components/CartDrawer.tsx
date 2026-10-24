import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, ArrowRight, ArrowLeft, CalendarClock } from 'lucide-react';
import { COMPANY } from '../config/company';
import { MAX_BIKES_PER_ORDER, MAX_PER_LINE, useCart, type UnitCoupon } from '../context/CartContext';
import { type CheckoutSession, AlreadyPaidError, AttemptOpenError, CouponRejectedError, HoldLimitError, OrderTooLargeError, OutOfStockError, PurchaseInvalidError, TooManyCartsError, checkCoupon, checkUnitCoupon, fetchStatus, loadApplePay, openCheckout, reportBlockedFrame, submitToIframe }
  from '../lib/payment';
import { dropPurchase, ensurePurchase, markPurchasePaid, purchaseToken, startNewPurchase } from '../lib/purchase';
import { useT, useDir, useLang, localizePath } from '../i18n/LanguageContext';
import { arrivalLabelIn, usePresale } from '../config/presale';
import { merchLabel } from '../data/merch';
import PrivacyNote from './PrivacyNote';

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
// בדיקת קופון שלא חזרה עד אז נחשבת כושלת, וכפתור ההמשך משתחרר.
const COUPON_TIMEOUT_MS = 8000;
// חלון התשלום שלא נטען עד אז: הודעה ודרך חזרה, במקום "טוען…" בלי סוף.
// חל רק על הטעינה הראשונה של החלון, לא על 3DS ולא על תשלום שכבר התחיל.
const PAY_LOAD_TIMEOUT_MS = 20000;
const DETAILS_KEY = 'spinz-checkout-details';
/** אחרי תשלום מוצלח הפרטים לא נשארים בדפדפן. */
function clearCheckoutDetails() {
  try { sessionStorage.removeItem(DETAILS_KEY); } catch { /* אחסון חסום */ }
}

function formatPrice(n: number) {
  return `₪${n.toLocaleString('he-IL')}`;  // מספרים זהים בשתי השפות
}

export default function CartDrawer() {
  const t = useT();
  const dir = useDir();
  const lang = useLang();
  const { items, updateQuantity, clearCart, totalCount, isOpen, closeCart, coupon: savedCoupon, setCoupon: saveCoupon,
          unitCoupons, addUnitCoupon, removeUnitCoupon } = useCart();
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

  // קודים לזוג בודד. ההנחה של כל אחד נשמרת ברגע ההחלה, לתצוגה; השרת
  // מתמחר מחדש ביצירת הסל. קוד ההזמנה חל על מה שנשאר אחריהם.
  const unitDiscOf = (id: string) => (unitCoupons[id] ?? []).reduce((s, c) => s + c.discount, 0);
  const unitDiscTotal = items.reduce((s, i) => s + unitDiscOf(i.model.id), 0);
  const afterUnits = total - unitDiscTotal;
  // מחיר הזוג ה-k בשורה לפני קוד: קודם זוגות שבמחיר ההשקה, כמו בשרת.
  const unitBase = (i: typeof items[number], k: number) => {
    const atPresale = i.kind !== 'merch' && presale.active
      ? Math.min(i.quantity, Math.max(0, i.presaleLeft ?? i.quantity)) : 0;
    return k < atPresale ? i.model.price : (i.fullPrice ?? i.model.price);
  };
  const codeInCart = (code: string) =>
    Object.values(unitCoupons).flat().filter(c => c.code.toUpperCase() === code.toUpperCase()).length;

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
  // שגיאות שהפתרון שלהן הוא לדבר איתנו מקבלות קישור לוואטסאפ.
  const [orderErrorContact, setOrderErrorContact] = useState(false);
  // הרכישה כבר שולמה (מזהה הסל ששולם): מוצעת רכישה נוספת, בבחירה מפורשת
  const [alreadyPaid, setAlreadyPaid] = useState<string | null>(null);
  // ניסיון קודם ברכישה עדיין יכול להסתיים בחיוב: לא נפתח תשלום חדש
  const [attemptOpen, setAttemptOpen] = useState<string | null>(null);
  const bikeUnits = items.reduce((n, i) => n + (i.kind === 'merch' ? 0 : i.quantity), 0);
  const tooManyBikes = bikeUnits > MAX_BIKES_PER_ORDER;
  const waLink = `https://wa.me/${COMPANY.phoneE164}`;
  const [step, setStep] = useState<'cart' | 'details' | 'payment'>('cart');
  const [payFrameReady, setPayFrameReady] = useState(false);
  // הדפדפן חסם מסגרת בתוך חלון התשלום (למשל מסך 3DS של בנק). בלי זה
  // הלקוח ראה מסך אפור ריק ולא ידע מה לעשות.
  const [payBlocked, setPayBlocked] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  /**
   * קוד ההנחה של כל ההזמנה.
   *
   * השדה (coupon) הוא טיוטה. הקוד שקובע את הסכום הוא הקוד שהוחל
   * (savedCoupon, נשמר בעגלה). קודם כל הקלדה בשדה מחקה את הקוד שהוחל,
   * ותשובת "לא תקף" — גם כשהרשת נפלה — מחקה אותו לגמרי. עכשיו רק
   * "החל" מצליח מחליף אותו, ורק "הסרת הקוד" מסירה אותו.
   *
   * קוד שהוחל אינו אישור להנחה על עגלה אחרת: ההנחה תקפה רק מול הקוד
   * והעגלה שנבדקו (couponKey). מיד כשהעגלה משתנה, עוד לפני שהבדיקה
   * יוצאת, הסכום מוצג כ"מעדכן…" ולא לפי ההנחה הקודמת.
   *
   * לכל בדיקה יש מספר, ורק התשובה לאחרונה נקבעת. שינוי בעגלה, בטיוטה
   * או בקוד שהוחל, סגירת המגירה ופסק זמן מבטלים את מה שבדרך.
   */
  const [coupon, setCoupon] = useState(savedCoupon);
  useEffect(() => { setCoupon(savedCoupon); }, [savedCoupon]);
  type CouponCheck = { key: string; status: 'checking' | 'ok' | 'bad' | 'error'; discount: number };
  const [applied, setApplied] = useState<CouponCheck | null>(null);
  // "החל" על טיוטה שעוד לא הפכה לקוד שהוחל
  const [draftCheck, setDraftCheck] = useState<{ code: string; status: 'checking' | 'bad' | 'error'; unitScope?: boolean } | null>(null);
  const appliedSeq = useRef(0);
  const draftSeq = useRef(0);
  const couponKey = (code: string) => `${code.trim().toUpperCase()}|${afterUnits}|${units}`;
  const appliedCode = savedCoupon.trim().toUpperCase();
  const draftCode = coupon.trim().toUpperCase();
  const appliedNow = appliedCode && applied?.key === couponKey(appliedCode) ? applied : null;
  const appliedStatus: 'none' | 'pending' | 'ok' | 'bad' | 'error' =
    !appliedCode || total <= 0 ? 'none'
      : !appliedNow || appliedNow.status === 'checking' ? 'pending'
      : appliedNow.status;
  const discount = appliedStatus === 'ok' ? appliedNow!.discount : 0;
  const payable = afterUnits - discount;
  // בכל מצב שאינו "אושר" או "אין קוד" לא מוצג סכום, כי אין סכום סופי.
  // גם בזמן בדיקה של קוד חדש: הסכום עומד להשתנות.
  const draftChecking = draftCheck?.status === 'checking';
  const amountPending = draftChecking || appliedStatus === 'pending' || appliedStatus === 'error' || appliedStatus === 'bad';
  const pendingText = draftChecking || appliedStatus === 'pending' ? t.cart.couponUpdating
    : appliedStatus === 'error' ? t.cart.couponPending : t.cart.couponTotalBlocked;
  const discountRowText = appliedStatus === 'ok' ? `−${formatPrice(discount)}`
    : appliedStatus === 'pending' ? t.cart.couponUpdating
    : appliedStatus === 'error' ? t.cart.couponPending : t.cart.couponNotApplied;
  const clearCouponOrderError = () => setOrderError(prev =>
    prev === t.cart.couponCheckFailed || prev === t.cart.couponBad
      || (appliedCode && prev === t.cart.couponInvalidForCart(appliedCode)) ? null : prev);

  // null = פסק זמן. תשובה שתגיע אחריו לא תיקבע, כי המספר שלה כבר ישן.
  const timedCheck = (code: string) => Promise.race([
    checkCoupon(code, afterUnits, units),
    new Promise<null>(res => setTimeout(() => res(null), COUPON_TIMEOUT_MS)),
  ]);

  // בדיקת הקוד שהוחל מול העגלה הנוכחית
  const verifyApplied = async (): Promise<'ok' | 'bad' | 'error' | 'stale'> => {
    const code = appliedCode;
    const id = ++appliedSeq.current;
    const key = couponKey(code);
    setApplied({ key, status: 'checking', discount: 0 });
    const r = await timedCheck(code);
    if (id !== appliedSeq.current) return 'stale';
    if (r === null || r.failed) {
      // כשל בבדיקה אינו קביעה שהקוד שגוי: הקוד נשאר, ההנחה לא מאושרת.
      appliedSeq.current += 1;
      setApplied({ key, status: 'error', discount: 0 });
      return 'error';
    }
    setApplied({ key, status: r.valid ? 'ok' : 'bad', discount: r.valid ? r.discount : 0 });
    if (r.valid) clearCouponOrderError();
    return r.valid ? 'ok' : 'bad';
  };

  // "החל" על הטיוטה. רק הצלחה מחליפה את הקוד שהוחל.
  const applyDraft = async (): Promise<'ok' | 'bad' | 'error' | 'stale' | 'empty'> => {
    const code = draftCode;
    if (!code) return 'empty';
    const id = ++draftSeq.current;
    const key = couponKey(code);
    setDraftCheck({ code, status: 'checking' });
    const r = await timedCheck(code);
    if (id !== draftSeq.current) return 'stale';
    if (r === null || r.failed) {
      draftSeq.current += 1;
      setDraftCheck({ code, status: 'error' });
      return 'error';
    }
    if (!r.valid) {
      setDraftCheck({ code, status: 'bad', unitScope: r.reason === 'UNIT_SCOPE' });
      return 'bad';
    }
    appliedSeq.current += 1;           // בדיקה של הקוד הקודם כבר לא רלוונטית
    setApplied({ key, status: 'ok', discount: r.discount });
    setDraftCheck(null);
    saveCoupon(code);
    clearCouponOrderError();
    return 'ok';
  };

  const removeApplied = () => {
    appliedSeq.current += 1;
    draftSeq.current += 1;
    setApplied(null);
    setDraftCheck(null);
    saveCoupon('');
    setCoupon('');
    clearCouponOrderError();
  };

  // "לבדוק שוב" ו"הסרת הקוד" ליד הקוד שהוחל. ההסרה היא הדרך המפורשת
  // להמשיך במחיר מלא; שום מסלול אחר לא מוריד את הקוד.
  const couponLinks = (
    <>
      {appliedStatus === 'error' && (
        <>{' · '}<button type="button" onClick={() => { verifyApplied(); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: ERROR_TEXT, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px', fontFamily: 'inherit', fontSize: 'inherit' }}>{t.cart.couponRetry}</button></>
      )}
      {' · '}<button type="button" onClick={removeApplied} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: ERROR_TEXT, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px', fontFamily: 'inherit', fontSize: 'inherit' }}>{t.cart.couponRemove}</button>
    </>
  );
  /**
   * חלון התשלום.
   *
   * ההגשה ל-iframe חיכתה לפריים אחד (requestAnimationFrame) בהנחה שהמסגרת
   * כבר קיימת, ותשובה שהגיעה אחרי שהלקוח סגר את העגלה או חזר לפרטים עדיין
   * העבירה לשלב התשלום ושלחה טופס למסגרת שלא הייתה קיימת. בפתיחה הבאה
   * הוצגה מסגרת ריקה ו"טוען…" בלי סוף, עד חזרה ואישור מחדש. עכשיו:
   * - לכל ניסיון יש מספר. סגירה וחזרה מבטלות את מה שבדרך, ותשובה ישנה לא
   *   נוגעת במסך.
   * - הטופס נשלח מ-effect, רק כשהמסגרת של הסל הזה קיימת. לכל סל מסגרת בשם
   *   משלה, כדי שמסגרת קודמת שעוד יוצאת באנימציה לא תקבל אותו.
   * - "נטען" רק כשהמסגרת עברה לעמוד של טרנזילה, לא על about:blank.
   */
  const checkoutSeq = useRef(0);
  // הנעילה של "אשר הזמנה" שייכת לניסיון שלקח אותה. ניסיון שננטש משחרר
  // אותה מיד, וכשהוא מסתיים מאוחר יותר הוא לא נוגע בנעילה של ניסיון חדש.
  const submitting = useRef<object | null>(null);
  const [payForm, setPayForm] = useState<{ seq: number; session: CheckoutSession; frame: string } | null>(null);
  const submittedFrame = useRef<string | null>(null);
  const [payFrame, setPayFrame] = useState<HTMLIFrameElement | null>(null);
  const [payTimedOut, setPayTimedOut] = useState(false);

  // יציאה משלב התשלום: שום תשובה, הגשה או טיימר של הניסיון הזה לא ימשיכו.
  const abandonPayment = () => {
    checkoutSeq.current += 1;
    submitting.current = null;
    setOrdering(false);
    submittedFrame.current = null;
    sessionIdRef.current = null;
    setPayForm(null);
    setPayFrameReady(false);
    setPayTimedOut(false);
    setPayBlocked(false);
  };
  const backToDetails = () => { abandonPayment(); setStep('details'); };

  useEffect(() => {
    if (step !== 'payment' || !payForm || !payFrame) return;
    if (payForm.seq !== checkoutSeq.current) return;
    if (payFrame.name !== payForm.frame || submittedFrame.current === payForm.frame) return;
    submittedFrame.current = payForm.frame;
    submitToIframe(payForm.session, payForm.frame);
  }, [step, payForm, payFrame]);

  useEffect(() => {
    if (step !== 'payment' || !payForm || payFrameReady || payTimedOut) return;
    const seq = payForm.seq;
    const timer = setTimeout(() => { if (seq === checkoutSeq.current) setPayTimedOut(true); }, PAY_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [step, payForm, payFrameReady, payTimedOut]);

  const onPayFrameLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const f = e.currentTarget;
    // מסגרת שעוד לא נשלח אליה טופס טוענת about:blank, וזה לא עמוד התשלום.
    if (submittedFrame.current !== f.name) return;
    try {
      if (f.contentWindow?.location.href === 'about:blank') return;
    } catch { /* מקור אחר: העמוד של טרנזילה נטען */ }
    setPayFrameReady(true);
  };
  // פרטי הקשר והמסירה שורדים רענון של הלשונית (sessionStorage: נמחקים
  // כשהלשונית נסגרת ואחרי תשלום מוצלח). פרטי כרטיס לא עוברים כאן בכלל —
  // הם מוזנים בחלון של טרנזילה.
  const [form, setForm] = useState<{ name: string; email: string; phone: string; address: string }>(() => {
    const empty = { name: '', email: '', phone: '', address: '' };
    try {
      const saved = JSON.parse(sessionStorage.getItem(DETAILS_KEY) ?? 'null');
      return saved?.form ? { ...empty, ...saved.form } : empty;
    } catch { return empty; }
  });
  /**
   * אופן המסירה.
   *
   * האתר מבטיח איסוף עצמי חינם מכפר ויתקין, ובטופס לא הייתה דרך
   * לבחור בו — הכתובת הייתה שדה חובה והלקוח נאלץ להמציא אחת.
   */
  const [delivery, setDelivery] = useState<'ship' | 'pickup'>(() => {
    try { return JSON.parse(sessionStorage.getItem(DETAILS_KEY) ?? 'null')?.delivery === 'pickup' ? 'pickup' : 'ship'; }
    catch { return 'ship'; }
  });
  useEffect(() => {
    try { sessionStorage.setItem(DETAILS_KEY, JSON.stringify({ form, delivery })); } catch { /* אחסון חסום */ }
  }, [form, delivery]);
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
      if (e.data.outcome === 'success') { clearCart(); saveCoupon(''); clearCheckoutDetails(); markPurchasePaid(id); }

      closeCart();
      setStep('cart');
      navigate(`/order/${e.data.outcome === 'failed' ? 'failed' : 'success'}?s=${id}`);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [clearCart, closeCart, navigate, saveCoupon]);

  // ערוץ שני לסיום התשלום, שלא תלוי במה שקורה בתוך המסגרת. בעסקה עם
  // 3DS חלון טרנזילה נתקע בספינר (directng.tranzila.com/process/from_trapi)
  // ולא הגיע לדף החזרה, ולכן ההודעה למעלה לא נשלחה — הלקוח חויב ונשאר
  // מול ספינר. כאן שואלים את השרת אם הסל שולם (ההזמנה נוצרת ב-notify,
  // בלי קשר למסגרת), ובהצלחה עוברים לעמוד התודה.
  //
  // אותו ערוץ משמש גם כשהשרת סירב לפתוח תשלום חדש כי ניסיון קודם
  // ברכישה עדיין פתוח (attemptOpen): אם הוא יאושר, עוברים לתודה.
  const watchId = step === 'payment' ? 'payment' : attemptOpen;
  useEffect(() => {
    if (!watchId) return;
    let alive = true;
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const id = watchId === 'payment' ? sessionIdRef.current : watchId;
      if (!alive || !id) return;
      const s = await fetchStatus(id, purchaseToken()).catch(() => null);
      if (!alive) return;
      if (s && s !== 'rate' && s.status === 'paid') {
        clearCart(); saveCoupon(''); clearCheckoutDetails(); markPurchasePaid(id);
        setAttemptOpen(null);
        closeCart();
        setStep('cart');
        navigate(`/order/success?s=${id}`);
        return;
      }
      // כל 5 שניות בשתי הדקות הראשונות, אחר כך כל 30, עד חצי שעה.
      // השרת ביקש להאט — מאטים.
      const age = Date.now() - started;
      if (age > 30 * 60_000) return;
      timer = setTimeout(tick, s === 'rate' || age > 120_000 ? 30_000 : 5_000);
    };
    timer = setTimeout(tick, 5_000);
    return () => { alive = false; clearTimeout(timer); };
  }, [watchId, clearCart, closeCart, navigate, saveCoupon]);

  // הקוד שהוחל (גם מעמוד המוצר) נבדק כאן מחדש מול העגלה האמיתית, בכל
  // שינוי בה. בעמוד המוצר הוא נבדק מול מחיר יחידה אחת.
  useEffect(() => {
    if (!isOpen || !appliedCode || total <= 0) return;
    if (appliedNow) return;            // כבר נבדק, או בבדיקה, מול העגלה הזו בדיוק
    verifyApplied();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, appliedCode, afterUnits, units, applied]);

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

  // מסגרת שה-CSP שלנו חסם (frame-src) מדווחת כאן ולא בתוך המסגרת:
  // מבחוץ אי אפשר לראות מה קורה בחלון של טרנזילה, אבל חסימה של הדף
  // שלנו כן מגיעה לכאן, עם הכתובת שנחסמה.
  useEffect(() => {
    if (step !== 'payment') return;
    const onViolation = (e: SecurityPolicyViolationEvent) => {
      const d = e.effectiveDirective || e.violatedDirective || '';
      if (!d.startsWith('frame-src') && !d.startsWith('child-src')) return;
      setPayBlocked(true);
      reportBlockedFrame(sessionIdRef.current, e.blockedURI, d);
    };
    document.addEventListener('securitypolicyviolation', onViolation);
    return () => document.removeEventListener('securitypolicyviolation', onViolation);
  }, [step]);

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
    abandonPayment();
    setOrderError(null);
    // הקוד שהוחל נשאר. הבדיקה שלו תיעשה מחדש בפתיחה הבאה.
    appliedSeq.current += 1;
    draftSeq.current += 1;
    setApplied(null);
    setDraftCheck(null);
  }, [isOpen]);

  // לחיצה כפולה על "לתשלום" פתחה שתי בדיקות קוד ושני ניסיונות לפתוח סל.
  const validateAndCheckout = async () => {
    if (submitting.current) return;
    const mine = {};
    submitting.current = mine;
    try { await validateAndCheckoutOnce(); } finally { if (submitting.current === mine) submitting.current = null; }
  };

  const validateAndCheckoutOnce = async () => {
    // בדיקת הקוד לפני פתיחת הסל לוקחת זמן. אם הלקוח סגר או חזר בינתיים,
    // הניסיון הזה לא ממשיך לפתיחת סל.
    const startSeq = checkoutSeq.current;
    const abandoned = () => startSeq !== checkoutSeq.current;
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

    // ההסברים כאן מוצגים גם ליד הכפתור: השדה עצמו יכול להיות מחוץ למסך.
    // אף מסלול לא מוריד קוד בשקט וממשיך במחיר מלא.

    // קוד שהוקלד ולא הוחל: מחילים אותו כאן, במקום להתעלם ממנו בשקט.
    if (draftCode && draftCode !== appliedCode) {
      const res = await applyDraft();
      if (abandoned()) return;
      if (res === 'error') { setOrderError(t.cart.couponCheckFailed); return; }
      if (res === 'bad') { setOrderError(t.cart.couponBad); return; }
      if (res !== 'ok') return;
      checkoutCode.current = draftCode;
      if (!abandoned()) await handleCheckout(false, draftCode);
      return;
    }

    // הקוד שהוחל חייב להיות מאושר מול העגלה הזו.
    if (appliedCode) {
      if (appliedStatus !== 'ok') {
        const res = await verifyApplied();
        if (abandoned()) return;
        if (res === 'error') { setOrderError(t.cart.couponCheckFailed); return; }
        if (res === 'bad') { setOrderError(t.cart.couponInvalidForCart(appliedCode)); return; }
        if (res !== 'ok') return;
      }
      checkoutCode.current = appliedCode;
      if (!abandoned()) await handleCheckout(false, appliedCode);
      return;
    }

    checkoutCode.current = null;
    if (!abandoned()) await handleCheckout(false, null);
  };

  // הקוד שאושר בלחיצה האחרונה על "אשר הזמנה". גם ניסיון חוזר ורכישה
  // נוספת משתמשים בו.
  const checkoutCode = useRef<string | null>(null);
  const handleCheckout = async (retried = false, code: string | null = checkoutCode.current) => {
    const seq = ++checkoutSeq.current;
    setOrdering(true);
    setOrderError(null);
    setOrderErrorContact(false);
    setAlreadyPaid(null);
    setAttemptOpen(null);
    // הרכישה מזהה את הקנייה הזו גם אחרי רענון ובלשוניות אחרות. אם השרת
    // לא זמין לפתוח רכישה, ממשיכים בלעדיה כמו קודם.
    const purchase = await ensurePurchase();
    // ננטש בזמן פתיחת הרכישה: לא פותחים סל. המצב שייך כבר לניסיון אחר.
    if (seq !== checkoutSeq.current) return;
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
          coupons: (unitCoupons[i.model.id] ?? []).map(c => c.code),
        })),
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        address: delivery === 'pickup' ? undefined : form.address,
        delivery,
        // רק קוד שאושר מול העגלה הזו. מה שמופיע על המסך הוא מה שנגבה.
        coupon: code ?? undefined,
        lang,
        purchaseKey: purchase?.key,
        ownerToken: purchase?.token,
      });

      // הלקוח סגר את העגלה או חזר לפרטים בזמן ההמתנה: התשובה לא מעבירה
      // לתשלום. הסל שנפתח ייסגר בניסיון הבא או יפוג.
      // ordering לא מתאפס כאן: הוא כבר שייך לניסיון החדש, אם יש כזה.
      if (seq !== checkoutSeq.current) return;

      submittedFrame.current = null;
      setPayFrameReady(false);
      setPayBlocked(false);
      setPayTimedOut(false);
      sessionIdRef.current = session.session_id ?? null;
      setPayForm({ seq, session, frame: `${TRANZILA_FRAME}-${session.session_id ?? seq}` });
      setStep('payment');
      loadApplePay();
    } catch (e) {
      // שגיאה מאוחרת של ניסיון שננטש לא מוצגת ולא משנה את המצב
      if (seq !== checkoutSeq.current) return;
      if (e instanceof PurchaseInvalidError && purchase && !retried) {
        dropPurchase(purchase.key);
        return handleCheckout(true, code);
      }
      if (e instanceof AlreadyPaidError) {
        setAlreadyPaid(e.sessionId);
        setOrderError(t.cart.errAlreadyPaid(e.sessionId.slice(0, 8).toUpperCase()));
      } else if (e instanceof AttemptOpenError) {
        setAttemptOpen(e.sessionId);
        setOrderError(t.cart.errAttemptOpen(e.sessionId.slice(0, 8).toUpperCase()));
        setOrderErrorContact(true);
      } else if (e instanceof CouponRejectedError && e.code) {
        // קוד של זוג שנדחה: מסירים בדיוק אותו, וקוד ההזמנה נשאר.
        // אם הקוד הוחל על כמה זוגות, השרת דחה את השימוש האחרון (למשל
        // מכסה שנגמרה). מסירים רק אותו, מהשורה האחרונה שבה הוא מופיע.
        const hit = Object.entries(unitCoupons).reverse()
          .find(([, list]) => list.some(c => c.code.toUpperCase() === e.code!.toUpperCase()));
        if (hit) removeUnitCoupon(hit[0], hit[1].find(c => c.code.toUpperCase() === e.code!.toUpperCase())!.code);
        setOrderError(t.cart.errCouponRejected);
      } else if (e instanceof CouponRejectedError) {
        // הקוד חדל להיות תקף בין ההחלה לאישור. הוא נשאר ומסומן כלא תקף,
        // והלקוח מחליט: להחליף או להסיר ולהמשיך במחיר מלא.
        if (code) {
          appliedSeq.current += 1;
          setApplied({ key: couponKey(code), status: 'bad', discount: 0 });
        }
        setOrderError(t.cart.errCouponRejected);
      } else if (e instanceof TooManyCartsError) {
        setOrderError(t.cart.errTooManyCarts);
      } else if (e instanceof OrderTooLargeError) {
        setOrderError(t.cart.errOrderTooLarge(MAX_BIKES_PER_ORDER));
        setOrderErrorContact(true);
      } else if (e instanceof HoldLimitError) {
        setOrderError(t.cart.errHoldLimit(MAX_BIKES_PER_ORDER));
        setOrderErrorContact(true);
      } else if (e instanceof OutOfStockError) {
        setOrderError(e.left > 0 ? t.cart.errQty(e.left) : t.cart.errOutOfStock);
      } else {
        setOrderError(t.cart.errGeneric);
      }
    }
    if (seq === checkoutSeq.current) setOrdering(false);
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
                              {formatPrice(lineTotal(item) - unitDiscOf(item.model.id))}
                            </span>
                            {listUnit(item) * item.quantity > lineTotal(item) - unitDiscOf(item.model.id) && (
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
                          {/* הנחת ההשקה של השורה, ומתחתיה קוד לכל זוג */}
                          {item.kind !== 'merch' && listUnit(item) * item.quantity > lineTotal(item) && (
                            <span style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontFamily: "'Heebo', sans-serif", fontSize: '12px', color: '#3B6B33' }}>
                              <span>{t.cart.presaleDiscount}</span>
                              <span>−{formatPrice(listUnit(item) * item.quantity - lineTotal(item))}</span>
                            </span>
                          )}
                          {item.kind !== 'merch' && (
                            <UnitCouponBox
                              t={t}
                              list={unitCoupons[item.model.id] ?? []}
                              max={item.quantity}
                              onRemove={code => removeUnitCoupon(item.model.id, code)}
                              onApply={async code => {
                                const k = (unitCoupons[item.model.id] ?? []).length;
                                const r = await checkUnitCoupon(code, unitBase(item, k), codeInCart(code));
                                if (r.valid && r.code) {
                                  addUnitCoupon(item.model.id, { code: r.code, discount: r.discount ?? 0, label: r.label });
                                  return null;
                                }
                                return r.reason === 'ORDER_SCOPE' ? t.cart.couponOrderScope : t.cart.couponBad;
                              }}
                            />
                          )}
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
                      // חזרה בזמן שהסל נפתח: התשובה לא תעביר לתשלום
                      onClick={() => { abandonPayment(); setStep('cart'); }}
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
                      {/* שני האפשרויות מקבלות הסבר, כך שגם "משלוח עד הבית" לא
                          מבטיח יותר ממה שכתוב בשאר האתר (לרוב אזורי הארץ). */}
                      <p style={{ margin: '8px 0 0', fontFamily: "'Heebo', sans-serif", fontSize: '12px',
                                  color: '#6A6862', lineHeight: 1.6 }}>
                        {delivery === 'pickup' ? t.cart.pickupNote : t.cart.shipNote}
                      </p>
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
                          // caret and separators don't jump inside an RTL form.
                          // שם וכתובת היו קבועים ל-rtl, ולכן בטופס האנגלי יושרו
                          // לימין ו-"1 Test St" הוצג כ-"Test St 1". ריק: כיוון
                          // השפה (כדי שה-placeholder יתיישר נכון). עם טקסט: auto,
                          // כך שכתובת בעברית באתר האנגלי, או באנגלית באתר העברי,
                          // מוצגת לפי האות הראשונה שלה.
                          dir={type === 'email' || type === 'tel' ? 'ltr' : form[key as keyof typeof form].trim() ? 'auto' : dir}
                          placeholder={placeholder}
                          value={form[key as keyof typeof form]}
                          onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setFormErrors(f => ({ ...f, [key]: false })); }}
                          style={{
                            width: '100%', padding: '11px 14px',
                            backgroundColor: SUBTLE,
                            border: `1px solid ${formErrors[key] ? ERROR_TEXT : BORDER}`,
                            borderRadius: '8px', color: TEXT,
                            fontFamily: "'Heebo', sans-serif", fontSize: '14px',
                            outline: 'none',
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
                        border: `1px solid ${draftCheck && draftCheck.status !== 'checking' ? ERROR_TEXT
                                  : appliedStatus === 'ok' && draftCode === appliedCode ? '#3B6B33' : BORDER}`,
                        borderRadius: '8px', overflow: 'hidden',
                      }}>
                        <input
                          id="cart-coupon"
                          type="text"
                          dir="ltr"
                          placeholder={t.cart.couponPlaceholder}
                          value={coupon}
                          onChange={e => {
                            // טיוטה בלבד: הקוד שהוחל לא משתנה עד "החל" מצליח.
                            draftSeq.current += 1;
                            setCoupon(e.target.value.toUpperCase());
                            setDraftCheck(null);
                          }}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (draftCheck?.status !== 'checking') applyDraft(); } }}
                          style={{
                            flex: 1, minWidth: 0, padding: '11px 14px',
                            backgroundColor: 'transparent', border: 'none', outline: 'none',
                            color: TEXT, fontFamily: "'Heebo', sans-serif", fontSize: '14px',
                            letterSpacing: '0.06em', direction: 'ltr', textAlign: 'left',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => { applyDraft(); }}
                          disabled={draftCheck?.status === 'checking' || !draftCode || draftCode === appliedCode}
                          style={{
                            padding: '0 18px', backgroundColor: '#EFEBE3',
                            border: 'none', borderInlineStart: `1px solid ${BORDER}`,
                            color: draftCode && draftCode !== appliedCode ? TEXT : '#B5B1AA',
                            fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700,
                            cursor: draftCode && draftCode !== appliedCode ? 'pointer' : 'default', whiteSpace: 'nowrap',
                          }}>
                          {draftCheck?.status === 'checking' ? '…' : t.cart.couponApply}
                        </button>
                      </div>
                      {draftCheck?.status === 'bad' && (
                        <p role="alert" style={{ color: ERROR_TEXT, fontSize: '11px', margin: '4px 0 0', fontFamily: "'Heebo', sans-serif" }}>
                          {draftCheck.unitScope ? t.cart.couponUnitScope : t.cart.couponBad}
                        </p>
                      )}
                      {draftCheck?.status === 'error' && (
                        <p role="alert" style={{ color: ERROR_TEXT, fontSize: '11px', margin: '4px 0 0', fontFamily: "'Heebo', sans-serif" }}>
                          {t.cart.couponCheckFailed}{' '}
                          <button type="button" onClick={() => { applyDraft(); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: ERROR_TEXT, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px', fontFamily: 'inherit', fontSize: 'inherit' }}>{t.cart.couponRetry}</button>
                        </p>
                      )}
                      {!draftCheck && draftCode && draftCode !== appliedCode && (
                        <p style={{ color: MUTED_TEXT, fontSize: '11px', margin: '4px 0 0', fontFamily: "'Heebo', sans-serif" }}>{t.cart.couponDraftPending}</p>
                      )}
                      {/* הקוד שקובע את הסכום, ומצבו מול העגלה הנוכחית */}
                      {appliedCode && (
                        <p aria-live="polite" style={{ color: appliedStatus === 'bad' || appliedStatus === 'error' ? ERROR_TEXT : '#3B6B33', fontSize: '11px', margin: '4px 0 0', fontFamily: "'Heebo', sans-serif" }}>
                          {t.cart.couponActive}: <span dir="ltr" style={{ fontWeight: 700 }}>{appliedCode}</span>{' · '}
                          {appliedStatus === 'ok' ? t.cart.couponOk
                            : appliedStatus === 'pending' ? t.cart.couponUpdating
                            : appliedStatus === 'error' ? t.cart.couponCheckFailed
                            : appliedStatus === 'bad' ? t.cart.couponInvalidForCart(appliedCode) : ''}
                          {couponLinks}
                        </p>
                      )}
                    </div>

                    {/* Summary */}
                    <div style={{ backgroundColor: SUBTLE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '14px 16px', marginTop: '8px' }}>
                      {unitDiscTotal > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#3B6B33' }}>{t.cart.unitCouponsTotal}</span>
                          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700, color: '#3B6B33' }}>−{formatPrice(unitDiscTotal)}</span>
                        </div>
                      )}
                      {appliedStatus !== 'none' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#3B6B33' }}>{t.cart.discount} · {appliedCode}</span>
                          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700, color: appliedStatus === 'bad' || appliedStatus === 'error' ? ERROR_TEXT : '#3B6B33' }}>
                            {discountRowText}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: "#6A6862" }}>{t.cart.orderTotal}</span>
                        <span aria-live="polite" style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', fontWeight: 700, color: GOLD_TEXT }}>
                          {amountPending ? pendingText : formatPrice(payable)}
                        </span>
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
                        {orderErrorContact && (
                          <>
                            {' '}
                            <a href={waLink} target="_blank" rel="noopener noreferrer"
                               style={{ color: '#A3462B', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                              {t.cart.talkToUs}
                            </a>
                          </>
                        )}
                        {alreadyPaid && (
                          <div style={{ marginTop: '10px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                            <a href={localizePath(`/order/success?s=${alreadyPaid}`, lang)}
                               style={{ color: '#A3462B', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                              {t.cart.viewPaidOrder}
                            </a>
                            {/* רכישה נוספת: רק בלחיצה מפורשת, רכישה חדשה */}
                            <button type="button" disabled={ordering}
                              onClick={async () => { await startNewPurchase(); handleCheckout(); }}
                              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#A3462B', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px', fontFamily: 'inherit', fontSize: 'inherit' }}>
                              {t.cart.newPurchase}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <button onClick={validateAndCheckout} disabled={ordering || appliedStatus === 'pending' || draftCheck?.status === 'checking'}
                      style={{ width: '100%', backgroundColor: GOLD, color: DARK, border: 'none', borderRadius: '4px', padding: '15px', fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: ordering || appliedStatus === 'pending' || draftCheck?.status === 'checking' ? 'not-allowed' : 'pointer', opacity: ordering || appliedStatus === 'pending' || draftCheck?.status === 'checking' ? 0.7 : 1 }}>
                      {ordering || appliedStatus === 'pending' || draftCheck?.status === 'checking' ? '...' : t.cart.confirm}
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
                      <a href={localizePath('/regulations', lang)} target="_blank" rel="noopener noreferrer" style={{ color: GOLD_TEXT, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                        {t.cart.agreeTerms}
                      </a>.
                    </p>
                    <PrivacyNote kind="order" />
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
                      onClick={backToDetails}
                      aria-label={t.cart.backToDetails}
                      style={backBtn}
                    >
                      <Back size={19} />
                    </button>
                    <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '17px', color: TEXT, margin: 0 }}>{t.cart.payTitle}</h3>
                  </div>

                  {/* פסק זמן: הודעה מעל המסגרת ולא עליה. אם העמוד בכל זאת עלה ורק
                      אירוע הטעינה מתעכב, הלקוח ממשיך לראות אותו ולשלם בו. */}
                  {payTimedOut && !payFrameReady && !payBlocked && (
                    <div role="alert" style={{
                      padding: '12px 20px', backgroundColor: '#FBEEE9', borderBottom: '1px solid #E0B9A6',
                      display: 'flex', flexDirection: 'column', gap: '8px',
                    }}>
                      <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#A3462B', lineHeight: 1.6, margin: 0 }}>
                        <strong>{t.cart.payLoadTimeoutTitle}.</strong> {t.cart.payLoadTimeoutBody}
                      </p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={backToDetails}
                          style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#C9A870', color: '#1C1C1C', cursor: 'pointer' }}
                        >
                          {t.cart.backToDetails}
                        </button>
                        <a
                          href={waLink} target="_blank" rel="noopener noreferrer"
                          style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '13px', padding: '7px 16px', borderRadius: '8px', border: '1px solid #1C1C1C', color: '#1C1C1C', textDecoration: 'none' }}
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                  <div style={{ flex: 1, position: 'relative', backgroundColor: SUBTLE }}>
                    {!payFrameReady && !payTimedOut && (
                      <p style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', margin: 0,
                        fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#6A6862',
                      }}>
                        {t.cart.payLoading}
                      </p>
                    )}
                    {/* allowpaymentrequest נדרש כדי ש-Google Pay יופיע בתוך המסגרת */}
                    {payForm && <iframe
                      key={payForm.frame}
                      ref={setPayFrame}
                      name={payForm.frame}
                      title={t.cart.payTitle}
                      onLoad={onPayFrameLoad}
                      allow="payment https://directng.tranzila.com"
                      // @ts-expect-error — תכונה לא סטנדרטית שטרנזילה דורשת ל-Google Pay
                      allowpaymentrequest="true"
                      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    />}
                    {payBlocked && (
                      <div role="alert" style={{
                        position: 'absolute', inset: 0, backgroundColor: SURFACE, display: 'flex',
                        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '14px', padding: '28px', textAlign: 'center',
                      }}>
                        <h4 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '17px', color: TEXT, margin: 0 }}>
                          {t.cart.payBlockedTitle}
                        </h4>
                        <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: '#4A4845', lineHeight: 1.7, margin: 0, maxWidth: '360px' }}>
                          {t.cart.payBlockedBody}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <button
                            onClick={backToDetails}
                            style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '14px', padding: '11px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#C9A870', color: '#1C1C1C', cursor: 'pointer' }}
                          >
                            {t.cart.payBlockedRetry}
                          </button>
                          <a
                            href={waLink} target="_blank" rel="noopener noreferrer"
                            style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '14px', padding: '10px 20px', borderRadius: '8px', border: '1px solid #1C1C1C', color: '#1C1C1C', textDecoration: 'none' }}
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
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
                {unitDiscTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#3B6B33' }}>{t.cart.unitCouponsTotal}</span>
                    <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, color: '#3B6B33' }}>−{formatPrice(unitDiscTotal)}</span>
                  </div>
                )}
                {appliedStatus !== 'none' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '13px', color: '#3B6B33' }}>
                      {t.cart.discount} · {appliedCode}
                    </span>
                    <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', fontWeight: 700, color: appliedStatus === 'bad' || appliedStatus === 'error' ? ERROR_TEXT : '#3B6B33', textAlign: 'end' }}>
                      {discountRowText}
                      {/* בעגלה אין שדה קוד, ולכן הניסיון החוזר וההסרה נמצאים כאן */}
                      {(appliedStatus === 'error' || appliedStatus === 'bad') && <span style={{ fontSize: '13px' }}>{couponLinks}</span>}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '14px', color: "#6A6862" }}>{t.cart.total}</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    {!amountPending && listTotal > payable && (
                      <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: MUTED_TEXT, textDecoration: 'line-through' }}>
                        {formatPrice(listTotal)}
                      </span>
                    )}
                    <span aria-live="polite" style={{ fontFamily: "'Heebo', sans-serif", fontSize: amountPending ? '15px' : '22px', fontWeight: 800, color: GOLD_TEXT }}>
                      {amountPending ? pendingText : formatPrice(payable)}
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
                {/* מוצג כבר כאן, ולא רק אחרי "לתשלום": לקוח לא צריך
                    למלא פרטים על הזמנה שהשרת ידחה. */}
                {tooManyBikes && (
                  <div role="alert" style={{
                    backgroundColor: '#FBEEE9', border: '1px solid #E0B9A6',
                    borderRadius: '8px', padding: '11px 14px', marginBottom: '12px',
                    fontFamily: "'Heebo', sans-serif", fontSize: '13px',
                    color: '#A3462B', lineHeight: 1.5,
                  }}>
                    {t.cart.errOrderTooLarge(MAX_BIKES_PER_ORDER)}{' '}
                    <a href={waLink} target="_blank" rel="noopener noreferrer"
                       style={{ color: '#A3462B', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                      {t.cart.talkToUs}
                    </a>
                  </div>
                )}
                <button
                  onClick={() => setStep('details')}
                  disabled={ordering || tooManyBikes || appliedStatus === 'pending'}
                  style={{
                    width: '100%',
                    backgroundColor: GOLD, color: DARK,
                    border: 'none', borderRadius: '4px',
                    padding: '16px',
                    fontFamily: "'Heebo', sans-serif",
                    fontSize: '14px', fontWeight: 700,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    cursor: ordering || tooManyBikes ? 'not-allowed' : 'pointer',
                    opacity: ordering || tooManyBikes ? 0.5 : 1,
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

/**
 * קודים לזוג אופניים אחד, בתוך שורת העגלה. כל קוד מוזיל זוג אחד, עד
 * כמות השורה. ההנחה המוצגת היא תצוגה; השרת מתמחר מחדש ביצירת הסל.
 */
function UnitCouponBox({ t, list, max, onApply, onRemove }: {
  t: ReturnType<typeof useT>;
  list: UnitCoupon[];
  max: number;
  onApply: (code: string) => Promise<string | null>;
  onRemove: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const apply = async () => {
    const c = code.trim().toUpperCase();
    if (!c || busy) return;
    setBusy(true); setErr(null);
    const e = await onApply(c);
    setBusy(false);
    if (e) { setErr(e); return; }
    setCode(''); setOpen(false);
  };
  return (
    <div style={{ marginTop: '6px' }}>
      {list.map((c, i) => (
        <div key={`${c.code}-${i}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                                              fontFamily: "'Heebo', sans-serif", fontSize: '12px', color: '#3B6B33', marginTop: '3px' }}>
          <span>{t.cart.unitCouponLabel} {c.code}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700 }}>−{formatPrice(c.discount)}</span>
            <button onClick={() => onRemove(c.code)} aria-label={t.cart.unitCouponRemove(c.code)}
              style={{ background: 'none', border: 'none', color: '#6E6A64', cursor: 'pointer', padding: '2px 4px', fontSize: '14px', lineHeight: 1 }}>×</button>
          </span>
        </div>
      ))}
      {list.length < max && !open && (
        <button onClick={() => setOpen(true)}
          style={{ background: 'none', border: 'none', padding: 0, marginTop: '6px', cursor: 'pointer',
                   fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: '#7E6129', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
          {t.cart.unitCouponCta(max > 1)}
        </button>
      )}
      {list.length < max && open && (
        <div style={{ marginTop: '6px' }}>
          <div style={{ display: 'flex', border: `1px solid ${err ? '#B3261E' : '#E0DCD4'}`, borderRadius: '6px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
            <input
              value={code}
              dir="ltr"
              autoFocus
              aria-label={t.cart.couponHint}
              placeholder={t.cart.couponPlaceholder}
              onChange={e => { setCode(e.target.value.toUpperCase()); setErr(null); }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }}
              style={{ flex: 1, minWidth: 0, padding: '7px 10px', border: 'none', outline: 'none', fontFamily: "'Heebo', sans-serif", fontSize: '13px', textAlign: 'left', backgroundColor: 'transparent' }}
            />
            <button onClick={apply} disabled={busy || !code.trim()}
              style={{ padding: '0 12px', border: 'none', borderInlineStart: '1px solid #E0DCD4', backgroundColor: '#F5F2EC',
                       fontFamily: "'Heebo', sans-serif", fontSize: '12px', fontWeight: 700, color: '#1C1C1C', cursor: 'pointer' }}>
              {busy ? '…' : t.cart.couponApply}
            </button>
          </div>
          {err && <p style={{ color: '#B3261E', fontSize: '11px', margin: '4px 0 0', fontFamily: "'Heebo', sans-serif" }}>{err}</p>}
        </div>
      )}
    </div>
  );
}
