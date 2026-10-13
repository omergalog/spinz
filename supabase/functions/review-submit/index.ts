/**
 * קליטת המלצה מהאתר.
 *
 * הטפסים כתבו ישירות לטבלת reviews עם המפתח הציבורי. המודרציה מנעה
 * פרסום בלי אישור, אבל לא את הכתיבה עצמה: כל אחד יכול היה לשפוך
 * לתור האישור שורות ללא הגבלה ובכל אורך. הכתיבה עוברת כעת דרך כאן,
 * עם מכסה לכתובת, תקרה יומית כוללת וגבולות אורך, והטבלה עצמה נסגרת
 * לכתיבה אנונימית.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { clientIp } from '../_shared/client.ts';

const MAX = { name: 80, city: 60, quote: 1200 };
// רווחים ותווי בקרה מצטמצמים לרווח אחד בשדות של שורה אחת.
const line = (v: unknown, n: number) =>
  String(v ?? '').replace(/[\u0000-\u001f\u007f\s]+/g, ' ').trim().slice(0, n);
// בגוף ההמלצה שבירות שורה נשמרות, אבל לא יותר משתיים ברצף.
const text = (v: unknown, n: number) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim().slice(0, n);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });

  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
      status: s, headers: { ...corsHeaders(req), 'content-type': 'application/json' },
    });

  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  // גוף ענק נדחה לפני שקוראים אותו. טופס אמיתי לא מתקרב לזה.
  if (Number(req.headers.get('content-length') ?? 0) > 8000) return json({ error: 'too_large' }, 413);

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 8000) return json({ error: 'too_large' }, 413);
    body = JSON.parse(raw);
  } catch { return json({ error: 'bad_body' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'bad_body' }, 400);

  const name  = line(body.name, MAX.name);
  const city  = line(body.city, MAX.city);
  const quote = text(body.quote, MAX.quote);
  const stars = Number(body.stars);

  if (!name || !quote) return json({ error: 'empty' }, 400);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return json({ error: 'bad_stars' }, 400);

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // שלוש מכסות: קצרה לכתובת, יומית לכתובת, ויומית לכל האתר. האחרונה
  // היא מה שעוצר מי שמחליף כתובות — בלעדיה המכסה לכתובת לבדה לא
  // מגבילה אותו בכלל.
  // מי שנחסם מקבל את אותה תשובה כמו מי שנקלט. אין סיבה ללמד בוט
  // מתי הוא הגיע לתקרה.
  const ip = clientIp(req) || 'unknown';
  const take = async (bucket: string, client: string, limit: number, window: string) => {
    const { data, error } = await db.rpc('take_rate_token', {
      p_bucket: bucket, p_client: client, p_limit: limit, p_window: window,
    });
    if (error) { console.error('rate', bucket, error.message); return false; }
    return data !== false;
  };
  if (!(await take('review', ip, 3, '10 minutes'))) return json({ ok: true });
  if (!(await take('review-day', ip, 8, '1 day')))  return json({ ok: true });
  if (!(await take('review-all', 'all', 80, '1 day'))) {
    console.error('review-submit: daily site-wide ceiling reached');
    return json({ ok: true });
  }

  // approved נכתב כאן במפורש ולא נלקח מהבקשה: המלצה נכנסת תמיד לתור
  // האישור, לא משנה מה נשלח.
  const { error } = await db.from('reviews').insert({
    name, city: city || '', quote, stars, approved: false,
  });
  if (error) { console.error('review insert', error.message); return json({ error: 'server' }, 500); }

  return json({ ok: true });
});
