/**
 * מדיניות הפרטיות — מקור יחיד.
 *
 * היו שלושה עותקים (Terms.tsx, TermsEn.tsx, PrivacyModal.tsx), וכל
 * תיקון נחת באחד מהם בלבד. עכשיו שלושתם קוראים מכאן.
 *
 * מטא מוזכרת רק כשיש פיקסל מוגדר. אחרת המדיניות הייתה מתארת עוגיות
 * פרסום שלא קיימות באתר.
 */
import { COMPANY, COMPANY_LINE, COMPANY_LINE_EN } from '../config/company';
import { PIXEL_ENABLED } from '../lib/pixel';

export type PrivacySection = { title: string | null; text: string };

export const PRIVACY_UPDATED = { he: 'נובמבר 2026', en: 'November 2026' };

const meta = PIXEL_ENABLED;

const he: PrivacySection[] = [
  { title: null, text: `${COMPANY_LINE} מחויבת להגן על פרטיותך. כאן מפורט איזה מידע אנחנו אוספים, למה, אצל מי הוא נשמר ולכמה זמן.` },
  { title: 'מידע שאנו אוספים', text:
    'בהזמנה: שם, טלפון, דוא״ל, כתובת למשלוח ופרטי ההזמנה. בפנייה או בבקשת ביטול: הפרטים שמילאת בטופס. בהרשמה לניוזלטר: כתובת דוא״ל. בכתיבת ביקורת: שם, עיר, דירוג והטקסט שכתבת. ' +
    'פרטי כרטיס האשראי מוזנים ישירות בעמוד התשלום של טרנזילה, ואינם עוברים דרכנו ואינם נשמרים אצלנו. ' +
    'בנוסף נשמרת כתובת ה-IP שממנה נשלח טופס או נפתחה הזמנה, לצורך הגנה מפני ספאם ומפני שריון מלאי בלי תשלום. ' +
    'מדידת שימוש ומקור הגעה, רק בהסכמה: מזהה אקראי של הדפדפן, העמודים שנצפו, צפייה במוצר, הוספה לסל ותחילת תשלום, סוג המכשיר (נייד או מחשב), האתר שממנו הגעת (שם האתר בלבד), וקוד הקישור או תגיות הקמפיין שבכתובת שדרכה נכנסת. אנחנו לא שומרים את כתובת ה-IP שלך לצורך זה.' },
  { title: 'מטרות השימוש במידע', text:
    'עיבוד הזמנות ומשלוח, שירות לקוחות וטיפול בפניות ובביטולים, שליחת עדכונים למי שנרשם לניוזלטר, פרסום ביקורות שאישרנו, והגנה על האתר מפני שימוש לרעה. ' +
    `מדידת השימוש באתר, ולמידה מאיזה קישור, יוצר תוכן או קמפיין הגעת והאם ההגעה הובילה לרכישה${meta ? ', ופרסום' : ''} — רק אם אישרת זאת בבאנר העוגיות.` },
  { title: 'ביקורות', text: 'השם, העיר, הדירוג והטקסט של ביקורת מתפרסמים באתר אחרי שאנחנו מאשרים אותה. אפשר לבקש להסיר ביקורת בכל עת.' },
  { title: 'ספקים שמעבדים מידע עבורנו', text:
    'טרנזילה — סליקה והפקת חשבוניות. Supabase — מסד הנתונים של האתר, כולל נתוני המדידה שלנו (רק בהסכמה), בשרתים באיחוד האירופי. Vercel — אחסון האתר. Resend — שליחת מיילי הזמנה. Zoho — תיבת הדואר של החברה. ' +
    `Google Analytics — מדידת שימוש, רק בהסכמה.${meta ? ' Meta — פרסום, רק בהסכמה.' : ''} חברת שליחויות — לצורך המשלוח בלבד. ` +
    'כל ספק מקבל רק את המידע שנדרש לתפקידו.' },
  { title: 'העברת מידע לחו״ל', text:
    `חלק מהספקים (Supabase, Vercel, Resend, Google${meta ? ', Meta' : ''}) מעבדים ומאחסנים מידע בשרתים מחוץ לישראל. ההעברה נעשית לצורך תפעול השירות בלבד.` },
  { title: 'כמה זמן המידע נשמר', text:
    'הזמנות וחשבוניות — כל עוד החוק מחייב, ככלל 7 שנים לפי דיני המס. פניות, בקשות ביטול, כתובות לניוזלטר וביקורות — עד שתבקש למחוק אותן, או כשאין בהן עוד צורך. ' +
    'כתובות IP שנשמרות להגנה מפני ספאם נמחקות בתוך יומיים. כתובת ה-IP של מי שפתח הזמנה נשמרת עם ההזמנה. ' +
    'נתוני המדידה המפורטים נמחקים אחרי 90 יום, ואחריהם נשמרים רק סיכומים יומיים בלי מזהים. מקור ההגעה שנשמר עם הזמנה נשמר כל עוד ההזמנה נשמרת.' },
  { title: 'זכויותיך', text: 'לעיין במידע שלך, לתקן אותו ולבקש למחוק אותו, בכפוף לחובות שמירה לפי חוק. אפשר גם לבקש להפסיק לקבל עדכונים בכל עת.' },
  { title: 'עוגיות', text:
    `עוגיות ואחסון בדפדפן למדידה (Google Analytics ומדידה שלנו של עמודים ומקור הגעה)${meta ? ' ולפרסום (Meta)' : ''} נטענים רק אחרי אישור בבאנר העוגיות. בלי אישור הם לא נטענים ולא נשמר מזהה. ` +
    'אפשר לשנות את הבחירה בכל עת בקישור "הגדרות עוגיות" בתחתית כל עמוד. דחייה אחרי אישור מוחקת את עוגיות המדידה ואת מזהי המדידה שבדפדפן.' },
  { title: 'יצירת קשר', text: `למימוש זכויותיך או לכל שאלה בנושא פרטיות: ${COMPANY.email} · וואטסאפ ${COMPANY.phone}. האתר מופעל על ידי ${COMPANY_LINE}.` },
];

const en: PrivacySection[] = [
  { title: null, text: `${COMPANY_LINE_EN} is committed to protecting your privacy. This page sets out what information we collect, why, where it is kept and for how long.` },
  { title: 'Information we collect', text:
    'When you order: name, phone, email, delivery address and order details. When you contact us or request a cancellation: the details you enter in the form. When you join the newsletter: your email address. When you write a review: name, city, rating and your text. ' +
    'Card details are entered directly on Tranzila’s payment page; they never pass through us and are not stored by us. ' +
    'We also keep the IP address a form was sent from or an order was opened from, to protect against spam and against stock being reserved without payment. ' +
    'Usage and referral measurement, only with consent: a random browser ID, pages viewed, product views, add-to-cart and checkout start, device type (mobile or desktop), the referring site (site name only), and the link code or campaign tags in the address you arrived through. We do not store your IP address for this.' },
  { title: 'How we use the information', text:
    'Processing and delivering orders, customer service and handling enquiries and cancellations, sending updates to newsletter subscribers, publishing reviews we have approved, and protecting the site from abuse. ' +
    `Measuring site use, and learning which link, creator or campaign brought you and whether the visit led to a purchase${meta ? ', and advertising' : ''} — only if you accept it in the cookie banner.` },
  { title: 'Reviews', text: 'A review’s name, city, rating and text are published on the site once we approve it. You can ask us to remove a review at any time.' },
  { title: 'Providers that process data for us', text:
    'Tranzila — payments and invoices. Supabase — the site’s database, including our own measurement data (only with consent), on servers in the EU. Vercel — website hosting. Resend — sending order emails. Zoho — the company mailbox. ' +
    `Google Analytics — usage measurement, only with consent.${meta ? ' Meta — advertising, only with consent.' : ''} A courier company — for delivery only. ` +
    'Each provider receives only what its role requires.' },
  { title: 'Transfers outside Israel', text:
    `Some providers (Supabase, Vercel, Resend, Google${meta ? ', Meta' : ''}) process and store data on servers outside Israel. This is done only to operate the service.` },
  { title: 'How long we keep information', text:
    'Orders and invoices — for as long as the law requires, generally 7 years under tax law. Enquiries, cancellation requests, newsletter addresses and reviews — until you ask us to delete them, or once they are no longer needed. ' +
    'IP addresses kept for spam protection are deleted within two days. The IP address of whoever opened an order is kept with the order. ' +
    'Detailed measurement data is deleted after 90 days; only daily totals without identifiers are kept. The referral source saved with an order is kept as long as the order is kept.' },
  { title: 'Your rights', text: 'To see the information we hold about you, correct it and ask us to delete it, subject to retention duties under law. You can also stop receiving updates at any time.' },
  { title: 'Cookies', text:
    `Measurement cookies and browser storage (Google Analytics and our own page and referral measurement)${meta ? ' and advertising (Meta)' : ''} load only after you accept them in the cookie banner. Without your consent they are not loaded and no identifier is stored. ` +
    'You can change your choice at any time via the "Cookie settings" link at the bottom of every page. Declining after accepting deletes the measurement cookies and the measurement identifiers in your browser.' },
  { title: 'Contact', text: `To exercise your rights or for any privacy question: ${COMPANY.email} · WhatsApp ${COMPANY.phone}. The site is operated by ${COMPANY_LINE_EN}.` },
];

export const getPrivacySections = (lang: string): PrivacySection[] => (lang === 'en' ? en : he);
