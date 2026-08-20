/**
 * מצב סל תשלום, לעמוד התודה.
 *
 * הלקוח חוזר מעמוד התשלום לפני שהודעת ה-notify בהכרח הספיקה להיקלט,
 * ולכן העמוד מחכה כאן עד שהמצב מתייצב. מזהה הסל הוא UUID אקראי ואינו
 * ניתן לניחוש, ומוחזר ממנו רק מה שהלקוח כבר יודע.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SITE = Deno.env.get('SITE_URL') ?? 'https://spinzbikes.com';
const CORS = {
  'Access-Control-Allow-Origin': SITE,
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Vary': 'Origin',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const id = new URL(req.url).searchParams.get('s') ?? '';
  const reply = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
      status: s,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  if (!/^[0-9a-f-]{36}$/i.test(id)) return reply({ error: 'bad_id' }, 400);

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data } = await db.from('checkout_sessions')
    .select('status, total_price, card_last4, order_ids, customer_email')
    .eq('id', id).maybeSingle();

  if (!data) return reply({ error: 'not_found' }, 404);

  return reply({
    status: data.status,
    total: data.total_price,
    last4: data.card_last4,
    email: data.customer_email,
    orders: (data.order_ids ?? []).length,
  });
});
