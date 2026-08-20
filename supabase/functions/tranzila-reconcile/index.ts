/**
 * השוואה יומית בין מה שנגבה בטרנזילה לבין ההזמנות אצלנו.
 *
 * למה זה קיים: יצירת ההזמנה תלויה בהודעה אחת מטרנזילה. אם היא לא
 * הגיעה — שרת שהיה למטה, תקלת רשת, שגיאה זמנית — הלקוח חויב ואין
 * הזמנה, ואף אחד לא יודע על כך עד שהוא מתקשר. הפונקציה הזו סוגרת את
 * הפער: היא שואלת את טרנזילה מה נגבה בפועל, ומשווה.
 *
 * עסקה שאין לה סל תואם אינה נזרקת ואינה נוצרת בעיוורון. אם יש בדיוק
 * מועמד אחד סביר — סל באותו סכום, מאותו חלון זמן, שמעולם לא נסגר —
 * ההזמנה נוצרת. בכל מקרה אחר היא נרשמת כחריגה לבדיקה אנושית, כי
 * לנחש למי שייך תשלום זה בדיוק סוג הטעות שקשה לתקן אחר כך.
 *
 *   GET /tranzila-reconcile?days=2
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { amountMatches, isApproved, listTransactions } from '../_shared/tranzila.ts';

/** חלון הזמן שבו סל ועסקה עוד יכולים להיות אותו דבר */
const MATCH_WINDOW_MS = 3 * 60 * 60 * 1000;

const ymd = (d: Date) => d.toISOString().slice(0, 10);

Deno.serve(async (req) => {
  const days = Math.min(31, Math.max(1, Number(new URL(req.url).searchParams.get('days') ?? 2)));

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const until = new Date();
  const since = new Date(until.getTime() - days * 86_400_000);

  let txns;
  try {
    txns = (await listTransactions(ymd(since), ymd(until))).filter(isApproved);
  } catch (e) {
    console.error('reconcile report', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 502, headers: { 'Content-Type': 'application/json' },
    });
  }

  // מה שכבר ידוע לנו
  const { data: known } = await db.from('checkout_sessions')
    .select('id, total_price, status, created_at, tranzila_index')
    .gte('created_at', since.toISOString());

  const seen = new Set(
    (known ?? []).map(s => s.tranzila_index).filter(Boolean).map(Number),
  );

  const result = { checked: txns.length, matched: 0, recovered: 0, orphans: 0 };

  for (const t of txns) {
    if (seen.has(Number(t.index))) { result.matched++; continue; }

    const when = new Date(t.transaction_date).getTime();

    // סל פתוח, פג או שנכשל — כלומר כזה שמעולם לא הפך להזמנה
    const candidates = (known ?? []).filter(s =>
      s.status !== 'paid' &&
      !s.tranzila_index &&
      amountMatches(Number(t.amount), s.total_price) &&
      Math.abs(new Date(s.created_at).getTime() - when) < MATCH_WINDOW_MS
    );

    if (candidates.length !== 1) {
      // אפס מועמדים או יותר מאחד — לא מנחשים
      await db.from('payment_events').insert({
        session_id: null,
        source: 'reconcile',
        payload: t as unknown as Record<string, unknown>,
        note: `עסקה ${t.index} על ${t.amount} נגבתה בטרנזילה ואין לה הזמנה. ` +
              `${candidates.length === 0 ? 'לא נמצא סל תואם' : `נמצאו ${candidates.length} סלים תואמים`} — דורש בדיקה ידנית.`,
      });
      result.orphans++;
      continue;
    }

    const session = candidates[0];

    // הסל חייב לחזור ל-pending כדי ש-finalize תסכים לטפל בו. זה בטוח:
    // הגענו לכאן רק אחרי שטרנזילה אישרה שהעסקה קיימת ובסכום הנכון.
    await db.from('checkout_sessions')
      .update({ status: 'pending', expires_at: new Date(Date.now() + 60_000).toISOString() })
      .eq('id', session.id);

    const { data, error } = await db.rpc('finalize_checkout_session', {
      p_session_id: session.id,
      p_amount: session.total_price,
      p_index: Number(t.index),
      p_txn_id: null,
      p_last4: null,
    });

    await db.from('payment_events').insert({
      session_id: session.id,
      source: 'reconcile',
      payload: t as unknown as Record<string, unknown>,
      note: error
        ? `שחזור נכשל: ${error.message}`
        : `הזמנה שוחזרה מהשוואה — ההודעה מטרנזילה מעולם לא הגיעה (${data?.order_ids?.length ?? 0} שורות)`,
    });

    if (error) result.orphans++; else result.recovered++;
  }

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});
