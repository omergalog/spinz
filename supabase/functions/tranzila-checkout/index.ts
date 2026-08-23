/**
 * פותח סל תשלום ומחזיר את הפרמטרים לעמוד הסליקה של טרנזילה.
 *
 * הדפדפן שולח לכאן פריטים ופרטי לקוח בלבד — לעולם לא סכומים. המחיר
 * נקבע בבסיס הנתונים ומוחזר חתום בתוך סל שנשמר בשרת, כך שגם אם מישהו
 * ישנה את הסכום בטופס שנשלח לטרנזילה, האימות בשלב ה-notify יגלה זאת
 * וההזמנה לא תיווצר.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { IFRAME_URL } from '../_shared/tranzila.ts';
import { corsHeaders } from '../_shared/cors.ts';

const SITE = Deno.env.get('SITE_URL') ?? 'https://spinzbikes.com';
const FUNCTIONS = `${Deno.env.get('SUPABASE_URL')}/functions/v1`;

const json = (body: unknown, status: number, req: Request) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  });


const COLOR_HE: Record<string, string> = {
  mat: 'שחור מט', beige: "בז'", olive: 'ירוק זית',
};

/**
 * שורות המוצרים לחשבונית.
 *
 * התיעוד קובע תנאי אחד חד־משמעי: **סכום השורות חייב להשתוות לסכום
 * העסקה**, אחרת הפירוט נדחה. לכן השורות נשלחות במחיר הסופי, כולל
 * מע"מ, ולא לפניו.
 *
 * קודם הן חולקו ב-(1 + מע"מ) לפי הנחה שטרנזילה מוסיפה אותו בעצמה.
 * בפועל זה יצר שורות שסכומן 0.85 מול עסקה של 1.00 — הפרה ישירה של
 * התנאי, ומועמד ראשי לכך שהחשבונית לא הופקה כלל.
 *
 * שתי התאמות נוספות: קופון מקטין כל שורה באותו יחס, ועיגול לאגורות
 * נספג בשורה האחרונה כדי שהשוויון יישמר לגרוש.
 */
function buildInvoiceLines(items: Array<Record<string, unknown>>, total: number): string {
  if (!Array.isArray(items) || items.length === 0) return '';

  const gross = items.reduce(
    (sum, i) => sum + Number(i.unit_price ?? 0) * Number(i.quantity ?? 0), 0);
  if (gross <= 0) return '';

  const ratio = total / gross;                       // הנחת הקופון, אם הייתה

  const lines = items.map(i => {
    const color = COLOR_HE[String(i.color)] ?? String(i.color);
    const qty = Math.max(1, Number(i.quantity ?? 1));
    return {
      product_name: `SPINZ Urban · ${color} · מידה ${i.size}`,
      product_quantity: qty,
      product_price: Math.round(Number(i.unit_price ?? 0) * ratio * 100) / 100,
    };
  });

  // התיעוד דורש שוויון מוחלט בין סכום השורות לסכום העסקה, אחרת
  // הפירוט נדחה. עיגול לאגורות יוצר סטייה של פרוטות, והשורה
  // האחרונה סופגת אותה — אותה שיטה שבה נרשמות שורות ההזמנה.
  const linesTotal = lines.reduce((s, l) => s + l.product_price * l.product_quantity, 0);
  const drift = Math.round((total - linesTotal) * 100) / 100;
  if (drift !== 0) {
    const last = lines[lines.length - 1];
    last.product_price = Math.round(
      (last.product_price + drift / last.product_quantity) * 100) / 100;
  }

  return JSON.stringify(lines);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json({ error: 'method' }, 405, req);

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400, req);
  }

  const { items, name, phone, email, address, coupon, lang } = body as {
    items?: Array<Record<string, unknown>>;
    name?: string; phone?: string; email?: string; address?: string;
    coupon?: string; lang?: string;
  };

  if (!Array.isArray(items) || items.length === 0) return json({ error: 'EMPTY_CART' }, 400, req);
  if (!name?.trim() || !phone?.trim()) return json({ error: 'MISSING_DETAILS' }, 400, req);

  // ניקוי: רק השדות שאנחנו מכירים עוברים הלאה, וכל השאר נזרק.
  const clean = items.map(i => ({
    color: String(i.color ?? ''),
    size: String(i.size ?? ''),
    quantity: Number(i.quantity ?? 0),
    colorSkuCode: String(i.colorSkuCode ?? ''),
  }));

  const { data, error } = await db.rpc('create_checkout_session', {
    p_items: clean,
    p_name: name,
    p_phone: phone,
    p_email: email ?? null,
    p_notes: address ?? null,
    // קוד בלבד. ההנחה מחושבת בשרת, כמו המחיר עצמו.
    p_coupon: coupon ?? null,
  });

  if (error) {
    const msg = String(error.message ?? '');
    if (msg.includes('OUT_OF_STOCK')) {
      const left = msg.split('OUT_OF_STOCK:')[1]?.split(':')[1]?.replace(/\D/g, '');
      return json({ error: 'OUT_OF_STOCK', left: Number(left ?? 0) }, 409, req);
    }
    // סלים פתוחים רבים מדי הוא מצב לגיטימי של לקוח שניסה שוב, ולא
    // תקלת שרת. הוא הוחזר עד כה כ-SERVER, והלקוח קיבל "משהו השתבש"
    // בלי דרך לדעת שכל מה שנדרש הוא להמתין.
    if (msg.includes('TOO_MANY_OPEN_CARTS')) {
      return json({ error: 'TOO_MANY_OPEN_CARTS' }, 429, req);
    }
    console.error('create_checkout_session', msg);
    return json({ error: 'SERVER' }, 500, req);
  }

  const sessionId = data.session_id as string;
  const total = Number(data.total);

  // שורות החשבונית. הסל כבר מתומחר בשרת, ולכן נמשך משם ולא מהדפדפן.
  const { data: session } = await db.from('checkout_sessions')
    .select('items').eq('id', sessionId).maybeSingle();

  // לחברות האשראי יש רצפה לגובה תשלום בודד, ועסקה שיורדת מתחתיה
  // נדחית (קוד 403). באופניים ב-₪1,090 זה לא מורגש, אבל בציוד נלווה
  // בעשרות שקלים פריסה ל-12 תשלומים פשוט תיכשל — ולכן מספר התשלומים
  // המוצע נגזר גם מהסכום.
  const minPart = Math.max(1, Number(data.min_installment_amount ?? 100));
  const maxPay = Math.max(1, Math.min(
    Number(data.max_installments ?? 1),
    Math.floor(total / minPart),
  ));

  const invoiceLines = buildInvoiceLines(session?.items ?? [], total);

  const fields: Record<string, string> = {
    sum: total.toFixed(2),
    currency: '1',            // שקל
    tranmode: 'A',            // חיוב רגיל
    lang: 'il',

    contact: name.trim(),
    phone: phone.trim(),
    email: (email ?? '').trim(),
    address: (address ?? '').trim(),
    city: '',
    country: 'Israel',
    zip: '',

    pdesc: 'SPINZ — אופני עיר',
    // שפת החשבונית שנשלחת ללקוח
    Ilang: lang === 'en' ? 'ENG' : 'HEB',

    // החזרה עוברת דרך פונקציית שרת ולא ישירות לאתר: טרנזילה חוזרת
    // ב-POST, ואתר סטטי על Vercel אינו יודע לקבל POST.
    success_url_address: `${FUNCTIONS}/tranzila-return?s=${sessionId}`,
    fail_url_address: `${FUNCTIONS}/tranzila-return?r=fail&s=${sessionId}`,
    // שפת הלקוח נוסעת בכתובת החזרה ולא בבסיס הנתונים: היא נחוצה רק
    // כדי לבחור את שפת מייל האישור, וכך אין צורך בעמודה נוספת בסל.
    notify_url_address: `${FUNCTIONS}/tranzila-notify?s=${sessionId}&l=${lang === 'en' ? 'en' : 'he'}`,

    // ערוץ שני למזהה הסל. הראשון הוא מחרוזת השאילתה בכתובות למעלה.
    // התיעוד אינו מבטיח שפרמטר עצמי יוחזר בהודעה, ולכן לא סומכים עליו
    // לבדו — אבל אם כן, הוא מגיע גם דרך כאן.
    sessionid: sessionId,

    // מונע חיוב כפול אם הלקוח לוחץ פעמיים או מרענן
    DCdisable: sessionId,

    // התיעוד מתנה בו גם את פירוט שורות החשבונית וגם את בדיקת הכפילות
    // בעמודי Direct/Iframe. בלעדיו שניהם נשלחים ומתעלמים מהם בשקט.
    u71: '1',

    // ארנקים דיגיטליים
    bit_pay: '1',
    apple_pay: '1',
    google_pay: '1',

    // פירוט שורות לחשבונית. אם הסכומים לא יסתדרו, טרנזילה תדפיס
    // חשבונית תקינה בלי הפירוט — כלומר טעות כאן לא מייצרת חשבונית
    // שגויה, רק פחות מפורטת.
    ...(invoiceLines ? { json_purchase_data: invoiceLines } : {}),

    // מיתוג העמוד
    nologo: '1',
    accessibility: '2',
    trButtonColor: '1A1A1A',
  };

  // תשלומים: maxpay נותן ללקוח לבחור וטרנזילה מחשבת את הפריסה לבד,
  // ולכן אין צורך ב-fpay/spay/npay ואין סיכון לשגיאת עיגול.
  if (maxPay > 1) {
    fields.cred_type = '8';
    fields.maxpay = String(maxPay);
  } else {
    fields.cred_type = '1';
  }

  return json({ ok: true, session_id: sessionId, total, action: IFRAME_URL, fields }, 200, req);
});
