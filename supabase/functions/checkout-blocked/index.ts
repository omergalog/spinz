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
import { sendAlert } from '../_shared/alert.ts';

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
  const db0 = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // קופה שנתקעה: הלקוח שלח את הטופס בחלון של טרנזילה, ולא חזרה שום
  // תשובה (לא הצלחה, לא כשל). 13–14.11.2026: "System Error" של טרנזילה
  // וספינר אחרי 3DS. נרשם כאן כדי שנדע על כל מקרה, גם אם הלקוח לא פנה.
  if (body.kind === 'stuck') {
    const sid = UUID.test(String(body.session ?? '')) ? String(body.session) : null;
    if (!sid) return json({ error: 'bad_session' }, 400);
    const seconds = Math.max(0, Math.min(86400, Math.round(Number(body.seconds) || 0)));
    const loads = Math.max(0, Math.min(50, Math.round(Number(body.loads) || 0)));
    const how = String(body.how ?? '') === 'manual' ? 'manual' : 'auto';
    const { data: ok } = await db0.rpc('take_rate_token', {
      p_bucket: 'checkout-stuck', p_client: sid, p_limit: 3, p_window: '1 hour',
    });
    if (ok === false) return json({ ok: true });
    const { error } = await db0.from('payment_events').insert({
      session_id: sid, source: 'checkout_stuck',
      payload: { seconds, loads, how },
      note: `הקופה נתקעה: אין תשובה מטרנזילה ${seconds} שניות אחרי הטעינה האחרונה של חלון התשלום (${how === 'manual' ? 'הלקוח לחץ "התשלום נתקע?"' : 'מעבר אוטומטי לעמוד הכשל'})`,
    });
    if (error) { console.error('checkout-stuck insert', error.message); return json({ error: 'server' }, 500); }
    console.error('checkout-stuck', sid, seconds, loads, how);

    // התראה מיידית ל-info@, עם פרטי הלקוח, כדי שאפשר יהיה לחזור אליו
    // ולהציל את הרכישה. מכסה כוללת: תקלה רחבה בטרנזילה לא תציף את התיבה.
    const { data: canAlert } = await db0.rpc('take_rate_token', {
      p_bucket: 'checkout-stuck-alert', p_client: 'all', p_limit: 10, p_window: '1 hour',
    });
    if (canAlert !== false) {
      const { data: cs } = await db0.from('checkout_sessions')
        .select('customer_name, customer_phone, total_price, created_at').eq('id', sid).maybeSingle();
      const { count } = await db0.from('payment_events').select('id', { count: 'exact', head: true })
        .eq('source', 'checkout_stuck').gte('created_at', new Date(Date.now() - 3600_000).toISOString());
      const phone = String(cs?.customer_phone ?? '').replace(/\D/g, '');
      const wa = phone ? `https://wa.me/972${phone.replace(/^0/, '')}` : '—';
      const alertErr = await sendAlert(`לקוח לא הצליח לשלם: הקופה נתקעה${(count ?? 0) > 1 ? ` (${count} בשעה האחרונה)` : ''}`, [
        ['לקוח', cs?.customer_name ?? '—'],
        ['טלפון', cs?.customer_phone ?? '—'],
        ['וואטסאפ', wa],
        ['סכום', cs?.total_price != null ? `₪${cs.total_price}` : '—'],
        ['סל', sid.slice(0, 8).toUpperCase()],
        ['מה קרה', `אין תשובה מטרנזילה ${seconds} שניות אחרי הלחיצה על תשלום (${how === 'manual' ? 'הלקוח לחץ "התשלום נתקע?"' : 'מעבר אוטומטי לעמוד הכשל'})`],
        ['משמעות', (count ?? 0) > 1 ? 'כמה מקרים בשעה: ייתכן שיש תקלה בטרנזילה. לבדוק ולפנות אליהם' : 'כדאי לחזור ללקוח ולהציע Apple Pay או קישור תשלום'],
      ]);
      if (alertErr) console.error('checkout-stuck alert', alertErr);
    }
    return json({ ok: true });
  }

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
