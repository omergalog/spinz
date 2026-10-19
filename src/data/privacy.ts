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

export const PRIVACY_UPDATED = { he: 'אוקטובר 2026', en: 'October 2026' };

const meta = PIXEL_ENABLED;

const he: PrivacySection[] = [
  { title: null, text: `${COMPANY_LINE} מחויבת להגן על פרטיותך. כאן מפורט איזה מידע אנחנו אוספים, למה, אצל מי הוא נשמר ולכמה זמן.` },
  { title: 'מידע שאנו אוספים', text:
    'בהזמנה: שם, טלפון, דוא״ל, כתובת למשלוח ופרטי ההזמנה. בפנייה או בבקשת ביטול: הפרטים שמילאת בטופס. בהרשמה לניוזלטר: כתובת דוא״ל. בכתיבת ביקורת: שם, עיר, דירוג והטקסט שכתבת. ' +
    'פרטי כרטיס האשראי מוזנים ישירות בעמוד התשלום של טרנזילה, ואינם עוברים דרכנו ואינם נשמרים אצלנו. ' +
    'בנוסף נשמרת כתובת ה-IP שממנה נשלח טופס או נפתחה הזמנה, לצורך הגנה מפני ספאם ומפני שריון מלאי בלי תשלום.' },
  { title: 'מטרות השימוש במידע', text:
    'עיבוד הזמנות ומשלוח, שירות לקוחות וטיפול בפניות ובביטולים, שליחת עדכונים למי שנרשם לניוזלטר, פרסום ביקורות שאישרנו, והגנה על האתר מפני שימוש לרעה. ' +
    `מדידת השימוש באתר${meta ? ' ופרסום' : ''} — רק אם אישרת זאת בבאנר העוגיות.` },
  { title: 'ביקורות', text: 'השם, העיר, הדירוג והטקסט של ביקורת מתפרסמים באתר אחרי שאנחנו מאשרים אותה. אפשר לבקש להסיר ביקורת בכל עת.' },
  { title: 'ספקים שמעבדים מידע עבורנו', text:
    'טרנזילה — סליקה והפקת חשבוניות. Supabase — מסד הנתונים של האתר. Vercel — אחסון האתר. Resend — שליחת מיילי הזמנה. Zoho — תיבת הדואר של החברה. ' +
    `Google Analytics — מדידת שימוש, רק בהסכמה.${meta ? ' Meta — פרסום, רק בהסכמה.' : ''} חברת שליחויות — לצורך המשלוח בלבד. ` +
    'כל ספק מקבל רק את המידע שנדרש לתפקידו.' },
  { title: 'העברת מידע לחו״ל', text:
    `חלק מהספקים (Supabase, Vercel, Resend, Google${meta ? ', Meta' : ''}) מעבדים ומאחסנים מידע בשרתים מחוץ לישראל. ההעברה נעשית לצורך תפעול השירות בלבד.` },
  { title: 'כמה זמן המידע נשמר', text:
    'הזמנות וחשבוניות — כל עוד החוק מחייב, ככלל 7 שנים לפי דיני המס. פניות, בקשות ביטול, כתובות לניוזלטר וביקורות — עד שתבקש למחוק אותן, או כשאין בהן עוד צורך. ' +
    'כתובות IP שנשמרות להגנה מפני ספאם נמחקות בתוך יומיים. כתובת ה-IP של מי שפתח הזמנה נשמרת עם ההזמנה.' },
  { title: 'זכויותיך', text: 'לעיין במידע שלך, לתקן אותו ולבקש למחוק אותו, בכפוף לחובות שמירה לפי חוק. אפשר גם לבקש להפסיק לקבל עדכונים בכל עת.' },
  { title: 'עוגיות', text:
    `עוגיות למדידה (Google Analytics)${meta ? ' ולפרסום (Meta)' : ''} נטענות רק אחרי אישור בבאנר העוגיות. בלי אישור הן לא נטענות. ` +
    'אפשר לשנות את הבחירה בכל עת בקישור "הגדרות עוגיות" בתחתית כל עמוד. דחייה אחרי אישור מוחקת את עוגיות המדידה.' },
  { title: 'יצירת קשר', text: `למימוש זכויותיך או לכל שאלה בנושא פרטיות: ${COMPANY.email} · ${COMPANY.phone}. האתר מופעל על ידי ${COMPANY_LINE}.` },
];

const en: PrivacySection[] = [
  { title: null, text: `${COMPANY_LINE_EN} is committed to protecting your privacy. This page sets out what information we collect, why, where it is kept and for how long.` },
  { title: 'Information we collect', text:
    'When you order: name, phone, email, delivery address and order details. When you contact us or request a cancellation: the details you enter in the form. When you join the newsletter: your email address. When you write a review: name, city, rating and your text. ' +
    'Card details are entered directly on Tranzila’s payment page; they never pass through us and are not stored by us. ' +
    'We also keep the IP address a form was sent from or an order was opened from, to protect against spam and against stock being reserved without payment.' },
  { title: 'How we use the information', text:
    'Processing and delivering orders, customer service and handling enquiries and cancellations, sending updates to newsletter subscribers, publishing reviews we have approved, and protecting the site from abuse. ' +
    `Measuring site use${meta ? ' and advertising' : ''} — only if you accept it in the cookie banner.` },
  { title: 'Reviews', text: 'A review’s name, city, rating and text are published on the site once we approve it. You can ask us to remove a review at any time.' },
  { title: 'Providers that process data for us', text:
    'Tranzila — payments and invoices. Supabase — the site’s database. Vercel — website hosting. Resend — sending order emails. Zoho — the company mailbox. ' +
    `Google Analytics — usage measurement, only with consent.${meta ? ' Meta — advertising, only with consent.' : ''} A courier company — for delivery only. ` +
    'Each provider receives only what its role requires.' },
  { title: 'Transfers outside Israel', text:
    `Some providers (Supabase, Vercel, Resend, Google${meta ? ', Meta' : ''}) process and store data on servers outside Israel. This is done only to operate the service.` },
  { title: 'How long we keep information', text:
    'Orders and invoices — for as long as the law requires, generally 7 years under tax law. Enquiries, cancellation requests, newsletter addresses and reviews — until you ask us to delete them, or once they are no longer needed. ' +
    'IP addresses kept for spam protection are deleted within two days. The IP address of whoever opened an order is kept with the order.' },
  { title: 'Your rights', text: 'To see the information we hold about you, correct it and ask us to delete it, subject to retention duties under law. You can also stop receiving updates at any time.' },
  { title: 'Cookies', text:
    `Measurement (Google Analytics)${meta ? ' and advertising (Meta)' : ''} cookies load only after you accept them in the cookie banner. Without your consent they are not loaded. ` +
    'You can change your choice at any time via the "Cookie settings" link at the bottom of every page. Declining after accepting deletes the measurement cookies.' },
  { title: 'Contact', text: `To exercise your rights or for any privacy question: ${COMPANY.email} · ${COMPANY.phone}. The site is operated by ${COMPANY_LINE_EN}.` },
];

export const getPrivacySections = (lang: string): PrivacySection[] => (lang === 'en' ? en : he);
