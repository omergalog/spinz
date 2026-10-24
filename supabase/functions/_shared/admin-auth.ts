/**
 * בדיקת זהות לפונקציות שרק האדמין מפעיל (order-cancelled, workshop-ready).
 *
 * כל הפונקציות בפרויקט נפרסות עם --no-verify-jwt, ולכן Supabase לא בודק
 * את הפונה לפני שהקוד רץ. הבדיקה נעשית כאן: הטוקן מכותרת Authorization
 * נשלח לשרת ההתחברות (auth.getUser), שמאמת חתימה ותוקף ומחזיר את המשתמש.
 * מפתח השירות לא משמש לבדיקה, ומפתח ה-anon עצמו נדחה (אין לו משתמש).
 *
 * כל משתמש מחובר הוא מנהל: אין הרשמה עצמית (disable_signup) ואין תפקידים
 * נפרדים. אם יתווספו תפקידים, כאן צריך לבדוק גם את התפקיד.
 *
 * חובה לקרוא לפני כל קריאה של פרטי לקוח או שליחת מייל.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function isAdminCaller(req: Request): Promise<boolean> {
  const m = /^Bearer\s+(\S+)$/i.exec(req.headers.get('Authorization') ?? '');
  if (!m) return false;
  const auth = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await auth.auth.getUser(m[1]);
  if (error || !data?.user) return false;
  return data.user.role === 'authenticated' && !data.user.is_anonymous;
}
