/**
 * בדיקה יומית של קצב השימוש במעקב, והתראה במייל.
 *
 * זו התראה, לא הגנה: היא לא עוצרת בקשות ולא מורידה את הספירה במכסה.
 *
 * מה נמדד: בקשות לפונקציה track שהגיעו למסד (נקלטו או נדחו בתקרה), ודיווח
 * מצטבר של דחיות מוקדמות. מה לא נמדד: הפעלות של שאר הפונקציות, ובקשות
 * שנדחו לפני שמופע הספיק לדווח. המספר המלא נמצא רק במסך Usage של Supabase.
 *
 * מופעל מ-cron עם סוד בכותרת x-watch-secret (Vault: analytics_watch_secret).
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { sendAlert } from '../_shared/alert.ts';

Deno.serve(async (req) => {
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const given = req.headers.get('x-watch-secret') ?? '';
  const { data: ok } = await db.rpc('analytics_watch_secret_ok', { p_given: given });
  if (ok !== true) return new Response('unauthorized', { status: 401 });

  const { data: st, error } = await db.rpc('analytics_ingest_status');
  if (error || !st) return new Response('status failed', { status: 500 });

  const reasons: string[] = [];
  if (st.share_of_quota_measured >= 0.2) reasons.push(`בקשות track במחזור הנוכחי: ${Math.round(st.share_of_quota_measured * 100)}% מהמכסה`);
  if (st.projected_track_requests_cycle >= st.quota * 0.5) reasons.push(`בקצב הנוכחי צפויות ${st.projected_track_requests_cycle} בקשות עד סוף המחזור (מכסה ${st.quota})`);
  if (st.abnormal_rate) reasons.push(`קצב חריג היום: ${st.measured_track_requests_today} מול חציון ${st.median_prev_7_days}`);
  if (st.database_share >= 0.7) reasons.push(`גודל המסד: ${Math.round(st.database_share * 100)}% מהמכסה`);

  if (reasons.length) {
    await sendAlert('מעקב תנועה: חריגה בשימוש', [
      ...reasons.map((r, i) => [`סיבה ${i + 1}`, r] as [string, unknown]),
      ['מחזור חיוב', `${st.cycle_start}, יום ${st.day_in_cycle} מתוך ${st.cycle_days}`],
      ['נמדד', st.note],
      ['מה אפשר לעשות', 'לכבות קליטה באדמין (תנועה › הגדרות). זה עוצר כתיבות, לא את ספירת הבקשות לפונקציה.'],
    ]);
  }
  return Response.json({ ok: true, alerted: reasons.length > 0, reasons });
});
