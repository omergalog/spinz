import type { Lang } from '../i18n/LanguageContext';

export type FaqItem = { q: string; a: string };

const he: FaqItem[] = [
  {
    q: 'כמה זמן לוקח המשלוח?',
    a: 'אנחנו שולחים עד 5 ימי עסקים מרגע ההזמנה. תקבלו SMS עם מספר מעקב ברגע שהחבילה יוצאת אלינו.',
  },
  {
    q: 'האופניים מגיעים מורכבים?',
    a: 'כן, כ-85% מורכבים. מה שנשאר הוא חיבור ההגה, פדלים והתאמת המושב – פחות מ-20 דקות עם הסרטון שמגיע בקופסה.',
  },
  {
    q: 'יש אפשרות לאיסוף עצמי?',
    a: 'כן, ניתן לאסוף מתל אביב ללא עלות משלוח. תיאום מועד האיסוף מתבצע לאחר ההזמנה.',
  },
  {
    q: 'אפשר לשלם בתשלומים?',
    a: 'בהחלט. ניתן לפרוס לעד 13 תשלומים החל מ-₪100 בחודש. מקבלים אשראי, ביט, Apple Pay ו-Google Pay.',
  },
  {
    q: 'לאיזה גובה מתאים כל דגם?',
    a: 'שלדה 54 מתאימה לגובה 160–175 ס"מ. שלדה 57 מתאימה לגובה 175–190 ס"מ. במקרי ספק – עדיף שלדה קטנה יותר.',
  },
  {
    q: 'כל הצבעים זמינים בכל המידות?',
    a: 'כן, כל צבעי הקולקציה זמינים בשתי מידות השלדה ללא הגבלה.',
  },
  {
    q: 'מה כוללת האחריות?',
    a: 'האופניים מגיעים עם אחריות של 5 שנים על שלדת האלומיניום. חלפים מתכלים כגון צמיגים, שרשרת ופדלים אינם כלולים באחריות.',
  },
  {
    q: 'איפה אפשר לתקן את האופניים?',
    a: 'האופניים בנויים על רכיבים סטנדרטיים שניתן למצוא בכל חנות אופניים בישראל. אין צורך בטכנאי מורשה.',
  },
  {
    q: 'האופניים מתאימים לגברים ולנשים?',
    a: 'כן. שתי מידות השלדה מתאימות לכולם – הגיאומטריה של האופניים אוניברסלית וניתן להתאים את גובה המושב וההגה.',
  },
];

const en: FaqItem[] = [
  {
    q: 'How long does delivery take?',
    a: 'We ship within 5 business days of your order. You’ll get an SMS with a tracking number the moment the package leaves us.',
  },
  {
    q: 'Does the bike arrive assembled?',
    a: 'Yes — about 85% assembled. All that’s left is attaching the handlebars and pedals and setting the saddle height: under 20 minutes with the video that comes in the box.',
  },
  {
    q: 'Can I pick the bike up myself?',
    a: 'Yes. Pickup is available in Tel Aviv with no shipping charge. We’ll arrange a time with you after the order.',
  },
  {
    q: 'Can I pay in installments?',
    a: 'Absolutely. You can split the payment into up to 13 installments, starting at ₪100 a month. We accept credit cards, Bit, Apple Pay and Google Pay.',
  },
  {
    q: 'Which frame size suits my height?',
    a: 'The 54 frame fits riders 160–175 cm. The 57 frame fits riders 175–190 cm. If you’re between sizes, go with the smaller frame.',
  },
  {
    q: 'Are all colors available in both sizes?',
    a: 'Yes — every color in the collection is available in both frame sizes, with no restrictions.',
  },
  {
    q: 'What does the warranty cover?',
    a: 'Every bike comes with a 5-year warranty on the aluminum frame. Wear items such as tires, chain and pedals aren’t covered.',
  },
  {
    q: 'Where can I get the bike serviced?',
    a: 'The bike is built entirely from standard components that any bike shop in Israel carries. No authorized technician required.',
  },
  {
    q: 'Is the bike suitable for both men and women?',
    a: 'Yes. Both frame sizes work for everyone — the geometry is universal, and the saddle and handlebar height are fully adjustable.',
  },
];

export const getFaqs = (lang: Lang): FaqItem[] => (lang === 'en' ? en : he);

/** נשמר עבור מנוע החיפוש, שבונה מאגר בעברית. */
export const faqs = he;
