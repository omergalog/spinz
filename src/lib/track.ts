/**
 * מעקב תנועה ושיוך למקור (קישורי יוצרים, ערוצים שלנו ו-UTM).
 *
 * פועל רק אצל מי שאישר עוגיות מדידה (consent.ts). בלי אישור לא נשלח שום
 * אירוע ולא נשמר שום מזהה. כניסה מקישור מתויג נזכרת בזיכרון של העמוד
 * בלבד, ונשמרת רק אם האישור ניתן באותו ביקור.
 *
 * כללי השיוך (המקור הסופי הוא השרת, ב-_shared/attribution.ts):
 * - כניסה עם ref או utm_source מחליפה את השיוך ומתחילה את השעון מחדש.
 * - כניסה בלי תיוג לא נוגעת בשיוך שנשמר.
 * - בתשלום נשלחת הכניסה המתויגת האחרונה, והשרת בודק שהיא בתוך החלון.
 *
 * האירועים נאספים ונשלחים במנות. כל כשל נבלע: המעקב אף פעם לא חוסם,
 * מעכב או מכשיל ניווט, הוספה לסל או תשלום.
 */
import { SUPABASE_URL } from './supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/track`;
const K = { vid: 'spinz-a-vid', ses: 'spinz-a-ses', attr: 'spinz-a-attr', test: 'spinz-a-test', stop: 'spinz-a-stop' };
export const TRACK_STORAGE_KEYS = Object.values(K);

const SESSION_GAP_MS = 30 * 60_000;
const FLUSH_MS = 15_000;
const MAX_EVENTS_PER_PAGE = 300;
const CODE = /^[a-z0-9][a-z0-9-]{0,39}$/;
const WORD = /^[\w.-]{1,80}$/;

type Entry = { ref: string | null; us: string | null; um: string | null; uc: string | null; at: number };
type Ev = Record<string, unknown> & { type: string };

let enabled = false;
let pendingEntry: Entry | null = null;   // כניסה מתויגת לפני אישור: בזיכרון בלבד
let pendingTest = false;
let referrerHost: string | null = null;
let landingPath = '/';
let queue: Ev[] = [];
let sentThisPage = 0;
let timer: ReturnType<typeof setInterval> | null = null;
let lastPath: string | null = null;
let stopped = false;

const ls = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* אחסון חסום */ } },
  del(k: string) { try { localStorage.removeItem(k); } catch { /* אחסון חסום */ } },
};
const uuid = () => (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
const device = () => (window.matchMedia?.('(max-width: 767px)').matches ? 'mobile' : 'desktop');
const today = () => new Date().toISOString().slice(0, 10);

function readEntryFromUrl(): Entry | null {
  const q = new URLSearchParams(window.location.search);
  const ref = (q.get('ref') ?? '').toLowerCase();
  const us = (q.get('utm_source') ?? '').toLowerCase();
  const pick = (v: string | null) => (v && WORD.test(v) ? v : null);
  const e: Entry = { ref: CODE.test(ref) ? ref : null, us: WORD.test(us) ? us : null,
    um: pick(q.get('utm_medium')), uc: pick(q.get('utm_campaign')), at: Date.now() };
  return e.ref || e.us ? e : null;
}

function isTest(): boolean {
  if (/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) return true;
  return pendingTest || ls.get(K.test) === '1';
}

/** קורא את הכתובת. נקרא פעם אחת, לפני שער הסיסמה, כדי לא לאבד את ref. */
export function captureEntry() {
  try {
    pendingEntry = readEntryFromUrl();
    const q = new URLSearchParams(window.location.search).get('spinz_test');
    if (q === '1') pendingTest = true;
    if (q === '0') { pendingTest = false; ls.del(K.test); }
    try {
      const r = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : '';
      referrerHost = r && r !== window.location.hostname ? r.slice(0, 100) : null;
    } catch { referrerHost = null; }
    landingPath = window.location.pathname;
  } catch { /* לא חוסם טעינה */ }
}

/** מופעל אחרי אישור עוגיות (גם באותו ביקור). */
export function startTracking() {
  if (enabled) return;
  try {
    if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return;
    if (ls.get(K.stop) === today()) return;
    enabled = true;
    if (pendingTest) ls.set(K.test, '1');
    if (!ls.get(K.vid)) ls.set(K.vid, uuid());
    if (pendingEntry) ls.set(K.attr, JSON.stringify(pendingEntry));
    ensureSession(!!pendingEntry);
    pendingEntry = null;
    timer = setInterval(() => flush(false), FLUSH_MS);
    addEventListener('pagehide', () => flush(true));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(true); });
    if (lastPath) pageView(lastPath, true);
    window.dispatchEvent(new Event(TRACKING_STARTED_EVENT));
  } catch { enabled = false; }
}

/** דחייה אחרי אישור: מפסיקים ומוחקים את מה שנשמר. */
export function stopTracking() {
  enabled = false;
  queue = [];
  if (timer) clearInterval(timer);
  for (const k of TRACK_STORAGE_KEYS) ls.del(k);
}

function ensureSession(newEntry: boolean): string {
  const now = Date.now();
  let s: { id: string; last: number } | null = null;
  try { s = JSON.parse(ls.get(K.ses) ?? 'null'); } catch { s = null; }
  if (!s || newEntry || now - s.last > SESSION_GAP_MS) {
    s = { id: uuid(), last: now };
    ls.set(K.ses, JSON.stringify(s));
    const a = currentAttr();
    push({
      type: 'session_start', path: landingPath,
      ...(newEntry && a ? { ref: a.ref, us: a.us, um: a.um, uc: a.uc } : {}),
      rh: referrerHost,
    }, s.id);
  } else {
    s.last = now;
    ls.set(K.ses, JSON.stringify(s));
  }
  return s.id;
}

function currentAttr(): Entry | null {
  try { return JSON.parse(ls.get(K.attr) ?? 'null'); } catch { return null; }
}

function push(e: Ev, sid?: string) {
  if (!enabled || stopped || sentThisPage >= MAX_EVENTS_PER_PAGE) return;
  sentThisPage++;
  const session = sid ?? ensureSession(false);
  queue.push({ ...e, vid: ls.get(K.vid), sid: session, dev: device(), ...(isTest() ? { test: true } : {}) });
  if (queue.length >= 40) flush(false);
}

function flush(unloading: boolean) {
  if (!queue.length || stopped) return;
  const body = JSON.stringify({ e: queue.splice(0, 50) });
  try {
    if (unloading && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain' }));
      return;
    }
    fetch(ENDPOINT, { method: 'POST', body, keepalive: true, headers: { 'content-type': 'text/plain' } })
      .then(r => { if (r.status === 429) { stopped = true; queue = []; ls.set(K.stop, today()); } })
      .catch(() => { /* מעקב בלבד */ });
  } catch { /* מעקב בלבד */ }
}

function pageView(path: string, force = false) {
  if (!force && path === lastPath) return;
  lastPath = path;
  push({ type: 'page_view', path });
}

/** מעבר בנתב (כולל הטעינה הראשונה). */
export function trackPage(path: string) {
  try { if (enabled) pageView(path); else lastPath = path; } catch { /* מעקב בלבד */ }
}

/** מחזיר true אם האירוע נרשם (כלומר המעקב פעיל). רכיב שמסמן "כבר נספר" נשען על זה. */
export function trackProductView(slug: string, value?: number): boolean {
  try { if (!enabled) return false; push({ type: 'product_view', product: slug, path: window.location.pathname, value }); return true; } catch { return false; }
}

/** רכיבים שמודדים צפייה (מוצר על המסך) נרשמים כאן, כדי לספור גם אחרי שהאישור ניתן כשהמוצר כבר מוצג. */
export const TRACKING_STARTED_EVENT = 'spinz-tracking-started';
export function trackAddToCart(slug: string, value?: number) {
  try { push({ type: 'add_to_cart', product: slug, path: window.location.pathname, value }); } catch { /* */ }
}
/** לפני פתיחת התשלום. נשלח מיד, ברקע. */
export function trackBeginCheckout(value?: number) {
  try { push({ type: 'begin_checkout', path: window.location.pathname, value }); flush(false); } catch { /* */ }
}

/**
 * מה נשלח עם פתיחת התשלום. בלי אישור: כלום. השרת מאמת, בודק את החלון
 * ושומר תמונת מצב על הסל.
 */
export function attributionForCheckout(): Record<string, unknown> | undefined {
  try {
    if (!enabled) return undefined;
    const a = currentAttr();
    let sid: string | null = null;
    try { sid = JSON.parse(ls.get(K.ses) ?? 'null')?.id ?? null; } catch { sid = null; }
    return { ...(a ? { ref: a.ref, us: a.us, um: a.um, uc: a.uc, at: a.at } : {}),
      vid: ls.get(K.vid), sid, ...(isTest() ? { test: true } : {}) };
  } catch { return undefined; }
}
