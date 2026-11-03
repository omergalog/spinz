/**
 * קליטת אירועי מעקב מהאתר (צפיות, מוצר, סל, תחילת תשלום).
 *
 * האתר שולח מנות, לא אירוע לכל פעולה, ורק אצל מי שאישר עוגיות מדידה.
 * הרכישות לא עוברות כאן: הן נספרות מהסל ששולם, לפי אימות מול טרנזילה.
 * לכן שום כשל כאן לא נוגע בתשלום.
 *
 * מה ההגנות כאן עוצרות, ומה לא:
 * - בקשה גדולה, לא תקינה או של בוט מוכר נדחית לפני כל פנייה למסד.
 * - תקרה לכל רשת, לסשן וליום נאכפת במסד (analytics_ingest) ומגבילה כתיבות.
 * - שום דבר כאן לא מונע מבקשות להגיע לפונקציה ולהיספר במכסת ההפעלות.
 *   גם מתג הכיבוי וגם התקרה היומית לא עוצרים את הספירה. זו מגבלה ידועה.
 * - בדיקת המקור (Origin) מסננת דפדפנים מאתרים אחרים. סקריפט יכול לזייף אותה.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ALLOWED_ORIGINS, corsHeaders } from '../_shared/cors.ts';
import { clientIp } from '../_shared/client.ts';

const MAX_BYTES = 16_384;
const MAX_EVENTS = 50;
const BOT = /bot|crawl|spider|slurp|headless|phantom|lighthouse|preview|facebookexternalhit|whatsapp|curl|wget|python|httpclient|okhttp|axios|node-fetch|go-http|java\//i;

// מגבלה מקומית לכל מופע של הפונקציה. לא מספיקה לבד: מופעים רבים לא חולקים אותה.
const local = new Map<string, { t: number; n: number }>();
const LOCAL_PER_MINUTE = 30;
// דחיות מוקדמות נספרות כאן ונמסרות למסד בבקשה התקינה הבאה של אותו מופע.
// לכן הספירה חלקית: מופע שנסגר לפני בקשה תקינה מאבד את מה שצבר.
let earlyRejected = 0;

async function netHash(ip: string): Promise<string> {
  // מלח שמתחלף כל יום: אי אפשר לקשר בין ימים, והכתובת עצמה לא נשמרת.
  const day = new Date().toISOString().slice(0, 10);
  const salt = Deno.env.get('ANALYTICS_SALT') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${day}|${salt}|${ip}`));
  return [...new Uint8Array(buf)].slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const headers = { ...corsHeaders(req), 'content-type': 'application/json' };
  const out = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers });
  const reject = (reason: string, status = 204) => {
    earlyRejected++;
    return status === 204 ? new Response(null, { status, headers }) : out({ ok: false, reason }, status);
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return reject('method', 405);

  const origin = req.headers.get('origin') ?? '';
  if (!ALLOWED_ORIGINS.includes(origin)) return reject('origin');
  if (BOT.test(req.headers.get('user-agent') ?? '')) return reject('bot');

  const len = Number(req.headers.get('content-length') ?? '0');
  if (len > MAX_BYTES) return reject('size', 413);

  const ip = clientIp(req) || 'unknown';
  const now = Date.now();
  const slot = local.get(ip);
  if (slot && now - slot.t < 60_000) {
    if (++slot.n > LOCAL_PER_MINUTE) return out({ ok: false, stop: true, reason: 'rate' }, 429);
  } else {
    local.set(ip, { t: now, n: 1 });
    if (local.size > 5000) local.clear();
  }

  let text: string;
  try { text = await req.text(); } catch { return reject('body'); }
  if (text.length > MAX_BYTES) return reject('size', 413);
  let body: unknown;
  try { body = JSON.parse(text); } catch { return reject('json', 400); }
  const events = (body as { e?: unknown })?.e;
  if (!Array.isArray(events) || events.length === 0 || events.length > MAX_EVENTS) return reject('shape', 400);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const carried = earlyRejected;
  earlyRejected = 0;
  const { data, error } = await db.rpc('analytics_ingest', {
    p_net: await netHash(ip), p_events: events, p_early_rejected: carried,
  });
  if (error) {
    earlyRejected += carried;
    console.error('track ingest', error.message);
    return out({ ok: false }, 503);
  }
  const r = data as { ok: boolean; stop?: boolean; reason?: string };
  if (r?.stop) return out({ ok: false, stop: true, reason: r.reason }, 429);
  return new Response(null, { status: 204, headers });
});
