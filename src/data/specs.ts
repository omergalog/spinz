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
    title: 'צמיגים עמידים לפנצ\'ר',
    sub: 'Kenda 32 מ"מ',
    body: 'אחיזה בטוחה וראש שקט. צמיגים אורבניים רחבים שבולעים את מהמורות העיר, פסי הרכבת הקלה והאספלט, בלי לעכב אותך.',
  },
  {
    title: 'יחס העברה חכם לעיר',
    sub: 'גלגל שיניים 46T',
    body: 'האיזון המושלם בין מהירות לשיוט קל. מנגנון הסינגל-ספיד מכויל בדיוק לעליות המתונות ולמישורים של הרחובות, כדי שתגיע מהר ובמאמץ מינימלי.',
  },
  {
    title: 'הנדסת חומרים חכמה',
    sub: 'אלומיניום + פלדה',
    body: 'שילוב מדויק של שלדת אלומיניום קלה עם מזלג פלדה קדמי, שסופג את הרעידות מהכביש ומעניק חוויית רכיבה חלקה ונוחה יותר.',
  },
  {
    title: 'חישוקים מחוזקים',
    sub: 'פרופיל גבוה 30 מ"מ',
    body: 'גלגלים בעלי פרופיל גבוה – לא רק למראה אורבני מוקפד, אלא גם להבטחת עמידות גבוהה מול בורות, שפות מדרכה ובלאי עירוני.',
  },
  {
    title: 'התאמה בשנייה',
    sub: 'Quick Release',
    body: 'מנגנון שחרור מהיר למושב המאפשר כוונון גובה מיידי ללא צורך בכלים – מושלם לאופניים משפחתיים או לכמה רוכבים.',
  },
  {
    title: 'בטיחות ללא פשרות',
    sub: 'תקני בטיחות בינלאומיים',
    body: 'האופניים תוכננו ונבנו בהתאם לתקני בטיחות בינלאומיים מחמירים. כי על בטיחות לא מתפשרים.',
  },
  {
    title: 'פדלים רחבים משודרגים',
    sub: 'יציבות מלאה',
    body: 'פדלים רחבים מפלסטיק קשיח בעיצוב נקי, המעניקים שטח פנים גדול יותר לאחיזה בטוחה, מניעת החלקות ודיווש נוח בכל נעל.',
  },
];

const en: SpecText[] = [
  {
    title: 'Light on its feet',
    sub: 'Aluminum frame',
    body: 'An aluminum frame that feels remarkably light. Quick off the line at every traffic light, and easy to carry up to your apartment or office without breaking a sweat.',
  },
  {
    title: 'Puncture-resistant tires',
    sub: 'Kenda 32 mm',
    body: 'Sure grip and peace of mind. Wide urban tires that soak up potholes, tram tracks and rough asphalt without slowing you down.',
  },
  {
    title: 'Gearing tuned for the city',
    sub: '46T chainring',
    body: 'The sweet spot between speed and easy cruising. The single-speed drivetrain is geared for the gentle climbs and flats of city streets, so you get there fast without working for it.',
  },
  {
    title: 'Smart material pairing',
    sub: 'Aluminum + steel',
    body: 'A light aluminum frame paired with a steel front fork that absorbs road buzz — a noticeably smoother, more comfortable ride.',
  },
  {
    title: 'Reinforced rims',
    sub: '30 mm deep profile',
    body: 'Deep-profile wheels aren’t just for the sharp urban look — they stand up to potholes, curbs and everyday city wear.',
  },
  {
    title: 'Adjust it in seconds',
    sub: 'Quick release',
    body: 'A quick-release seat clamp lets you change saddle height instantly, no tools needed — ideal for a family bike or several riders.',
  },
  {
    title: 'Safety, no compromises',
    sub: 'International safety standards',
    body: 'The bike is designed and built to strict international safety standards. Safety isn’t something to cut corners on.',
  },
  {
    title: 'Wide upgraded pedals',
    sub: 'Rock-solid footing',
    body: 'Wide, clean-looking pedals in rigid composite give you more surface area for a secure grip — no slipping, comfortable pedaling in any shoe.',
  },
];

export const getSpecs = (lang: Lang): SpecText[] => (lang === 'en' ? en : he);
