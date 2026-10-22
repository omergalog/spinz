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

  const [status, setStatus] = useState<PaymentStatus | 'unknown'>(
    outcome === 'failed' ? 'failed' : 'pending',
  );
  const [total, setTotal] = useState<number | null>(null);
  const [pickup, setPickup] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!sessionId || outcome === 'failed') return;

    let alive = true;
    let tries = 0;

    const tick = async () => {
      // הסוד של הרכישה מביא גם סכום ואופן קבלה. בלעדיו (דפדפן אחר,
      // קישור שהועבר) מתקבל רק המצב.
      const s = await fetchStatus(sessionId, purchaseToken());
      if (!alive) return;

      if (s && s !== 'rate') {
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
        return { icon: <XCircle size={52} style={{ color: '#A3462B' }} />, title: c.failed, sub: c.failedSub };
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
          {COMPANY.phone} · {COMPANY.email}
        </p>
      </div>
    </PageShell>
  );
}
