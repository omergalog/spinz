/**
 * חתימה ואימות מול טרנזילה.
 *
 * המפתח הפרטי חי כאן ורק כאן — בסביבת השרת של Supabase. הוא לעולם
 * אינו מגיע לדפדפן, ולכן גם הקריאות לטרנזילה חייבות לצאת מכאן.
 */

const APP_KEY = Deno.env.get('TRANZILA_APP_KEY') ?? '';
const SECRET = Deno.env.get('TRANZILA_SECRET') ?? '';

export const TERMINAL = Deno.env.get('TRANZILA_TERMINAL') ?? 'spinz';

/** עמוד התשלום. terminalname הוא חלק מהנתיב, לא פרמטר. */
export const IFRAME_URL =
  `https://directng.tranzila.com/${TERMINAL}/iframenew.php`;

const REPORT_URL = 'https://report.tranzila.com/v1/transaction';

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * ארבע הכותרות שטרנזילה דורשת.
 *
 * שים לב לסדר הארגומנטים: מה שנחתם הוא המפתח הציבורי, והמפתח של
 * החתימה הוא הסוד משורשר לזמן ול-nonce. קל להפוך ביניהם, והתוצאה
 * היא 401 בלי הסבר.
 *   PHP: hash_hmac('sha256', $appKey, $secret . $time . $nonce)
 */
export async function authHeaders(): Promise<Record<string, string>> {
  if (!APP_KEY || !SECRET) throw new Error('TRANZILA_APP_KEY/SECRET חסרים');

  const time = Math.floor(Date.now() / 1000).toString();
  const nonce = hex(crypto.getRandomValues(new Uint8Array(40)).buffer); // 80 תווים

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET + time + nonce),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(APP_KEY));

  return {
    'X-tranzila-api-app-key': APP_KEY,
    'X-tranzila-api-request-time': time,
    'X-tranzila-api-nonce': nonce,
    'X-tranzila-api-access-token': hex(sig),
    'Content-Type': 'application/json',
  };
}

export type Verified = {
  ok: boolean;
  /** המצב עדיין לא סופי — לנסות שוב, לא לסמן ככישלון */
  retry?: boolean;
  amount?: number;
  reason?: string;
  raw?: unknown;
};

/**
 * אימות עצמאי של עסקה מול טרנזילה, לפי מספר האינדקס שלה.
 *
 * זה הצעד שהופך את notify מ"הודעה שמישהו שלח" ל"עובדה". כתובת ה-notify
 * גלויה לכל, וכל אחד יכול לזייף אליה POST עם Response=000. לכן אנחנו
 * לא מאמינים לתוכן ההודעה אלא רק לשדה אחד ממנה — האינדקס — ואת השאר
 * שואלים את טרנזילה ישירות.
 */
export async function verifyTransaction(index: number): Promise<Verified> {
  const res = await fetch(REPORT_URL, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      terminal_name: TERMINAL,
      transaction_index: index,
      detailed: 'N',
    }),
  });

  // כשל תקשורת או שגיאת שרת אינם דחייה של העסקה. לסמן אותם ככישלון
  // היה מבטל הזמנה ששולמה בגלל דקה של תקלה אצלם.
  if (!res.ok) {
    return {
      ok: false,
      retry: res.status >= 500 || res.status === 429 || res.status === 408,
      reason: `report_http_${res.status}`,
      raw: await res.text(),
    };
  }

  const data = await res.json();

  // טרנזילה מחזירה 200 גם על שגיאה, עם error_code בגוף
  if (data?.error_code && Number(data.error_code) !== 0) {
    return { ok: false, retry: true, reason: `report_error_${data.error_code}`, raw: data };
  }

  const txn = data?.transactions?.[0];
  // ייתכן שהשורה טרם נוצרה בדוח. זו אינה הוכחה שלא נגבה כסף.
  if (!txn) return { ok: false, retry: true, reason: 'not_found', raw: data };

  const code = String(txn.processor_response_code ?? '');

  // 'shva' פירושו שהתשובה משב"א טרם חזרה. זו אינה דחייה, ולסמן אותה
  // ככישלון היה מבטל הזמנה ששולמה. מסמנים כזמנית ומנסים שוב.
  if (code === 'shva') return { ok: false, retry: true, reason: 'pending_shva', raw: txn };

  // האישור נקבע לפי קוד המענה של חברת האשראי בלבד.
  //
  // הגרסה הראשונה דרשה גם transtatus=1, וזו הייתה טעות: השדה הזה
  // מתאר סליקה מול שב"א, שקורית בהעברה היומית ולא ברגע החיוב. עסקה
  // תקינה שנבדקת מיד אחרי התשלום מחזירה 000 עם transtatus=0 —
  // והבדיקה פסלה אותה, כלומר הלקוח חויב וההזמנה לא נוצרה.
  if (code !== '000') {
    return { ok: false, reason: `declined_${code}`, raw: txn };
  }

  return { ok: true, amount: Number(txn.amount), raw: txn };
}

/**
 * ממיר את הסכום מהדוח לשקלים.
 *
 * התיעוד מגדיר את השדה כיחידת המטבע הקטנה, כלומר אגורות. הגרסה
 * הראשונה כאן קיבלה את שתי הקריאות "ליתר ביטחון", וזו הייתה טעות
 * חמורה: מי שמשנה את הסכום בטופס ל-10.90 גורם לדוח להחזיר 1090
 * אגורות, וההשוואה מול הזמנה של ₪1,090 הייתה עוברת. קבלת שתי
 * הקריאות פותחת בדיוק את החור שההשוואה נועדה לסגור.
 *
 * לכן פירוש אחד בלבד, וניתן לשינוי דרך משתנה סביבה אם יתברר בבדיקה
 * שהמסוף מדווח בשקלים.
 */
const AMOUNT_UNIT = (Deno.env.get('TRANZILA_REPORT_AMOUNT_UNIT') ?? 'agorot').trim().toLowerCase();

// ערך שאינו אחד מהשניים נפל קודם בשקט לאגורות. אם מישהו יכתוב
// 'shekels' או 'ILS' והמסוף באמת מדווח בשקלים, כל ההזמנות היו נכשלות
// בלי סיבה נראית לעין.
if (AMOUNT_UNIT !== 'agorot' && AMOUNT_UNIT !== 'shekel') {
  throw new Error(`TRANZILA_REPORT_AMOUNT_UNIT חייב להיות agorot או shekel, התקבל: ${AMOUNT_UNIT}`);
}

export function reportAmountToIls(reported: number): number {
  return AMOUNT_UNIT === 'shekel' ? reported : reported / 100;
}

export function amountMatches(reported: number, expectedIls: number): boolean {
  return Math.abs(reportAmountToIls(reported) - expectedIls) < 0.02;
}

/**
 * האם הסכום היה תואם דווקא בפירוש ההפוך.
 *
 * אם זה קורה, המסוף מדווח ביחידה אחרת מזו שהוגדרה. לא מאשרים את
 * העסקה — אבל רושמים הודעה מפורשת, כדי שלא נחפש את זה בעיוורון.
 */
export function looksLikeUnitMismatch(reported: number, expectedIls: number): boolean {
  const other = AMOUNT_UNIT === 'shekel' ? reported / 100 : reported;
  return Math.abs(other - expectedIls) < 0.02;
}

export type ReportTxn = {
  index: number;
  transaction_date: string;
  amount: number;
  transtatus: number;
  processor_response_code: string;
  [k: string]: unknown;
};

/**
 * שולף את כל העסקאות בטווח תאריכים.
 *
 * משמש להשוואה היומית מול ההזמנות שלנו. התיעוד מגביל ל-1000 שורות
 * לעמוד, ולכן יש כאן דפדוף — אחרת יום עמוס היה נחתך בשקט, וזה בדיוק
 * סוג הכשל שהשוואה אמורה למנוע.
 */
export async function listTransactions(
  startDate: string,
  endDate: string,
): Promise<ReportTxn[]> {
  const all: ReportTxn[] = [];

  for (let page = 1; page <= 20; page++) {
    const res = await fetch(REPORT_URL, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({
        terminal_name: TERMINAL,
        transaction_start_date: startDate,
        transaction_end_date: endDate,
        detailed: 'N',
        page,
        page_results: 1000,
        order_direction: 'asc',
      }),
    });

    if (!res.ok) throw new Error(`report_http_${res.status}`);

    const data = await res.json();
    const rows: ReportTxn[] = data?.transactions ?? [];
    all.push(...rows);

    // הדוח מדווח כמה שורות קיימות בסך הכול. בלי ההשוואה הזו, חריגה
    // ממכסת הדפדוף הייתה מסתיימת בשקט ונראית כמו "הכול תקין".
    const total = Number(data?.total ?? all.length);
    if (rows.length < 1000) {
      if (all.length < total) throw new Error(`report_truncated_${all.length}_of_${total}`);
      break;
    }
    if (page === 20) throw new Error(`report_truncated_${all.length}_of_${total}`);
  }

  return all;
}

/**
 * ארבע ספרות בלבד.
 *
 * השדה מגיע מהודעה שאינה מאומתת, ונשמר ומוצג ללקוח במייל. אין כאן
 * סיכון להרצת קוד — הפלט מוברח — אבל אין סיבה לשמור זבל.
 */
export function safeLast4(v: unknown): string | null {
  const s = String(v ?? '').replace(/\D/g, '');
  return /^\d{4}$/.test(s) ? s : null;
}

/** האם העסקה הצליחה בפועל */
export function isApproved(t: ReportTxn): boolean {
  // transtatus אינו נבדק במכוון — ראה ההסבר ב-verifyTransaction
  return String(t.processor_response_code ?? '') === '000';
}

/**
 * האם העסקה היא חיוב, להבדיל מזיכוי.
 *
 * ההשוואה מחפשת תשלומים שלא הפכו להזמנה. זיכוי הוא עסקה מאושרת לכל
 * דבר, ובלי הסינון הזה כל החזר כספי היה מופיע כתשלום יתום שדורש
 * טיפול ידני — ומטביע בתוכו את המקרים האמיתיים.
 *
 * ⚠ נמדד מול הדוח בפועל, לא הונח: חיוב חוזר עם txn_type='DEBIT',
 * וזיכוי חוזר עם השדה **ריק**. הניחוש הראשון כאן חיפש את המילה
 * credit ולא תפס דבר.
 */
export function isCharge(t: ReportTxn): boolean {
  return String(t.txn_type ?? '').trim().toUpperCase() === 'DEBIT';
}
