/**
 * מייל אישור הזמנה.
 *
 * זהו המסמך היחיד שהלקוח מקבל אחרי שחויב, ולכן הוא נושא גם תפקיד
 * משפטי: חוק הגנת הצרכן מחייב למסור את זכות הביטול בכתב. הוא נשלח
 * מהשרת ולא מהדפדפן — לקוח שסגר את החלון אחרי החיוב עדיין יקבל אותו.
 */

const RESEND_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM = Deno.env.get('ORDER_EMAIL_FROM') ?? 'SPINZ <info@spinzbikes.com>';
const BCC = Deno.env.get('ORDER_EMAIL_BCC') ?? 'info@spinzbikes.com';
const SITE = Deno.env.get('SITE_URL') ?? 'https://spinzbikes.com';

const COMPANY = 'אופני סיבוב בערבון מוגבל בע״מ (SPINZ BIKES LTD), ח.פ. 517343661, התמר 137, בית חרות';
const SUPPORT = 'info@spinzbikes.com';

const COLORS: Record<string, string> = {
  mat: 'שחור מט', beige: "בז'", olive: 'ירוק זית',
};

export type OrderItem = {
  product_name?: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
};

export type OrderEmail = {
  to: string;
  name: string;
  items: OrderItem[];
  total: number;
  last4?: string | null;
  reference: string;
  address?: string | null;
};

const ils = (n: number) => `₪${n.toLocaleString('he-IL')}`;
const esc = (s: string) =>
  s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

function rows(items: OrderItem[]): string {
  return items.map(i => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #E0DCD4;">
        <div style="font-weight:700;color:#1C1C1C;">${esc(i.product_name || 'SPINZ')}</div>
        <div style="font-size:13px;color:#6A6862;">
          ${esc(COLORS[i.color] ?? i.color)} · מידה ${esc(i.size)}${i.quantity > 1 ? ` · ${i.quantity} יח׳` : ''}
        </div>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #E0DCD4;text-align:left;white-space:nowrap;color:#1C1C1C;">
        ${ils(i.unit_price * i.quantity)}
      </td>
    </tr>`).join('');
}

function html(o: OrderEmail): string {
  return `<div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;background:#F5F2EC;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E0DCD4;border-radius:10px;overflow:hidden;">

    <div style="background:#1C1C1C;padding:24px 28px;">
      <!-- הלוגו מוגש מהאתר ולא מוטמע במייל: קובץ מוטמע מגדיל את
           ההודעה ומגדיל את הסיכוי שתסומן כספאם. הרוחב מוגבל ב-CSS
           כי תוכנות דואר מתעלמות מגודל הקובץ עצמו. -->
      <img src="${SITE}/assets/logo-email.png" alt="SPINZ"
           width="150" style="width:150px;max-width:60%;height:auto;display:block;border:0;">
    </div>

    <div style="padding:28px;">
      <h1 style="margin:0 0 6px;font-size:21px;color:#1C1C1C;">תודה, ${esc(o.name)} — ההזמנה נקלטה</h1>
      <p style="margin:0 0 22px;font-size:14px;color:#4A4845;line-height:1.7;">
        התשלום התקבל בהצלחה. נעדכן אותך במייל כשהאופניים יוצאים לדרך.
      </p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${rows(o.items)}
        <tr>
          <td style="padding:14px 0;font-weight:800;color:#1C1C1C;">סה״כ שולם</td>
          <td style="padding:14px 0;text-align:left;font-weight:800;font-size:17px;color:#C9A870;">${ils(o.total)}</td>
        </tr>
      </table>

      <div style="background:#F5F2EC;border-radius:8px;padding:14px 16px;margin:18px 0;font-size:13px;color:#4A4845;line-height:1.9;">
        <div><strong>מספר אסמכתה:</strong> <span style="direction:ltr;display:inline-block;">${esc(o.reference)}</span></div>
        ${o.last4 ? `<div><strong>אמצעי תשלום:</strong> כרטיס המסתיים ב-${esc(o.last4)}</div>` : ''}
        ${o.address ? `<div><strong>כתובת למשלוח:</strong> ${esc(o.address)}</div>` : ''}
      </div>

      <h2 style="font-size:15px;color:#1C1C1C;margin:24px 0 8px;">זכות הביטול שלך</h2>
      <p style="margin:0;font-size:13px;color:#4A4845;line-height:1.8;">
        ניתן לבטל את העסקה בכל עת עד למסירה, או תוך 14 יום מקבלת האופניים,
        ולקבל <strong>החזר מלא ללא דמי ביטול</strong>. ביטול מתבצע
        <a href="${SITE}/cancel-order" style="color:#8A6D3B;">בטופס הביטול</a>
        או במייל ${SUPPORT}.
        הפירוט המלא ב<a href="${SITE}/presale-terms" style="color:#8A6D3B;">תנאי המכירה המוקדמת</a>.
      </p>

      <p style="margin:24px 0 0;font-size:13px;color:#4A4845;line-height:1.8;">
        שאלה? השב למייל הזה ונחזור אליך.
      </p>
    </div>

    <div style="background:#F5F2EC;padding:16px 28px;font-size:11px;color:#9A9690;line-height:1.7;border-top:1px solid #E0DCD4;">
      ${esc(COMPANY)}
    </div>
  </div>
</div>`;
}

function text(o: OrderEmail): string {
  const lines = o.items.map(i =>
    `- ${i.product_name || 'SPINZ'} · ${COLORS[i.color] ?? i.color} · מידה ${i.size}` +
    `${i.quantity > 1 ? ` · ${i.quantity} יח׳` : ''} — ${ils(i.unit_price * i.quantity)}`);

  return [
    `תודה ${o.name} — ההזמנה נקלטה.`,
    '',
    'התשלום התקבל בהצלחה. נעדכן אותך כשהאופניים יוצאים לדרך.',
    '',
    ...lines,
    `סה״כ שולם: ${ils(o.total)}`,
    '',
    `מספר אסמכתה: ${o.reference}`,
    o.last4 ? `כרטיס המסתיים ב-${o.last4}` : '',
    o.address ? `כתובת למשלוח: ${o.address}` : '',
    '',
    'זכות ביטול: עד המסירה או תוך 14 יום מקבלת האופניים, החזר מלא ללא דמי ביטול.',
    `${SITE}/cancel-order · ${SUPPORT}`,
    '',
    COMPANY,
  ].filter(Boolean).join('\n');
}

/**
 * שולח, ומחזיר את סיבת הכישלון במקום לזרוק.
 *
 * כישלון במייל אסור שיפיל את יצירת ההזמנה — הכסף כבר נגבה. הוא נרשם
 * ביומן וההזמנה נשארת תקינה.
 */
export async function sendOrderConfirmation(o: OrderEmail): Promise<string | null> {
  if (!RESEND_KEY) return 'RESEND_API_KEY חסר';
  if (!o.to) return 'ללקוח אין כתובת מייל';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [o.to],
        bcc: BCC ? [BCC] : undefined,
        reply_to: SUPPORT,
        subject: `SPINZ — ההזמנה שלך התקבלה (${o.reference})`,
        html: html(o),
        text: text(o),
      }),
    });

    if (!res.ok) return `resend_${res.status}: ${(await res.text()).slice(0, 200)}`;
    return null;
  } catch (e) {
    return `resend_exception: ${e}`;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Db = { rpc: (fn: string, args: unknown) => Promise<{ data: any; error: any }>;
            from: (t: string) => any };

/**
 * שולח אישור פעם אחת בלבד.
 *
 * טרנזילה שולחת גם notify וגם success, וההשוואה היומית עשויה לגעת
 * באותה הזמנה שוב. הנעילה נעשית בבסיס הנתונים ולא כאן, כי שתי
 * הפעלות מקבילות של הפונקציה לא רואות זו את זו.
 *
 * אם השליחה נכשלה, הסימון מוסר כדי שניסיון הבא יוכל לשלוח. עדיף
 * מייל כפול על פני לקוח ששילם ולא קיבל דבר.
 */
export async function confirmOrderOnce(db: Db, sessionId: string): Promise<string | null> {
  const { data: claimed } = await db.rpc('claim_confirmation_email', { p_session_id: sessionId });
  if (!claimed) return null;

  const { data: s } = await db.from('checkout_sessions')
    .select('customer_email, customer_name, customer_notes, items, total_price, card_last4')
    .eq('id', sessionId).maybeSingle();

  if (!s) return 'הסל לא נמצא';

  const err = await sendOrderConfirmation({
    to: s.customer_email ?? '',
    name: s.customer_name ?? '',
    items: s.items ?? [],
    total: s.total_price,
    last4: s.card_last4,
    address: s.customer_notes,
    reference: sessionId.slice(0, 8).toUpperCase(),
  });

  if (err) {
    await db.from('checkout_sessions')
      .update({ confirmation_sent_at: null }).eq('id', sessionId);
  }
  return err;
}
