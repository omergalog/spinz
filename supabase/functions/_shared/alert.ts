/**
 * התראה פנימית ל-info@ על אירוע כספי שדורש טיפול.
 *
 * ההתראה אינה הטיפול עצמו: כל אירוע נשמר כשורה ב-payment_issues עם
 * בעל טיפול, והאדמין מציג אותו עד שנסגר. המייל רק מוודא שמישהו יודע.
 * כישלון בשליחה לא מפיל את מה שקרא לה.
 */

// נקראים בכל שליחה ולא בטעינה: מפתח חסר או מוחלף מתגלה בשליחה הבאה
const env = (k: string, d = '') => Deno.env.get(k) ?? d;
const ADMIN = 'https://admin.spinzbikes.com/payments';

export const ISSUE_LABEL: Record<string, string> = {
  unresolved_attempt: 'תיק בירור: ניסיון תשלום לא פתור',
  second_charge_same_session: 'חיוב שני על אותו סל',
  second_charge_same_purchase: 'חיוב נוסף על רכישה ששולמה',
  paid_no_stock: 'הלקוח חויב ואין מלאי',
  late_charge_closed_session: 'חיוב על ניסיון שנסגר באסמכתה',
  unmatched: 'עסקה בטרנזילה בלי סל מזוהה',
};

/** סיבת finalize → סוג החריגה שנרשמה */
export const REASON_KIND: Record<string, string> = {
  SECOND_CHARGE_SAME_SESSION: 'second_charge_same_session',
  SECOND_CHARGE_SAME_PURCHASE: 'second_charge_same_purchase',
  PAID_BUT_OUT_OF_STOCK: 'paid_no_stock',
  CHARGED_AFTER_FINAL: 'late_charge_closed_session',
};

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export async function sendAlert(subject: string, lines: Array<[string, unknown]>): Promise<string | null> {
  const RESEND_KEY = env('RESEND_API_KEY');
  if (!RESEND_KEY) return 'RESEND_API_KEY missing';
  const rows = lines.map(([k, v]) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`).join('');
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:14px">
    <p><b>${esc(subject)}</b></p>
    <table>${rows}</table>
    <p>לטיפול ולמעקב: <a href="${ADMIN}">${ADMIN}</a></p>
    <p style="color:#888;font-size:12px">אין זיכוי אוטומטי. כל פעולה נרשמת בתיק באדמין.</p></div>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env('ORDER_EMAIL_FROM', 'SPINZ <info@spinzbikes.com>'), to: [env('ALERT_EMAIL_TO', 'info@spinzbikes.com')], subject: `[SPINZ תשלומים] ${subject}`, html }),
    });
    return res.ok ? null : `resend ${res.status}`;
  } catch (e) {
    return String(e);
  }
}

/** התראה על שורת payment_issues שנוצרה עכשיו. */
export function alertIssue(kind: string, f: { session?: string | null; index?: number | null; amount?: unknown; note?: string }) {
  return sendAlert(ISSUE_LABEL[kind] ?? kind, [
    ['סוג', ISSUE_LABEL[kind] ?? kind],
    ['סל', f.session ? String(f.session).slice(0, 8).toUpperCase() : '—'],
    ['אינדקס עסקה', f.index ?? '—'],
    ['סכום', f.amount ?? '—'],
    ['הערה', f.note ?? ''],
  ]);
}
