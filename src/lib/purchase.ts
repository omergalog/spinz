/**
 * רכישה: מזהה אחד לכל קנייה, משותף לכל הלשוניות של הדפדפן.
 *
 * בלעדיו כל לחיצה על "לתשלום" פתחה סל חדש, ולשונית ישנה או רענון
 * יכלו להתחיל ניסיון חיוב נוסף על אותה קנייה. עם הרכישה השרת יודע
 * שזו אותה קנייה: אם כבר שולמה הוא מחזיר אותה במקום לפתוח תשלום חדש,
 * וחיוב שני עליה נרשם כחריגה לטיפול.
 *
 * localStorage הוא רק אחסון. ההתכנסות בין לשוניות נעשית ב-
 * navigator.locks: לשונית שנייה שנפתחת יחד עם הראשונה ממתינה לה
 * ומקבלת את אותה רכישה. דפדפן בלי Web Locks (ישן מאוד) מקבל רכישה
 * לכל לשונית — כל אחת מוגנת לחוד, בלי התכנסות.
 */

const FUNCTIONS = 'https://ayrwfyutpbkepnyjkyop.supabase.co/functions/v1';
const KEY = 'spinz-purchase';
const LOCK = 'spinz-purchase';
/** אחרי תשלום הרכישה נשמרת שבוע, כדי שלשונית ישנה תזהה שכבר שולם. */
const PAID_TTL = 7 * 24 * 60 * 60 * 1000;

export type Purchase = {
  key: string;
  token: string;
  state: 'open' | 'paid';
  sessionId?: string;
  at: number;
};

// מצב פרטי / אחסון חסום: הרכישה חיה בזיכרון של הלשונית בלבד
let memory: Purchase | null = null;

function read(): Purchase | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return memory;
    const p = JSON.parse(raw) as Purchase;
    if (!p?.key || !p?.token) return memory;
    if (p.state === 'paid' && Date.now() - (p.at ?? 0) > PAID_TTL) return null;
    return p;
  } catch {
    return memory;
  }
}

function write(p: Purchase | null) {
  memory = p;
  try {
    if (p) localStorage.setItem(KEY, JSON.stringify(p));
    else localStorage.removeItem(KEY);
  } catch { /* אחסון חסום — נשאר בזיכרון */ }
  try { new BroadcastChannel(KEY).postMessage(p?.state ?? 'cleared'); } catch { /* לא נתמך */ }
}

async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const locks = (navigator as Navigator & { locks?: LockManager }).locks;
  if (!locks?.request) return fn();
  return locks.request(LOCK, fn) as Promise<T>;
}

async function begin(): Promise<Purchase | null> {
  try {
    const res = await fetch(`${FUNCTIONS}/purchase-begin`, { method: 'POST' });
    if (!res.ok) return null;
    const b = await res.json();
    if (!b?.key || !b?.token) return null;
    return { key: b.key, token: b.token, state: 'open', at: Date.now() };
  } catch {
    return null;
  }
}

/**
 * הרכישה הנוכחית, או חדשה אם אין. רכישה ששולמה מוחזרת כמו שהיא —
 * השרת יענה עליה ALREADY_PAID, ורכישה חדשה נפתחת רק ב-startNewPurchase.
 * null אם השרת לא זמין: הקופה ממשיכה בלי רכישה, כמו קודם.
 */
export function ensurePurchase(): Promise<Purchase | null> {
  return withLock(async () => {
    const cur = read();
    if (cur) return cur;
    const p = await begin();
    if (p) write(p);
    return p;
  });
}

/** רכישה נוספת, בבחירה מפורשת של הלקוח. */
export function startNewPurchase(): Promise<Purchase | null> {
  return withLock(async () => {
    const p = await begin();
    write(p);
    return p;
  });
}

/** השרת דחה את הרכישה (לא קיימת / סוד לא תואם). */
export function dropPurchase(key: string) {
  void withLock(async () => {
    if (read()?.key === key) write(null);
  });
}

export function markPurchasePaid(sessionId: string) {
  void withLock(async () => {
    const cur = read();
    if (cur && cur.state !== 'paid') write({ ...cur, state: 'paid', sessionId, at: Date.now() });
  });
}

/** סוד הבעלות, לשאלת סטטוס עם פרטים. בלעדיו השרת מחזיר מצב בלבד. */
export function purchaseToken(): string | null {
  return read()?.token ?? null;
}

export function onPurchaseChange(cb: (state: string) => void): () => void {
  try {
    const ch = new BroadcastChannel(KEY);
    ch.onmessage = e => cb(String(e.data));
    return () => ch.close();
  } catch {
    return () => {};
  }
}
