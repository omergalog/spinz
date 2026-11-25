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
// מזהה הפיקסל אינו סוד (הוא מופיע בקוד של כל אתר עם פיקסל), ולכן הוא כאן
// ולא רק במשתנה סביבה ב-Vercel. VITE_META_PIXEL_ID דורס אותו (בדיקות);
// ערך ריק ('') מכבה את הפיקסל לגמרי.
const PIXEL_ID = ((import.meta.env.VITE_META_PIXEL_ID as string | undefined) ?? '2067977790583173') || undefined;

/** יש פיקסל מוגדר. הבאנר ומדיניות הפרטיות מזכירים את מטא רק אם כן. */
export const PIXEL_ENABLED = !!PIXEL_ID;

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean };
declare global { interface Window { fbq?: Fbq; _fbq?: Fbq } }

let ready = false;
/** העמוד שעליו נשלח ה-PageView האחרון, כדי לא לשלוח פעמיים על אותו עמוד. */
let lastPageView: string | null = null;
/** צפיות במוצר שכבר דווחו בעמוד הנוכחי (מתאפס במעבר עמוד). */
const viewed = new Set<string>();

/**
 * fbclid מהכתובת שבה נכנסו לאתר. נשמר בזיכרון בלבד: אם ההסכמה ניתנת רק
 * בעמוד אחר, הכתובת המקורית כבר לא קיימת, וזה מה שמאפשר לשייך את הרכישה
 * ללחיצה על המודעה. נקרא לפני כל ניווט.
 */
let landingFbclid: string | null = null;
let landingAt = 0;
try {
  const v = new URLSearchParams(window.location.search).get('fbclid');
  if (v && /^[\w-]{10,500}$/.test(v)) { landingFbclid = v; landingAt = Date.now(); }
} catch { /* לא חוסם טעינה */ }

export function initPixel() {
  if (ready || !PIXEL_ID || typeof window === 'undefined') return;
  ready = true;

  // התבנית הרשמית של מטא: עד שהסקריפט נטען הקריאות נכנסות לתור, ואחרי
  // הטעינה הוא מגדיר callMethod והקריאות עוברות אליו. בגרסה הקודמת (מאוגוסט)
  // לא היה callMethod, ולכן כל אירוע אחרי הטעינה נשאר בתור ולא נשלח
  // (התגלה 25.11 בבדיקה על האתר החי: רק ה-PageView הראשון הגיע).
  if (!window.fbq) {
    const n = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else (n.queue as unknown[]).push(args);
    } as Fbq & { callMethod?: (...a: unknown[]) => void; push?: unknown; version?: string };
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    window.fbq = n;
    window._fbq = window._fbq ?? n;
  }

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);

  window.fbq?.('init', PIXEL_ID);
  window.fbq?.('track', 'PageView');
  lastPageView = window.location.pathname;
}

/**
 * צפייה בעמוד במעבר בנתב. האתר הוא אפליקציית עמוד יחיד: בלי זה מטא
 * רואה רק את העמוד הראשון. העמוד שבו הפיקסל נטען כבר נספר ב-initPixel.
 */
export function pixelPageView(path: string) {
  if (!ready || !PIXEL_ID || path === lastPageView) return;
  lastPageView = path;
  viewed.clear();
  window.fbq?.('track', 'PageView');
}

const track = (event: string, params?: Record<string, unknown>, eventId?: string) => {
  if (!PIXEL_ID) return;
  window.fbq?.('track', event, params ?? {}, eventId ? { eventID: eventId } : undefined);
};

const money = (value?: number) =>
  typeof value === 'number' && value > 0 ? { value, currency: 'ILS' } : {};

/** פעם אחת לכל מוצר בכל עמוד (הרכיב מנסה שוב כשההסכמה ניתנת אחרי שהמוצר כבר מוצג). */
export function pixelViewContent(id: string, value?: number) {
  if (!ready || viewed.has(id)) return;
  viewed.add(id);
  track('ViewContent', { content_ids: [id], content_type: 'product', ...money(value) });
}

export const pixelAddToCart = (id: string, value?: number) =>
  track('AddToCart', { content_ids: [id], content_type: 'product', ...money(value) });

export const pixelBeginCheckout = (ids: string[], items: number) =>
  track('InitiateCheckout', { content_ids: ids, content_type: 'product', num_items: items });

const cookie = (name: string): string | null => {
  try {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  } catch { return null; }
};

/**
 * מה שנשלח לשרת עם פתיחת התשלום, כדי שאירוע הרכישה מהשרת יותאם
 * ללחיצה על המודעה. רק כשיש פיקסל והגולש אישר עוגיות — אחרת undefined,
 * והשרת לא שולח למטא כלום על הרכישה הזו.
 */
export function adMatchForCheckout(): Record<string, string> | undefined {
  if (!ready || !PIXEL_ID) return undefined;   // ready = נטען אחרי הסכמה
  const out: Record<string, string> = { url: window.location.href.slice(0, 500) };
  const fbp = cookie('_fbp');
  if (fbp) out.fbp = fbp.slice(0, 200);
  const fbc = cookie('_fbc') ?? (landingFbclid ? `fb.1.${landingAt}.${landingFbclid}` : null);
  if (fbc) out.fbc = fbc.slice(0, 600);
  return out;
}

/**
 * הרכישה נשלחת גם מהשרת. מזהה האירוע זהה בשני הצדדים, ולכן מטא
 * מאחדת אותם ולא סופרת פעמיים.
 */
export const pixelPurchase = (sessionId: string, value: number) =>
  track('Purchase', { value, currency: 'ILS' }, sessionId);
