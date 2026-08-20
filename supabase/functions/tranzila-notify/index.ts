/**
 * מקבל את הודעת התשלום מטרנזילה והופך אותה להזמנה.
 *
 * הכתובת הזו פתוחה לאינטרנט ואין עליה אימות — כך טרנזילה עובדת. לכן
 * ההנחה כאן היא שכל מה שמגיע עלול להיות מזויף, ומההודעה נלקח שדה
 * אחד בלבד: מספר האינדקס. את השאלה "האם באמת נגבה כסף, וכמה" שואלים
 * את טרנזילה ישירות דרך ה-API החתום, ורק התשובה שלה קובעת.
 *
 * הפונקציה אידמפוטנטית — טרנזילה שולחת גם notify וגם מפנה ל-success,
 * ולעיתים מנסה שוב. יצירת ההזמנה קורית פעם אחת בלבד.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { amountMatches, looksLikeUnitMismatch, reportAmountToIls, verifyTransaction }
  from '../_shared/tranzila.ts';
import { confirmOrderOnce } from '../_shared/email.ts';

Deno.serve(async (req) => {
  // טרנזילה מצפה ל-200 בכל מקרה. שגיאה שמוחזרת אליה רק תגרום
  // לניסיונות חוזרים בלי להועיל — התיעוד נעשה אצלנו ביומן.
  const ok = () => new Response('OK', { status: 200 });

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let payload: Record<string, string> = {};
  try {
    const raw = await req.text();
    const params = req.headers.get('content-type')?.includes('json')
      ? new URLSearchParams(Object.entries(JSON.parse(raw)).map(([k, v]) => [k, String(v)]))
      : new URLSearchParams(raw || new URL(req.url).search);
    payload = Object.fromEntries(params);
  } catch (e) {
    console.error('notify parse', e);
    return ok();
  }

  // מזהה הסל מגיע בשני ערוצים בכוונה. התיעוד אינו מבטיח שפרמטר עצמי
  // שנשלח לעמוד התשלום יוחזר בהודעה, ולכן הוא נשתל גם במחרוזת השאילתה
  // של כתובת ה-notify עצמה. די באחד מהם.
  const sessionId = new URL(req.url).searchParams.get('s') || payload.sessionid || '';

  // רק index. transaction_id הוא מספר אחר לגמרי, ושליחתו כ-
  // transaction_index הייתה מאמתת עסקה זרה — שאולי אף תעבור את
  // בדיקת הסכום ותסגור את ההזמנה על חשבון לקוח אחר.
  const index = Number(payload.index ?? 0);

  const log = (note: string, extra: Record<string, unknown> = {}) =>
    db.from('payment_events').insert({
      session_id: /^[0-9a-f-]{36}$/i.test(sessionId) ? sessionId : null,
      source: 'notify',
      payload: { ...payload, ...extra },
      note,
    });

  if (!sessionId || !index) {
    await log('הודעה בלי מזהה סל או בלי אינדקס עסקה');
    return ok();
  }

  // אימות עצמאי — לא סומכים על Response=000 שהגיע בהודעה עצמה
  let v = await verifyTransaction(index);

  // שב"א טרם ענתה. ממתינים מעט ושואלים שוב, במקום לפסול עסקה שאולי
  // דווקא הצליחה.
  for (let i = 0; i < 3 && v.retry; i++) {
    await new Promise(r => setTimeout(r, 2000));
    v = await verifyTransaction(index);
  }

  // מצב שאינו סופי: הסל נשאר ממתין ואינו מסומן, כדי שההשוואה היומית
  // תוכל להרים אותו. סימון ככישלון היה מוציא אותו מטווח ההשוואה לתמיד.
  if (v.retry) {
    await log(`האימות טרם סופי (${v.reason}) — הסל נשאר ממתין להשוואה`);
    return ok();
  }

  if (!v.ok) {
    await db.from('checkout_sessions')
      .update({ status: 'failed', failure_reason: v.reason, tranzila_index: index })
      .eq('id', sessionId).eq('status', 'pending');
    await log(`האימות מול טרנזילה נכשל: ${v.reason}`, { verified: v.raw });
    return ok();
  }

  const { data: session } = await db.from('checkout_sessions')
    .select('total_price, status').eq('id', sessionId).maybeSingle();

  if (!session) {
    await log('אינדקס אומת אך הסל לא נמצא');
    return ok();
  }

  const reported = Number(v.amount ?? 0);

  if (!amountMatches(reported, session.total_price)) {
    // אם הסכום תואם דווקא בפירוש ההפוך, המסוף מדווח ביחידה אחרת.
    // לא מאשרים, אבל אומרים את זה במפורש במקום להשאיר חידה.
    const unit = looksLikeUnitMismatch(reported, session.total_price)
      ? ' — נראה שהמסוף מדווח ביחידה אחרת. להגדיר TRANZILA_REPORT_AMOUNT_UNIT'
      : '';

    await db.from('checkout_sessions')
      .update({
        status: 'failed',
        failure_reason: `סכום שנגבה ${reported} אינו תואם ל-${session.total_price}${unit}`,
        tranzila_index: index,
      })
      .eq('id', sessionId).eq('status', 'pending');
    await log(`פער סכומים — ההזמנה לא נוצרה${unit}`, { verified: v.raw });
    return ok();
  }

  const { data, error } = await db.rpc('finalize_checkout_session', {
    p_session_id: sessionId,
    // הסכום שאומת מול טרנזילה, לא זה של הסל. העברת סכום הסל הפכה את
    // הבדיקה בבסיס הנתונים להשוואה של ערך לעצמו.
    p_amount: reportAmountToIls(reported),
    p_index: index,
    p_txn_id: Number(payload.transaction_id ?? 0) || null,
    p_last4: payload.ccno ?? null,
  });

  if (error) {
    await log(`יצירת ההזמנה נכשלה: ${error.message}`, { verified: v.raw });
    return ok();
  }

  await log(data?.already ? 'הודעה חוזרת — ההזמנה כבר קיימת' : 'הזמנה נוצרה',
            { order_ids: data?.order_ids });

  // כישלון במייל לא מפיל את ההזמנה — הכסף כבר נגבה
  const mailErr = await confirmOrderOnce(db, sessionId);
  if (mailErr) await log(`שליחת אישור ההזמנה נכשלה: ${mailErr}`);

  return ok();
});
