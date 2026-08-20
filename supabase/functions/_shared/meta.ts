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

const PIXEL_ID = Deno.env.get('META_PIXEL_ID') ?? '';
const TOKEN = Deno.env.get('META_CAPI_TOKEN') ?? '';
const TEST_CODE = Deno.env.get('META_TEST_EVENT_CODE') ?? '';

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
};

export async function sendPurchase(e: PurchaseEvent): Promise<string | null> {
  if (!PIXEL_ID || !TOKEN) return null;   // לא מוגדר — לא שגיאה

  const user: Record<string, string[]> = {};
  if (e.email) user.em = [await sha256(normEmail(e.email))];
  if (e.phone) user.ph = [await sha256(normPhone(e.phone))];

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
            user_data: user,
            custom_data: {
              currency: 'ILS',
              value: e.value,
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
