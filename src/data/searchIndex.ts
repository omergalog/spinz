import { getGuides } from './guides';
import { getFaqs } from './faq';
import type { Lang } from '../i18n/LanguageContext';
import { getDict } from '../i18n/dict';
import { colorVariants, sizeVariants } from './models';

export type DocType = 'page' | 'guide' | 'faq' | 'product';

export type SearchDoc = {
  id: string;
  type: DocType;
  title: string;
  /** One line shown under the title in the results list */
  summary: string;
  /** Everything else that should be matchable but is not displayed */
  body: string;
  to: string;
  /** Extra spellings, synonyms and English terms users may type */
  keywords?: string[];
};

export const typeLabel = (t: DocType, lang: Lang = 'he') => getDict(lang).search.types[t];

/** People search their own height ("גובה 172"), so every value in range is indexed. */
const heightRange = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => String(from + i));

const HEIGHTS = heightRange(155, 195);

/* ── Static pages ─────────────────────────────────────────── */
const pagesHe: SearchDoc[] = [
  {
    id: 'page-home', type: 'page', title: 'דף הבית', to: '/',
    summary: 'אופני עיר סינגל-ספיד בעיצוב נקי, נבנו בתל אביב.',
    body: 'SPINZ ספינז אופני עיר סינגל ספיד fixie אורבני מחיר השקה פרי סייל',
    keywords: ['בית', 'ראשי', 'home', 'spinz'],
  },
  {
    id: 'page-bikes', type: 'page', title: 'הדגמים', to: '/bikes',
    summary: 'כל הדגמים, הצבעים והמידות – עם המחיר והזמינות.',
    body: 'דגמים אופניים לקנות רכישה הזמנה מלאי מחיר 1090 1299 עגלה',
    keywords: ['לקנות', 'קנייה', 'חנות', 'מחיר', 'bikes', 'shop'],
  },
  {
    id: 'page-specs', type: 'page', title: 'מפרט טכני', to: '/specs',
    summary: 'שלדה, גלגלים, בלמים, משקל וכל הנתונים המלאים.',
    body: 'מפרט טכני שלדה אלומיניום מזלג גלגלים 700c צמיגים בלמים משקל העברת כוח שרשרת יחס הילוך מיסבים',
    keywords: ['מפרט', 'טכני', 'משקל', 'specs', 'אלומיניום'],
  },
  {
    id: 'page-sizes', type: 'page', title: 'מידות וצבעים', to: '/sizes',
    summary: 'שתי מידות שלדה, שלושה צבעים – ואיך בוחרים ביניהם.',
    body: `מידות צבעים 54 57 גובה רוכב ${colorVariants.map(c => c.label).join(' ')} ${sizeVariants.map(s => `${s.label} ${s.range}`).join(' ')}`,
    keywords: ['מידה', 'צבע', 'שחור מט', 'בז', 'ירוק זית', 'size', 'color', 'גובה', ...HEIGHTS],
  },
  {
    id: 'page-faq', type: 'page', title: 'שאלות ותשובות', to: '/faq',
    summary: 'משלוח, הרכבה, תשלומים, אחריות והחזרות.',
    body: 'שאלות תשובות עזרה תמיכה משלוח החזרה אחריות תשלומים',
    keywords: ['שאלות', 'עזרה', 'faq', 'תמיכה'],
  },
  {
    id: 'page-guides', type: 'page', title: 'מדריכים', to: '/guides',
    summary: 'מדריכי הרכבה, מידות, תחזוקה, בטיחות ומסלולים.',
    body: 'מדריכים הדרכה טיפים הסבר',
    keywords: ['מדריך', 'guides', 'הדרכה'],
  },
  {
    id: 'page-gallery', type: 'page', title: 'גלריה', to: '/gallery',
    summary: 'תמונות מקצועיות של האופניים ושל הרכיבה בעיר.',
    body: 'גלריה תמונות צילומים פוטו',
    keywords: ['תמונות', 'gallery', 'צילומים'],
  },
  {
    id: 'page-community', type: 'page', title: 'קהילה', to: '/community',
    summary: 'הרוכבים, האינסטגרם ואיך מצטרפים.',
    body: 'קהילה רוכבים אינסטגרם רשתות חברתיות הצטרפות',
    keywords: ['קהילה', 'אינסטגרם', 'instagram', 'community'],
  },
  {
    id: 'page-reviews', type: 'page', title: 'המלצות', to: '/reviews',
    summary: 'מה אומרים הרוכבים על SPINZ.',
    body: 'המלצות ביקורות חוות דעת דירוג כוכבים לקוחות',
    keywords: ['ביקורות', 'חוות דעת', 'reviews', 'דירוג'],
  },
  {
    id: 'page-story', type: 'page', title: 'הסיפור שלנו', to: '/story',
    summary: 'איך ולמה נולד המותג, ומה עומד מאחוריו.',
    body: 'הסיפור שלנו אודות המותג מייסדים תל אביב ערכים',
    keywords: ['אודות', 'מי אנחנו', 'about', 'המותג'],
  },
  {
    id: 'page-contact', type: 'page', title: 'צור קשר', to: '/contact',
    summary: 'טלפון, וואטסאפ, מייל וטופס פנייה.',
    body: 'צור קשר טלפון וואטסאפ מייל כתובת שירות לקוחות פנייה',
    keywords: ['יצירת קשר', 'טלפון', 'וואטסאפ', 'whatsapp', 'מייל', 'contact'],
  },
  {
    id: 'page-regulations', type: 'page', title: 'תקנון ותנאי שימוש', to: '/regulations',
    summary: 'ההסכם המשפטי המלא: אחריות, ביטול עסקה וסמכות שיפוט.',
    body: 'תקנון תנאי שימוש אחריות מוגבלת ביטול עסקה החזר כספי סמכות שיפוט הרכבה חבות גימור צבע',
    keywords: ['תקנון', 'אחריות', 'ביטול', 'החזר', 'terms'],
  },
  {
    id: 'page-presale-terms', type: 'page', title: 'תנאי מכירה מוקדמת', to: '/presale-terms',
    summary: 'תנאי הפרי-סייל: מחיר השקה, מועדי אספקה וביטול.',
    body: 'פרי סייל מכירה מוקדמת מחיר השקה 100 הראשונים אספקה הזמנה מוקדמת',
    keywords: ['פרי סייל', 'presale', 'מחיר השקה', 'מכירה מוקדמת'],
  },
  {
    id: 'page-cancel', type: 'page', title: 'ביטול עסקה', to: '/cancel-order',
    summary: 'טופס ביטול הזמנה והחזר כספי מלא, ללא דמי ביטול.',
    body: 'ביטול עסקה ביטול הזמנה החזר כספי החזרת מוצר דמי ביטול טופס',
    keywords: ['ביטול', 'החזר', 'להחזיר', 'cancel', 'refund'],
  },
  {
    id: 'page-terms', type: 'page', title: 'מדיניות פרטיות ותנאי שימוש', to: '/terms',
    summary: 'איזה מידע נאסף, איך הוא נשמר ומה הזכויות שלך.',
    body: 'מדיניות פרטיות תנאי שימוש מידע אישי עוגיות cookies אבטחה זכויות',
    keywords: ['פרטיות', 'עוגיות', 'privacy', 'cookies'],
  },
  {
    id: 'page-accessibility', type: 'page', title: 'הצהרת נגישות', to: '/accessibility',
    summary: 'רמת הנגישות של האתר ואיך לדווח על תקלה.',
    body: 'הצהרת נגישות נגיש תקן WCAG רכיב נגישות ניגודיות קורא מסך',
    keywords: ['נגישות', 'accessibility', 'wcag'],
  },
];


/* ── Static pages, English ────────────────────────────────── */
const pagesEn: SearchDoc[] = [
  { id: 'page-home', type: 'page', title: 'Home', to: '/', summary: 'Clean-lined single-speed city bikes, built in Tel Aviv.', body: 'SPINZ urban single speed fixie city bike launch price pre-sale', keywords: ['home', 'spinz', 'bike'] },
  { id: 'page-bikes', type: 'page', title: 'The Models', to: '/bikes', summary: 'Every model, colour and size — with price and availability.', body: 'models buy purchase order stock price 1090 1299 cart', keywords: ['buy', 'shop', 'price', 'order'] },
  { id: 'page-specs', type: 'page', title: 'Specs', to: '/specs', summary: 'Frame, wheels, brakes, weight and the full technical data.', body: 'specs technical frame aluminum fork wheels 700c tires brakes weight drivetrain chain gear ratio bearings', keywords: ['specs', 'technical', 'weight', 'aluminum'] },
  { id: 'page-sizes', type: 'page', title: 'Sizes & Colors', to: '/sizes', summary: 'Two frame sizes, three colours — and how to choose.', body: 'sizes colors 54 57 rider height matte black beige olive green', keywords: ['size', 'colour', 'color', 'fit', 'height', ...HEIGHTS] },
  { id: 'page-faq', type: 'page', title: 'FAQ', to: '/faq', summary: 'Shipping, assembly, payments, warranty and returns.', body: 'questions answers help support shipping returns warranty payments', keywords: ['faq', 'help', 'support', 'questions'] },
  { id: 'page-guides', type: 'page', title: 'Guides', to: '/guides', summary: 'Assembly, sizing, maintenance, safety and routes.', body: 'guides how to tips explained tutorial', keywords: ['guide', 'how to', 'tutorial'] },
  { id: 'page-gallery', type: 'page', title: 'Gallery', to: '/gallery', summary: 'Professional photos of the bikes and of riding in the city.', body: 'gallery photos pictures images', keywords: ['photos', 'pictures', 'gallery'] },
  { id: 'page-community', type: 'page', title: 'Community', to: '/community', summary: 'The riders, our Instagram, and how to join.', body: 'community riders instagram social join group rides', keywords: ['community', 'instagram', 'rides'] },
  { id: 'page-reviews', type: 'page', title: 'Reviews', to: '/reviews', summary: 'What riders say about SPINZ.', body: 'reviews testimonials ratings stars customers feedback', keywords: ['reviews', 'testimonials', 'ratings'] },
  { id: 'page-story', type: 'page', title: 'Our Story', to: '/story', summary: 'How and why the brand started, and what stands behind it.', body: 'story about brand founders tel aviv values', keywords: ['about', 'story', 'brand', 'who we are'] },
  { id: 'page-contact', type: 'page', title: 'Contact', to: '/contact', summary: 'Phone, WhatsApp, email and a contact form.', body: 'contact phone whatsapp email address customer service enquiry', keywords: ['contact', 'phone', 'whatsapp', 'email'] },
  { id: 'page-regulations', type: 'page', title: 'Terms & Conditions', to: '/regulations', summary: 'The full legal agreement: warranty, cancellation and jurisdiction.', body: 'terms conditions limited warranty cancellation refund jurisdiction assembly liability finish colour', keywords: ['terms', 'warranty', 'cancel', 'refund', 'legal'] },
  { id: 'page-presale-terms', type: 'page', title: 'Pre-Sale Terms', to: '/presale-terms', summary: 'Pre-sale terms: launch price, delivery dates and cancellation.', body: 'pre-sale presale launch price first 100 delivery pre-order', keywords: ['presale', 'pre-order', 'launch price'] },
  { id: 'page-cancel', type: 'page', title: 'Cancel an Order', to: '/cancel-order', summary: 'Cancellation form and a full refund, with no cancellation fee.', body: 'cancel order cancellation refund return product fee form', keywords: ['cancel', 'refund', 'return'] },
  { id: 'page-terms', type: 'page', title: 'Privacy Policy & Terms of Use', to: '/terms', summary: 'What data we collect, how it is stored and what your rights are.', body: 'privacy policy terms of use personal data cookies security rights', keywords: ['privacy', 'cookies', 'data'] },
  { id: 'page-accessibility', type: 'page', title: 'Accessibility Statement', to: '/accessibility', summary: 'The accessibility level of the site and how to report an issue.', body: 'accessibility statement accessible WCAG standard contrast screen reader', keywords: ['accessibility', 'wcag'] },
];

/* ── Products (colour × size are the real buyable variants) ── */
const buildProducts = (lang: Lang): SearchDoc[] => colorVariants.flatMap(c =>
  sizeVariants.map<SearchDoc>(s => ({
    id: `product-${c.id}-${s.id}`,
    type: 'product',
    title: `SPINZ ${s.label} – ${getDict(lang).product.colors[c.id as 'mat' | 'beige' | 'olive']}`,
    summary: `${getDict(lang).product.heights[s.id as '54' | '57']} · ₪1,090`,
    body: lang === 'en'
      ? `single speed bike ${getDict(lang).product.colors[c.id as 'mat' | 'beige' | 'olive']} size ${s.label} ${c.skuCode} buy order cart`
      : `אופניים סינגל ספיד ${c.label} מידה ${s.label} ${s.range} ${c.skuCode} להזמין לקנות עגלה`,
    to: '/bikes',
    keywords: [
      c.label, s.label, ...(lang === 'en' ? ['buy', 'order', 'height'] : ['לקנות', 'להזמין', 'גובה']),
      ...(s.id === '54' ? heightRange(155, 175) : heightRange(175, 195)),
    ],
  })),
);

/* ── Guides (full text: intro, section headings and body) ──── */
const buildGuides = (lang: Lang): SearchDoc[] => getGuides(lang).map(g => ({
  id: `guide-${g.slug}`,
  type: 'guide',
  title: g.title,
  summary: g.summary,
  body: [
    g.metaDescription,
    g.intro,
    ...g.sections.flatMap(sec => [
      sec.heading,
      ...sec.blocks.flatMap(b =>
        b.type === 'paragraph' || b.type === 'tip' ? [b.text]
        : b.type === 'steps' || b.type === 'list' ? b.items
        : [],
      ),
    ]),
    ...(g.faq ?? []).flatMap(f => [f.q, f.a]),
  ].join(' '),
  to: `/guides/${g.slug}`,
  keywords: [g.readTime],
}));

/* ── FAQ entries ──────────────────────────────────────────── */
const buildFaqs = (lang: Lang): SearchDoc[] => getFaqs(lang).map((f, i) => ({
  id: `faq-${i}`,
  type: 'faq',
  title: f.q,
  summary: f.a,
  body: f.a,
  to: '/faq',
}));

const cache = new Map<Lang, SearchDoc[]>();

/** האינדקס בשפה הנבחרת — נבנה פעם אחת לכל שפה. */
export function getSearchIndex(lang: Lang): SearchDoc[] {
  let idx = cache.get(lang);
  if (!idx) {
    idx = [
      ...(lang === 'en' ? pagesEn : pagesHe),
      ...buildProducts(lang),
      ...buildGuides(lang),
      ...buildFaqs(lang),
    ];
    cache.set(lang, idx);
  }
  return idx;
}
