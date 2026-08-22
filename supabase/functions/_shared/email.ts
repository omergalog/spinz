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
const COMPANY_EN = 'SPINZ BIKES LTD (אופני סיבוב בערבון מוגבל בע״מ), company no. 517343661, HaTamar 137, Beit Herut, Israel';
const SUPPORT = 'info@spinzbikes.com';

const COLORS: Record<string, string> = {
  mat: 'שחור מט', beige: "בז'", olive: 'ירוק זית',
};
const COLORS_EN: Record<string, string> = {
  mat: 'Matte black', beige: 'Beige', olive: 'Olive green',
};

export type Lang = 'he' | 'en';

/**
 * נוסח המייל בשתי השפות.
 *
 * הלקוח בחר אנגלית באתר וגם עמוד התשלום דיבר איתו אנגלית; מסמך
 * העסקה היחיד שהוא מקבל אינו יכול להגיע בעברית. זכות הביטול נמסרת
 * בו, ומסירה בשפה שהנמען אינו קורא אינה מסירה.
 */
const COPY = {
  he: {
    subject: (r: string) => `ההזמנה שלך ב-SPINZ התקבלה (${r})`,
    thanks: (n: string) => `תודה ${n}, ההזמנה נקלטה`,
    intro: 'התשלום התקבל. נעדכן אותך במייל כשהמשלוח יוצא אליך.',
    size: 'מידה', units: 'יח׳', discount: 'הנחה', paid: 'סה״כ שולם',
    reference: 'מספר אסמכתה', payment: 'אמצעי תשלום',
    card: (l: string) => `כרטיס המסתיים ב-${l}`,
    address: 'כתובת למשלוח',
    rightsTitle: 'זכות הביטול שלך',
    rights: 'ניתן לבטל את העסקה בכל עת עד למסירה, או תוך 14 יום מקבלת האופניים, ולקבל',
    rightsBold: 'החזר מלא ללא דמי ביטול',
    rightsHow: 'ביטול מתבצע', rightsForm: 'בטופס הביטול', rightsOr: 'או במייל',
    returnCond: 'בביטול לאחר קבלת האופניים יש להחזירם במצב המאפשר מכירה חוזרת, ככל הניתן באריזה המקורית. החזרה מרצון היא על חשבון הלקוח, ועל ירידת ערך שנגרמה לאחר המסירה ניתן לחייב בהתאם לדין.',
    fullTerms: 'הפירוט המלא ב', termsLink: 'תקנון ומדיניות הביטול',
    question: 'שאלה? השב למייל הזה ונחזור אליך.',
    company: COMPANY, path: '', dir: 'rtl',
  },
  en: {
    subject: (r: string) => `Your SPINZ order is confirmed (${r})`,
    thanks: (n: string) => `Thank you ${n}, your order is in`,
    intro: 'Your payment went through. We will email you when your bike ships.',
    size: 'Size', units: 'pcs', discount: 'Discount', paid: 'Total paid',
    reference: 'Reference number', payment: 'Payment method',
    card: (l: string) => `Card ending in ${l}`,
    address: 'Shipping address',
    rightsTitle: 'Your right to cancel',
    rights: 'You may cancel at any time before delivery, or within 14 days of receiving the bike, for a',
    rightsBold: 'full refund with no cancellation fee',
    rightsHow: 'To cancel, use', rightsForm: 'the cancellation form', rightsOr: 'or email',
    returnCond: 'If you cancel after receiving the bike, it must be returned in resalable condition, in its original packaging where possible. Return shipping for a voluntary cancellation is at your expense, and a drop in value caused after delivery may be charged as permitted by law.',
    fullTerms: 'Full details in our ', termsLink: 'terms and cancellation policy',
    question: 'Questions? Just reply to this email.',
    company: COMPANY_EN, path: '/en', dir: 'ltr',
  },
} as const;

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
  discount?: number | null;
  couponCode?: string | null;
  lang?: Lang;
};

const ils = (n: number) => `₪${n.toLocaleString('he-IL')}`;
const esc = (s: string) =>
  s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

/**
 * שם המוצר בלי הצבע והמידה.
 *
 * בבסיס הנתונים השם הוא "SPINZ Urban — שחור מט 54", והשורה שמתחתיו
 * ממילא מציגה צבע ומידה. בלי החיתוך אותו מידע הופיע פעמיים.
 * מוצרים שאין בשמם מקף — אביזרים למשל — נשארים כפי שהם.
 */
function baseName(name?: string): string {
  const n = (name ?? 'SPINZ').trim();
  const cut = n.split(/\s[—–-]\s/)[0].trim();
  return cut || n;
}

/**
 * ההנחה שירדה מהסל.
 *
 * הסל שומר את שורות המוצר במחיר המלא, וקוד קופון מוריד רק את הסכום
 * הכולל. בלי השורה הזו הלקוח רואה 1,090 בשורה ו-1 בסיכום, וזה נקרא
 * כטעות בחיוב.
 *
 * המספר נלקח מהעמודה שנשמרה בעת יצירת הסל ולא מהפרש מחושב: ביום
 * שיתווסף משלוח או עיגול, חישוב ההפרש היה מייחס אותם להנחה.
 * ההפרש נשאר כרשת ביטחון להזמנות שנוצרו לפני שהעמודה מולאה.
 */
function discount(o: OrderEmail): number {
  if (o.discount != null) return Math.max(0, Math.round(o.discount));
  const list = o.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  return Math.max(0, Math.round(list - o.total));
}

function rows(items: OrderItem[], c: typeof COPY['he']): string {
  const colors = c.dir === 'rtl' ? COLORS : COLORS_EN;
  return items.map(i => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #E0DCD4;">
        <div style="font-weight:700;color:#1C1C1C;">${esc(baseName(i.product_name))}</div>
        <div style="font-size:13px;color:#6A6862;">
          ${esc(colors[i.color] ?? i.color)}, ${c.size} ${esc(i.size)}${i.quantity > 1 ? `, ${i.quantity} ${c.units}` : ''}
        </div>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #E0DCD4;text-align:left;white-space:nowrap;color:#1C1C1C;">
        ${ils(i.unit_price * i.quantity)}
      </td>
    </tr>`).join('');
}

function html(o: OrderEmail): string {
  const c = COPY[o.lang === 'en' ? 'en' : 'he'];
  return `<div dir="${c.dir}" style="font-family:Arial,Helvetica,sans-serif;background:#F5F2EC;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E0DCD4;border-radius:10px;overflow:hidden;">

    <div style="background:#1C1C1C;padding:26px 28px;text-align:center;">
      <div style="color:#C9A870;font-size:22px;font-weight:800;letter-spacing:.18em;">SPINZ</div>
    </div>

    <div style="padding:28px;">
      <h1 style="margin:0 0 6px;font-size:21px;color:#1C1C1C;">${esc(c.thanks(o.name))}</h1>
      <p style="margin:0 0 22px;font-size:14px;color:#4A4845;line-height:1.7;">
        ${c.intro}
      </p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${rows(o.items, c)}
        ${discount(o) > 0 ? `
        <tr>
          <td style="padding:12px 0 0;color:#4A4845;">${c.discount}${o.couponCode ? ` <span style="color:#6A6862;">(${esc(o.couponCode.toUpperCase())})</span>` : ''}</td>
          <td style="padding:12px 0 0;text-align:left;white-space:nowrap;color:#4A4845;">-${ils(discount(o))}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:14px 0;font-weight:800;color:#1C1C1C;">${c.paid}</td>
          <td style="padding:14px 0;text-align:left;font-weight:800;font-size:17px;color:#C9A870;">${ils(o.total)}</td>
        </tr>
      </table>

      <div style="background:#F5F2EC;border-radius:8px;padding:14px 16px;margin:18px 0;font-size:13px;color:#4A4845;line-height:1.9;">
        <div><strong>${c.reference}:</strong> <span style="direction:ltr;display:inline-block;">${esc(o.reference)}</span></div>
        ${o.last4 ? `<div><strong>${c.payment}:</strong> ${esc(c.card(o.last4))}</div>` : ''}
        ${o.address ? `<div><strong>${c.address}:</strong> ${esc(o.address)}</div>` : ''}
      </div>

      <h2 style="font-size:15px;color:#1C1C1C;margin:24px 0 8px;">${c.rightsTitle}</h2>
      <p style="margin:0;font-size:13px;color:#4A4845;line-height:1.8;">
        ${c.rights} <strong>${c.rightsBold}</strong>. ${c.rightsHow}
        <a href="${SITE}${c.path}/cancel-order" style="color:#8A6D3B;">${c.rightsForm}</a>
        ${c.rightsOr} ${SUPPORT}.
      </p>
      <p style="margin:8px 0 0;font-size:13px;color:#4A4845;line-height:1.8;">
        ${c.returnCond}
        ${c.fullTerms}<a href="${SITE}${c.path}/regulations" style="color:#8A6D3B;">${c.termsLink}</a>.
      </p>

      <p style="margin:24px 0 0;font-size:13px;color:#4A4845;line-height:1.8;">
        ${c.question}
      </p>
    </div>

    <div style="background:#F5F2EC;padding:16px 28px;font-size:11px;color:#9A9690;line-height:1.7;border-top:1px solid #E0DCD4;">
      ${esc(c.company)}
    </div>
  </div>
</div>`;
}

function text(o: OrderEmail): string {
  const c = COPY[o.lang === 'en' ? 'en' : 'he'];
  const colors = c.dir === 'rtl' ? COLORS : COLORS_EN;
  const lines = o.items.map(i =>
    `- ${baseName(i.product_name)}, ${colors[i.color] ?? i.color}, ${c.size} ${i.size}` +
    `${i.quantity > 1 ? `, ${i.quantity} ${c.units}` : ''}: ${ils(i.unit_price * i.quantity)}`);

  const off = discount(o);

  return [
    c.thanks(o.name) + '.',
    '',
    c.intro,
    '',
    ...lines,
    off > 0 ? `${c.discount}${o.couponCode ? ` (${o.couponCode.toUpperCase()})` : ''}: -${ils(off)}` : '',
    `${c.paid}: ${ils(o.total)}`,
    '',
    `${c.reference}: ${o.reference}`,
    o.last4 ? c.card(o.last4) : '',
    o.address ? `${c.address}: ${o.address}` : '',
    '',
    `${c.rightsTitle}: ${c.rights} ${c.rightsBold}.`,
    c.returnCond,
    `${SITE}${c.path}/cancel-order  |  ${SUPPORT}  |  ${SITE}${c.path}/regulations`,
    '',
    c.company,
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
        subject: COPY[o.lang === 'en' ? 'en' : 'he'].subject(o.reference),
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
export async function confirmOrderOnce(db: Db, sessionId: string, lang: Lang = 'he'): Promise<string | null> {
  const { data: claimed } = await db.rpc('claim_confirmation_email', { p_session_id: sessionId });
  if (!claimed) return null;

  const { data: s } = await db.from('checkout_sessions')
    .select('customer_email, customer_name, customer_notes, items, total_price, card_last4, discount, coupon_code')
    .eq('id', sessionId).maybeSingle();

  if (!s) return 'הסל לא נמצא';

  const err = await sendOrderConfirmation({
    to: s.customer_email ?? '',
    name: s.customer_name ?? '',
    items: s.items ?? [],
    total: s.total_price,
    last4: s.card_last4,
    address: s.customer_notes,
    discount: s.discount,
    couponCode: s.coupon_code,
    lang,
    reference: sessionId.slice(0, 8).toUpperCase(),
  });

  if (err) {
    await db.from('checkout_sessions')
      .update({ confirmation_sent_at: null }).eq('id', sessionId);
  }
  return err;
}
