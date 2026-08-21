/**
 * מצב סל תשלום, לעמוד התודה.
 *
 * הלקוח חוזר מעמוד התשלום לפני שהודעת ה-notify בהכרח הספיקה להיקלט,
 * ולכן העמוד מחכה כאן עד שהמצב מתייצב.
 *
 * מזהה הסל נמצא בשורת הכתובת של הדפדפן, ומשם הוא מגיע להיסטוריה
 * ועלול לדלוף בכותרת Referer. לכן לא מוחזרים ממנו פרטים אישיים —
 * רק מצב, סכום, וארבע ספרות שהלקוח ממילא ראה בעמוד התשלום.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SITE = Deno.env.get('SITE_URL') ?? 'https://spinzbikes.com';
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });

  const id = new URL(req.url).searchParams.get('s') ?? '';
  const reply = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
      status: s,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });

  if (!/^[0-9a-f-]{36}$/i.test(id)) return reply({ error: 'bad_id' }, 400);

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data } = await db.from('checkout_sessions')
    .select('status, total_price, card_last4, order_ids')
    .eq('id', id).maybeSingle();

  if (!data) return reply({ error: 'not_found' }, 404);

  return reply({
    status: data.status,
    total: data.total_price,
    last4: data.card_last4,
    orders: (data.order_ids ?? []).length,
  });
});
