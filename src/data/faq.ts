import type { Lang } from '../i18n/LanguageContext';

export type FaqItem = { q: string; a: string };

const he: FaqItem[] = [
  {
    q: 'כמה זמן לוקח המשלוח?',
    a: 'בהזמנה מוקדמת האופניים עוד לא הגיעו ארצה. מועד האספקה המשוער מופיע בעמוד המוצר ובעגלה. כשהם מגיעים, אנחנו מרכיבים ובודקים אותם בסדנה ויוצרים איתכם קשר לתיאום המשלוח או האיסוף. המשלוח עד הבית לרוב אזורי הארץ, וכלול במחיר.',
  },
  {
    q: 'האופניים מגיעים מורכבים?',
    a: 'כן, כ-85% מורכבים. מה שנשאר הוא חיבור ההגה, פדלים והתאמת המושב, פחות מ-20 דקות עם הסרטון שמגיע בקופסה.',
  },
  {
    q: 'יש אפשרות לאיסוף עצמי?',
    a: 'כן, ניתן לאסוף מכפר ויתקין ללא עלות משלוח. בוחרים איסוף עצמי בטופס ההזמנה, ואנחנו מתאמים איתכם מועד.',
  },
  {
    q: 'אפשר לשלם בתשלומים?',
    a: 'בהחלט. ניתן לפרוס לעד 12 תשלומים, כ-₪91 לחודש במחיר ההשקה. מקבלים כרטיס אשראי וביט.',
  },
  {
    q: 'לאיזה גובה מתאים כל דגם?',
    a: 'שלדה 54 מתאימה לגובה 160–175 ס״מ. שלדה 57 מתאימה לגובה 175–190 ס״מ. במקרי ספק עדיף לבחור שלדה קטנה יותר.',
  },
  {
    q: 'כל הצבעים זמינים בכל המידות?',
    a: 'כן, כל צבעי הקולקציה מוצעים בשתי מידות השלדה, בכפוף לזמינות במלאי.',
  },
  {
    q: 'מה כוללת האחריות?',
    a: 'האופניים מגיעים עם אחריות של 5 שנים על שלדת האלומיניום. חלפים מתכלים כגון צמיגים, שרשרת ופדלים אינם כלולים באחריות.',
  },
  {
    q: 'איפה אפשר לתקן את האופניים?',
    a: 'האופניים בנויים על רכיבים סטנדרטיים שניתן למצוא בכל חנות אופניים בישראל, כך שלתיקון ולתחזוקה אין צורך בטכנאי מורשה. לפני הרכיבה הראשונה אנחנו ממליצים בחום על בדיקת תקינות אצל מכונאי אופניים.',
  },
  {
    q: 'האופניים מתאימים לגברים ולנשים?',
    a: 'כן. שתי מידות השלדה מתאימות לכולם. הגיאומטריה של האופניים אוניברסלית וניתן להתאים את גובה המושב וההגה.',
  },
];

const en: FaqItem[] = [
  {
    q: 'How long does delivery take?',
    a: 'For a pre-order the bikes have not reached Israel yet. The estimated delivery date is shown on the product page and in the cart. When they arrive we assemble and check them in our workshop, then contact you to arrange delivery or pickup. Home delivery covers most of Israel and is included in the price.',
  },
  {
    q: 'Does the bike arrive assembled?',
    a: 'Yes, about 85% assembled. All that’s left is attaching the handlebars and pedals and setting the saddle height: under 20 minutes with the video that comes in the box.',
  },
  {
    q: 'Can I pick the bike up myself?',
    a: 'Yes. Pickup is available in Kfar Vitkin with no shipping charge. Choose self-pickup in the order form and we’ll arrange a time with you.',
  },
  {
    q: 'Can I pay in installments?',
    a: 'Absolutely. You can split the payment into up to 12 installments, about ₪91 a month at the launch price. We accept credit cards and Bit.',
  },
  {
    q: 'Which frame size suits my height?',
    a: 'The 54 frame fits riders 160–175 cm. The 57 frame fits riders 175–190 cm. If you’re between sizes, go with the smaller frame.',
  },
  {
    q: 'Are all colors available in both sizes?',
    a: 'Yes, every color in the collection is available in both frame sizes, subject to availability in stock.',
  },
  {
    q: 'What does the warranty cover?',
    a: 'Every bike comes with a 5-year warranty on the aluminum frame. Wear items such as tires, chain and pedals aren’t covered.',
  },
  {
    q: 'Where can I get the bike serviced?',
    a: 'The bike is built entirely from standard components that any bike shop in Israel carries, so repairs and servicing need no authorized technician. Before your first ride we strongly recommend a check by a bike mechanic.',
  },
  {
    q: 'Is the bike suitable for both men and women?',
    a: 'Yes. Both frame sizes work for everyone. The geometry is universal, and the saddle and handlebar height are fully adjustable.',
  },
];

export const getFaqs = (lang: Lang): FaqItem[] => (lang === 'en' ? en : he);

/** נשמר עבור מנוע החיפוש, שבונה מאגר בעברית. */
export const faqs = he;
