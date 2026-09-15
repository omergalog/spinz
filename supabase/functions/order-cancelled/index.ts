/**
 * הודעת ביטול ללקוח.
 *
 * נקראת מהאדמין מיד אחרי ביטול מוצלח. מוגנת בבדיקת JWT של Supabase,
 * כלומר רק משתמש מחובר יכול להפעיל אותה — אין כאן סוד נוסף לנהל.
 *
 * כישלון בשליחה אינו מבטל את הביטול. הוא מוחזר כהודעה, והאדמין מציג
 * אותה, כדי שתדע לפנות ללקוח ידנית.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { sendCancellationEmail } from '../_shared/email.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });

  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
      status: s, headers: { ...corsHeaders(req), 'content-type': 'application/json' },
    });

  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  let body: { order_id?: string; lang?: string };
  try { body = await req.json(); } catch { return json({ error: 'bad_body' }, 400); }

  const id = String(body.order_id ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'bad_id' }, 400);

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: o } = await db.from('orders')
    .select('id, product_name, color, size, quantity, total_price, status, customer_name, customer_email')
    .eq('id', id).maybeSingle();

  if (!o) return json({ error: 'not_found' }, 404);
  if (o.status !== 'cancelled') return json({ error: 'not_cancelled' }, 409);
  if (!o.customer_email) return json({ ok: true, skipped: 'no_email' });

  const err = await sendCancellationEmail({
    to: o.customer_email,
    name: (o.customer_name ?? '').trim(),
    productName: o.product_name,
    color: o.color, size: o.size, quantity: o.quantity,
    total: Number(o.total_price ?? 0),
    reference: String(o.id).slice(0, 8).toUpperCase(),
    lang: body.lang === 'en' ? 'en' : 'he',
  });

  if (err) { console.error('cancel mail', err); return json({ ok: false, error: err }, 502); }
  return json({ ok: true, sent_to: o.customer_email });
});
