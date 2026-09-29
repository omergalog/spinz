/**
 * "האופניים שלך מוכנים" ללקוח.
 *
 * נקראת ממסך הסדנה מיד אחרי שחרור מוצלח. מוגנת בבדיקת JWT, כלומר
 * רק משתמש מחובר יכול להפעיל אותה.
 *
 * היא שולחת רק כשהתיק באמת במצב ready — הבקשה אינה נסמכת על מה
 * שהדפדפן טוען, אלא קוראת את המצב מחדש. ורק פעם אחת ליחידה, כדי
 * שריענון או לחיצה כפולה לא ישלחו ללקוח שני מיילים.
 *
 * כישלון בשליחה אינו מבטל את השחרור. הוא מוחזר כהודעה.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { sendReadyEmail } from '../_shared/email.ts';

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
    .select('id, product_name, size, status, customer_name, customer_email')
    .eq('id', id).maybeSingle();
  if (!o) return json({ error: 'not_found' }, 404);
  if (o.status === 'cancelled') return json({ error: 'cancelled' }, 409);

  const { data: rec } = await db.from('build_records')
    .select('id, stage, assembler_id, qc_id')
    .eq('order_id', id).maybeSingle();
  if (!rec) return json({ error: 'no_record' }, 404);
  if (rec.stage !== 'ready') return json({ error: 'not_ready' }, 409);

  // פעם אחת ליחידה. השחרור נרשם ביומן, וגם השליחה.
  const { data: already } = await db.from('build_events')
    .select('id').eq('record_id', rec.id).eq('type', 'ready_mail').limit(1);
  if (already && already.length > 0) return json({ ok: true, already: true });

  if (!o.customer_email) return json({ ok: true, skipped: 'no_email' });

  const [{ data: staff }, { data: checks }, { data: photos }] = await Promise.all([
    db.from('workshop_staff').select('id, name'),
    db.from('build_steps').select('step_key, result').eq('record_id', rec.id).eq('phase', 'qc'),
    db.from('build_photos').select('id').eq('record_id', rec.id),
  ]);

  const nameOf = (sid: string | null) =>
    sid ? (staff ?? []).find(s => s.id === sid)?.name ?? null : null;

  // נספרות בדיקות ייחודיות שעברו, לא כל שורה. ניסיון שנכשל ותוקן
  // הוא בדיקה אחת, לא שתיים.
  const passed = new Set((checks ?? []).filter(c => c.result === 'pass').map(c => c.step_key)).size;

  const err = await sendReadyEmail({
    to: o.customer_email,
    name: (o.customer_name ?? '').trim(),
    productName: o.product_name,
    size: o.size,
    reference: String(o.id).slice(0, 8).toUpperCase(),
    assembler: nameOf(rec.assembler_id),
    checker: nameOf(rec.qc_id),
    checksPassed: passed,
    photoCount: (photos ?? []).length,
    lang: body.lang === 'en' ? 'en' : 'he',
  });

  if (err) { console.error('ready mail', err); return json({ ok: false, error: err }, 502); }

  await db.from('build_events').insert({
    record_id: rec.id, type: 'ready_mail',
    title: 'נשלח מייל "מוכן למסירה" ללקוח', detail: o.customer_email,
  });

  return json({ ok: true, sent_to: o.customer_email, checks: passed });
});
