/**
 * פותח רכישה: מזהה + סוד בעלות, לפני הניסיון הראשון לשלם.
 *
 * הדפדפן קורא לכאן פעם אחת לכל קנייה, בתוך נעילה שמשותפת לכל
 * הלשוניות (navigator.locks), כך ששתי לשוניות שנפתחות יחד מקבלות את
 * אותה רכישה. השרת שומר רק hash של הסוד.
 *
 * המכסה נדיבה בכוונה: לקוחות רבים יכולים לגלוש מאותה כתובת (רשת
 * משרדית, סלולר), ולקוח רגיל פותח רכישה אחת. היא קיימת רק כדי
 * שבוט לא ימלא את הטבלה.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { clientIp } from '../_shared/client.ts';
import { newToken, sha256Hex } from '../_shared/purchase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
      status: s, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const ip = clientIp(req) || 'unknown';
  const { data: allowed, error: rateErr } = await db.rpc('take_rate_token', {
    p_bucket: 'purchase', p_client: ip, p_limit: 60, p_window: '10 minutes',
  });
  if (rateErr) console.error('purchase rate', rateErr.message);
  if (allowed === false) return json({ error: 'RATE_LIMIT' }, 429);

  const token = newToken();
  const { data, error } = await db.from('purchases')
    .insert({ owner_hash: await sha256Hex(token), client_ip: ip })
    .select('key').single();
  if (error || !data) {
    console.error('purchase insert', error?.message);
    return json({ error: 'SERVER' }, 500);
  }
  return json({ key: data.key, token });
});
