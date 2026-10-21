/**
 * השוואה יומית בין מה שנגבה בטרנזילה לבין ההזמנות אצלנו.
 *
 * למה זה קיים: יצירת ההזמנה תלויה בהודעה אחת מטרנזילה. אם היא לא
 * הגיעה — שרת שהיה למטה, תקלת רשת, שגיאה זמנית — הלקוח חויב ואין
 * הזמנה, ואף אחד לא יודע על כך עד שהוא מתקשר. הפונקציה הזו סוגרת את
 * הפער: היא שואלת את טרנזילה מה נגבה בפועל, ומשווה.
 *
 * עסקה מקושרת לסל רק לפי מספר העסקה שנרשם עליו. עסקה בלי קישור כזה
 * אינה מוצמדת לסל לפי סכום וזמן — חיוב עודף של לקוח אחד היה עלול
 * להיסגר על סל פתוח של לקוח אחר באותו סכום. היא נפתחת כתיק
 * (payment_issues, kind=unmatched) לבדיקה אנושית.
 *
 * בסוף הריצה נשלחת תזכורת על כל התיקים הפתוחים.
 *
 *   GET /tranzila-reconcile?days=2
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { isApproved, isCharge, listTransactions, reportAmountToIls }
  from '../_shared/tranzila.ts';
import { confirmOrderOnce } from '../_shared/email.ts';
import { ISSUE_LABEL, REASON_KIND, alertIssue, sendAlert } from '../_shared/alert.ts';

/**
 * כמה זמן לפני תחילת הטווח טוענים סלים. עסקה שקרתה מיד אחרי תחילת
 * הטווח שייכת לסל שנוצר לפניו, והדוח מחזיר תאריך בלי אזור זמן.
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
    txns = (await listTransactions(ymd(since), ymd(until)))
      .filter(isApproved).filter(isCharge);
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

  // עסקאות שכבר משויכות: לסל שנרשם בו כסף, או לחריגה שכבר נפתחה.
  const linked = new Set(
    (known ?? []).filter(s => ['paid', 'overbooked', 'duplicate'].includes(s.status))
      .map(s => Number(s.tranzila_index)).filter(Boolean),
  );
  const { data: issueRows } = await db.from('payment_issues')
    .select('tranzila_index').not('tranzila_index', 'is', null);
  const flagged = new Set((issueRows ?? []).map(i => Number(i.tranzila_index)));

  const result = { checked: txns.length, matched: 0, recovered: 0, issues: 0 };

  const openIssue = async (t: typeof txns[number], note: string) => {
    const { error } = await db.from('payment_issues').insert({
      kind: 'unmatched',
      tranzila_index: Number(t.index),
      amount: reportAmountToIls(Number(t.amount)),
      details: { txn: t, note },
    });
    // 23505: כבר נפתח תיק על העסקה הזו
    if (error && error.code !== '23505') console.error('reconcile issue', error.message);
    if (!error) {
      result.issues++;
      const err = await alertIssue('unmatched', { index: Number(t.index), amount: t.amount, note });
      if (err) console.error('reconcile alert', err);
    }
  };

  for (const t of txns) {
    const idx = Number(t.index);
    if (linked.has(idx) || flagged.has(idx)) { result.matched++; continue; }

    // התאמה רק לפי מספר העסקה עצמו: סל שכבר נושא אותו ולא נסגר. כך
    // נראית הזמנה ששולמה ונפלה על תקלה זמנית באימות.
    const exact = (known ?? []).filter(s =>
      Number(s.tranzila_index) === idx && !['paid', 'overbooked', 'duplicate'].includes(s.status));

    // בלי מספר עסקה אין ניחוש לפי סכום וזמן: חיוב עודף של לקוח אחד
    // היה עלול להיצמד לסל פתוח של לקוח אחר באותו סכום. תיק לבדיקה.
    if (exact.length !== 1) {
      await openIssue(t, exact.length === 0
        ? 'עסקה מאושרת בטרנזילה בלי סל שנושא את מספר העסקה'
        : `${exact.length} סלים נושאים את אותו מספר עסקה`);
      continue;
    }

    const session = exact[0];
    const { data, error } = await db.rpc('finalize_checkout_session', {
      p_session_id: session.id,
      p_amount: reportAmountToIls(Number(t.amount)),   // הסכום שנגבה, לא זה שביקשנו
      p_index: idx,
      p_txn_id: null,
      p_last4: null,
    });

    await db.from('payment_events').insert({
      session_id: session.id,
      source: 'reconcile',
      payload: t as unknown as Record<string, unknown>,
      note: data?.ok
        ? `הזמנה שוחזרה מהשוואה — ההודעה מטרנזילה מעולם לא הגיעה (${data?.order_ids?.length ?? 0} שורות)`
        : `שחזור לא יצר הזמנה: ${error?.message ?? data?.reason}`,
    });

    if (data?.ok) {
      result.recovered++;
      // הלקוח הזה מעולם לא קיבל אישור, כי ההודעה לא הגיעה
      const mailErr = await confirmOrderOnce(db, session.id);
      if (mailErr) console.error('reconcile mail', mailErr);
    } else if (data?.issue) {
      // finalize רשמה חריגה (חיוב שני, אין מלאי וכו')
      result.issues++;
      const err = await alertIssue(REASON_KIND[data.reason] ?? data.reason, {
        session: session.id, index: idx, amount: t.amount, note: data.reason });
      if (err) console.error('reconcile alert', err);
    } else {
      await openIssue(t, `שחזור נכשל: ${error?.message ?? data?.reason}`);
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

  // תזכורת יומית: כל תיק פתוח, עד שנסגר באדמין. ההשוואה רצה פעם ביום
  // (cron 06:00), ולכן זו גם התזכורת.
  const { data: open } = await db.from('payment_issues')
    .select('kind, session_id, tranzila_index, amount, owner, status, due_at, created_at')
    .neq('status', 'resolved').order('created_at');
  if ((open ?? []).length > 0) {
    const now = Date.now();
    const err = await sendAlert(`${open!.length} תיקי תשלום פתוחים`, open!.map(i => [
      `${ISSUE_LABEL[i.kind] ?? i.kind}${new Date(i.due_at).getTime() < now ? ' (באיחור)' : ''}`,
      `סל ${String(i.session_id ?? '—').slice(0, 8).toUpperCase()} · עסקה ${i.tranzila_index ?? '—'} · ₪${i.amount ?? '—'} · ${i.owner} · ${i.status}`,
    ]));
    if (err) console.error('reconcile digest', err);
  }

  return new Response(JSON.stringify({ ...result, open_issues: (open ?? []).length, mails_retried: (unsent ?? []).length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
