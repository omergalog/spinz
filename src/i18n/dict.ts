import type { Lang } from './LanguageContext';

/**
 * מילון האתר. העברית כאן חייבת להיות זהה תו-בתו למה שהיה בקוד לפני החילוץ —
 * בדיקת scripts/layout-snapshot.mjs מוודאת שאף מחרוזת לא השתנתה.
 *
 * האנגלית נכתבת מחדש ולא מתורגמת מילולית: אותה כוונה, ניסוח שנשמע טבעי
 * לדובר אנגלית. מספרים, מחירים ושמות מותג לא יושבים כאן — הם נתונים משותפים.
 */
export const dict = {
  he: {
    nav: {
      home: 'בית',
      contact: 'צור קשר',
      cta: "Let's Talk",
      search: 'חיפוש באתר',
      menu: 'תפריט',
      logoAria: 'Spinz – דף הבית',
      skipToContent: 'דלג לתוכן הראשי',
      groups: {
        bikes: 'אופניים',
        info:  'מידע',
        brand: 'המותג',
      },
      links: {
        models:  'הדגמים',
        specs:   'מפרט טכני',
        sizes:   'מידות וצבעים',
        faq:     'שאלות ותשובות',
        guides:  'מדריכים',
        story:   'הסיפור שלנו',
        gallery: 'גלריה',
        community: 'קהילה',
        reviews: 'המלצות',
      },
    },
    lang: {
      switchAria: 'שנה שפה',
      he: 'עב',
      en: 'EN',
    },
  },

  en: {
    nav: {
      home: 'Home',
      contact: 'Contact',
      cta: "Let's Talk",
      search: 'Search the site',
      menu: 'Menu',
      logoAria: 'Spinz – home',
      skipToContent: 'Skip to main content',
      groups: {
        bikes: 'Bikes',
        info:  'Info',
        brand: 'Brand',
      },
      links: {
        models:  'The Models',
        specs:   'Specs',
        sizes:   'Sizes & Colors',
        faq:     'FAQ',
        guides:  'Guides',
        story:   'Our Story',
        gallery: 'Gallery',
        community: 'Community',
        reviews: 'Reviews',
      },
    },
    lang: {
      switchAria: 'Change language',
      he: 'עב',
      en: 'EN',
    },
  },
} as const;

export type Dict = (typeof dict)['he'];

export const getDict = (lang: Lang): Dict => dict[lang] as unknown as Dict;
