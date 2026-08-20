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

  if (!res.ok) {
    return { ok: false, reason: `report_http_${res.status}`, raw: await res.text() };
  }

  const data = await res.json();
  const txn = data?.transactions?.[0];
  if (!txn) return { ok: false, reason: 'not_found', raw: data };

  const code = String(txn.processor_response_code ?? '');

  // 'shva' פירושו שהתשובה משב"א טרם חזרה. זו אינה דחייה, ולסמן אותה
  // ככישלון היה מבטל הזמנה ששולמה. מסמנים כזמנית ומנסים שוב.
  if (code === 'shva') return { ok: false, retry: true, reason: 'pending_shva', raw: txn };

  const settled = Number(txn.transtatus ?? 0) === 1;
  if (code !== '000' || !settled) {
    return { ok: false, reason: `status_${code}_${txn.transtatus}`, raw: txn };
  }

  return { ok: true, amount: Number(txn.amount), raw: txn };
}

/**
 * התיעוד מתאר את שדה amount בדוח כ"יחידת המטבע הקטנה" אך הדוגמאות
 * מציגות שקלים שלמים. במקום להמר, מקבלים את שתי הקריאות — הפער
 * ביניהן הוא פי 100 ולכן אין סיכון לבלבול בין סכומים אמיתיים.
 */
export function amountMatches(reported: number, expected: number): boolean {
  const near = (a: number, b: number) => Math.abs(a - b) < 0.02;
  return near(reported, expected) || near(reported / 100, expected);
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
    if (rows.length < 1000) break;
  }

  return all;
}

/** האם העסקה הצליחה בפועל */
export function isApproved(t: ReportTxn): boolean {
  return String(t.processor_response_code ?? '') === '000' && Number(t.transtatus ?? 0) === 1;
}
