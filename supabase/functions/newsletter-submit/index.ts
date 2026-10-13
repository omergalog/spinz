/**
 * הרשמה לניוזלטר מהפוטר.
 *
 * הטופס כתב ישירות לטבלת newsletter עם המפתח הציבורי, ולכן כל אחד
 * יכול היה לשפוך אליה כתובות מזויפות ללא הגבלה — רשימת תפוצה שאי
 * אפשר לשלוח אליה. הכתיבה עוברת כעת דרך כאן, עם מכסה לכתובת, תקרה
 * יומית כוללת ובדיקת כפילות, והטבלה עצמה נסגרת לכתיבה אנונימית.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { clientIp } from '../_shared/client.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });

  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
      status: s, headers: { ...corsHeaders(req), 'content-type': 'application/json' },
    });

  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (Number(req.headers.get('content-length') ?? 0) > 2000) return json({ error: 'too_large' }, 413);

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 2000) return json({ error: 'too_large' }, 413);
    body = JSON.parse(raw);
  } catch { return json({ error: 'bad_body' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'bad_body' }, 400);

  // כתובת נשמרת באותיות קטנות, כדי שאותו אדם לא ייכנס פעמיים.
  const email = String(body.email ?? '').trim().toLowerCase();
  if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'bad_email' }, 400);
  }

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // מי שנחסם מקבל את אותה תשובה כמו מי שנקלט. אין סיבה ללמד בוט
  // מתי הוא הגיע לתקרה. התקרה הכוללת גבוהה בכוונה: ביום השקה
  // נרשמים הרבה אנשים אמיתיים, ועדיף לקלוט מעט זבל מלאבד אותם.
  const ip = clientIp(req) || 'unknown';
  const take = async (bucket: string, client: string, limit: number, window: string) => {
    const { data, error } = await db.rpc('take_rate_token', {
      p_bucket: bucket, p_client: client, p_limit: limit, p_window: window,
    });
    if (error) { console.error('rate', bucket, error.message); return false; }
    return data !== false;
  };
  if (!(await take('newsletter', ip, 4, '10 minutes'))) return json({ ok: true });
  if (!(await take('newsletter-day', ip, 12, '1 day'))) return json({ ok: true });
  if (!(await take('newsletter-all', 'all', 1500, '1 day'))) {
    console.error('newsletter-submit: daily site-wide ceiling reached');
    return json({ ok: true });
  }

  // כתובת שכבר רשומה: אותה תשובה, בלי שורה נוספת — וגם בלי לגלות
  // למי ששואל אם כתובת מסוימת נמצאת ברשימה.
  const { data: existing } = await db.from('newsletter')
    .select('email').eq('email', email).limit(1);
  if (existing && existing.length > 0) return json({ ok: true });

  const { error } = await db.from('newsletter').insert({ email });
  if (error && error.code !== '23505') {
    // הכתובת לא הולכת לאיבוד: נשמרת כפנייה, כמו שהטופס עשה קודם.
    console.error('newsletter insert', error.message);
    const { error: e2 } = await db.from('leads').insert({ name: 'ניוזלטר', email });
    if (e2) { console.error('newsletter fallback', e2.message); return json({ error: 'server' }, 500); }
  }

  return json({ ok: true });
});
