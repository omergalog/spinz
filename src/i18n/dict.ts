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
    footer: {
      newsletterAria: 'ניוזלטר',
      emailLabel: 'אימייל',
      sending: 'שולח…',
      subscribe: 'הרשמה',
      badEmail: 'כתובת מייל לא תקינה',
      subscribed: '✓ נרשמת! נעדכן אותך בכל מה שחדש.',
      stayTitle: 'הישארו בעניינים',
      stayBody: 'עדכונים על דגמים, אירועי קהילה והטבות – בלי ספאם, מבטיחים.',
      tagline: 'אופני עיר בעיצוב נקי. נבנו בתל אביב, בשביל הרחוב.',
      rights: '© 2026 Spinz. כל הזכויות שמורות.',
      whatsappText: 'היי, אני מתעניין באופני Spinz',
      cols: { bikes: 'אופניים', info: 'מידע', brand: 'המותג' },
      links: {
        regulations: 'תקנון ותנאי שימוש',
        presaleTerms: 'תנאי מכירה מוקדמת',
        cancelOrder: 'ביטול עסקה',
        terms: 'מדיניות פרטיות ותנאי שימוש',
        accessibility: 'הצהרת נגישות',
      },
    },
    cookies: {
      title: 'רגע לפני שממשיכים',
      body1: 'אנחנו משתמשים בעוגיות ',
      body2: '(Cookies)',
      body3: ' כדי שהאתר ירוץ חלק, לשפר את חווית הגלישה שלך ולהציג תוכן רלוונטי. המשך הגלישה מהווה הסכמה לשימוש בהן.',
      accept: 'מסכים 🚴‍♂️',
      privacy: 'מדיניות ופרטיות',
    },
    a11y: { skipToContent: 'דלג לתוכן הראשי' },
    faq: { eyebrow: 'שאלות נפוצות', title: 'כל מה שרצית לדעת.' },
    specs: {
      eyebrow: 'מפרט טכני',
      title: 'מפרט ללא פשרות.',
      intro: 'כל פרט באופני SPINZ תוכנן בקפידה כדי להעניק לך חוויית רכיבה חלקה, בטוחה ונטולת מאמץ ברחובות העיר.',
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
    footer: {
      newsletterAria: 'Newsletter',
      emailLabel: 'Email',
      sending: 'Sending…',
      subscribe: 'Sign up',
      badEmail: 'That email address doesn’t look right',
      subscribed: '✓ You’re in! We’ll keep you posted.',
      stayTitle: 'Stay in the loop',
      stayBody: 'News on models, community rides and offers — no spam, promise.',
      tagline: 'Clean-lined city bikes. Built in Tel Aviv, made for the street.',
      rights: '© 2026 Spinz. All rights reserved.',
      whatsappText: 'Hi, I’m interested in a Spinz bike',
      cols: { bikes: 'Bikes', info: 'Info', brand: 'Brand' },
      links: {
        regulations: 'Terms & Conditions',
        presaleTerms: 'Pre-Sale Terms',
        cancelOrder: 'Cancel an Order',
        terms: 'Privacy Policy & Terms of Use',
        accessibility: 'Accessibility Statement',
      },
    },
    cookies: {
      title: 'One quick thing',
      body1: 'We use ',
      body2: 'cookies',
      body3: ' to keep the site running smoothly, improve your experience and show you relevant content. By continuing to browse, you agree to their use.',
      accept: 'Got it 🚴‍♂️',
      privacy: 'Privacy Policy',
    },
    a11y: { skipToContent: 'Skip to main content' },
    faq: { eyebrow: 'FAQ', title: 'Everything you wanted to know.' },
    specs: {
      eyebrow: 'Specs',
      title: 'Built without compromise.',
      intro: 'Every detail on a SPINZ was chosen to give you a smooth, safe and effortless ride through the city.',
    },
  },
} as const;

export type Dict = (typeof dict)['he'];

export const getDict = (lang: Lang): Dict => dict[lang] as unknown as Dict;
