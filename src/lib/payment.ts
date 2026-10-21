/**
 * צד הלקוח של הסליקה.
 *
 * כאן אין מחירים ואין מפתחות. הדפדפן מבקש מהשרת לפתוח סל, מקבל בחזרה
 * טופס מוכן, ומגיש אותו לתוך ה-iframe של טרנזילה. פרטי הכרטיס נכנסים
 * בתוך ה-iframe ולעולם אינם עוברים דרך העמוד שלנו — זה מה שמשאיר את
 * החברה מחוץ לתקן PCI המחמיר.
 */
import { SUPABASE_URL, supabase } from './supabase';

const FUNCTIONS = `${SUPABASE_URL}/functions/v1`;

export type CheckoutItem = {
  color: string;
  size: string;
  quantity: number;
  colorSkuCode: string;
  /** שורת המוצר שהשרת מתמחר לפיה. אופניים ללא slug מתומחרים לפי צבע ומידה. */
  slug?: string;
  /** קודים לזוג בודד בשורה הזו, קוד לכל זוג. */
  coupons?: string[];
};

export type CheckoutSession = {
  session_id: string;
  total: number;
  action: string;
  fields: Record<string, string>;
};

export type CouponResult = {
  valid: boolean;
  total: number;
  discount: number;
  label?: string;
  /** UNIT_SCOPE: קוד של זוג בודד שהוזן בשדה של כל ההזמנה. */
  reason?: string;
};

export type UnitCouponResult = {
  valid: boolean;
  code?: string;
  label?: string | null;
  /** מחיר הזוג אחרי הקוד */
  price?: number;
  discount?: number;
  /** ORDER_SCOPE: קוד של כל ההזמנה שהוזן ליד זוג. */
  reason?: string;
};

/**
 * בדיקת קוד לזוג אופניים אחד, לתצוגה בעגלה. המחיר הסופי נקבע בשרת
 * ביצירת הסל.
 *
 * unitPrice — מחיר הזוג לפני הקוד. inCart — כמה פעמים הקוד כבר
 * הוחל בעגלה הזו, על זוגות אחרים.
 */
export async function checkUnitCoupon(
  code: string, unitPrice: number, inCart: number,
): Promise<UnitCouponResult> {
  try {
    const res = await fetch(`${FUNCTIONS}/tranzila-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, scope: 'unit', unit_price: unitPrice, in_cart: inCart }),
    });
    if (!res.ok) return { valid: false };
    return await res.json() as UnitCouponResult;
  } catch {
    return { valid: false };
  }
}

/**
 * בדיקת קוד קופון לתצוגה בעגלה.
 *
 * הכמות נשלחת יחד עם הסכום. בלעדיה השרת אינו יכול לאכוף תקרת יחידות,
 * והעגלה הציגה הנחה שהתשלום דחה.
 */
export async function checkCoupon(
  code: string, subtotal: number, quantity: number,
): Promise<CouponResult> {
  try {
    const res = await fetch(`${FUNCTIONS}/tranzila-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal, quantity }),
    });
    if (!res.ok) return { valid: false, total: subtotal, discount: 0 };
    return await res.json() as CouponResult;
  } catch {
    return { valid: false, total: subtotal, discount: 0 };
  }
}

export class CouponRejectedError extends Error {
  /** קוד של זוג שנדחה, כשהדחייה היא שלו ולא של קוד ההזמנה. */
  code: string | null;
  constructor(code: string | null = null) { super('COUPON_REJECTED'); this.code = code; }
}

export class TooManyCartsError extends Error {
  constructor() { super('TOO_MANY_OPEN_CARTS'); }
}

/** יותר זוגות אופניים ממה שאפשר להזמין באתר בהזמנה אחת. */
export class OrderTooLargeError extends Error {
  constructor() { super('ORDER_TOO_LARGE'); }
}

/** מהחיבור הזה כבר שמורים אופניים בסל פתוח אחר. */
export class HoldLimitError extends Error {
  constructor() { super('IP_HOLD_LIMIT'); }
}

export class OutOfStockError extends Error {
  constructor(public left: number) { super('OUT_OF_STOCK'); }
}

/** הרכישה הזו כבר שולמה. לא נפתח תשלום חדש. */
export class AlreadyPaidError extends Error {
  constructor(public sessionId: string) { super('ALREADY_PAID'); }
}

/** ניסיון קודם ברכישה הזו עדיין יכול להסתיים בחיוב. לא נפתח תשלום חדש. */
export class AttemptOpenError extends Error {
  constructor(public sessionId: string, public state: string) { super('PREVIOUS_ATTEMPT_OPEN'); }
}

/** השרת לא מכיר את הרכישה, או שהסוד לא תואם. פותחים רכישה חדשה. */
export class PurchaseInvalidError extends Error {
  constructor() { super('PURCHASE_INVALID'); }
}

export async function openCheckout(input: {
  items: CheckoutItem[];
  name: string;
  phone: string;
  email?: string;
  address?: string;
  coupon?: string;
  /** איסוף עצמי: השרת כותב את נוסח האיסוף בעצמו, והכתובת לא נשלחת. */
  delivery?: 'ship' | 'pickup';
  /** שפת החשבונית שטרנזילה תשלח ללקוח */
  lang?: string;
  /** הרכישה (lib/purchase.ts). בלעדיה השרת מתנהג כמו בגרסה הקודמת. */
  purchaseKey?: string;
  ownerToken?: string;
}): Promise<CheckoutSession> {
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(`${FUNCTIONS}/tranzila-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // המפתח הציבורי של Supabase, כפי שכל קריאה אחרת מהאתר שולחת
      apikey: (supabase as unknown as { supabaseKey: string }).supabaseKey,
      Authorization: `Bearer ${session?.access_token ??
        (supabase as unknown as { supabaseKey: string }).supabaseKey}`,
    },
    body: JSON.stringify(input),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (body?.error === 'OUT_OF_STOCK') throw new OutOfStockError(Number(body.left ?? 0));
    if (body?.error === 'TOO_MANY_OPEN_CARTS') throw new TooManyCartsError();
    if (body?.error === 'COUPON_REJECTED') throw new CouponRejectedError(body.code ?? null);
    if (body?.error === 'ORDER_TOO_LARGE') throw new OrderTooLargeError();
    if (body?.error === 'IP_HOLD_LIMIT') throw new HoldLimitError();
    if (body?.error === 'ALREADY_PAID') throw new AlreadyPaidError(String(body.sessionId ?? ''));
    if (body?.error === 'PREVIOUS_ATTEMPT_OPEN') throw new AttemptOpenError(String(body.sessionId ?? ''), String(body.state ?? ''));
    if (body?.error === 'PURCHASE_INVALID') throw new PurchaseInvalidError();
    throw new Error(body?.error ?? 'SERVER');
  }
  return body as CheckoutSession;
}

/**
 * מגיש את הטופס אל תוך ה-iframe.
 *
 * טרנזילה ממליצה על POST ולא על GET, ולכן זה טופס מוסתר ולא כתובת עם
 * פרמטרים: כך הנתונים אינם נשמרים בהיסטוריית הדפדפן ואינם מודלפים
 * בכותרת Referer.
 */
export function submitToIframe(s: CheckoutSession, iframeName: string) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = s.action;
  form.target = iframeName;
  form.style.display = 'none';

  for (const [name, value] of Object.entries(s.fields)) {
    if (value === '') continue;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

export type PaymentStatus =
  | 'pending' | 'paid' | 'expired' | 'failed' | 'overbooked'
  /** לא ידוע אם הניסיון יסתיים בחיוב (פג תוקף / נפתח ניסיון אחר) */
  | 'unresolved'
  /** נסגר באסמכתה שלא יחויב */
  | 'failed_final'
  /** חיוב נוסף על רכישה ששולמה — נבדק ידנית */
  | 'duplicate';

/**
 * מצב הסל. עם סוד הבעלות של הרכישה (token) השרת מחזיר גם סכום, ספרות
 * כרטיס ואופן קבלה. בלעדיו — מצב בלבד. 'rate' כשהשרת ביקש להאט.
 */
export async function fetchStatus(sessionId: string, token?: string | null): Promise<{
  status: PaymentStatus; total?: number; last4?: string; orders?: number; pickup?: boolean;
} | 'rate' | null> {
  const t = token ? `&t=${encodeURIComponent(token)}` : '';
  const res = await fetch(`${FUNCTIONS}/tranzila-status?s=${encodeURIComponent(sessionId)}${t}`);
  if (res.status === 429) return 'rate';
  if (!res.ok) return null;
  return res.json();
}

/**
 * מדווח שהדפדפן חסם מסגרת בתוך חלון התשלום (למשל מסך אימות 3DS של
 * בנק). נשלח רק שם המארח. כישלון כאן לא משנה כלום ללקוח.
 */
export function reportBlockedFrame(sessionId: string | null, blockedUri: string, directive: string) {
  let host = '', scheme = '';
  try { const u = new URL(blockedUri); host = u.hostname; scheme = u.protocol.replace(':', ''); }
  catch { host = blockedUri.replace(/[^a-z0-9.-]/gi, '').slice(0, 200); scheme = blockedUri.split(':')[0]; }
  if (!host) return;
  fetch(`${FUNCTIONS}/checkout-blocked`, {
    method: 'POST', keepalive: true,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ host, scheme, directive, session: sessionId }),
  }).catch(() => { /* דיווח בלבד */ });
}

/**
 * טוען את הסקריפט של Apple Pay.
 *
 * apple_pay=1 לבדו אינו מספיק: טרנזילה דורשת שבעמוד שמארח את המסגרת
 * ירוץ הסקריפט שלה, והוא תלוי ב-jQuery. בלעדיו כפתור Apple Pay פשוט
 * לא יופיע, בלי הודעת שגיאה.
 *
 * נטען רק כשנפתח עמוד התשלום ורק על מכשירי אפל, כדי לא לגרור jQuery
 * לכל מבקר באתר.
 */
let applePayLoading: Promise<void> | null = null;

export function loadApplePay(): Promise<void> {
  if (applePayLoading) return applePayLoading;

  // ApplePaySession קיים רק בדפדפנים שתומכים. אין טעם בשאר.
  if (typeof window === 'undefined' || !('ApplePaySession' in window)) {
    applePayLoading = Promise.resolve();
    return applePayLoading;
  }

  const add = (src: string) => new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = false;                 // הסדר חשוב — הסקריפט תלוי ב-jQuery
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`failed: ${src}`));
    document.head.appendChild(el);
  });

  applePayLoading = add('https://code.jquery.com/jquery-3.6.0.js')
    // הכתובת שבתיעוד של טרנזילה. קודם נטען עותק מנתיב אחר, שלא מופיע
    // בתיעוד — חשוד סביר לכך שחלון Apple Pay הציג סכום שאינו הנשלח.
    .then(() => add(`https://direct.tranzila.com/js/tranzilanapple_v3.js?v=${Date.now()}`))
    .then(() => {
      // noConflict כדי שה-jQuery הזה לא ידרוס משתנים גלובליים באתר
      const w = window as unknown as { jQuery?: { noConflict: (b: boolean) => unknown }; $n?: unknown };
      if (w.jQuery) w.$n = w.jQuery.noConflict(true);
    })
    .catch(err => {
      // כישלון כאן מוריד רק את Apple Pay. כרטיס אשראי ימשיך לעבוד.
      console.warn('Apple Pay script', err);
      applePayLoading = null;
    });

  return applePayLoading;
}


/**
 * שליחת פנייה מהאתר.
 *
 * עוברת דרך פונקציית שרת ולא ישירות לטבלה: הכתיבה הישירה הייתה
 * פתוחה לכל אחד, בלי מכסה ובלי גבולות אורך.
 */
export async function submitLead(
  lead: { name?: string; email?: string; phone?: string; message?: string },
) {
  const res = await fetch(`${FUNCTIONS}/lead-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error('lead_failed');
}


/**
 * שליחת המלצה מהאתר.
 *
 * כמו הפניות: דרך פונקציית שרת ולא ישירות לטבלה. ההמלצה נכנסת לתור
 * האישור באדמין, ומוצגת באתר רק אחרי שאושרה.
 */
export async function submitReview(
  review: { name: string; city?: string; quote: string; stars: number },
) {
  const res = await fetch(`${FUNCTIONS}/review-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error('review_failed');
}


/**
 * הרשמה לניוזלטר.
 *
 * כמו הפניות וההמלצות: דרך פונקציית שרת ולא ישירות לטבלה.
 */
export async function submitNewsletter(email: string) {
  const res = await fetch(`${FUNCTIONS}/newsletter-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('newsletter_failed');
}


/**
 * שליחת הודעת ביטול עסקה.
 *
 * זורק אם ההודעה לא נרשמה — כולל חסימת מכסה. הטופס חייב לדעת, כי
 * אסור להציג ללקוח "נקלט" על הודעת ביטול שלא נקלטה.
 */
export async function submitCancellation(c: {
  name: string; phone: string; email?: string;
  reference?: string; reason?: string; details?: string;
}) {
  const res = await fetch(`${FUNCTIONS}/cancel-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(c),
  });
  if (!res.ok) throw new Error('cancel_failed');
}

