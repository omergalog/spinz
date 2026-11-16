import type { Lang } from '../i18n/LanguageContext';

export type SpecText = { title: string; sub: string; body: string };

/** הטקסט בלבד — האייקונים נשארים ב-Specs.tsx ומחוברים לפי סדר. */
const he: SpecText[] = [
  {
    title: 'קלילות עירונית',
    sub: 'שלדת אלומיניום · משקל 10 ק״ג',
    body: 'שלדת אלומיניום המעניקה תחושת קלילות יוצאת דופן. מאפשרת זינוק זריז בכל רמזור ונוחה לנשיאה אל תוך הדירה או המשרד במאמץ מינימלי.',
  },
  {
    // "אנטי פנצ'ר": בהזמנת הרכש מהיצרן — "Kenda Anti-Puncture Tire 700C × 32C" (16.11.2026).
    // הדגם המדויק לא ידוע, ולכן "מפחיתה את הסיכוי" ולא "חסין/עמיד".
    title: 'צמיגים רחבים לעיר',
    sub: 'Kenda 32 מ״מ · אנטי פנצ׳ר',
    body: 'צמיגי Kenda נגד פנצ׳רים ברוחב 32 מ״מ. שכבת ההגנה מפחיתה את הסיכוי לפנצ׳ר מזכוכיות ומקוצים בעיר, והרוחב נותן אחיזה ונוחות על אספלט ועל מהמורות.',
  },
  {
    // 46T קדמי ו-Freewheel 16T אחורי — לפי הזמנת הרכש מהיצרן (16.11.2026).
    title: 'סינגל ספיד חכם לעיר',
    sub: '46T קדמי · 16T אחורי',
    body: 'יחס העברה אחד שנבחר לרכיבה עירונית: מתאים למישורים ולעליות מתונות, בלי הילוכים לתחזק ובלי כבלי הילוכים לכוון. גלגל חופשי מאחור מאפשר להפסיק לדווש בירידות.',
  },
  {
    title: 'הנדסת חומרים חכמה',
    sub: 'אלומיניום + פלדה',
    body: 'שלדת אלומיניום קלה עם מזלג פלדה קדמי. הפלדה עוזרת לרכך רעידות מהכביש.',
  },
  {
    title: 'חישוקים בפרופיל גבוה',
    sub: 'עומק 30 מ״מ, דופן כפולה',
    body: 'חישוקים בעומק 30 מ״מ עם דופן כפולה, למראה אורבני מוקפד ולרכיבה עירונית יומיומית.',
  },
  {
    title: 'התאמה בשנייה',
    sub: 'Quick Release',
    body: 'מנגנון שחרור מהיר למושב המאפשר כוונון גובה מיידי ללא צורך בכלים. נוח כשכמה רוכבים חולקים את אותם אופניים.',
  },
  {
    // היה כאן "נבנו בהתאם לתקני בטיחות בינלאומיים". אין עדיין דוח בדיקה
    // או תעודה לאופניים, ועד שיש מסמך האתר לא טוען לעמידה בתקן.
    title: 'בלם לכל גלגל',
    sub: 'בלם קדמי ובלם אחורי',
    body: 'שני בלמי יד נפרדים, אחד לכל גלגל, לבלימה מדורגת בתנועה העירונית.',
  },
  {
    // לפי הזמנת הרכש: Plastic Pedal M904; Accessories: Front & Rear Reflectors, Wheel Reflectors, Bell (16.11.2026).
    title: 'מאובזרות מהקופסה',
    sub: 'פדלים, פעמון ומחזירי אור',
    body: 'פדלים רחבים מפלסטיק קשיח לדיווש נוח בכל נעל, פעמון, ומחזירי אור מלפנים, מאחור ובגלגלים. הכל כלול בקופסה, בלי לקנות תוספות.',
  },
];

const en: SpecText[] = [
  {
    title: 'Light on its feet',
    sub: 'Aluminum frame · 10 kg',
    body: 'An aluminum frame that feels remarkably light. Quick off the line at every traffic light, and easy to carry up to your apartment or office without breaking a sweat.',
  },
  {
    title: 'Wide city tires',
    sub: 'Kenda 32 mm · anti-puncture',
    body: 'Kenda anti-puncture tires, 32 mm wide. The protective layer lowers the chance of flats from glass and thorns, and the width gives grip and comfort on asphalt and bumps.',
  },
  {
    title: 'A smart city single speed',
    sub: '46T front · 16T rear',
    body: 'One gear ratio chosen for city riding: right for flats and gentle climbs, with no gears to maintain and no shift cables to adjust. A freewheel at the back lets you coast downhill.',
  },
  {
    title: 'Smart material pairing',
    sub: 'Aluminum + steel',
    body: 'A light aluminum frame with a steel front fork. The steel helps soften road vibration.',
  },
  {
    title: 'Deep-profile rims',
    sub: '30 mm deep, double wall',
    body: '30 mm deep double-wall rims, for a sharp urban look and everyday city riding.',
  },
  {
    title: 'Adjust it in seconds',
    sub: 'Quick release',
    body: 'A quick-release seat clamp lets you change saddle height instantly, no tools needed. Handy when several riders share the same bike.',
  },
  {
    title: 'A brake for each wheel',
    sub: 'Front and rear brakes',
    body: 'Two separate hand brakes, one for each wheel, for progressive braking in city traffic.',
  },
  {
    title: 'Equipped out of the box',
    sub: 'Pedals, bell and reflectors',
    body: 'Wide hard-plastic pedals for comfortable riding in any shoe, a bell, and front, rear and wheel reflectors. It’s all in the box, no extras to buy.',
  },
];

export const getSpecs = (lang: Lang): SpecText[] => (lang === 'en' ? en : he);
