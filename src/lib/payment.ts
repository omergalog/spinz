/**
 * צד הלקוח של הסליקה.
 *
 * כאן אין מחירים ואין מפתחות. הדפדפן מבקש מהשרת לפתוח סל, מקבל בחזרה
 * טופס מוכן, ומגיש אותו לתוך ה-iframe של טרנזילה. פרטי הכרטיס נכנסים
 * בתוך ה-iframe ולעולם אינם עוברים דרך העמוד שלנו — זה מה שמשאיר את
 * החברה מחוץ לתקן PCI המחמיר.
 */
import { supabase } from './supabase';

const FUNCTIONS = 'https://ayrwfyutpbkepnyjkyop.supabase.co/functions/v1';

export type CheckoutItem = {
  color: string;
  size: string;
  quantity: number;
  colorSkuCode: string;
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
};

/**
 * בדיקת קוד קופון לתצוגה בעגלה.
 *
 * אותה פונקציה בדיוק מחשבת גם את המחיר שנשלח לתשלום, ולכן אין מצב
 * שהעגלה מציגה סכום אחד והחיוב יוצא אחר.
 */
export async function checkCoupon(code: string, subtotal: number): Promise<CouponResult> {
  try {
    const res = await fetch(`${FUNCTIONS}/tranzila-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    if (!res.ok) return { valid: false, total: subtotal, discount: 0 };
    return await res.json() as CouponResult;
  } catch {
    return { valid: false, total: subtotal, discount: 0 };
  }
}

export class CouponRejectedError extends Error {
  constructor() { super('COUPON_REJECTED'); }
}

export class TooManyCartsError extends Error {
  constructor() { super('TOO_MANY_OPEN_CARTS'); }
}

export class OutOfStockError extends Error {
  constructor(public left: number) { super('OUT_OF_STOCK'); }
}

export async function openCheckout(input: {
  items: CheckoutItem[];
  name: string;
  phone: string;
  email?: string;
  address?: string;
  coupon?: string;
  /** שפת החשבונית שטרנזילה תשלח ללקוח */
  lang?: string;
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
    if (body?.error === 'COUPON_REJECTED') throw new CouponRejectedError();
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
  | 'pending' | 'paid' | 'expired' | 'failed' | 'overbooked';

export async function fetchStatus(sessionId: string): Promise<{
  status: PaymentStatus; total: number; last4?: string; orders: number;
} | null> {
  const res = await fetch(`${FUNCTIONS}/tranzila-status?s=${encodeURIComponent(sessionId)}`);
  if (!res.ok) return null;
  return res.json();
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
