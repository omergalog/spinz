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

/** כמה ימים אחורה נבדק כל דוח, ומה המקסימום לריצה אחת (התאוששות אחרי השבתה). */
const OVERLAP_DAYS = 1;
const DEFAULT_DAYS = 2;
/**
 * ריצה מתוזמנת ראשונה, כשאין נקודת התקדמות מתוזמנת (למשל מיד אחרי
 * המעבר: ה-cron הישן שולח ?days=2 ולכן נרשם כידני). חלון רחב, כדי לכסות
 * כל פער מאז הריצה המוצלחת האחרונה של הגרסה הקודמת. הכפילויות מטופלות.
 */
const FIRST_RUN_DAYS = 14;
const CHUNK_DAYS = 31;
const MAX_DAYS = 186;
const DAY = 86_400_000;

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** שפת מייל האישור לסל. מסד לפני המיגרציה (אין עמודה) → עברית, כמו קודם. */
// deno-lint-ignore no-explicit-any
async function sessionLang(db: any, id: string): Promise<'he' | 'en'> {
  const { data, error } = await db.from('checkout_sessions').select('lang').eq('id', id).maybeSingle();
  return !error && data?.lang === 'en' ? 'en' : 'he';
}

Deno.serve(async (req) => {
  // הסוד חובה, ומתקבל רק בכותרת x-reconcile-secret (מחרוזת שאילתה נשמרת
  // ביומני גישה). מקור הסוד: Vault (reconcile_secret, דרך reconcile_secret_ok),
  // שממנו קורא גם ה-cron — מקור אחד, בלי להעתיק ערך. RECONCILE_SECRET בסביבה
  // נתמך בתקופת המעבר, וכך גם ?key= עם RECONCILE_ALLOW_QUERY_KEY=1.
  // אין סוד מוגדר בשום מקום → 503, לא ריצה פתוחה.
  const url = new URL(req.url);
  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const envSecret = Deno.env.get('RECONCILE_SECRET') ?? '';
  const header = req.headers.get('x-reconcile-secret') ?? '';
  let authorized = false;
  let configured = !!envSecret;
  if (header && envSecret && safeEqual(header, envSecret)) {
    authorized = true;
  } else {
    // null = אין סוד ב-Vault (או שהפונקציה עוד לא קיימת)
    const { data: vaultOk, error: vaultErr } = await db.rpc('reconcile_secret_ok', { p_given: header });
    if (!vaultErr && vaultOk !== null) { configured = true; authorized = header !== '' && vaultOk === true; }
  }
  if (!authorized && !header && envSecret && Deno.env.get('RECONCILE_ALLOW_QUERY_KEY') === '1') {
    authorized = safeEqual(url.searchParams.get('key') ?? '', envSecret);
  }
  if (!configured) return new Response('reconcile secret not configured', { status: 503 });
  if (!authorized) return new Response('forbidden', { status: 403 });

  // ריצה ידנית (?days=) אינה נקודת התקדמות: היא בודקת טווח קצר ולא
  // מוכיחה שהפער הישן נבדק. רק ריצה מתוזמנת (בלי days) מקדמת.
  const daysParam = url.searchParams.get('days');
  const scheduled = !daysParam;

  // כל כשל שמונע טיפול מלא בחיובים: הריצה נרשמת כנכשלת, נקודת ההתקדמות
  // לא זזה, ונשלחת התראה. שגיאה לעולם לא נחשבת "תוצאה ריקה".
  const fail = async (stage: string, e: unknown, extra: Record<string, unknown> = {}) => {
    const msg = `${stage}: ${String((e as { message?: string })?.message ?? e)}`;
    console.error('reconcile', msg);
    await db.from('payment_events').insert({
      source: 'reconcile_run', payload: { ok: false, scheduled, error: msg, ...extra },
      note: `ההשוואה היומית נכשלה: ${msg}`,
    });
    const alertErr = await sendAlert('ההשוואה היומית מול טרנזילה נכשלה', [['שלב', stage], ['שגיאה', msg], ['משמעות', 'חיובים שלא הפכו להזמנה לא נבדקו במלואם. הריצה הבאה תתחיל מאותה נקודה']]);
    if (alertErr) console.error('reconcile alert', alertErr);
    return new Response(JSON.stringify({ error: msg, ...extra }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  };

  // טווח: מהריצה המתוזמנת המוצלחת האחרונה, עם יום חפיפה. אחרי השבתה
  // ארוכה הטווח גדל, ונמשך בחלקים של עד 31 יום.
  const until = new Date();
  let since: Date;
  if (daysParam) {
    since = new Date(until.getTime() - Math.min(MAX_DAYS, Math.max(1, Number(daysParam) || DEFAULT_DAYS)) * DAY);
  } else {
    const { data: lastOk, error: lastErr } = await db.from('payment_events').select('payload')
      .eq('source', 'reconcile_run').eq('payload->>ok', 'true').eq('payload->>scheduled', 'true')
      .order('created_at', { ascending: false }).limit(1);
    if (lastErr) return await fail('נקודת ההתקדמות', lastErr);
    const prevUntil = lastOk?.[0]?.payload?.until ? new Date(`${lastOk[0].payload.until}T00:00:00Z`) : null;
    since = prevUntil && !Number.isNaN(prevUntil.getTime())
      ? new Date(prevUntil.getTime() - OVERLAP_DAYS * DAY)
      : new Date(until.getTime() - FIRST_RUN_DAYS * DAY);
  }
  let capped = false;
  if (until.getTime() - since.getTime() > MAX_DAYS * DAY) {
    // מעבר לחצי שנה: לא מנסים בריצה אחת. נבדק החלק הישן ביותר, ונקודת
    // ההתקדמות זזה רק עד סופו — הריצה הבאה ממשיכה משם.
    capped = true;
  }
  const end = capped ? new Date(since.getTime() + MAX_DAYS * DAY) : until;

  let txns: Awaited<ReturnType<typeof listTransactions>> = [];
  try {
    const seen = new Set<number>();
    for (let from = since; from < end; from = new Date(from.getTime() + CHUNK_DAYS * DAY)) {
      const to = new Date(Math.min(end.getTime(), from.getTime() + CHUNK_DAYS * DAY));
      for (const t of await listTransactions(ymd(from), ymd(to))) {
        // חלקים חופפים ביום הקצה: כל עסקה פעם אחת
        if (seen.has(Number(t.index))) continue;
        seen.add(Number(t.index));
        txns.push(t);
      }
    }
    txns = txns.filter(isApproved).filter(isCharge);
  } catch (e) {
    return await fail('דוח טרנזילה', e, { since: ymd(since), until: ymd(end) });
  }

  // מה שכבר ידוע לנו
  // הסלים נטענים מוקדם יותר מהעסקאות: עסקה שקרתה מיד אחרי תחילת
  // הטווח שייכת לסל שנוצר לפניו. בלי ההרחבה, הסל האמיתי היה נופל
  // מחוץ לרשימה ועסקה הייתה עלולה להיתפס לסל אחר.
  const { data: known, error: knownErr } = await db.from('checkout_sessions')
    .select('id, total_price, status, created_at, tranzila_index')
    .gte('created_at', new Date(since.getTime() - MATCH_WINDOW_MS).toISOString());
  if (knownErr) return await fail('קריאת סלים', knownErr, { since: ymd(since), until: ymd(end) });

  // עסקאות שכבר משויכות: לסל שנרשם בו כסף, או לחריגה שכבר נפתחה.
  const linked = new Set(
    (known ?? []).filter(s => ['paid', 'overbooked', 'duplicate'].includes(s.status))
      .map(s => Number(s.tranzila_index)).filter(Boolean),
  );
  const { data: issueRows, error: issueErr } = await db.from('payment_issues')
    .select('tranzila_index').not('tranzila_index', 'is', null);
  const flagged = new Set((issueRows ?? []).map(i => Number(i.tranzila_index)));

  // מסד לפני מיגרציית הרכישות (אין payment_issues): התנהגות הגרסה הקודמת
  // לסלים עם מספר עסקה, ותיעוד ב-payment_events במקום בתיק. קורה רק אם
  // הפונקציות עולות לפני ה-SQL, או אחרי חזרה של ה-SQL.
  const legacyDb = !!issueErr && (issueErr.code === '42P01' || issueErr.code === 'PGRST205'
    || /relation .*payment_issues.* does not exist|Could not find the table/.test(issueErr.message ?? ''));
  if (issueErr && !legacyDb) return await fail('קריאת תיקים', issueErr, { since: ymd(since), until: ymd(end) });

  // כשלים בטיפול בעסקה מסוימת. כל אחד מונע את קידום נקודת ההתקדמות.
  const problems: string[] = [];

  const result = { checked: txns.length, matched: 0, recovered: 0, issues: 0 };

  const openIssue = async (t: typeof txns[number], note: string) => {
    if (legacyDb) {
      const { error } = await db.from('payment_events').insert({
        session_id: null, source: 'reconcile', payload: t as unknown as Record<string, unknown>,
        note: `עסקה ${t.index} על ${t.amount} נגבתה בטרנזילה ואין לה הזמנה (${note}) — דורש בדיקה ידנית.`,
      });
      if (error) problems.push(`תיעוד עסקה ${t.index}: ${error.message}`);
      else result.issues++;
      return;
    }
    const { error } = await db.from('payment_issues').insert({
      kind: 'unmatched',
      tranzila_index: Number(t.index),
      amount: reportAmountToIls(Number(t.amount)),
      details: { txn: t, note },
    });
    // 23505: כבר נפתח תיק על העסקה הזו — זה מצב תקין
    if (error && error.code !== '23505') problems.push(`תיק לעסקה ${t.index}: ${error.message}`);
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
    // במסד הישן finalize מקבלת רק pending, ולכן הסל מוחזר אליו קודם (כמו בגרסה הקודמת)
    if (legacyDb) {
      const { error } = await db.from('checkout_sessions')
        .update({ status: 'pending', expires_at: new Date(Date.now() + 60_000).toISOString() })
        .eq('id', session.id);
      if (error) { problems.push(`הכנת סל ${session.id}: ${error.message}`); continue; }
    }
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
      const mailErr = await confirmOrderOnce(db, session.id, await sessionLang(db, session.id));
      if (mailErr) console.error('reconcile mail', mailErr);
    } else if (data?.issue) {
      // finalize רשמה חריגה (חיוב שני, אין מלאי וכו')
      result.issues++;
      const err = await alertIssue(REASON_KIND[data.reason] ?? data.reason, {
        session: session.id, index: idx, amount: t.amount, note: data.reason });
      if (err) console.error('reconcile alert', err);
    } else {
      if (legacyDb && data?.reason !== 'PAID_BUT_OUT_OF_STOCK') {
        const { error: uErr } = await db.from('checkout_sessions')
          .update({ status: 'failed', tranzila_index: idx, failure_reason: error?.message ?? data?.reason ?? 'שחזור נכשל' })
          .eq('id', session.id);
        if (uErr) problems.push(`סימון סל ${session.id}: ${uErr.message}`);
      }
      await openIssue(t, `שחזור נכשל: ${error?.message ?? data?.reason}`);
    }
  }

  // מיילים שלא יצאו. תקלה זמנית אצל ספק הדיוור השאירה קודם לקוח
  // ששילם בלי שום אישור, ובלי ניסיון נוסף לעולם.
  const { data: unsent } = await db.from('checkout_sessions')
    .select('id').eq('status', 'paid').is('confirmation_sent_at', null)
    .gte('created_at', since.toISOString()).limit(50);

  for (const u of unsent ?? []) {
    const err = await confirmOrderOnce(db, u.id, await sessionLang(db, u.id));
    if (err) console.error('resend confirmation', u.id, err);
  }

  // תזכורת יומית: כל תיק פתוח, עד שנסגר באדמין. ההשוואה רצה פעם ביום
  // (cron 06:00), ולכן זו גם התזכורת.
  const { data: open } = legacyDb ? { data: [] as Array<Record<string, any>> } : await db.from('payment_issues')
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

  if (problems.length > 0) {
    return await fail('טיפול בעסקאות', problems.join(' | '), { since: ymd(since), until: ymd(end), ...result, problems });
  }

  // סימן חיים: האדמין מתריע אם לא הייתה ריצה מתוזמנת מוצלחת ב-26 השעות האחרונות
  await db.from('payment_events').insert({
    source: 'reconcile_run', payload: { ok: true, scheduled, since: ymd(since), until: ymd(end), capped, ...result, open_issues: (open ?? []).length },
    note: `השוואה יומית: ${result.checked} עסקאות, ${result.recovered} שוחזרו, ${result.issues} תיקים חדשים`,
  });

  // סימן חיים חיצוני (אופציונלי): שירות "מתג מת" שמתריע כשלא הגיע פינג.
  // לא מחובר — דורש שירות חיצוני ואישור. בלי HEARTBEAT_URL לא קורה כלום.
  // ריצה ידנית לא שולחת: היא לא מוכיחה שהריצה המתוזמנת חיה.
  const hb = Deno.env.get('HEARTBEAT_URL');
  if (hb && scheduled) await fetch(hb).catch(e => console.error('heartbeat', e));

  return new Response(JSON.stringify({ ...result, since: ymd(since), until: ymd(end), capped, open_issues: (open ?? []).length, mails_retried: (unsent ?? []).length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
