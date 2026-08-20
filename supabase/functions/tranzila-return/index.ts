/**
 * מקבל את החזרה של הלקוח מעמוד התשלום ומעביר אותו לעמוד באתר.
 *
 * למה צריך שכבה כזו: טרנזילה חוזרת ב-POST, והאתר הוא אתר סטטי על
 * Vercel שיודע להגיש רק GET. POST לכתובת רגילה באתר היה מחזיר שגיאה
 * מול הלקוח מיד אחרי שחויב. לכן החזרה נוחתת כאן, ומכאן הלקוח מופנה
 * ב-303 לעמוד רגיל.
 *
 * זו אינה נקודת האמת. ההזמנה נוצרת ב-tranzila-notify בלבד, אחרי אימות
 * מול טרנזילה. כאן רק מעבירים את הלקוח הלאה.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SITE = Deno.env.get('SITE_URL') ?? 'https://spinzbikes.com';

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const outcome = url.searchParams.get('r') === 'fail' ? 'failed' : 'success';

  let payload: Record<string, string> = {};
  try {
    const raw = await req.text();
    payload = Object.fromEntries(new URLSearchParams(raw || url.search));
  } catch { /* חזרה בלי גוף — עדיין מפנים את הלקוח */ }

  const sessionId = url.searchParams.get('s') || payload.sessionid || '';

  try {
    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    // הכתובת ציבורית וכל אחד יכול לשלוח אליה. רושמים רק כשהמזהה
    // שייך לסל אמיתי, כדי שלא יהיה כאן ערוץ להצפת הטבלה.
    const valid = /^[0-9a-f-]{36}$/i.test(sessionId) &&
      !!(await db.from('checkout_sessions').select('id').eq('id', sessionId).maybeSingle()).data;

    if (valid) {
      await db.from('payment_events').insert({
        session_id: sessionId,
        source: outcome === 'failed' ? 'fail' : 'success',
        payload,
        note: 'הלקוח חזר מעמוד התשלום',
      });
    }
  } catch (e) {
    console.error('return log', e);
  }

  const to = new URL(`${SITE}/order/${outcome}`);
  if (sessionId) to.searchParams.set('s', sessionId);

  return new Response(null, { status: 303, headers: { Location: to.toString() } });
});
