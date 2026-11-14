import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import PageShell from '../components/PageShell';
import { useDir, useLang, localizePath } from '../i18n/LanguageContext';
import { fetchStatus, type PaymentStatus } from '../lib/payment';
import { markPurchasePaid, purchaseToken } from '../lib/purchase';
import { pixelPurchase } from '../lib/pixel';
import { COMPANY } from '../config/company';

const DARK = '#1C1C1C';
const MUTED = '#4A4845';
const GOLD = '#C9A870';
const BORDER = '#E0DCD4';

/**
 * העמוד שאליו הלקוח חוזר מעמוד התשלום.
 *
 * הוא אינו מכריז על הצלחה מעצם ההגעה אליו. ההזמנה נוצרת בשרת אחרי
 * אימות מול טרנזילה, ולעיתים ההודעה מגיעה שנייה־שתיים אחרי הלקוח,
 * ולכן העמוד שואל את השרת מה המצב עד שהוא מתייצב.
 */

/**
 * קודי דחייה נפוצים של שב"א/טרנזילה, כפי שהם מגיעים בשדה Response.
 * רק קודים שמשמעותם ברורה. כל קוד אחר מוצג כמספר, כדי שהלקוח יוכל
 * למסור אותו לנו או לחברת האשראי.
 */
const DECLINE: Record<string, { he: string; en: string }> = {
  '001': { he: 'חברת האשראי מסרה שהכרטיס חסום.', en: 'The card issuer reports this card as blocked.' },
  '002': { he: 'חברת האשראי סירבה לעסקה בכרטיס הזה.', en: 'The card issuer declined this card.' },
  '003': { he: 'חברת האשראי מבקשת שתיצרו איתה קשר לפני אישור העסקה.', en: 'The card issuer asks you to contact them to approve this payment.' },
  '004': { he: 'חברת האשראי סירבה לעסקה.', en: 'The card issuer declined the payment.' },
  '006': { he: 'קוד האבטחה (CVV) או מספר תעודת הזהות לא תואמים.', en: 'The security code (CVV) or ID number did not match.' },
  // 026 אומת מול לוח הבקרה של טרנזילה (14.11.2026): "מספר ת"ז שגוי"
  '026': { he: 'מספר תעודת הזהות שהוזן לא תואם לכרטיס.', en: 'The ID number entered does not match the card.' },
  '033': { he: 'פרטי הכרטיס אינם תקינים.', en: 'The card details are not valid.' },
  '036': { he: 'תוקף הכרטיס פג.', en: 'The card has expired.' },
  '039': { he: 'מספר הכרטיס שגוי.', en: 'The card number is incorrect.' },
};

const COPY = {
  he: {
    waiting: 'מאשרים את התשלום…',
    waitingSub: 'רגע אחד, מוודאים מול חברת הסליקה.',
    paid: 'ההזמנה התקבלה!',
    paidSub: (n: string) => `שילמת ${n}. נשלח אליך עדכון כשהמשלוח יוצא אליך.`,
    paidSubPickup: (n: string) => `שילמת ${n}. ניצור איתך קשר לתיאום מועד האיסוף מכפר ויתקין.`,
    failed: 'התשלום לא הושלם',
    // לא "לא חויבת": העמוד הזה מוצג לפי ההפניה מעמוד התשלום, לא לפי אימות.
    failedSub: 'התשלום לא אושר. אם בכל זאת ירד חיוב, הוא יופיע אצלנו ונחזור אליך. אפשר לנסות שוב, או לכתוב לנו ונסדר את זה.',
    expired: 'פג תוקף ההזמנה',
    expiredSub: 'עברו יותר מדי דקות בעמוד התשלום. הוסיפו את האופניים לעגלה ונסו שוב.',
    overbooked: 'התשלום התקבל אך המלאי אזל',
    overbookedSub: 'הדגם שבחרת אזל במלאי בזמן התשלום. ניצור איתך קשר כדי לסגור מה עושים, וזה בטיפול שלנו.',
    unresolved: 'התשלום עדיין בבדיקה',
    unresolvedSub: (r: string) => `עדיין לא קיבלנו מחברת הסליקה תשובה סופית על התשלום. אם הוא אושר, תקבל אישור במייל וההזמנה תופיע אצלנו. אין צורך לשלם שוב. לעזרה ציין את מספר הפנייה ${r}.`,
    duplicate: 'התשלום התקבל ונמצא בבדיקה',
    duplicateSub: (r: string) => `נראה שהתשלום הזה התקבל בנוסף לתשלום קודם על אותה הזמנה. ניצור איתך קשר. מספר פנייה ${r}.`,
    slow: 'האישור מתעכב. אם חויבת, ההזמנה תיקלט מעצמה ואין צורך לשלם שוב.',
    stuckSub: 'לא קיבלנו תשובה מחברת הסליקה. אם התשלום בכל זאת יאושר, ההזמנה תיקלט אצלנו מעצמה, העמוד הזה יתעדכן ותקבלו מייל אישור. אין צורך לשלם שוב. אפשר לנסות כרטיס אחר או Apple\u00A0Pay, או לכתוב לנו.',
    reason: (code: string) => DECLINE[code]?.he ?? 'חברת האשראי לא אישרה את העסקה.',
    reasonCode: (code: string) => `קוד שגיאה: ${code}. אפשר לנסות כרטיס אחר או Apple\u00A0Pay, או לשלוח לנו את הקוד ונבדוק.`,
    home: 'חזרה לעמוד הבית',
    contact: 'דברו איתנו',
  },
  en: {
    waiting: 'Confirming your payment…',
    waitingSub: 'One moment while we check with the payment processor.',
    paid: 'Order received!',
    paidSub: (n: string) => `You paid ${n}. We'll email you when your bike ships.`,
    paidSubPickup: (n: string) => `You paid ${n}. We'll contact you to arrange pickup from Kfar Vitkin.`,
    failed: 'Payment did not go through',
    failedSub: 'The payment was not approved. If a charge does appear, we will see it and get back to you. You can try again, or message us and we will sort it out.',
    expired: 'Checkout expired',
    expiredSub: 'Too long on the payment page. Add the bike to your cart and try again.',
    overbooked: 'Paid, but the item sold out',
    overbookedSub: 'The model you chose sold out during payment. We will contact you to sort it out — it is on us.',
    unresolved: 'Payment still being checked',
    unresolvedSub: (r: string) => `We have not yet received a final answer from the payment processor. If it was approved, you will get a confirmation email and the order will appear on our side. Please do not pay again. For help, quote reference ${r}.`,
    duplicate: 'Payment received and under review',
    duplicateSub: (r: string) => `This payment seems to have arrived in addition to an earlier payment for the same order. We will contact you. Reference ${r}.`,
    slow: 'Confirmation is taking a while. If you were charged, the order will register on its own, so do not pay again.',
    stuckSub: 'We did not get an answer from the payment processor. If the payment is approved after all, the order will be recorded automatically, this page will update and you will get a confirmation email. No need to pay again. You can try another card or Apple\u00A0Pay, or message us.',
    reason: (code: string) => DECLINE[code]?.en ?? 'The card issuer did not approve the payment.',
    reasonCode: (code: string) => `Error code: ${code}. You can try another card or Apple\u00A0Pay, or send us the code and we will check.`,
    home: 'Back to home',
    contact: 'Contact us',
  },
} as const;

/**
 * ריקון העגלה אחרי תשלום שאושר.
 *
 * הריקון נעשה עד כה רק כשדף החזרה הספיק לשלוח הודעה למסגרת ההורה.
 * לקוח שחזר בדרך אחרת — הפניה מלאה של החלון, לשונית שנסגרה ונפתחה,
 * או מכשיר שחסם את ההודעה — נשאר עם המוצר בעגלה אחרי ששילם עליו.
 *
 * כאן ההסתמכות היא על מצב התשלום שהשרת אישר, ולא על הודעה שעשויה
 * ללכת לאיבוד. הכתיבה היא לאחסון הדפדפן, שהוא מקור האמת של העגלה,
 * ואירוע storage מיידע חלונות אחרים שפתוחים באותו רגע.
 */
function clearPaidCart() {
  try {
    localStorage.removeItem('spinz-cart');
    sessionStorage.removeItem('spinz-checkout-details');
    window.dispatchEvent(new StorageEvent('storage', { key: 'spinz-cart', newValue: null }));
  } catch { /* אחסון חסום — אין מה לנקות */ }
}

export default function OrderResult({ outcome }: { outcome: 'success' | 'failed' }) {
  const dir = useDir();
  const lang = useLang();
  const L = (to: string) => localizePath(to, lang);
  const c = COPY[lang === 'en' ? 'en' : 'he'];

  const [params] = useSearchParams();
  const sessionId = params.get('s') ?? '';
  const urlCode = /^\d{1,4}$/.test(params.get('code') ?? '') ? params.get('code')! : '';
  const stuck = params.get('stuck') === '1';
  const [serverCode, setServerCode] = useState('');
  const code = urlCode || serverCode;

  const [status, setStatus] = useState<PaymentStatus | 'unknown'>(
    outcome === 'failed' ? 'failed' : 'pending',
  );
  const [total, setTotal] = useState<number | null>(null);
  const [pickup, setPickup] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    let alive = true;
    let tries = 0;

    const tick = async () => {
      // הסוד של הרכישה מביא גם סכום ואופן קבלה. בלעדיו (דפדפן אחר,
      // קישור שהועבר) מתקבל רק המצב.
      const s = await fetchStatus(sessionId, purchaseToken());
      if (!alive) return;

      // עמוד הכשל ממשיך לבדוק בשקט: תשלום שנתקע עשוי להיות מאושר
      // מאוחר יותר (14.11 07:30 — אושר 3 דקות אחרי שהחלון נתקע). רק
      // אישור מחליף את העמוד; כל מצב אחר משאיר את הכשל.
      if (outcome === 'failed') {
        if (s && s !== 'rate' && s.status === 'paid') {
          if (s.total != null) setTotal(s.total);
          setPickup(!!s.pickup);
          setStatus('paid');
          if (s.total != null) pixelPurchase(sessionId, s.total);
          clearPaidCart();
          markPurchasePaid(sessionId);
          return;
        }
        if (s && s !== 'rate' && s.code) setServerCode(s.code);
        // דחייה סופית: אין מה לחכות לו
        if (s && s !== 'rate' && ['failed', 'failed_final', 'expired', 'overbooked'].includes(s.status)) return;
      } else if (s && s !== 'rate') {
        if (s.total != null) setTotal(s.total);
        setPickup(!!s.pickup);
        // unresolved אינו סופי: התשלום עדיין יכול להיות מאושר. ממשיכים
        // לשאול, לאט יותר.
        if (s.status !== 'pending') setStatus(s.status);
        if (s.status !== 'pending' && s.status !== 'unresolved') {
          // אותו מזהה אירוע שהשרת שולח, כדי שמטא תאחד ולא תספור פעמיים
          if (s.status === 'paid') {
            if (s.total != null) pixelPurchase(sessionId, s.total);
            clearPaidCart();
            markPurchasePaid(sessionId);
          }
          return;                       // הגיע למצב סופי — מפסיקים לשאול
        }
      }

      // הודעת התשלום מגיעה בדרך כלל תוך שניות: כל 2 שניות בדקה הראשונה,
      // ואחר כך כל 15 שניות עד חצי שעה. השרת ביקש להאט — מאטים.
      tries++;
      if (tries === 30) setSlow(true);
      if (tries > 30 + 116) return;
      setTimeout(tick, s === 'rate' ? 30000 : tries < 30 ? 2000 : 15000);
    };

    tick();
    return () => { alive = false; };
  }, [sessionId, outcome]);

  const ref = sessionId.slice(0, 8).toUpperCase();

  const view = (() => {
    switch (status) {
      case 'paid':
        return { icon: <CheckCircle size={52} style={{ color: GOLD }} />,
                 title: c.paid,
                 // בידוד דו-כיווני: סכום בתוך משפט עברי נקרא על ידי הדפדפן
                 // כרצף ניטרלי, והסימן ₪ קפץ לצד השני של המספר. התווים
                 // האלה מקבעים אותו כיחידה אחת משמאל לימין.
                 sub: (pickup ? c.paidSubPickup : c.paidSub)(total ? `\u2066₪${total.toLocaleString('he-IL')}\u2069` : '') };
      case 'expired':
        return { icon: <Clock size={52} style={{ color: MUTED }} />, title: c.expired, sub: c.expiredSub };
      case 'unresolved':
        return { icon: <Clock size={52} style={{ color: GOLD }} />, title: c.unresolved, sub: c.unresolvedSub(ref) };
      case 'duplicate':
        return { icon: <Clock size={52} style={{ color: GOLD }} />, title: c.duplicate, sub: c.duplicateSub(ref) };
      case 'overbooked':
        return { icon: <XCircle size={52} style={{ color: '#A3462B' }} />, title: c.overbooked, sub: c.overbookedSub };
      case 'failed':
      case 'failed_final':
        return { icon: <XCircle size={52} style={{ color: '#A3462B' }} />, title: c.failed,
                 sub: code ? c.reason(code) : stuck ? c.stuckSub : c.failedSub,
                 note: code ? c.reasonCode(code) : undefined };
      default:
        return { icon: <Clock size={52} style={{ color: GOLD }} />,
                 title: c.waiting, sub: slow ? c.slow : c.waitingSub };
    }
  })();

  return (
    <PageShell>
      <div dir={dir} style={{
        maxWidth: '620px', margin: '0 auto', padding: '80px 24px 120px',
        textAlign: 'center',
      }}>
        {view.icon}
        <h1 style={{
          fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 5vw, 34px)',
          color: DARK, margin: '20px 0 12px',
        }}>
          {view.title}
        </h1>
        <p style={{
          fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: MUTED,
          lineHeight: 1.7, margin: '0 auto', maxWidth: '46ch',
        }}>
          {view.sub}
        </p>
        {'note' in view && view.note && (
          <p style={{
            fontFamily: "'Heebo', sans-serif", fontSize: '13.5px', color: MUTED,
            lineHeight: 1.7, margin: '12px auto 0', maxWidth: '46ch',
            background: '#FBEEE9', border: '1px solid #E0B9A6', borderRadius: '8px', padding: '10px 14px',
          }}>
            {view.note}
          </p>
        )}

        <div style={{
          display: 'flex', gap: '12px', justifyContent: 'center',
          flexWrap: 'wrap', marginTop: '32px',
        }}>
          <Link to={L('/')} style={{
            padding: '13px 26px', backgroundColor: GOLD, color: DARK,
            fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            textDecoration: 'none', borderRadius: '4px',
          }}>
            {c.home}
          </Link>
          <Link to={L('/contact')} style={{
            padding: '13px 26px', border: `1px solid ${BORDER}`, color: DARK,
            fontFamily: "'Heebo', sans-serif", fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            textDecoration: 'none', borderRadius: '4px',
          }}>
            {c.contact}
          </Link>
        </div>

        <p style={{
          fontFamily: "'Heebo', sans-serif", fontSize: '12px', color: '#9A9690',
          marginTop: '28px', direction: 'ltr',
        }}>
          WhatsApp {COMPANY.phone} · {COMPANY.email}
        </p>
      </div>
    </PageShell>
  );
}
