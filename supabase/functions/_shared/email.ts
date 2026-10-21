/**
 * מייל אישור הזמנה.
 *
 * זהו המסמך היחיד שהלקוח מקבל אחרי שחויב, ולכן הוא נושא גם תפקיד
 * משפטי: חוק הגנת הצרכן מחייב למסור את זכות הביטול בכתב. הוא נשלח
 * מהשרת ולא מהדפדפן — לקוח שסגר את החלון אחרי החיוב עדיין יקבל אותו.
 */

import { isPickup } from './delivery.ts';

const RESEND_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM = Deno.env.get('ORDER_EMAIL_FROM') ?? 'SPINZ <info@spinzbikes.com>';
const BCC = Deno.env.get('ORDER_EMAIL_BCC') ?? 'info@spinzbikes.com';
const SITE = Deno.env.get('SITE_URL') ?? 'https://spinzbikes.com';

const COMPANY = 'אופני סיבוב בערבון מוגבל בע״מ (SPINZ BIKES LTD), ח.פ. 517343661, התמר 137, בית חרות · טלפון 052-756-5262 · info@spinzbikes.com';
const COMPANY_EN = 'SPINZ BIKES LTD (אופני סיבוב בערבון מוגבל בע״מ), company no. 517343661, HaTamar 137, Beit Herut, Israel · Tel. +972-52-756-5262 · info@spinzbikes.com';

/**
 * היצרן, כפי שהוא מופיע בחשבונית, בשטר המטען ובפרופורמה. מייל האישור
 * משמש גם כמסמך הגילוי שאחרי עסקה מרחוק, ולכן נושא את שם היצרן.
 *
 * ארץ הייצור מנוסחת כ"מיוצר בסין" ולא כאישור רשמי: אין מסמך שכותב
 * זאת במפורש. ואין כאן שום אמירה על בדיקה או עמידה בתקן — אין עדיין
 * דוח בדיקה או תעודה לאופניים.
 */
const MANUFACTURER = 'GUANGZHOU KESPOR BICYCLE CO.LTD';
const MANUFACTURER_ADDRESS = '2ND FLOOR, BUILDING 2, NO. 11 HUAFU ROAD, TIESHAN VILLAGE, HUASHAN TOWN, HUADU DISTRICT, GUANGZHOU, GUANGDONG, CHINA';
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
    // הפתיחה תלויה באופן הקבלה ובשאלה אם האופניים כבר בארץ. "נעדכן
    // כשהמשלוח יוצא" הבטיח משלוח גם למי שבחר איסוף, ומשלוח קרוב גם
    // למי שקנה בפרי-סייל לפני שהמכולה הגיעה.
    intro: {
      ship: 'התשלום התקבל. נעדכן אותך כשההזמנה יוצאת אליך.',
      pickup: 'התשלום התקבל. ניצור איתך קשר לתיאום מועד האיסוף מכפר ויתקין.',
    },
    pickupLabel: 'אופן קבלה',
    size: 'מידה', units: 'יח׳', discount: 'הנחה', paid: 'סה״כ שולם',
    reference: 'מספר אסמכתה', payment: 'אמצעי תשלום',
    card: (l: string) => `כרטיס המסתיים ב-${l}`,
    installmentsLabel: 'תשלומים', installments: (n: number) => `${n} תשלומים ללא ריבית`,
    address: 'כתובת למשלוח',
    phone: 'טלפון לתיאום',
    rightsTitle: 'זכות הביטול שלך',
    rights: 'ניתן לבטל את העסקה בכל עת עד למסירה, או תוך 14 יום מקבלת ההזמנה, ולקבל',
    rightsBold: 'החזר מלא ללא דמי ביטול',
    rightsHow: 'ביטול מתבצע', rightsForm: 'בטופס הביטול', rightsOr: 'או במייל',
    returnCond: 'בביטול לאחר קבלת ההזמנה יש להחזיר את המוצרים במצב המאפשר מכירה חוזרת, ככל הניתן באריזה המקורית. החזרה מרצון היא על חשבון הלקוח, ועל ירידת ערך שנגרמה לאחר המסירה ניתן לחייב בהתאם לדין.',
    fullTerms: 'הפירוט המלא ב', termsLink: 'תקנון ומדיניות הביטול',
    // תקציר מהתקנון (סעיף 3). התנאים המלאים בקישור.
    productTitle: 'יצרן ואחריות',
    maker: 'יצרן', origin: 'מיוצר בסין',
    warranty: [
      'שלדה: 5 שנים ממועד המסירה, כנגד פגמי ייצור, סדקים בריתוכים או כשל מבני.',
      'מזלג ורכיבים קשיחים שאינם מתכלים (כידון, מוט מושב, זרועות דיווש): 12 חודשים.',
      'חלקים מתכלים (צמיגים, פנימיות, רפידות בלם, שרשרת וגלגלי שיניים) אינם מכוסים, למעט פגם ייצור מובהק שהתגלה בתוך 30 ימים מהמסירה, לפני שימוש.',
      'האחריות מותנית בהצגת החשבונית.',
    ],
    warrantyTerms: 'תנאי האחריות המלאים ב',
    question: 'שאלה? השב למייל הזה ונחזור אליך.',
    company: COMPANY, path: '', dir: 'rtl',
  },
  en: {
    subject: (r: string) => `Your SPINZ order is confirmed (${r})`,
    thanks: (n: string) => `Thank you ${n}, your order is in`,
    intro: {
      ship: 'Your payment went through. We will let you know when your order ships.',
      pickup: 'Your payment went through. We will contact you to arrange a pickup time in Kfar Vitkin.',
    },
    pickupLabel: 'Delivery',
    size: 'Size', units: 'pcs', discount: 'Discount', paid: 'Total paid',
    reference: 'Reference number', payment: 'Payment method',
    card: (l: string) => `Card ending in ${l}`,
    installmentsLabel: 'Installments', installments: (n: number) => `${n} interest-free installments`,
    address: 'Shipping address',
    phone: 'Contact phone',
    rightsTitle: 'Your right to cancel',
    rights: 'You may cancel at any time before delivery, or within 14 days of receiving your order, for a',
    rightsBold: 'full refund with no cancellation fee',
    rightsHow: 'To cancel, use', rightsForm: 'the cancellation form', rightsOr: 'or email',
    returnCond: 'If you cancel after receiving your order, the items must be returned in resalable condition, in its original packaging where possible. Return shipping for a voluntary cancellation is at your expense, and a drop in value caused after delivery may be charged as permitted by law.',
    fullTerms: 'Full details in our ', termsLink: 'terms and cancellation policy',
    productTitle: 'Manufacturer and warranty',
    maker: 'Manufacturer', origin: 'Made in China',
    warranty: [
      'Frame: 5 years from delivery, against manufacturing defects, weld cracks or structural failure.',
      'Fork and non-wearing rigid components (handlebar, seat post, crank arms): 12 months.',
      'Wear parts (tyres, tubes, brake pads, chain and cogs) are not covered, except for a clear manufacturing defect found within 30 days of delivery, before use.',
      'The warranty requires the purchase invoice.',
    ],
    warrantyTerms: 'Full warranty terms in our ',
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
  /** מספר התשלומים הכולל, כשהעסקה נפרסה. 1 או חסר = תשלום אחד. */
  installments?: number | null;
  reference: string;
  address?: string | null;
  /** הטלפון שהלקוח מסר — כדי שיראה שהוא נכון, כי דרכו מתאמים מסירה. */
  phone?: string | null;
  discount?: number | null;
  couponCode?: string | null;
  lang?: Lang;
  /** חודש הגעת האופניים, כשההזמנה בפרי-סייל. בלעדיו — האופניים כבר בארץ. */
  arrival?: string | null;
  /** יש בהזמנה אופניים. היצרן ותנאי האחריות שייכים להם, לא לחולצות. */
  bikes?: boolean;
};

/**
 * פסקת הפתיחה. בהזמנה מוקדמת אין פסקה: הנוסח "האופניים מגיעים ארצה ב...
 * כשיגיעו נרכיב ונבדוק..." הוסר לבקשת עומר (20.10.2026), בלי חלופה עד
 * שיאשר נוסח אחר.
 */
function introOf(o: OrderEmail): string | null {
  const c = COPY[o.lang === 'en' ? 'en' : 'he'];
  if (o.arrival) return null;
  return isPickup(o.address) ? c.intro.pickup : c.intro.ship;
}

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
      <h1 style="margin:0 0 ${introOf(o) ? '6px' : '22px'};font-size:21px;color:#1C1C1C;">${esc(c.thanks(o.name))}</h1>
      ${introOf(o) ? `<p style="margin:0 0 22px;font-size:14px;color:#4A4845;line-height:1.7;">
        ${esc(introOf(o)!)}
      </p>` : ''}

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
        ${o.installments && o.installments > 1 ? `<div><strong>${c.installmentsLabel}:</strong> ${esc(c.installments(o.installments))}</div>` : ''}
        ${o.address ? `<div><strong>${isPickup(o.address) ? c.pickupLabel : c.address}:</strong> ${esc(o.address)}</div>` : ''}
        ${o.phone ? `<div><strong>${c.phone}:</strong> <span style="direction:ltr;display:inline-block;">${esc(o.phone)}</span></div>` : ''}
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

      ${o.bikes ? `
      <h2 style="font-size:15px;color:#1C1C1C;margin:24px 0 8px;">${c.productTitle}</h2>
      <p style="margin:0 0 8px;font-size:13px;color:#4A4845;line-height:1.8;">
        <strong>${c.maker}:</strong> <span dir="ltr">${MANUFACTURER}, ${MANUFACTURER_ADDRESS}</span>. ${c.origin}.
      </p>
      <ul style="margin:0;padding-inline-start:18px;font-size:13px;color:#4A4845;line-height:1.8;">
        ${c.warranty.map(w => `<li>${w}</li>`).join('')}
      </ul>
      <p style="margin:8px 0 0;font-size:13px;color:#4A4845;line-height:1.8;">
        ${c.warrantyTerms}<a href="${SITE}${c.path}/regulations" style="color:#8A6D3B;">${c.termsLink}</a>.
      </p>` : ''}

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
    ...(introOf(o) ? [introOf(o)!, ''] : []),
    ...lines,
    off > 0 ? `${c.discount}${o.couponCode ? ` (${o.couponCode.toUpperCase()})` : ''}: -${ils(off)}` : '',
    `${c.paid}: ${ils(o.total)}`,
    '',
    `${c.reference}: ${o.reference}`,
    o.last4 ? c.card(o.last4) : '',
    o.installments && o.installments > 1 ? `${c.installmentsLabel}: ${c.installments(o.installments)}` : '',
    o.address ? `${isPickup(o.address) ? c.pickupLabel : c.address}: ${o.address}` : '',
    o.phone ? `${c.phone}: ${o.phone}` : '',
    '',
    `${c.rightsTitle}: ${c.rights} ${c.rightsBold}.`,
    c.returnCond,
    `${SITE}${c.path}/cancel-order  |  ${SUPPORT}  |  ${SITE}${c.path}/regulations`,
    '',
    ...(o.bikes ? [
      `${c.productTitle}:`,
      `${c.maker}: ${MANUFACTURER}, ${MANUFACTURER_ADDRESS}. ${c.origin}.`,
      ...c.warranty.map(w => `- ${w}`),
      `${c.warrantyTerms}${c.termsLink}: ${SITE}${c.path}/regulations`,
      '',
    ] : []),
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
    // '*' ולא רשימת עמודות: unit_coupons/unit_discount נוספו ב-SETUP-unit-coupons.sql,
    // ורשימה מפורשת הייתה מפילה את כל מיילי האישור עד שה-SQL רץ.
    .select('*')
    .eq('id', sessionId).maybeSingle();

  if (!s) return 'הסל לא נמצא';

  // פרי-סייל פעיל והזמנה שיש בה אופניים: האופניים עוד לא בארץ, והמייל
  // אומר מתי הם מגיעים. מרצ'נדייז לבד לא תלוי במכולה.
  const hasBikes = (s.items ?? []).some((i: { category?: string }) => (i.category ?? 'bike') !== 'merch');
  const { data: ps } = await db.from('site_settings')
    .select('presale_active, arrival_label').eq('id', 1).maybeSingle();
  const arrival = hasBikes && ps?.presale_active && ps?.arrival_label ? String(ps.arrival_label) : null;

  // מספר התשלומים מגיע רק בהודעת ה-notify של טרנזילה: npay הוא מספר
  // התשלומים אחרי הראשון (בעסקה של 12 תשלומים נשלח npay=11). נקרא מכאן
  // ולא מפרמטר, כדי שגם מייל שנשלח מההתאמה הלילית יכלול אותו.
  const { data: ev } = await db.from('payment_events')
    .select('payload').eq('session_id', sessionId).eq('source', 'notify')
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  const npay = Number((ev?.payload as Record<string, string> | null)?.npay ?? 0);
  const installments = Number.isInteger(npay) && npay > 0 && npay < 36 ? npay + 1 : null;

  const err = await sendOrderConfirmation({
    to: s.customer_email ?? '',
    name: s.customer_name ?? '',
    items: ((s.items ?? []) as Array<OrderItem & { list_price?: number }>)
      .map(i => (i.list_price ? { ...i, unit_price: i.list_price } : i)),
    total: s.total_price,
    last4: s.card_last4,
    installments,
    address: s.customer_notes,
    phone: s.customer_phone,
    // זוג עם קוד שמור בסל במחיר שאחרי הקוד. במייל הוא מוצג במחירו
    // לפני הקוד, וההנחה מופיעה בשורת "הנחה" יחד עם קוד ההזמנה — כך
    // השורות פחות ההנחה שוות בדיוק למה ששולם.
    discount: (s.discount ?? 0) + (s.unit_discount ?? 0),
    couponCode: [
      ...new Set([
        ...((s.unit_coupons ?? []) as { code: string }[]).map(u => u.code),
        ...(s.coupon_code ? [s.coupon_code] : []),
      ]),
    ].join(', ') || null,
    lang,
    reference: sessionId.slice(0, 8).toUpperCase(),
    arrival,
    bikes: hasBikes,
  });

  if (err) {
    await db.from('checkout_sessions')
      .update({ confirmation_sent_at: null }).eq('id', sessionId);
  }
  return err;
}

/* ========================================================================
 *  מייל ביטול הזמנה
 *
 *  טרנזילה שולחת מסמך זיכוי, אבל נוסח המייל שלה זהה לכל סוגי המסמכים
 *  ונפתח ב"תודה על רכישתך". לקוח שביטל מקבל הודעה שנראית כמו רכישה
 *  נוספת, ובלי שום מידע על מתי הכסף חוזר.
 *
 *  ההודעה האנושית מגיעה מכאן. המסמך החשבונאי נשאר שלהם.
 * ===================================================================== */

export type CancelEmail = {
  to: string;
  name: string;
  productName?: string | null;
  color?: string | null;
  size?: string | null;
  quantity?: number | null;
  total: number;
  last4?: string | null;
  reference: string;
  lang?: Lang;
};

const CANCEL = {
  he: {
    subject: (r: string) => `ההזמנה שלך ב-SPINZ בוטלה (${r})`,
    title: (n: string) => `${n}, ההזמנה בוטלה`,
    intro: 'ביטלנו את ההזמנה, ואנחנו מחזירים לך את מלוא הסכום.',
    refundTitle: 'מתי הכסף חוזר',
    refundBody: (amount: string, card: string) =>
      `סכום של ${amount} יוחזר ${card}. ההחזר מבוצע מיד מצדנו, אבל חברות האשראי `
      + 'מציגות אותו בדרך כלל בתוך 3 עד 10 ימי עסקים, ולעיתים רק בחיוב החודשי הבא. '
      + 'זה תקין, והכסף בדרך.',
    toCard: (l: string) => `לכרטיס המסתיים ב-${l}`,
    toSame: 'לאמצעי התשלום שבו שילמת',
    docNote: 'בנפרד תקבל גם מסמך זיכוי מחברת הסליקה. זו אסמכתא חשבונאית בלבד, ולא חיוב נוסף.',
    reference: 'מספר אסמכתה',
    question: 'שאלה? השב למייל הזה ונחזור אליך.',
    company: COMPANY, dir: 'rtl' as const,
    units: 'יח׳', size: 'מידה',
  },
  en: {
    subject: (r: string) => `Your SPINZ order was cancelled (${r})`,
    title: (n: string) => `${n}, your order was cancelled`,
    intro: 'We have cancelled the order and are refunding the full amount.',
    refundTitle: 'When the money comes back',
    refundBody: (amount: string, card: string) =>
      `${amount} will be refunded ${card}. We issue the refund immediately, but card `
      + 'issuers usually show it within 3 to 10 business days, and sometimes only on your '
      + 'next monthly statement. That is normal, and the money is on its way.',
    toCard: (l: string) => `to the card ending in ${l}`,
    toSame: 'to the payment method you used',
    docNote: 'You will also receive a separate credit note from our payment provider. '
      + 'It is an accounting record only, not another charge.',
    reference: 'Reference number',
    question: 'Questions? Just reply to this email.',
    company: COMPANY_EN, dir: 'ltr' as const,
    units: 'pcs', size: 'Size',
  },
};

function cancelHtml(o: CancelEmail): string {
  const c = CANCEL[o.lang === 'en' ? 'en' : 'he'];
  const colors = c.dir === 'rtl' ? COLORS : COLORS_EN;
  const amount = ils(o.total);
  const card = o.last4 ? c.toCard(o.last4) : c.toSame;
  const variant = [o.color ? (colors[o.color] ?? o.color) : '', o.size ? `${c.size} ${o.size}` : '']
    .filter(Boolean).join(', ');

  return `<div dir="${c.dir}" style="font-family:Arial,Helvetica,sans-serif;background:#F5F2EC;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E0DCD4;border-radius:10px;overflow:hidden;">

    <div style="background:#1C1C1C;padding:26px 28px;text-align:center;">
      <div style="color:#C9A870;font-size:22px;font-weight:800;letter-spacing:.18em;">SPINZ</div>
    </div>

    <div style="padding:28px;">
      <h1 style="margin:0 0 6px;font-size:21px;color:#1C1C1C;">${esc(c.title(o.name))}</h1>
      <p style="margin:0 0 22px;font-size:14px;color:#4A4845;line-height:1.7;">${c.intro}</p>

      ${o.productName ? `
      <div style="border-top:1px solid #E0DCD4;border-bottom:1px solid #E0DCD4;padding:14px 0;margin-bottom:20px;font-size:14px;">
        <div style="font-weight:700;color:#1C1C1C;">${esc(baseName(o.productName))}</div>
        <div style="font-size:13px;color:#6A6862;">${esc(variant)}${
          (o.quantity ?? 1) > 1 ? `, ${o.quantity} ${c.units}` : ''}</div>
      </div>` : ''}

      <h2 style="font-size:15px;color:#1C1C1C;margin:0 0 8px;">${c.refundTitle}</h2>
      <p style="margin:0 0 18px;font-size:13px;color:#4A4845;line-height:1.8;">
        ${c.refundBody(`<strong>${amount}</strong>`, card)}
      </p>

      <div style="background:#F5F2EC;border-radius:8px;padding:14px 16px;font-size:13px;color:#4A4845;line-height:1.9;">
        <div><strong>${c.reference}:</strong> <span style="direction:ltr;display:inline-block;">${esc(o.reference)}</span></div>
      </div>

      <p style="margin:18px 0 0;font-size:12.5px;color:#6A6862;line-height:1.8;">${c.docNote}</p>

      <p style="margin:22px 0 0;font-size:13px;color:#4A4845;line-height:1.8;">${c.question}</p>
    </div>

    <div style="background:#F5F2EC;padding:16px 28px;font-size:11px;color:#9A9690;line-height:1.7;border-top:1px solid #E0DCD4;">
      ${esc(c.company)}
    </div>
  </div>
</div>`;
}

function cancelText(o: CancelEmail): string {
  const c = CANCEL[o.lang === 'en' ? 'en' : 'he'];
  const card = o.last4 ? c.toCard(o.last4) : c.toSame;
  return [
    c.title(o.name) + '.', '', c.intro, '',
    c.refundTitle + ': ' + c.refundBody(ils(o.total), card), '',
    `${c.reference}: ${o.reference}`, '',
    c.docNote, '', c.company,
  ].filter(Boolean).join('\n');
}

export async function sendCancellationEmail(o: CancelEmail): Promise<string | null> {
  if (!RESEND_KEY) return 'RESEND_API_KEY חסר';
  if (!o.to) return 'ללקוח אין כתובת מייל';

  const c = CANCEL[o.lang === 'en' ? 'en' : 'he'];
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to: [o.to], bcc: BCC ? [BCC] : undefined, reply_to: SUPPORT,
        subject: c.subject(o.reference), html: cancelHtml(o), text: cancelText(o),
      }),
    });
    if (!res.ok) return `resend_${res.status}: ${(await res.text()).slice(0, 200)}`;
    return null;
  } catch (e) {
    return `resend_exception: ${e}`;
  }
}


/* ==========================================================================
 *  היחידה מוכנה למסירה
 *
 *  בין "שילמת" ל"קיבלת" עוברים חודשיים של שקט. המייל הזה ממלא את
 *  הפער, ובאותה הזדמנות מספר ללקוח מה שממילא תיעדנו: מי הרכיב, מי
 *  בדק, וכמה בדיקות עברו.
 *
 *  אין כאן הבטחה שיווקית אלא נתון. השמות והמספרים נקראים מהתיק.
 * ========================================================================== */

export type ReadyEmail = {
  to: string;
  name: string;
  productName?: string | null;
  size?: string | null;
  reference: string;
  assembler?: string | null;
  checker?: string | null;
  checksPassed: number;
  photoCount: number;
  lang?: Lang;
  /** הזמנת איסוף עצמי — הנוסח מדבר על איסוף מכפר ויתקין ולא על מסירה. */
  pickup?: boolean;
};

const READY = {
  he: {
    subject: (r: string) => `האופניים שלך מוכנים (${r})`,
    title: (n: string) => `${n}, האופניים שלך מוכנים`,
    intro: 'סיימנו להרכיב ולבדוק. ניצור איתך קשר לתיאום מועד המסירה.',
    introPickup: 'סיימנו להרכיב ולבדוק. ניצור איתך קשר לתיאום מועד האיסוף מכפר ויתקין.',
    builtTitle: 'מי טיפל באופניים שלך',
    assembler: 'הרכבה',
    checker: 'בדיקה',
    // "בדיקות איכות, כולן עברו" נקרא כמו אישור תקן, ואין עדיין דוח
    // בדיקה לאופניים. נכתב רק מה שנעשה בפועל: בדיקות של הסדנה שלנו.
    checks: (n: number) => `בוצעו ${n} בדיקות סדנה`,
    photos: (n: number) => `${n} תמונות תועדו לפני האריזה`,
    separate: 'הבודק אינו מי שהרכיב. זו דרישה קבועה אצלנו, ולא מקרה.',
    question: 'שאלה? השב למייל הזה.',
    dir: 'rtl', path: '',
  },
  en: {
    subject: (r: string) => `Your bike is ready (${r})`,
    title: (n: string) => `${n}, your bike is ready`,
    intro: 'Assembly and checks are done. We will contact you to arrange delivery.',
    introPickup: 'Assembly and checks are done. We will contact you to arrange a pickup time in Kfar Vitkin.',
    builtTitle: 'Who worked on your bike',
    assembler: 'Assembly',
    checker: 'Inspection',
    checks: (n: number) => `${n} workshop checks carried out`,
    photos: (n: number) => `${n} photos recorded before packing`,
    separate: 'The person who inspects is never the person who assembled. That is a standing rule here, not a coincidence.',
    question: 'Questions? Just reply to this email.',
    dir: 'ltr', path: '/en',
  },
} as const;

function readyHtml(o: ReadyEmail): string {
  const c = READY[o.lang === 'en' ? 'en' : 'he'];
  const line = (k: string, v: string) => v
    ? `<tr><td style="padding:7px 0;color:#6A6862;font-size:14px;">${esc(k)}</td>
         <td style="padding:7px 0;text-align:${c.dir === 'rtl' ? 'left' : 'right'};color:#1C1C1C;font-weight:600;font-size:14px;">${esc(v)}</td></tr>`
    : '';

  return `<!doctype html><html dir="${c.dir}"><body style="margin:0;background:#F5F2EC;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2EC;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="max-width:560px;background:#FFFFFF;border:1px solid #E0DCD4;border-radius:12px;padding:28px;">
        <tr><td>
          <h1 style="margin:0 0 6px;font-size:21px;color:#1C1C1C;">${esc(c.title(baseName(o.name)))}</h1>
          <p style="margin:0 0 20px;font-size:15px;color:#4A4845;line-height:1.6;">${esc(o.pickup ? c.introPickup : c.intro)}</p>

          <div style="border:1px solid #E0DCD4;border-radius:10px;padding:16px 18px;">
            <div style="font-size:13px;font-weight:700;color:#1C1C1C;margin-bottom:8px;">${esc(c.builtTitle)}</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${line(c.assembler, o.assembler ?? '')}
              ${line(c.checker, o.checker ?? '')}
            </table>
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid #E0DCD4;font-size:14px;color:#4A4845;line-height:1.7;">
              ${o.checksPassed > 0 ? esc(c.checks(o.checksPassed)) + '<br>' : ''}
              ${o.photoCount > 0 ? esc(c.photos(o.photoCount)) : ''}
            </div>
          </div>

          <p style="margin:16px 0 0;font-size:13px;color:#6A6862;line-height:1.6;">${esc(c.separate)}</p>

          <p style="margin:22px 0 0;font-size:13px;color:#6A6862;">${esc(c.question)}</p>
          <p style="margin:18px 0 0;font-size:11.5px;color:#9A9690;line-height:1.6;">
            ${esc(o.lang === 'en' ? COMPANY_EN : COMPANY)}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

function readyText(o: ReadyEmail): string {
  const c = READY[o.lang === 'en' ? 'en' : 'he'];
  return [
    c.title(baseName(o.name)), '', o.pickup ? c.introPickup : c.intro, '',
    c.builtTitle + ':',
    o.assembler ? `${c.assembler}: ${o.assembler}` : '',
    o.checker ? `${c.checker}: ${o.checker}` : '',
    o.checksPassed > 0 ? c.checks(o.checksPassed) : '',
    o.photoCount > 0 ? c.photos(o.photoCount) : '',
    '', c.separate, '', c.question,
  ].filter(Boolean).join('\n');
}

export async function sendReadyEmail(o: ReadyEmail): Promise<string | null> {
  if (!RESEND_KEY) return 'RESEND_API_KEY חסר';
  if (!o.to) return 'ללקוח אין כתובת מייל';

  const c = READY[o.lang === 'en' ? 'en' : 'he'];
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to: [o.to], bcc: BCC ? [BCC] : undefined, reply_to: SUPPORT,
        subject: c.subject(o.reference), html: readyHtml(o), text: readyText(o),
      }),
    });
    if (!res.ok) return `resend_${res.status}: ${(await res.text()).slice(0, 200)}`;
    return null;
  } catch (e) {
    return `resend_exception: ${e}`;
  }
}
