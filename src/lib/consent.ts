/**
 * הסכמה לעוגיות מדידה ופרסום.
 *
 * Google Analytics והפיקסל של מטא נטענים רק אחרי "אישור". עד עכשיו
 * Analytics נטען מ-index.html מיד בכניסה, והבאנר אמר "המשך הגלישה
 * מהווה הסכמה" — כלומר דחייה לא הייתה אפשרית, והמדידה רצה גם לפני
 * שמישהו ראה את הבאנר.
 *
 * '1' הוא הערך שהבאנר הקודם שמר בלחיצה על "מסכים". זו הסכמה שניתנה
 * בלחיצה, ולכן היא נשמרת.
 */
import { initPixel } from './pixel';

const KEY = 'spinz-cookies';
const GA_ID = 'G-Q414LWJ252';

export type Consent = 'granted' | 'denied' | null;

export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    if (v === '1' || v === 'granted') return 'granted';
    if (v === 'denied') return 'denied';
  } catch { /* דפדפן שחוסם אחסון — אין הסכמה */ }
  return null;
}

export function setConsent(v: 'granted' | 'denied') {
  const before = getConsent();
  try { localStorage.setItem(KEY, v); } catch { /* ignore */ }
  if (v === 'granted') {
    // מי שדחה ואז אישר באותו עמוד: דגל הכיבוי מהדחייה עדיין דולק, ובלי
    // לכבות אותו gtag נטען אבל לא שולח ולא כותב עוגיות עד טעינה חדשה.
    const w = window as unknown as Record<string, unknown> & { gtag?: (...a: unknown[]) => void };
    w[`ga-disable-${GA_ID}`] = false;
    w.gtag?.('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' });
    if (gaLoaded) w.gtag?.('config', GA_ID);
    loadTracking();
    return;
  }
  // gtag שכבר רץ בעמוד כותב את _ga_<ID> מחדש באירוע הבא (גם ביציאה
  // מהעמוד), ולכן קודם מכבים אותו ורק אחר כך מוחקים.
  const w = window as unknown as Record<string, unknown> & { gtag?: (...a: unknown[]) => void };
  w[`ga-disable-${GA_ID}`] = true;
  w.gtag?.('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied' });
  clearTrackingCookies();
  // סקריפט שכבר נטען לא נפרק. מי שחוזר בו מהסכמה מקבל טעינה מחדש,
  // והעמוד עולה בלי המדידה.
  if (before === 'granted') window.location.reload();
}

/**
 * מחיקת עוגיות המדידה והפרסום. בלי זה, מי שדחה אחרי שאישר נשאר עם
 * עוגיות _ga ו-_fbp בדפדפן, גם אם הסקריפטים כבר לא נטענים.
 * העוגיות נכתבות על הדומיין הראשי (.spinzbikes.com), ולכן נמחקות גם שם.
 */
function clearTrackingCookies() {
  const names = document.cookie.split(';').map(c => c.split('=')[0].trim())
    .filter(n => n === '_ga' || n.startsWith('_ga_') || n === '_gid' || n.startsWith('_gat') || n === '_fbp' || n === '_fbc');
  const host = window.location.hostname;
  const bare = host.replace(/^www\./, '');
  const domains = ['', host, `.${host}`, bare, `.${bare}`];
  for (const n of names) {
    for (const d of domains) {
      document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${d ? `; domain=${d}` : ''}`;
    }
  }
}

let gaLoaded = false;
function loadAnalytics() {
  if (gaLoaded || typeof window === 'undefined') return;
  gaLoaded = true;
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() { w.dataLayer.push(arguments); } as never;
  w.gtag('js', new Date());
  w.gtag('config', GA_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

/** טוען את המדידה — רק כשיש הסכמה. */
export function loadTracking() {
  // בכל טעינה בלי הסכמה מנקים שוב: עוגייה שנכתבה ברגע הדחייה, לפני
  // הרענון, לא תישאר.
  if (getConsent() !== 'granted') { clearTrackingCookies(); return; }
  loadAnalytics();
  initPixel();
}

/** פותח מחדש את באנר העוגיות, מהקישור "הגדרות עוגיות" בפוטר. */
export const COOKIE_SETTINGS_EVENT = 'spinz-cookie-settings';
export const openCookieSettings = () => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));

/** דף הבית מודיע כשמסך הפתיחה נגמר, כדי שהבאנר לא יופיע מעליו. */
export const LOADER_DONE_EVENT = 'spinz-loader-done';
