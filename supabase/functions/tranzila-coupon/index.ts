/**
 * בדיקת קוד קופון לתצוגה בעגלה.
 *
 * הפונקציה בבסיס הנתונים הייתה פתוחה לכל גולש, וזה הפך אותה למכונת
 * ניחושים: אלפי בקשות בשנייה, וכל תשובה חיובית חושפת קוד הנחה עובד.
 * היא נסגרה, והבדיקה עוברת עכשיו דרך כאן — עם תקרה לפי כתובת.
 *
 * התצוגה קוראת לאותה פונקציה שמחליטה ביצירת הסל, ומקבלת את אותם
 * נתונים חוץ מזהות הלקוח. קודם היא קראה ל-apply_coupon, שרואה רק
 * סכום: קוד שהוגבל ליחידה אחת נראה תקף גם על עגלה של שלוש, והלקוח
 * גילה זאת רק כשהתשלום נדחה.
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

  let body: { code?: string; subtotal?: number; quantity?: number };
  try { body = await req.json(); } catch { return reply({ valid: false }, 400); }

  const code = String(body.code ?? '').trim();
  // הסכום מגיע מהדפדפן ומשמש לתצוגה בלבד — החיוב מתומחר בשרת. ובכל
  // זאת הוא לא מוחזר כפי שהתקבל: סכום שלילי או לא-מספרי הוחזר קודם
  // כמות שהוא, וייצר מסך שמראה מחיר שלילי.
  const raw = Number(body.subtotal);
  const subtotal = Number.isFinite(raw) ? Math.min(Math.max(Math.round(raw), 0), 1_000_000) : 0;
  if (!code || subtotal <= 0) return reply({ valid: false, total: subtotal, discount: 0 });

  // הכמות היא מה שמפריד בין קופון תקף לקופון שנותן יחידות חינם.
  // בהיעדרה מניחים יחידה אחת — ההנחה המקלה ביותר עם הצרכן, ובכל
  // מקרה החיוב נבדק שוב מול הכמות האמיתית ביצירת הסל.
  const qRaw = Number(body.quantity);
  const quantity = Number.isFinite(qRaw) ? Math.min(Math.max(Math.round(qRaw), 1), 100) : 1;

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

  const { data, error } = await db.rpc('validate_coupon', {
    p_code: code, p_subtotal: subtotal, p_quantity: quantity, p_phone: null,
  });
  if (error) return reply({ valid: false, total: subtotal, discount: 0 });

  return reply(data);
});
