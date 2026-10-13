/**
 * קליטת הודעת ביטול עסקה מהאתר.
 *
 * הטופס קרא ישירות לפונקציה request_cancellation עם המפתח הציבורי, בלי
 * מכסה ובלי גבולות אורך: אי אפשר היה לזייף דרכה סכום או מספר עסקה,
 * אבל אפשר היה להציף את עמוד הביטולים באדמין. הקריאה עוברת כעת דרך
 * כאן, וההרשאה הישירה לפונקציה נסגרת.
 *
 * זו זכות חוקית של הלקוח, ולכן שני כללים שלא חלים על שאר הטפסים:
 *  - מי שנחסם או נכשל מקבל שגיאה אמיתית ולא "נקלט". לקוח שחושב
 *    שהודעת הביטול שלו נרשמה כשהיא לא נרשמה — זה הנזק הגרוע ביותר כאן.
 *  - אם הרישום בטבלת הביטולים נכשל, ההודעה נשמרת כפנייה. היא לא הולכת
 *    לאיבוד בגלל תקלה בצד שלנו.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { clientIp } from '../_shared/client.ts';

const MAX = { name: 120, phone: 40, email: 160, reference: 40, reason: 120, details: 2000 };
const line = (v: unknown, n: number) =>
  String(v ?? '').replace(/[\u0000-\u001f\u007f\s]+/g, ' ').trim().slice(0, n);
const text = (v: unknown, n: number) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim().slice(0, n);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });

  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
      status: s, headers: { ...corsHeaders(req), 'content-type': 'application/json' },
    });

  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (Number(req.headers.get('content-length') ?? 0) > 12000) return json({ error: 'too_large' }, 413);

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 12000) return json({ error: 'too_large' }, 413);
    body = JSON.parse(raw);
  } catch { return json({ error: 'bad_body' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'bad_body' }, 400);

  const name      = line(body.name, MAX.name);
  const phone     = line(body.phone, MAX.phone);
  const email     = line(body.email, MAX.email);
  const reference = line(body.reference, MAX.reference);
  const reason    = line(body.reason, MAX.reason);
  const details   = text(body.details, MAX.details);

  if (!name)  return json({ error: 'missing_name' }, 400);
  if (phone.replace(/\D/g, '').length < 7) return json({ error: 'bad_phone' }, 400);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'bad_email' }, 400);

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // המכסות רחבות בכוונה: אדם אחד לא מגיש חמש הודעות ביטול בעשר דקות.
  // תקלה במונה עצמו לא חוסמת — עדיף לקלוט מאשר לדחות הודעת ביטול.
  const ip = clientIp(req) || 'unknown';
  const take = async (bucket: string, client: string, limit: number, window: string) => {
    const { data, error } = await db.rpc('take_rate_token', {
      p_bucket: bucket, p_client: client, p_limit: limit, p_window: window,
    });
    if (error) { console.error('rate', bucket, error.message); return true; }
    return data !== false;
  };
  if (!(await take('cancel', ip, 5, '10 minutes'))
   || !(await take('cancel-day', ip, 15, '1 day'))
   || !(await take('cancel-all', 'all', 300, '1 day'))) {
    console.error('cancel-submit: rate limited', ip);
    return json({ error: 'rate' }, 429);
  }

  const { data, error } = await db.rpc('request_cancellation', {
    p_name: name, p_phone: phone, p_email: email || null,
    p_reference: reference || null, p_reason: reason || null, p_details: details || null,
  });
  if (!error) return json({ ok: true, linked: !!(data as { linked?: boolean } | null)?.linked });

  console.error('request_cancellation', error.message);
  const { error: e2 } = await db.from('leads').insert({
    name: `[ביטול עסקה] ${name}`.slice(0, 120), phone, email: email || null,
    message: [reference && `אסמכתה: ${reference}`, reason && `סיבה: ${reason}`, details]
      .filter(Boolean).join('\n').slice(0, 1200) || null,
  });
  if (e2) { console.error('cancel fallback', e2.message); return json({ error: 'server' }, 500); }

  return json({ ok: true, linked: false });
});
