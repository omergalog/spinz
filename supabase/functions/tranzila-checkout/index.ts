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
 * שתי מלכודות שהתיעוד מזהיר מפניהן:
 *
 * 1. אם מוגדר אחוז מע"מ על מודול החשבוניות, יש לשלוח מחיר *לפני*
 *    מע"מ וטרנזילה מוסיפה אותו. שליחת מחיר כולל מע"מ הייתה מנפחת
 *    את החשבונית. הערך נשלט ב-INVOICE_VAT_RATE ומוגדר 0 כברירת
 *    מחדל, כלומר "המחיר שנשלח הוא הסופי".
 *
 * 2. סכום השורות חייב להשתוות לסכום העסקה. כשמופעל קופון, הסל זול
 *    מסכום המחירים המקוריים, ולכן כל שורה מוקטנת באותו יחס.
 */
function buildInvoiceLines(items: Array<Record<string, unknown>>, total: number): string {
  if (!Array.isArray(items) || items.length === 0) return '';

  const vat = Number(Deno.env.get('INVOICE_VAT_RATE') ?? '0');
  const gross = items.reduce(
    (sum, i) => sum + Number(i.unit_price ?? 0) * Number(i.quantity ?? 0), 0);
  if (gross <= 0) return '';

  const ratio = total / gross;                       // הנחת הקופון, אם הייתה

  const lines = items.map(i => {
    const color = COLOR_HE[String(i.color)] ?? String(i.color);
    const unit = Number(i.unit_price ?? 0) * ratio / (1 + vat);
    return {
      product_name: `SPINZ Urban · ${color} · מידה ${i.size}`,
      product_quantity: Number(i.quantity ?? 1),
      product_price: Math.round(unit * 100) / 100,
    };
  });

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
