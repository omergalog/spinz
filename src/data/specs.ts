import type { Lang } from '../i18n/LanguageContext';

export type SpecText = { title: string; sub: string; body: string };

/** הטקסט בלבד — האייקונים נשארים ב-Specs.tsx ומחוברים לפי סדר. */
const he: SpecText[] = [
  {
    title: 'קלילות עירונית',
    sub: 'שלדת אלומיניום',
    body: 'שלדת אלומיניום המעניקה תחושת קלילות יוצאת דופן. מאפשרת זינוק זריז בכל רמזור ונוחה לנשיאה אל תוך הדירה או המשרד במאמץ מינימלי.',
  },
  {
    // "עמידים לפנצ'ר" הוסר: אין מסמך יצרן שמאשר הגנה מפני פנצ'ר בדגם הזה.
    title: 'צמיגים רחבים לעיר',
    sub: 'Kenda 32 מ״מ',
    body: 'צמיגים אורבניים ברוחב 32 מ״מ, שנותנים אחיזה ונוחות על אספלט ועל מהמורות.',
  },
  {
    title: 'יחס העברה חכם לעיר',
    sub: 'גלגל שיניים 46T',
    body: 'יחס העברה שנבחר לרכיבה עירונית: מתאים למישורים ולעליות מתונות, בלי הילוכים לתחזק.',
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
    title: 'פדלים רחבים משודרגים',
    sub: 'שטח דריכה רחב',
    body: 'פדלים רחבים מפלסטיק קשיח בעיצוב נקי, עם שטח דריכה גדול יותר לדיווש נוח בכל נעל.',
  },
];

const en: SpecText[] = [
  {
    title: 'Light on its feet',
    sub: 'Aluminum frame',
    body: 'An aluminum frame that feels remarkably light. Quick off the line at every traffic light, and easy to carry up to your apartment or office without breaking a sweat.',
  },
  {
    title: 'Wide city tires',
    sub: 'Kenda 32 mm',
    body: '32 mm urban tires that give grip and comfort on asphalt and over potholes.',
  },
  {
    title: 'Gearing tuned for the city',
    sub: '46T chainring',
    body: 'A ratio chosen for city riding: suited to flats and gentle climbs, with no gears to maintain.',
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
    title: 'Wide upgraded pedals',
    sub: 'Wide platform',
    body: 'Wide, clean-looking pedals in rigid composite, with a larger platform for comfortable pedaling in any shoe.',
  },
];

export const getSpecs = (lang: Lang): SpecText[] => (lang === 'en' ? en : he);
