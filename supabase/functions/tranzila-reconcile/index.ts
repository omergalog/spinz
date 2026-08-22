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
import { amountMatches, isApproved, listTransactions, reportAmountToIls }
  from '../_shared/tranzila.ts';
import { confirmOrderOnce } from '../_shared/email.ts';

/**
 * חלון הזמן שבו סל ועסקה עוד יכולים להיות אותו דבר.
 *
 * רחב בכוונה. הדוח מחזיר תאריך בלי אזור זמן, ולכן ייתכן פער קבוע של
 * שעתיים-שלוש בין שעון המסוף לשעון שלנו. חלון צר היה מפספס את הסל
 * הנכון בדיוק בגלל הפער הזה.
 *
 * ההרחבה בטוחה משום שהתאמה מתקבלת רק כשיש מועמד יחיד. חלון רחב יותר
 * מגדיל את הסיכוי לשני מועמדים — וזה נשלח לבדיקה ידנית, לא לניחוש.
 */
const MATCH_WINDOW_MS = 8 * 60 * 60 * 1000;

const ymd = (d: Date) => d.toISOString().slice(0, 10);

Deno.serve(async (req) => {
  // הכתובת הייתה פתוחה לכל אחד. היא אינה יכולה להמציא תשלומים —
  // היא פועלת רק על עסקאות שקיימות באמת בטרנזילה — אבל כל קריאה
  // מושכת דוחות ומשכתבת שורות, וזה מספיק כדי להעמיס בחינם.
  const secret = Deno.env.get('RECONCILE_SECRET') ?? '';
  if (secret) {
    const given = req.headers.get('x-reconcile-secret')
      ?? new URL(req.url).searchParams.get('key') ?? '';
    if (given !== secret) return new Response('forbidden', { status: 403 });
  }

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
  // הסלים נטענים מוקדם יותר מהעסקאות: עסקה שקרתה מיד אחרי תחילת
  // הטווח שייכת לסל שנוצר לפניו. בלי ההרחבה, הסל האמיתי היה נופל
  // מחוץ לרשימה ועסקה הייתה עלולה להיתפס לסל אחר.
  const { data: known } = await db.from('checkout_sessions')
    .select('id, total_price, status, created_at, tranzila_index')
    .gte('created_at', new Date(since.getTime() - MATCH_WINDOW_MS).toISOString());

  const paid = new Set(
    (known ?? []).filter(s => s.status === 'paid')
      .map(s => Number(s.tranzila_index)).filter(Boolean),
  );

  const result = { checked: txns.length, matched: 0, recovered: 0, orphans: 0 };

  for (const t of txns) {
    const idx = Number(t.index);
    if (paid.has(idx)) { result.matched++; continue; }

    const when = new Date(t.transaction_date).getTime();

    // התאמה מדויקת קודמת לכול: סל שכבר נושא את מספר העסקה הזה אך לא
    // נסגר. כך נראית הזמנה ששולמה ונפלה על תקלה זמנית באימות — אין
    // כאן ניחוש, המספר עצמו מקשר.
    // overbooked פירושו "נגבה, המלאי אזל, מחכה לזיכוי". זהו מצב סופי
    // שכבר תועד. ניסיון לשחזר אותו רק היה מוחק את הסימון.
    const open = (known ?? []).filter(s => s.status !== 'paid' && s.status !== 'overbooked');

    let candidates = open.filter(s => Number(s.tranzila_index) === idx);

    // רק אם אין קישור מפורש, נופלים להתאמה לפי סכום וחלון זמן
    if (candidates.length === 0) {
      candidates = open.filter(s =>
        !s.tranzila_index &&
        amountMatches(Number(t.amount), s.total_price) &&
        Math.abs(new Date(s.created_at).getTime() - when) < MATCH_WINDOW_MS
      );
    }

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
      p_amount: reportAmountToIls(Number(t.amount)),   // הסכום שנגבה, לא זה שביקשנו
      p_index: idx,
      p_txn_id: null,
      p_last4: null,
    });

    // אם השחזור נכשל, הסל חייב לחזור למצב לא-ממתין. אחרת הוא ממשיך
    // להיספר כמלאי שמור ומקטין את הזמינות המוצגת באתר ללא סיבה.
    // finalize מסמנת overbooked בעצמה, ואת זה לא דורסים.
    const failed = error || !data?.ok;
    if (failed && data?.reason !== 'PAID_BUT_OUT_OF_STOCK') {
      await db.from('checkout_sessions')
        .update({
          status: 'failed',
          tranzila_index: idx,
          failure_reason: error?.message ?? data?.reason ?? 'שחזור נכשל',
        })
        .eq('id', session.id);
    }

    await db.from('payment_events').insert({
      session_id: session.id,
      source: 'reconcile',
      payload: t as unknown as Record<string, unknown>,
      note: failed
        ? `שחזור נכשל: ${error?.message ?? data?.reason}`
        : `הזמנה שוחזרה מהשוואה — ההודעה מטרנזילה מעולם לא הגיעה (${data?.order_ids?.length ?? 0} שורות)`,
    });

    if (failed) {
      result.orphans++;
    } else {
      result.recovered++;
      // הלקוח הזה מעולם לא קיבל אישור, כי ההודעה לא הגיעה
      const mailErr = await confirmOrderOnce(db, session.id);
      if (mailErr) console.error('reconcile mail', mailErr);
    }
  }

  // מיילים שלא יצאו. תקלה זמנית אצל ספק הדיוור השאירה קודם לקוח
  // ששילם בלי שום אישור, ובלי ניסיון נוסף לעולם.
  const { data: unsent } = await db.from('checkout_sessions')
    .select('id').eq('status', 'paid').is('confirmation_sent_at', null)
    .gte('created_at', since.toISOString()).limit(50);

  for (const u of unsent ?? []) {
    const err = await confirmOrderOnce(db, u.id);
    if (err) console.error('resend confirmation', u.id, err);
  }

  return new Response(JSON.stringify({ ...result, mails_retried: (unsent ?? []).length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
