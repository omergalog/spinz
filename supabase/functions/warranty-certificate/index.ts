/**
 * תעודת אחריות ללקוח, כשההזמנה מסומנת "נמסר" באדמין.
 *
 * נפרסת עם --no-verify-jwt כמו שאר הפונקציות; הבדיקה היא isAdminCaller,
 * לפני כל קריאה של פרטי לקוח.
 *
 * - המצב נקרא מחדש מהמסד: שולחים רק אם ההזמנה באמת "delivered".
 * - delivered_at נקבע בפעם הראשונה בלבד, וממנו נספרת האחריות.
 * - פעם אחת להזמנה: warranty_sent_at "נתפס" בעדכון מותנה לפני השליחה,
 *   כך שלחיצה כפולה או שינוי סטטוס הלוך-חזור לא שולחים מייל שני.
 *   אם השליחה נכשלה, התפיסה משוחררת וניתן לנסות שוב.
 * - חולצות (merch-*) לא מקבלות תעודה: האחריות היא על האופניים.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { sendWarrantyEmail } from '../_shared/email.ts';
import { isAdminCaller } from '../_shared/admin-auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });

  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
      status: s, headers: { ...corsHeaders(req), 'content-type': 'application/json' },
    });

  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (!(await isAdminCaller(req))) return json({ error: 'unauthorized' }, 401);

  let body: { order_id?: string };
  try { body = await req.json(); } catch { return json({ error: 'bad_body' }, 400); }
  const id = String(body.order_id ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'bad_id' }, 400);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: o } = await db.from('orders')
    .select('id, product_name, product_slug, size, color, status, customer_name, customer_email, delivered_at, warranty_sent_at')
    .eq('id', id).maybeSingle();
  if (!o) return json({ error: 'not_found' }, 404);
  if (o.status !== 'delivered') return json({ error: 'not_delivered' }, 409);
  if (String(o.product_slug ?? '').startsWith('merch-')) return json({ ok: true, skipped: 'merch' });

  // מועד המסירה: רק בפעם הראשונה. סימון חוזר לא מזיז את תחילת האחריות.
  let deliveredAt = o.delivered_at ? new Date(o.delivered_at) : null;
  if (!deliveredAt) {
    const now = new Date().toISOString();
    await db.from('orders').update({ delivered_at: now }).eq('id', id).is('delivered_at', null);
    const { data: d } = await db.from('orders').select('delivered_at').eq('id', id).single();
    deliveredAt = new Date(d!.delivered_at);
  }

  // השלדות שנרשמו בסדנה עוברות ל"נשלח" עם תאריך המסירה. כך מסך היחידות
  // מראה מה כבר אצל לקוחות, ולא רק מה שויך.
  await db.from('units').update({ status: 'shipped', shipped_at: deliveredAt.toISOString() })
    .eq('order_id', id).eq('status', 'allocated');

  if (o.warranty_sent_at) return json({ ok: true, already: true, delivered_at: deliveredAt.toISOString() });
  if (!o.customer_email) return json({ ok: true, skipped: 'no_email', delivered_at: deliveredAt.toISOString() });

  // תפיסה לפני שליחה: רק קריאה אחת תצליח לעדכן שורה שעוד ריקה.
  const { data: claimed } = await db.from('orders')
    .update({ warranty_sent_at: new Date().toISOString() })
    .eq('id', id).is('warranty_sent_at', null).select('id');
  if (!claimed || claimed.length === 0) return json({ ok: true, already: true });

  const [{ data: units }, { data: sess }] = await Promise.all([
    // מספרי השלדה שנרשמו בסדנה (או שויכו במסך היחידות). הזמנה של שתי
    // יחידות מקבלת תעודה אחת עם שני המספרים.
    db.from('units').select('frame_number').eq('order_id', id).order('frame_number'),
    db.from('checkout_sessions').select('id, lang').contains('order_ids', [id]).limit(1).maybeSingle(),
  ]);

  const err = await sendWarrantyEmail({
    to: o.customer_email,
    name: o.customer_name ?? '',
    productName: o.product_name,
    size: o.size,
    color: o.color,
    frameNumber: (units ?? []).map(u => u.frame_number).join(', ') || null,
    // אותו מספר אסמכתה שהלקוח קיבל במייל אישור ההזמנה.
    reference: String(sess?.id ?? o.id).slice(0, 8).toUpperCase(),
    deliveredAt,
    lang: sess?.lang === 'en' ? 'en' : 'he',
  });

  if (err) {
    await db.from('orders').update({ warranty_sent_at: null }).eq('id', id);
    console.error('warranty mail', err);
    return json({ ok: false, error: err }, 502);
  }
  return json({ ok: true, sent_to: o.customer_email, delivered_at: deliveredAt.toISOString() });
});
