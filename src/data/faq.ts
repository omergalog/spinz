import type { Lang } from '../i18n/LanguageContext';

/** link: קישור שמוצג בסוף התשובה (למשל לסעיף בתקנון). */
export type FaqItem = { q: string; a: string; link?: { text: string; href: string } };

const he: FaqItem[] = [
  {
    q: 'כמה זמן לוקח המשלוח?',
    a: 'עד 5 ימי עסקים. האופניים במלאי: אנחנו מרכיבים ובודקים כל זוג בסדנה, ויוצרים איתכם קשר לתיאום המשלוח או האיסוף. המשלוח עד הבית לרוב אזורי הארץ, וכלול במחיר.',
  },
  {
    q: 'האופניים מגיעים מורכבים?',
    a: 'כן, במלואם. כל זוג מורכב, מכוון ונבדק בסדנה שלנו ומגיע מוכן לרכיבה. ההרכבה כלולה במחיר.',
  },
  {
    q: 'יש אפשרות לאיסוף עצמי?',
    a: 'כן, ניתן לאסוף מכפר ויתקין ללא עלות משלוח. בוחרים איסוף עצמי בטופס ההזמנה, ואנחנו מתאמים איתכם מועד.',
  },
  {
    q: 'אפשר לשלם בתשלומים?',
    a: 'בהחלט. בכרטיס אשראי אפשר לפרוס עד 12 תשלומים ללא ריבית. מקבלים כרטיס אשראי ו-Apple Pay.',
  },
  {
    q: 'לאיזה גובה מתאים כל דגם?',
    a: 'שלדה 54 מתאימה לגובה 170–180 ס״מ. שלדה 57 מתאימה לגובה 180–188 ס״מ. במקרי ספק עדיף לבחור שלדה קטנה יותר.',
  },
  {
    q: 'כל הצבעים זמינים בכל המידות?',
    a: 'כן, כל צבעי הקולקציה מוצעים בשתי מידות השלדה, בכפוף לזמינות במלאי.',
  },
  {
    q: 'מה כוללת האחריות?',
    a: '5 שנים על שלדת האלומיניום. על שאר החלקים, ובהם המזלג, הכידון, הצמיגים, הבלמים והשרשרת, 14 ימים מהמסירה נגד פגמי ייצור. הנוסח המלא:',
    link: { text: 'סעיף 3 בתקנון', href: '/regulations#warranty' },
  },
  {
    q: 'איפה אפשר לתקן את האופניים?',
    a: 'האופניים בנויים על רכיבים סטנדרטיים שניתן למצוא בכל חנות אופניים בישראל, כך שלתיקון ולתחזוקה אין צורך בטכנאי מורשה.',
  },
  {
    q: 'האופניים מתאימים לגברים ולנשים?',
    a: 'כן. שתי מידות השלדה מתאימות לכולם. הגיאומטריה של האופניים אוניברסלית, וההתאמה נעשית בעיקר דרך גובה המושב.',
  },
];

const en: FaqItem[] = [
  {
    q: 'How long does delivery take?',
    a: 'Up to 5 business days. The bikes are in stock: we assemble and check every bike in our workshop, then contact you to arrange delivery or pickup. Home delivery covers most of Israel and is included in the price.',
  },
  {
    q: 'Does the bike arrive assembled?',
    a: 'Yes, fully. Every bike is assembled, tuned and checked in our workshop and arrives ready to ride. Assembly is included in the price.',
  },
  {
    q: 'Can I pick the bike up myself?',
    a: 'Yes. Pickup is available in Kfar Vitkin with no shipping charge. Choose self-pickup in the order form and we’ll arrange a time with you.',
  },
  {
    q: 'Can I pay in installments?',
    a: 'Absolutely. By credit card you can split the payment into up to 12 interest-free installments. We accept credit cards and Apple Pay.',
  },
  {
    q: 'Which frame size suits my height?',
    a: 'The 54 frame fits riders 170–180 cm. The 57 frame fits riders 180–188 cm. If you’re between sizes, go with the smaller frame.',
  },
  {
    q: 'Are all colors available in both sizes?',
    a: 'Yes, every color in the collection is available in both frame sizes, subject to availability in stock.',
  },
  {
    q: 'What does the warranty cover?',
    a: '5 years on the aluminum frame. All other parts, including the fork, handlebars, tires, brakes and chain, are covered for 14 days from delivery against manufacturing defects. The full wording:',
    link: { text: 'section 3 of the Terms & Conditions', href: '/en/regulations#warranty' },
  },
  {
    q: 'Where can I get the bike serviced?',
    a: 'The bike is built entirely from standard components that any bike shop in Israel carries, so repairs and servicing need no authorized technician.',
  },
  {
    q: 'Is the bike suitable for both men and women?',
    a: 'Yes. Both frame sizes work for everyone. The geometry is universal, and the fit is set mainly through saddle height.',
  },
];

export const getFaqs = (lang: Lang): FaqItem[] => (lang === 'en' ? en : he);

/** נשמר עבור מנוע החיפוש, שבונה מאגר בעברית. */
export const faqs = he;
