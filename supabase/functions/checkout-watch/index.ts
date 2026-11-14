/**
 * שומר קופה: כל 10 דקות בודק אם לקוחות מנסים לשלם ואף ניסיון לא מסתיים.
 *
 * למה: בליל ההשקה (13.11.2026, 21:52–23:12) תשלומי כרטיס נכשלו בשלב 3DS
 * אצל טרנזילה, וטרנזילה לא שלחה לנו שום הודעה. גילינו בבוקר. ההתראה של
 * "הקופה נתקעה" (checkout-blocked) תלויה בכך שהלקוח נשאר בחלון 30 שניות;
 * הבדיקה כאן לא תלויה בדפדפן ולא בטרנזילה — היא סופרת מה שקורה אצלנו.
 *
 * "ניסיון שקט": סל שנפתח לפני 10–40 דקות, שלא שולם, ושלא הגיעה עליו שום
 * הודעה מטרנזילה (notify / חזרה מעמוד התשלום). לקוח שבסוף שילם (גם בסל
 * אחר, למשל עבר ל-Apple Pay) אינו נספר.
 *
 * התראה כשיש 3 לקוחות שונים או יותר עם ניסיון שקט בחלון. לכל היותר התראה
 * אחת בשעתיים. מופעל מ-cron עם סוד בכותרת x-watch-secret (אותו סוד של
 * analytics-watch).
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { sendAlert } from '../_shared/alert.ts';

const MIN_CUSTOMERS = 3;

Deno.serve(async (req) => {
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: ok } = await db.rpc('analytics_watch_secret_ok', { p_given: req.headers.get('x-watch-secret') ?? '' });
  if (ok !== true) return new Response('unauthorized', { status: 401 });

  const now = Date.now();
  const from = new Date(now - 40 * 60_000).toISOString();
  const to = new Date(now - 10 * 60_000).toISOString();

  const { data: sessions, error } = await db.from('checkout_sessions')
    .select('id, status, customer_name, customer_phone, total_price, created_at')
    .gte('created_at', from).lte('created_at', to);
  if (error) return new Response('query failed', { status: 500 });
  if (!sessions?.length) return Response.json({ ok: true, silent: 0 });

  const ids = sessions.map(s => s.id);
  const { data: events } = await db.from('payment_events')
    .select('session_id, source').in('session_id', ids).in('source', ['notify', 'success', 'fail']);
  const heard = new Set((events ?? []).map(e => e.session_id));

  // לקוחות ששילמו בחלון הרחב (כולל אחרי הניסיון השקט) — לא נחשבים תקועים
  const { data: paidNow } = await db.from('checkout_sessions')
    .select('customer_phone').eq('status', 'paid').gte('created_at', from);
  const digits = (p: unknown) => String(p ?? '').replace(/\D/g, '');
  const paidPhones = new Set((paidNow ?? []).map(s => digits(s.customer_phone)));

  const done = new Set(['paid', 'failed', 'failed_final', 'duplicate', 'overbooked']);
  const silent = sessions.filter(s => !done.has(s.status) && !heard.has(s.id) && !paidPhones.has(digits(s.customer_phone)));
  const byCustomer = new Map<string, typeof silent[number]>();
  for (const s of silent) byCustomer.set(digits(s.customer_phone) || s.id, s);

  if (byCustomer.size < MIN_CUSTOMERS) return Response.json({ ok: true, silent: byCustomer.size, alerted: false });

  const { data: canAlert } = await db.rpc('take_rate_token', {
    p_bucket: 'checkout-watch-alert', p_client: 'all', p_limit: 1, p_window: '2 hours',
  });
  if (canAlert === false) return Response.json({ ok: true, silent: byCustomer.size, alerted: false, throttled: true });

  const paidCount = sessions.filter(s => s.status === 'paid').length;
  const hhmm = (iso: string) => new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  const rows: Array<[string, unknown]> = [...byCustomer.values()].slice(0, 10).map(s => {
    const p = digits(s.customer_phone);
    return [`${hhmm(s.created_at)} · ${s.customer_name ?? '—'}`,
      `${s.customer_phone ?? '—'}${p ? ` · https://wa.me/972${p.replace(/^0/, '')}` : ''} · ₪${s.total_price}`];
  });
  const err = await sendAlert(`ייתכן שהסליקה לא עובדת: ${byCustomer.size} לקוחות ניסו לשלם ולא הסתיים`, [
    ['מה נמדד', `ב-30 הדקות שהסתיימו לפני 10 דקות: ${byCustomer.size} לקוחות פתחו תשלום, לא שילמו, ולא הגיעה שום הודעה מטרנזילה (לא אישור ולא דחייה). תשלומים שהצליחו באותו חלון: ${paidCount}.`],
    ['מה לעשות', 'לנסות תשלום בדיקה בכרטיס רגיל. אם נכשל — לפנות לטרנזילה, ולחזור ללקוחות עם קישור תשלום או Apple Pay.'],
    ...rows,
  ]);
  if (err) console.error('checkout-watch alert', err);
  await db.from('payment_events').insert({
    session_id: null, source: 'checkout_watch',
    payload: { silent: byCustomer.size, paid: paidCount, sessions: silent.map(s => s.id) },
    note: `שומר קופה: ${byCustomer.size} לקוחות עם ניסיון תשלום שקט (בלי הודעה מטרנזילה)`,
  });
  return Response.json({ ok: true, silent: byCustomer.size, alerted: !err });
});
