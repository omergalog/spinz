/**
 * בדיקת קוד קופון לתצוגה בעגלה.
 *
 * הפונקציה בבסיס הנתונים הייתה פתוחה לכל גולש, וזה הפך אותה למכונת
 * ניחושים: אלפי בקשות בשנייה, וכל תשובה חיובית חושפת קוד הנחה עובד.
 * היא נסגרה, והבדיקה עוברת עכשיו דרך כאן — עם תקרה לפי כתובת.
 *
 * זו תצוגה בלבד. ההחלטה האמיתית מתקבלת ביצירת הסל, שם ידועים גם
 * הלקוח וגם גודל העגלה.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });

  const reply = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
      status: s, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let body: { code?: string; subtotal?: number };
  try { body = await req.json(); } catch { return reply({ valid: false }, 400); }

  const code = String(body.code ?? '').trim();
  const subtotal = Number(body.subtotal ?? 0);
  if (!code || subtotal <= 0) return reply({ valid: false, total: subtotal, discount: 0 });

  // 20 ניסיונות לעשר דקות לכתובת. מספיק בשופע ללקוח שמקליד קוד,
  // וחונק ניחוש שיטתי.
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  const { data: allowed } = await db.rpc('take_rate_token', {
    p_bucket: 'coupon', p_client: ip, p_limit: 20,
  });

  if (allowed === false) {
    // אותה תשובה בדיוק כמו קוד שגוי. מי שמנחש לא ילמד שנחסם.
    return reply({ valid: false, total: subtotal, discount: 0 });
  }

  const { data, error } = await db.rpc('apply_coupon', { p_code: code, p_subtotal: subtotal });
  if (error) return reply({ valid: false, total: subtotal, discount: 0 });

  return reply(data);
});
