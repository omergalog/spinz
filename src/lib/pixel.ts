/**
 * פיקסל מטא ואירועי מסע הקנייה.
 *
 * הרכישה עצמה נשלחת מהשרת (`_shared/meta.ts`) ולא מכאן, כי דווקא
 * ברגע הרכישה הדפדפן הוא המקור הכי פחות אמין — חוסמי פרסומות,
 * הגבלות אייפון, ולקוח שסוגר את החלון. מה שכן נשלח מכאן הוא השלבים
 * שלפני: צפייה במוצר, הוספה לעגלה, תחילת תשלום. מטא צריכה אותם כדי
 * ללמוד למי להראות את המודעה.
 *
 * בלי מזהה פיקסל מוגדר, כל הפונקציות כאן הן פעולות ריקות.
 */
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean };
declare global { interface Window { fbq?: Fbq; _fbq?: Fbq } }

let ready = false;

export function initPixel() {
  if (ready || !PIXEL_ID || typeof window === 'undefined') return;
  ready = true;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const n: Fbq = ((...args: unknown[]) => {
    (n.queue as unknown[]).push(args);
  }) as Fbq;
  n.queue = [];
  window.fbq = window.fbq ?? n;
  window._fbq = window._fbq ?? n;

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);

  window.fbq?.('init', PIXEL_ID);
  window.fbq?.('track', 'PageView');
}

const track = (event: string, params?: Record<string, unknown>, eventId?: string) => {
  if (!PIXEL_ID) return;
  window.fbq?.('track', event, params ?? {}, eventId ? { eventID: eventId } : undefined);
};

export const pixelViewContent = (id: string, value: number) =>
  track('ViewContent', { content_ids: [id], content_type: 'product', value, currency: 'ILS' });

export const pixelAddToCart = (id: string, value: number) =>
  track('AddToCart', { content_ids: [id], content_type: 'product', value, currency: 'ILS' });

export const pixelBeginCheckout = (value: number, items: number) =>
  track('InitiateCheckout', { value, currency: 'ILS', num_items: items });

/**
 * הרכישה נשלחת גם מהשרת. מזהה האירוע זהה בשני הצדדים, ולכן מטא
 * מאחדת אותם ולא סופרת פעמיים.
 */
export const pixelPurchase = (sessionId: string, value: number) =>
  track('Purchase', { value, currency: 'ILS' }, sessionId);
