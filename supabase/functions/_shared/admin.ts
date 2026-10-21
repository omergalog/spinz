/**
 * האם הקורא הוא מנהל. לפונקציות שהאדמין קורא להן ושולחות מייל ללקוח.
 *
 * הפונקציות האלה רצות עם מפתח השירות (עוקף RLS), ולכן הבדיקה חייבת
 * להיות כאן: עד עכשיו כל מי שהכיר מזהה הזמנה יכול היה לשלוח ללקוח מייל
 * ביטול או "מוכן", ולקבל בתשובה את כתובת המייל שלו.
 *
 * הבדיקה רצה עם ה-JWT של הקורא: is_admin() (PROPOSAL-admin-roles.sql).
 * לפני שההצעה הוחלה (אין is_admin), כמו בשאר האדמין היום: כל משתמש מחובר.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

export async function callerIsAdmin(req: Request, roles: string[] = ['owner']): Promise<boolean> {
  const auth = req.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return false;
  const c = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data, error } = await c.rpc('is_admin', { p_roles: roles });
  if (!error) return data === true;
  if (error.code === 'PGRST202' || error.code === '42883') {
    const { data: u } = await c.auth.getUser();
    return !!u?.user;
  }
  console.error('callerIsAdmin', error.message);
  return false;
}
