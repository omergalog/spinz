/**
 * קליטת פנייה מהאתר.
 *
 * הטפסים כתבו ישירות לטבלת leads עם המפתח הציבורי, ולכן כל אחד יכול
 * היה לשפוך אליה שורות ללא הגבלה — הצפה של רשימת הפניות ושל מכסת
 * בסיס הנתונים. הכתיבה עוברת כעת דרך כאן, עם מכסה לכתובת ועם גבולות
 * אורך, והטבלה עצמה נסגרת לכתיבה אנונימית.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const MAX = { name: 120, email: 160, phone: 40 };
const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });

  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
      status: s, headers: { ...corsHeaders(req), 'content-type': 'application/json' },
    });

  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'bad_body' }, 400); }

  const name  = clip(body.name, MAX.name);
  const email = clip(body.email, MAX.email);
  const phone = clip(body.phone, MAX.phone);

  if (!name && !email && !phone) return json({ error: 'empty' }, 400);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'bad_email' }, 400);

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  if (ip) {
    const { data: allowed } = await db.rpc('take_rate_token', {
      p_bucket: 'lead', p_client: ip, p_limit: 6,
    });
    // מי שנחסם מקבל את אותה תשובה כמו מי שנקלט. אין סיבה ללמד בוט
    // מתי הוא הגיע לתקרה.
    if (allowed === false) return json({ ok: true });
  }

  const { error } = await db.from('leads').insert({
    name: name || null, email: email || null, phone: phone || null,
  });
  if (error) { console.error('lead insert', error.message); return json({ error: 'server' }, 500); }

  return json({ ok: true });
});
