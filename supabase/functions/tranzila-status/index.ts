/**
 * מצב סל תשלום, לעמוד התודה ולקופה.
 *
 * הלקוח חוזר מעמוד התשלום לפני שהודעת ה-notify בהכרח הספיקה להיקלט,
 * ולכן העמוד מחכה כאן עד שהמצב מתייצב.
 *
 * מזהה הסל נמצא בשורת הכתובת של הדפדפן, ומשם הוא מגיע להיסטוריה
 * ועלול לדלוף בכותרת Referer. לכן בלי סוד הבעלות של הרכישה (t) מוחזר
 * רק המצב. סכום, ספרות כרטיס ואופן קבלה רק למי שמחזיק בסוד.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { clientIp } from '../_shared/client.ts';
import { isPickup } from '../_shared/delivery.ts';
import { UUID, ownsSession } from '../_shared/purchase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });

  const url = new URL(req.url);
  const id = url.searchParams.get('s') ?? '';
  const token = (url.searchParams.get('t') ?? '').slice(0, 128);
  const reply = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
      status: s,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });

  if (!UUID.test(id)) return reply({ error: 'bad_id' }, 400);

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // הקופה שואלת כל כמה שניות. המכסה לסל מכסה תשאול רגיל של חצי שעה עם
  // מרווח, והמכסה לכתובת רחבה בהרבה כדי שכמה לקוחות מאותה רשת לא
  // ייחסמו. מעבר למכסה מחזירים 429, והדפדפן מאריך את המרווח.
  const take = async (bucket: string, client: string, limit: number) => {
    const { data } = await db.rpc('take_rate_token', { p_bucket: bucket, p_client: client, p_limit: limit });
    return data !== false;
  };
  if (!(await take('status-session', id, 300))) return reply({ error: 'RATE_LIMIT' }, 429);
  const ip = clientIp(req);
  if (ip && !(await take('status-ip', ip, 3000))) return reply({ error: 'RATE_LIMIT' }, 429);

  let { data, error } = await db.from('checkout_sessions')
    .select('status, total_price, card_last4, order_ids, customer_notes, purchase_key')
    .eq('id', id).maybeSingle();

  // המסד עוד לפני מיגרציית הרכישות (אין עמודת purchase_key): אין רכישות
  // ואין סודות, ולכן ההתנהגות היא של הגרסה הקודמת — מצב ופרטים כמו קודם.
  // בלי זה, הקוד החדש מול מסד ישן היה מחזיר "לא נמצא" על הזמנה ששולמה.
  const preMigration = !!error && (error.code === '42703' || /purchase_key/.test(error.message ?? ''));
  if (preMigration) {
    ({ data, error } = await db.from('checkout_sessions')
      .select('status, total_price, card_last4, order_ids, customer_notes')
      .eq('id', id).maybeSingle());
  }
  if (error) {
    console.error('tranzila-status', error.message);
    return reply({ error: 'unavailable' }, 503);
  }

  if (!data) return reply({ error: 'not_found' }, 404);

  if (!preMigration && !(await ownsSession(db, data.purchase_key ?? null, token))) {
    return reply({ status: data.status });
  }

  return reply({
    status: data.status,
    total: data.total_price,
    last4: data.card_last4,
    orders: (data.order_ids ?? []).length,
    // רק אם זה איסוף עצמי, לא הכתובת עצמה — כדי שעמוד התודה ידבר על
    // איסוף ולא על משלוח.
    pickup: isPickup(data.customer_notes),
  });
});
