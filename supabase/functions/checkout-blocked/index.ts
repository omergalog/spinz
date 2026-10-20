/**
 * דיווח מהקופה: הדפדפן חסם מסגרת בתוך חלון התשלום.
 *
 * מסך אימות 3DS מוגש מהדומיין של ספק האימות של הבנק, ואי אפשר לדעת
 * מראש את כולם. כשהדפדפן חוסם אחד מהם, הלקוח רואה הודעה בקופה, וכאן
 * נרשם הדומיין ב-payment_events כדי שנדע מה להוסיף. נשמר רק שם המארח:
 * בכתובת המלאה של מסך האימות עלולים להיות מזהים של העסקה.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { clientIp } from '../_shared/client.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });

  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
      status: s, headers: { ...corsHeaders(req), 'content-type': 'application/json' },
    });

  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (Number(req.headers.get('content-length') ?? 0) > 1000) return json({ error: 'too_large' }, 413);

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 1000) return json({ error: 'too_large' }, 413);
    body = JSON.parse(raw);
  } catch { return json({ error: 'bad_body' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'bad_body' }, 400);

  // רק שם מארח תקין. כל השאר נזרק.
  const host = String(body.host ?? '').trim().toLowerCase();
  if (!host || host.length > 200 || !/^[a-z0-9.-]+$/.test(host)) return json({ error: 'bad_host' }, 400);
  const scheme = String(body.scheme ?? '').slice(0, 10).replace(/[^a-z]/g, '');
  const directive = String(body.directive ?? '').slice(0, 40).replace(/[^a-z-]/g, '');
  const sessionId = UUID.test(String(body.session ?? '')) ? String(body.session) : null;

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const ip = clientIp(req) || 'unknown';
  const take = async (bucket: string, client: string, limit: number, window: string) => {
    const { data, error } = await db.rpc('take_rate_token', {
      p_bucket: bucket, p_client: client, p_limit: limit, p_window: window,
    });
    if (error) { console.error('rate', bucket, error.message); return false; }
    return data !== false;
  };
  if (!(await take('blocked-frame', ip, 5, '10 minutes'))) return json({ ok: true });
  if (!(await take('blocked-frame-all', 'all', 300, '1 day'))) return json({ ok: true });

  const row = {
    source: 'blocked_frame',
    payload: { host, scheme, directive },
    note: `הדפדפן חסם מסגרת בקופה: ${host} — להוסיף ל-frame-src אם זה ספק אימות`,
  };
  console.error('checkout-blocked', host, directive);
  let { error } = await db.from('payment_events').insert({ ...row, session_id: sessionId });
  // מזהה סל שלא קיים (מפתח זר) לא מפיל את הדיווח.
  if (error && sessionId) ({ error } = await db.from('payment_events').insert(row));
  if (error) { console.error('checkout-blocked insert', error.message); return json({ error: 'server' }, 500); }

  return json({ ok: true });
});
