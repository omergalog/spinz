/**
 * אירוע רכישה למטא, מהשרת.
 *
 * למה מהשרת ולא מהדפדפן: הפיקסל בדפדפן מפספס את הרכישות דווקא —
 * חוסמי פרסומות, הגבלות אייפון, ולקוח שסוגר את החלון מיד אחרי
 * החיוב. כאן הרכישה כבר מאומתת מול טרנזילה, ולכן האירוע נשלח על
 * עובדה ולא על תקווה.
 *
 * מטא דורשת שפרטים מזהים יישלחו מגובבים, ולכן המייל והטלפון עוברים
 * SHA-256 ולעולם לא נשלחים כפי שהם.
 */

// נקרא בכל שליחה ולא פעם אחת בטעינה: סוד שנוסף או נמחק (למשל קוד הבדיקה
// אחרי שהבדיקות נגמרו) תופס מיד, בלי לחכות לטעינה מחדש של הפונקציה.
const cfg = () => ({
  PIXEL_ID: Deno.env.get('META_PIXEL_ID') ?? '',
  TOKEN: Deno.env.get('META_CAPI_TOKEN') ?? '',
  TEST_CODE: Deno.env.get('META_TEST_EVENT_CODE') ?? '',
});

async function sha256(v: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** מטא דורשת נרמול לפני הגיבוב, אחרת ההתאמה נכשלת בשקט */
const normEmail = (e: string) => e.trim().toLowerCase();
const normPhone = (p: string) => {
  const d = p.replace(/\D/g, '');
  return d.startsWith('0') ? '972' + d.slice(1) : d;   // 050… → 97250…
};

export type PurchaseEvent = {
  eventId: string;          // זהה למזהה שהפיקסל בדפדפן שולח, כדי שלא ייספר פעמיים
  value: number;
  email?: string | null;
  phone?: string | null;
  contents?: Array<{ id: string; quantity: number }>;
  /** checkout_sessions.ad_match: קיים רק כשהלקוח אישר עוגיות. */
  match?: AdMatch | null;
};

export type AdMatch = { fbp?: string; fbc?: string; ip?: string; ua?: string; url?: string };

const str = (v: unknown, max: number, re?: RegExp) =>
  typeof v === 'string' && v.length > 0 && v.length <= max && (!re || re.test(v)) ? v : undefined;

/**
 * מה שהדפדפן שלח עם פתיחת התשלום (src/lib/pixel.ts → adMatchForCheckout),
 * מאומת, פלוס IP ו-User-Agent של הדפדפן מהבקשה עצמה. null אם הדפדפן לא
 * שלח — כלומר אין הסכמה או אין פיקסל.
 */
export function adMatchFrom(raw: unknown, ip: string, ua: string | null): AdMatch | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const m: AdMatch = {
    fbp: str(r.fbp, 200, /^fb\.\d\.\d+\.\d+$/),
    fbc: str(r.fbc, 600, /^fb\.\d\.\d+\.[\w.-]+$/),
    url: str(r.url, 500, /^https?:\/\//),
    ip: str(ip, 64),
    ua: str(ua ?? '', 500),
  };
  return Object.fromEntries(Object.entries(m).filter(([, v]) => v)) as AdMatch;
}

export async function sendPurchase(e: PurchaseEvent): Promise<string | null> {
  const { PIXEL_ID, TOKEN, TEST_CODE } = cfg();
  if (!PIXEL_ID || !TOKEN) return null;   // לא מוגדר — לא שגיאה

  // בלי הסכמה לעוגיות פרסום לא מדווחים למטא בכלל (מדיניות הפרטיות: "Meta — רק בהסכמה")
  if (!e.match) return null;

  const user: Record<string, unknown> = {};
  if (e.email) user.em = [await sha256(normEmail(e.email))];
  if (e.phone) user.ph = [await sha256(normPhone(e.phone))];
  if (e.match.fbp) user.fbp = e.match.fbp;
  if (e.match.fbc) user.fbc = e.match.fbc;
  if (e.match.ip) user.client_ip_address = e.match.ip;
  if (e.match.ua) user.client_user_agent = e.match.ua;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [{
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            event_id: e.eventId,
            action_source: 'website',
            ...(e.match.url ? { event_source_url: e.match.url } : {}),
            user_data: user,
            custom_data: {
              currency: 'ILS',
              value: e.value,
              content_type: 'product',
              content_ids: (e.contents ?? []).map(c => c.id),
              contents: e.contents ?? [],
            },
          }],
          ...(TEST_CODE ? { test_event_code: TEST_CODE } : {}),
        }),
      },
    );

    if (!res.ok) return `meta_${res.status}: ${(await res.text()).slice(0, 200)}`;
    return null;
  } catch (err) {
    return `meta_exception: ${err}`;
  }
}
