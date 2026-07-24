import { guides } from './guides';
import { faqs } from './faq';
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

const TYPE_LABEL: Record<DocType, string> = {
  page: 'עמוד',
  guide: 'מדריך',
  faq: 'שאלה נפוצה',
  product: 'מוצר',
};

export const typeLabel = (t: DocType) => TYPE_LABEL[t];

/** People search their own height ("גובה 172"), so every value in range is indexed. */
const heightRange = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => String(from + i));

const HEIGHTS = heightRange(155, 195);

/* ── Static pages ─────────────────────────────────────────── */
const pages: SearchDoc[] = [
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

/* ── Products (colour × size are the real buyable variants) ── */
const products: SearchDoc[] = colorVariants.flatMap(c =>
  sizeVariants.map<SearchDoc>(s => ({
    id: `product-${c.id}-${s.id}`,
    type: 'product',
    title: `SPINZ ${s.label} – ${c.label}`,
    summary: `${s.range} · מחיר השקה ₪1,090`,
    body: `אופניים סינגל ספיד ${c.label} מידה ${s.label} ${s.range} ${c.skuCode} להזמין לקנות עגלה`,
    to: '/bikes',
    keywords: [
      c.label, s.label, 'לקנות', 'להזמין', 'גובה',
      ...(s.id === '54' ? heightRange(155, 175) : heightRange(175, 195)),
    ],
  })),
);

/* ── Guides (full text: intro, section headings and body) ──── */
const guideDocs: SearchDoc[] = guides.map(g => ({
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
const faqDocs: SearchDoc[] = faqs.map((f, i) => ({
  id: `faq-${i}`,
  type: 'faq',
  title: f.q,
  summary: f.a,
  body: f.a,
  to: '/faq',
}));

export const searchIndex: SearchDoc[] = [...pages, ...products, ...guideDocs, ...faqDocs];
